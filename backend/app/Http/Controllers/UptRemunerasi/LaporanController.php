<?php

namespace App\Http\Controllers\UptRemunerasi;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\HasilPerhitungan;
use App\Models\PengajuanP1;
use App\Models\UnitKerja;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LaporanController extends Controller
{
    protected function authorizeUpt(Request $request): void
    {
        $user = $request->user();
        if (!$user || !$user->hasRole('upt_remunerasi')) {
            abort(403, 'Akses ditolak: Anda tidak memiliki wewenang sebagai UPT Remunerasi.');
        }
    }

    /**
     * Generate laporan rekapitulasi remunerasi universitas
     */
    public function rekapitulasiUniversitas(Request $request): JsonResponse
    {
        $this->authorizeUpt($request);

        $validated = $request->validate([
            'periode' => 'required|string|regex:/^\d{4}-\d{2}$/',
            'format' => 'nullable|string|in:json,excel,pdf',
        ]);

        $periode = $validated['periode'];
        
        // Ambil semua pengajuan periode ini
        $pengajuanList = PengajuanP1::with(['unitKerja'])
            ->where('periode', $periode)
            ->get();

        // Rekapitulasi per unit
        $rekapPerUnit = $pengajuanList->map(function ($pengajuan) {
            $hasilList = HasilPerhitungan::where('pengajuan_id', $pengajuan->id)->get();
            
            return [
                'unit_id' => $pengajuan->unit_id,
                'unit' => $pengajuan->unitKerja->nama,
                'jenis_unit' => $pengajuan->unitKerja->jenis,
                'jumlah_pegawai' => $hasilList->count(),
                'total_remunerasi' => (float) $pengajuan->total_remunerasi,
                'total_pengurangan' => (float) $pengajuan->total_pengurangan,
                'total_bruto' => (float) $pengajuan->total_bruto,
                'total_pajak' => (float) $hasilList->sum('pajak_pph21'),
                'total_netto' => (float) $hasilList->sum('p1_netto'),
                'status' => $pengajuan->status,
                'tanggal_pengajuan' => $pengajuan->diajukan_at?->format('Y-m-d H:i:s'),
            ];
        });

        // Total universitas
        $totalUniversitas = [
            'total_unit' => $pengajuanList->count(),
            'total_pegawai' => HasilPerhitungan::whereIn('pengajuan_id', $pengajuanList->pluck('id'))->count(),
            'total_remunerasi' => $rekapPerUnit->sum('total_remunerasi'),
            'total_pengurangan' => $rekapPerUnit->sum('total_pengurangan'),
            'total_bruto' => $rekapPerUnit->sum('total_bruto'),
            'total_pajak' => $rekapPerUnit->sum('total_pajak'),
            'total_netto' => $rekapPerUnit->sum('total_netto'),
        ];

        // Catat audit
        AuditLog::create([
            'NIP' => $request->user()->NIP,
            'aksi' => 'Generate Laporan Rekapitulasi',
            'objek_type' => 'Laporan',
            'objek_id' => null,
            'nilai_sebelum' => null,
            'nilai_sesudah' => ['periode' => $periode, 'format' => $validated['format'] ?? 'json'],
            'alasan' => 'Laporan rekapitulasi remunerasi universitas',
            'dicatat_at' => now(),
        ]);

        return response()->json([
            'periode' => $periode,
            'total_universitas' => $totalUniversitas,
            'per_unit' => $rekapPerUnit->values(),
            'dibuat_pada' => now()->translatedFormat('d F Y, H:i'),
            'oleh' => $request->user()->pegawai?->nama ?? $request->user()->NIP,
        ]);
    }

    /**
     * Laporan distribusi grade dan jabatan
     */
    public function distribusiGrade(Request $request): JsonResponse
    {
        $this->authorizeUpt($request);

        $distribusi = DB::table('pegawai')
            ->join('jabatan', 'pegawai.jabatan_id', '=', 'jabatan.id')
            ->join('grade', 'jabatan.grade_id', '=', 'grade.id')
            ->join('unit_kerja', 'pegawai.unit_id', '=', 'unit_kerja.id')
            ->select(
                'grade.kode_grade',
                'grade.nilai',
                DB::raw('COUNT(pegawai.NIP) as jumlah_pegawai'),
                DB::raw('GROUP_CONCAT(DISTINCT unit_kerja.nama) as unit_list')
            )
            ->groupBy('grade.id', 'grade.kode_grade', 'grade.nilai')
            ->orderBy('grade.kode_grade')
            ->get()
            ->map(fn ($item) => [
                'grade' => $item->kode_grade,
                'nilai' => (float) $item->nilai,
                'jumlah_pegawai' => (int) $item->jumlah_pegawai,
                'unit_terkait' => explode(',', $item->unit_list ?? ''),
            ]);

        return response()->json([
            'distribusi' => $distribusi,
            'total_pegawai' => $distribusi->sum('jumlah_pegawai'),
        ]);
    }

    /**
     * Laporan tren remunerasi per periode
     */
    public function trenRemunerasi(Request $request): JsonResponse
    {
        $this->authorizeUpt($request);

        $validated = $request->validate([
            'periode_awal' => 'required|string|regex:/^\d{4}-\d{2}$/',
            'periode_akhir' => 'required|string|regex:/^\d{4}-\d{2}$/',
        ]);

        // Ambil data pengajuan dalam rentang periode
        $tren = PengajuanP1::selectRaw('
                periode,
                COUNT(DISTINCT unit_id) as jumlah_unit,
                SUM(total_remunerasi) as total_remunerasi,
                SUM(total_bruto) as total_bruto,
                AVG(total_bruto) as rata_rata_per_unit
            ')
            ->whereBetween('periode', [$validated['periode_awal'], $validated['periode_akhir']])
            ->groupBy('periode')
            ->orderBy('periode')
            ->get()
            ->map(fn ($item) => [
                'periode' => $item->periode,
                'jumlah_unit' => (int) $item->jumlah_unit,
                'total_remunerasi' => (float) $item->total_remunerasi,
                'total_bruto' => (float) $item->total_bruto,
                'rata_rata_per_unit' => (float) $item->rata_rata_per_unit,
            ]);

        return response()->json([
            'periode_awal' => $validated['periode_awal'],
            'periode_akhir' => $validated['periode_akhir'],
            'data_tren' => $tren,
        ]);
    }

    /**
     * Laporan pajak PPh21 per unit
     */
    public function laporanPajak(Request $request): JsonResponse
    {
        $this->authorizeUpt($request);

        $validated = $request->validate([
            'periode' => 'required|string|regex:/^\d{4}-\d{2}$/',
        ]);

        $periode = $validated['periode'];

        $pengajuanList = PengajuanP1::with('unitKerja')
            ->where('periode', $periode)
            ->get();

        $laporanPajak = $pengajuanList->map(function ($pengajuan) {
            $hasilList = HasilPerhitungan::where('pengajuan_id', $pengajuan->id)->get();
            
            return [
                'unit' => $pengajuan->unitKerja->nama,
                'jumlah_wajib_pajak' => $hasilList->where('pajak_pph21', '>', 0)->count(),
                'total_bruto' => (float) $pengajuan->total_bruto,
                'total_pajak' => (float) $hasilList->sum('pajak_pph21'),
                'total_netto' => (float) $hasilList->sum('p1_netto'),
                'persentase_pajak' => $pengajuan->total_bruto > 0 
                    ? round(($hasilList->sum('pajak_pph21') / $pengajuan->total_bruto) * 100, 2)
                    : 0,
            ];
        });

        $totalPajak = [
            'total_unit' => $laporanPajak->count(),
            'total_wajib_pajak' => $laporanPajak->sum('jumlah_wajib_pajak'),
            'total_bruto' => $laporanPajak->sum('total_bruto'),
            'total_pajak' => $laporanPajak->sum('total_pajak'),
            'total_netto' => $laporanPajak->sum('total_netto'),
        ];

        return response()->json([
            'periode' => $periode,
            'ringkasan' => $totalPajak,
            'per_unit' => $laporanPajak->values(),
            'dibuat_pada' => now()->translatedFormat('d F Y, H:i'),
        ]);
    }

    /**
     * Laporan keterlambatan pengajuan
     */
    public function laporanKeterlambatan(Request $request): JsonResponse
    {
        $this->authorizeUpt($request);

        $validated = $request->validate([
            'periode' => 'required|string|regex:/^\d{4}-\d{2}$/',
            'batas_tanggal' => 'required|date',
        ]);

        $periode = $validated['periode'];
        $batasTanggal = $validated['batas_tanggal'];

        // Unit yang mengajukan
        $pengajuanList = PengajuanP1::with('unitKerja')
            ->where('periode', $periode)
            ->get();

        // Unit yang belum mengajukan
        $unitMengajukan = $pengajuanList->pluck('unit_id');
        $unitBelumMengajukan = UnitKerja::where('aktif', true)
            ->whereNotIn('id', $unitMengajukan)
            ->get();

        // Klasifikasi tepat waktu vs terlambat
        $tepatWaktu = $pengajuanList->filter(fn ($p) => 
            $p->diajukan_at && $p->diajukan_at->lte($batasTanggal)
        );

        $terlambat = $pengajuanList->filter(fn ($p) => 
            $p->diajukan_at && $p->diajukan_at->gt($batasTanggal)
        );

        return response()->json([
            'periode' => $periode,
            'batas_tanggal' => $batasTanggal,
            'statistik' => [
                'total_unit' => UnitKerja::where('aktif', true)->count(),
                'sudah_mengajukan' => $pengajuanList->count(),
                'belum_mengajukan' => $unitBelumMengajukan->count(),
                'tepat_waktu' => $tepatWaktu->count(),
                'terlambat' => $terlambat->count(),
            ],
            'unit_tepat_waktu' => $tepatWaktu->map(fn ($p) => [
                'unit' => $p->unitKerja->nama,
                'tanggal_pengajuan' => $p->diajukan_at?->format('Y-m-d H:i:s'),
            ])->values(),
            'unit_terlambat' => $terlambat->map(fn ($p) => [
                'unit' => $p->unitKerja->nama,
                'tanggal_pengajuan' => $p->diajukan_at?->format('Y-m-d H:i:s'),
                'hari_terlambat' => $p->diajukan_at?->diffInDays($batasTanggal),
            ])->values(),
            'unit_belum_mengajukan' => $unitBelumMengajukan->map(fn ($u) => [
                'unit' => $u->nama,
                'jenis' => $u->jenis,
            ])->values(),
        ]);
    }
}
