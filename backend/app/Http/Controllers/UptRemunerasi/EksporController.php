<?php

namespace App\Http\Controllers\UptRemunerasi;

use App\Http\Controllers\Controller;
use App\Models\HasilPerhitungan;
use App\Models\PengajuanP1;
use App\Models\UnitKerja;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;

class EksporController extends Controller
{
    protected function authorizeUpt(Request $request): void
    {
        $user = $request->user();
        if (!$user || !$user->hasRole('upt_remunerasi')) {
            abort(403, 'Akses ditolak: Anda tidak memiliki wewenang sebagai UPT Remunerasi.');
        }
    }

    /**
     * Ekspor rekapitulasi ke format CSV
     */
    public function eksporRekapitulasiCSV(Request $request): mixed
    {
        $this->authorizeUpt($request);

        $validated = $request->validate([
            'periode' => 'required|string|regex:/^\d{4}-\d{2}$/',
        ]);

        $periode = $validated['periode'];

        // Ambil data pengajuan
        $pengajuanList = PengajuanP1::with(['unitKerja'])
            ->where('periode', $periode)
            ->get();

        // Header CSV
        $csv = "Unit Kerja,Jenis Unit,Jumlah Pegawai,Total Remunerasi,Total Pengurangan,Total Bruto,Total Pajak,Total Netto,Status\n";

        // Data rows
        foreach ($pengajuanList as $pengajuan) {
            $hasilList = HasilPerhitungan::where('pengajuan_id', $pengajuan->id)->get();
            
            $csv .= sprintf(
                "%s,%s,%d,%.2f,%.2f,%.2f,%.2f,%.2f,%s\n",
                $pengajuan->unitKerja->nama,
                $pengajuan->unitKerja->jenis,
                $hasilList->count(),
                $pengajuan->total_remunerasi,
                $pengajuan->total_pengurangan,
                $pengajuan->total_bruto,
                $hasilList->sum('pajak_pph21'),
                $hasilList->sum('p1_netto'),
                $pengajuan->status
            );
        }

        $filename = "rekapitulasi_remunerasi_{$periode}.csv";

        return Response::make($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    /**
     * Ekspor detail perhitungan per pegawai ke CSV
     */
    public function eksporDetailPegawaiCSV(Request $request): mixed
    {
        $this->authorizeUpt($request);

        $validated = $request->validate([
            'pengajuan_id' => 'required|integer|exists:pengajuan_p1,id',
        ]);

        $pengajuan = PengajuanP1::with('unitKerja')->findOrFail($validated['pengajuan_id']);
        $hasilList = HasilPerhitungan::with('pegawai')
            ->where('pengajuan_id', $pengajuan->id)
            ->get();

        // Header CSV
        $csv = "NIP,Nama,Unit Kerja,Nilai Jabatan,Nilai Presensi,Total Penghasilan,PPh21,P1 Netto\n";

        // Data rows
        foreach ($hasilList as $hasil) {
            $csv .= sprintf(
                "%s,%s,%s,%.2f,%.2f,%.2f,%.2f,%.2f\n",
                $hasil->NIP,
                $hasil->pegawai?->nama ?? $hasil->NIP,
                $pengajuan->unitKerja->nama,
                $hasil->nilai_jabatan,
                $hasil->nilai_presensi,
                $hasil->total_penghasilan,
                $hasil->pajak_pph21,
                $hasil->p1_netto
            );
        }

        $filename = "detail_pegawai_{$pengajuan->unitKerja->nama}_{$pengajuan->periode}.csv";
        $filename = str_replace(' ', '_', $filename);

        return Response::make($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    /**
     * Generate data untuk ekspor Excel (return JSON, frontend handle dengan library seperti ExcelJS)
     */
    public function dataEksporExcel(Request $request): JsonResponse
    {
        $this->authorizeUpt($request);

        $validated = $request->validate([
            'periode' => 'required|string|regex:/^\d{4}-\d{2}$/',
            'tipe' => 'required|string|in:rekapitulasi,detail_semua,per_unit',
            'unit_id' => 'nullable|integer|exists:unit_kerja,id',
        ]);

        $periode = $validated['periode'];
        $tipe = $validated['tipe'];

        if ($tipe === 'rekapitulasi') {
            return $this->dataRekapitulasi($periode);
        } elseif ($tipe === 'detail_semua') {
            return $this->dataDetailSemua($periode);
        } elseif ($tipe === 'per_unit' && $validated['unit_id']) {
            return $this->dataPerUnit($periode, $validated['unit_id']);
        }

        return response()->json(['error' => 'Tipe ekspor tidak valid'], 400);
    }

    /**
     * Data rekapitulasi per unit
     */
    protected function dataRekapitulasi(string $periode): JsonResponse
    {
        $pengajuanList = PengajuanP1::with(['unitKerja'])
            ->where('periode', $periode)
            ->get();

        $data = $pengajuanList->map(function ($pengajuan) {
            $hasilList = HasilPerhitungan::where('pengajuan_id', $pengajuan->id)->get();
            
            return [
                'unit_kerja' => $pengajuan->unitKerja->nama,
                'jenis_unit' => $pengajuan->unitKerja->jenis,
                'jumlah_pegawai' => $hasilList->count(),
                'total_remunerasi' => (float) $pengajuan->total_remunerasi,
                'total_pengurangan' => (float) $pengajuan->total_pengurangan,
                'total_bruto' => (float) $pengajuan->total_bruto,
                'total_pajak' => (float) $hasilList->sum('pajak_pph21'),
                'total_netto' => (float) $hasilList->sum('p1_netto'),
                'status' => $pengajuan->status,
            ];
        });

        return response()->json([
            'periode' => $periode,
            'tipe' => 'rekapitulasi',
            'data' => $data,
            'metadata' => [
                'total_unit' => $data->count(),
                'total_pegawai' => $data->sum('jumlah_pegawai'),
                'grand_total_bruto' => $data->sum('total_bruto'),
                'grand_total_netto' => $data->sum('total_netto'),
            ],
        ]);
    }

    /**
     * Data detail semua pegawai
     */
    protected function dataDetailSemua(string $periode): JsonResponse
    {
        $pengajuanList = PengajuanP1::where('periode', $periode)->pluck('id');
        
        $hasilList = HasilPerhitungan::with(['pegawai.unitKerja', 'pengajuan'])
            ->whereIn('pengajuan_id', $pengajuanList)
            ->get();

        $data = $hasilList->map(fn ($hasil) => [
            'nip' => $hasil->NIP,
            'nama' => $hasil->pegawai?->nama ?? $hasil->NIP,
            'unit_kerja' => $hasil->pegawai?->unitKerja?->nama ?? '-',
            'nilai_jabatan' => (float) $hasil->nilai_jabatan,
            'nilai_presensi' => (float) $hasil->nilai_presensi,
            'total_penghasilan' => (float) $hasil->total_penghasilan,
            'pajak_pph21' => (float) $hasil->pajak_pph21,
            'p1_netto' => (float) $hasil->p1_netto,
            'periode' => $hasil->periode,
        ]);

        return response()->json([
            'periode' => $periode,
            'tipe' => 'detail_semua',
            'data' => $data,
            'metadata' => [
                'total_pegawai' => $data->count(),
                'total_penghasilan' => $data->sum('total_penghasilan'),
                'total_pajak' => $data->sum('pajak_pph21'),
                'total_netto' => $data->sum('p1_netto'),
            ],
        ]);
    }

    /**
     * Data detail per unit
     */
    protected function dataPerUnit(string $periode, int $unitId): JsonResponse
    {
        $unit = UnitKerja::findOrFail($unitId);
        $pengajuan = PengajuanP1::where('periode', $periode)
            ->where('unit_id', $unitId)
            ->first();

        if (!$pengajuan) {
            return response()->json([
                'error' => 'Unit ini belum mengajukan remunerasi untuk periode tersebut',
            ], 404);
        }

        $hasilList = HasilPerhitungan::with('pegawai')
            ->where('pengajuan_id', $pengajuan->id)
            ->get();

        $data = $hasilList->map(fn ($hasil) => [
            'nip' => $hasil->NIP,
            'nama' => $hasil->pegawai?->nama ?? $hasil->NIP,
            'nilai_jabatan' => (float) $hasil->nilai_jabatan,
            'nilai_presensi' => (float) $hasil->nilai_presensi,
            'total_penghasilan' => (float) $hasil->total_penghasilan,
            'pajak_pph21' => (float) $hasil->pajak_pph21,
            'p1_netto' => (float) $hasil->p1_netto,
        ]);

        return response()->json([
            'periode' => $periode,
            'tipe' => 'per_unit',
            'unit' => [
                'id' => $unit->id,
                'nama' => $unit->nama,
                'jenis' => $unit->jenis,
            ],
            'data' => $data,
            'metadata' => [
                'total_pegawai' => $data->count(),
                'total_penghasilan' => $data->sum('total_penghasilan'),
                'total_pajak' => $data->sum('pajak_pph21'),
                'total_netto' => $data->sum('p1_netto'),
            ],
        ]);
    }

    /**
     * Ekspor daftar usulan jabatan ke CSV
     */
    public function eksporUsulanJabatanCSV(Request $request): mixed
    {
        $this->authorizeUpt($request);

        $validated = $request->validate([
            'status' => 'nullable|string',
        ]);

        $query = \App\Models\UsulanJabatan::with(['pegawai.unitKerja', 'jabatan.grade']);

        if ($request->filled('status') && $validated['status'] !== 'semua') {
            $query->where('status', $validated['status']);
        }

        $usulanList = $query->get();

        // Header CSV
        $csv = "NIP,Nama Pegawai,Unit Kerja,Jenis Perubahan,Jabatan Baru,Grade,Nilai Grade,Tanggal Berlaku,Status\n";

        // Data rows
        foreach ($usulanList as $usulan) {
            $csv .= sprintf(
                "%s,%s,%s,%s,%s,%s,%.2f,%s,%s\n",
                $usulan->NIP,
                $usulan->pegawai?->nama ?? $usulan->NIP,
                $usulan->pegawai?->unitKerja?->nama ?? '-',
                $usulan->jenis_perubahan ?? 'Kenaikan Jabatan',
                $usulan->jabatan?->nama_jabatan ?? '-',
                $usulan->jabatan?->grade?->kode_grade ?? '-',
                $usulan->jabatan?->grade?->nilai ?? 0,
                $usulan->tanggal_berlaku?->format('Y-m-d') ?? '-',
                $usulan->status
            );
        }

        $filename = "usulan_jabatan_" . now()->format('Y-m-d') . ".csv";

        return Response::make($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }
}
