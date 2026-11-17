<?php

namespace App\Http\Controllers\Bendahara;

use App\Http\Controllers\Controller;
use App\Models\HukumanDisiplin;
use App\Models\Pegawai;
use App\Models\PengajuanP1;
use App\Models\PresensiBulanan;
use App\Models\PresensiReport;
use App\Models\RiwayatStatus;
use App\Models\RoleUnit;
use App\Models\UnitKerja;
use App\Models\UsulanJabatan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Dapatkan unit kerja aktif milik bendahara (Isolasi Unit Kerja Ketat)
     */
    protected function getBendaharaUnit($user): ?UnitKerja
    {
        $roleUnit = RoleUnit::where('role_id', $user->id)
            ->where('peran', 'bendahara')
            ->where('aktif', true)
            ->first();

        if (!$roleUnit || !$roleUnit->unit_id) {
            return null;
        }

        return UnitKerja::find($roleUnit->unit_id);
    }

    /**
     * Menampilkan data ringkasan beranda bendahara untuk unit kerjanya
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $unit = $this->getBendaharaUnit($user);

        if (!$unit) {
            return response()->json([
                'message' => 'Akses ditolak: Anda tidak memiliki penugasan Bendahara pada unit kerja aktif.',
            ], 403);
        }

        $periodeAktif = $request->query('periode', '2026-10');

        // Cari pengajuan P1 unit untuk periode ini
        $pengajuan = PengajuanP1::where('unit_id', $unit->id)
            ->where('periode', $periodeAktif)
            ->latest('id')
            ->first();

        // Tentukan tahapan stepper dan catatan pengembalian
        $statusLabel = $pengajuan ? $pengajuan->status : 'belum_mulai';
        $doneStep = 1; // 1: Data Presensi Siap
        $dikembalikan = false;
        $catatanPengembalian = null;

        if ($pengajuan) {
            if ($pengajuan->status === 'draft') {
                $doneStep = 2;
            } elseif ($pengajuan->status === 'diajukan') {
                $doneStep = 3;
            } elseif ($pengajuan->status === 'diverifikasi') {
                $doneStep = 4;
            } elseif (in_array($pengajuan->status, ['disetujui', 'selesai'])) {
                $doneStep = 5;
            } elseif ($pengajuan->status === 'dikembalikan') {
                $doneStep = 2;
                $dikembalikan = true;
                $riwayatTerakhir = RiwayatStatus::where('pengajuan_id', $pengajuan->id)
                    ->where('ke_status', 'dikembalikan')
                    ->latest('id')
                    ->first();
                $catatanPengembalian = $riwayatTerakhir?->catatan_alasan ?? 'Presensi perlu dikoreksi kembali sesuai catatan Verifikator.';
            }
        }

        // Statistik unit kerja (hanya untuk pegawai pada unit kerja bendahara)
        $pegawaiQuery = Pegawai::where('unit_id', $unit->id);
        $totalPegawaiAktif = (clone $pegawaiQuery)->where('aktif', true)->count();
        $nipList = (clone $pegawaiQuery)->where('aktif', true)->pluck('NIP');

        // Presensi lengkap
        $presensiReport = PresensiReport::where('unit_id', $unit->id)
            ->where('periode', $periodeAktif)
            ->first();

        $presensiLengkapCount = PresensiBulanan::whereIn('NIP', $nipList)
            ->when($presensiReport, fn ($q) => $q->where('presensi_report_id', $presensiReport->id))
            ->count();

        // Usulan jabatan baru / perubahan tahun ini
        $perubahanJabatanCount = UsulanJabatan::where('unit_id', $unit->id)
            ->whereYear('created_at', 2026)
            ->count();

        // Hukuman disiplin aktif
        $hukdisCount = HukumanDisiplin::whereIn('NIP', $nipList)
            ->where(function ($q) {
                $q->whereNull('tanggal_berakhir')
                    ->orWhere('tanggal_berakhir', '>=', now());
            })
            ->count();

        return response()->json([
            'unit' => [
                'id' => $unit->id,
                'nama' => $unit->nama,
                'jenis' => $unit->jenis,
            ],
            'periode' => $periodeAktif,
            'alur_bulan_ini' => [
                'status' => $statusLabel,
                'done_step' => $doneStep,
                'dikembalikan' => $dikembalikan,
                'catatan_pengembalian' => $catatanPengembalian,
                'nomor_pengajuan' => $pengajuan?->nomor_pengajuan,
                'total_remunerasi' => (float) ($pengajuan?->total_remunerasi ?? 0),
                'total_pengurangan' => (float) ($pengajuan?->total_pengurangan ?? 0),
                'total_bruto' => (float) ($pengajuan?->total_bruto ?? 0),
            ],
            'statistik' => [
                'pegawai_aktif' => $totalPegawaiAktif,
                'presensi_lengkap' => $presensiLengkapCount > 0 ? $presensiLengkapCount : $totalPegawaiAktif,
                'perubahan_jabatan' => $perubahanJabatanCount,
                'hukuman_disiplin' => $hukdisCount,
            ],
            'kesiapan' => [
                'presensi_siap' => $presensiReport !== null,
                'waktu_unggah' => $presensiReport?->dimpor_at?->format('d F Y, H.i') ?? 'Belum diunggah',
            ],
            'jadwal' => [
                ['tgl' => '1–5', 'judul' => 'Rekap absensi oleh Kepegawaian', 'status' => 'Selesai'],
                ['tgl' => '6–8', 'judul' => 'Perhitungan & Pengajuan oleh Bendahara', 'status' => 'Berjalan'],
                ['tgl' => '9–13', 'judul' => 'Verifikasi dan Amprah', 'status' => 'Akan datang'],
            ],
        ]);
    }
}
