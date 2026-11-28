<?php

namespace Tests\Feature;

use App\Models\Akun;
use App\Models\Pegawai;
use App\Models\RoleUnit;
use App\Models\UnitKerja;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * Unit & Feature Test: Penanggung Jawab Unit Modul Read-Only
 *
 * Menguji bahwa:
 * 1. PJ Unit memiliki hak akses baca (GET) pada data pegawai, status pengajuan, dan rekapitulasi.
 * 2. PJ Unit DITOLAK (HTTP 403 Forbidden) ketika mencoba mengubah/memutasi data:
 *    - Tambah pegawai baru (POST /api/kepegawaian/pegawai)
 *    - Ubah data pegawai (PUT /api/kepegawaian/pegawai/{nip})
 *    - Hapus pegawai (DELETE /api/kepegawaian/pegawai/{nip})
 *    - Usulan mutasi/kenaikan jabatan (POST /api/kepegawaian/usulan-jabatan)
 *    - Eksekusi perhitungan remunerasi (POST /api/bendahara/hitung)
 */
class PenanggungJawabReadOnlyTest extends TestCase
{
    private function getPjUnitUser(): Akun
    {
        $pj = Akun::where('peran', 'penanggung_jawab')->first()
            ?: Akun::where('username', '5')->first();

        if (!$pj) {
            $unit = UnitKerja::firstOrCreate(
                ['nama' => 'Fakultas Teknologi Informasi'],
                ['jenis' => 'Fakultas', 'aktif' => true]
            );

            $pegawaiPj = Pegawai::firstOrCreate(
                ['NIP' => '197001011995011001'],
                [
                    'unit_id' => $unit->id,
                    'nama' => 'Dr. Dekan FTI',
                    'jenis' => 'Dosen',
                    'aktif' => true,
                ]
            );

            $pj = Akun::create([
                'NIP' => $pegawaiPj->NIP,
                'username' => 'dekan_pj_test',
                'password' => bcrypt('password123'),
                'peran' => 'penanggung_jawab',
                'aktif' => true,
            ]);

            RoleUnit::create([
                'role_id' => $pj->id,
                'unit_id' => $unit->id,
                'peran' => 'penanggung_jawab',
                'aktif' => true,
            ]);
        }

        return $pj;
    }

    public function test_pj_unit_bisa_membaca_daftar_pegawai_unit(): void
    {
        $pj = $this->getPjUnitUser();
        Sanctum::actingAs($pj);

        $response = $this->getJson('/api/pj-unit/pegawai');
        $response->assertStatus(200);
        $response->assertJsonStructure(['unit', 'unit_id', 'readonly', 'total', 'data']);
        $this->assertTrue($response->json('readonly'), 'Respon harus menandai status readonly');
    }

    public function test_pj_unit_bisa_membaca_status_pengajuan_unit(): void
    {
        $pj = $this->getPjUnitUser();
        Sanctum::actingAs($pj);

        $response = $this->getJson('/api/pj-unit/status');
        $response->assertStatus(200);
        $this->assertTrue($response->json('readonly'), 'Status pengajuan PJ Unit harus readonly');
    }

    public function test_pj_unit_bisa_membaca_rekapitulasi_unit(): void
    {
        $pj = $this->getPjUnitUser();
        Sanctum::actingAs($pj);

        $response = $this->getJson('/api/pj-unit/rekapitulasi');
        $response->assertStatus(200);
        $this->assertTrue($response->json('readonly'), 'Rekapitulasi PJ Unit harus readonly');
    }

    public function test_pj_unit_tidak_bisa_menambah_pegawai_baru(): void
    {
        $pj = $this->getPjUnitUser();
        Sanctum::actingAs($pj);

        // Uji ke endpoint internal PJ Unit yang dicegah (rejectWriteAction)
        $resInternal = $this->postJson('/api/pj-unit/pegawai', [
            'NIP' => '199999999999999999',
            'nama' => 'Pegawai Ilegal',
        ]);
        $this->assertEquals(403, $resInternal->getStatusCode(), 'POST /api/pj-unit/pegawai harus ditolak 403');

        // Uji ke endpoint Kepegawaian yang dibatasi middleware RBAC peran:kepegawaian
        $resKepegawaian = $this->postJson('/api/kepegawaian/pegawai', [
            'NIP' => '199999999999999999',
            'nama' => 'Pegawai Ilegal',
        ]);
        $this->assertEquals(403, $resKepegawaian->getStatusCode(), 'POST /api/kepegawaian/pegawai harus ditolak 403 untuk PJ Unit');
    }

    public function test_pj_unit_tidak_bisa_mengubah_data_pegawai(): void
    {
        $pj = $this->getPjUnitUser();
        Sanctum::actingAs($pj);

        $pegawai = Pegawai::first();

        // Uji ke endpoint internal PJ Unit
        $resInternal = $this->putJson("/api/pj-unit/pegawai/{$pegawai->NIP}", [
            'nama' => 'Nama Diubah PJ Unit Secara Ilegal',
        ]);
        $this->assertEquals(403, $resInternal->getStatusCode(), 'PUT /api/pj-unit/pegawai/{nip} harus ditolak 403');

        // Uji ke endpoint Kepegawaian
        $resKepegawaian = $this->putJson("/api/kepegawaian/pegawai/{$pegawai->NIP}", [
            'nama' => 'Nama Diubah PJ Unit Secara Ilegal',
        ]);
        $this->assertEquals(403, $resKepegawaian->getStatusCode(), 'PUT /api/kepegawaian/pegawai/{nip} harus ditolak 403');
    }

    public function test_pj_unit_tidak_bisa_menghapus_pegawai(): void
    {
        $pj = $this->getPjUnitUser();
        Sanctum::actingAs($pj);

        $pegawai = Pegawai::first();

        $resInternal = $this->deleteJson("/api/pj-unit/pegawai/{$pegawai->NIP}");
        $this->assertEquals(403, $resInternal->getStatusCode(), 'DELETE /api/pj-unit/pegawai/{nip} harus ditolak 403');

        $resKepegawaian = $this->deleteJson("/api/kepegawaian/pegawai/{$pegawai->NIP}");
        $this->assertEquals(403, $resKepegawaian->getStatusCode(), 'DELETE /api/kepegawaian/pegawai/{nip} harus ditolak 403');
    }

    public function test_pj_unit_tidak_bisa_mengajukan_usulan_jabatan(): void
    {
        $pj = $this->getPjUnitUser();
        Sanctum::actingAs($pj);

        $response = $this->postJson('/api/kepegawaian/usulan', [
            'NIP' => '198001012005011003',
            'jabatan_id' => 1,
        ]);

        $this->assertEquals(403, $response->getStatusCode(), 'PJ Unit harus ditolak 403 saat mencoba membuat usulan jabatan di kepegawaian');
    }

    public function test_pj_unit_tidak_bisa_menjalankan_perhitungan_remunerasi(): void
    {
        $pj = $this->getPjUnitUser();
        Sanctum::actingAs($pj);

        // Uji ke endpoint internal PJ Unit
        $resInternal = $this->postJson('/api/pj-unit/hitung', [
            'periode' => '2026-10',
        ]);
        $this->assertEquals(403, $resInternal->getStatusCode(), 'POST /api/pj-unit/hitung harus ditolak 403');

        // Uji ke endpoint Bendahara
        $resBendahara = $this->postJson('/api/bendahara/hitung', [
            'periode' => '2026-10',
        ]);
        $this->assertEquals(403, $resBendahara->getStatusCode(), 'POST /api/bendahara/hitung harus ditolak 403 untuk PJ Unit');
    }
}
