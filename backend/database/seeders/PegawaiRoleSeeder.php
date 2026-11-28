<?php

namespace Database\Seeders;

use App\Models\Akun;
use App\Models\Grade;
use App\Models\HasilPerhitungan;
use App\Models\Jabatan;
use App\Models\Pegawai;
use App\Models\Pengaduan;
use App\Models\PengajuanP1;
use App\Models\PresensiBulanan;
use App\Models\PresensiReport;
use App\Models\RoleUnit;
use App\Models\TanggapanPengaduan;
use App\Models\UnitKerja;
use App\Models\UsulanJabatan;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class PegawaiRoleSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Unit Kerja (FTI, FK, FMIPA, UPT Remunerasi)
        $fti = UnitKerja::firstOrCreate(
            ['nama' => 'Fakultas Teknologi Informasi'],
            ['jenis' => 'Fakultas', 'aktif' => true]
        );
        $fk = UnitKerja::firstOrCreate(
            ['nama' => 'Fakultas Kedokteran'],
            ['jenis' => 'Fakultas', 'aktif' => true]
        );
        $fmipa = UnitKerja::firstOrCreate(
            ['nama' => 'Fakultas Matematika dan Ilmu Pengetahuan Alam'],
            ['jenis' => 'Fakultas', 'aktif' => true]
        );
        $upt = UnitKerja::firstOrCreate(
            ['nama' => 'UPT Remunerasi'],
            ['jenis' => 'Unit Pelaksana Teknis', 'aktif' => true]
        );

        // 2. Grade & Jabatan
        $grade11 = Grade::firstOrCreate(
            ['kode_grade' => 'Grade 11'],
            ['nilai' => 6285000.00]
        );
        $grade9 = Grade::firstOrCreate(
            ['kode_grade' => 'Grade 9'],
            ['nilai' => 4500000.00]
        );

        $jabatanLektorKepala = Jabatan::firstOrCreate(
            ['nama_jabatan' => 'Lektor Kepala'],
            ['kode_id' => $grade11->id]
        );
        $jabatanLektor = Jabatan::firstOrCreate(
            ['nama_jabatan' => 'Lektor'],
            ['kode_id' => $grade9->id]
        );

        // 3. Pegawai Uji Coba Multi-Unit & Multi-Role
        // 3a. Dr. Rina Maharani, M.T. (Pegawai Mandiri - Dosen FTI)
        $nipRina = '198803122015042001';
        $pegawaiRina = Pegawai::updateOrCreate(
            ['NIP' => $nipRina],
            [
                'unit_id' => $fti->id,
                'nama' => 'Dr. Rina Maharani, M.T.',
                'jenis' => 'Dosen',
                'status_kepegawaian' => 'PNS',
                'status_tugas_belajar' => 'aktif',
                'pangkat_golongan' => 'Penata Tk. I III/d',
                'npwp' => '09.876.543.2-201.000',
                'nowo' => '12.345.678.9-201.000',
                'status_skp' => 'Baik',
                'no_rekening' => 'BNI ••••5678',
                'aktif' => true,
            ]
        );

        // 3b. Ahmad Fauzi, S.E. (Bendahara FTI + Pegawai)
        $nipAhmad = '198204152008011002';
        Pegawai::updateOrCreate(
            ['NIP' => $nipAhmad],
            [
                'unit_id' => $fti->id,
                'nama' => 'Ahmad Bendahara, S.E.',
                'jenis' => 'Tendik',
                'status_kepegawaian' => 'PNS',
                'status_tugas_belajar' => 'aktif',
                'pangkat_golongan' => 'Penata III/c',
                'npwp' => '08.765.432.1-201.000',
                'nowo' => '12.345.678.8-201.000',
                'status_skp' => 'Sangat Baik',
                'no_rekening' => 'Bank Nagari ••••1002',
                'aktif' => true,
            ]
        );

        // 3c. Prof. Dr. Ir. Dekan FTI (PJ Unit FTI + Pegawai)
        $nipDekan = '197505102000031001';
        Pegawai::updateOrCreate(
            ['NIP' => $nipDekan],
            [
                'unit_id' => $fti->id,
                'nama' => 'Prof. Dr. Ir. Dekan FTI',
                'jenis' => 'Dosen',
                'status_kepegawaian' => 'PNS',
                'status_tugas_belajar' => 'aktif',
                'pangkat_golongan' => 'Pembina Utama Madya IV/d',
                'npwp' => '07.654.321.0-201.000',
                'nowo' => '12.345.678.7-201.000',
                'status_skp' => 'Sangat Baik',
                'no_rekening' => 'Bank Mandiri ••••3001',
                'aktif' => true,
            ]
        );

        // 3d. Budi Santoso, S.Sos. (Kepegawaian FTI + Pegawai)
        $nipBudi = '198001012005011003';
        Pegawai::updateOrCreate(
            ['NIP' => $nipBudi],
            [
                'unit_id' => $fti->id,
                'nama' => 'Budi Kepegawaian, S.Sos.',
                'jenis' => 'Tendik',
                'status_kepegawaian' => 'PNS',
                'status_tugas_belajar' => 'aktif',
                'pangkat_golongan' => 'Penata Tk. I III/d',
                'npwp' => '06.543.210.9-201.000',
                'nowo' => '12.345.678.6-201.000',
                'status_skp' => 'Baik',
                'no_rekening' => 'BNI ••••1003',
                'aktif' => true,
            ]
        );

        // 3e. Hendra Admin, M.Kom. (UPT Remunerasi + Pegawai)
        $nipAdmin = '197001011995031001';
        Pegawai::updateOrCreate(
            ['NIP' => $nipAdmin],
            [
                'unit_id' => $upt->id,
                'nama' => 'Hendra Admin Remunerasi, M.Kom.',
                'jenis' => 'Tendik',
                'status_kepegawaian' => 'PNS',
                'status_tugas_belajar' => 'aktif',
                'pangkat_golongan' => 'Pembina IV/a',
                'npwp' => '05.432.109.8-201.000',
                'nowo' => '12.345.678.5-201.000',
                'status_skp' => 'Sangat Baik',
                'no_rekening' => 'Bank Nagari ••••0001',
                'aktif' => true,
            ]
        );

        // 3f. Dr. Siti Rahma, Sp.A. (Bendahara FK + Pegawai Dosen FK)
        $nipSiti = '198406122010122001';
        Pegawai::updateOrCreate(
            ['NIP' => $nipSiti],
            [
                'unit_id' => $fk->id,
                'nama' => 'Dr. Siti Rahma, Sp.A.',
                'jenis' => 'Dosen',
                'status_kepegawaian' => 'PNS',
                'status_tugas_belajar' => 'aktif',
                'pangkat_golongan' => 'Pembina IV/a',
                'npwp' => '04.321.098.7-201.000',
                'nowo' => '12.345.678.4-201.000',
                'status_skp' => 'Sangat Baik',
                'no_rekening' => 'Bank Nagari ••••2001',
                'aktif' => true,
            ]
        );

        // 3g. Dewi Sartika, S.Si. (Kepegawaian FMIPA + Pegawai Tetap FMIPA)
        $nipDewi = '199008202018032001';
        Pegawai::updateOrCreate(
            ['NIP' => $nipDewi],
            [
                'unit_id' => $fmipa->id,
                'nama' => 'Dewi Sartika, S.Si.',
                'jenis' => 'Tendik',
                'status_kepegawaian' => 'Pegawai Tetap',
                'status_tugas_belajar' => 'aktif',
                'pangkat_golongan' => 'Penata Muda III/a',
                'npwp' => '03.210.987.6-201.000',
                'nowo' => '12.345.678.3-201.000',
                'status_skp' => 'Baik',
                'no_rekening' => 'BNI ••••2001',
                'aktif' => true,
            ]
        );

        // 3h. Dr. Ir. Rudi Hartono, M.Sc. (Pegawai Dosen FTI - STATUS TUGAS BELAJAR 60% P1)
        $nipRudi = '199202152019031002';
        Pegawai::updateOrCreate(
            ['NIP' => $nipRudi],
            [
                'unit_id' => $fti->id,
                'nama' => 'Dr. Ir. Rudi Hartono, M.Sc.',
                'jenis' => 'Dosen',
                'status_kepegawaian' => 'PNS',
                'status_tugas_belajar' => 'tugas_belajar',
                'sk_tugas_belajar' => 'SK-TUBEL/2026/041',
                'tgl_mulai_tubel' => '2026-02-01',
                'tgl_selesai_tubel' => '2028-01-31',
                'pangkat_golongan' => 'Penata Muda Tk. I III/b',
                'npwp' => '02.109.876.5-201.000',
                'nowo' => '12.345.678.2-201.000',
                'status_skp' => 'Baik',
                'no_rekening' => 'Bank Mandiri ••••1002',
                'aktif' => true,
            ]
        );

        // 4. Sinkronisasi Akun Login & NIP
        Akun::where('username', '1')->update(['NIP' => $nipRina]);
        Akun::where('username', '2')->update(['NIP' => $nipAhmad]);
        Akun::where('username', '3')->update(['NIP' => $nipBudi]);
        Akun::where('username', '4')->update(['NIP' => $nipAhmad]); // Verifikator
        Akun::where('username', '5')->update(['NIP' => $nipDekan]);
        Akun::where('username', '6')->update(['NIP' => $nipAdmin]);
        Akun::where('username', 'bendahara.fk')->update(['NIP' => $nipSiti]);
        Akun::where('username', 'kepegawaian.fmipa')->update(['NIP' => $nipDewi]);
        Akun::where('username', 'pegawai.tubel')->update(['NIP' => $nipRudi]);

        // 5. Seed Role Unit (Mendukung Multi-Role & Unit Isolation)
        $akun1 = Akun::where('username', '1')->first();
        $akun2 = Akun::where('username', '2')->first();
        $akun3 = Akun::where('username', '3')->first();
        $akun4 = Akun::where('username', '4')->first();
        $akun5 = Akun::where('username', '5')->first();
        $akun6 = Akun::where('username', '6')->first();
        $akunSiti = Akun::where('username', 'bendahara.fk')->first();
        $akunDewi = Akun::where('username', 'kepegawaian.fmipa')->first();
        $akunRudi = Akun::where('username', 'pegawai.tubel')->first();

        $roleUnitAssignments = [
            // Akun 1: Dr. Rina (Pegawai Murni FTI)
            ['role_id' => $akun1->id, 'unit_id' => $fti->id, 'peran' => 'pegawai'],

            // Akun 2: Ahmad Fauzi (Bendahara FTI + Pegawai)
            ['role_id' => $akun2->id, 'unit_id' => $fti->id, 'peran' => 'bendahara'],
            ['role_id' => $akun2->id, 'unit_id' => $fti->id, 'peran' => 'pegawai'],

            // Akun 3: Budi Santoso (Kepegawaian FTI + Pegawai)
            ['role_id' => $akun3->id, 'unit_id' => $fti->id, 'peran' => 'kepegawaian'],
            ['role_id' => $akun3->id, 'unit_id' => $fti->id, 'peran' => 'pegawai'],

            // Akun 4: Verifikator (Verifikator Universitas + Pegawai)
            ['role_id' => $akun4->id, 'unit_id' => null, 'peran' => 'verifikator'],
            ['role_id' => $akun4->id, 'unit_id' => $upt->id, 'peran' => 'pegawai'],

            // Akun 5: Dekan FTI (PJ Unit FTI + Pegawai)
            ['role_id' => $akun5->id, 'unit_id' => $fti->id, 'peran' => 'penanggung_jawab'],
            ['role_id' => $akun5->id, 'unit_id' => $fti->id, 'peran' => 'pegawai'],

            // Akun 6: Hendra (UPT Remunerasi Pusat + Pegawai)
            ['role_id' => $akun6->id, 'unit_id' => $upt->id, 'peran' => 'upt_remunerasi'],
            ['role_id' => $akun6->id, 'unit_id' => $upt->id, 'peran' => 'pegawai'],

            // Akun FK: Dr. Siti Rahma (Bendahara FK + Pegawai Dosen FK)
            ['role_id' => $akunSiti->id, 'unit_id' => $fk->id, 'peran' => 'bendahara'],
            ['role_id' => $akunSiti->id, 'unit_id' => $fk->id, 'peran' => 'pegawai'],

            // Akun FMIPA: Dewi Sartika (Kepegawaian FMIPA + Pegawai Tendik FMIPA)
            ['role_id' => $akunDewi->id, 'unit_id' => $fmipa->id, 'peran' => 'kepegawaian'],
            ['role_id' => $akunDewi->id, 'unit_id' => $fmipa->id, 'peran' => 'pegawai'],

            // Akun Tubel: Dr. Rudi Hartono (Pegawai Tugas Belajar FTI)
            ['role_id' => $akunRudi->id, 'unit_id' => $fti->id, 'peran' => 'pegawai'],
        ];

        foreach ($roleUnitAssignments as $assignment) {
            RoleUnit::firstOrCreate(
                [
                    'role_id' => $assignment['role_id'],
                    'unit_id' => $assignment['unit_id'],
                    'peran' => $assignment['peran'],
                ],
                ['aktif' => true]
            );
        }

        // 6. Usulan Jabatan Aktif
        $usulanRina = UsulanJabatan::firstOrCreate(
            ['NIP' => $nipRina, 'jabatan_id' => $jabatanLektorKepala->id],
            [
                'unit_id' => $fti->id,
                'akun_id' => $akun1?->id,
                'nomor_urutan' => 1,
                'tanggal_berlaku' => '2026-01-01',
                'status' => 'diverifikasi',
                'jenis_perubahan' => 'Kenaikan Jabatan',
                'diajukan_at' => Carbon::now()->subMonths(10),
            ]
        );

        $usulanRudi = UsulanJabatan::firstOrCreate(
            ['NIP' => $nipRudi, 'jabatan_id' => $jabatanLektor->id],
            [
                'unit_id' => $fti->id,
                'akun_id' => $akunRudi?->id,
                'nomor_urutan' => 1,
                'tanggal_berlaku' => '2026-01-01',
                'status' => 'diverifikasi',
                'jenis_perubahan' => 'Pengangkatan Pertama',
                'diajukan_at' => Carbon::now()->subMonths(10),
            ]
        );

        $usulanSiti = UsulanJabatan::firstOrCreate(
            ['NIP' => $nipSiti, 'jabatan_id' => $jabatanLektorKepala->id],
            [
                'unit_id' => $fk->id,
                'akun_id' => $akunSiti?->id,
                'nomor_urutan' => 1,
                'tanggal_berlaku' => '2026-01-01',
                'status' => 'diverifikasi',
                'jenis_perubahan' => 'Pengangkatan Pertama',
                'diajukan_at' => Carbon::now()->subMonths(10),
            ]
        );

        // 7. Presensi Bulanan (Oktober 2026)
        $reportOktoberFTI = PresensiReport::firstOrCreate(
            ['periode' => '2026-10', 'unit_id' => $fti->id],
            [
                'NIP' => $nipRina,
                'masa_file' => 'Oktober 2026',
                'status' => 'valid',
                'jumlah_valid' => 45,
                'jumlah_gagal' => 0,
                'dimpor_at' => Carbon::parse('2026-11-01 08:00:00'),
            ]
        );

        $presensiOktoberRina = PresensiBulanan::updateOrCreate(
            ['presensi_report_id' => $reportOktoberFTI->id, 'NIP' => $nipRina],
            [
                'hari_kerja' => 22,
                'cuti_sakit' => 1, // 1 hari cuti sakit (potong 1%)
                'cuti_tahunan' => 0,
                'izin' => 0,
                'alfa' => 0,
                'dikoreksi' => false,
            ]
        );

        $presensiOktoberRudi = PresensiBulanan::updateOrCreate(
            ['presensi_report_id' => $reportOktoberFTI->id, 'NIP' => $nipRudi],
            [
                'hari_kerja' => 22,
                'cuti_sakit' => 0,
                'cuti_tahunan' => 0,
                'izin' => 0,
                'alfa' => 0,
                'dikoreksi' => false,
            ]
        );

        // Presensi FK
        $reportOktoberFK = PresensiReport::firstOrCreate(
            ['periode' => '2026-10', 'unit_id' => $fk->id],
            [
                'NIP' => $nipSiti,
                'masa_file' => 'Oktober 2026',
                'status' => 'valid',
                'jumlah_valid' => 30,
                'jumlah_gagal' => 0,
                'dimpor_at' => Carbon::parse('2026-11-01 08:30:00'),
            ]
        );

        $presensiOktoberSiti = PresensiBulanan::updateOrCreate(
            ['presensi_report_id' => $reportOktoberFK->id, 'NIP' => $nipSiti],
            [
                'hari_kerja' => 22,
                'cuti_sakit' => 0,
                'cuti_tahunan' => 0,
                'izin' => 0,
                'alfa' => 0,
                'dikoreksi' => false,
            ]
        );

        // 8. Pengajuan P1 Unit
        $pengajuanOktoberFTI = PengajuanP1::updateOrCreate(
            ['periode' => '2026-10', 'unit_id' => $fti->id],
            [
                'nomor_pengajuan' => 'P1-FTI-2026-10',
                'pengajuan_ke' => 1,
                'status' => 'selesai',
                'total_remunerasi' => 150000000.00,
                'total_pengurangan' => 1500000.00,
                'total_bruto' => 148500000.00,
                'psk_nama' => 'Prof. Dr. Ir. Dekan FTI',
                'psk_nip' => $nipDekan,
                'bendahara_nama' => 'Ahmad Bendahara, S.E.',
                'bendahara_nip' => $nipAhmad,
                'diajukan_at' => Carbon::parse('2026-11-02 10:00:00'),
            ]
        );

        $pengajuanOktoberFK = PengajuanP1::updateOrCreate(
            ['periode' => '2026-10', 'unit_id' => $fk->id],
            [
                'nomor_pengajuan' => 'P1-FK-2026-10',
                'pengajuan_ke' => 1,
                'status' => 'selesai',
                'total_remunerasi' => 210000000.00,
                'total_pengurangan' => 800000.00,
                'total_bruto' => 209200000.00,
                'psk_nama' => 'Dekan Fakultas Kedokteran',
                'psk_nip' => '196801011994031001',
                'bendahara_nama' => 'Dr. Siti Rahma, Sp.A.',
                'bendahara_nip' => $nipSiti,
                'diajukan_at' => Carbon::parse('2026-11-02 11:00:00'),
            ]
        );

        // 9. Komponen Potongan Standar untuk Rincian
        $tarifTL = ['0,25%', '0,5%', '1%', '1,5%', '2%', '2,5%'];
        $komponenDummy = [];
        foreach ($tarifTL as $i => $t) {
            $komponenDummy[] = ['nama' => 'TL.' . ($i + 1), 'hari' => 0, 'tarif' => $t, 'persen' => '0%'];
        }
        foreach ($tarifTL as $i => $t) {
            $komponenDummy[] = ['nama' => 'PSW.' . ($i + 1), 'hari' => 0, 'tarif' => $t, 'persen' => '0%'];
        }
        $komponenDummy[] = ['nama' => 'Cuti Sakit', 'hari' => 1, 'tarif' => '1%', 'persen' => '1%'];
        $komponenDummy[] = ['nama' => 'Cuti Bersalin ke-1 dan ke-2', 'hari' => 0, 'tarif' => '1%', 'persen' => '0%'];
        $komponenDummy[] = ['nama' => 'Cuti Bersalin ke-3', 'hari' => 0, 'tarif' => '2%', 'persen' => '0%'];
        $komponenDummy[] = ['nama' => 'Cuti Bersalin ke-4 dan seterusnya', 'hari' => 0, 'tarif' => '3%', 'persen' => '0%'];
        $komponenDummy[] = ['nama' => 'Cuti Karena Alasan Penting', 'hari' => 0, 'tarif' => '3%', 'persen' => '0%'];
        $komponenDummy[] = ['nama' => 'Cuti Besar', 'hari' => 0, 'tarif' => '1,5%', 'persen' => '0%'];
        $komponenDummy[] = ['nama' => 'Tidak Hadir Tanpa Keterangan', 'hari' => 0, 'tarif' => '5%', 'persen' => '0%'];

        // 10. Hasil Perhitungan P1 untuk Dr. Rina (FTI - PNS 100% P1)
        $periodeData = [
            ['periode' => 'Oktober 2026', 'id_str' => '2026-10', 'nilai_jabatan' => 6285000, 'p1_gross' => 2514000, 'pengurangan' => 25140, 'bruto' => 2488860, 'pph21' => 150000, 'netto' => 2338860],
            ['periode' => 'September 2026', 'id_str' => '2026-09', 'nilai_jabatan' => 6285000, 'p1_gross' => 2514000, 'pengurangan' => 25140, 'bruto' => 2488860, 'pph21' => 150000, 'netto' => 2338860],
            ['periode' => 'Agustus 2026', 'id_str' => '2026-08', 'nilai_jabatan' => 6285000, 'p1_gross' => 2514000, 'pengurangan' => 25140, 'bruto' => 2488860, 'pph21' => 150000, 'netto' => 2338860],
            ['periode' => 'Juli 2026', 'id_str' => '2026-07', 'nilai_jabatan' => 6285000, 'p1_gross' => 2514000, 'pengurangan' => 25140, 'bruto' => 2488860, 'pph21' => 150000, 'netto' => 2338860],
        ];

        $hasilOktoberRinaId = null;

        foreach ($periodeData as $p) {
            $hasil = HasilPerhitungan::updateOrCreate(
                ['NIP' => $nipRina, 'periode' => $p['id_str']],
                [
                    'pengajuan_id' => $pengajuanOktoberFTI->id,
                    'usulan_jabatan_id' => $usulanRina->id,
                    'presensi_bulanan_id' => $presensiOktoberRina->id,
                    'kelompok_amprah' => 'Dosen',
                    'nilai_jabatan' => $p['nilai_jabatan'],
                    'pir' => 1.0,
                    'persen_p1' => 40.0,
                    'p1_gross' => $p['p1_gross'],
                    'persen_status' => 100.0, // PNS 100%
                    'p1_pertimbang' => $p['bruto'],
                    'pengurangan_rp' => $p['pengurangan'],
                    'pengurangan_tp' => $p['pengurangan'],
                    'pengali_status' => 'PNS (100%)',
                    'penjeki_status' => 'PNS (100%)',
                    'persen_potongan_hadir' => 1.0,
                    'no_persen_potongan_hadir' => 1.0,
                    'persen_hukdis' => 0.0,
                    'total_persen_potongan' => 1.0,
                    'total_persen_golongan' => 1.0,
                    'rincian_potongan' => $komponenDummy,
                    'alasan_nol' => null,
                    'p1_setelah_potongan' => $p['bruto'],
                    'p1_setelah_golongan' => $p['bruto'],
                    'pajak_pph21' => $p['pph21'],
                    'pajak_ter' => 0,
                    'pajak_tcr' => 0,
                    'tab_pajak' => ['tarif' => '5%', 'dasar_pajak' => $p['bruto']],
                    'tbl_pajak' => ['tarif' => '5%', 'dasar_pajak' => $p['bruto']],
                    'p1_netto' => $p['netto'],
                    'catatan_verifikator' => 'Perhitungan telah diverifikasi dan sesuai ketentuan.',
                    'amprah_terbit_at' => Carbon::now()->subDays(5),
                    'slip_file_path' => 'slips/' . $p['id_str'] . '_' . $nipRina . '.pdf',
                    'slip_terbit_at' => Carbon::now()->subDays(5),
                ]
            );

            if ($p['id_str'] === '2026-10') {
                $hasilOktoberRinaId = $hasil->id;
            }
        }

        // 11. Hasil Perhitungan P1 untuk Dr. Rudi Hartono (FTI - PNS Tugas Belajar: 60% P1)
        HasilPerhitungan::updateOrCreate(
            ['NIP' => $nipRudi, 'periode' => '2026-10'],
            [
                'pengajuan_id' => $pengajuanOktoberFTI->id,
                'usulan_jabatan_id' => $usulanRudi->id,
                'presensi_bulanan_id' => $presensiOktoberRudi->id,
                'kelompok_amprah' => 'Dosen',
                'nilai_jabatan' => 4500000.00, // Grade 9
                'pir' => 1.0,
                'persen_p1' => 40.0,
                'p1_gross' => 1800000.00,      // 40% x 4.5jt = 1.800.000
                'persen_status' => 60.0,       // Tugas Belajar: 60% dari P1
                'p1_pertimbang' => 1080000.00, // 60% x 1.800.000 = 1.080.000
                'pengurangan_rp' => 0,
                'pengurangan_tp' => 0,
                'pengali_status' => 'Tugas Belajar (60%)',
                'penjeki_status' => 'Tugas Belajar (60%)',
                'persen_potongan_hadir' => 0.0,
                'no_persen_potongan_hadir' => 0.0,
                'persen_hukdis' => 0.0,
                'total_persen_potongan' => 0.0,
                'total_persen_golongan' => 0.0,
                'rincian_potongan' => [],
                'alasan_nol' => null,
                'p1_setelah_potongan' => 1080000.00,
                'p1_setelah_golongan' => 1080000.00,
                'pajak_pph21' => 54000.00,
                'pajak_ter' => 0,
                'pajak_tcr' => 0,
                'tab_pajak' => ['tarif' => '5%', 'dasar_pajak' => 1080000],
                'tbl_pajak' => ['tarif' => '5%', 'dasar_pajak' => 1080000],
                'p1_netto' => 1026000.00,
                'catatan_verifikator' => 'Status Tugas Belajar diverifikasi oleh Kepegawaian (pengali 60%).',
                'amprah_terbit_at' => Carbon::now()->subDays(5),
                'slip_file_path' => 'slips/2026-10_' . $nipRudi . '.pdf',
                'slip_terbit_at' => Carbon::now()->subDays(5),
            ]
        );

        // 12. Hasil Perhitungan P1 untuk Dr. Siti Rahma (Bendahara FK - Dosen PNS FK 100%)
        HasilPerhitungan::updateOrCreate(
            ['NIP' => $nipSiti, 'periode' => '2026-10'],
            [
                'pengajuan_id' => $pengajuanOktoberFK->id,
                'usulan_jabatan_id' => $usulanSiti->id,
                'presensi_bulanan_id' => $presensiOktoberSiti->id,
                'kelompok_amprah' => 'Dosen',
                'nilai_jabatan' => 6285000.00, // Grade 11
                'pir' => 1.0,
                'persen_p1' => 40.0,
                'p1_gross' => 2514000.00,
                'persen_status' => 100.0, // PNS 100%
                'p1_pertimbang' => 2514000.00,
                'pengurangan_rp' => 0,
                'pengurangan_tp' => 0,
                'pengali_status' => 'PNS (100%)',
                'penjeki_status' => 'PNS (100%)',
                'persen_potongan_hadir' => 0.0,
                'no_persen_potongan_hadir' => 0.0,
                'persen_hukdis' => 0.0,
                'total_persen_potongan' => 0.0,
                'total_persen_golongan' => 0.0,
                'rincian_potongan' => [],
                'alasan_nol' => null,
                'p1_setelah_potongan' => 2514000.00,
                'p1_setelah_golongan' => 2514000.00,
                'pajak_pph21' => 125700.00,
                'pajak_ter' => 0,
                'pajak_tcr' => 0,
                'tab_pajak' => ['tarif' => '5%', 'dasar_pajak' => 2514000],
                'tbl_pajak' => ['tarif' => '5%', 'dasar_pajak' => 2514000],
                'p1_netto' => 2388300.00,
                'catatan_verifikator' => 'Perhitungan P1 Fakultas Kedokteran telah diverifikasi.',
                'amprah_terbit_at' => Carbon::now()->subDays(5),
                'slip_file_path' => 'slips/2026-10_' . $nipSiti . '.pdf',
                'slip_terbit_at' => Carbon::now()->subDays(5),
            ]
        );

        // 13. Pengaduan & Tanggapan Pengaduan (Tiket Uji Coba)
        $p1 = Pengaduan::updateOrCreate(
            ['judul' => 'Perubahan jabatan atau grade belum sesuai', 'NIP' => $nipRina],
            [
                'unit_id' => $fti->id,
                'hasil_id' => $hasilOktoberRinaId,
                'kategori' => 'Perubahan jabatan atau grade belum sesuai',
                'uraian' => 'Dokumen SPMT Lektor Kepala terhitung mulai 1 September 2026 belum terefleksi pada grade remunerasi bulan ini.',
                'tingkat' => 'unit',
                'status' => 'Ditindaklanjuti',
                'periode' => 'September 2026',
                'diajukan_at' => Carbon::parse('2026-10-22 09:14:00'),
            ]
        );

        TanggapanPengaduan::updateOrCreate(
            ['pengaduan_id' => $p1->id, 'isi' => 'Dokumen SPMT telah kami periksa. Perubahan jabatan telah diteruskan ke UPT Remunerasi untuk penetapan.'],
            [
                'NIP' => $nipAhmad, // Verifikator / Kepegawaian
                'tipe' => 'jawaban',
                'lampiran_path' => 'SPMT-Lektor-Kepala.pdf',
                'dikirim_at' => Carbon::parse('2026-10-22 14:35:00'),
            ]
        );

        TanggapanPengaduan::updateOrCreate(
            ['pengaduan_id' => $p1->id, 'isi' => 'Terima kasih. SK dan SPMT terbaru sudah saya lampirkan pada pengaduan.'],
            [
                'NIP' => $nipRina, // Pegawai bersangkutan
                'tipe' => 'pertanyaan',
                'dikirim_at' => Carbon::parse('2026-10-22 16:02:00'),
            ]
        );
    }
}
