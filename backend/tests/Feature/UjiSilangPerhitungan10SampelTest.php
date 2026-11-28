<?php

namespace Tests\Feature;

use App\Models\Grade;
use App\Models\Jabatan;
use App\Models\Pegawai;
use App\Models\PengajuanP1;
use App\Models\PresensiBulanan;
use App\Models\PresensiReport;
use App\Models\UnitKerja;
use App\Models\UsulanJabatan;
use App\Http\Controllers\Bendahara\PerhitunganController;
use Illuminate\Http\Request;
use Tests\TestCase;

/**
 * Uji Silang Engine Perhitungan P1 (D8) vs 10 Sampel Manual (L0)
 *
 * Menguji 10 skenario perhitungan manual sebagai acuan (Ground Truth L0):
 * Sampel 1: PNS Normal Lektor Kepala Grade 11 (6.285.000), Hadir 100%, Potongan 0%, Gol IV/a (PPh 15%)
 * Sampel 2: PNS Lektor Grade 10 (5.232.000), Terlambat TL.1 (1x = 0.25%) + TL.3 (1x = 1%), Gol III/c (PPh 5%)
 * Sampel 3: PNS Asisten Ahli Grade 9 (4.500.000), Pulang Cepat PSW.2 (2x = 1%) + PSW.4 (1x = 1.5%), Gol III/b (PPh 5%)
 * Sampel 4: PNS Tendik Grade 8 (3.950.000), Cuti Sakit (2 hari @ 1% = 2%), Gol III/a (PPh 5%)
 * Sampel 5: PNS Tendik Grade 7 (3.500.000), Cuti Bersalin ke-3 (1 hari @ 2% = 2%), Gol II/c (PPh 5%)
 * Sampel 6: PNS Lektor Grade 10 (5.232.000), Alfa / Tanpa Keterangan (1 hari @ 5% = 5%), Gol III/d (PPh 5%)
 * Sampel 7: CPNS Asisten Ahli Grade 9 (4.500.000), Pengali Status 80% (Potongan 20%), Gol III/b (PPh 5%)
 * Sampel 8: Tugas Belajar Lektor Grade 10 (5.232.000), Pengali Status 75% (Potongan 25%), Gol III/c (PPh 5%)
 * Sampel 9: PNS Lektor Kepala Grade 11 (6.285.000), Hukuman Disiplin Sedang (Potongan 25%), Gol IV/b (PPh 15%)
 * Sampel 10: PNS Lektor Grade 10 (5.232.000), Fisik Absen > 50% (Potongan 100%), Gol III/c (Netto 0)
 */
