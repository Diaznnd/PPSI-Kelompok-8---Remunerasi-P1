<?php

namespace Tests\Feature;

use App\Models\Akun;
use App\Models\Jabatan;
use App\Models\Pegawai;
use App\Models\UsulanJabatan;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class KepegawaianApiTest extends TestCase
{
    protected function authenticateKepegawaian(): Akun
    {
        $akun = Akun::where('username', '3')->firstOrFail();
        Sanctum::actingAs($akun, ['*']);
        return $akun;
    }

    protected function authenticatePjUnit(): Akun
    {
        $akun = Akun::where('username', '5')->firstOrFail();
        Sanctum::actingAs($akun, ['*']);
        return $akun;
    }

    public function test_l0_acuan_hitung_manual_10_pegawai_sampel(): void
    {
        $this->authenticateKepegawaian();

        $res = $this->getJson('/api/kepegawaian/acuan-uji-p1');
        $res->assertStatus(200)
            ->assertJsonPath('kode_tugas', 'L0')
            ->assertJsonPath('total_sampel', 10);
    }

    public function test_l1_crud_pegawai_tolak_nip_ganda_dan_tolak_ubah_jabatan_langsung(): void
    {
        $this->authenticateKepegawaian();

        // 1. List pegawai
        $this->getJson('/api/kepegawaian/pegawai')
            ->assertStatus(200)
            ->assertJsonStructure(['unit_kerja', 'total', 'data']);

        // 2. Tolak NIP ganda (FR-03)
        $this->postJson('/api/kepegawaian/pegawai', [
            'NIP' => '198803122015042001',
            'nama' => 'Pegawai Duplikat',
            'email' => 'duplikat@unand.ac.id',
            'jenis' => 'Dosen',
            'status_kepegawaian' => 'PNS',
            'pangkat_golongan' => 'III/b',
        ])->assertStatus(422);

        // 3. Tolak pengisian jabatan/grade langsung dari fitur CRUD pegawai (FR-03)
        $this->postJson('/api/kepegawaian/pegawai', [
            'NIP' => '199705122024011099',
            'nama' => 'Pegawai Coba Set Jabatan',
            'jenis' => 'Dosen',
            'jabatan' => 'Lektor Kepala',
            'grade' => 11,
        ])->assertStatus(422);

        // 4. Tambah pegawai baru valid, lalu ubah, nonaktifkan, dan aktifkan kembali
        Pegawai::where('NIP', '199705122024011088')->delete();

        $this->postJson('/api/kepegawaian/pegawai', [
            'NIP' => '199705122024011088',
            'nama' => 'Ilham Pratama, M.Kom.',
            'email' => 'ilham.pratama@unand.ac.id',
            'jenis' => 'Dosen',
            'status_kepegawaian' => 'CPNS',
            'pangkat_golongan' => 'III/b',
            'tmt' => '2024-01-01',
        ])->assertStatus(201)
          ->assertJsonPath('data.NIP', '199705122024011088');

        // 5. Ubah identitas pegawai valid
        $this->putJson('/api/kepegawaian/pegawai/199705122024011088', [
            'nama' => 'Ilham Pratama, S.Kom., M.Kom.',
            'pangkat_golongan' => 'III/c',
        ])->assertStatus(200)
          ->assertJsonPath('data.nama', 'Ilham Pratama, S.Kom., M.Kom.');

        // 6. Tolak ubah jabatan/grade langsung pada update pegawai (FR-03)
        $this->putJson('/api/kepegawaian/pegawai/199705122024011088', [
            'nama' => 'Ilham Pratama',
            'jabatan' => 'Guru Besar',
        ])->assertStatus(422);

        // 7. Nonaktifkan & Aktifkan kembali pegawai
        $this->patchJson('/api/kepegawaian/pegawai/199705122024011088/nonaktifkan', [
            'alasan' => 'Tugas belajar',
            'keterangan' => 'SK Tugas Belajar 2026',
        ])->assertStatus(200)
          ->assertJsonPath('data.aktif', false);

        $this->patchJson('/api/kepegawaian/pegawai/199705122024011088/aktifkan')
            ->assertStatus(200)
            ->assertJsonPath('data.aktif', true);

        Pegawai::where('NIP', '199705122024011088')->delete();
    }

    public function test_l2_hukuman_disiplin_dan_validasi_tanggal(): void
    {
        $this->authenticateKepegawaian();

        // 1. Tolak rentang tanggal tidak logis: tanggal berakhir < tanggal mulai (FR-06)
        $this->postJson('/api/kepegawaian/hukuman', [
            'NIP' => '198904062019071012',
            'tingkat' => 'Ringan',
            'jenis' => 'Teguran tertulis',
            'nomor_sk' => 'SK-HUKDIS-UJI/2026',
            'tanggal_mulai' => '2026-10-15',
            'tanggal_berakhir' => '2026-10-01',
            'uraian' => 'Pelanggaran jam kerja uji negatif tanggal.',
        ])->assertStatus(422);

        // 1b. Tolak rentang tanggal yang SAMA (tanggal_berakhir == tanggal_mulai) (FR-06)
        $this->postJson('/api/kepegawaian/hukuman', [
            'NIP' => '198904062019071012',
            'tingkat' => 'Ringan',
            'jenis' => 'Teguran tertulis',
            'nomor_sk' => 'SK-HUKDIS-SAMA/2026',
            'tanggal_mulai' => '2026-10-15',
            'tanggal_berakhir' => '2026-10-15',
            'uraian' => 'Pelanggaran jam kerja uji tanggal sama.',
        ])->assertStatus(422);

        // 2. Simpan catatan hukuman disiplin valid
        $nomorSkUnik = 'SK-HUKDIS-VALID/' . uniqid();
        $createRes = $this->postJson('/api/kepegawaian/hukuman', [
            'NIP' => '198904062019071012',
            'tingkat' => 'Ringan',
            'jenis' => 'Teguran lisan',
            'nomor_sk' => $nomorSkUnik,
            'tanggal_mulai' => '2026-05-01',
            'tanggal_berakhir' => '2026-05-31',
            'uraian' => 'Keterlambatan presensi pada bulan berjalan.',
        ]);
        $createRes->assertStatus(201);
        $rawId = $createRes->json('data.raw_id');

        // 3. Tolak update dengan tanggal tidak logis (lebih awal atau tanggal yang sama)
        $this->putJson("/api/kepegawaian/hukuman/{$rawId}", [
            'tanggal_mulai' => '2026-06-10',
            'tanggal_berakhir' => '2026-06-01',
        ])->assertStatus(422);

        $this->putJson("/api/kepegawaian/hukuman/{$rawId}", [
            'tanggal_mulai' => '2026-06-10',
            'tanggal_berakhir' => '2026-06-10',
        ])->assertStatus(422);

        // 4. Update valid
        $this->putJson("/api/kepegawaian/hukuman/{$rawId}", [
            'tanggal_mulai' => '2026-05-01',
            'tanggal_berakhir' => '2026-06-15',
            'uraian' => 'Diperbarui masa berlaku hukuman disiplin.',
        ])->assertStatus(200);
    }

    public function test_l3_dan_l4_impor_presensi_validasi_format_baris_gagal_dan_koreksi(): void
    {
        $this->authenticateKepegawaian();

        // 1. NFR-11: Tolak berkas berformat selain CSV/Excel (misal PDF atau TXT)
        $badFile = UploadedFile::fake()->create('presensi_salah.pdf', 100, 'application/pdf');
        $this->postJson('/api/kepegawaian/presensi/import', [
            'periode' => 'Agustus 2026',
            'file' => $badFile,
        ])->assertStatus(422);

        // 2. L3 (FR-07): Impor presensi berisi baris valid dan baris gagal (NIP tidak terdaftar & jumlah hari salah)
        $csvContent = "NIP,Nama,Hari Kerja,Hadir,Tidak Hadir,Cuti,Izin,Sakit\n"
            . "198803122015042001,Dr. Rina Maharani,22,21,0,0,0,1\n"
            . "999999999999999999,Pegawai Tidak Terdaftar,22,22,0,0,0,0\n"
            . "198904062019071012,Fikri Ananda,22,20,5,0,0,0\n";

        $csvFile = UploadedFile::fake()->createWithContent('presensi_agustus_2026.csv', $csvContent);

        $importRes = $this->postJson('/api/kepegawaian/presensi/import', [
            'periode' => 'Agustus 2026',
            'file' => $csvFile,
        ]);

        $importRes->assertStatus(201)
            ->assertJsonPath('report.jumlah_valid', 1)
            ->assertJsonPath('report.jumlah_gagal', 2);

        $reportId = $importRes->json('report.id');

        // 3. L4 (FR-07): Koreksi baris presensi yang gagal (memperbaiki NIP salah ketik & jumlah hari)
        $this->putJson("/api/kepegawaian/presensi/baris-gagal/{$reportId}/0", [
            'NIP' => '198710082016041002',
            'hari_kerja' => 22,
            'hadir' => 22,
            'tidak_hadir' => 0,
            'cuti' => 0,
            'alasan' => 'Koreksi NIP salah ketik menjadi NIP Andi Pratama',
        ])->assertStatus(200)
          ->assertJsonPath('sisa_baris_gagal', 1);

        $this->putJson("/api/kepegawaian/presensi/baris-gagal/{$reportId}/0", [
            'NIP' => '198904062019071012',
            'hari_kerja' => 22,
            'hadir' => 20,
            'tidak_hadir' => 2,
            'cuti' => 0,
            'alasan' => 'Koreksi jumlah tidak hadir dari 5 menjadi 2 hari',
        ])->assertStatus(200)
          ->assertJsonPath('sisa_baris_gagal', 0);
    }

    public function test_l5_dan_l6_usulan_perubahan_jabatan_dan_unggah_dokumen_pdf_maks_5mb(): void
    {
        Storage::fake('public');
        $this->authenticateKepegawaian();

        // 1. L5 (FR-04): Tolak pemilihan jabatan di luar daftar master UPT Remunerasi (FR-30)
        $this->postJson('/api/kepegawaian/usulan', [
            'NIP' => '198904062019071012',
            'jabatan_baru' => 'Jabatan Fiktif Non Master',
            'grade_baru' => 99,
            'jenis_perubahan' => 'promosi',
            'tanggal_berlaku' => '2026-11-01',
            'alasan' => 'Uji negatif jabatan di luar master.',
        ])->assertStatus(422);

        // 2. L6 (FR-05, NFR-11): Tolak dokumen non-PDF dan dokumen > 5 MB
        $jabatanLektor = Jabatan::where('nama_jabatan', 'Lektor')->firstOrFail();
        $nonPdf = UploadedFile::fake()->create('SK_Bukan_PDF.docx', 200, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        $oversizePdf = UploadedFile::fake()->create('SK_Terlalu_Besar.pdf', 6000, 'application/pdf'); // 6 MB > 5 MB

        $this->postJson('/api/kepegawaian/usulan', [
            'NIP' => '198904062019071012',
            'jabatan_id' => $jabatanLektor->id,
            'jenis_perubahan' => 'promosi',
            'tanggal_berlaku' => '2026-11-01',
            'dokumen_sk' => $nonPdf,
        ])->assertStatus(422);

        $this->postJson('/api/kepegawaian/usulan', [
            'NIP' => '198904062019071012',
            'jabatan_id' => $jabatanLektor->id,
            'jenis_perubahan' => 'promosi',
            'tanggal_berlaku' => '2026-11-01',
            'dokumen_sk' => $oversizePdf,
        ])->assertStatus(422);

        // 3. L5 & L6: Buat usulan valid dengan PDF SK & SPMT <= 5 MB; pastikan berstatus 'diajukan'
        $validSk = UploadedFile::fake()->create('SK_Valid.pdf', 1024, 'application/pdf');
        $validSpmt = UploadedFile::fake()->create('SPMT_Valid.pdf', 800, 'application/pdf');

        $storeRes = $this->postJson('/api/kepegawaian/usulan', [
            'NIP' => '199001152018022005',
            'jabatan_id' => $jabatanLektor->id,
            'jenis_perubahan' => 'promosi',
            'tanggal_berlaku' => '2026-12-01',
            'alasan' => 'Kenaikan jabatan sesuai SK dan SPMT.',
            'dokumen_sk' => $validSk,
            'dokumen_spmt' => $validSpmt,
        ]);

        $storeRes->assertStatus(201)
            ->assertJsonPath('usulan.status', 'diajukan');

        $usulanId = $storeRes->json('usulan.id');
        $dokumenSkId = $storeRes->json('usulan.dokumen.id');

        // 4. L6 (FR-05): Buka/unduh kembali dokumen PDF yang terkait dengan usulan
        $this->get("/api/kepegawaian/dokumen/{$dokumenSkId}")
            ->assertStatus(200);

        // 5. L5 (FR-04): Ajukan ulang usulan yang berstatus 'dikembalikan'
        $usulanDikembalikan = UsulanJabatan::where('status', 'dikembalikan')->first();
        if ($usulanDikembalikan) {
            $this->putJson("/api/kepegawaian/usulan/{$usulanDikembalikan->id}", [
                'tanggal_berlaku' => '2026-11-01',
                'catatan' => 'Tanggal mulai berlaku telah disesuaikan dengan SPMT (1 November 2026).',
            ])->assertStatus(200)
              ->assertJsonPath('usulan.status', 'diajukan');

            // Kembalikan status seed agar tetap konsisten untuk demo UI
            $usulanDikembalikan->update([
                'status' => 'dikembalikan',
                'catatan_verifikator' => 'Tanggal mulai berlaku pada usulan (1 Oktober 2026) tidak sesuai SPMT yang terlampir (1 November 2026). Mohon sesuaikan tanggal lalu ajukan ulang.',
            ]);
        }

        // Bersihkan usulan uji
        UsulanJabatan::where('id', $usulanId)->delete();
    }

    public function test_l7_pj_unit_daftar_pegawai_dan_jabatan_hanya_baca(): void
    {
        $this->authenticatePjUnit();

        $res = $this->getJson('/api/pj-unit/pegawai');
        $res->assertStatus(200)
            ->assertJsonPath('unit', 'Fakultas Teknologi Informasi')
            ->assertJsonPath('readonly', true)
            ->assertJsonStructure(['unit', 'readonly', 'total', 'distribusi_grade', 'data']);

        // Uji filter pencarian & grade
        $this->getJson('/api/pj-unit/pegawai?q=Rina&grade=11')
            ->assertStatus(200)
            ->assertJsonPath('readonly', true);
    }

    public function test_l8_pj_unit_status_pengajuan_unit_hanya_baca(): void
    {
        $this->authenticatePjUnit();

        $res = $this->getJson('/api/pj-unit/status');
        $res->assertStatus(200)
            ->assertJsonPath('unit', 'Fakultas Teknologi Informasi')
            ->assertJsonPath('readonly', true)
            ->assertJsonStructure(['unit', 'readonly', 'data']);

        // Pastikan hanya pengajuan unit FTI yang tampil (Isolasi Unit)
        $data = $res->json('data');
        $this->assertNotEmpty($data);
        foreach ($data as $item) {
            $this->assertStringStartsWith('P1-FTI-', $item['nomor_pengajuan']);
        }
    }

    public function test_l9_pj_unit_rekapitulasi_unit_hanya_baca_dan_ekspor(): void
    {
        $this->authenticatePjUnit();

        $res = $this->getJson('/api/pj-unit/rekapitulasi?periode=Oktober%202026');
        $res->assertStatus(200)
            ->assertJsonPath('readonly', true)
            ->assertJsonPath('unit.nama', 'Fakultas Teknologi Informasi')
            ->assertJsonStructure([
                'unit',
                'periode',
                'readonly',
                'ringkasan' => ['pegawai', 'remP1', 'pengurangan', 'bruto', 'pajak', 'netto'],
                'tren_bulanan',
                'komposisi_potongan',
                'data',
            ]);

        // Uji ekspor CSV rekapitulasi sama dengan data tampilan
        $exportRes = $this->get('/api/pj-unit/rekapitulasi/export?periode=Oktober%202026');
        $exportRes->assertStatus(200);
    }

    public function test_l10_unit_test_modul_uji_pj_tidak_bisa_mengubah_data(): void
    {
        $this->authenticatePjUnit();

        // 1. Mencoba mengubah/menambah/menghapus melalui endpoint PJ Unit -> Wajib ditolak (403)
        $this->postJson('/api/pj-unit/pegawai', ['NIP' => '199901012025011001', 'nama' => 'Coba Tambah'])->assertStatus(403);
        $this->putJson('/api/pj-unit/pegawai/198803122015042001', ['nama' => 'Coba Ubah'])->assertStatus(403);
        $this->deleteJson('/api/pj-unit/pegawai/198803122015042001')->assertStatus(403);
        $this->postJson('/api/pj-unit/status', ['status' => 'disetujui'])->assertStatus(403);
        $this->putJson('/api/pj-unit/rekapitulasi', ['bruto' => 999999999])->assertStatus(403);

        // 2. Mencoba mengubah data melalui endpoint Kepegawaian menggunakan akun PJ Unit -> Wajib ditolak (403)
        $this->postJson('/api/kepegawaian/pegawai', [
            'NIP' => '199901012025011001',
            'nama' => 'Pegawai Ilegal dari PJ Unit',
            'jenis' => 'Dosen',
        ])->assertStatus(403);
        $this->putJson('/api/kepegawaian/pegawai/198803122015042001', ['nama' => 'Ubah Ilegal'])->assertStatus(403);
        $this->patchJson('/api/kepegawaian/pegawai/198803122015042001/nonaktifkan', ['alasan' => 'Pensiun'])->assertStatus(403);
        $this->postJson('/api/kepegawaian/hukuman', ['NIP' => '198803122015042001'])->assertStatus(403);
        $this->postJson('/api/kepegawaian/presensi/import', ['periode' => 'Oktober 2026'])->assertStatus(403);
        $this->postJson('/api/kepegawaian/usulan', ['NIP' => '198803122015042001'])->assertStatus(403);

        // 3. Mencoba mengubah perhitungan P1 melalui endpoint Bendahara menggunakan akun PJ Unit -> Wajib ditolak (403)
        $this->postJson('/api/bendahara/hitung', ['periode' => '2026-10'])->assertStatus(403);
        $this->putJson('/api/bendahara/koreksi-presensi/198803122015042001', ['periode' => '2026-10'])->assertStatus(403);
        $this->postJson('/api/bendahara/ajukan', ['periode' => '2026-10'])->assertStatus(403);

        // 4. Mencoba mengubah master data milik UPT Remunerasi menggunakan akun PJ Unit -> Wajib ditolak (403)
        $this->putJson('/api/upt-remunerasi/master/grade/1', ['nilai' => 9999999])->assertStatus(403);
    }

    public function test_l11_uji_silang_engine_d8_vs_sampel_l0_dan_total_amprah_sama_dengan_jumlah_netto(): void
    {
        $this->authenticatePjUnit();

        $res = $this->getJson('/api/pj-unit/uji-silang-p1?periode=2026-10');
        $res->assertStatus(200)
            ->assertJsonPath('kode_tugas', 'L11')
            ->assertJsonPath('total_sampel_diuji', 10)
            ->assertJsonPath('seluruh_sampel_cocok', true)
            ->assertJsonPath('verifikasi_amprah.amprah_sama_dengan_jumlah_netto', true)
            ->assertJsonPath('verifikasi_amprah.selisih_amprah_vs_netto', 0);

        $perbandingan = $res->json('perbandingan_per_pegawai');
        $this->assertCount(10, $perbandingan);
        foreach ($perbandingan as $baris) {
            $this->assertTrue($baris['cocok'], "Perhitungan engine D8 tidak cocok dengan hitung manual L0 untuk NIP {$baris['NIP']} ({$baris['nama']})");
            $this->assertEquals($baris['manual_l0']['p1_bruto'], $baris['engine_d8']['p1_bruto']);
            $this->assertEquals($baris['manual_l0']['pajak_pph21'], $baris['engine_d8']['pajak_pph21']);
            $this->assertEquals($baris['manual_l0']['p1_netto'], $baris['engine_d8']['p1_netto']);
        }

        // Pastikan total Netto pada Amprah sama persis dengan jumlah Netto 10 pegawai sampel (Rp 13.209.910)
        $this->assertEquals(13209910, $res->json('verifikasi_amprah.total_netto_amprah'));
        $this->assertEquals(13209910, $res->json('verifikasi_amprah.jumlah_netto_pegawai'));
    }
}
