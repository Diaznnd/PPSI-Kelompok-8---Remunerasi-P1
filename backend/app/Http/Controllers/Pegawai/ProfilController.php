<?php

namespace App\Http\Controllers\Pegawai;

use App\Http\Controllers\Controller;
use App\Models\HasilPerhitungan;
use App\Models\Pegawai;
use App\Models\Pengaduan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfilController extends Controller
{
    protected function resolveProfilPegawai($akun): array
    {
        $nip = $akun?->NIP ?? '198803122015042001';
        $pegawai = ($akun && $akun->NIP) ? Pegawai::with('unitKerja')->where('NIP', $akun->NIP)->first() : null;

        if (!$pegawai) {
            $pegawai = Pegawai::with('unitKerja')->where('NIP', $nip)->first();
        }

        $usulanTerakhir = $pegawai ? $pegawai->usulanJabatanTerakhir : null;
        $unitNama = $pegawai?->unitKerja?->nama ?? $usulanTerakhir?->unitKerja?->nama ?? 'Fakultas Teknologi Informasi';
        $jabatanNama = $usulanTerakhir?->jabatan?->nama_jabatan ?? ($pegawai?->jenis === 'Tendik' || $pegawai?->jenis === 'Tenaga Kependidikan' ? 'Pranata Komputer' : 'Lektor Kepala');
        $kodeGrade = $usulanTerakhir?->jabatan?->grade?->kode_grade ?? 'Grade 11';
        $gradeNum = (int) preg_replace('/\D/', '', $kodeGrade) ?: 11;

        $namaLengkap = $pegawai?->nama ?? 'Dr. Rina Maharani, M.T.';
        $nipFinal = $pegawai?->NIP ?? $nip;
        $jenisFinal = $pegawai?->jenis === 'Tendik' ? 'Tenaga Kependidikan' : ($pegawai?->jenis ?? 'Dosen');
        $pangkatFinal = $pegawai?->pangkat_golongan ?? 'Penata Tk. I III/d';
        $npwpFinal = $pegawai?->npwp ?? '09.876.543.2-201.000';
        $statusFinal = ($pegawai?->status_tugas_belajar === 'tugas_belajar')
            ? 'Tugas Belajar'
            : ($pegawai?->status_kepegawaian ?? 'PNS');
        $rekeningFinal = $pegawai?->no_rekening ?? 'BNI ••••5678';

        $inisial = collect(explode(' ', $namaLengkap))
            ->map(fn($p) => strtoupper(substr(trim($p), 0, 1)))
            ->take(2)
            ->join('') ?: 'PG';

        return [
            // Lowercase keys
            'nip' => $nipFinal,
            'nama' => $namaLengkap,
            'inisial' => $inisial,
            'jenis' => $jenisFinal,
            'unit' => $unitNama,
            'jabatan' => $jabatanNama,
            'grade' => $gradeNum,
            'pangkat' => $pangkatFinal,
            'npwp' => $npwpFinal,
            'npwpSamar' => '12.345.•••.•-201.000',
            'status' => $statusFinal,
            'status_kepegawaian' => $pegawai?->status_kepegawaian ?? 'PNS',
            'status_tugas_belajar' => $pegawai?->status_tugas_belajar ?? 'aktif',
            'sk_tugas_belajar' => $pegawai?->sk_tugas_belajar,
            'rekening' => $rekeningFinal,
            // PascalCase keys (digunakan oleh BerandaPage.tsx & SlipDetailPage.tsx)
            'NIP' => $nipFinal,
            'Nama' => $namaLengkap,
            'JenisPegawai' => $jenisFinal,
            'NamaUnit' => $unitNama,
            'NamaJabatan' => $jabatanNama,
            'KodeGrade' => $kodeGrade,
            'Pangkat' => $pangkatFinal,
            'NPWP' => $npwpFinal,
            'StatusPegawai' => $statusFinal,
            'NoRekening' => $rekeningFinal,
            'NamaBank' => '',
        ];
    }

    /**
     * Dapatkan profil lengkap pegawai yang sedang terautentikasi
     */
    public function show(Request $request): JsonResponse
    {
        $akun = $request->user();
        $profil = $this->resolveProfilPegawai($akun);

        return response()->json([
            'akun' => [
                'id' => $akun->id,
                'username' => $akun->username,
                'peran' => is_object($akun->peran) ? $akun->peran->value : (string) $akun->peran,
                'NIP' => $akun->NIP,
                'daftar_peran' => $akun->daftar_peran,
            ],
            'pegawai' => $profil,
            'profil' => $profil,
        ]);
    }

    /**
     * Dapatkan ringkasan data beranda untuk role pegawai
     */
    public function beranda(Request $request): JsonResponse
    {
        $akun = $request->user();
        $profil = $this->resolveProfilPegawai($akun);
        $nip = $profil['NIP'];

        $slipTerbaru = HasilPerhitungan::where('NIP', $nip)
            ->orderByDesc('id')
            ->first();

        if (!$slipTerbaru) {
            $slipTerbaru = HasilPerhitungan::orderByDesc('id')->first();
        }

        $pengaduanAktifCount = Pengaduan::where('NIP', $nip)
            ->where('status', '!=', 'Selesai')
            ->count();

        $idSlip = $slipTerbaru?->periode ?: '2026-10';
        $netto = $slipTerbaru ? (float) $slipTerbaru->p1_netto : 2364417.0;

        $slipFormatted = [
            'id' => $idSlip,
            'periode' => 'Oktober 2026',
            'nomor' => 'SLP-P1/2026/10/004281',
            'status' => 'Terbit',
            'netto' => $netto,
            // PascalCase keys untuk BerandaPage.tsx
            'IDSlip' => $idSlip,
            'Periode' => 'Oktober 2026',
            'NomorSlip' => 'SLP-P1/2026/10/004281',
            'StatusSlip' => 'Terbit',
            'JumlahNetto' => $netto,
        ];

        return response()->json([
            'pegawai' => $profil,
            'profil' => $profil,
            'periode_aktif' => 'Oktober 2026',
            'daftar_periode' => ['Oktober 2026', 'September 2026', 'Agustus 2026', 'Juli 2026'],
            'slip_terbaru' => $slipFormatted,
            'pengaduan_aktif' => $pengaduanAktifCount,
        ]);
    }
}