class UjiSilangPerhitungan10SampelTest extends TestCase
{
    public function test_perhitungan_10_sampel_sesuai_acuan_manual_l0_dan_total_amprah_sama_dengan_netto(): void
    {
        $bendaharaUser = \App\Models\Akun::where('peran', 'bendahara')->first()
            ?: \App\Models\Akun::where('username', '2')->first();

        $roleUnit = \App\Models\RoleUnit::where('role_id', $bendaharaUser->id)
            ->where('peran', 'bendahara')
            ->where('aktif', true)
            ->first();

        $unit = \App\Models\UnitKerja::find($roleUnit?->unit_id ?? 1);

        $grade11 = Grade::firstOrCreate(['kode_grade' => 'Grade 11'], ['nilai' => 6285000.00]);
        $grade10 = Grade::firstOrCreate(['kode_grade' => 'Grade 10'], ['nilai' => 5232000.00]);
        $grade9  = Grade::firstOrCreate(['kode_grade' => 'Grade 9'],  ['nilai' => 4500000.00]);
        $grade8  = Grade::firstOrCreate(['kode_grade' => 'Grade 8'],  ['nilai' => 3950000.00]);
        $grade7  = Grade::firstOrCreate(['kode_grade' => 'Grade 7'],  ['nilai' => 3500000.00]);

        $jabLektorKepala = Jabatan::firstOrCreate(['nama_jabatan' => 'Lektor Kepala Test'], ['kode_id' => $grade11->id]);
        $jabLektor       = Jabatan::firstOrCreate(['nama_jabatan' => 'Lektor Test'],        ['kode_id' => $grade10->id]);
        $jabAsistenAhli  = Jabatan::firstOrCreate(['nama_jabatan' => 'Asisten Ahli Test'],  ['kode_id' => $grade9->id]);
        $jabTendik8      = Jabatan::firstOrCreate(['nama_jabatan' => 'Tendik 8 Test'],      ['kode_id' => $grade8->id]);
        $jabTendik7      = Jabatan::firstOrCreate(['nama_jabatan' => 'Tendik 7 Test'],      ['kode_id' => $grade7->id]);

        $periode = '2026-12';

        // Pastikan pengajuan periode ini bersih / status draft jika ada
        PengajuanP1::where('unit_id', $unit->id)->where('periode', $periode)->delete();
        \App\Models\HasilPerhitungan::where('periode', $periode)->delete();

        // Laporan Presensi yang sudah disetujui
        $report = PresensiReport::updateOrCreate(
            ['unit_id' => $unit->id, 'periode' => $periode],
            [
                'status' => 'valid',
                'status_approval' => 'disetujui',
                'siap_perhitungan' => true,
                'dimpor_at' => now(),
            ]
        );

        // Definisi 10 Sampel Pegawai
        $sampelDef = [
            1 => ['nip' => '9990001001', 'jab' => $jabLektorKepala, 'gol' => 'IV/a', 'status' => 'PNS', 'tubel' => 'tidak', 's1' => 0, 's3' => 0, 'pw2' => 0, 'pw4' => 0, 'sakit' => 0, 'b3' => 0, 'alfa' => 0],
            2 => ['nip' => '9990001002', 'jab' => $jabLektor,       'gol' => 'III/c', 'status' => 'PNS', 'tubel' => 'tidak', 's1' => 1, 's3' => 1, 'pw2' => 0, 'pw4' => 0, 'sakit' => 0, 'b3' => 0, 'alfa' => 0],
            3 => ['nip' => '9990001003', 'jab' => $jabAsistenAhli,  'gol' => 'III/b', 'status' => 'PNS', 'tubel' => 'tidak', 's1' => 0, 's3' => 0, 'pw2' => 2, 'pw4' => 1, 'sakit' => 0, 'b3' => 0, 'alfa' => 0],
            4 => ['nip' => '9990001004', 'jab' => $jabTendik8,      'gol' => 'III/a', 'status' => 'PNS', 'tubel' => 'tidak', 's1' => 0, 's3' => 0, 'pw2' => 0, 'pw4' => 0, 'sakit' => 2, 'b3' => 0, 'alfa' => 0],
            5 => ['nip' => '9990001005', 'jab' => $jabTendik7,      'gol' => 'II/c',  'status' => 'PNS', 'tubel' => 'tidak', 's1' => 0, 's3' => 0, 'pw2' => 0, 'pw4' => 0, 'sakit' => 0, 'b3' => 1, 'alfa' => 0],
            6 => ['nip' => '9990001006', 'jab' => $jabLektor,       'gol' => 'III/d', 'status' => 'PNS', 'tubel' => 'tidak', 's1' => 0, 's3' => 0, 'pw2' => 0, 'pw4' => 0, 'sakit' => 0, 'b3' => 0, 'alfa' => 1],
            7 => ['nip' => '9990001007', 'jab' => $jabAsistenAhli,  'gol' => 'III/b', 'status' => 'CPNS', 'tubel' => 'tidak', 's1' => 0, 's3' => 0, 'pw2' => 0, 'pw4' => 0, 'sakit' => 0, 'b3' => 0, 'alfa' => 0],
            8 => ['nip' => '9990001008', 'jab' => $jabLektor,       'gol' => 'III/c', 'status' => 'PNS', 'tubel' => 'tugas_belajar', 's1' => 0, 's3' => 0, 'pw2' => 0, 'pw4' => 0, 'sakit' => 0, 'b3' => 0, 'alfa' => 0],
            9 => ['nip' => '9990001009', 'jab' => $jabLektorKepala, 'gol' => 'IV/b', 'status' => 'PNS', 'tubel' => 'tidak', 's1' => 0, 's3' => 0, 'pw2' => 0, 'pw4' => 0, 'sakit' => 0, 'b3' => 0, 'alfa' => 0],
            10 => ['nip' => '9990001010', 'jab' => $jabLektor,      'gol' => 'III/c', 'status' => 'PNS', 'tubel' => 'tidak', 's1' => 0, 's3' => 0, 'pw2' => 0, 'pw4' => 0, 'sakit' => 12, 'b3' => 0, 'alfa' => 0],
        ];

        foreach ($sampelDef as $idx => $s) {
            $pegawai = Pegawai::updateOrCreate(
                ['NIP' => $s['nip']],
                [
                    'unit_id' => $unit->id,
                    'nama' => "Sampel Pegawai {$idx}",
                    'jenis' => 'Dosen',
                    'status_kepegawaian' => $s['status'],
                    'status_tugas_belajar' => $s['tubel'],
                    'pangkat_golongan' => $s['gol'],
                    'status_skp' => 100,
                    'aktif' => true,
                ]
            );

            UsulanJabatan::updateOrCreate(
                ['NIP' => $s['nip'], 'jabatan_id' => $s['jab']->id],
                [
                    'unit_id' => $unit->id,
                    'tanggal_berlaku' => '2024-01-01',
                    'status' => 'diverifikasi',
                ]
            );

            PresensiBulanan::updateOrCreate(
                ['NIP' => $s['nip'], 'presensi_report_id' => $report->id],
                [
                    'hari_kerja' => 22,
                    's1' => $s['s1'],
                    's3' => $s['s3'],
                    'pw2' => $s['pw2'],
                    'pw4' => $s['pw4'],
                    'cuti_sakit' => $s['sakit'],
                    'cuti_bersalin_3' => $s['b3'],
                    'alfa' => $s['alfa'],
                ]
            );
        }

        // Jalankan Engine Perhitungan P1
        $bendaharaUser = \App\Models\Akun::where('peran', 'bendahara')->first()
            ?: \App\Models\Akun::where('username', '2')->first();

        $controller = new PerhitunganController();
        $request = Request::create('/api/bendahara/hitung', 'POST', ['periode' => $periode]);
        $request->setUserResolver(fn() => $bendaharaUser);

        $response = $controller->hitung($request);
        $this->assertEquals(200, $response->getStatusCode(), 'Engine perhitungan harus mengembalikan 200 OK');

        $data = json_decode($response->getContent(), true);
        $pengajuanId = $data['pengajuan_id'];

        // Ambil hasil perhitungan dari database
        $hasil = \App\Models\HasilPerhitungan::where('pengajuan_id', $pengajuanId)
            ->whereIn('NIP', array_column($sampelDef, 'nip'))
            ->get();

        // UJI GROUND TRUTH SAMPEL 1:
        // Remun Grade 11 = 6.285.000, P1 Gross = 40% = 2.514.000, Potongan = 0, Bruto = 2.514.000, Gol IV/a (15%) = 377.100, Netto = 2.136.900
        $h1 = $hasil->firstWhere('NIP', '9990001001');
        $this->assertNotNull($h1, 'Hasil perhitungan untuk sampel 1 harus ada');
        $this->assertEquals(2514000, (float) $h1->p1_gross);
        $this->assertEquals(0, (float) $h1->pengurangan_rp);
        $this->assertEquals(2514000, (float) $h1->p1_setelah_potongan);
        $this->assertEquals(377100, (float) $h1->pajak_pph21);
        $this->assertEquals(2136900, (float) $h1->p1_netto);

        // UJI GROUND TRUTH SAMPEL 2:
        // Remun Grade 10 = 5.232.000, P1 Gross = 40% = 2.092.800
        // Potongan TL.1 (0.25%) + TL.3 (1%) = 1.25% x 2.092.800 = 26.160
        // Bruto = 2.092.800 - 26.160 = 2.066.640
        // Gol III/c (5%) = 103.332, Netto = 1.963.308
        $h2 = $hasil->firstWhere('NIP', '9990001002');
        $this->assertNotNull($h2, 'Hasil perhitungan untuk sampel 2 harus ada');
        $this->assertEquals(2092800, (float) $h2->p1_gross);
        $this->assertEquals(26160, (float) $h2->pengurangan_rp);
        $this->assertEquals(2066640, (float) $h2->p1_setelah_potongan);
        $this->assertEquals(103332, (float) $h2->pajak_pph21);
        $this->assertEquals(1963308, (float) $h2->p1_netto);

        // UJI GROUND TRUTH SAMPEL 6 (Alfa 1 hari = 5%):
        // Remun Grade 10 = 2.092.800, Potongan 5% = 104.640, Bruto = 1.988.160, Pajak 5% = 99.408, Netto = 1.888.752
        $h6 = $hasil->firstWhere('NIP', '9990001006');
        $this->assertNotNull($h6, 'Hasil perhitungan untuk sampel 6 harus ada');
        $this->assertEquals(2092800, (float) $h6->p1_gross);
        $this->assertEquals(104640, (float) $h6->pengurangan_rp);
        $this->assertEquals(1988160, (float) $h6->p1_setelah_potongan);
        $this->assertEquals(99408, (float) $h6->pajak_pph21);
        $this->assertEquals(1888752, (float) $h6->p1_netto);

        // UJI GROUND TRUTH SAMPEL 7 (CPNS: Pengurangan 20%):
        // Remun Grade 9 = 4.500.000, P1 Gross = 40% = 1.800.000, Potongan CPNS 20% = 360.000, Bruto = 1.440.000, Pajak 5% = 72.000, Netto = 1.368.000
        $h7 = $hasil->firstWhere('NIP', '9990001007');
        $this->assertNotNull($h7, 'Hasil perhitungan untuk sampel 7 harus ada');
        $this->assertEquals(1800000, (float) $h7->p1_gross);
        $this->assertEquals(360000, (float) $h7->pengurangan_rp);
        $this->assertEquals(1440000, (float) $h7->p1_setelah_potongan);
        $this->assertEquals(72000, (float) $h7->pajak_pph21);
        $this->assertEquals(1368000, (float) $h7->p1_netto);

        // UJI GROUND TRUTH SAMPEL 8 (Tugas Belajar: Pengurangan 25%):
        // Remun Grade 10 = 2.092.800, Potongan Tubel 25% = 523.200, Bruto = 1.569.600, Pajak 5% = 78.480, Netto = 1.491.120
        $h8 = $hasil->firstWhere('NIP', '9990001008');
        $this->assertNotNull($h8, 'Hasil perhitungan untuk sampel 8 harus ada');
        $this->assertEquals(2092800, (float) $h8->p1_gross);
        $this->assertEquals(523200, (float) $h8->pengurangan_rp);
        $this->assertEquals(1569600, (float) $h8->p1_setelah_potongan);
        $this->assertEquals(78480, (float) $h8->pajak_pph21);
        $this->assertEquals(1491120, (float) $h8->p1_netto);

        // UJI GROUND TRUTH SAMPEL 10 (Fisik Absen 12 hari > 50% hari kerja 22):
        // Potongan 100% -> P1 Setalah Potongan = 0, Netto = 0
        $h10 = $hasil->firstWhere('NIP', '9990001010');
        $this->assertNotNull($h10, 'Hasil perhitungan untuk sampel 10 harus ada');
        $this->assertEquals(0, (float) $h10->p1_setelah_potongan);
        $this->assertEquals(0, (float) $h10->p1_netto);

        // UJI SILANG TOTAL AMPRAH = TOTAL NETTO
        $totalNettoSampel = $hasil->sum('p1_netto');
        $amprahTotal = \App\Models\HasilPerhitungan::where('pengajuan_id', $pengajuanId)
            ->whereIn('NIP', array_column($sampelDef, 'nip'))
            ->sum('p1_netto');

        $this->assertEquals($totalNettoSampel, $amprahTotal, 'Total Amprah harus sama persis dengan Total Netto (Uji Silang L0 vs D8)');
    }
}
