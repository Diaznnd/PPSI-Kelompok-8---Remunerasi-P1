<?php

namespace Tests\Feature;

use App\Models\Akun;
use App\Models\HasilPerhitungan;
use App\Models\Pegawai;
use App\Models\PengajuanP1;
use App\Models\PresensiBulanan;
use App\Models\PresensiReport;
use App\Models\RoleUnit;
use App\Models\UnitKerja;
use Illuminate\Http\UploadedFile;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * Issue #36: Integration test antarmodul (presensi -> kalkulasi -> verifikasi -> amprah/slip)
 *
 * Menguji integrasi end-to-end siklus remunerasi P1:
 * 1. Kepegawaian: Impor presensi bulanan (CSV) -> status 'valid', status_approval 'menunggu_approval', siap_perhitungan = false.
 * 2. Guard Check: Bendahara diblokir (400 Bad Request) jika mencoba menghitung sebelum presensi disetujui PJ Unit.
 * 3. PJ Unit: Review dan menyetujui rekap presensi -> status_approval 'disetujui', siap_perhitungan = true.
 * 4. Bendahara: Cek kesiapan, hitung remunerasi P1 (Gross, Potongan Kehadiran, Bruto), dan ajukan pengajuan P1 -> status 'diajukan'.
 * 5. Verifikator: Verifikasi pengajuan P1 beserta catatan -> status 'diverifikasi'.
 * 6. UPT Remunerasi: Tetapkan PPh 21 & P1 Netto serta terbitkan slip P1 resmi -> status 'selesai', slip_terbit_at aktif.
 * 7. Pegawai Mandiri: Akses rincian slip P1 dan unduh dokumen PDF -> HTTP 200 dengan rincian komponen potongan lengkap.
 * 8. Security & Isolasi Hak Akses: Pegawai lain ditolak saat mencoba mengakses slip pegawai lain -> HTTP 403 Forbidden.
 */
class IntegrationAntarmodulTest extends TestCase
{
    private string $periode = '2026-11';
    private UnitKerja $unit;
    private Akun $kepegawaian;
    private Akun $pjUnit;
    private Akun $bendahara;
    private Akun $verifikator;
    private Akun $uptRemunerasi;
    private Akun $pegawaiRina;
    private Akun $pegawaiLain;

    protected function setUp(): void
    {
        parent::setUp();

        // 1. Dapatkan Unit Kerja FTI (Unit Pengujian)
        $this->unit = UnitKerja::where('nama', 'like', '%Teknologi Informasi%')->first()
            ?: UnitKerja::firstOrCreate(
                ['nama' => 'Fakultas Teknologi Informasi'],
                ['jenis' => 'Fakultas', 'aktif' => true]
            );

        // 2. Bersihkan artefak data uji untuk periode pengujian agar steril
        $oldPengajuanIds = PengajuanP1::where('periode', $this->periode)
            ->where('unit_id', $this->unit->id)
            ->pluck('id');
        HasilPerhitungan::whereIn('pengajuan_id', $oldPengajuanIds)->delete();
        PengajuanP1::whereIn('id', $oldPengajuanIds)->delete();

        $oldReportIds = PresensiReport::where('periode', $this->periode)
            ->where('unit_id', $this->unit->id)
            ->pluck('id');
        PresensiBulanan::whereIn('presensi_report_id', $oldReportIds)->delete();
        PresensiReport::whereIn('id', $oldReportIds)->delete();

        // 3. Resolusi Akun untuk tiap Peran
        $this->kepegawaian = Akun::where('username', '3')->first()
            ?: Akun::where('peran', 'kepegawaian')->firstOrFail();

        $this->pjUnit = Akun::where('username', '5')->first()
            ?: Akun::where('peran', 'penanggung_jawab')->firstOrFail();

        $this->bendahara = Akun::where('username', '2')->first()
            ?: Akun::where('peran', 'bendahara')->firstOrFail();

        $this->verifikator = Akun::where('username', '4')->first()
            ?: Akun::where('peran', 'verifikator')->firstOrFail();

        $this->uptRemunerasi = Akun::where('username', '6')->first()
            ?: Akun::where('username', 'admin')->first()
            ?: Akun::where('peran', 'upt_remunerasi')->firstOrFail();

        $this->pegawaiRina = Akun::where('username', '1')->first()
            ?: Akun::where('peran', 'pegawai')->firstOrFail();

        // Akun Pegawai Lain untuk Pengujian Keamanan Isolasi Data (Cross-Access 403)
        $this->pegawaiLain = Akun::where('username', 'pegawai.tubel')->first()
            ?: Akun::where('peran', 'pegawai')->where('username', '!=', $this->pegawaiRina->username)->first()
            ?: Akun::create([
                'NIP' => '199912312024011099',
                'username' => 'pegawai_uji_isolasi',
                'password' => bcrypt('password123'),
                'peran' => 'pegawai',
                'aktif' => true,
            ]);

        // Pastikan bendahara terikat ke unit FTI
        RoleUnit::updateOrCreate(
            ['role_id' => $this->bendahara->id, 'peran' => 'bendahara'],
            ['unit_id' => $this->unit->id, 'aktif' => true]
        );

        // Pastikan kepegawaian terikat ke unit FTI
        RoleUnit::updateOrCreate(
            ['role_id' => $this->kepegawaian->id, 'peran' => 'kepegawaian'],
            ['unit_id' => $this->unit->id, 'aktif' => true]
        );

        // Pastikan penanggung_jawab terikat ke unit FTI
        RoleUnit::updateOrCreate(
            ['role_id' => $this->pjUnit->id, 'peran' => 'penanggung_jawab'],
            ['unit_id' => $this->unit->id, 'aktif' => true]
        );
    }

