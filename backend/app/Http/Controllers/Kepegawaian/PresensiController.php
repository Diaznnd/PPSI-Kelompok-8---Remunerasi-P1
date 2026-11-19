<?php

namespace App\Http\Controllers\Kepegawaian;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\HukumanDisiplin;
use App\Models\Pegawai;
use App\Models\PresensiBulanan;
use App\Models\PresensiReport;
use App\Models\RoleUnit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PresensiController extends Controller
{
    protected function getKepegawaianUnitId(Request $request): ?int
    {
        $user = $request->user();
        if (!$user) {
            return null;
        }

        $roleUnit = RoleUnit::where('role_id', $user->id)
            ->where('peran', 'kepegawaian')
            ->where('aktif', true)
            ->first();

        return $roleUnit?->unit_id ?? $user->pegawai?->unit_id;
    }

    /**
     * Konversi string periode seperti "Oktober 2026" menjadi kode "2026-10" dan label "Oktober 2026"
     */
    protected function normalizePeriode(?string $input): array
    {
        $bulanMap = [
            'januari' => ['01', 'Januari'],
            'februari' => ['02', 'Februari'],
            'maret' => ['03', 'Maret'],
            'april' => ['04', 'April'],
            'mei' => ['05', 'Mei'],
            'juni' => ['06', 'Juni'],
            'juli' => ['07', 'Juli'],
            'agustus' => ['08', 'Agustus'],
            'september' => ['09', 'September'],
            'oktober' => ['10', 'Oktober'],
            'november' => ['11', 'November'],
            'desember' => ['12', 'Desember'],
        ];

        $kodeKeLabel = [
            '01' => 'Januari', '02' => 'Februari', '03' => 'Maret', '04' => 'April',
            '05' => 'Mei', '06' => 'Juni', '07' => 'Juli', '08' => 'Agustus',
            '09' => 'September', '10' => 'Oktober', '11' => 'November', '12' => 'Desember',
        ];

        if (!$input) {
            return ['kode' => '2026-10', 'label' => 'Oktober 2026'];
        }

        $trimmed = trim($input);
        if (preg_match('/^(\d{4})-(\d{2})$/', $trimmed, $m)) {
            $namaBulan = $kodeKeLabel[$m[2]] ?? 'Oktober';
            return ['kode' => "{$m[1]}-{$m[2]}", 'label' => "{$namaBulan} {$m[1]}"];
        }

        foreach ($bulanMap as $key => [$num, $label]) {
            if (stripos($trimmed, $key) !== false) {
                preg_match('/(\d{4})/', $trimmed, $ym);
                $tahun = $ym[1] ?? '2026';
                return ['kode' => "{$tahun}-{$num}", 'label' => "{$label} {$tahun}"];
            }
        }

        return ['kode' => '2026-10', 'label' => 'Oktober 2026'];
    }

    /**
     * Hitung ringkasan kehadiran & potongan untuk satu baris PresensiBulanan
     */
    protected function formatBarisPresensi(PresensiBulanan $pr, array $nipHukumanAktif): array
    {
        $hariKerja = (float) ($pr->hari_kerja > 0 ? $pr->hari_kerja : 22);

        $cutiSakit = (float) $pr->cuti_sakit;
        $cutiBersalin12 = (float) $pr->cuti_bersalin_1_2;
        $cutiBersalin3 = (float) $pr->cuti_bersalin_3;
        $cutiBersalin4 = (float) $pr->cuti_bersalin_4_plus;
        $cutiPenting = (float) $pr->cuti_alasan_penting;
        $cutiBesar = (float) $pr->cuti_besar;
        $cutiTahunan = (float) $pr->cuti_tahunan;
        $izin = (float) $pr->izin;
        $alfa = (float) $pr->alfa;

        $totalCutiResmi = (float) $pr->cuti_izin > 0
            ? (float) $pr->cuti_izin
            : ($cutiSakit + $cutiBersalin12 + $cutiBersalin3 + $cutiBersalin4 + $cutiPenting + $cutiBesar + $cutiTahunan + $izin);

        $tidakHadir = (float) $pr->tidak_hadir > 0 ? (float) $pr->tidak_hadir : $alfa;
        $hadir = (float) $pr->hadir > 0
            ? (float) $pr->hadir
            : max(0, $hariKerja - $tidakHadir - $totalCutiResmi);

        // Hitung persentase potongan kehadiran
        $tarifTL = [0.25, 0.5, 1.0, 1.5, 2.0, 2.5];
        $tl = [(float) $pr->s1, (float) $pr->s2, (float) $pr->s3, (float) $pr->s4, (float) $pr->s5, (float) $pr->s6];
        $psw = [(float) $pr->pw1, (float) $pr->pw2, (float) $pr->pw3, (float) $pr->pw4, (float) $pr->pw5, (float) $pr->pw6];

        $persenTL = 0;
        foreach ($tl as $i => $jml) {
            $persenTL += $jml * $tarifTL[$i];
        }
        $persenPSW = 0;
        foreach ($psw as $i => $jml) {
            $persenPSW += $jml * $tarifTL[$i];
        }

        // Cek ketidakhadiran fisik > 50%
        $totalFisikTidakHadir = $tidakHadir + $cutiSakit + $cutiBersalin12 + $cutiBersalin3 + $cutiBersalin4 + $cutiPenting + $cutiBesar;
        $persenTidakFisik = $hariKerja > 0 ? ($totalFisikTidakHadir / $hariKerja) * 100 : 0;
        $tidakLayakBayar = $persenTidakFisik > 50 || (($tidakHadir / max(1, $hariKerja)) * 100 > 50);

        // Jika menggunakan detail komponen vs ringkasan
        $potDetail = $persenTL + $persenPSW + ($cutiSakit * 1.0) + ($cutiBersalin12 * 1.0) + ($cutiBersalin3 * 2.0) + ($cutiBersalin4 * 3.0) + ($cutiPenting * 3.0) + ($cutiBesar * 1.5) + ($alfa * 5.0);
        if ($potDetail == 0 && $tidakHadir > 0) {
            $potDetail = $tidakHadir * 1.5;
        }

        $pot = $tidakLayakBayar ? round($persenTidakFisik, 2) : round($potDetail, 2);

        $statusValidasi = 'Valid';
        if ($tidakLayakBayar) {
            $statusValidasi = 'Tidak Layak Bayar';
        } elseif (in_array($pr->NIP, $nipHukumanAktif, true)) {
            $statusValidasi = 'Hukuman Aktif';
        }

        return [
            'id' => $pr->id,
            'NIP' => $pr->NIP,
            'nip' => $pr->NIP,
            'nama' => $pr->pegawai?->nama ?? $pr->NIP,
            'hariKerja' => (int) round($hariKerja),
            'hari_kerja' => (int) round($hariKerja),
            'hadir' => (int) round($hadir),
            'tidakHadir' => (int) round($tidakHadir),
            'tidak_hadir' => (int) round($tidakHadir),
            'cuti' => (int) round($totalCutiResmi),
            'cuti_izin' => (int) round($totalCutiResmi),
            'cuti_sakit' => (int) round($cutiSakit),
            'cuti_tahunan' => (int) round($cutiTahunan),
            'izin' => (int) round($izin),
            'alfa' => (int) round($alfa),
            'pot' => $pot,
            'status' => $statusValidasi,
            'dikoreksi' => (bool) $pr->dikoreksi,
            'alasan_koreksi' => $pr->alasan_koreksi,
        ];
    }

    /**
     * FR-07 (L3 & L4): Daftar presensi bulanan, rekap cuti/izin, riwayat impor, dan baris gagal
     */
    public function index(Request $request): JsonResponse
    {
        $unitId = $this->getKepegawaianUnitId($request) ?? 1;
        $periodeInfo = $this->normalizePeriode($request->query('periode'));
        $periodeKode = $periodeInfo['kode'];
        $periodeLabel = $periodeInfo['label'];

        $report = PresensiReport::where('unit_id', $unitId)
            ->where(function ($q) use ($periodeKode, $periodeLabel) {
                $q->where('periode', $periodeKode)
                    ->orWhere('masa_file', $periodeLabel);
            })
            ->latest('id')
            ->first();

        // Daftar NIP dengan hukuman disiplin aktif
        $hariIni = now()->format('Y-m-d');
        $nipHukumanAktif = HukumanDisiplin::whereHas('pegawai', fn ($q) => $q->where('unit_id', $unitId))
            ->where(function ($q) use ($hariIni) {
                $q->whereNull('tanggal_mulai')->orWhere('tanggal_mulai', '<=', $hariIni);
            })
            ->where(function ($q) use ($hariIni) {
                $q->whereNull('tanggal_berakhir')->orWhere('tanggal_berakhir', '>=', $hariIni);
            })
            ->pluck('NIP')
            ->toArray();

        $presensiQuery = PresensiBulanan::with('pegawai')
            ->whereHas('pegawai', fn ($q) => $q->where('unit_id', $unitId)->where('aktif', true));

        if ($report) {
            $presensiQuery->where('presensi_report_id', $report->id);
        }

        $presensiRows = $presensiQuery->get()->map(fn ($pr) => $this->formatBarisPresensi($pr, $nipHukumanAktif));

        // Filter search & status jika ada
        if ($request->filled('q')) {
            $q = strtolower($request->query('q'));
            $presensiRows = $presensiRows->filter(fn ($r) => str_contains(strtolower($r['nama'] . $r['nip']), $q))->values();
        }
        if ($request->filled('status') && $request->query('status') !== 'semua') {
            $st = $request->query('status');
            $presensiRows = $presensiRows->filter(fn ($r) => $r['status'] === $st)->values();
        }

        // Susun rekap cuti/izin dari baris presensi yang memiliki cuti/izin > 0
        $rekapCuti = [];
        foreach ($presensiQuery->get() as $pr) {
            if ((float) $pr->cuti_tahunan > 0) {
                $dur = (int) round((float) $pr->cuti_tahunan);
                $rekapCuti[] = [
                    'nip' => $pr->NIP,
                    'nama' => $pr->pegawai?->nama ?? $pr->NIP,
                    'jenis' => 'Cuti Tahunan',
                    'mulai' => "13 {$periodeLabel}",
                    'selesai' => (12 + $dur) . " {$periodeLabel}",
                    'durasi' => "{$dur} hari",
                    'status' => 'Disetujui',
                ];
            }
            if ((float) $pr->cuti_sakit > 0) {
                $dur = (int) round((float) $pr->cuti_sakit);
                $rekapCuti[] = [
                    'nip' => $pr->NIP,
                    'nama' => $pr->pegawai?->nama ?? $pr->NIP,
                    'jenis' => 'Izin Sakit / Cuti Sakit',
                    'mulai' => "10 {$periodeLabel}",
                    'selesai' => (9 + $dur) . " {$periodeLabel}",
                    'durasi' => "{$dur} hari",
                    'status' => 'Disetujui',
                ];
            }
            if ((float) $pr->izin > 0) {
                $dur = (int) round((float) $pr->izin);
                $rekapCuti[] = [
                    'nip' => $pr->NIP,
                    'nama' => $pr->pegawai?->nama ?? $pr->NIP,
                    'jenis' => 'Izin Resmi',
                    'mulai' => "18 {$periodeLabel}",
                    'selesai' => (17 + $dur) . " {$periodeLabel}",
                    'durasi' => "{$dur} hari",
                    'status' => 'Disetujui',
                ];
            }
        }

        // Riwayat Impor
        $riwayatImpor = PresensiReport::with('pegawai')
            ->where('unit_id', $unitId)
            ->orderByDesc('dimpor_at')
            ->orderByDesc('id')
            ->get()
            ->map(function ($rep) {
                return [
                    'id' => $rep->id,
                    'periode' => $rep->masa_file ?? $rep->periode,
                    'periode_kode' => $rep->periode,
                    'file' => $rep->nama_file ?? ('presensi_' . str_replace('-', '', $rep->periode ?? '202610') . '.xlsx'),
                    'pegawai' => (int) $rep->jumlah_valid,
                    'error' => (int) $rep->jumlah_gagal,
                    'baris_gagal' => $rep->baris_gagal ?? [],
                    'oleh' => $rep->pegawai?->nama ?? 'Bidang Kepegawaian',
                    'durasi' => $rep->durasi ?? '1 detik',
                    'status' => $rep->jumlah_gagal > 0 ? 'Perlu Koreksi' : 'Berhasil',
                    'waktu' => $rep->dimpor_at ? Carbon::parse($rep->dimpor_at)->translatedFormat('d M Y, H:i') . ' WIB' : '-',
                ];
            });

        $barisGagalAktif = $report?->baris_gagal ?? [];

        return response()->json([
            'periode' => $periodeLabel,
            'periode_kode' => $periodeKode,
            'report_id' => $report?->id,
            'status_impor' => [
                'periode' => $report?->masa_file ?? $periodeLabel,
                'pegawai' => $report ? (int) $report->jumlah_valid : $presensiRows->count(),
                'error' => $report ? (int) $report->jumlah_gagal : 0,
                'waktu' => $report?->dimpor_at ? Carbon::parse($report->dimpor_at)->translatedFormat('d M Y, H:i') . ' WIB' : now()->translatedFormat('d M Y, H:i') . ' WIB',
            ],
            'baris_gagal' => $barisGagalAktif,
            'data' => $presensiRows,
            'rekap_cuti' => $rekapCuti,
            'riwayat_impor' => $riwayatImpor,
        ]);
    }

    /**
     * FR-07 & NFR-11 (L3): Impor berkas rekap presensi dan cuti/izin bulanan (.csv / .xlsx / .xls),
     * validasi kecocokan NIP dan nilai kehadiran, simpan baris valid, dan catat baris gagal beserta alasannya.
     */
    public function import(Request $request): JsonResponse
    {
        $startTime = microtime(true);
        $user = $request->user();
        $unitId = $this->getKepegawaianUnitId($request) ?? 1;

        $periodeInfo = $this->normalizePeriode($request->input('periode', 'Oktober 2026'));
        $periodeKode = $periodeInfo['kode'];
        $periodeLabel = $periodeInfo['label'];

        $uploadedFile = $request->file('file') ?? $request->file('berkas');
        $namaFile = $request->input('nama_file', 'presensi_' . str_replace('-', '', $periodeKode) . '.xlsx');
        $rawRows = [];

        // NFR-11: Validasi format berkas wajib CSV atau Excel (.csv, .xlsx, .xls)
        if ($uploadedFile) {
            $ext = strtolower($uploadedFile->getClientOriginalExtension());
            $namaFile = $uploadedFile->getClientOriginalName();
            $sizeKb = $uploadedFile->getSize() / 1024;

            if (!in_array($ext, ['csv', 'xlsx', 'xls'], true)) {
                return response()->json([
                    'message' => 'Format berkas ditolak (NFR-11): Berkas rekap presensi hanya diterima dalam format CSV atau Excel (.csv, .xlsx, .xls).',
                    'errors' => [
                        'file' => ['Berkas rekap presensi hanya diterima dalam format CSV atau Excel (.csv, .xlsx, .xls).'],
                    ],
                ], 422);
            }

            if ($sizeKb > 10240) {
                return response()->json([
                    'message' => 'Ukuran berkas melebihi batas maksimal 10 MB.',
                    'errors' => [
                        'file' => ['Ukuran berkas maksimal 10 MB.'],
                    ],
                ], 422);
            }

            try {
                if ($ext === 'csv') {
                    $lines = file($uploadedFile->getRealPath(), FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
                    if ($lines && count($lines) > 0) {
                        $delimiter = str_contains($lines[0], ';') ? ';' : ',';
                        $headers = array_map(fn ($h) => strtolower(trim(preg_replace('/[\x00-\x1F\x80-\xFF]/', '', $h))), str_getcsv($lines[0], $delimiter));
                        for ($i = 1; $i < count($lines); $i++) {
                            $cols = str_getcsv($lines[$i], $delimiter);
                            if (count($cols) === 1 && trim((string) $cols[0]) === '') {
                                continue;
                            }
                            $rowAssoc = ['_baris' => $i + 1];
                            foreach ($headers as $idx => $hName) {
                                $rowAssoc[$hName] = isset($cols[$idx]) ? trim((string) $cols[$idx]) : '';
                            }
                            $rawRows[] = $rowAssoc;
                        }
                    }
                } else {
                    $spreadsheet = IOFactory::load($uploadedFile->getRealPath());
                    $sheetData = $spreadsheet->getActiveSheet()->toArray(null, true, true, false);
                    if (count($sheetData) > 0) {
                        $headers = array_map(fn ($h) => strtolower(trim((string) $h)), $sheetData[0]);
                        for ($i = 1; $i < count($sheetData); $i++) {
                            $cols = $sheetData[$i];
                            $nonEmpty = array_filter($cols, fn ($v) => $v !== null && trim((string) $v) !== '');
                            if (empty($nonEmpty)) {
                                continue;
                            }
                            $rowAssoc = ['_baris' => $i + 1];
                            foreach ($headers as $idx => $hName) {
                                if ($hName !== '') {
                                    $rowAssoc[$hName] = isset($cols[$idx]) ? trim((string) $cols[$idx]) : '';
                                }
                            }
                            $rawRows[] = $rowAssoc;
                        }
                    }
                }
            } catch (\Throwable $e) {
                return response()->json([
                    'message' => 'Berkas tidak dapat dibaca atau rusak. Pastikan format CSV/Excel sesuai template.',
                    'errors' => [
                        'file' => ['Berkas berformat salah atau rusak: ' . $e->getMessage()],
                    ],
                ], 422);
            }
        } elseif ($request->has('rows') && is_array($request->input('rows'))) {
            // Mendukung pengiriman array baris secara langsung (untuk pengujian API atau contoh)
            foreach ($request->input('rows') as $idx => $r) {
                $normalized = ['_baris' => $r['baris'] ?? ($idx + 2)];
                foreach ($r as $k => $v) {
                    $normalized[strtolower(trim((string) $k))] = $v;
                }
                $rawRows[] = $normalized;
            }
        } else {
            // Jika hanya memilih contoh berkas dari dialog frontend tanpa file fisik, gunakan semua pegawai aktif di unit
            $ext = strtolower(pathinfo($namaFile, PATHINFO_EXTENSION));
            if ($ext !== '' && !in_array($ext, ['csv', 'xlsx', 'xls'], true)) {
                return response()->json([
                    'message' => 'Format berkas ditolak (NFR-11): Berkas rekap presensi hanya diterima dalam format CSV atau Excel (.csv, .xlsx, .xls).',
                    'errors' => [
                        'file' => ['Berkas rekap presensi hanya diterima dalam format CSV atau Excel (.csv, .xlsx, .xls).'],
                    ],
                ], 422);
            }

            $pegawaiUnit = Pegawai::where('unit_id', $unitId)->where('aktif', true)->get();
            foreach ($pegawaiUnit as $idx => $p) {
                $rawRows[] = [
                    '_baris' => $idx + 2,
                    'nip' => $p->NIP,
                    'nama' => $p->nama,
                    'hari_kerja' => 22,
                    'hadir' => 22,
                    'tidak_hadir' => 0,
                    'cuti' => 0,
                    'izin' => 0,
                ];
            }
        }

        if (empty($rawRows)) {
            return response()->json([
                'message' => 'Berkas presensi kosong atau tidak memiliki baris data.',
                'errors' => [
                    'file' => ['Berkas presensi tidak berisi data pegawai.'],
                ],
            ], 422);
        }

        /** @var JsonResponse $response */
        $response = DB::transaction(function () use ($rawRows, $unitId, $user, $periodeKode, $periodeLabel, $namaFile, $startTime): JsonResponse {
            $report = PresensiReport::updateOrCreate(
                ['unit_id' => $unitId, 'periode' => $periodeKode],
                [
                    'NIP' => $user?->NIP,
                    'nama_file' => $namaFile,
                    'masa_file' => $periodeLabel,
                    'file_hash' => md5($namaFile . '_' . $periodeKode . '_' . count($rawRows)),
                    'status' => 'pending',
                    'dimpor_at' => now(),
                ]
            );

            $validCount = 0;
            $barisGagal = [];
            $seenNips = [];

            foreach ($rawRows as $idx => $row) {
                $nomorBaris = $row['_baris'] ?? ($idx + 2);
                $nip = trim((string) ($row['nip'] ?? $row['nik'] ?? $row['niku'] ?? ''));
                $nama = trim((string) ($row['nama'] ?? $row['nama_pegawai'] ?? '-'));

                $hkRaw = $row['hari_kerja'] ?? $row['harikerja'] ?? $row['hari kerja'] ?? 22;
                $hadirRaw = $row['hadir'] ?? $row['jumlah_hadir'] ?? $row['hari_hadir'] ?? null;
                $tidakHadirRaw = $row['tidak_hadir'] ?? $row['tidakhadir'] ?? $row['tidak hadir'] ?? $row['alfa'] ?? $row['a'] ?? 0;
                $cutiRaw = $row['cuti'] ?? $row['cuti_tahunan'] ?? $row['c'] ?? 0;
                $izinRaw = $row['izin'] ?? $row['i'] ?? 0;
                $sakitRaw = $row['sakit'] ?? $row['cuti_sakit'] ?? $row['s'] ?? 0;

                // 1. Validasi NIP kosong
                if ($nip === '') {
                    $barisGagal[] = [
                        'index' => count($barisGagal),
                        'baris' => $nomorBaris,
                        'nip' => '',
                        'nama' => $nama,
                        'hariKerja' => (int) $hkRaw,
                        'hadir' => (int) ($hadirRaw ?? 0),
                        'tidakHadir' => (int) $tidakHadirRaw,
                        'cuti' => (int) $cutiRaw + (int) $izinRaw + (int) $sakitRaw,
                        'alasan' => 'NIP kosong pada baris impor.',
                    ];
                    continue;
                }

                // 1b. Validasi NIP duplikat di dalam berkas impor yang sama
                if (isset($seenNips[$nip])) {
                    $barisGagal[] = [
                        'index' => count($barisGagal),
                        'baris' => $nomorBaris,
                        'nip' => $nip,
                        'nama' => $nama,
                        'hariKerja' => (int) $hkRaw,
                        'hadir' => (int) ($hadirRaw ?? 0),
                        'tidakHadir' => (int) $tidakHadirRaw,
                        'cuti' => (int) $cutiRaw + (int) $izinRaw + (int) $sakitRaw,
                        'alasan' => "NIP {$nip} duplikat di dalam berkas impor yang sama (sudah ada pada baris #{$seenNips[$nip]}).",
                    ];
                    continue;
                }

                // 2. Validasi kecocokan NIP pada database (NFR-11 & FR-07)
                $pegawai = Pegawai::where('NIP', $nip)->first();
                if (!$pegawai) {
                    $barisGagal[] = [
                        'index' => count($barisGagal),
                        'baris' => $nomorBaris,
                        'nip' => $nip,
                        'nama' => $nama,
                        'hariKerja' => (int) $hkRaw,
                        'hadir' => (int) ($hadirRaw ?? 0),
                        'tidakHadir' => (int) $tidakHadirRaw,
                        'cuti' => (int) $cutiRaw + (int) $izinRaw + (int) $sakitRaw,
                        'alasan' => "NIP {$nip} tidak terdaftar pada sistem.",
                    ];
                    continue;
                }

                if ($pegawai->unit_id !== $unitId) {
                    $barisGagal[] = [
                        'index' => count($barisGagal),
                        'baris' => $nomorBaris,
                        'nip' => $nip,
                        'nama' => $pegawai->nama,
                        'hariKerja' => (int) $hkRaw,
                        'hadir' => (int) ($hadirRaw ?? 0),
                        'tidakHadir' => (int) $tidakHadirRaw,
                        'cuti' => (int) $cutiRaw + (int) $izinRaw + (int) $sakitRaw,
                        'alasan' => "NIP {$nip} ({$pegawai->nama}) terdaftar pada unit kerja lain.",
                    ];
                    continue;
                }

                if (!$pegawai->aktif) {
                    $barisGagal[] = [
                        'index' => count($barisGagal),
                        'baris' => $nomorBaris,
                        'nip' => $nip,
                        'nama' => $pegawai->nama,
                        'hariKerja' => (int) $hkRaw,
                        'hadir' => (int) ($hadirRaw ?? 0),
                        'tidakHadir' => (int) $tidakHadirRaw,
                        'cuti' => (int) $cutiRaw + (int) $izinRaw + (int) $sakitRaw,
                        'alasan' => "Pegawai {$pegawai->nama} ({$nip}) berstatus nonaktif.",
                    ];
                    continue;
                }

                // 3. Validasi angka kehadiran
                if (!is_numeric($hkRaw) || !is_numeric($tidakHadirRaw) || !is_numeric($cutiRaw) || !is_numeric($izinRaw) || !is_numeric($sakitRaw)) {
                    $barisGagal[] = [
                        'index' => count($barisGagal),
                        'baris' => $nomorBaris,
                        'nip' => $nip,
                        'nama' => $pegawai->nama,
                        'hariKerja' => 22,
                        'hadir' => 0,
                        'tidakHadir' => 0,
                        'cuti' => 0,
                        'alasan' => 'Nilai kolom kehadiran/cuti bukan angka yang valid.',
                    ];
                    continue;
                }

                $hariKerja = (float) $hkRaw;
                $tidakHadir = (float) $tidakHadirRaw;
                $cutiTahunan = (float) $cutiRaw;
                $izin = (float) $izinRaw;
                $cutiSakit = (float) $sakitRaw;
                $totalCutiIzin = $cutiTahunan + $izin + $cutiSakit;

                $hadir = ($hadirRaw !== null && $hadirRaw !== '' && is_numeric($hadirRaw))
                    ? (float) $hadirRaw
                    : ($hariKerja - $tidakHadir - $totalCutiIzin);

                if ($hariKerja <= 0 || $hariKerja > 31 || $hadir < 0 || $tidakHadir < 0 || $totalCutiIzin < 0) {
                    $barisGagal[] = [
                        'index' => count($barisGagal),
                        'baris' => $nomorBaris,
                        'nip' => $nip,
                        'nama' => $pegawai->nama,
                        'hariKerja' => (int) $hariKerja,
                        'hadir' => (int) $hadir,
                        'tidakHadir' => (int) $tidakHadir,
                        'cuti' => (int) $totalCutiIzin,
                        'alasan' => 'Jumlah hari kerja harus antara 1 s.d. 31 hari dan nilai kehadiran/cuti tidak boleh negatif.',
                    ];
                    continue;
                }

                if (round($hadir + $tidakHadir + $totalCutiIzin, 1) != round($hariKerja, 1)) {
                    $barisGagal[] = [
                        'index' => count($barisGagal),
                        'baris' => $nomorBaris,
                        'nip' => $nip,
                        'nama' => $pegawai->nama,
                        'hariKerja' => (int) $hariKerja,
                        'hadir' => (int) $hadir,
                        'tidakHadir' => (int) $tidakHadir,
                        'cuti' => (int) $totalCutiIzin,
                        'alasan' => "Total Hadir ({$hadir}) + Tidak Hadir ({$tidakHadir}) + Cuti/Izin ({$totalCutiIzin}) tidak sama dengan Hari Kerja ({$hariKerja}).",
                    ];
                    continue;
                }

                $seenNips[$nip] = $nomorBaris;

                // Baris valid: simpan ke presensi_bulanan
                PresensiBulanan::updateOrCreate(
                    [
                        'presensi_report_id' => $report->id,
                        'NIP' => $pegawai->NIP,
                    ],
                    [
                        'hari_kerja' => $hariKerja,
                        'hadir' => $hadir,
                        'tidak_hadir' => $tidakHadir,
                        'cuti_izin' => $totalCutiIzin,
                        'cuti_sakit' => $cutiSakit,
                        'cuti_tahunan' => $cutiTahunan,
                        'izin' => $izin,
                        'alfa' => $tidakHadir,
                        's1' => (float) ($row['s1'] ?? $row['tl1'] ?? 0),
                        's2' => (float) ($row['s2'] ?? $row['tl2'] ?? 0),
                        's3' => (float) ($row['s3'] ?? $row['tl3'] ?? 0),
                        's4' => (float) ($row['s4'] ?? $row['tl4'] ?? 0),
                        's5' => (float) ($row['s5'] ?? $row['tl5'] ?? 0),
                        's6' => (float) ($row['s6'] ?? $row['tl6'] ?? 0),
                        'pw1' => (float) ($row['pw1'] ?? $row['psw1'] ?? 0),
                        'pw2' => (float) ($row['pw2'] ?? $row['psw2'] ?? 0),
                        'pw3' => (float) ($row['pw3'] ?? $row['psw3'] ?? 0),
                        'pw4' => (float) ($row['pw4'] ?? $row['psw4'] ?? 0),
                        'pw5' => (float) ($row['pw5'] ?? $row['psw5'] ?? 0),
                        'pw6' => (float) ($row['pw6'] ?? $row['psw6'] ?? 0),
                        'dikoreksi' => false,
                    ]
                );

                $validCount++;
            }

            $durasiDetik = max(1, (int) round(microtime(true) - $startTime));
            $report->update([
                'status' => count($barisGagal) > 0 ? 'perlu_koreksi' : 'valid',
                'jumlah_valid' => $validCount,
                'jumlah_gagal' => count($barisGagal),
                'baris_gagal' => $barisGagal,
                'durasi' => "{$durasiDetik} detik",
                'dimpor_at' => now(),
            ]);

            AuditLog::create([
                'NIP' => $user?->NIP,
                'unit_id' => $unitId,
                'aksi' => 'Impor Presensi & Cuti/Izin',
                'objek_type' => 'PresensiReport',
                'objek_id' => $report->id,
                'nilai_sebelum' => null,
                'nilai_sesudah' => [
                    'periode' => $periodeLabel,
                    'nama_file' => $namaFile,
                    'jumlah_valid' => $validCount,
                    'jumlah_gagal' => count($barisGagal),
                ],
                'alasan' => "Impor berkas presensi {$namaFile} periode {$periodeLabel}",
                'dicatat_at' => now(),
            ]);

            return response()->json([
                'message' => count($barisGagal) > 0
                    ? "Impor selesai: {$validCount} baris valid terimpor, " . count($barisGagal) . " baris gagal dan perlu dikoreksi."
                    : "Impor presensi berhasil: {$validCount} pegawai terimpor, 0 baris gagal.",
                'report' => [
                    'id' => $report->id,
                    'periode' => $periodeLabel,
                    'periode_kode' => $periodeKode,
                    'nama_file' => $namaFile,
                    'jumlah_valid' => $validCount,
                    'jumlah_gagal' => count($barisGagal),
                    'baris_gagal' => $barisGagal,
                    'status' => $report->status,
                ],
            ], 201);
        });

        return $response;
    }

    /**
     * FR-07 (L4): Koreksi baris presensi yang gagal saat impor sehingga masuk menjadi presensi valid
     */
    public function koreksiBarisGagal(Request $request, int $reportId, int $barisIndex): JsonResponse
    {
        $user = $request->user();
        $unitId = $this->getKepegawaianUnitId($request) ?? 1;

        $report = PresensiReport::where('unit_id', $unitId)->findOrFail($reportId);
        $barisGagal = $report->baris_gagal ?? [];

        // Cari item gagal berdasarkan index atau nomor baris
        $targetPos = null;
        foreach ($barisGagal as $pos => $item) {
            if (($item['index'] ?? $pos) == $barisIndex || ($item['baris'] ?? -1) == $barisIndex || $pos === $barisIndex) {
                $targetPos = $pos;
                break;
            }
        }

        if ($targetPos === null) {
            return response()->json([
                'message' => 'Baris gagal yang dimaksud tidak ditemukan pada laporan impor ini.',
            ], 404);
        }

        $nip = $request->input('NIP') ?? $request->input('nip') ?? $barisGagal[$targetPos]['nip'];
        $hk = $request->input('hari_kerja') ?? $request->input('hariKerja') ?? $barisGagal[$targetPos]['hariKerja'] ?? 22;
        $hadir = $request->input('hadir') ?? $barisGagal[$targetPos]['hadir'] ?? 0;
        $tidakHadir = $request->input('tidak_hadir') ?? $request->input('tidakHadir') ?? $barisGagal[$targetPos]['tidakHadir'] ?? 0;
        $cuti = $request->input('cuti') ?? $request->input('cuti_izin') ?? $barisGagal[$targetPos]['cuti'] ?? 0;
        $alasan = $request->input('alasan', 'Koreksi baris presensi gagal hasil impor');

        $request->merge([
            'NIP' => $nip,
            'hari_kerja' => $hk,
            'hadir' => $hadir,
            'tidak_hadir' => $tidakHadir,
            'cuti' => $cuti,
            'alasan' => $alasan,
        ]);

        $validated = $request->validate([
            'NIP' => ['required', 'string', 'exists:pegawai,NIP'],
            'hari_kerja' => ['required', 'numeric', 'min:1', 'max:31'],
            'hadir' => ['required', 'numeric', 'min:0'],
            'tidak_hadir' => ['required', 'numeric', 'min:0'],
            'cuti' => ['required', 'numeric', 'min:0'],
            'alasan' => ['nullable', 'string', 'max:500'],
        ], [
            'NIP.exists' => 'NIP yang dikoreksi masih belum terdaftar pada data pegawai.',
            'hari_kerja.max' => 'Jumlah hari kerja dalam satu bulan maksimal 31 hari.',
        ]);

        $pegawai = Pegawai::where('NIP', $validated['NIP'])->firstOrFail();
        if ($pegawai->unit_id !== $unitId) {
            return response()->json([
                'message' => 'Pegawai dengan NIP tersebut berasal dari unit kerja lain.',
                'errors' => ['NIP' => ['Pegawai bukan berasal dari unit kerja Anda.']],
            ], 422);
        }

        if (!$pegawai->aktif) {
            return response()->json([
                'message' => 'Pegawai dengan NIP tersebut berstatus nonaktif.',
                'errors' => ['NIP' => ['Pegawai berstatus nonaktif.']],
            ], 422);
        }

        if (round((float) $validated['hadir'] + (float) $validated['tidak_hadir'] + (float) $validated['cuti'], 1) != round((float) $validated['hari_kerja'], 1)) {
            return response()->json([
                'message' => 'Hadir + Tidak Hadir + Cuti/Izin harus sama dengan Hari Kerja.',
                'errors' => [
                    'hadir' => ['Hadir + Tidak Hadir + Cuti/Izin harus sama dengan Hari Kerja.'],
                ],
            ], 422);
        }

        /** @var JsonResponse $response */
        $response = DB::transaction(function () use ($report, $barisGagal, $targetPos, $pegawai, $validated, $user, $unitId): JsonResponse {
            $dataGagalLama = $barisGagal[$targetPos];

            $presensi = PresensiBulanan::updateOrCreate(
                [
                    'presensi_report_id' => $report->id,
                    'NIP' => $pegawai->NIP,
                ],
                [
                    'hari_kerja' => $validated['hari_kerja'],
                    'hadir' => $validated['hadir'],
                    'tidak_hadir' => $validated['tidak_hadir'],
                    'cuti_izin' => $validated['cuti'],
                    'cuti_tahunan' => $validated['cuti'],
                    'alfa' => $validated['tidak_hadir'],
                    'dikoreksi' => true,
                    'alasan_koreksi' => $validated['alasan'] ?? 'Koreksi baris presensi gagal',
                ]
            );

            // Hapus baris yang sudah berhasil dikoreksi dari daftar baris_gagal
            array_splice($barisGagal, $targetPos, 1);
            // Re-index
            foreach ($barisGagal as $i => &$bg) {
                $bg['index'] = $i;
            }

            $validCount = PresensiBulanan::where('presensi_report_id', $report->id)->count();
            $report->update([
                'jumlah_valid' => $validCount,
                'jumlah_gagal' => count($barisGagal),
                'baris_gagal' => $barisGagal,
                'status' => count($barisGagal) === 0 ? 'valid' : 'perlu_koreksi',
            ]);

            AuditLog::create([
                'NIP' => $user?->NIP,
                'unit_id' => $unitId,
                'aksi' => 'Koreksi Baris Presensi Gagal',
                'objek_type' => 'PresensiBulanan',
                'objek_id' => $presensi->id,
                'nilai_sebelum' => $dataGagalLama,
                'nilai_sesudah' => [
                    'NIP' => $pegawai->NIP,
                    'nama' => $pegawai->nama,
                    'hari_kerja' => (float) $validated['hari_kerja'],
                    'hadir' => (float) $validated['hadir'],
                    'tidak_hadir' => (float) $validated['tidak_hadir'],
                    'cuti_izin' => (float) $validated['cuti'],
                    'dikoreksi' => true,
                ],
                'alasan' => $validated['alasan'] ?? 'Koreksi baris presensi gagal sebelum perhitungan P1',
                'dicatat_at' => now(),
            ]);

            $presensi->load('pegawai');

            return response()->json([
                'message' => "Baris presensi gagal untuk {$pegawai->nama} ({$pegawai->NIP}) berhasil dikoreksi dan siap digunakan untuk perhitungan P1.",
                'data' => $this->formatBarisPresensi($presensi, []),
                'sisa_baris_gagal' => count($barisGagal),
                'baris_gagal' => $barisGagal,
            ]);
        });

        return $response;
    }

    /**
     * FR-07 (L4): Koreksi data presensi bulanan pegawai oleh Bidang Kepegawaian
     */
    public function koreksiPresensi(Request $request, string $nip): JsonResponse
    {
        $user = $request->user();
        $unitId = $this->getKepegawaianUnitId($request) ?? 1;

        $pegawai = Pegawai::where('NIP', $nip)->firstOrFail();
        if ($unitId && $pegawai->unit_id !== $unitId) {
            return response()->json([
                'message' => 'Akses ditolak: Pegawai ini bukan berasal dari unit kerja Anda.',
            ], 403);
        }

        $hk = $request->input('hari_kerja') ?? $request->input('hariKerja') ?? 22;
        $hadir = $request->input('hadir') ?? 0;
        $tidakHadir = $request->input('tidak_hadir') ?? $request->input('tidakHadir') ?? 0;
        $cuti = $request->input('cuti') ?? $request->input('cuti_izin') ?? 0;
        $alasan = $request->input('alasan') ?? 'Koreksi data presensi oleh Kepegawaian';

        $request->merge([
            'hari_kerja' => $hk,
            'hadir' => $hadir,
            'tidak_hadir' => $tidakHadir,
            'cuti' => $cuti,
            'alasan' => $alasan,
        ]);

        $validated = $request->validate([
            'periode' => ['nullable', 'string'],
            'hari_kerja' => ['required', 'numeric', 'min:1'],
            'hadir' => ['required', 'numeric', 'min:0'],
            'tidak_hadir' => ['required', 'numeric', 'min:0'],
            'cuti' => ['required', 'numeric', 'min:0'],
            'alasan' => ['required', 'string', 'min:5', 'max:500'],
        ], [
            'alasan.required' => 'Alasan koreksi wajib diisi.',
            'alasan.min' => 'Alasan koreksi minimal 5 karakter.',
        ]);

        if (round((float) $validated['hadir'] + (float) $validated['tidak_hadir'] + (float) $validated['cuti'], 1) != round((float) $validated['hari_kerja'], 1)) {
            return response()->json([
                'message' => 'Hadir + Tidak Hadir + Cuti/Izin harus sama dengan Hari Kerja.',
                'errors' => [
                    'hadir' => ['Hadir + Tidak Hadir + Cuti/Izin harus sama dengan Hari Kerja.'],
                ],
            ], 422);
        }

        $periodeInfo = $this->normalizePeriode($validated['periode'] ?? 'Oktober 2026');
        $report = PresensiReport::firstOrCreate(
            ['unit_id' => $pegawai->unit_id, 'periode' => $periodeInfo['kode']],
            [
                'NIP' => $user?->NIP,
                'nama_file' => 'presensi_' . str_replace('-', '', $periodeInfo['kode']) . '.xlsx',
                'masa_file' => $periodeInfo['label'],
                'status' => 'valid',
                'dimpor_at' => now(),
            ]
        );

        $existing = PresensiBulanan::where('presensi_report_id', $report->id)
            ->where('NIP', $pegawai->NIP)
            ->first();

        $nilaiSebelum = $existing ? [
            'hari_kerja' => (float) $existing->hari_kerja,
            'hadir' => (float) $existing->hadir,
            'tidak_hadir' => (float) $existing->tidak_hadir,
            'cuti_izin' => (float) $existing->cuti_izin,
        ] : null;

        $presensi = PresensiBulanan::updateOrCreate(
            [
                'presensi_report_id' => $report->id,
                'NIP' => $pegawai->NIP,
            ],
            [
                'hari_kerja' => $validated['hari_kerja'],
                'hadir' => $validated['hadir'],
                'tidak_hadir' => $validated['tidak_hadir'],
                'cuti_izin' => $validated['cuti'],
                'cuti_tahunan' => $validated['cuti'],
                'alfa' => $validated['tidak_hadir'],
                'dikoreksi' => true,
                'alasan_koreksi' => trim($validated['alasan']),
            ]
        );

        AuditLog::create([
            'NIP' => $user?->NIP,
            'unit_id' => $pegawai->unit_id,
            'aksi' => 'Koreksi Presensi Pegawai',
            'objek_type' => 'PresensiBulanan',
            'objek_id' => $presensi->id,
            'nilai_sebelum' => $nilaiSebelum,
            'nilai_sesudah' => [
                'NIP' => $pegawai->NIP,
                'hari_kerja' => (float) $presensi->hari_kerja,
                'hadir' => (float) $presensi->hadir,
                'tidak_hadir' => (float) $presensi->tidak_hadir,
                'cuti_izin' => (float) $presensi->cuti_izin,
                'dikoreksi' => true,
            ],
            'alasan' => trim($validated['alasan']),
            'dicatat_at' => now(),
        ]);

        $presensi->load('pegawai');

        return response()->json([
            'message' => "Koreksi presensi pegawai {$pegawai->nama} berhasil disimpan.",
            'data' => $this->formatBarisPresensi($presensi, []),
        ]);
    }

    /**
     * Ekspor CSV rekap presensi / template impor
     */
    public function exportCsv(Request $request): StreamedResponse
    {
        $unitId = $this->getKepegawaianUnitId($request) ?? 1;
        $periodeInfo = $this->normalizePeriode($request->query('periode'));

        $report = PresensiReport::where('unit_id', $unitId)
            ->where('periode', $periodeInfo['kode'])
            ->latest('id')
            ->first();

        $rows = PresensiBulanan::with('pegawai')
            ->whereHas('pegawai', fn ($q) => $q->where('unit_id', $unitId)->where('aktif', true))
            ->when($report, fn ($q) => $q->where('presensi_report_id', $report->id))
            ->get();

        $filename = 'rekap_presensi_' . $periodeInfo['kode'] . '.csv';

        return response()->streamDownload(function () use ($rows) {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['NIP', 'Nama', 'Hari Kerja', 'Hadir', 'Tidak Hadir', 'Cuti', 'Izin', 'Sakit']);
            foreach ($rows as $r) {
                $hk = (int) round((float) ($r->hari_kerja ?: 22));
                $tidak = (int) round((float) ($r->tidak_hadir ?: $r->alfa));
                $cuti = (int) round((float) $r->cuti_tahunan);
                $izin = (int) round((float) $r->izin);
                $sakit = (int) round((float) $r->cuti_sakit);
                $hadir = (int) round((float) ($r->hadir ?: max(0, $hk - $tidak - $cuti - $izin - $sakit)));
                fputcsv($out, [
                    $r->NIP,
                    $r->pegawai?->nama ?? '-',
                    $hk,
                    $hadir,
                    $tidak,
                    $cuti,
                    $izin,
                    $sakit,
                ]);
            }
            fclose($out);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}
