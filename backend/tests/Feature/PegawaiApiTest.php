<?php

namespace Tests\Feature;

use App\Models\Akun;
use App\Models\AuditLog;
use App\Models\HasilPerhitungan;
use App\Models\Pegawai;
use App\Models\Pengaduan;
use App\Models\TanggapanPengaduan;
use App\Models\UnitKerja;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PegawaiApiTest extends TestCase
{
    use DatabaseTransactions;
    protected function authenticatePegawaiRina(): Akun
    {
        $akun = Akun::where('username', '1')->first();
        if (!$akun) {
            $akun = Akun::create([
                'username' => '1',
                'password' => bcrypt('1'),
                'peran' => 'pegawai',
                'NIP' => '198803122015042001',
                'aktif' => true,
            ]);
        }
        Sanctum::actingAs($akun, ['*']);
        return $akun;
    }

    protected function authenticatePegawaiTubel(): Akun
    {
        $akun = Akun::where('username', 'pegawai.tubel')->first();
        if (!$akun) {
            $akun = Akun::create([
                'username' => 'pegawai.tubel',
                'password' => bcrypt('password'),
                'peran' => 'pegawai',
                'NIP' => '199202152019031002',
                'aktif' => true,
            ]);
        }
        Sanctum::actingAs($akun, ['*']);
        return $akun;
    }

    /**
     * FR-41 & FR-42: Login dan Logout Pegawai
     */
    public function test_fr41_dan_fr42_login_logout_pegawai(): void
    {
        $resLogin = $this->postJson('/api/login', [
            'username' => '1',
            'password' => '1',
        ]);
        $resLogin->assertStatus(200)
            ->assertJsonPath('akun.peran', 'pegawai');

        $token = $resLogin->json('token');
        $this->assertNotEmpty($token);

        // Akses profil pegawai
        $resProfil = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/pegawai/profil');
        $resProfil->assertStatus(200);

        // Logout
        $resLogout = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/logout');
        $resLogout->assertStatus(200);
    }

    /**
     * FR-43: Melihat Slip P1 Milik Sendiri & Tolak Akses Slip Pegawai Lain (NFR-04)
     */
    public function test_fr43_lihat_slip_sendiri_dan_tolak_akses_slip_pegawai_lain(): void
    {
        // 1. Buat data slip untuk Pegawai Rina (NIP: 198803122015042001)
        $slipRina = HasilPerhitungan::create([
            'NIP' => '198803122015042001',
            'periode' => '2026-10',
            'nilai_jabatan' => 6285000,
            'pir' => 3000,
            'persen_p1' => 40,
            'p1_gross' => 2514000,
            'persen_status' => 100,
            'p1_pertimbang' => 2514000,
            'p1_setelah_potongan' => 2488860,
            'pajak_pph21' => 124443,
            'p1_netto' => 2364417,
        ]);

        // 2. Buat data slip untuk Pegawai Lain (Rudi - NIP: 199202152019031002)
        $slipRudi = HasilPerhitungan::create([
            'NIP' => '199202152019031002',
            'periode' => '2026-10',
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

        // Login sebagai Pegawai Rina
        $this->authenticatePegawaiRina();

        // 3. Pegawai Rina melihat daftar slip miliknya -> Berhasil (200)
        $resList = $this->getJson('/api/pegawai/slip');
        $resList->assertStatus(200);

        // 4. Pegawai Rina melihat detail slip miliknya -> Berhasil (200)
        $resDetail = $this->getJson("/api/pegawai/slip/{$slipRina->id}");
        $resDetail->assertStatus(200)
            ->assertJsonPath('data.pegawai.NIP', '198803122015042001');

        // 5. Pegawai Rina mengunduh PDF slip miliknya -> Berhasil (200)
        $resDownload = $this->getJson("/api/pegawai/slip/{$slipRina->id}/pdf");
        $resDownload->assertStatus(200);

        // 6. UJI KEBERHASILAN FR-43 & NFR-04:
        // Pegawai Rina mencoba mengakses detail slip milik Pegawai Rudi -> Wajib Ditolak (403 Forbidden)
        $resIlegal = $this->getJson("/api/pegawai/slip/{$slipRudi->id}");
        $resIlegal->assertStatus(403);

        // 7. Pegawai Rina mencoba mengunduh PDF slip milik Pegawai Rudi -> Wajib Ditolak (403 Forbidden)
        $resDownloadIlegal = $this->getJson("/api/pegawai/slip/{$slipRudi->id}/pdf");
        $resDownloadIlegal->assertStatus(403);
    }

    /**
     * FR-44: Mengajukan Pengaduan Baru, Lihat Detail, dan Balas Pesan Utas
     */
    public function test_fr44_mengajukan_pengaduan_dan_interaksi_utas(): void
    {
        $this->authenticatePegawaiRina();

        // 1. Mengajukan pengaduan baru dengan kategori, uraian, dan periode
        $resStore = $this->postJson('/api/pegawai/pengaduan', [
            'kategori' => 'Kesalahan perhitungan',
            'periode' => 'Oktober 2026',
            'judul' => 'Potongan Cuti Sakit Tidak Sesuai Surat Dokter',
            'uraian' => 'Surat keterangan sakit telah diserahkan namun tetap dipotong sebagai ketidakhadiran tanpa keterangan.',
        ]);

        $resStore->assertStatus(201)
            ->assertJsonPath('data.status', 'Diajukan');

        $pengaduanId = $resStore->json('data.id');
        $this->assertNotNull($pengaduanId);

        // Pastikan tersimpan di DB dengan status awal 'Diajukan'
        $this->assertDatabaseHas('pengaduan', [
            'id' => $pengaduanId,
            'NIP' => '198803122015042001',
            'status' => 'Diajukan',
        ]);

        // 2. Melihat detail pengaduan sendiri beserta linimasa dan riwayat percakapan
        $resDetail = $this->getJson("/api/pegawai/pengaduan/{$pengaduanId}");
        $resDetail->assertStatus(200)
            ->assertJsonPath('data.status', 'Diajukan')
            ->assertJsonStructure(['data' => ['id', 'nomor', 'kategori', 'uraian', 'percacapan', 'riwayat_status']]);

        // 3. Mengirim balasan pesan / tanggapan dalam utas pengaduan via endpoint /tanggapan dan /pesan
        $resBalas = $this->postJson("/api/pegawai/pengaduan/{$pengaduanId}/tanggapan", [
            'teks' => 'Berikut kami konfirmasikan bahwa surat dokter sudah diunggah ke portal unit.',
        ]);
        $resBalas->assertStatus(201);

        $resBalasPesan = $this->postJson("/api/pegawai/pengaduan/{$pengaduanId}/pesan", [
            'pesan' => 'Tambahan keterangan via endpoint pesan.',
        ]);
        $resBalasPesan->assertStatus(201);

        $this->assertDatabaseHas('tanggapan_pengaduan', [
            'pengaduan_id' => $pengaduanId,
            'NIP' => '198803122015042001',
        ]);
    }

    /**
     * FR-44: Tolak Akses Pegawai Lain Melihat & Membalas Pengaduan Orang Lain (Isolasi Data NFR-04)
     */
    public function test_fr44_tolak_akses_pengaduan_milik_pegawai_lain(): void
    {
        // 1. Buat pengaduan milik Pegawai Rina
        $pengaduanRina = Pengaduan::create([
            'NIP' => '198803122015042001',
            'unit_id' => 1,
            'kategori' => 'Slip P1',
            'periode' => 'Oktober 2026',
            'judul' => 'Pengaduan Privat Rina',
            'uraian' => 'Pengaduan rahasia terkait gaji pribadi.',
            'status' => 'Diajukan',
            'tingkat' => 'unit',
            'diajukan_at' => now(),
        ]);

        // 2. Login sebagai Pegawai Lain (Rudi Tubel)
        $this->authenticatePegawaiTubel();

        // 3. Pegawai Rudi mencoba melihat pengaduan milik Rina -> Wajib Ditolak (403 Forbidden)
        $resLihatIlegal = $this->getJson("/api/pegawai/pengaduan/{$pengaduanRina->id}");
        $resLihatIlegal->assertStatus(403);

        // 4. Pegawai Rudi mencoba membalas tiket pengaduan milik Rina -> Wajib Ditolak (403 Forbidden)
        $resBalasIlegal = $this->postJson("/api/pegawai/pengaduan/{$pengaduanRina->id}/tanggapan", [
            'teks' => 'Mencoba membalas tiket orang lain secara ilegal.',
        ]);
        $resBalasIlegal->assertStatus(403);
    }
}