    /**
     * Membangun berkas CSV presensi valid khusus untuk seluruh pegawai aktif di unit kerja FTI
     */
    private function generateValidPresensiCsv(): UploadedFile
    {
        $pegawaiList = Pegawai::where('unit_id', $this->unit->id)->where('aktif', true)->get();

        $csvLines = [];
        $csvLines[] = 'nip,nama,hari_kerja,hadir,tidak_hadir,cuti_tahunan,cuti_sakit,izin,s1,s2,s3,s4,s5,s6,pw1,pw2,pw3,pw4,pw5,pw6';

        foreach ($pegawaiList as $idx => $p) {
            $hariKerja = 22;
            $s1 = ($idx % 5 === 1) ? 1 : 0;
            $pw1 = ($idx % 5 === 2) ? 1 : 0;
            $cutiSakit = ($idx % 5 === 3) ? 1 : 0;
            $cutiTahunan = ($idx % 5 === 4) ? 1 : 0;
            $totalCuti = $cutiSakit + $cutiTahunan;
            $hadir = $hariKerja - $totalCuti;

            $csvLines[] = sprintf(
                '%s,"%s",%d,%d,0,%d,%d,0,%d,0,0,0,0,0,%d,0,0,0,0,0',
                $p->NIP,
                str_replace('"', '""', $p->nama),
                $hariKerja,
                $hadir,
                $cutiTahunan,
                $cutiSakit,
                $s1,
                $pw1
            );
        }

        $csvContent = implode("\n", $csvLines);
        return UploadedFile::fake()->createWithContent("presensi_fti_{$this->periode}.csv", $csvContent);
    }

