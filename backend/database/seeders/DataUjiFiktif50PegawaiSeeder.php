<?php

namespace Database\Seeders;

use App\Models\Akun;
use App\Models\Grade;
use App\Models\Jabatan;
use App\Models\Pegawai;
use App\Models\UnitKerja;
use App\Models\UsulanJabatan;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DataUjiFiktif50PegawaiSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Pastikan 2 Unit Kerja Tersedia
        $unitFti = UnitKerja::firstOrCreate(
            ['nama' => 'Fakultas Teknologi Informasi'],
            ['jenis' => 'Fakultas', 'aktif' => true]
        );

        $unitFk = UnitKerja::firstOrCreate(
            ['nama' => 'Fakultas Kedokteran'],
            ['jenis' => 'Fakultas', 'aktif' => true]
        );

        // 2. Setup Grades & Master Jabatan
        $gradeMap = [
            'Grade 7'  => 3500000.00,
            'Grade 8'  => 3950000.00,
            'Grade 9'  => 4500000.00,
            'Grade 10' => 5232000.00,
            'Grade 11' => 6285000.00,
            'Grade 12' => 7450000.00,
            'Grade 13' => 8850000.00,
            'Grade 14' => 10500000.00,
        ];

        $grades = [];
        foreach ($gradeMap as $kode => $nilai) {
            $grades[$kode] = Grade::firstOrCreate(
                ['kode_grade' => $kode],
                ['nilai' => $nilai]
            );
        }

        $jabatanList = [
            ['nama' => 'Pengadministrasi Umum', 'grade' => 'Grade 7', 'jenis' => 'Tenaga Kependidikan'],
            ['nama' => 'Pranata Komputer Ahli Pertama', 'grade' => 'Grade 8', 'jenis' => 'Tenaga Kependidikan'],
            ['nama' => 'Asisten Ahli', 'grade' => 'Grade 9', 'jenis' => 'Dosen'],
            ['nama' => 'Pranata Laboratorium Pendidikan Ahli Muda', 'grade' => 'Grade 10', 'jenis' => 'Tenaga Kependidikan'],
            ['nama' => 'Lektor', 'grade' => 'Grade 10', 'jenis' => 'Dosen'],
            ['nama' => 'Lektor Kepala', 'grade' => 'Grade 11', 'jenis' => 'Dosen'],
            ['nama' => 'Pranata Komputer Ahli Madya', 'grade' => 'Grade 12', 'jenis' => 'Tenaga Kependidikan'],
            ['nama' => 'Guru Besar / Profesor', 'grade' => 'Grade 14', 'jenis' => 'Dosen'],
        ];

        $jabatans = [];
        foreach ($jabatanList as $j) {
            $jabatans[] = [
                'model' => Jabatan::firstOrCreate(
                    ['nama_jabatan' => $j['nama']],
                    ['kode_id' => $grades[$j['grade']]->id]
                ),
                'jenis' => $j['jenis'],
            ];
        }

        // 3. Generate 50 Pegawai Fiktif (25 di FTI, 25 di FK)
        $namaDepan = [
            'Ahmad', 'Budi', 'Citra', 'Dewi', 'Eko', 'Fajar', 'Gita', 'Hadi', 'Indah', 'Joko',
            'Kartika', 'Lukman', 'Maya', 'Nugroho', 'Oki', 'Putri', 'Qori', 'Rahmat', 'Siti', 'Taufik',
            'Utami', 'Vina', 'Wahyu', 'Xaverius', 'Yuliana', 'Zainal', 'Andi', 'Bambang', 'Chairul', 'Dina',
            'Endang', 'Firman', 'Grace', 'Hendra', 'Irma', 'Jamal', 'Kurniawan', 'Lestari', 'Maulana', 'Nurul',
            'Oscar', 'Prasetyo', 'Ratna', 'Surya', 'Tri', 'Untung', 'Vera', 'Wulandari', 'Yusuf', 'Zulkifli'
        ];

        $namaBelakang = [
            'Pratama', 'Saputra', 'Wijaya', 'Kusuma', 'Santoso', 'Setiawan', 'Hidayat', 'Nugraha', 'Wibowo', 'Siregar',
            'Nasution', 'Lubis', 'Harahap', 'Gultom', 'Simanjuntak', 'Pasaribu', 'Tanjung', 'Chaniago', 'Koto', 'Piliang'
        ];

        $pangkatList = ['III/a', 'III/b', 'III/c', 'III/d', 'IV/a', 'IV/b', 'IV/c'];

        for ($i = 0; $i < 50; $i++) {
            $unit = ($i < 25) ? $unitFti : $unitFk;
            $nip = '198' . sprintf('%02d', 5 + ($i % 15)) . sprintf('%02d', 1 + ($i % 12)) . '201001' . sprintf('%04d', 1001 + $i);
            $nama = $namaDepan[$i] . ' ' . $namaBelakang[$i % count($namaBelakang)];
            $jabatanInfo = $jabatans[$i % count($jabatans)];

            // Status khusus pada beberapa pegawai untuk variasi uji
            $statusPegawai = 'PNS';
            $statusTubel = 'tidak';
            if ($i === 6 || $i === 31) {
                $statusPegawai = 'CPNS';
            } elseif ($i === 7 || $i === 32) {
                $statusPegawai = 'PNS';
                $statusTubel = 'tugas_belajar';
            }

            $pegawai = Pegawai::updateOrCreate(
                ['NIP' => $nip],
                [
                    'unit_id' => $unit->id,
                    'nama' => $nama,
                    'jenis' => $jabatanInfo['jenis'],
                    'status_kepegawaian' => $statusPegawai,
                    'status_tugas_belajar' => $statusTubel,
                    'pangkat_golongan' => $pangkatList[$i % count($pangkatList)],
                    'npwp' => '08.' . sprintf('%03d', $i + 100) . '.' . sprintf('%03d', 500 + $i) . '.1-201.000',
                    'status_skp' => 90 + ($i % 11), // Nilai SKP 90 s.d 100
                    'no_rekening' => '01000' . sprintf('%08d', 12345678 + $i),
                    'aktif' => true,
                ]
            );

            // Kaitkan UsulanJabatan definitif (diverifikasi / disetujui)
            UsulanJabatan::firstOrCreate(
                [
                    'NIP' => $pegawai->NIP,
                    'jabatan_id' => $jabatanInfo['model']->id,
                ],
                [
                    'unit_id' => $unit->id,
                    'nomor_urutan' => 1,
                    'tanggal_berlaku' => '2024-01-01',
                    'status' => 'diverifikasi',
                    'jenis_perubahan' => 'Penempatan Awal',
                ]
            );

            // Buat akun pegawai jika belum ada
            Akun::firstOrCreate(
                ['username' => $pegawai->NIP],
                [
                    'NIP' => $pegawai->NIP,
                    'password' => Hash::make('password123'),
                    'peran' => 'pegawai',
                    'aktif' => true,
                ]
            );
        }

        $this->command->info('Berhasil men-seed 50 pegawai fiktif (25 FTI, 25 FK) lengkap dengan jabatan dan akun!');
    }
}
