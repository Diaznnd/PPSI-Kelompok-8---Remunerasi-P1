<?php

namespace App\Http\Controllers\Bendahara;

use App\Http\Controllers\Controller;
use App\Models\Grade;
use App\Models\HasilPerhitungan;
use App\Models\HukumanDisiplin;
use App\Models\ParameterRemunerasi;
use App\Models\Pegawai;
use App\Models\PengajuanP1;
use App\Models\PresensiBulanan;
use App\Models\PresensiReport;
use App\Models\RiwayatStatus;
use App\Models\RoleUnit;
use App\Models\UnitKerja;
use App\Models\UsulanJabatan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PerhitunganController extends Controller
{
    /**
     * Dapatkan unit kerja aktif milik bendahara (Isolasi Unit Kerja Ketat)
     */
    protected function getBendaharaUnit($user): ?UnitKerja
    {
        $roleUnit = RoleUnit::where('role_id', $user->id)
            ->where('peran', 'bendahara')
            ->where('aktif', true)
            ->first();

        if (!$roleUnit || !$roleUnit->unit_id) {
            return null;
        }

        return UnitKerja::find($roleUnit->unit_id);
    }

    /**
     * Cek kesiapan data dan parameter perhitungan P1
     */
    public function kesiapan(Request $request): JsonResponse
    {
        $user = $request->user();
        $unit = $this->getBendaharaUnit($user);

        if (!$unit) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $periode = $request->query('periode', '2026-10');

        $totalPegawai = Pegawai::where('unit_id', $unit->id)->where('aktif', true)->count();
        $presensiReport = PresensiReport::where('unit_id', $unit->id)->where('periode', $periode)->first();

        // Parameter Pokok dari DB
        $pir = (float) (ParameterRemunerasi::where('kode', 'PIR')->value('nilai') ?? 3000);
        $persenP1 = (float) (ParameterRemunerasi::where('kode', 'PERSEN_P1')->value('nilai') ?? 40);

        // Grade parameter
        $grades = Grade::orderBy('kode_grade')->get()->map(fn ($g) => [
            'grade' => $g->kode_grade,
            'nilai' => (float) ($g->nilai >= 50000 ? $g->nilai : $g->nilai * $pir),
        ]);

        if ($grades->isEmpty()) {
            $grades = collect([
                ['grade' => 'Grade 17', 'nilai' => 21540000.00],
                ['grade' => 'Grade 16 WR1', 'nilai' => 16134000.00],
                ['grade' => 'Grade 16 WR2', 'nilai' => 16254000.00],
                ['grade' => 'Grade 16 WR3, WR4', 'nilai' => 16065000.00],
                ['grade' => 'Grade 15', 'nilai' => 13455000.00],
                ['grade' => 'Grade 14', 'nilai' => 10869000.00],
                ['grade' => 'Grade 13', 'nilai' => 9054000.00],
                ['grade' => 'Grade 12 CG', 'nilai' => 7542000.00],
                ['grade' => 'Grade 12', 'nilai' => 7245000.00],
                ['grade' => 'Grade 11 Dosen', 'nilai' => 6285000.00],
                ['grade' => 'Grade 11', 'nilai' => 6282000.00],
                ['grade' => 'Grade 10', 'nilai' => 5232000.00],
                ['grade' => 'Grade 9 CG', 'nilai' => 4575000.00],
                ['grade' => 'Grade 9', 'nilai' => 4359000.00],
                ['grade' => 'Grade 8 / 8-S (Kasubbag)', 'nilai' => 3936000.00],
                ['grade' => 'Grade 7', 'nilai' => 3570000.00],
                ['grade' => 'Grade 6', 'nilai' => 2991000.00],
                ['grade' => 'Grade 5', 'nilai' => 2709000.00],
                ['grade' => 'Grade 3', 'nilai' => 2430000.00],
            ]);
        } else if (!$grades->contains(fn ($g) => str_contains($g['grade'], '8-S'))) {
            $grades->push([
                'grade' => 'Grade 8-S (Kasubbag)',
                'nilai' => 3936000.00,
            ]);
        }

        $presensiList = collect();
        if ($presensiReport) {
            $presensiList = PresensiBulanan::with('pegawai')
                ->where('presensi_report_id', $presensiReport->id)
                ->orderBy('NIP')
                ->get()
                ->map(function ($pb) {
                    $totalTl = (int) $pb->s1 + (int) $pb->s2 + (int) $pb->s3 + (int) $pb->s4 + (int) $pb->s5 + (int) $pb->s6;
                    $totalPsw = (int) $pb->pw1 + (int) $pb->pw2 + (int) $pb->pw3 + (int) $pb->pw4 + (int) $pb->pw5 + (int) $pb->pw6;
                    $totalCuti = (float) $pb->cuti_sakit + (float) $pb->cuti_bersalin_1_2 + (float) $pb->cuti_bersalin_3 + (float) $pb->cuti_bersalin_4_plus + (float) $pb->cuti_alasan_penting + (float) $pb->cuti_besar + (float) $pb->cuti_tahunan;
                    $alfa = (float) ($pb->alfa > 0 ? $pb->alfa : $pb->tidak_hadir);
                    $hariKerja = (float) ($pb->hari_kerja > 0 ? $pb->hari_kerja : 22);
                    $hadir = (float) ($pb->hadir ?? max(0, $hariKerja - $alfa - $totalCuti));

                    return [
                        'id' => $pb->id,
                        'nip' => $pb->NIP,
                        'nama' => $pb->pegawai?->nama ?? '-',
                        'hari_kerja' => $hariKerja,
                        'hadir' => $hadir,
                        'tidak_hadir' => $alfa,
                        'cuti_izin' => (float) ($pb->cuti_izin ?? $totalCuti),
                        'tl' => $totalTl,
                        'psw' => $totalPsw,
                        'status_validasi' => $pb->status_validasi ?? 'valid',
                    ];
                });
        }

        return response()->json([
            'unit' => [
                'id' => $unit->id,
                'nama' => $unit->nama,
            ],
            'periode' => $periode,
            'kesiapan' => [
                ['label' => 'Presensi lengkap terimpor', 'siap' => $presensiReport !== null && $presensiReport->status === 'valid'],
                ['label' => 'Persetujuan Rekap Absensi oleh PJ Unit', 'siap' => (bool) ($presensiReport?->siap_perhitungan ?? false)],
                ['label' => 'Pegawai aktif terdaftar', 'siap' => $totalPegawai > 0],
                ['label' => 'Parameter remunerasi berlaku', 'siap' => true],
                ['label' => 'Jabatan dan grade sesuai riwayat resmi', 'siap' => true],
            ],
            'presensi_status' => [
                'terimpor' => $presensiReport !== null,
                'status' => $presensiReport?->status,
                'status_approval' => $presensiReport?->status_approval ?? 'belum_ada',
                'siap_perhitungan' => (bool) ($presensiReport?->siap_perhitungan ?? false),
                'file_nama' => $presensiReport?->file_nama,
                'jumlah_baris' => $presensiList->count(),
            ],
            'presensi_list' => $presensiList,
            'parameter' => [
                'pir' => $pir,
                'persen_p1' => $persenP1,
                'grades' => $grades,
                'grade' => $grades,
                'tl_tier' => [
                    ['kode' => 'TL.1', 'rentang' => '0–60', 'tarif' => '0,25%', 'persen' => 0.25],
                    ['kode' => 'TL.2', 'rentang' => '61–75', 'tarif' => '0,5%', 'persen' => 0.5],
                    ['kode' => 'TL.3', 'rentang' => '76–90', 'tarif' => '1%', 'persen' => 1.0],
                    ['kode' => 'TL.4', 'rentang' => '91–105', 'tarif' => '1,5%', 'persen' => 1.5],
                    ['kode' => 'TL.5', 'rentang' => '106–120', 'tarif' => '2%', 'persen' => 2.0],
                    ['kode' => 'TL.6', 'rentang' => '121–240', 'tarif' => '2,5%', 'persen' => 2.5],
                ],
                'cuti_tarif' => [
                    ['jenis' => 'Cuti Sakit', 'tarif' => '1% per hari'],
                    ['jenis' => 'Cuti Bersalin anak ke-1 dan ke-2', 'tarif' => '1% per hari'],
                    ['jenis' => 'Cuti Bersalin anak ke-3', 'tarif' => '2% per hari'],
                    ['jenis' => 'Cuti Bersalin anak ke-4 dan seterusnya', 'tarif' => '3% per hari'],
                    ['jenis' => 'Cuti Karena Alasan Penting', 'tarif' => '3% per hari'],
                    ['jenis' => 'Cuti Besar', 'tarif' => '1,5% per hari'],
                    ['jenis' => 'Tidak Hadir Tanpa Keterangan (Alfa)', 'tarif' => '5% per hari'],
                    ['jenis' => 'Cuti Tahunan', 'tarif' => '0% per hari'],
                ],
            ],
        ]);
    }

    /**
     * Jalankan perhitungan P1 untuk seluruh pegawai di unit kerja bendahara
     */
    public function hitung(Request $request): JsonResponse
    {
        $user = $request->user();
        $unit = $this->getBendaharaUnit($user);

        if (!$unit) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $periode = $request->input('periode', '2026-10');

        // VALIDASI: Cek apakah presensi sudah di-approve
        $presensiReport = PresensiReport::where('unit_id', $unit->id)
            ->where('periode', $periode)
            ->first();

        if (!$presensiReport) {
            return response()->json([
                'message' => 'Rekap absensi periode ini belum diunggah oleh Kepegawaian.',
                'blocked' => true,
                'reason' => 'no_presensi',
            ], 400);
        }

        if ($presensiReport->status !== 'valid') {
            return response()->json([
                'message' => 'Rekap absensi masih memiliki data yang perlu dikoreksi. Status: ' . $presensiReport->status,
                'blocked' => true,
                'reason' => 'invalid_presensi',
            ], 400);
        }

        if ($presensiReport->status_approval !== 'disetujui') {
            $statusMsg = [
                'draft' => 'masih dalam draft',
                'menunggu_approval' => 'menunggu persetujuan Penanggung Jawab Unit',
                'ditolak' => 'ditolak oleh Penanggung Jawab Unit',
            ];
            return response()->json([
                'message' => 'Rekap absensi ' . ($statusMsg[$presensiReport->status_approval] ?? 'belum disetujui') . '. Perhitungan tidak dapat dilanjutkan.',
                'blocked' => true,
                'reason' => 'not_approved',
                'status_approval' => $presensiReport->status_approval,
            ], 400);
        }

        if (!$presensiReport->siap_perhitungan) {
            return response()->json([
                'message' => 'Rekap absensi belum siap untuk perhitungan.',
                'blocked' => true,
                'reason' => 'not_ready',
            ], 400);
        }

        /** @var JsonResponse $response */
        $response = DB::transaction(function () use ($unit, $periode, $user): JsonResponse {
            // Ambil parameter resmi dari database
            $pir = (float) (ParameterRemunerasi::where('kode', 'PIR')->value('nilai') ?? 3000);
            $persenP1 = (float) (ParameterRemunerasi::where('kode', 'PERSEN_P1')->value('nilai') ?? 40);

            // Cari atau buat draft pengajuan P1 untuk unit ini pada periode ini
            $pengajuan = PengajuanP1::firstOrCreate(
                ['unit_id' => $unit->id, 'periode' => $periode],
                [
                    'nomor_pengajuan' => 'P1-' . strtoupper(substr(str_replace(' ', '', $unit->nama), 0, 4)) . '-' . $periode,
                    'pengajuan_ke' => 1,
                    'status' => 'draft',
                    'bendahara_nama' => $user->nama ?? $user->username,
                    'bendahara_nip' => $user->NIP,
                ]
            );

            // Jika status sudah diajukan atau selesai, kembalikan data pratinjau yang ada
            if ($pengajuan->status !== 'draft' && $pengajuan->status !== 'dikembalikan') {
                return response()->json([
                    'message' => 'Pengajuan periode ini sudah dalam status ' . $pengajuan->status . ' dan terkunci.',
                    'pengajuan_id' => $pengajuan->id,
                ]);
            }

            // Ambil seluruh pegawai aktif di unit kerja ini (Isolasi Unit Kerja Ketat)
            $daftarPegawai = Pegawai::where('unit_id', $unit->id)
                ->where('aktif', true)
                ->with(['usulanJabatanTerakhir.jabatan.grade'])
                ->get();

            $totalRemP1 = 0;
            $totalPengurangan = 0;
            $totalBruto = 0;
            $totalPajak = 0;
            $totalNetto = 0;

            foreach ($daftarPegawai as $p) {
                // Tentukan nilai jabatan & grade
                $usulan = $p->usulanJabatanTerakhir;
                $namaJabatan = $usulan?->jabatan?->nama_jabatan ?? 'Pegawai';
                $gradeKode = $usulan?->jabatan?->grade?->kode_grade ?? 'Grade 10';

                // Pembeda Grade 8-S untuk Kepala Subbagian (Kasubbag Grade 8-S = Rp 3.936.000)
                $isKasubbag = stripos($namaJabatan, 'Kepala Subbagian') !== false
                    || stripos($namaJabatan, 'Kasubbag') !== false
                    || $gradeKode === '8-S'
                    || $gradeKode === 'Grade 8-S';

                if ($isKasubbag) {
                    $gradeKode = '8-S';
                    $nilaiJabatan = 3936000.00;
                } else {
                    $gradeNilai = (float) ($usulan?->jabatan?->grade?->nilai ?? 5232000.00);
                    $nilaiJabatan = $gradeNilai >= 50000 ? $gradeNilai : ($gradeNilai * $pir);
                }

                // Hitung P1 Gross: 40% x Nilai Jabatan
                $p1Gross = round(($nilaiJabatan * $persenP1) / 100);
                $p1Base = $p1Gross;

                // Ambil data presensi bulanan sesuai periode (atau terbaru)
                $presensi = PresensiBulanan::where('NIP', $p->NIP)
                    ->whereHas('presensiReport', fn ($q) => $q->where('periode', $periode))
                    ->latest('id')
                    ->first() ?? PresensiBulanan::where('NIP', $p->NIP)->latest('id')->first();
                $hariKerja = $presensi && (float) $presensi->hari_kerja > 0 ? (float) $presensi->hari_kerja : 22;

                $cutiSakit = $presensi ? (float) $presensi->cuti_sakit : 0;
                $cutiBersalin12 = $presensi ? (float) $presensi->cuti_bersalin_1_2 : 0;
                $cutiBersalin3 = $presensi ? (float) $presensi->cuti_bersalin_3 : 0;
                $cutiBersalin4 = $presensi ? (float) $presensi->cuti_bersalin_4_plus : 0;
                $cutiPenting = $presensi ? (float) $presensi->cuti_alasan_penting : 0;
                $cutiBesar = $presensi ? (float) $presensi->cuti_besar : 0;
                $alfa = $presensi ? (float) ($presensi->alfa > 0 ? $presensi->alfa : $presensi->tidak_hadir) : 0;

                // TL & PSW (s1..s6, pw1..pw6)
                $tlCount = [
                    (float) ($presensi?->s1 ?? 0),
                    (float) ($presensi?->s2 ?? 0),
                    (float) ($presensi?->s3 ?? 0),
                    (float) ($presensi?->s4 ?? 0),
                    (float) ($presensi?->s5 ?? 0),
                    (float) ($presensi?->s6 ?? 0),
                ];
                $pswCount = [
                    (float) ($presensi?->pw1 ?? 0),
                    (float) ($presensi?->pw2 ?? 0),
                    (float) ($presensi?->pw3 ?? 0),
                    (float) ($presensi?->pw4 ?? 0),
                    (float) ($presensi?->pw5 ?? 0),
                    (float) ($presensi?->pw6 ?? 0),
                ];

                $tarifTL = [0.25, 0.5, 1.0, 1.5, 2.0, 2.5];
                $persenTL = 0;
                foreach ($tlCount as $i => $cnt) {
                    $persenTL += $cnt * $tarifTL[$i];
                }
                $persenPSW = 0;
                foreach ($pswCount as $i => $cnt) {
                    $persenPSW += $cnt * $tarifTL[$i];
                }

                $persenCuti = ($cutiSakit * 1.0)
                    + ($cutiBersalin12 * 1.0)
                    + ($cutiBersalin3 * 2.0)
                    + ($cutiBersalin4 * 3.0)
                    + ($cutiPenting * 3.0)
                    + ($cutiBesar * 1.5)
                    + ($alfa * 5.0);

                // Total Persen Pengurangan Kehadiran
                $persenPotongHadir = $persenTL + $persenPSW + $persenCuti;

                // Cek Aturan Fisik 50%
                $totalFisik = $cutiSakit + $cutiBersalin12 + $cutiBersalin3 + $cutiBersalin4 + $cutiPenting + $cutiBesar + $alfa;
                $persenFisik = ($hariKerja > 0) ? ($totalFisik / $hariKerja) * 100 : 0;
                $remNol = $persenFisik > 50;
                $alasanNol = $remNol ? 'Ketidakhadiran fisik di atas 50% hari kerja (' . round($persenFisik, 1) . '%)' : null;

                $penguranganHadirRp = round(($p1Gross * $persenPotongHadir) / 100);

                // Faktor Khusus: CPNS (pengurangan 20%) & Tugas Belajar (pengurangan 25%)
                $statusPeg = strtoupper(trim((string) ($p->status_kepegawaian ?? '')));
                $isCpns = in_array($statusPeg, ['CPNS', 'CPT-PTNBH']) || str_contains($statusPeg, 'CPNS');
                $cpnsPersen = $isCpns ? 20.0 : 0.0;
                $cpnsRp = $isCpns ? round(($p1Gross * 20) / 100) : 0;

                $isTubel = ($p->status_tugas_belajar === 'tugas_belajar'
                    || stripos($statusPeg, 'TUGAS BELAJAR') !== false
                    || stripos($statusPeg, 'TUBEL') !== false);
                $tubelPersen = $isTubel ? 25.0 : 0.0;
                $tubelRp = $isTubel ? round(($p1Gross * 25) / 100) : 0;

                $deskripsiStatus = 'PNS (100%)';
                if ($isTubel) {
                    $deskripsiStatus = 'Tugas Belajar (Pengurangan 25%)';
                } elseif ($isCpns) {
                    $deskripsiStatus = ($p->status_kepegawaian ?: 'CPNS') . ' (Pengurangan 20%)';
                }

                // Penyetaraan Penilaian SKP / Kinerja / Perilaku Individu (Sheet FORM.xlsx)
                $skpNilaiRaw = $p->status_skp;
                $skpNilai = 100.0;
                if (is_numeric($skpNilaiRaw)) {
                    $skpNilai = (float) $skpNilaiRaw;
                } elseif (is_string($skpNilaiRaw) && !empty($skpNilaiRaw)) {
                    if (preg_match('/(\d+(\.\d+)?)/', $skpNilaiRaw, $m)) {
                        $skpNilai = (float) $m[1];
                    } elseif (stripos($skpNilaiRaw, 'sangat baik') !== false) {
                        $skpNilai = 100.0;
                    } elseif (stripos($skpNilaiRaw, 'baik') !== false) {
                        $skpNilai = 90.0;
                    } elseif (stripos($skpNilaiRaw, 'cukup') !== false) {
                        $skpNilai = 75.0;
                    } elseif (stripos($skpNilaiRaw, 'kurang') !== false) {
                        $skpNilai = 50.0;
                    }
                }

                if ($skpNilai >= 90) {
                    $skpCapaian = 100.0;
                } elseif ($skpNilai >= 85) {
                    $skpCapaian = 95.0;
                } elseif ($skpNilai >= 80) {
                    $skpCapaian = 90.0;
                } elseif ($skpNilai >= 75) {
                    $skpCapaian = 85.0;
                } elseif ($skpNilai >= 70) {
                    $skpCapaian = 80.0;
                } elseif ($skpNilai >= 65) {
                    $skpCapaian = 75.0;
                } elseif ($skpNilai >= 60) {
                    $skpCapaian = 70.0;
                } elseif ($skpNilai >= 55) {
                    $skpCapaian = 65.0;
                } elseif ($skpNilai >= 50) {
                    $skpCapaian = 50.0;
                } else {
                    $skpCapaian = 0.0;
                }

                $skpPenguranganPersen = max(0.0, 100.0 - $skpCapaian);
                $skpPenguranganRp = round(($p1Gross * $skpPenguranganPersen) / 100);

                if ($skpCapaian === 0.0 && $skpNilai < 50) {
                    $remNol = true;
                    $alasanNol = $alasanNol ?: 'Capaian SKP di bawah 50% (tidak memenuhi syarat bayar)';
                }

                // Potongan Hukuman Disiplin
                $hukdis = HukumanDisiplin::where('NIP', $p->NIP)
                    ->where(function ($q) {
                        $q->whereNull('tanggal_mulai')
                            ->orWhere('tanggal_mulai', '<=', now());
                    })
                    ->where(function ($q) {
                        $q->whereNull('tanggal_berakhir')
                            ->orWhere('tanggal_berakhir', '>=', now());
                    })
                    ->first();
                $persenHukdis = 0;
                if ($hukdis) {
                    $tingkatLower = strtolower($hukdis->tingkat ?? '');
                    if ($tingkatLower === 'sedang') {
                        $persenHukdis = 25;
                    } elseif ($tingkatLower === 'berat') {
                        $persenHukdis = 100;
                        $remNol = true;
                        $alasanNol = $alasanNol ?: 'Hukuman Disiplin Tingkat Berat (Potongan 100%)';
                    }
                }
                $potonganDisiplinRp = round(($p1Gross * $persenHukdis) / 100);

                // Perhitungan Rupiah Bruto
                if ($remNol) {
                    $totalPenguranganRp = $p1Gross;
                    $p1Bruto = 0;
                } else {
                    $totalPenguranganRp = $penguranganHadirRp + $cpnsRp + $tubelRp + $potonganDisiplinRp + $skpPenguranganRp;
                    $p1Bruto = max(0, $p1Gross - $totalPenguranganRp);
                }

                // Pajak PPh 21 Berdasarkan Golongan Pegawai (Tabel Potongan Pajak Page 2)
                // Gol IV: 15%, Gol III: 5%, Gol II: 5%, Gol I: 0%, Lainnya: 5%
                $pangkatGol = (string) ($p->pangkat_golongan ?? '');
                $tarifPersen = 5;
                if (preg_match('/\bIV\/[a-e]\b/i', $pangkatGol) || str_contains($pangkatGol, 'IV/') || stripos($pangkatGol, 'Pembina') !== false) {
                    $tarifPersen = 15;
                } elseif (preg_match('/\bIII\/[a-d]\b/i', $pangkatGol) || str_contains($pangkatGol, 'III/') || stripos($pangkatGol, 'Penata') !== false) {
                    $tarifPersen = 5;
                } elseif (preg_match('/\bII\/[a-d]\b/i', $pangkatGol) || str_contains($pangkatGol, 'II/') || stripos($pangkatGol, 'Pengatur') !== false) {
                    $tarifPersen = 5;
                } elseif (preg_match('/\bI\/[a-d]\b/i', $pangkatGol) || str_contains($pangkatGol, 'I/') || stripos($pangkatGol, 'Juru') !== false) {
                    $tarifPersen = 0;
                }

                $pajakPPh21 = round(($p1Bruto * $tarifPersen) / 100);
                $p1Netto = max(0, $p1Bruto - $pajakPPh21);

                // Detail lengkap potongan untuk disimpan
                $rincianPotongan = [
                    'grade_kode' => $gradeKode,
                    'is_kasubbag' => $isKasubbag,
                    'tl' => $tlCount,
                    'psw' => $pswCount,
                    'tarif_tl' => $tarifTL,
                    'persen_tl' => $persenTL,
                    'persen_psw' => $persenPSW,
                    'cuti' => [
                        'sakit' => $cutiSakit,
                        'bersalin12' => $cutiBersalin12,
                        'bersalin3' => $cutiBersalin3,
                        'bersalin4' => $cutiBersalin4,
                        'penting' => $cutiPenting,
                        'besar' => $cutiBesar,
                        'alfa' => $alfa,
                    ],
                    'persen_cuti' => $persenCuti,
                    'persen_potong_hadir' => $persenPotongHadir,
                    'pengurangan_hadir_rp' => $penguranganHadirRp,
                    'is_cpns' => $isCpns,
                    'cpns_persen' => $cpnsPersen,
                    'cpns_rp' => $cpnsRp,
                    'is_tubel' => $isTubel,
                    'tubel_persen' => $tubelPersen,
                    'tubel_rp' => $tubelRp,
                    'skp_nilai' => $skpNilai,
                    'skp_capaian' => $skpCapaian,
                    'skp_pengurangan_persen' => $skpPenguranganPersen,
                    'skp_pengurangan_rp' => $skpPenguranganRp,
                    'persen_hukdis' => $persenHukdis,
                    'potong_disiplin_rp' => $potonganDisiplinRp,
                    'total_pengurangan_rp' => $totalPenguranganRp,
                    'tarif_pajak_persen' => $tarifPersen,
                    'pajak_pph21' => $pajakPPh21,
                    'p1_bruto' => $p1Bruto,
                    'p1_netto' => $p1Netto,
                ];

                // Buat / Update rekaman HasilPerhitungan
                HasilPerhitungan::updateOrCreate(
                    [
                        'pengajuan_id' => $pengajuan->id,
                        'NIP' => $p->NIP,
                        'periode' => $periode,
                    ],
                    [
                        'usulan_jabatan_id' => $usulan?->id,
                        'presensi_bulanan_id' => $presensi?->id,
                        'hukuman_id' => $hukdis?->id,
                        'kelompok_amprah' => $p->jenis === 'Dosen' ? 'Dosen' : 'Tenaga Kependidikan',
                        'nilai_jabatan' => $nilaiJabatan,
                        'pir' => $pir,
                        'persen_p1' => $persenP1,
                        'p1_gross' => $p1Gross,
                        'persen_status' => 100.0 - $cpnsPersen - $tubelPersen,
                        'p1_pertimbang' => $p1Gross,
                        'pengurangan_rp' => $totalPenguranganRp,
                        'pengali_status' => $deskripsiStatus,
                        'persen_potongan_hadir' => $persenPotongHadir,
                        'persen_hukdis' => $persenHukdis,
                        'total_persen_potongan' => $persenPotongHadir + $cpnsPersen + $tubelPersen + $persenHukdis + $skpPenguranganPersen,
                        'rincian_potongan' => $rincianPotongan,
                        'alasan_nol' => $alasanNol,
                        'p1_setelah_potongan' => $p1Bruto,
                        'pajak_pph21' => $pajakPPh21,
                        'tab_pajak' => ['tarif_persen' => $tarifPersen, 'golongan' => $pangkatGol, 'pajak' => $pajakPPh21],
                        'p1_netto' => $p1Netto,
                    ]
                );

                $totalRemP1 += $p1Gross;
                $totalPengurangan += $totalPenguranganRp;
                $totalBruto += $p1Bruto;
                $totalPajak += $pajakPPh21;
                $totalNetto += $p1Netto;
            }

            // Update total di pengajuan
            $pengajuan->update([
                'total_remunerasi' => $totalRemP1,
                'total_pengurangan' => $totalPengurangan,
                'total_bruto' => $totalBruto,
            ]);

            return response()->json([
                'message' => 'Perhitungan P1 untuk unit ' . $unit->nama . ' berhasil dijalankan.',
                'pengajuan_id' => $pengajuan->id,
                'periode' => $periode,
                'ringkasan' => [
                    'total_pegawai' => $daftarPegawai->count(),
                    'total_rem_p1' => $totalRemP1,
                    'total_pengurangan' => $totalPengurangan,
                    'total_bruto' => $totalBruto,
                    'total_pajak' => $totalPajak,
                    'total_netto' => $totalNetto,
                ],
            ]);
        });

        return $response;
    }

    /**
     * Dapatkan daftar hasil pratinjau perhitungan P1 unit
     */
    public function pratinjau(Request $request): JsonResponse
    {
        $user = $request->user();
        $unit = $this->getBendaharaUnit($user);

        if (!$unit) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $periode = $request->query('periode', '2026-10');

        $pengajuan = PengajuanP1::where('unit_id', $unit->id)
            ->where('periode', $periode)
            ->latest('id')
            ->first();

        $query = HasilPerhitungan::with(['pegawai.unitKerja', 'usulanJabatan.jabatan.grade', 'presensiBulanan'])
            ->whereHas('pegawai', fn ($q) => $q->where('unit_id', $unit->id))
            ->where('periode', $periode);

        if ($pengajuan) {
            $query->where('pengajuan_id', $pengajuan->id);
        }

        $hasilList = $query->get()->map(function ($h) {
            $p = $h->pegawai;
            $pr = $h->presensiBulanan;
            $rinc = $h->rincian_potongan ?? [];

            $tl = $rinc['tl'] ?? [
                (float) ($pr?->s1 ?? 0),
                (float) ($pr?->s2 ?? 0),
                (float) ($pr?->s3 ?? 0),
                (float) ($pr?->s4 ?? 0),
                (float) ($pr?->s5 ?? 0),
                (float) ($pr?->s6 ?? 0),
            ];
            $psw = $rinc['psw'] ?? [
                (float) ($pr?->pw1 ?? 0),
                (float) ($pr?->pw2 ?? 0),
                (float) ($pr?->pw3 ?? 0),
                (float) ($pr?->pw4 ?? 0),
                (float) ($pr?->pw5 ?? 0),
                (float) ($pr?->pw6 ?? 0),
            ];

            return [
                'nip' => $h->NIP,
                'nama' => $p?->nama ?? $h->NIP,
                'pangkat' => $p?->pangkat_golongan ?? '-',
                'jabatan' => $h->usulanJabatan?->jabatan?->nama_jabatan ?? 'Pegawai',
                'grade' => $rinc['grade_kode'] ?? ($h->usulanJabatan?->jabatan?->grade?->kode_grade ?? 'Grade 10'),
                'isKasubbag' => $rinc['is_kasubbag'] ?? false,
                'nilaiJabatan' => (float) $h->nilai_jabatan,
                'pengali' => (float) ($h->persen_status ?? 100),
                'pengali_status' => $h->pengali_status,
                'hukdis' => (float) ($h->persen_hukdis ?? 0),
                'pajak' => (float) ($h->pajak_pph21 ?? 0),
                'tarifPajakPersen' => (float) ($rinc['tarif_pajak_persen'] ?? 5),
                'npwp' => $p?->npwp ?? '-',
                'remGrade' => (float) $h->nilai_jabatan,
                'p1' => (float) $h->p1_gross,
                'remP1' => (float) $h->p1_gross,
                'totalPersen' => (float) $h->total_persen_potongan,
                'persenPotongHadir' => (float) $h->persen_potongan_hadir,
                'penguranganHadirRp' => (float) ($rinc['pengurangan_hadir_rp'] ?? $h->pengurangan_rp),
                'isCpns' => (bool) ($rinc['is_cpns'] ?? false),
                'cpnsPersen' => (float) ($rinc['cpns_persen'] ?? 0),
                'cpnsRp' => (float) ($rinc['cpns_rp'] ?? 0),
                'isTubel' => (bool) ($rinc['is_tubel'] ?? false),
                'tubelPersen' => (float) ($rinc['tubel_persen'] ?? 0),
                'tubelRp' => (float) ($rinc['tubel_rp'] ?? 0),
                'skpNilai' => (float) ($rinc['skp_nilai'] ?? 100),
                'skpCapaian' => (float) ($rinc['skp_capaian'] ?? 100),
                'skpPenguranganRp' => (float) ($rinc['skp_pengurangan_rp'] ?? 0),
                'pengurangan' => (float) $h->pengurangan_rp,
                'potongDisiplin' => (float) ($rinc['potong_disiplin_rp'] ?? 0),
                'bruto' => (float) $h->p1_setelah_potongan,
                'netto' => (float) $h->p1_netto,
                'remNol' => $h->alasan_nol !== null,
                'alasan_nol' => $h->alasan_nol,
                'rincianPotongan' => $rinc,
                'presensi' => [
                    'hariKerja' => (float) ($pr?->hari_kerja ?? 22),
                    'tl' => $tl,
                    'psw' => $psw,
                    'sakit' => (float) ($pr?->cuti_sakit ?? 0),
                    'bersalin12' => (float) ($pr?->cuti_bersalin_1_2 ?? 0),
                    'bersalin3' => (float) ($pr?->cuti_bersalin_3 ?? 0),
                    'bersalin4' => (float) ($pr?->cuti_bersalin_4_plus ?? 0),
                    'penting' => (float) ($pr?->cuti_alasan_penting ?? 0),
                    'besar' => (float) ($pr?->cuti_besar ?? 0),
                    'alfa' => (float) ($pr?->alfa ?? 0),
                ],
            ];
        });

        // Ringkasan
        $totalPegawai = $hasilList->count();
        $totalRemP1 = $hasilList->sum('remP1');
        $totalPengurangan = $hasilList->sum('pengurangan');
        $totalBruto = $hasilList->sum('bruto');
        $totalPajak = $hasilList->sum('pajak');
        $totalNetto = $hasilList->sum('netto');
        $nolCount = $hasilList->where('remNol', true)->count();
        $disiplinCount = $hasilList->where('hukdis', '>', 0)->count();

        return response()->json([
            'unit' => [
                'id' => $unit->id,
                'nama' => $unit->nama,
            ],
            'periode' => $periode,
            'pengajuan' => $pengajuan ? [
                'id' => $pengajuan->id,
                'nomor' => $pengajuan->nomor_pengajuan,
                'status' => $pengajuan->status,
                'pengajuan_ke' => $pengajuan->pengajuan_ke,
            ] : null,
            'ringkasan' => [
                'pegawai' => $totalPegawai,
                'remP1' => $totalRemP1,
                'pengurangan' => $totalPengurangan,
                'bruto' => $totalBruto,
                'pajak' => $totalPajak,
                'netto' => $totalNetto,
                'nolCount' => $nolCount,
                'disiplinCount' => $disiplinCount,
                'fisik50' => $nolCount,
            ],
            'data' => $hasilList,
        ]);
    }

    /**
     * Ekspor Rekapitulasi Pengurangan Remunerasi P1 dalam Format Excel/CSV Resmi
     */
    public function eksporExcel(Request $request): StreamedResponse|JsonResponse
    {
        $user = $request->user();
        $unit = $this->getBendaharaUnit($user);

        if (!$unit) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $periode = $request->query('periode', '2026-10');

        $query = HasilPerhitungan::with(['pegawai.unitKerja', 'usulanJabatan.jabatan.grade', 'presensiBulanan'])
            ->whereHas('pegawai', fn ($q) => $q->where('unit_id', $unit->id))
            ->where('periode', $periode);

        $data = $query->get();

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="Rekapitulasi_Pengurangan_Remunerasi_P1_' . str_replace(' ', '_', $unit->nama) . '_' . $periode . '.csv"',
        ];

        return response()->stream(function () use ($data, $unit, $periode) {
            $handle = fopen('php://output', 'w');
            // Write UTF-8 BOM agar Excel membukanya dengan karakter dan encoding yang tepat
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));

            // Judul Dokumen Resmi (seperti di FORM.xlsx)
            fputcsv($handle, ['REKAPITULASI PENGURANGAN REMUNERASI P1 UNIVERSITAS ANDALAS'], ';');
            fputcsv($handle, ['Unit / Fakultas: ' . $unit->nama, 'Periode: ' . $periode], ';');
            fputcsv($handle, [], ';');

            // Baris Header Kolom Lengkap
            fputcsv($handle, [
                'No', 'Nama', 'NIP', 'Pangkat/Gol.', 'Nama Jabatan', 'Grade Jabatan', 'Unit/Fakultas',
                'Remunerasi Per Grade Jabatan', 'Kehadiran (P1 40%)', 'P1/Bulan (Rp.)',
                'TL.1 (0-60) Hari', 'TL.1 %', 'TL.2 (61-75) Hari', 'TL.2 %', 'TL.3 (76-90) Hari', 'TL.3 %',
                'TL.4 (91-105) Hari', 'TL.4 %', 'TL.5 (106-120) Hari', 'TL.5 %', 'TL.6 (>120) Hari', 'TL.6 %',
                'PSW.1 (0-60) Hari', 'PSW.1 %', 'PSW.2 (61-75) Hari', 'PSW.2 %', 'PSW.3 (76-90) Hari', 'PSW.3 %',
                'PSW.4 (91-105) Hari', 'PSW.4 %', 'PSW.5 (106-120) Hari', 'PSW.5 %', 'PSW.6 (>120) Hari', 'PSW.6 %',
                'Cuti Sakit Hari', 'Cuti Sakit %',
                'Cuti Bersalin 1&2 Hari', 'Cuti Bersalin 1&2 %',
                'Cuti Bersalin 3 Hari', 'Cuti Bersalin 3 %',
                'Cuti Bersalin 4+ Hari', 'Cuti Bersalin 4+ %',
                'Cuti Alasan Penting Hari', 'Cuti Alasan Penting %',
                'Alfa Hari', 'Alfa %',
                'Jumlah Ketidakhadiran (%)', 'Pengurangan Kehadiran (Rp)',
                'CPNS (%)', 'Pengurangan CPNS (Rp)',
                'Tugas Belajar (%)', 'Pengurangan Tugas Belajar (Rp)',
                'SKP Capaian (%)', 'Pengurangan SKP (Rp)',
                'Hukuman Disiplin (%)', 'Pengurangan Disiplin (Rp)',
                'Total Pengurangan (Rp)', 'Jumlah Bruto (Rp)',
                'Tarif PPh 21 (%)', 'Pungutan PPh 21 (Rp)', 'Jumlah Diterima / Netto (Rp)',
            ], ';');

            $no = 1;
            foreach ($data as $h) {
                $p = $h->pegawai;
                $pr = $h->presensiBulanan;
                $rinc = $h->rincian_potongan ?? [];

                $tl = $rinc['tl'] ?? [(float)($pr?->s1 ?? 0), (float)($pr?->s2 ?? 0), (float)($pr?->s3 ?? 0), (float)($pr?->s4 ?? 0), (float)($pr?->s5 ?? 0), (float)($pr?->s6 ?? 0)];
                $psw = $rinc['psw'] ?? [(float)($pr?->pw1 ?? 0), (float)($pr?->pw2 ?? 0), (float)($pr?->pw3 ?? 0), (float)($pr?->pw4 ?? 0), (float)($pr?->pw5 ?? 0), (float)($pr?->pw6 ?? 0)];
                $sakit = (float)($pr?->cuti_sakit ?? 0);
                $b12 = (float)($pr?->cuti_bersalin_1_2 ?? 0);
                $b3 = (float)($pr?->cuti_bersalin_3 ?? 0);
                $b4 = (float)($pr?->cuti_bersalin_4_plus ?? 0);
                $penting = (float)($pr?->cuti_alasan_penting ?? 0);
                $alfa = (float)($pr?->alfa ?? 0);

                $tarifPajak = $rinc['tarif_pajak_persen'] ?? 5;

                fputcsv($handle, [
                    $no++,
                    $p?->nama ?? '-',
                    $h->NIP,
                    $p?->pangkat_golongan ?? '-',
                    $h->usulanJabatan?->jabatan?->nama_jabatan ?? 'Pegawai',
                    $rinc['grade_kode'] ?? ($h->usulanJabatan?->jabatan?->grade?->kode_grade ?? 'Grade 10'),
                    $unit->nama,
                    (float)$h->nilai_jabatan,
                    '40%',
                    (float)$h->p1_gross,
                    $tl[0], ($tl[0] * 0.25) . '%',
                    $tl[1], ($tl[1] * 0.5) . '%',
                    $tl[2], ($tl[2] * 1.0) . '%',
                    $tl[3], ($tl[3] * 1.5) . '%',
                    $tl[4], ($tl[4] * 2.0) . '%',
                    $tl[5], ($tl[5] * 2.5) . '%',
                    $psw[0], ($psw[0] * 0.25) . '%',
                    $psw[1], ($psw[1] * 0.5) . '%',
                    $psw[2], ($psw[2] * 1.0) . '%',
                    $psw[3], ($psw[3] * 1.5) . '%',
                    $psw[4], ($psw[4] * 2.0) . '%',
                    $psw[5], ($psw[5] * 2.5) . '%',
                    $sakit, ($sakit * 1.0) . '%',
                    $b12, ($b12 * 1.0) . '%',
                    $b3, ($b3 * 2.0) . '%',
                    $b4, ($b4 * 3.0) . '%',
                    $penting, ($penting * 3.0) . '%',
                    $alfa, ($alfa * 5.0) . '%',
                    (float)$h->persen_potongan_hadir . '%',
                    $rinc['pengurangan_hadir_rp'] ?? (float)$h->pengurangan_rp,
                    ($rinc['cpns_persen'] ?? 0) . '%',
                    $rinc['cpns_rp'] ?? 0,
                    ($rinc['tubel_persen'] ?? 0) . '%',
                    $rinc['tubel_rp'] ?? 0,
                    ($rinc['skp_capaian'] ?? 100) . '%',
                    $rinc['skp_pengurangan_rp'] ?? 0,
                    (float)$h->persen_hukdis . '%',
                    $rinc['potong_disiplin_rp'] ?? 0,
                    (float)$h->pengurangan_rp,
                    (float)$h->p1_setelah_potongan,
                    $tarifPajak . '%',
                    (float)$h->pajak_pph21,
                    (float)$h->p1_netto,
                ], ';');
            }

            fclose($handle);
        }, 200, $headers);
    }

    /**
     * Koreksi data presensi pegawai oleh bendahara sebelum diajukan
     */
    public function koreksiPresensi(Request $request, string $nip): JsonResponse
    {
        $user = $request->user();
        $unit = $this->getBendaharaUnit($user);

        if (!$unit) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $pegawai = Pegawai::where('NIP', $nip)->where('unit_id', $unit->id)->firstOrFail();

        $validated = $request->validate([
            'periode' => 'required|string',
            'sakit' => 'nullable|numeric|min:0',
            'bersalin12' => 'nullable|numeric|min:0',
            'bersalin3' => 'nullable|numeric|min:0',
            'bersalin4' => 'nullable|numeric|min:0',
            'penting' => 'nullable|numeric|min:0',
            'besar' => 'nullable|numeric|min:0',
            'alfa' => 'nullable|numeric|min:0',
            'tl' => 'nullable|array|size:6',
            'tl.*' => 'numeric|min:0',
            'psw' => 'nullable|array|size:6',
            'psw.*' => 'numeric|min:0',
        ]);

        $periode = $validated['periode'];

        // Cari atau buat report
        $report = PresensiReport::firstOrCreate(
            ['unit_id' => $unit->id, 'periode' => $periode],
            ['masa_file' => $periode, 'status' => 'valid', 'dimpor_at' => now()]
        );

        $presensi = PresensiBulanan::updateOrCreate(
            ['NIP' => $pegawai->NIP, 'presensi_report_id' => $report->id],
            [
                'hari_kerja' => 22,
                'cuti_sakit' => $validated['sakit'] ?? 0,
                'cuti_bersalin_1_2' => $validated['bersalin12'] ?? 0,
                'cuti_bersalin_3' => $validated['bersalin3'] ?? 0,
                'cuti_bersalin_4_plus' => $validated['bersalin4'] ?? 0,
                'cuti_alasan_penting' => $validated['penting'] ?? 0,
                'cuti_besar' => $validated['besar'] ?? 0,
                'alfa' => $validated['alfa'] ?? 0,
                's1' => $validated['tl'][0] ?? 0,
                's2' => $validated['tl'][1] ?? 0,
                's3' => $validated['tl'][2] ?? 0,
                's4' => $validated['tl'][3] ?? 0,
                's5' => $validated['tl'][4] ?? 0,
                's6' => $validated['tl'][5] ?? 0,
                'pw1' => $validated['psw'][0] ?? 0,
                'pw2' => $validated['psw'][1] ?? 0,
                'pw3' => $validated['psw'][2] ?? 0,
                'pw4' => $validated['psw'][3] ?? 0,
                'pw5' => $validated['psw'][4] ?? 0,
                'pw6' => $validated['psw'][5] ?? 0,
                'dikoreksi' => true,
            ]
        );

        return response()->json([
            'message' => 'Presensi pegawai ' . $pegawai->nama . ' berhasil dikoreksi.',
            'presensi' => $presensi,
        ]);
    }

    /**
     * Konfirmasi dan ajukan perhitungan P1 ke Verifikator
     */
    public function ajukan(Request $request): JsonResponse
    {
        $user = $request->user();
        $unit = $this->getBendaharaUnit($user);

        if (!$unit) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $validated = $request->validate([
            'periode' => 'required|string',
            'psk_nama' => 'nullable|string|max:150',
            'psk_nip' => 'nullable|string|max:30',
            'catatan' => 'nullable|string|max:500',
        ]);

        $periode = $validated['periode'];

        $pengajuan = PengajuanP1::where('unit_id', $unit->id)
            ->where('periode', $periode)
            ->latest('id')
            ->firstOrFail();

        $keStatus = 'diajukan';
        $dariStatus = $pengajuan->status;

        $pengajuan->update([
            'status' => $keStatus,
            'diajukan_at' => Carbon::now(),
            'bendahara_nama' => $user->nama ?? $user->username,
            'bendahara_nip' => $user->NIP,
            'psk_nama' => $validated['psk_nama'] ?? $pengajuan->psk_nama ?? 'Dekan / Pimpinan Unit',
            'psk_nip' => $validated['psk_nip'] ?? $pengajuan->psk_nip,
        ]);

        // Catat riwayat status
        RiwayatStatus::create([
            'pengajuan_id' => $pengajuan->id,
            'NIP' => $user->NIP,
            'dari_status' => $dariStatus,
            'ke_status' => $keStatus,
            'catatan_alasan' => $validated['catatan'] ?? 'Pengajuan P1 diajukan oleh Bendahara Unit.',
            'dicatat_at' => Carbon::now(),
        ]);

        return response()->json([
            'message' => 'Pengajuan P1 unit berhasil diajukan ke Verifikator.',
            'pengajuan' => [
                'id' => $pengajuan->id,
                'nomor_pengajuan' => $pengajuan->nomor_pengajuan,
                'pengajuan_ke' => $pengajuan->pengajuan_ke,
                'status' => $pengajuan->status,
                'diajukan_at' => $pengajuan->diajukan_at?->format('d F Y, H.i'),
            ],
        ]);
    }
}
