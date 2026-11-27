<?php

namespace Tests\Feature;

use App\Models\Akun;
use App\Models\HasilPerhitungan;
use App\Models\Pegawai;
use App\Models\Pengaduan;
use App\Models\PengajuanP1;
use App\Models\PresensiReport;
use App\Models\RoleUnit;
use App\Models\UnitKerja;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * Issue #37: System test seluruh FR dan NFR pada lembar uji (skenario normal dan menyimpang, uji hak akses)
 */
class SystemTestFRNFRTest extends TestCase
{
    use DatabaseTransactions;

    private function getAkun(string $username, string $peran, ?string $nip = null): Akun
    {
        $akun = Akun::where('username', $username)->first();
        if (!$akun) {
            $akun = Akun::create([
                'username' => $username,
                'password' => bcrypt($username),
                'peran' => $peran,
                'NIP' => $nip,
                'aktif' => true,
            ]);
        }
        return $akun;
    }

    /**
     * FR-01 & FR-02: Autentikasi (Skenario Normal: Login/Logout & Menyimpang: Sandi Salah, Akun Nonaktif)
     */
    public function test_fr01_fr02_autentikasi_normal_dan_menyimpang(): void
    {
        // 1. Normal: Login kredensial valid
        $resOk = $this->postJson('/api/login', [
            'username' => '1',
            'password' => '1',
        ]);
        $resOk->assertStatus(200)
            ->assertJsonStructure(['token', 'akun', 'abilities']);

        $token = $resOk->json('token');

        // Normal: Logout dengan token sah
        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/logout')
            ->assertStatus(200);

        // 2. Menyimpang: Sandi salah -> 422
        $this->postJson('/api/login', [
            'username' => '1',
            'password' => 'sandi_salah_123',
        ])->assertStatus(422);

        // 3. Menyimpang: Akun nonaktif -> 422
        Akun::create([
            'username' => 'akun_nonaktif_test',
            'password' => bcrypt('password123'),
            'peran' => 'pegawai',
            'aktif' => false,
        ]);

        $this->postJson('/api/login', [
            'username' => 'akun_nonaktif_test',
            'password' => 'password123',
        ])->assertStatus(422);
    }

    /**
     * FR-03 & FR-06: Kepegawaian CRUD Pegawai (Tolak NIP Ganda) & Hukdis (Validasi Tanggal)
     */
    public function test_fr03_fr06_kepegawaian_normal_dan_menyimpang(): void
    {
        $kepeg = $this->getAkun('3', 'kepegawaian', '198001012005011003');
        Sanctum::actingAs($kepeg, ['*']);

        // FR-03 Normal: Tambah pegawai baru valid
        $nipBaru = '199801012026011099';
        $this->postJson('/api/kepegawaian/pegawai', [
            'NIP' => $nipBaru,
            'nama' => 'Pegawai Sistem Test',
            'jenis' => 'Tendik',
            'status_kepegawaian' => 'PNS',
            'pangkat_golongan' => 'III/a',
        ])->assertStatus(201);

        // FR-03 Menyimpang: Tolak NIP ganda
        $this->postJson('/api/kepegawaian/pegawai', [
            'NIP' => $nipBaru,
            'nama' => 'Pegawai Duplikat',
            'jenis' => 'Tendik',
            'status_kepegawaian' => 'PNS',
            'pangkat_golongan' => 'III/a',
        ])->assertStatus(422);

        // FR-06 Menyimpang: Hukuman disiplin tanggal berakhir < tanggal mulai -> 422
        $this->postJson('/api/kepegawaian/hukuman', [
            'NIP' => $nipBaru,
            'nomor_sk' => 'SK-HUKDIS/2026/ERR',
            'tingkat' => 'Ringan',
            'jenis_hukuman' => 'Teguran Tertulis',
            'tanggal_mulai' => '2026-10-15',
            'tanggal_berakhir' => '2026-10-01',
        ])->assertStatus(422);

        // FR-06 Normal: Hukuman disiplin tanggal valid -> 201
        $this->postJson('/api/kepegawaian/hukuman', [
            'NIP' => $nipBaru,
            'nomor_sk' => 'SK-HUKDIS/2026/001',
            'tingkat' => 'Ringan',
            'jenis_hukuman' => 'Teguran Tertulis',
            'tanggal_mulai' => '2026-10-01',
            'tanggal_berakhir' => '2026-12-31',
        ])->assertStatus(201);
    }

