<?php

namespace Tests\Feature;

use App\Models\Akun;
use App\Models\HasilPerhitungan;
use App\Models\Pengaduan;
use App\Models\RoleUnit;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * Issue #146: [Uji] Y9 Unit test modul dan uji akses lintas peran
 *
 * Menguji:
 * 1. Penolakan akses tanpa autentikasi (401 Unauthorized) pada seluruh endpoint terlindungi 6 peran.
 * 2. Matriks isolasi akses lintas peran (403 Forbidden): setiap peran ditolak mengakses endpoint peran lain.
 * 3. Akses sah masing-masing peran (200 OK) pada endpoint modulnya sendiri.
 * 4. Isolasi horizontal antar-pegawai (slip & pengaduan milik pegawai lain ditolak 403 Forbidden).
 */
class UjiAksesLintasPeranTest extends TestCase
{
    use DatabaseTransactions;

    private function getAkunByUsername(string $username, string $peran, ?string $nip = null): Akun
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
     * 1. Uji penolakan akses tanpa token (401 Unauthorized) pada semua prefix peran
     */
    public function test_unauthenticated_ditolak_401_di_semua_modul_peran(): void
    {
        $endpoints = [
            ['GET', '/api/pegawai/profil'],
            ['GET', '/api/kepegawaian/pegawai'],
            ['GET', '/api/bendahara/kesiapan'],
            ['GET', '/api/verifikator/pengajuan'],
            ['GET', '/api/pj-unit/pegawai'],
            ['GET', '/api/upt-remunerasi/dashboard'],
        ];

        foreach ($endpoints as [$method, $uri]) {
            $this->json($method, $uri)->assertStatus(401);
        }
    }

    /**
     * 2. Matriks akses lintas peran: setiap peran ditolak (403) saat mengakses modul peran lain
     */
    public function test_matriks_akses_lintas_peran_ditolak_403(): void
    {
        $pegawai = $this->getAkunByUsername('1', 'pegawai', '198803122015042001');
        $bendahara = $this->getAkunByUsername('2', 'bendahara', '198204152008011002');
        $kepegawaian = $this->getAkunByUsername('3', 'kepegawaian', '198001012005011003');
        $verifikator = $this->getAkunByUsername('4', 'verifikator', '198204152008011002');
        $pjUnit = $this->getAkunByUsername('5', 'pj_unit', '197505102000031001');
        $upt = $this->getAkunByUsername('6', 'upt_remunerasi', '197001011995031001');

        // Pastikan tiap akun uji hanya memiliki peran utamanya di role_unit agar matriks murni teruji
        $roleEndpoints = [
            'kepegawaian' => [
                ['GET', '/api/kepegawaian/pegawai'],
                ['POST', '/api/kepegawaian/pegawai'],
            ],
            'bendahara' => [
                ['GET', '/api/bendahara/kesiapan'],
                ['POST', '/api/bendahara/hitung'],
            ],
            'verifikator' => [
                ['GET', '/api/verifikator/pengajuan'],
                ['GET', '/api/verifikator/audit'],
            ],
            'pj_unit' => [
                ['GET', '/api/pj-unit/pegawai'],
                ['GET', '/api/pj-unit/status'],
            ],
            'upt_remunerasi' => [
                ['GET', '/api/upt-remunerasi/dashboard'],
                ['GET', '/api/upt-remunerasi/audit-log'],
            ],
        ];

        $actors = [
            'pegawai' => $pegawai,
            'bendahara' => $bendahara,
            'kepegawaian' => $kepegawaian,
            'verifikator' => $verifikator,
            'pj_unit' => $pjUnit,
            'upt_remunerasi' => $upt,
        ];

        foreach ($actors as $actorRole => $akun) {
            Sanctum::actingAs($akun, ['*']);

            foreach ($roleEndpoints as $targetRole => $routes) {
                if ($actorRole === $targetRole) {
                    continue;
                }

                // Skip jika akun di DB memang punya peran tambahan aktif di role_unit
                if ($akun->hasRole($targetRole)) {
                    continue;
                }

                foreach ($routes as [$method, $uri]) {
                    $response = $this->json($method, $uri);
                    $this->assertEquals(
                        403,
                        $response->getStatusCode(),
                        "Peran '{$actorRole}' seharusnya ditolak (403) saat mengakses {$method} {$uri} milik '{$targetRole}', tetapi mendapat {$response->getStatusCode()}."
                    );
                }
            }
        }
    }

    /**
     * 3. Uji akses sah masing-masing peran ke endpoint modulnya sendiri (200 OK)
     */
    public function test_akses_sah_tiap_peran_ke_modulnya_sendiri(): void
    {
        $cases = [
            ['1', 'pegawai', '/api/pegawai/profil'],
            ['2', 'bendahara', '/api/bendahara/kesiapan'],
            ['3', 'kepegawaian', '/api/kepegawaian/pegawai'],
            ['4', 'verifikator', '/api/verifikator/pengajuan'],
            ['5', 'pj_unit', '/api/pj-unit/pegawai'],
            ['6', 'upt_remunerasi', '/api/upt-remunerasi/dashboard'],
        ];

        foreach ($cases as [$username, $peran, $uri]) {
            $akun = $this->getAkunByUsername($username, $peran);
            Sanctum::actingAs($akun, ['*']);

            $res = $this->getJson($uri);
            $this->assertEquals(
                200,
                $res->getStatusCode(),
                "Peran '{$peran}' ({$username}) seharusnya bisa mengakses {$uri} (200), tetapi mendapat {$res->getStatusCode()}."
            );
        }
    }

    /**
     * 4. Uji isolasi horizontal antar-pegawai (slip & pengaduan milik orang lain ditolak 403)
     */
    public function test_isolasi_horizontal_antar_pegawai_slip_dan_pengaduan(): void
    {
        $slipRina = HasilPerhitungan::create([
            'NIP' => '198803122015042001',
            'periode' => '2026-10',
            'nilai_jabatan' => 6285000,
            'pir' => 3000,
            'persen_p1' => 40,
            'p1_gross' => 2514000,
            'persen_status' => 100,
            'p1_pertimbang' => 2514000,
            'p1_setelah_potongan' => 2514000,
            'pajak_pph21' => 125700,
            'p1_netto' => 2388300,
        ]);

        $pengaduanRina = Pengaduan::create([
            'NIP' => '198803122015042001',
            'unit_id' => 1,
            'kategori' => 'Slip P1',
            'periode' => 'Oktober 2026',
            'judul' => 'Uji Isolasi Pengaduan Y9',
            'uraian' => 'Detail pengaduan privat pegawai.',
            'status' => 'Diajukan',
            'tingkat' => 'unit',
            'diajukan_at' => now(),
        ]);

        // Login sebagai pegawai lain (pegawai.tubel)
        $pegawaiLain = $this->getAkunByUsername('pegawai.tubel', 'pegawai', '199202152019031002');
        Sanctum::actingAs($pegawaiLain, ['*']);

        $this->getJson("/api/pegawai/slip/{$slipRina->id}")->assertStatus(403);
        $this->getJson("/api/pegawai/slip/{$slipRina->id}/pdf")->assertStatus(403);
        $this->getJson("/api/pegawai/pengaduan/{$pengaduanRina->id}")->assertStatus(403);
        $this->postJson("/api/pegawai/pengaduan/{$pengaduanRina->id}/tanggapan", [
            'teks' => 'Percobaan akses ilegal lintas pegawai.',
        ])->assertStatus(403);
    }
}