    /**
     * Uji Siklus Penuh Integrasi Antarmodul Remunerasi P1:
     * Kepegawaian (Impor) -> PJ Unit (Approval) -> Bendahara (Hitung & Ajukan) -> Verifikator (Verifikasi) -> UPT (Tetapkan Netto & Slip) -> Pegawai (Unduh & Cek)
     */
    public function test_siklus_lengkap_antarmodul_presensi_sampai_penerbitan_dan_unduh_slip(): void
    {
        // =========================================================================
        // TAHAP 1: KEPEGAWAIAN MENGIMPOR REKAP PRESENSI BULANAN
        // =========================================================================
        Sanctum::actingAs($this->kepegawaian, ['*']);

        $csvFile = $this->generateValidPresensiCsv();

        $importResponse = $this->postJson('/api/kepegawaian/presensi/import', [
            'file' => $csvFile,
            'periode' => $this->periode,
        ]);

        $importResponse->assertStatus(201)
            ->assertJsonPath('report.status', 'valid')
            ->assertJsonPath('report.status_approval', 'menunggu_approval')
            ->assertJsonPath('report.jumlah_gagal', 0);

        $reportId = $importResponse->json('report.id');
        $this->assertNotNull($reportId);

        $report = PresensiReport::find($reportId);
        $this->assertNotNull($report);
        $this->assertEquals('valid', $report->status);
        $this->assertEquals('menunggu_approval', $report->status_approval);
        $this->assertFalse((bool) $report->siap_perhitungan, 'Laporan presensi belum boleh siap perhitungan sebelum disetujui PJ Unit.');

        // =========================================================================
        // TAHAP 2: GUARD VALIDATION - BENDAHARA DIBLOKIR SEBELUM APPROVAL PJ UNIT
        // =========================================================================
        Sanctum::actingAs($this->bendahara, ['*']);

        $blockedHitung = $this->postJson('/api/bendahara/hitung', [
            'periode' => $this->periode,
        ]);

        $blockedHitung->assertStatus(400)
            ->assertJsonPath('blocked', true)
            ->assertJsonPath('reason', 'not_approved');

        // =========================================================================
        // TAHAP 3: PENANGGUNG JAWAB UNIT (PJ UNIT) MENINJAU & MENYETUJUI PRESENSI
        // =========================================================================
        Sanctum::actingAs($this->pjUnit, ['*']);

        // Verifikasi PJ Unit dapat melihat daftar antrean approval presensi
        $listApproval = $this->getJson("/api/pj-unit/approval-presensi?periode={$this->periode}");
        $listApproval->assertStatus(200);

        // Eksekusi Persetujuan Presensi oleh Dekan / PJ Unit
        $approveResponse = $this->postJson("/api/pj-unit/approval-presensi/{$reportId}/approve", [
            'catatan' => 'Rekapitulasi kehadiran unit kerja FTI telah diverifikasi dan disetujui secara resmi.',
        ]);

        $approveResponse->assertStatus(200)
            ->assertJsonPath('data.status_approval', 'disetujui');

        $report->refresh();
        $this->assertEquals('disetujui', $report->status_approval);
        $this->assertTrue((bool) $report->siap_perhitungan, 'Presensi harus bertanda siap_perhitungan setelah disetujui PJ Unit.');
        $this->assertEquals($this->pjUnit->NIP, $report->approved_by_nip);

        // =========================================================================
        // TAHAP 4: BENDAHARA CEK KESIAPAN, HITUNG P1 & AJUKAN PENGAJUAN
        // =========================================================================
        Sanctum::actingAs($this->bendahara, ['*']);

        // 4a. Cek Kesiapan
        $kesiapanResponse = $this->getJson("/api/bendahara/kesiapan?periode={$this->periode}");
        $kesiapanResponse->assertStatus(200);

        // 4b. Hitung Remunerasi P1 (Engine Kalkulasi D8)
        $hitungResponse = $this->postJson('/api/bendahara/hitung', [
            'periode' => $this->periode,
        ]);

        $hitungResponse->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'pengajuan_id',
                'periode',
                'ringkasan' => [
                    'total_pegawai',
                    'total_rem_p1',
                    'total_pengurangan',
                    'total_bruto',
                    'total_pajak',
                    'total_netto',
                ],
            ]);

        $this->assertGreaterThan(0, $hitungResponse->json('ringkasan.total_pegawai'));
        $this->assertGreaterThan(0, $hitungResponse->json('ringkasan.total_bruto'));

        // Pratinjau perhitungan per-pegawai
        $pratinjauResponse = $this->getJson("/api/bendahara/pratinjau?periode={$this->periode}");
        $pratinjauResponse->assertStatus(200)
            ->assertJsonStructure(['unit', 'periode', 'ringkasan', 'data']);

        // 4c. Ajukan Pengajuan P1 ke Verifikator
        $ajukanResponse = $this->postJson('/api/bendahara/ajukan', [
            'periode' => $this->periode,
            'catatan' => 'Pengajuan P1 FTI Periode ' . $this->periode,
        ]);

        $ajukanResponse->assertStatus(200);

        $pengajuan = PengajuanP1::where('unit_id', $this->unit->id)
            ->where('periode', $this->periode)
            ->firstOrFail();

        $this->assertEquals('diajukan', $pengajuan->status);
        $pengajuanId = $pengajuan->id;

        // =========================================================================
        // TAHAP 5: VERIFIKATOR MEMERIKSA & MENYETUJUI PENGAJUAN P1
        // =========================================================================
        Sanctum::actingAs($this->verifikator, ['*']);

        // 5a. Lihat detail pengajuan oleh verifikator
        $detailVerifikator = $this->getJson("/api/verifikator/pengajuan/{$pengajuanId}");
        $detailVerifikator->assertStatus(200)
            ->assertJsonPath('data.status_raw', 'diajukan');

        // 5b. Setujui Pengajuan P1
        $verifikasiResponse = $this->postJson("/api/verifikator/pengajuan/{$pengajuanId}/verifikasi", [
            'catatan' => 'Pengajuan P1 FTI telah diperiksa seluruh data kehadiran, hukdis, dan nilai perhitungannya dinyatakan valid.',
        ]);

        $verifikasiResponse->assertStatus(200)
            ->assertJsonPath('status', 'success');

        $pengajuan->refresh();
        $this->assertEquals('diverifikasi', $pengajuan->status);

        // =========================================================================
        // TAHAP 6: UPT REMUNERASI TETAPKAN PAJAK NETTO & TERBITKAN SLIP P1
        // =========================================================================
        Sanctum::actingAs($this->uptRemunerasi, ['*']);

        // 6a. Tetapkan PPh 21 dan P1 Netto
        $tetapkanNettoResponse = $this->postJson("/api/upt-remunerasi/hitung-pajak/{$pengajuanId}/tetapkan-netto", [
            'catatan' => 'Pajak PPh 21 dan P1 Netto disahkan oleh UPT Remunerasi Universitas Andalas.',
        ]);

        $tetapkanNettoResponse->assertStatus(200)
            ->assertJsonPath('pengajuan.status', 'disahkan');

        // Verifikasi hasil perhitungan telah memiliki nilai pajak dan netto
        $hasilFirst = HasilPerhitungan::where('pengajuan_id', $pengajuanId)->firstOrFail();
        $this->assertNotNull($hasilFirst->pajak_pph21);
        $this->assertNotNull($hasilFirst->p1_netto);

        // 6b. Terbitkan Slip P1 Massal untuk Unit FTI
        $terbitkanResponse = $this->postJson("/api/upt-remunerasi/penerbitan-slip/{$pengajuanId}/terbitkan");

        $terbitkanResponse->assertStatus(200)
            ->assertJsonPath('status', 'terbit');

        $pengajuan->refresh();
        $this->assertEquals('selesai', $pengajuan->status);

        $hasilFirst->refresh();
        $this->assertNotNull($hasilFirst->slip_terbit_at, 'Slip P1 harus memiliki timestamp slip_terbit_at.');

        // =========================================================================
        // TAHAP 7: PEGAWAI MANDIRI MELIHAT DAN MENGUNDUH SLIP GAJI
        // =========================================================================
        Sanctum::actingAs($this->pegawaiRina, ['*']);

        // 7a. Lihat Rincian Slip Gaji Periode Tersebut
        $slipPegawaiResponse = $this->getJson("/api/pegawai/slip/{$this->periode}");

        $slipPegawaiResponse->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'periode',
                    'nomor',
                    'status',
                    'remunerasiGrade',
                    'remunerasiP1',
                    'bruto',
                    'pph21',
                    'netto',
                    'komponen',
                ],
            ]);

        $slipData = $slipPegawaiResponse->json('data');
        $this->assertEquals('Terbit', $slipData['status']);
        $this->assertGreaterThan(0, $slipData['remunerasiP1']);
        $this->assertGreaterThan(0, $slipData['netto']);
        $this->assertNotEmpty($slipData['komponen']);

        // 7b. Unduh Dokumen Slip PDF
        $pdfResponse = $this->get("/api/pegawai/slip/{$this->periode}/pdf?download=1");
        $pdfResponse->assertStatus(200);
        $this->assertNotEmpty($pdfResponse->getContent());

        // =========================================================================
        // TAHAP 8: KEAMANAN & ISOLASI DATA (CROSS-USER DATA ISOLATION / NFR-04)
        // =========================================================================
        // Pegawai lain mencoba mengakses slip pegawai Rina dengan ID numerik slip Rina
        Sanctum::actingAs($this->pegawaiLain, ['*']);

        $slipRinaId = $hasilFirst->id;
        $unauthorizedAccess = $this->getJson("/api/pegawai/slip/{$slipRinaId}");

        $unauthorizedAccess->assertStatus(403);

        $unauthorizedPdfDownload = $this->get("/api/pegawai/slip/{$slipRinaId}/pdf?download=1");
        $unauthorizedPdfDownload->assertStatus(403);
    }
}