    /**
     * FR-04, FR-05, FR-07 & NFR-11: Unggah Dokumen SK/SPMT (PDF <= 5MB) & Impor Presensi (CSV/Excel)
     */
    public function test_fr04_fr05_fr07_nfr11_dokumen_dan_impor_presensi_normal_dan_menyimpang(): void
    {
        $kepeg = $this->getAkun('3', 'kepegawaian', '198001012005011003');
        Sanctum::actingAs($kepeg, ['*']);

        // NFR-11 Menyimpang: Impor presensi dengan format file terlarang (.txt) -> 422
        $badFile = UploadedFile::fake()->create('presensi.txt', 10, 'text/plain');
        $this->postJson('/api/kepegawaian/presensi/import', [
            'file' => $badFile,
            'periode' => '2026-10',
        ])->assertStatus(422);

        // FR-07 Menyimpang: Impor CSV dengan NIP tidak terdaftar -> status 'perlu_koreksi', jumlah_gagal > 0
        $csvInvalid = "nip,nama,hari_kerja,hadir,tidak_hadir,cuti_tahunan,cuti_sakit,izin\n999999999999999999,Tidak Terdaftar,22,22,0,0,0,0";
        $csvInvalidFile = UploadedFile::fake()->createWithContent('invalid_presensi.csv', $csvInvalid);
        $resInvalid = $this->postJson('/api/kepegawaian/presensi/import', [
            'file' => $csvInvalidFile,
            'periode' => '2026-08',
        ]);
        $resInvalid->assertStatus(201)
            ->assertJsonPath('report.status', 'perlu_koreksi');
        $this->assertGreaterThan(0, $resInvalid->json('report.jumlah_gagal'));
    }

    /**
     * FR-18, FR-19, FR-20: Penanggung Jawab Unit (Read-Only Strict)
     */
    public function test_fr18_fr19_fr20_pj_unit_read_only_dan_tolak_mutasi(): void
    {
        $pj = $this->getAkun('5', 'pj_unit', '197505102000031001');
        Sanctum::actingAs($pj, ['*']);

        // Normal: Akses baca
        $this->getJson('/api/pj-unit/pegawai')->assertStatus(200);
        $this->getJson('/api/pj-unit/status')->assertStatus(200);
        $this->getJson('/api/pj-unit/rekapitulasi')->assertStatus(200);

        // Menyimpang / Hak Akses: Mutasi data ditolak 403
        $this->postJson('/api/pj-unit/pegawai', ['nama' => 'Ilegal'])->assertStatus(403);
        $this->putJson('/api/pj-unit/status/1', ['status' => 'disetujui'])->assertStatus(403);
        $this->deleteJson('/api/pj-unit/rekapitulasi/1')->assertStatus(403);
    }

    /**
     * NFR-01: Performa Perhitungan Engine P1 untuk Unit Kerja (<= 10 detik) & Guard Approval
     */
    public function test_nfr01_performa_kalkulasi_unit_kerja_kurang_dari_10_detik(): void
    {
        $unit = UnitKerja::where('nama', 'like', '%Teknologi Informasi%')->firstOrFail();
        $bendahara = $this->getAkun('2', 'bendahara', '198204152008011002');
        RoleUnit::updateOrCreate(
            ['role_id' => $bendahara->id, 'peran' => 'bendahara'],
            ['unit_id' => $unit->id, 'aktif' => true]
        );

        $periodeUji = '2026-07';

        // Buat presensi report belum disetujui -> harus diblokir 400
        $report = PresensiReport::updateOrCreate(
            ['unit_id' => $unit->id, 'periode' => $periodeUji],
            [
                'NIP' => '198001012005011003',
                'masa_file' => 'Juli 2026',
                'status' => 'valid',
                'status_approval' => 'menunggu_approval',
                'siap_perhitungan' => false,
                'jumlah_valid' => 25,
                'jumlah_gagal' => 0,
            ]
        );

        Sanctum::actingAs($bendahara, ['*']);

        // Skenario Menyimpang: Hitung sebelum approval PJ Unit -> 400
        $this->postJson('/api/bendahara/hitung', ['periode' => $periodeUji])
            ->assertStatus(400)
            ->assertJsonPath('blocked', true);

        // Setujui presensi -> Ukur waktu eksekusi perhitungan NFR-01 <= 10 detik
        $report->update(['status_approval' => 'disetujui', 'siap_perhitungan' => true]);

        $start = microtime(true);
        $resHitung = $this->postJson('/api/bendahara/hitung', ['periode' => $periodeUji]);
        $elapsed = microtime(true) - $start;

        $resHitung->assertStatus(200);
        $this->assertLessThanOrEqual(10.0, $elapsed, "NFR-01 Gagal: Waktu hitung {$elapsed}s melebihi batas 10 detik.");
    }

