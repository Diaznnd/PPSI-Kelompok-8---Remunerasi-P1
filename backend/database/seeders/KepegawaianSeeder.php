<?php

namespace Database\Seeders;

use App\Models\Akun;
use App\Models\Amprah;
use App\Models\DokumenPendukung;
use App\Models\Grade;
use App\Models\HasilPerhitungan;
use App\Models\HukumanDisiplin;
use App\Models\Jabatan;
use App\Models\Pegawai;
use App\Models\Pengaduan;
use App\Models\PengajuanP1;
use App\Models\PresensiBulanan;
use App\Models\PresensiReport;
use App\Models\RiwayatStatus;
use App\Models\TanggapanPengaduan;
use App\Models\UnitKerja;
use App\Models\UsulanJabatan;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;

class KepegawaianSeeder extends Seeder
{
    public function run(): void
    {
        $fti = UnitKerja::firstOrCreate(
            ['nama' => 'Fakultas Teknologi Informasi'],
            ['jenis' => 'Fakultas', 'aktif' => true]
        );

        $akunKepeg = Akun::where('username', '3')->first();

        // 1. Seed Seluruh Master Grade (Sesuai Tabel Daftar Grade pada Lampiran Dokumen A2 hal. 33)
        $gradesData = [
            'Grade 3' => 2430000.00,
            'Grade 5' => 2709000.00,
            'Grade 6' => 2991000.00,
            'Grade 7' => 3570000.00,
            'Grade 8' => 3936000.00,
            'Grade 9' => 4359000.00,
            'Grade 10' => 5232000.00,
            'Grade 11' => 6285000.00,
            'Grade 12' => 7245000.00,
            'Grade 13' => 9054000.00,
            'Grade 14' => 10869000.00,
            'Grade 15' => 13455000.00,
            'Grade 16' => 16134000.00,
            'Grade 17' => 21540000.00,
        ];

        $grades = [];
        foreach ($gradesData as $kode => $nilai) {
            $grades[$kode] = Grade::updateOrCreate(
                ['kode_grade' => $kode],
                ['nilai' => $nilai]
            );
        }

        // 2. Seed Master Jabatan (FR-30 & FR-04)
        $jabatanMasterData = [
            'Asisten Ahli' => 'Grade 9',
            'Lektor' => 'Grade 10',
            'Lektor Kepala' => 'Grade 11',
            'Guru Besar' => 'Grade 14',
            'Pranata Komputer' => 'Grade 8',
            'Pengelola Data dan Informasi' => 'Grade 6',
            'Analis Kepegawaian Ahli Muda' => 'Grade 8',
            'Teknisi Laboratorium' => 'Grade 7',
        ];

        $jabatans = [];
        foreach ($jabatanMasterData as $namaJab => $kodeGrade) {
            $jabatans[$namaJab] = Jabatan::updateOrCreate(
                ['nama_jabatan' => $namaJab],
                ['kode_id' => $grades[$kodeGrade]->id]
            );
        }

        // 3. Seed 10 Pegawai Sampel Acuan Uji Engine P1 (L0) + 1 Pegawai Nonaktif (L1 / FR-03)
        $pegawaiSampel = [
            [
                'NIP' => '198803122015042001',
                'nama' => 'Dr. Rina Maharani, M.T.',
                'email' => 'rina.maharani@unand.ac.id',
                'jenis' => 'Dosen',
                'status_kepegawaian' => 'PNS',
                'status_tugas_belajar' => 'aktif',
                'pangkat_golongan' => 'IV/a',
                'tmt' => '2015-04-01',
                'npwp' => '09.876.543.2-201.000',
                'aktif' => true,
                'jabatan_resmi' => 'Lektor Kepala',
                'presensi' => ['hari_kerja' => 22, 'hadir' => 21, 'tidak_hadir' => 0, 'cuti_izin' => 1, 'cuti_sakit' => 1, 'cuti_tahunan' => 0, 'alfa' => 0, 'cuti_alasan_penting' => 0],
            ],
            [
                'NIP' => '198710082016041002',
                'nama' => 'Andi Pratama, S.Kom.',
                'email' => 'andi.pratama@unand.ac.id',
                'jenis' => 'Tenaga Kependidikan',
                'status_kepegawaian' => 'PNS',
                'status_tugas_belajar' => 'aktif',
                'pangkat_golongan' => 'III/b',
                'tmt' => '2016-04-01',
                'npwp' => '12.345.678.9-201.000',
                'aktif' => true,
                'jabatan_resmi' => 'Pranata Komputer',
                'presensi' => ['hari_kerja' => 22, 'hadir' => 22, 'tidak_hadir' => 0, 'cuti_izin' => 0, 'cuti_sakit' => 0, 'cuti_tahunan' => 0, 'alfa' => 0, 'cuti_alasan_penting' => 0],
            ],
            [
                'NIP' => '198603131803022004',
                'nama' => 'Siti Rahmah, M.Kom.',
                'email' => 'siti.rahmah@unand.ac.id',
                'jenis' => 'Dosen',
                'status_kepegawaian' => 'PNS',
                'status_tugas_belajar' => 'aktif',
                'pangkat_golongan' => 'III/d',
                'tmt' => '2018-03-01',
                'npwp' => '23.456.789.0-201.000',
                'aktif' => true,
                'jabatan_resmi' => 'Lektor',
                'presensi' => ['hari_kerja' => 22, 'hadir' => 9, 'tidak_hadir' => 13, 'cuti_izin' => 0, 'cuti_sakit' => 0, 'cuti_tahunan' => 0, 'alfa' => 13, 'cuti_alasan_penting' => 0],
            ],
            [
                'NIP' => '198506202010121001',
                'nama' => 'Budi Santoso, M.T.',
                'email' => 'budi.santoso@unand.ac.id',
                'jenis' => 'Dosen',
                'status_kepegawaian' => 'PNS',
                'status_tugas_belajar' => 'aktif',
                'pangkat_golongan' => 'IV/a',
                'tmt' => '2010-12-01',
                'npwp' => '34.567.890.1-201.000',
                'aktif' => true,
                'jabatan_resmi' => 'Lektor Kepala',
                'presensi' => ['hari_kerja' => 22, 'hadir' => 18, 'tidak_hadir' => 2, 'cuti_izin' => 2, 'cuti_sakit' => 0, 'cuti_tahunan' => 2, 'alfa' => 2, 'cuti_alasan_penting' => 0],
            ],
            [
                'NIP' => '198907122015042001',
                'nama' => 'Sri Madona, S.Kom',
                'email' => 'sri.madona@unand.ac.id',
                'jenis' => 'Tenaga Kependidikan',
                'status_kepegawaian' => 'CPT-PTNBH',
                'status_tugas_belajar' => 'aktif',
                'pangkat_golongan' => 'III/a',
                'tmt' => '2015-04-01',
                'npwp' => '1371015007890006',
                'aktif' => true,
                'jabatan_resmi' => 'Pengelola Data dan Informasi',
                'presensi' => ['hari_kerja' => 22, 'hadir' => 22, 'tidak_hadir' => 0, 'cuti_izin' => 0, 'cuti_sakit' => 0, 'cuti_tahunan' => 0, 'alfa' => 0, 'cuti_alasan_penting' => 0],
            ],
            [
                'NIP' => '198904062019071012',
                'nama' => 'Fikri Ananda, M.Kom.',
                'email' => 'fikri.ananda@unand.ac.id',
                'jenis' => 'Dosen',
                'status_kepegawaian' => 'PNS',
                'status_tugas_belajar' => 'aktif',
                'pangkat_golongan' => 'III/c',
                'tmt' => '2019-07-01',
                'npwp' => '45.678.901.2-201.000',
                'aktif' => true,
                'jabatan_resmi' => 'Asisten Ahli',
                'presensi' => ['hari_kerja' => 22, 'hadir' => 22, 'tidak_hadir' => 0, 'cuti_izin' => 0, 'cuti_sakit' => 0, 'cuti_tahunan' => 0, 'alfa' => 0, 'cuti_alasan_penting' => 0],
            ],
            [
                'NIP' => '199507212022032008',
                'nama' => 'Nadia Putri, S.Kom.',
                'email' => 'nadia.putri@unand.ac.id',
                'jenis' => 'Tenaga Kependidikan',
                'status_kepegawaian' => 'CPNS',
                'status_tugas_belajar' => 'aktif',
                'pangkat_golongan' => 'III/a',
                'tmt' => '2022-03-01',
                'npwp' => '56.789.012.3-201.000',
                'aktif' => true,
                'jabatan_resmi' => 'Pranata Komputer',
                'presensi' => ['hari_kerja' => 22, 'hadir' => 20, 'tidak_hadir' => 0, 'cuti_izin' => 2, 'cuti_sakit' => 0, 'cuti_tahunan' => 2, 'alfa' => 0, 'cuti_alasan_penting' => 0],
            ],
            [
                'NIP' => '198209102010011003',
                'nama' => 'Ricky Akbar, M.Kom.',
                'email' => 'ricky.akbar@unand.ac.id',
                'jenis' => 'Dosen',
                'status_kepegawaian' => 'CPT-PTNBH',
                'status_tugas_belajar' => 'aktif',
                'pangkat_golongan' => 'III/d',
                'tmt' => '2010-01-01',
                'npwp' => '67.890.123.4-201.000',
                'aktif' => true,
                'jabatan_resmi' => 'Lektor',
                'presensi' => ['hari_kerja' => 22, 'hadir' => 22, 'tidak_hadir' => 0, 'cuti_izin' => 0, 'cuti_sakit' => 0, 'cuti_tahunan' => 0, 'alfa' => 0, 'cuti_alasan_penting' => 0],
            ],
            [
                'NIP' => '199001152018022005',
                'nama' => 'Dewi Anggraini, S.Sos.',
                'email' => 'dewi.anggraini@unand.ac.id',
                'jenis' => 'Tenaga Kependidikan',
                'status_kepegawaian' => 'PNS',
                'status_tugas_belajar' => 'aktif',
                'pangkat_golongan' => 'III/c',
                'tmt' => '2018-02-01',
                'npwp' => '78.901.234.5-201.000',
                'aktif' => true,
                'jabatan_resmi' => 'Analis Kepegawaian Ahli Muda',
                'presensi' => ['hari_kerja' => 22, 'hadir' => 21, 'tidak_hadir' => 0, 'cuti_izin' => 1, 'cuti_sakit' => 0, 'cuti_tahunan' => 0, 'alfa' => 0, 'cuti_alasan_penting' => 1],
            ],
            [
                'NIP' => '199202152019031002',
                'nama' => 'Dr. Ir. Rudi Hartono, M.Sc.',
                'email' => 'rudi.hartono@unand.ac.id',
                'jenis' => 'Dosen',
                'status_kepegawaian' => 'PNS',
                'status_tugas_belajar' => 'tugas_belajar',
                'sk_tugas_belajar' => 'SK-TUBEL/2026/041',
                'tgl_mulai_tubel' => '2026-02-01',
                'tgl_selesai_tubel' => '2028-01-31',
                'pangkat_golongan' => 'III/b',
                'tmt' => '2019-03-01',
                'npwp' => '02.109.876.5-201.000',
                'aktif' => true,
                'jabatan_resmi' => 'Asisten Ahli',
                'presensi' => ['hari_kerja' => 22, 'hadir' => 22, 'tidak_hadir' => 0, 'cuti_izin' => 0, 'cuti_sakit' => 0, 'cuti_tahunan' => 0, 'alfa' => 0, 'cuti_alasan_penting' => 0],
            ],
            // Pegawai Nonaktif (FR-03: tidak ikut dihitung pada P1)
            [
                'NIP' => '198412302009121004',
                'nama' => 'Hendro Wibowo, S.T.',
                'email' => 'hendro.wibowo@unand.ac.id',
                'jenis' => 'Dosen',
                'status_kepegawaian' => 'PNS',
                'status_tugas_belajar' => 'aktif',
                'pangkat_golongan' => 'III/d',
                'tmt' => '2009-12-01',
                'npwp' => '89.012.345.6-201.000',
                'aktif' => false,
                'alasan_nonaktif' => 'Mutasi keluar unit',
                'jabatan_resmi' => 'Lektor',
                'presensi' => null,
            ],
        ];

        $reportOkt = PresensiReport::updateOrCreate(
            ['unit_id' => $fti->id, 'periode' => '2026-10'],
            [
                'NIP' => '198803122015042001',
                'nama_file' => 'presensi_okt2026.xlsx',
                'masa_file' => 'Oktober 2026',
                'file_hash' => md5('presensi_okt2026.xlsx'),
                'status' => 'valid',
                'jumlah_valid' => 10,
                'jumlah_gagal' => 0,
                'baris_gagal' => [],
                'durasi' => '2 detik',
                'dimpor_at' => Carbon::parse('2026-10-20 09:14:00'),
            ]
        );

        // Buat juga riwayat impor September 2026 dengan contoh 2 baris gagal untuk pengujian L3 & L4
        PresensiReport::updateOrCreate(
            ['unit_id' => $fti->id, 'periode' => '2026-09'],
            [
                'NIP' => '198803122015042001',
                'nama_file' => 'presensi_sep2026.xlsx',
                'masa_file' => 'September 2026',
                'file_hash' => md5('presensi_sep2026.xlsx'),
                'status' => 'perlu_koreksi',
                'jumlah_valid' => 10,
                'jumlah_gagal' => 2,
                'baris_gagal' => [
                    [
                        'index' => 0,
                        'baris' => 11,
                        'nip' => '199999992025011099',
                        'nama' => 'Pegawai NIP Salah Ketik',
                        'hariKerja' => 22,
                        'hadir' => 22,
                        'tidakHadir' => 0,
                        'cuti' => 0,
                        'alasan' => 'NIP 199999992025011099 tidak terdaftar pada sistem.',
                    ],
                    [
                        'index' => 1,
                        'baris' => 12,
                        'nip' => '198904062019071012',
                        'nama' => 'Fikri Ananda, M.Kom.',
                        'hariKerja' => 22,
                        'hadir' => 20,
                        'tidakHadir' => 5,
                        'cuti' => 0,
                        'alasan' => 'Total Hadir (20) + Tidak Hadir (5) + Cuti/Izin (0) tidak sama dengan Hari Kerja (22).',
                    ],
                ],
                'durasi' => '2 detik',
                'dimpor_at' => Carbon::parse('2026-09-25 10:00:00'),
            ]
        );

        foreach ($pegawaiSampel as $idx => $ps) {
            $jabNama = $ps['jabatan_resmi'];
            $presData = $ps['presensi'];
            unset($ps['jabatan_resmi'], $ps['presensi']);

            $ps['unit_id'] = $fti->id;
            $pegawai = Pegawai::updateOrCreate(['NIP' => $ps['NIP']], $ps);

            // Buat riwayat jabatan resmi yang sudah ditetapkan (hapus riwayat resmi lain agar konsisten dengan L0)
            if (isset($jabatans[$jabNama])) {
                UsulanJabatan::where('NIP', $pegawai->NIP)
                    ->whereIn('status', ['ditetapkan', 'diverifikasi'])
                    ->delete();

                UsulanJabatan::create([
                    'NIP' => $pegawai->NIP,
                    'jabatan_id' => $jabatans[$jabNama]->id,
                    'status' => 'ditetapkan',
                    'akun_id' => $akunKepeg?->id,
                    'unit_id' => $fti->id,
                    'nomor_urutan' => $idx + 1,
                    'tanggal_berlaku' => '2026-01-01',
                    'jenis_perubahan' => 'penyesuaian',
                    'alasan' => 'Penetapan jabatan resmi awal tahun anggaran 2026.',
                    'diajukan_at' => Carbon::parse('2026-01-01 08:00:00'),
                ]);
            }

            // Buat presensi bulanan Oktober 2026
            if ($presData) {
                PresensiBulanan::updateOrCreate(
                    [
                        'presensi_report_id' => $reportOkt->id,
                        'NIP' => $pegawai->NIP,
                    ],
                    array_merge($presData, ['dikoreksi' => false])
                );
            }
        }

        // 4. Seed Dokumen PDF Fisik & Usulan Perubahan Jabatan/Grade (L5 & L6: Diajukan, Dikembalikan, Disetujui Verifikator)
        $samplePdfContent = "%PDF-1.4\n1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n"
            . "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n"
            . "3 0 obj << /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >> endobj\n"
            . "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n"
            . "5 0 obj << /Length 95 >> stream\nBT /F1 12 Tf 72 720 Td (UNIVERSITAS ANDALAS - DOKUMEN SK / SPMT USULAN JABATAN) Tj ET\nendstream\nendobj\n"
            . "xref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000229 00000 n \n0000000297 00000 n \n"
            . "trailer << /Size 6 /Root 1 0 R >>\nstartxref\n444\n%%EOF";

        $usulanSeedList = [
            [
                'nomor_urutan' => 31,
                'NIP' => '198803122015042001',
                'jabatan_lama' => 'Lektor',
                'jabatan_baru' => 'Lektor Kepala',
                'jenis_perubahan' => 'promosi',
                'tanggal_berlaku' => '2026-09-01',
                'alasan' => 'Kenaikan jabatan fungsional berdasarkan SK Rektor Nomor 1482/UN16.R/KP/2026.',
                'status' => 'disetujui_verifikator',
                'sk' => 'SK_Lektor_Kepala_Rina_Maharani.pdf',
                'spmt' => 'SPMT_Rina_Maharani.pdf',
                'catatan_verifikator' => 'SK Kenaikan Jabatan Fungsional dan SPMT lengkap, tanggal mulai berlaku sesuai SK.',
                'jejak' => [
                    ['label' => 'Diajukan', 'waktu' => '26 September 2026 pukul 08.30', 'oleh' => 'Nurul Hidayati (Bidang Kepegawaian)'],
                    ['label' => 'Disetujui', 'waktu' => '2 Oktober 2026 pukul 11.00', 'oleh' => 'Rizki Maulana (Verifikator)', 'catatan' => 'SK Kenaikan Jabatan Fungsional dan SPMT lengkap, tanggal mulai berlaku sesuai SK.'],
                ],
            ],
            [
                'nomor_urutan' => 36,
                'NIP' => '198904062019071012',
                'jabatan_lama' => 'Asisten Ahli',
                'jabatan_baru' => 'Lektor',
                'jenis_perubahan' => 'promosi',
                'tanggal_berlaku' => '2026-10-01',
                'alasan' => 'Kenaikan jabatan fungsional dari Asisten Ahli ke Lektor.',
                'status' => 'dikembalikan',
                'sk' => 'SK_Lektor_Fikri_Ananda.pdf',
                'spmt' => 'SPMT_Fikri_Ananda.pdf',
                'catatan_verifikator' => 'Tanggal mulai berlaku pada usulan (1 Oktober 2026) tidak sesuai SPMT yang terlampir (1 November 2026). Mohon sesuaikan tanggal lalu ajukan ulang.',
                'jejak' => [
                    ['label' => 'Diajukan', 'waktu' => '28 September 2026 pukul 10.15', 'oleh' => 'Nurul Hidayati (Bidang Kepegawaian)'],
                    ['label' => 'Dikembalikan', 'waktu' => '1 Oktober 2026 pukul 14.20', 'oleh' => 'Rizki Maulana (Verifikator)', 'catatan' => 'Tanggal mulai berlaku pada usulan (1 Oktober 2026) tidak sesuai SPMT yang terlampir (1 November 2026). Mohon sesuaikan tanggal lalu ajukan ulang.'],
                ],
            ],
            [
                'nomor_urutan' => 39,
                'NIP' => '199507212022032008',
                'jabatan_lama' => 'Pranata Komputer',
                'jabatan_baru' => 'Asisten Ahli',
                'jenis_perubahan' => 'kenaikan_grade',
                'tanggal_berlaku' => '2026-11-01',
                'alasan' => 'Penyesuaian grade sesuai masa kerja dan angka kredit.',
                'status' => 'diajukan',
                'sk' => 'SK_Grade_Nadia_Putri.pdf',
                'spmt' => 'SPMT_Nadia_Putri.pdf',
                'catatan_verifikator' => null,
                'jejak' => [
                    ['label' => 'Diajukan', 'waktu' => '10 Oktober 2026 pukul 09.45', 'oleh' => 'Nurul Hidayati (Bidang Kepegawaian)'],
                ],
            ],
        ];

        foreach ($usulanSeedList as $us) {
            Storage::disk('public')->put('dokumen_usulan/' . $us['sk'], $samplePdfContent);
            Storage::disk('public')->put('dokumen_usulan/' . $us['spmt'], $samplePdfContent);

            $dokSk = DokumenPendukung::updateOrCreate(
                ['nama_file' => $us['sk']],
                [
                    'akun_id' => $akunKepeg?->id,
                    'file_path' => 'dokumen_usulan/' . $us['sk'],
                    'jenis' => 'SK',
                    'jenis_dokumen' => 'SK Jabatan',
                    'ukuran_kb' => 1200,
                    'diunggah_at' => now(),
                ]
            );

            $dokSpmt = DokumenPendukung::updateOrCreate(
                ['nama_file' => $us['spmt']],
                [
                    'akun_id' => $akunKepeg?->id,
                    'file_path' => 'dokumen_usulan/' . $us['spmt'],
                    'jenis' => 'SPMT',
                    'jenis_dokumen' => 'SPMT',
                    'ukuran_kb' => 832,
                    'diunggah_at' => now(),
                ]
            );

            UsulanJabatan::updateOrCreate(
                ['nomor_urutan' => $us['nomor_urutan'], 'NIP' => $us['NIP']],
                [
                    'dokumen_id' => $dokSk->id,
                    'dokumen_spmt_id' => $dokSpmt->id,
                    'akun_id' => $akunKepeg?->id,
                    'unit_id' => $fti->id,
                    'jabatan_lama_id' => $jabatans[$us['jabatan_lama']]->id,
                    'jabatan_id' => $jabatans[$us['jabatan_baru']]->id,
                    'tanggal_berlaku' => $us['tanggal_berlaku'],
                    'alasan' => $us['alasan'],
                    'status' => $us['status'],
                    'catatan_verifikator' => $us['catatan_verifikator'],
                    'jenis_perubahan' => $us['jenis_perubahan'],
                    'jejak' => $us['jejak'],
                    'diajukan_at' => Carbon::parse('2026-10-10 09:45:00'),
                ]
            );
        }

        // 5. Seed Hukuman Disiplin (L2: FR-06)
        HukumanDisiplin::updateOrCreate(
            ['NIP' => '198506202010121001', 'nomor_sk' => '0731/UN16.R/KP/2026'],
            [
                'akun_id' => $akunKepeg?->id,
                'tingkat' => 'sedang',
                'jenis' => 'Pemotongan tunjangan kinerja 25% selama 6 bulan',
                'tanggal_mulai' => '2026-08-01',
                'tanggal_berakhir' => '2027-01-31',
                'uraian' => 'Tidak masuk kerja tanpa alasan sah secara kumulatif 12 hari dalam satu tahun.',
            ]
        );

        HukumanDisiplin::updateOrCreate(
            ['NIP' => '198710082016041002', 'nomor_sk' => '1280/UN16.R/KP/2025'],
            [
                'akun_id' => $akunKepeg?->id,
                'tingkat' => 'ringan',
                'jenis' => 'Teguran tertulis',
                'tanggal_mulai' => '2025-11-01',
                'tanggal_berakhir' => '2026-04-30',
                'uraian' => 'Terlambat masuk kerja berulang pada triwulan terakhir 2025.',
            ]
        );

        // 6. Seed Pengaduan Pegawai di Unit FTI (FR-08)
        $aduanSeed = [
            [
                'NIP' => '198506202010121001',
                'judul' => 'Potongan hukuman disiplin pada P1 September',
                'kategori' => 'Hasil perhitungan',
                'uraian' => 'P1 September saya masih dipotong 25% karena hukuman disiplin. Seingat saya masa hukuman sudah selesai akhir Agustus 2026.',
                'status' => 'Diajukan',
                'tingkat' => 'unit',
                'periode' => 'September 2026',
                'diajukan_at' => '2026-10-21 09:00:00',
                'tanggapan' => null,
            ],
            [
                'NIP' => '198710082016041002',
                'judul' => 'Ketidakhadiran tugas kedinasan',
                'kategori' => 'Presensi',
                'uraian' => 'Saya tercatat tidak hadir 2 hari padahal sedang menjalankan tugas kedinasan.',
                'status' => 'Diajukan',
                'tingkat' => 'unit',
                'periode' => 'September 2026',
                'diajukan_at' => '2026-10-20 10:30:00',
                'tanggapan' => null,
            ],
            [
                'NIP' => '198904062019071012',
                'judul' => 'PPh 21 terasa lebih besar',
                'kategori' => 'Pajak dan potongan',
                'uraian' => 'PPh 21 pada slip terasa lebih besar dari bulan sebelumnya.',
                'status' => 'Diteruskan',
                'tingkat' => 'upt',
                'periode' => 'September 2026',
                'diajukan_at' => '2026-10-17 14:00:00',
                'tanggapan' => 'Perhitungan pajak ditetapkan UPT Remunerasi; pengaduan Anda telah diteruskan.',
            ],
            [
                'NIP' => '199507212022032008',
                'judul' => 'Cuti tahunan belum tercatat',
                'kategori' => 'Presensi',
                'uraian' => 'Cuti tahunan 13–15 Oktober belum tercatat di rekap.',
                'status' => 'Selesai',
                'tingkat' => 'unit',
                'periode' => 'September 2026',
                'diajukan_at' => '2026-10-10 11:00:00',
                'tanggapan' => 'Data cuti telah diperbaiki pada rekap presensi periode ini.',
            ],
        ];

        foreach ($aduanSeed as $ad) {
            $pengaduan = Pengaduan::updateOrCreate(
                ['NIP' => $ad['NIP'], 'judul' => $ad['judul']],
                [
                    'unit_id' => $fti->id,
                    'kategori' => $ad['kategori'],
                    'uraian' => $ad['uraian'],
                    'status' => $ad['status'],
                    'tingkat' => $ad['tingkat'],
                    'periode' => $ad['periode'],
                    'diajukan_at' => Carbon::parse($ad['diajukan_at']),
                ]
            );

            if ($ad['tanggapan']) {
                TanggapanPengaduan::updateOrCreate(
                    ['pengaduan_id' => $pengaduan->id, 'isi' => $ad['tanggapan']],
                    [
                        'NIP' => '198001012005011003',
                        'tipe' => 'jawaban',
                        'dikirim_at' => Carbon::parse($ad['diajukan_at'])->addHours(3),
                    ]
                );
            }
        }

        // 7. Seed Riwayat Pengajuan P1 Unit FTI (L8: FR-18) & Hasil Perhitungan + Amprah (L9 & L11)
        $pengajuanOkt = PengajuanP1::updateOrCreate(
            ['unit_id' => $fti->id, 'periode' => '2026-10'],
            [
                'nomor_pengajuan' => 'P1-FTI-2026-10',
                'pengajuan_ke' => 1,
                'status' => 'diverifikasi',
                'total_remunerasi' => 16950240.00,
                'total_pengurangan' => 3045072.00,
                'total_bruto' => 13905168.00,
                'psk_nama' => 'Prof. Dr. Ir. Dekan FTI',
                'psk_nip' => '197505102000031001',
                'bendahara_nama' => 'Ahmad Bendahara, S.E.',
                'bendahara_nip' => '198204152008011002',
                'diajukan_at' => Carbon::parse('2026-10-06 09:00:00'),
            ]
        );

        $pengajuanAgu = PengajuanP1::updateOrCreate(
            ['unit_id' => $fti->id, 'periode' => '2026-08'],
            [
                'nomor_pengajuan' => 'P1-FTI-2026-08',
                'pengajuan_ke' => 1,
                'status' => 'selesai',
                'total_remunerasi' => 16950240.00,
                'total_pengurangan' => 3045072.00,
                'total_bruto' => 13905168.00,
                'psk_nama' => 'Prof. Dr. Ir. Dekan FTI',
                'psk_nip' => '197505102000031001',
                'bendahara_nama' => 'Ahmad Bendahara, S.E.',
                'bendahara_nip' => '198204152008011002',
                'diajukan_at' => Carbon::parse('2026-09-05 10:00:00'),
            ]
        );

        $pengajuanJul = PengajuanP1::updateOrCreate(
            ['unit_id' => $fti->id, 'periode' => '2026-07'],
            [
                'nomor_pengajuan' => 'P1-FTI-2026-07',
                'pengajuan_ke' => 2,
                'status' => 'selesai',
                'total_remunerasi' => 16950240.00,
                'total_pengurangan' => 3045072.00,
                'total_bruto' => 13905168.00,
                'psk_nama' => 'Prof. Dr. Ir. Dekan FTI',
                'psk_nip' => '197505102000031001',
                'bendahara_nama' => 'Ahmad Bendahara, S.E.',
                'bendahara_nip' => '198204152008011002',
                'diajukan_at' => Carbon::parse('2026-08-05 09:30:00'),
            ]
        );

        RiwayatStatus::updateOrCreate(
            ['pengajuan_id' => $pengajuanJul->id, 'ke_status' => 'dikembalikan'],
            [
                'NIP' => '198204152008011002',
                'dari_status' => 'diajukan',
                'catatan_alasan' => 'Presensi satu pegawai belum sesuai dengan rekap Bidang Kepegawaian. Bendahara memperbaiki dan mengajukan ulang.',
                'dicatat_at' => Carbon::parse('2026-08-05 14:00:00'),
            ]
        );

        RiwayatStatus::updateOrCreate(
            ['pengajuan_id' => $pengajuanJul->id, 'ke_status' => 'disetujui'],
            [
                'NIP' => '198204152008011002',
                'dari_status' => 'diajukan',
                'catatan_alasan' => 'Perbaikan presensi telah diverifikasi dan disetujui.',
                'dicatat_at' => Carbon::parse('2026-08-06 16:40:00'),
            ]
        );

        // Jalankan sinkronisasi HasilPerhitungan & Amprah untuk 10 pegawai sampel L0
        $pjController = new \App\Http\Controllers\PjUnit\PjUnitController();
        $pjController->ujiSilangEngineP1(new \Illuminate\Http\Request(['periode' => '2026-10']));
    }
}
