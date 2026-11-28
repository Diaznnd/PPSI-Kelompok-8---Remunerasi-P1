<?php

namespace Database\Seeders;

use App\Models\Akun;
use App\Models\Grade;
use App\Models\Jabatan;
use App\Models\Pegawai;
use App\Models\RoleUnit;
use App\Models\UnitKerja;
use App\Models\UsulanJabatan;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ResetDanSeedAwalSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Kosongkan seluruh tabel dan reset AUTO_INCREMENT = 1
        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        $tables = [
            'personal_access_tokens',
            'audit_log',
            'riwayat_status',
            'tanggapan_pengaduan',
            'pengaduan',
            'amprah',
            'hasil_perhitungan',
            'pengajuan_p1',
            'presensi_bulanan',
            'presensi_report',
            'hukuman_disiplin',
            'usulan_jabatan',
            'dokumen_pendukung',
            'notifikasi',
            'role_unit',
            'akun',
            'pegawai',
            'jabatan',
            'grade',
            'unit_kerja',
            'parameter_remunerasi',
            'tarif_pajaks',
        ];

        foreach ($tables as $table) {
            if (DB::getSchemaBuilder()->hasTable($table)) {
                DB::table($table)->truncate();
            }
        }

        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        // 2. Seed Parameter Remunerasi & Tarif Pajak Resmi
        $this->call([
            ParameterRemunerasiSeeder::class,
            TarifPajakSeeder::class,
        ]);

        // 3. Buat 2 Unit Kerja Utama (+ 1 Unit Pusat UPT untuk Admin UPT/Verifikator)
        $unitFti = UnitKerja::create([
            'nama' => 'Fakultas Teknologi Informasi',
            'jenis' => 'Fakultas',
            'aktif' => true,
        ]);

        $unitFt = UnitKerja::create([
            'nama' => 'Fakultas Teknik',
            'jenis' => 'Fakultas',
            'aktif' => true,
        ]);

        $unitUpt = UnitKerja::create([
            'nama' => 'UPT Remunerasi',
            'jenis' => 'Unit Pelaksana Teknis',
            'aktif' => true,
        ]);

        // 4. Master Grade & Jabatan
        $gradeMap = [
            'Grade 7'  => 3570000.00,
            'Grade 8'  => 3936000.00,
            'Grade 9'  => 4359000.00,
            'Grade 10' => 5232000.00,
            'Grade 11' => 6285000.00,
            'Grade 12' => 7245000.00,
            'Grade 13' => 9054000.00,
            'Grade 14' => 10869000.00,
            'Grade 15' => 13455000.00,
        ];

        $grades = [];
        foreach ($gradeMap as $kode => $nilai) {
            $grades[$kode] = Grade::create([
                'kode_grade' => $kode,
                'nilai' => $nilai,
            ]);
        }

        $jabatanDefs = [
            ['nama' => 'Pengadministrasi Umum', 'grade' => 'Grade 7', 'jenis' => 'Tendik'],
            ['nama' => 'Pranata Komputer Ahli Pertama', 'grade' => 'Grade 8', 'jenis' => 'Tendik'],
            ['nama' => 'Asisten Ahli', 'grade' => 'Grade 9', 'jenis' => 'Dosen'],
            ['nama' => 'Lektor', 'grade' => 'Grade 10', 'jenis' => 'Dosen'],
            ['nama' => 'Lektor Kepala', 'grade' => 'Grade 11', 'jenis' => 'Dosen'],
            ['nama' => 'Pranata Komputer Ahli Madya', 'grade' => 'Grade 12', 'jenis' => 'Tendik'],
            ['nama' => 'Kepala Bagian Tata Usaha', 'grade' => 'Grade 13', 'jenis' => 'Tendik'],
            ['nama' => 'Guru Besar / Profesor', 'grade' => 'Grade 14', 'jenis' => 'Dosen'],
        ];

        $jabatans = [];
        foreach ($jabatanDefs as $def) {
            $jabatans[] = [
                'model' => Jabatan::create([
                    'nama_jabatan' => $def['nama'],
                    'kode_id' => $grades[$def['grade']]->id,
                ]),
                'jenis' => $def['jenis'],
            ];
        }

        // 5. Seed 50 Pegawai FTI + 50 Pegawai FT dengan Distribusi Role Masing-masing Unit:
        //    - Index 0      : 1 Penanggung Jawab (penanggung_jawab)
        //    - Index 1 - 2  : 2 Bendahara (bendahara)
        //    - Index 3 - 4  : 2 Kepegawaian (kepegawaian)
        //    - Index 5 - 49 : 45 Pegawai biasa (pegawai)
        $passwordHash = Hash::make('password123');
        $pangkatList = ['Penata Muda III/a', 'Penata Muda Tk. I III/b', 'Penata III/c', 'Penata Tk. I III/d', 'Pembina IV/a', 'Pembina Tk. I IV/b'];

        $namaDepanPool = [
            'Ahmad', 'Budi', 'Citra', 'Dewi', 'Eko', 'Fajar', 'Gita', 'Hadi', 'Indah', 'Joko',
            'Kartika', 'Lukman', 'Maya', 'Nugroho', 'Oki', 'Putri', 'Qori', 'Rahmat', 'Siti', 'Taufik',
            'Utami', 'Vina', 'Wahyu', 'Xaverius', 'Yuliana', 'Zainal', 'Andi', 'Bambang', 'Chairul', 'Dina',
            'Endang', 'Firman', 'Grace', 'Hendra', 'Irma', 'Jamal', 'Kurniawan', 'Lestari', 'Maulana', 'Nurul',
            'Oscar', 'Prasetyo', 'Ratna', 'Surya', 'Tri', 'Untung', 'Vera', 'Wulandari', 'Yusuf', 'Zulkifli',
        ];
        $namaBelakangPool = [
            'Pratama', 'Saputra', 'Wijaya', 'Kusuma', 'Santoso', 'Setiawan', 'Hidayat', 'Nugraha', 'Wibowo', 'Siregar',
            'Nasution', 'Lubis', 'Harahap', 'Gultom', 'Simanjuntak', 'Pasaribu', 'Tanjung', 'Chaniago', 'Koto', 'Piliang',
        ];

        $unitConfigs = [
            ['unit' => $unitFti, 'slug' => 'fti', 'prefix' => '1981'],
            ['unit' => $unitFt,  'slug' => 'ft',  'prefix' => '1982'],
        ];

        $fixtureDir = storage_path('fixtures');
        if (!is_dir($fixtureDir)) {
            mkdir($fixtureDir, 0755, true);
        }

        foreach ($unitConfigs as $uIdx => $cfg) {
            /** @var UnitKerja $unit */
            $unit = $cfg['unit'];
            $slug = $cfg['slug'];
            $prefix = $cfg['prefix'];

            $csvLines = [];
            $csvLines[] = 'nip,nama,hari_kerja,hadir,tidak_hadir,cuti_tahunan,cuti_sakit,izin,s1,s2,s3,s4,s5,s6,pw1,pw2,pw3,pw4,pw5,pw6';

            for ($i = 0; $i < 50; $i++) {
                $nip = $prefix . sprintf('%02d', 1 + ($i % 12)) . '201501' . sprintf('%04d', 1001 + $i);
                $nama = $namaDepanPool[$i] . ' ' . $namaBelakangPool[($i + $uIdx * 3) % count($namaBelakangPool)];

                // Tentukan peran berdasarkan slot:
                // 0 => penanggung_jawab, 1..2 => bendahara, 3..4 => kepegawaian, 5..49 => pegawai
                $peran = 'pegawai';
                $username = $nip;
                if ($i === 0) {
                    $peran = 'penanggung_jawab';
                    $username = "pj.{$slug}";
                    $nama = "Prof. Dr. {$nama} (PJ " . strtoupper($slug) . ")";
                } elseif ($i === 1 || $i === 2) {
                    $peran = 'bendahara';
                    $username = "bendahara{$i}.{$slug}";
                } elseif ($i === 3 || $i === 4) {
                    $peran = 'kepegawaian';
                    $kepegNo = $i - 2;
                    $username = "kepegawaian{$kepegNo}.{$slug}";
                }

                $jabInfo = $jabatans[$i % count($jabatans)];
                $statusPegawai = ($i === 10 || $i === 20) ? 'CPNS' : 'PNS';
                $statusTubel = ($i === 15) ? 'tugas_belajar' : 'aktif';

                $pegawai = Pegawai::create([
                    'NIP' => $nip,
                    'unit_id' => $unit->id,
                    'nama' => $nama,
                    'email' => strtolower(str_replace([' ', '.', '(', ')'], ['', '', '', ''], $username)) . '@unand.ac.id',
                    'jenis' => $jabInfo['jenis'],
                    'status_kepegawaian' => $statusPegawai,
                    'status_tugas_belajar' => $statusTubel,
                    'pangkat_golongan' => $pangkatList[$i % count($pangkatList)],
                    'tmt' => '2024-01-01',
                    'npwp' => '08.' . sprintf('%03d', $i + 100 + $uIdx * 50) . '.' . sprintf('%03d', 500 + $i) . '.1-201.000',
                    'status_skp' => 92 + ($i % 9),
                    'no_rekening' => '01000' . sprintf('%08d', 12000000 + $uIdx * 1000 + $i),
                    'aktif' => true,
                ]);

                $akun = Akun::create([
                    'NIP' => $pegawai->NIP,
                    'username' => $username,
                    'password' => $passwordHash,
                    'peran' => $peran,
                    'aktif' => true,
                ]);

                // Ikat role_unit sesuai peran (+ hak pegawai dasar)
                RoleUnit::create([
                    'role_id' => $akun->id,
                    'unit_id' => $unit->id,
                    'peran' => $peran,
                    'aktif' => true,
                ]);
                if ($peran !== 'pegawai') {
                    RoleUnit::create([
                        'role_id' => $akun->id,
                        'unit_id' => $unit->id,
                        'peran' => 'pegawai',
                        'aktif' => true,
                    ]);
                }

                // Jabatan resmi awal (ditetapkan) agar perhitungan P1 langsung memiliki dasar grade
                UsulanJabatan::create([
                    'NIP' => $pegawai->NIP,
                    'unit_id' => $unit->id,
                    'akun_id' => $akun->id,
                    'jabatan_id' => $jabInfo['model']->id,
                    'nomor_urutan' => 1,
                    'tanggal_berlaku' => '2026-01-01',
                    'status' => 'ditetapkan',
                    'jenis_perubahan' => 'Penetapan Awal',
                    'diajukan_at' => now()->subMonths(2),
                ]);

                // Siapkan baris CSV absensi siap upload oleh kepegawaian
                $s1 = ($i % 8 === 1) ? 1 : 0;
                $pw1 = ($i % 9 === 2) ? 1 : 0;
                $cutiSakit = ($i % 12 === 3) ? 1 : 0;
                $hadir = 22 - $cutiSakit;
                $csvLines[] = sprintf(
                    '%s,"%s",22,%d,0,0,%d,0,%d,0,0,0,0,0,%d,0,0,0,0,0',
                    $pegawai->NIP,
                    str_replace('"', '""', $pegawai->nama),
                    $hadir,
                    $cutiSakit,
                    $s1,
                    $pw1
                );
            }

            file_put_contents($fixtureDir . "/presensi_50_pegawai_{$slug}.csv", implode("\n", $csvLines));
        }

        // 6. Akun Verifikator Universitas & UPT Remunerasi Pusat
        $pegVerifikator = Pegawai::create([
            'NIP' => '197801012005011001',
            'unit_id' => $unitUpt->id,
            'nama' => 'Drs. Andi Verifikator, M.M.',
            'email' => 'verifikator@unand.ac.id',
            'jenis' => 'Tendik',
            'status_kepegawaian' => 'PNS',
            'status_tugas_belajar' => 'aktif',
            'pangkat_golongan' => 'Pembina IV/a',
            'tmt' => '2024-01-01',
            'status_skp' => 98,
            'aktif' => true,
        ]);

        $akunVerif = Akun::create([
            'NIP' => $pegVerifikator->NIP,
            'username' => 'verifikator',
            'password' => $passwordHash,
            'peran' => 'verifikator',
            'aktif' => true,
        ]);
        RoleUnit::create(['role_id' => $akunVerif->id, 'unit_id' => null, 'peran' => 'verifikator', 'aktif' => true]);

        $pegUpt = Pegawai::create([
            'NIP' => '197501012000031001',
            'unit_id' => $unitUpt->id,
            'nama' => 'Hendra Admin UPT, M.Kom.',
            'email' => 'upt@unand.ac.id',
            'jenis' => 'Tendik',
            'status_kepegawaian' => 'PNS',
            'status_tugas_belajar' => 'aktif',
            'pangkat_golongan' => 'Pembina Tk. I IV/b',
            'tmt' => '2024-01-01',
            'status_skp' => 99,
            'aktif' => true,
        ]);

        $akunUpt = Akun::create([
            'NIP' => $pegUpt->NIP,
            'username' => 'upt',
            'password' => $passwordHash,
            'peran' => 'upt_remunerasi',
            'aktif' => true,
        ]);
        RoleUnit::create(['role_id' => $akunUpt->id, 'unit_id' => $unitUpt->id, 'peran' => 'upt_remunerasi', 'aktif' => true]);

        $this->command->info('Reset DB + AUTO_INCREMENT selesai! Seeded 50 pegawai FTI & 50 pegawai FT (1 PJ, 2 Bendahara, 2 Kepegawaian, 45 Pegawai per unit) + Verifikator & UPT.');
    }
}