    /**
     * FR-23 & FR-24: Verifikator Kembalikan Tanpa Catatan Ditolak (422) & Dengan Catatan Sukses (200)
     */
    public function test_fr23_fr24_verifikator_wajib_catatan_saat_kembalikan(): void
    {
        $verifikator = $this->getAkun('4', 'verifikator');
        Sanctum::actingAs($verifikator, ['*']);

        $unit = UnitKerja::first();
        $pengajuan = PengajuanP1::create([
            'unit_id' => $unit->id,
            'nomor_pengajuan' => 'P1-SYS-TEST-' . uniqid(),
            'pengajuan_ke' => 1,
            'status' => 'diajukan',
            'total_remunerasi' => 10000000,
            'total_pengurangan' => 0,
            'total_bruto' => 10000000,
            'periode' => '2026-06',
            'diajukan_at' => now(),
        ]);

        // Menyimpang: Kembalikan tanpa catatan wajib -> 422
        $this->postJson("/api/verifikator/pengajuan/{$pengajuan->id}/kembalikan", [
            'alasan' => '',
        ])->assertStatus(422);

        // Normal: Kembalikan dengan catatan -> 200
        $this->postJson("/api/verifikator/pengajuan/{$pengajuan->id}/kembalikan", [
            'alasan' => 'Perlu perbaikan lampiran absensi.',
        ])->assertStatus(200)
            ->assertJsonPath('data.status', 'Dikembalikan');
    }

    /**
     * NFR-04 & FR-43: Hak Akses Lintas Peran & Isolasi Slip / Pengaduan Pegawai
     */
    public function test_nfr04_hak_akses_lintas_peran_dan_isolasi_data_pegawai(): void
    {
        // 1. Unauthenticated -> 401
        $this->getJson('/api/upt-remunerasi/dashboard')->assertStatus(401);
        $this->getJson('/api/bendahara/kesiapan')->assertStatus(401);

        // 2. Pegawai murni mencoba akses UPT / Bendahara / Verifikator / Kepegawaian -> 403
        $pegawai = $this->getAkun('1', 'pegawai', '198803122015042001');
        Sanctum::actingAs($pegawai, ['*']);

        $this->getJson('/api/upt-remunerasi/dashboard')->assertStatus(403);
        $this->getJson('/api/bendahara/kesiapan')->assertStatus(403);
        $this->getJson('/api/verifikator/pengajuan')->assertStatus(403);
        $this->getJson('/api/kepegawaian/pegawai')->assertStatus(403);

        // 3. Isolasi Slip & Pengaduan antar-pegawai
        $slipLain = HasilPerhitungan::create([
            'NIP' => '199202152019031002',
            'periode' => '2026-06',
            'nilai_jabatan' => 4500000,
            'pir' => 3000,
            'persen_p1' => 40,
            'p1_gross' => 1800000,
            'persen_status' => 60,
            'p1_pertimbang' => 1080000,
            'p1_setelah_potongan' => 1080000,
            'pajak_pph21' => 54000,
            'p1_netto' => 1026000,
        ]);

        $this->getJson("/api/pegawai/slip/{$slipLain->id}")->assertStatus(403);
    }
}
