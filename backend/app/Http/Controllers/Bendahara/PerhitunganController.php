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
            'nilai' => (float) $g->nilai,
        ]);

        return response()->json([
            'unit' => [
                'id' => $unit->id,
                'nama' => $unit->nama,
            ],
            'periode' => $periode,
            'kesiapan' => [
                ['label' => 'Presensi lengkap', 'siap' => $presensiReport !== null],
                ['label' => 'Pegawai aktif terdaftar', 'siap' => $totalPegawai > 0],
                ['label' => 'Parameter remunerasi berlaku', 'siap' => true],
                ['label' => 'Jabatan dan grade sesuai riwayat resmi', 'siap' => true],
            ],
            'parameter' => [
                'pir' => $pir,
                'persen_p1' => $persenP1,
                'grades' => $grades,
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

        return DB::transaction(function () use ($unit, $periode, $user) {
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
                $gradeNilai = $usulan?->jabatan?->grade?->nilai ?? 5232000.00; // Standar Grade 10 jika belum ada
                $nilaiJabatan = (float) $gradeNilai;

                // Hitung P1 Gross: 40% x Nilai Jabatan
                $p1Gross = round(($nilaiJabatan * $persenP1) / 100);

                // Faktor status kepegawaian (Peraturan Rektor No. 2 Tahun 2026)
                $persenStatus = 100.0;
                $deskripsiStatus = 'PNS (100%)';
                if ($p->status_tugas_belajar === 'tugas_belajar') {
                    $persenStatus = 60.0;
                    $deskripsiStatus = 'Tugas Belajar (60%)';
                } elseif (in_array($p->status_kepegawaian, ['CPNS', 'CPT-PTNBH'])) {
                    $persenStatus = 80.0;
                    $deskripsiStatus = $p->status_kepegawaian . ' (80%)';
                }

                // P1 Base Pertimbangan
                $p1Base = round(($p1Gross * $persenStatus) / 100);

                // Ambil data presensi bulanan
                $presensi = PresensiBulanan::where('NIP', $p->NIP)->first();
                $hariKerja = $presensi ? (float) $presensi->hari_kerja : 22;

                $cutiSakit = $presensi ? (float) $presensi->cuti_sakit : 0;
                $cutiBersalin12 = $presensi ? (float) $presensi->cuti_bersalin_1_2 : 0;
                $cutiBersalin3 = $presensi ? (float) $presensi->cuti_bersalin_3 : 0;
                $cutiBersalin4 = $presensi ? (float) $presensi->cuti_bersalin_4_plus : 0;
                $cutiPenting = $presensi ? (float) $presensi->cuti_alasan_penting : 0;
                $cutiBesar = $presensi ? (float) $presensi->cuti_besar : 0;
                $alfa = $presensi ? (float) $presensi->alfa : 0;

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

                // Cek Aturan Fisik 50%
                $totalFisik = $cutiSakit + $cutiBersalin12 + $cutiBersalin3 + $cutiBersalin4 + $cutiPenting + $cutiBesar + $alfa;
                $persenFisik = ($hariKerja > 0) ? ($totalFisik / $hariKerja) * 100 : 0;
                $remNol = $persenFisik > 50;

                // Total Persen Pengurangan Kehadiran
                $persenPotongHadir = $persenTL + $persenPSW + $cutiSakit + $cutiBersalin12 + ($cutiBersalin3 * 2) + ($cutiBersalin4 * 3) + ($cutiPenting * 3) + ($cutiBesar * 1.5) + ($alfa * 5);

                // Potongan Hukuman Disiplin
                $hukdis = HukumanDisiplin::where('NIP', $p->NIP)
                    ->where(function ($q) {
                        $q->whereNull('tanggal_berakhir')
                            ->orWhere('tanggal_berakhir', '>=', now());
                    })
                    ->first();
                $persenHukdis = 0;
                if ($hukdis) {
                    if ($hukdis->tingkat === 'sedang') {
                        $persenHukdis = 25;
                    } elseif ($hukdis->tingkat === 'berat') {
                        $persenHukdis = 100;
                    }
                }

                // Perhitungan Rupiah
                if ($remNol) {
                    $penguranganRp = $p1Base;
                    $potonganDisiplinRp = 0;
                    $p1Bruto = 0;
                    $alasanNol = 'Ketidakhadiran fisik di atas 50% hari kerja (' . round($persenFisik, 1) . '%)';
                } else {
                    $penguranganRp = round(($p1Base * $persenPotongHadir) / 100);
                    $potonganDisiplinRp = round(($p1Base * $persenHukdis) / 100);
                    $p1Bruto = max(0, $p1Base - $penguranganRp - $potonganDisiplinRp);
                    $alasanNol = null;
                }

                // Pajak (PPh 21 / TER: acuan standar 5% bruto)
                $pajakPPh21 = round($p1Bruto * 0.05);
                $p1Netto = max(0, $p1Bruto - $pajakPPh21);

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
                        'persen_status' => $persenStatus,
                        'p1_pertimbang' => $p1Base,
                        'pengurangan_rp' => $penguranganRp,
                        'pengali_status' => $deskripsiStatus,
                        'persen_potongan_hadir' => $persenPotongHadir,
                        'persen_hukdis' => $persenHukdis,
                        'total_persen_potongan' => $persenPotongHadir + $persenHukdis,
                        'alasan_nol' => $alasanNol,
                        'p1_setelah_potongan' => $p1Bruto,
                        'pajak_pph21' => $pajakPPh21,
                        'p1_netto' => $p1Netto,
                    ]
                );

                $totalRemP1 += $p1Base;
                $totalPengurangan += $penguranganRp;
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

            return [
                'nip' => $h->NIP,
                'nama' => $p?->nama ?? $h->NIP,
                'pangkat' => $p?->pangkat_golongan ?? '-',
                'jabatan' => $h->usulanJabatan?->jabatan?->nama_jabatan ?? 'Pegawai',
                'grade' => $h->usulanJabatan?->jabatan?->grade?->kode_grade ?? 'Grade 10',
                'nilaiJabatan' => (float) $h->nilai_jabatan,
                'pengali' => (float) ($h->persen_status ?? 100),
                'pengali_status' => $h->pengali_status,
                'hukdis' => (float) ($h->persen_hukdis ?? 0),
                'pajak' => (float) ($h->pajak_pph21 ?? 0),
                'npwp' => $p?->npwp ?? '-',
                'remGrade' => (float) $h->nilai_jabatan,
                'p1' => (float) $h->p1_gross,
                'remP1' => (float) $h->p1_pertimbang,
                'totalPersen' => (float) $h->total_persen_potongan,
                'pengurangan' => (float) $h->pengurangan_rp,
                'potongDisiplin' => round(((float) $h->p1_pertimbang * (float) $h->persen_hukdis) / 100),
                'bruto' => (float) $h->p1_setelah_potongan,
                'netto' => (float) $h->p1_netto,
                'remNol' => $h->alasan_nol !== null,
                'alasan_nol' => $h->alasan_nol,
                'presensi' => [
                    'hariKerja' => (float) ($pr?->hari_kerja ?? 22),
                    'tl' => [
                        (float) ($pr?->s1 ?? 0),
                        (float) ($pr?->s2 ?? 0),
                        (float) ($pr?->s3 ?? 0),
                        (float) ($pr?->s4 ?? 0),
                        (float) ($pr?->s5 ?? 0),
                        (float) ($pr?->s6 ?? 0),
                    ],
                    'psw' => [
                        (float) ($pr?->pw1 ?? 0),
                        (float) ($pr?->pw2 ?? 0),
                        (float) ($pr?->pw3 ?? 0),
                        (float) ($pr?->pw4 ?? 0),
                        (float) ($pr?->pw5 ?? 0),
                        (float) ($pr?->pw6 ?? 0),
                    ],
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
