<?php

namespace Tests\Feature;

use App\Models\Akun;
use App\Models\AuditLog;
use App\Models\Pegawai;
use App\Models\Pengaduan;
use App\Models\TanggapanPengaduan;
use App\Models\UnitKerja;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class KepegawaianFR08Test extends TestCase
{
    use DatabaseTransactions;
    protected function authenticateKepegawaian(): Akun
    {
        $akun = Akun::where('username', '3')->first();
        if (!$akun) {
            $akun = Akun::create([
                'username' => '3',
                'password' => bcrypt('3'),
                'peran' => 'kepegawaian',
                'aktif' => true,
            ]);
        }
        Sanctum::actingAs($akun, ['*']);
        return $akun;
    }

    protected function setupPengaduanUji(): Pengaduan
    {
        $fti = UnitKerja::firstOrCreate(['nama' => 'Fakultas Teknologi Informasi'], ['jenis' => 'Fakultas', 'aktif' => true]);
        $pegawai = Pegawai::firstOrCreate(
            ['NIP' => '198803122015042001'],
            ['nama' => 'Dr. Rina Maharani, M.T.', 'unit_id' => $fti->id, 'jenis' => 'Dosen', 'status_kepegawaian' => 'PNS', 'aktif' => true]
        );

        return Pengaduan::create([
            'NIP' => $pegawai->NIP,
            'unit_id' => $fti->id,
            'kategori' => 'Presensi',
            'periode' => 'Oktober 2026',
            'judul' => 'Keberatan Pemotongan Kehadiran',
            'uraian' => 'Cuti sakit 1 hari tercatat sebagai tidak hadir tanpa keterangan.',
            'status' => 'Diajukan',
            'tingkat' => 'unit',
            'diajukan_at' => now(),
        ]);
    }

    public function test_fr08_daftar_pengaduan_unit_kepegawaian(): void
    {
        $this->authenticateKepegawaian();
        $this->setupPengaduanUji();

        $res = $this->getJson('/api/kepegawaian/pengaduan');
        $res->assertStatus(200)
            ->assertJsonStructure(['total', 'data']);

        $this->assertGreaterThanOrEqual(1, $res->json('total'));
    }

    public function test_fr08_diagnosis_pengaduan_data_sumber(): void
    {
        $this->authenticateKepegawaian();
        $pengaduan = $this->setupPengaduanUji();

        $res = $this->getJson("/api/kepegawaian/pengaduan/{$pengaduan->id}");
        $res->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'nip',
                    'nama',
                    'kategori',
                    'diagnosis' => [
                        'riwayat_jabatan',
                        'presensi',
                        'hukuman_disiplin',
                        'rincian_p1',
                    ],
                ],
            ]);
    }

    public function test_fr08_selesaikan_pengaduan_di_unit(): void
    {
        $this->authenticateKepegawaian();
        $pengaduan = $this->setupPengaduanUji();

        $payload = [
            'tindakan' => 'selesai',
            'tanggapan' => 'Data presensi telah kami teliti dan surat izin cuti sakit telah diverifikasi.',
        ];

        $res = $this->postJson("/api/kepegawaian/pengaduan/{$pengaduan->id}/tanggapi", $payload);
        $res->assertStatus(200)
            ->assertJsonPath('data.status', 'Selesai');

        $this->assertDatabaseHas('pengaduan', [
            'id' => $pengaduan->id,
            'status' => 'Selesai',
            'tingkat' => 'unit',
        ]);

        $this->assertDatabaseHas('audit_log', [
            'objek_type' => 'Pengaduan',
            'objek_id' => $pengaduan->id,
            'aksi' => 'Selesaikan Pengaduan Pegawai',
        ]);
    }

    public function test_fr08_teruskan_pengaduan_ke_upt_remunerasi(): void
    {
        $this->authenticateKepegawaian();
        $pengaduan = $this->setupPengaduanUji();

        $payload = [
            'tindakan' => 'teruskan',
            'tanggapan' => 'Akar permasalahan ada pada penetapan grade oleh UPT Remunerasi, tiket kami teruskan.',
        ];

        $res = $this->postJson("/api/kepegawaian/pengaduan/{$pengaduan->id}/tanggapi", $payload);
        $res->assertStatus(200)
            ->assertJsonPath('data.status', 'Diteruskan');

        $this->assertDatabaseHas('pengaduan', [
            'id' => $pengaduan->id,
            'status' => 'Diteruskan',
            'tingkat' => 'universitas',
        ]);

        $this->assertDatabaseHas('audit_log', [
            'objek_type' => 'Pengaduan',
            'objek_id' => $pengaduan->id,
            'aksi' => 'Teruskan Pengaduan ke UPT Remunerasi',
        ]);
    }

    public function test_fr08_validasi_tanggapan_wajib_dan_minimal_10_karakter(): void
    {
        $this->authenticateKepegawaian();
        $pengaduan = $this->setupPengaduanUji();

        // 1. Tanggapan kosong -> ditolak
        $this->postJson("/api/kepegawaian/pengaduan/{$pengaduan->id}/tanggapi", [
            'tindakan' => 'selesai',
            'tanggapan' => '',
        ])->assertStatus(422);

        // 2. Tanggapan kurang dari 10 karakter -> ditolak
        $this->postJson("/api/kepegawaian/pengaduan/{$pengaduan->id}/tanggapi", [
            'tindakan' => 'selesai',
            'tanggapan' => 'Pendek',
        ])->assertStatus(422);
    }
}
