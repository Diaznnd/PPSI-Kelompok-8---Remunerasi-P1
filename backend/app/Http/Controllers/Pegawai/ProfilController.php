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
    /**
     * Dapatkan profil lengkap pegawai yang sedang terautentikasi
     */
    public function show(Request $request): JsonResponse
    {
        $akun = $request->user();
        
        // Ambil data pegawai via NIP
        $pegawai = $akun->pegawai;
        
        // Fallback jika belum terhubung ke NIP
        if (!$pegawai && $akun->NIP) {
            $pegawai = Pegawai::where('NIP', $akun->NIP)->first();
        }

        if (!$pegawai) {
            // Ambil pegawai pertama jika data demo
            $pegawai = Pegawai::first();
        }

        // Ambil usulan jabatan aktif untuk mendapatkan nama unit dan jabatan
        $usulanTerakhir = $pegawai ? $pegawai->usulanJabatanTerakhir : null;
        $unitNama = $usulanTerakhir?->unitKerja?->nama ?? 'Fakultas Teknologi Informasi';
        $jabatanNama = $usulanTerakhir?->jabatan?->nama_jabatan ?? 'Lektor Kepala';
        $gradeNilai = $usulanTerakhir?->jabatan?->grade?->kode_grade ?? 'Grade 11';

        $inisial = collect(explode(' ', $pegawai?->nama ?? 'Pegawai'))
            ->map(fn ($p) => strtoupper(substr(trim($p), 0, 1)))
            ->take(2)
            ->join('');

        return response()->json([
            'akun' => [
                'id' => $akun->id,
                'username' => $akun->username,
                'peran' => is_object($akun->peran) ? $akun->peran->value : (string) $akun->peran,
                'NIP' => $akun->NIP,
                'daftar_peran' => $akun->daftar_peran,
            ],
            'pegawai' => [
                'nip' => $pegawai?->NIP ?? $akun->NIP ?? '198803122015042001',
                'nama' => $pegawai?->nama ?? 'Dr. Rina Maharani, M.T.',
                'inisial' => $inisial ?: 'RM',
                'jenis' => $pegawai?->jenis ?? 'Dosen',
                'unit' => $pegawai?->unitKerja?->nama ?? $unitNama,
                'jabatan' => $jabatanNama,
                'grade' => $gradeNilai,
                'pangkat' => $pegawai?->pangkat_golongan ?? 'Penata Tk. I III/d',
                'npwp' => $pegawai?->npwp ?? '09.876.543.2-201.000',
                'npwpSamar' => '12.345.•••.•-201.000',
                'status' => ($pegawai?->status_tugas_belajar === 'tugas_belajar') ? 'Tugas Belajar' : ($pegawai?->status_kepegawaian ?? 'PNS'),
                'status_kepegawaian' => $pegawai?->status_kepegawaian ?? 'PNS',
                'status_tugas_belajar' => $pegawai?->status_tugas_belajar ?? 'aktif',
                'sk_tugas_belajar' => $pegawai?->sk_tugas_belajar,
                'rekening' => $pegawai?->no_rekening ?? 'BNI ••••5678',
            ],
        ]);
    }

    /**
     * Dapatkan ringkasan data beranda untuk role pegawai
     */
    public function beranda(Request $request): JsonResponse
    {
        $akun = $request->user();
        $nip = $akun->NIP ?? '198803122015042001';
        $pegawai = $akun->pegawai ?? Pegawai::where('NIP', $nip)->first();

        // Slip terbaru
        $slipTerbaru = HasilPerhitungan::where('NIP', $nip)
            ->orderBy('id', 'desc')
            ->first();

        // Jumlah pengaduan aktif
        $pengaduanAktifCount = Pengaduan::where('NIP', $nip)
            ->where('status', '!=', 'Selesai')
            ->count();

        $usulanTerakhir = $pegawai?->usulanJabatanTerakhir;
        $unitNama = $usulanTerakhir?->unitKerja?->nama ?? 'Fakultas Teknologi Informasi';
        $jabatanNama = $usulanTerakhir?->jabatan?->nama_jabatan ?? 'Lektor Kepala';

        return response()->json([
            'pegawai' => [
                'nip' => $pegawai?->NIP ?? $nip,
                'nama' => $pegawai?->nama ?? 'Dr. Rina Maharani, M.T.',
                'jenis' => $pegawai?->jenis ?? 'Dosen',
                'unit' => $unitNama,
                'jabatan' => $jabatanNama,
                'grade' => 11,
                'pangkat' => $pegawai?->pangkat_golongan ?? 'Penata Tk. I III/d',
                'npwp' => $pegawai?->npwp ?? '09.876.543.2-201.000',
                'status' => $pegawai?->status_kepegawaian ?? 'PNS',
                'rekening' => $pegawai?->no_rekening ?? 'BNI ••••5678',
            ],
            'periode_aktif' => 'Oktober 2026',
            'daftar_periode' => ['Oktober 2026', 'September 2026', 'Agustus 2026', 'Juli 2026'],
            'slip_terbaru' => $slipTerbaru ? [
                'id' => $slipTerbaru->periode ?: '2026-10',
                'periode' => 'Oktober 2026',
                'nomor' => 'SLP-P1/2026/10/004281',
                'status' => 'Terbit',
                'netto' => (float) $slipTerbaru->p1_netto,
            ] : [
                'id' => '2026-10',
                'periode' => 'Oktober 2026',
                'nomor' => 'SLP-P1/2026/10/004281',
                'status' => 'Terbit',
                'netto' => 2338860,
            ],
            'pengaduan_aktif' => $pengaduanAktifCount,
        ]);
    }
}
