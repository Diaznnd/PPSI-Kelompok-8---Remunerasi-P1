<?php

namespace Tests\Feature;

use App\Models\Akun;
use App\Models\AuditLog;
use App\Models\Grade;
use App\Models\HasilPerhitungan;
use App\Models\Jabatan;
use App\Models\Pegawai;
use App\Models\PengajuanP1;
use App\Models\RiwayatStatus;
use App\Models\UnitKerja;
use App\Models\UsulanJabatan;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class VerifikatorApiTest extends TestCase
{
    use DatabaseTransactions;
    protected function authenticateVerifikator(): Akun
    {
        $akun = Akun::where('username', '4')->first();
        if (!$akun) {
            $akun = Akun::create([
                'username' => '4',
                'password' => bcrypt('4'),
                'peran' => 'verifikator',
                'aktif' => true,
            ]);
        }
        Sanctum::actingAs($akun, ['*']);
        return $akun;
    }

    protected function setupPengajuanUji(): PengajuanP1
    {
        $fti = UnitKerja::firstOrCreate(['nama' => 'Fakultas Teknologi Informasi'], ['jenis' => 'Fakultas', 'aktif' => true]);

        return PengajuanP1::create([
            'unit_id' => $fti->id,
            'nomor_pengajuan' => 'P1-2026-09-FTI-TEST-' . uniqid(),
            'pengajuan_ke' => 1,
            'status' => 'diajukan',
            'total_remunerasi' => 51000000,
            'total_pengurangan' => 750000,
            'total_bruto' => 50250000,
            'bendahara_nama' => 'Maya Sari, S.E.',
            'bendahara_nip' => '198204152008011002',
            'periode' => 'September 2026',
            'diajukan_at' => now(),
        ]);
    }

    protected function setupUsulanUji(): UsulanJabatan
    {
        $fti = UnitKerja::firstOrCreate(['nama' => 'Fakultas Teknologi Informasi'], ['jenis' => 'Fakultas', 'aktif' => true]);
        $pegawai = Pegawai::firstOrCreate(
            ['NIP' => '198803122015042001'],
            ['nama' => 'Dr. Rina Maharani, M.T.', 'unit_id' => $fti->id, 'jenis' => 'Dosen', 'status_kepegawaian' => 'PNS', 'aktif' => true]
        );

        $grade10 = Grade::firstOrCreate(['kode_grade' => 'Grade 10'], ['nilai' => 5232000]);
        $grade11 = Grade::firstOrCreate(['kode_grade' => 'Grade 11'], ['nilai' => 6285000]);

        $jabatanLama = Jabatan::firstOrCreate(['nama_jabatan' => 'Lektor'], ['kode_id' => $grade10->id]);
        $jabatanBaru = Jabatan::firstOrCreate(['nama_jabatan' => 'Lektor Kepala'], ['kode_id' => $grade11->id]);

        return UsulanJabatan::create([
            'NIP' => $pegawai->NIP,
            'unit_id' => $fti->id,
            'jabatan_id' => $jabatanBaru->id,
            'jenis_perubahan' => 'Promosi jabatan fungsional',
            'status' => 'diajukan',
            'tanggal_berlaku' => '2026-10-01',
            'diajukan_at' => now(),
        ]);
    }

    /**
     * FR-21 & FR-22: Login & Logout Verifikator
     */
    public function test_fr21_dan_fr22_login_logout_verifikator(): void
    {
        // Login berhasil dengan akun Verifikator (username 4 / password 4)
        $resLogin = $this->postJson('/api/login', [
            'username' => '4',
            'password' => '4',
        ]);
        $resLogin->assertStatus(200)
            ->assertJsonPath('akun.peran', 'verifikator');

        $token = $resLogin->json('token');
        $this->assertNotEmpty($token);

        // Akses endpoint beranda verifikator dengan token
        $resDashboard = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/verifikator/dashboard');
        $resDashboard->assertStatus(200)
            ->assertJsonStructure(['statistik', 'antrean', 'jadwal_tahapan']);

        // Logout
        $resLogout = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/logout');
        $resLogout->assertStatus(200);
    }

    /**
     * FR-23: Memverifikasi Pengajuan P1 - List & Detail Pemeriksaan
     */
    public function test_fr23_list_dan_detail_pemeriksaan_pengajuan(): void
    {
        $this->authenticateVerifikator();
        $pengajuan = $this->setupPengajuanUji();

        // 1. List pengajuan
        $resList = $this->getJson('/api/verifikator/pengajuan');
        $resList->assertStatus(200)
            ->assertJsonStructure(['total', 'data']);

        // 2. Detail pemeriksaan pengajuan
        $resDetail = $this->getJson("/api/verifikator/pengajuan/{$pengajuan->id}");
        $resDetail->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'unit',
                    'periode',
                    'ringkasan_validasi',
                    'daftar_periksa',
                    'pegawai',
                    'riwayat',
                ],
            ]);
    }

    /**
     * FR-23: Memverifikasi Pengajuan P1 - Menyetujui dan meneruskan ke UPT Remunerasi
     */
    public function test_fr23_setujui_pengajuan_p1(): void
    {
        $this->authenticateVerifikator();
        $pengajuan = $this->setupPengajuanUji();

        $res = $this->postJson("/api/verifikator/pengajuan/{$pengajuan->id}/setujui", [
            'catatan' => 'Perhitungan telah diteliti dan sesuai.',
        ]);

        $res->assertStatus(200)
            ->assertJsonPath('data.status', 'Diverifikasi');

        $this->assertDatabaseHas('pengajuan_p1', [
            'id' => $pengajuan->id,
            'status' => 'diverifikasi',
        ]);

        $this->assertDatabaseHas('riwayat_status', [
            'pengajuan_id' => $pengajuan->id,
            'ke_status' => 'diverifikasi',
        ]);

        $this->assertDatabaseHas('audit_log', [
            'objek_type' => 'PengajuanP1',
            'objek_id' => $pengajuan->id,
            'aksi' => 'Menyetujui pengajuan',
        ]);
    }

    /**
     * FR-23: Memverifikasi Pengajuan P1 - Mengembalikan dengan catatan alasan wajib
     */
    public function test_fr23_kembalikan_pengajuan_p1_dengan_dan_tanpa_catatan(): void
    {
        $this->authenticateVerifikator();
        $pengajuan = $this->setupPengajuanUji();

        // 1. Pengembalian tanpa catatan alasan -> Wajib ditolak (422)
        $this->postJson("/api/verifikator/pengajuan/{$pengajuan->id}/kembalikan", [
            'alasan' => '',
        ])->assertStatus(422);

        // 2. Pengembalian dengan catatan alasan yang sah -> Sukses (200)
        $res = $this->postJson("/api/verifikator/pengajuan/{$pengajuan->id}/kembalikan", [
            'alasan' => 'Periksa kembali data presensi pegawai yang belum diverifikasi.',
        ]);

        $res->assertStatus(200)
            ->assertJsonPath('data.status', 'Dikembalikan');

        $this->assertDatabaseHas('pengajuan_p1', [
            'id' => $pengajuan->id,
            'status' => 'dikembalikan',
        ]);

        $this->assertDatabaseHas('riwayat_status', [
            'pengajuan_id' => $pengajuan->id,
            'ke_status' => 'dikembalikan',
        ]);
    }

    /**
     * FR-24: Memverifikasi Perubahan Jabatan/Grade - List & Detail
     */
    public function test_fr24_list_dan_detail_usulan_jabatan(): void
    {
        $this->authenticateVerifikator();
        $usulan = $this->setupUsulanUji();

        // 1. List usulan
        $resList = $this->getJson('/api/verifikator/jabatan');
        $resList->assertStatus(200)
            ->assertJsonStructure(['total', 'data']);

        // 2. Detail usulan
        $resDetail = $this->getJson("/api/verifikator/jabatan/{$usulan->id}");
        $resDetail->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'nama',
                    'nip',
                    'jabatanLama',
                    'jabatanBaru',
                    'dokumen',
                    'penanda',
                ],
            ]);
    }

    /**
     * FR-24: Memverifikasi Perubahan Jabatan/Grade - Menyetujui ke UPT Remunerasi
     */
    public function test_fr24_setujui_usulan_jabatan(): void
    {
        $this->authenticateVerifikator();
        $usulan = $this->setupUsulanUji();

        $res = $this->postJson("/api/verifikator/jabatan/{$usulan->id}/setujui", [
            'catatan' => 'SK dan SPMT sesuai ketentuan.',
        ]);

        $res->assertStatus(200)
            ->assertJsonPath('data.status', 'Diverifikasi');

        $this->assertDatabaseHas('usulan_jabatan', [
            'id' => $usulan->id,
            'status' => 'diverifikasi',
        ]);

        $this->assertDatabaseHas('audit_log', [
            'objek_type' => 'UsulanJabatan',
            'objek_id' => $usulan->id,
            'aksi' => 'Menyetujui usulan jabatan',
        ]);
    }

    /**
     * FR-24: Memverifikasi Perubahan Jabatan/Grade - Mengembalikan dengan catatan alasan wajib
     */
    public function test_fr24_kembalikan_usulan_jabatan_dengan_dan_tanpa_catatan(): void
    {
        $this->authenticateVerifikator();
        $usulan = $this->setupUsulanUji();

        // 1. Pengembalian tanpa catatan alasan -> Wajib ditolak (422)
        $this->postJson("/api/verifikator/jabatan/{$usulan->id}/kembalikan", [
            'alasan' => '',
        ])->assertStatus(422);

        // 2. Pengembalian dengan catatan alasan sah -> Sukses (200)
        $res = $this->postJson("/api/verifikator/jabatan/{$usulan->id}/kembalikan", [
            'alasan' => 'Dokumen SPMT belum ditandatangani oleh pejabat yang berwenang.',
        ]);

        $res->assertStatus(200)
            ->assertJsonPath('data.status', 'Dikembalikan');

        $this->assertDatabaseHas('usulan_jabatan', [
            'id' => $usulan->id,
            'status' => 'dikembalikan',
            'catatan_verifikator' => 'Dokumen SPMT belum ditandatangani oleh pejabat yang berwenang.',
        ]);
    }

    /**
     * FR-25: Memantau Status Pengajuan P1 (Read-Only)
     */
    public function test_fr25_pantau_status_pengajuan(): void
    {
        $this->authenticateVerifikator();
        $this->setupPengajuanUji();
        $this->setupUsulanUji();

        // Pantau tab P1
        $resP1 = $this->getJson('/api/verifikator/status?tab=p1');
        $resP1->assertStatus(200)
            ->assertJsonStructure(['tab', 'total', 'data']);

        // Pantau tab JBG
        $resJbg = $this->getJson('/api/verifikator/status?tab=jbg');
        $resJbg->assertStatus(200)
            ->assertJsonStructure(['tab', 'total', 'data']);
    }

    /**
     * FR-26: Melihat Jejak Audit (Read-Only)
     */
    public function test_fr26_melihat_jejak_audit(): void
    {
        $this->authenticateVerifikator();

        // Buat satu audit log uji
        AuditLog::create([
            'NIP' => '198204152008011002',
            'unit_id' => 1,
            'aksi' => 'Menyetujui pengajuan',
            'objek_type' => 'PengajuanP1',
            'objek_id' => 1,
            'nilai_sebelum' => ['status' => 'diajukan'],
            'nilai_sesudah' => ['status' => 'diverifikasi'],
            'alasan' => 'Pengujian jejak audit verifikator',
            'dicatat_at' => now(),
        ]);

        $res = $this->getJson('/api/verifikator/audit');
        $res->assertStatus(200)
            ->assertJsonStructure(['total', 'data']);
    }
}
