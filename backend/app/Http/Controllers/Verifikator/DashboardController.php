<?php

namespace App\Http\Controllers\Verifikator;

use App\Http\Controllers\Controller;
use App\Models\PengajuanP1;
use App\Models\RoleUnit;
use App\Models\UsulanJabatan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    /**
     * Dapatkan unit_id jika verifikator memiliki lingkup penugasan unit tertentu.
     * Jika null, berarti verifikator universitas (melihat semua unit).
     */
    protected function getVerifikatorUnitId(Request $request): ?int
    {
        $user = $request->user();
        if (!$user) {
            return null;
        }

        $roleUnit = RoleUnit::where('role_id', $user->id)
            ->where('peran', 'verifikator')
            ->where('aktif', true)
            ->first();

        return $roleUnit?->unit_id;
    }

    /**
     * Beranda Verifikator: ringkasan statistik antrean, daftar antrean terbaru, dan jadwal tahapan
     */
    public function index(Request $request): JsonResponse
    {
        $unitId = $this->getVerifikatorUnitId($request);

        // Query Pengajuan P1
        $pengajuanQuery = PengajuanP1::with('unitKerja');
        if ($unitId) {
            $pengajuanQuery->where('unit_id', $unitId);
        }

        // Query Usulan Jabatan
        $usulanQuery = UsulanJabatan::with(['pegawai', 'unitKerja', 'jabatan.grade']);
        if ($unitId) {
            $usulanQuery->where('unit_id', $unitId);
        }

        // Statistik
        $pengajuanMenunggu = (clone $pengajuanQuery)->where('status', 'diajukan')->count();
        $usulanMenunggu = (clone $usulanQuery)->where('status', 'diajukan')->count();

        $pengajuanDikembalikan = (clone $pengajuanQuery)->where('status', 'dikembalikan')->count();
        $usulanDikembalikan = (clone $usulanQuery)->where('status', 'dikembalikan')->count();
        $totalDikembalikan = $pengajuanDikembalikan + $usulanDikembalikan;

        $pengajuanDisetujui = (clone $pengajuanQuery)->whereIn('status', ['diverifikasi', 'disetujui', 'selesai'])->count();
        $usulanDisetujui = (clone $usulanQuery)->whereIn('status', ['diverifikasi', 'disetujui_verifikator', 'ditetapkan'])->count();
        $totalDisetujui = $pengajuanDisetujui + $usulanDisetujui;

        // Antrean Pengajuan P1 (yang masih berstatus diajukan)
        $antreanPengajuan = (clone $pengajuanQuery)
            ->where('status', 'diajukan')
            ->orderBy('diajukan_at', 'asc')
            ->get()
            ->map(function ($p) {
                $tglMasuk = $p->diajukan_at ?? $p->created_at ?? Carbon::now();
                $hari = max(1, (int) Carbon::parse($tglMasuk)->diffInDays(Carbon::now()));
                $nomor = $p->nomor_pengajuan ?: sprintf('P1-2026-09-%03d', $p->id);

                return [
                    'key' => (string) $p->id,
                    'id' => (string) $p->id,
                    'nomor' => $nomor,
                    'jenis' => 'Pengajuan P1',
                    'unit' => $p->unitKerja?->nama ?? 'Unit Kerja',
                    'periode' => $p->periode ?? 'Oktober 2026',
                    'masuk' => Carbon::parse($tglMasuk)->translatedFormat('d F Y'),
                    'hari' => $hari,
                    'to' => "/verifikator/pengajuan/{$p->id}",
                    'tanggal_diajukan' => Carbon::parse($tglMasuk)->toIso8601String(),
                ];
            });

        // Antrean Usulan Jabatan (yang masih berstatus diajukan)
        $antreanUsulan = (clone $usulanQuery)
            ->where('status', 'diajukan')
            ->orderBy('diajukan_at', 'asc')
            ->get()
            ->map(function ($u) {
                $tglMasuk = $u->diajukan_at ?? $u->created_at ?? Carbon::now();
                $hari = max(1, (int) Carbon::parse($tglMasuk)->diffInDays(Carbon::now()));
                $nomor = sprintf('JBG-2026-10-%04d', $u->id);

                return [
                    'key' => (string) $u->id,
                    'id' => (string) $u->id,
                    'nomor' => $nomor,
                    'jenis' => 'Perubahan Jabatan',
                    'unit' => $u->unitKerja?->nama ?? ($u->pegawai?->unitKerja?->nama ?? 'Unit Kerja'),
                    'periode' => 'Oktober 2026',
                    'masuk' => Carbon::parse($tglMasuk)->translatedFormat('d F Y'),
                    'hari' => $hari,
                    'to' => "/verifikator/jabatan/{$u->id}",
                    'pegawai_nama' => $u->pegawai?->nama,
                    'pegawai_nip' => $u->NIP,
                    'tanggal_diajukan' => Carbon::parse($tglMasuk)->toIso8601String(),
                ];
            });

        // Gabungkan antrean dan urutkan berdasarkan lama menunggu (terlama lebih dulu)
        $antreanSemua = $antreanPengajuan->concat($antreanUsulan)
            ->sortByDesc('hari')
            ->values();

        $jadwalTahapan = [
            [
                'tgl' => '1–5',
                'desk' => 'Rekap absensi & impor presensi bulanan',
                'status' => 'Selesai',
                'warna' => 'border-emerald-200 bg-emerald-100 text-emerald-800',
            ],
            [
                'tgl' => '6–8',
                'desk' => 'Pemeriksaan & Verifikasi Pengajuan P1 serta Usulan Jabatan',
                'status' => 'Berjalan',
                'warna' => 'border-amber-200 bg-amber-100 text-amber-800',
            ],
            [
                'tgl' => '9–13',
                'desk' => 'Penetapan SK Pembayaran P1, Netto, dan Pencairan',
                'status' => 'Akan datang',
                'warna' => 'bg-muted text-muted-foreground',
            ],
        ];

        return response()->json([
            'status' => 'success',
            'periode' => 'Oktober 2026',
            'verifikator' => [
                'nama' => $request->user()?->nama ?? 'Verifikator Remunerasi',
                'nip' => $request->user()?->NIP,
                'peran' => 'Verifikator',
            ],
            'statistik' => [
                'pengajuan_menunggu' => $pengajuanMenunggu,
                'usulan_menunggu' => $usulanMenunggu,
                'dikembalikan' => $totalDikembalikan,
                'disetujui' => $totalDisetujui,
            ],
            'antrean' => $antreanSemua,
            'jadwal_tahapan' => $jadwalTahapan,
        ]);
    }
}
