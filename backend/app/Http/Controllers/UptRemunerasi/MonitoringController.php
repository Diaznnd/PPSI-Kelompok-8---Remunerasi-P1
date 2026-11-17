<?php

namespace App\Http\Controllers\UptRemunerasi;

use App\Http\Controllers\Controller;
use App\Models\HasilPerhitungan;
use App\Models\PengajuanP1;
use App\Models\RiwayatStatus;
use App\Models\UnitKerja;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MonitoringController extends Controller
{
    protected function authorizeUpt(Request $request): void
    {
        $user = $request->user();
        if (!$user || !$user->hasRole('upt_remunerasi')) {
            abort(403, 'Akses ditolak: Anda tidak memiliki wewenang sebagai UPT Remunerasi.');
        }
    }

    /**
     * Monitoring realtime status seluruh pengajuan unit
     */
    public function statusPengajuan(Request $request): JsonResponse
    {
        $this->authorizeUpt($request);

        $periode = $request->query('periode', now()->format('Y-m'));

        $pengajuanList = PengajuanP1::with(['unitKerja', 'riwayatStatus'])
            ->where('periode', $periode)
            ->get();

        $unitSemua = UnitKerja::where('aktif', true)->get();

        $monitoring = $unitSemua->map(function ($unit) use ($pengajuanList, $periode) {
            $pengajuan = $pengajuanList->firstWhere('unit_id', $unit->id);

            if (!$pengajuan) {
                return [
                    'unit_id' => $unit->id,
                    'unit' => $unit->nama,
                    'periode' => $periode,
                    'status' => 'belum_mengajukan',
                    'progress' => 0,
                    'tahap' => 'Belum Dimulai',
                    'terakhir_diperbarui' => null,
                ];
            }

            // Hitung progress berdasarkan status
            $progress = match($pengajuan->status) {
                'draft' => 10,
                'diajukan' => 25,
                'diverifikasi', 'terverifikasi' => 50,
                'netto_ditetapkan' => 75,
                'disetujui', 'selesai', 'amprah_tersedia' => 100,
                'ditolak' => 0,
                default => 0,
            };

            $tahap = match($pengajuan->status) {
                'draft' => 'Persiapan',
                'diajukan' => 'Menunggu Verifikasi',
                'diverifikasi', 'terverifikasi' => 'Perhitungan Pajak',
                'netto_ditetapkan' => 'Menunggu Approval',
                'disetujui' => 'Penerbitan Slip',
                'selesai', 'amprah_tersedia' => 'Selesai',
                'ditolak' => 'Ditolak',
                default => 'Unknown',
            };

            $riwayatTerakhir = $pengajuan->riwayatStatus()->latest('id')->first();

            return [
                'unit_id' => $unit->id,
                'unit' => $unit->nama,
                'pengajuan_id' => $pengajuan->id,
                'periode' => $periode,
                'status' => $pengajuan->status,
                'progress' => $progress,
                'tahap' => $tahap,
                'bendahara' => $pengajuan->bendahara_nama ?? 'Belum Ditugaskan',
                'jumlah_pegawai' => HasilPerhitungan::where('pengajuan_id', $pengajuan->id)->count(),
                'total_bruto' => (float) $pengajuan->total_bruto,
                'terakhir_diperbarui' => $riwayatTerakhir?->created_at?->diffForHumans() ?? 'Baru dibuat',
                'catatan' => $riwayatTerakhir?->keterangan,
            ];
        });

        $ringkasan = [
            'total_unit' => $monitoring->count(),
            'belum_mengajukan' => $monitoring->where('status', 'belum_mengajukan')->count(),
            'dalam_proses' => $monitoring->whereNotIn('status', ['belum_mengajukan', 'selesai', 'amprah_tersedia', 'ditolak'])->count(),
            'selesai' => $monitoring->whereIn('status', ['selesai', 'amprah_tersedia'])->count(),
            'ditolak' => $monitoring->where('status', 'ditolak')->count(),
        ];

        return response()->json([
            'periode' => $periode,
            'ringkasan' => $ringkasan,
            'monitoring' => $monitoring->values(),
            'dimuat_pada' => now()->toIso8601String(),
        ]);
    }

    /**
     * Detail timeline pengajuan satu unit
     */
    public function timelinePengajuan(Request $request, string $pengajuanId): JsonResponse
    {
        $this->authorizeUpt($request);

        $pengajuan = PengajuanP1::with(['unitKerja', 'riwayatStatus'])
            ->findOrFail($pengajuanId);

        $timeline = $pengajuan->riwayatStatus()
            ->orderBy('id', 'asc')
            ->get()
            ->map(fn ($r) => [
                'id' => $r->id,
                'status' => $r->status,
                'keterangan' => $r->keterangan,
                'aktor' => $r->aktor_nama,
                'waktu' => $r->created_at?->translatedFormat('d F Y, H:i'),
                'waktu_relatif' => $r->created_at?->diffForHumans(),
            ]);

        return response()->json([
            'pengajuan_id' => $pengajuan->id,
            'unit' => $pengajuan->unitKerja->nama,
            'periode' => $pengajuan->periode,
            'status_saat_ini' => $pengajuan->status,
            'timeline' => $timeline,
        ]);
    }

    /**
     * Monitoring kinerja bendahara per unit
     */
    public function kinerjaBendahara(Request $request): JsonResponse
    {
        $this->authorizeUpt($request);

        $periode = $request->query('periode', now()->format('Y-m'));

        $pengajuanList = PengajuanP1::with(['unitKerja'])
            ->where('periode', $periode)
            ->whereNotNull('bendahara_nama')
            ->get();

        $kinerja = $pengajuanList->groupBy('bendahara_nama')->map(function ($items, $bendahara) {
            $tepatWaktu = $items->filter(fn ($p) => 
                $p->diajukan_at && $p->diajukan_at->day <= 5
            )->count();

            $terlambat = $items->count() - $tepatWaktu;

            $selesai = $items->whereIn('status', ['selesai', 'amprah_tersedia'])->count();

            return [
                'bendahara' => $bendahara,
                'jumlah_unit' => $items->count(),
                'unit_list' => $items->pluck('unitKerja.nama')->unique()->values(),
                'tepat_waktu' => $tepatWaktu,
                'terlambat' => $terlambat,
                'selesai' => $selesai,
                'dalam_proses' => $items->count() - $selesai,
                'tingkat_penyelesaian' => $items->count() > 0 
                    ? round(($selesai / $items->count()) * 100, 1) 
                    : 0,
            ];
        })->values();

        return response()->json([
            'periode' => $periode,
            'total_bendahara' => $kinerja->count(),
            'data' => $kinerja,
        ]);
    }

    /**
     * Alert dan peringatan untuk UPT
     */
    public function alerts(Request $request): JsonResponse
    {
        $this->authorizeUpt($request);

        $periode = $request->query('periode', now()->format('Y-m'));
        
        $alerts = [];

        // Unit yang belum mengajukan
        $pengajuanList = PengajuanP1::where('periode', $periode)->get();
        $unitMengajukan = $pengajuanList->pluck('unit_id');
        $unitBelumMengajukan = UnitKerja::where('aktif', true)
            ->whereNotIn('id', $unitMengajukan)
            ->get();

        if ($unitBelumMengajukan->count() > 0) {
            $alerts[] = [
                'tipe' => 'warning',
                'kategori' => 'pengajuan',
                'judul' => 'Unit Belum Mengajukan',
                'pesan' => $unitBelumMengajukan->count() . ' unit belum mengajukan remunerasi periode ' . $periode,
                'unit_terkait' => $unitBelumMengajukan->pluck('nama')->values(),
                'prioritas' => 'tinggi',
            ];
        }

        // Pengajuan tertahan > 7 hari di satu status
        $pengajuanTertahan = PengajuanP1::with('unitKerja')
            ->where('periode', $periode)
            ->whereNotIn('status', ['selesai', 'amprah_tersedia', 'ditolak'])
            ->get()
            ->filter(function ($p) {
                $riwayatTerakhir = $p->riwayatStatus()->latest('id')->first();
                return $riwayatTerakhir && $riwayatTerakhir->created_at->diffInDays(now()) > 7;
            });

        if ($pengajuanTertahan->count() > 0) {
            $alerts[] = [
                'tipe' => 'danger',
                'kategori' => 'bottleneck',
                'judul' => 'Pengajuan Tertahan',
                'pesan' => $pengajuanTertahan->count() . ' pengajuan tertahan lebih dari 7 hari',
                'unit_terkait' => $pengajuanTertahan->pluck('unitKerja.nama')->values(),
                'prioritas' => 'kritis',
            ];
        }

        // Usulan jabatan menunggu > 14 hari
        $usulanMenunggu = \App\Models\UsulanJabatan::whereIn('status', ['diverifikasi', 'terverifikasi'])
            ->where('created_at', '<', now()->subDays(14))
            ->count();

        if ($usulanMenunggu > 0) {
            $alerts[] = [
                'tipe' => 'warning',
                'kategori' => 'penetapan_jabatan',
                'judul' => 'Usulan Jabatan Menunggu',
                'pesan' => $usulanMenunggu . ' usulan jabatan menunggu penetapan lebih dari 14 hari',
                'prioritas' => 'sedang',
            ];
        }

        // Pengaduan eskalasi belum ditangani
        $pengaduanMenunggu = \App\Models\Pengaduan::where('status', '!=', 'Selesai')
            ->where(function ($q) {
                $q->where('tingkat', 'universitas')
                    ->orWhere('status', 'diteruskan');
            })
            ->count();

        if ($pengaduanMenunggu > 0) {
            $alerts[] = [
                'tipe' => 'info',
                'kategori' => 'pengaduan',
                'judul' => 'Pengaduan Menunggu Tanggapan',
                'pesan' => $pengaduanMenunggu . ' pengaduan eskalasi memerlukan tanggapan UPT',
                'prioritas' => 'sedang',
            ];
        }

        return response()->json([
            'periode' => $periode,
            'total_alerts' => count($alerts),
            'kritis' => collect($alerts)->where('prioritas', 'kritis')->count(),
            'tinggi' => collect($alerts)->where('prioritas', 'tinggi')->count(),
            'sedang' => collect($alerts)->where('prioritas', 'sedang')->count(),
            'alerts' => $alerts,
            'dimuat_pada' => now()->toIso8601String(),
        ]);
    }
}
