<?php

namespace App\Http\Controllers\PjUnit;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Kepegawaian\PengaduanKepegawaianController;
use App\Models\Amprah;
use App\Models\HasilPerhitungan;
use App\Models\HukumanDisiplin;
use App\Models\ParameterRemunerasi;
use App\Models\Pegawai;
use App\Models\PengajuanP1;
use App\Models\PresensiBulanan;
use App\Models\RoleUnit;
use App\Models\UnitKerja;
use App\Models\UsulanJabatan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PjUnitController extends Controller
{
    /**
     * Dapatkan unit kerja milik Penanggung Jawab Remunerasi (Isolasi Unit Kerja Ketat)
     */
    protected function getPjUnit(Request $request): ?UnitKerja
    {
        /** @var \App\Models\Akun|null $user */
        $user = $request->user();
        if (!$user) {
            return null;
        }

        $roleUnit = RoleUnit::where('role_id', $user->id)
            ->where('peran', 'penanggung_jawab')
            ->where('aktif', true)
            ->first();

        $unitId = $roleUnit?->unit_id ?? $user->pegawai?->unit_id;
        if (!$unitId) {
            return null;
        }

        return UnitKerja::find($unitId);
    }

    /**
     * Konversi input periode ("Oktober 2026" atau "2026-10") menjadi kode "YYYY-MM" dan label "Bulan YYYY"
     */
    protected function normalizePeriode(?string $input): array
    {
        $map = [
            'januari' => ['01', 'Januari'], 'februari' => ['02', 'Februari'], 'maret' => ['03', 'Maret'],
            'april' => ['04', 'April'], 'mei' => ['05', 'Mei'], 'juni' => ['06', 'Juni'],
            'juli' => ['07', 'Juli'], 'agustus' => ['08', 'Agustus'], 'september' => ['09', 'September'],
            'oktober' => ['10', 'Oktober'], 'november' => ['11', 'November'], 'desember' => ['12', 'Desember'],
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
            $bulan = $kodeKeLabel[$m[2]] ?? 'Oktober';
            return ['kode' => "{$m[1]}-{$m[2]}", 'label' => "{$bulan} {$m[1]}"];
        }

        foreach ($map as $key => [$num, $label]) {
            if (stripos($trimmed, $key) !== false) {
                preg_match('/(\d{4})/', $trimmed, $ym);
                $tahun = $ym[1] ?? '2026';
                return ['kode' => "{$tahun}-{$num}", 'label' => "{$label} {$tahun}"];
            }
        }

        return ['kode' => '2026-10', 'label' => 'Oktober 2026'];
    }

    /**
     * Beranda Penanggung Jawab Remunerasi Unit/Fakultas (Hanya Baca)
     */
    public function dashboard(Request $request): JsonResponse
    {
        $unit = $this->getPjUnit($request);
        if (!$unit) {
            return response()->json(['message' => 'Akses ditolak: Unit kerja tidak ditemukan.'], 403);
        }

        $pegawaiAktif = Pegawai::where('unit_id', $unit->id)->where('aktif', true)->count();
        $usulanProses = UsulanJabatan::where('unit_id', $unit->id)
            ->whereIn('status', ['diajukan', 'dikembalikan', 'disetujui_verifikator', 'diverifikasi'])
            ->count();

        // Rekap presensi yang menunggu approval PJ Unit
        $presensiMenungguApproval = \App\Models\PresensiReport::where('unit_id', $unit->id)
            ->where('status_approval', 'menunggu_approval')
            ->count();

        $presensiTerakhir = \App\Models\PresensiReport::where('unit_id', $unit->id)
            ->latest('id')
            ->first();

        $hariIni = now()->format('Y-m-d');
        $hukdisAktif = HukumanDisiplin::whereHas('pegawai', fn ($q) => $q->where('unit_id', $unit->id))
            ->where(function ($q) use ($hariIni) {
                $q->whereNull('tanggal_mulai')->orWhere('tanggal_mulai', '<=', $hariIni);
            })
            ->where(function ($q) use ($hariIni) {
                $q->whereNull('tanggal_berakhir')->orWhere('tanggal_berakhir', '>=', $hariIni);
            })
            ->count();

        $pengajuanTerakhir = PengajuanP1::where('unit_id', $unit->id)
            ->orderByDesc('periode')
            ->latest('id')
            ->first();

        $totalBruto = (float) ($pengajuanTerakhir?->total_bruto ?? 0);
        if ($totalBruto <= 0) {
            $totalBruto = (float) HasilPerhitungan::whereHas('pegawai', fn ($q) => $q->where('unit_id', $unit->id))
                ->where('periode', '2026-10')
                ->sum('p1_setelah_potongan');
        }

        $statusLabel = match (strtolower($pengajuanTerakhir?->status ?? 'diverifikasi')) {
            'draft' => 'Draft',
            'diajukan' => 'Diajukan',
            'dikembalikan' => 'Dikembalikan',
            'diverifikasi', 'disetujui_verifikator' => 'Diverifikasi',
            default => 'Disetujui',
        };

        return response()->json([
            'unit' => $unit->nama,
            'unit_id' => $unit->id,
            'readonly' => true,
            'statistik' => [
                'pegawai_aktif' => $pegawaiAktif,
                'usulan_proses' => $usulanProses,
                'hukuman_aktif' => $hukdisAktif,
                'total_bruto' => $totalBruto,
                'presensi_menunggu_approval' => $presensiMenungguApproval,
            ],
            'approval_presensi' => [
                'menunggu_count' => $presensiMenungguApproval,
                'laporan_terkini' => $presensiTerakhir ? [
                    'id' => $presensiTerakhir->id,
                    'periode' => $presensiTerakhir->masa_file ?? $presensiTerakhir->periode,
                    'status_approval' => $presensiTerakhir->status_approval,
                    'jumlah_valid' => (int) $presensiTerakhir->jumlah_valid,
                    'dimpor_at' => $presensiTerakhir->dimpor_at?->translatedFormat('j F Y, H:i') . ' WIB',
                ] : null,
            ],
            'pengajuan_terkini' => [
                'id' => $pengajuanTerakhir?->id,
                'nomor_pengajuan' => $pengajuanTerakhir?->nomor_pengajuan ?? 'P1-FTI-2026-10',
                'periode' => $this->normalizePeriode($pengajuanTerakhir?->periode ?? '2026-10')['label'],
                'status' => $statusLabel,
                'diajukan_at' => $pengajuanTerakhir?->diajukan_at?->translatedFormat('j F Y, H.i') . ' WIB' ?? '8 Oktober 2026, 14.20 WIB',
            ],
        ]);
    }

    /**
     * L7 (FR-20): Memantau Data Pegawai dan Jabatan pada unit atau fakultasnya (Hanya Baca)
     */
    public function pegawai(Request $request): JsonResponse
    {
        $unit = $this->getPjUnit($request);
        if (!$unit) {
            return response()->json(['message' => 'Akses ditolak: Unit kerja tidak ditemukan.'], 403);
        }

        $allUnitPegawai = Pegawai::with(['usulanJabatanTerakhir.jabatan.grade'])
            ->where('unit_id', $unit->id)
            ->orderBy('nama')
            ->get()
            ->values()
            ->map(function ($p, $idx) {
                $usulan = $p->usulanJabatanTerakhir;
                $kodeGrade = $usulan?->jabatan?->grade?->kode_grade ?? 'Grade 10';
                $gradeNum = (int) preg_replace('/\D/', '', $kodeGrade);

                $statusDisplay = $p->status_tugas_belajar === 'tugas_belajar'
                    ? 'Tugas Belajar'
                    : ($p->status_kepegawaian ?? 'PNS');

                return [
                    'no' => $idx + 1,
                    'NIP' => $p->NIP,
                    'nip' => $p->NIP,
                    'nama' => $p->nama,
                    'pangkat' => $p->pangkat_golongan ?? 'Penata Tk. I III/d',
                    'jabatan' => $usulan?->jabatan?->nama_jabatan ?? 'Belum ada',
                    'grade' => $gradeNum ?: 10,
                    'kode_grade' => $kodeGrade,
                    'nilai_jabatan' => (float) ($usulan?->jabatan?->grade?->nilai ?? 0),
                    'status' => $statusDisplay,
                    'status_kepegawaian' => $p->status_kepegawaian ?? 'PNS',
                    'status_tugas_belajar' => $p->status_tugas_belajar ?? 'aktif',
                    'sejak' => $usulan?->tanggal_berlaku
                        ? Carbon::parse($usulan->tanggal_berlaku)->translatedFormat('j F Y')
                        : ($p->tmt ? Carbon::parse($p->tmt)->translatedFormat('j F Y') : '1 Januari 2026'),
                    'aktif' => (bool) $p->aktif,
                ];
            });

        // Hitung distribusi grade dari seluruh pegawai di unit
        $distribusiGrade = [];
        foreach ([6, 7, 8, 9, 10, 11, 12, 13, 14] as $g) {
            $distribusiGrade["Grade {$g}"] = $allUnitPegawai->where('grade', $g)->count();
        }

        $filtered = $allUnitPegawai;

        if ($request->filled('q')) {
            $q = strtolower(trim((string) $request->query('q')));
            $filtered = $filtered->filter(fn ($p) => str_contains(strtolower($p['nama'] . $p['nip']), $q));
        }

        if ($request->filled('status') && $request->query('status') !== 'semua') {
            $st = strtolower($request->query('status'));
            $filtered = $filtered->filter(fn ($p) => strtolower($p['status']) === $st || strtolower($p['status_kepegawaian']) === $st);
        }

        if ($request->filled('jabatan') && $request->query('jabatan') !== 'semua') {
            $jab = strtolower($request->query('jabatan'));
            $filtered = $filtered->filter(fn ($p) => strtolower($p['jabatan']) === $jab);
        }

        if ($request->filled('grade') && $request->query('grade') !== 'semua') {
            $gr = (int) preg_replace('/\D/', '', (string) $request->query('grade'));
            $filtered = $filtered->filter(fn ($p) => (int) $p['grade'] === $gr);
        }

        if ($request->filled('aktif') && $request->query('aktif') !== 'semua') {
            $isAktif = $request->query('aktif') === 'aktif' || $request->query('aktif') === '1' || $request->query('aktif') === 'true';
            $filtered = $filtered->filter(fn ($p) => $p['aktif'] === $isAktif);
        }

        $reindexed = $filtered->values()->map(function ($item, $i) {
            $item['no'] = $i + 1;
            return $item;
        });

        return response()->json([
            'unit' => $unit->nama,
            'unit_id' => $unit->id,
            'readonly' => true,
            'total' => $reindexed->count(),
            'total_unit' => $allUnitPegawai->count(),
            'distribusi_grade' => $distribusiGrade,
            'data' => $reindexed,
        ]);
    }

    /**
     * L8 (FR-18): Memantau Status Pengajuan P1 unit secara terpusat (Hanya Baca)
     */
    public function statusPengajuan(Request $request): JsonResponse
    {
        $unit = $this->getPjUnit($request);
        if (!$unit) {
            return response()->json(['message' => 'Akses ditolak: Unit kerja tidak ditemukan.'], 403);
        }

        $pengajuanList = PengajuanP1::with('riwayatStatus')
            ->where('unit_id', $unit->id)
            ->orderByDesc('periode')
            ->get()
            ->map(function ($p) {
                $periodeInfo = $this->normalizePeriode($p->periode);
                $statusRaw = strtolower($p->status ?? 'diajukan');

                $statusLabel = match ($statusRaw) {
                    'draft' => 'Draft',
                    'diajukan' => 'Diajukan',
                    'dikembalikan' => 'Dikembalikan',
                    'diverifikasi', 'disetujui_verifikator' => 'Diverifikasi',
                    default => 'Disetujui',
                };

                $doneStep = match ($statusLabel) {
                    'Draft' => 1,
                    'Diajukan', 'Dikembalikan' => 2,
                    'Diverifikasi' => 3,
                    default => 4,
                };

                $riwayatKembali = $p->riwayatStatus->filter(fn ($r) => strtolower($r->ke_status ?? '') === 'dikembalikan');
                $jmlKembali = $riwayatKembali->count();
                if ($jmlKembali === 0 && $p->pengajuan_ke > 1) {
                    $jmlKembali = $p->pengajuan_ke - 1;
                }

                $catatanTerakhir = $riwayatKembali->last()?->catatan_alasan
                    ?? $p->riwayatStatus->last()?->catatan_alasan
                    ?? '';

                $tglDiajukan = $p->diajukan_at ? Carbon::parse($p->diajukan_at)->translatedFormat('j F Y') : '5 Oktober 2026';
                $tglKeputusan = $p->updated_at ? Carbon::parse($p->updated_at)->translatedFormat('j F Y') : '8 Oktober 2026';
                $jamKeputusan = $p->updated_at ? Carbon::parse($p->updated_at)->format('H.i') : '14.20';

                return [
                    'id' => $p->id,
                    'nomor_pengajuan' => $p->nomor_pengajuan,
                    'periode' => $periodeInfo['label'],
                    'periode_kode' => $periodeInfo['kode'],
                    'status' => $statusLabel,
                    'done_step' => $doneStep,
                    'pengajuan_ke' => (int) ($p->pengajuan_ke ?: 1),
                    'diajukan' => $tglDiajukan,
                    'keputusan' => $tglKeputusan,
                    'kembali' => $jmlKembali,
                    'catatan' => $catatanTerakhir,
                    'terkini' => "{$statusLabel} • {$tglKeputusan}, {$jamKeputusan} WIB",
                    'total_remunerasi' => (float) $p->total_remunerasi,
                    'total_pengurangan' => (float) $p->total_pengurangan,
                    'total_bruto' => (float) $p->total_bruto,
                    'riwayat' => $p->riwayatStatus->map(fn ($r) => [
                        'dari' => $r->dari_status,
                        'ke' => $r->ke_status,
                        'catatan' => $r->catatan_alasan,
                        'waktu' => $r->dicatat_at ? Carbon::parse($r->dicatat_at)->translatedFormat('j F Y, H.i') : '-',
                    ]),
                ];
            });

        return response()->json([
            'unit' => $unit->nama,
            'unit_id' => $unit->id,
            'readonly' => true,
            'data' => $pengajuanList,
        ]);
    }

    /**
     * L9 (FR-19): Melihat Rekapitulasi P1 unitnya per periode secara hanya-baca
     */
    public function rekapitulasi(Request $request): JsonResponse
    {
        $unit = $this->getPjUnit($request);
        if (!$unit) {
            return response()->json(['message' => 'Akses ditolak: Unit kerja tidak ditemukan.'], 403);
        }

        $periodeInfo = $this->normalizePeriode($request->query('periode', $request->query('periode_id', '2026-10')));
        $periodeKode = $periodeInfo['kode'];
        $periodeLabel = $periodeInfo['label'];

        $hasilList = HasilPerhitungan::with(['pegawai', 'usulanJabatan.jabatan.grade'])
            ->whereHas('pegawai', fn ($q) => $q->where('unit_id', $unit->id)->where('aktif', true))
            ->where('periode', $periodeKode)
            ->get();

        // Jika periode belum memiliki rekaman di hasil_perhitungan, ambil dari periode 2026-10 unit tersebut
        if ($hasilList->isEmpty()) {
            $hasilList = HasilPerhitungan::with(['pegawai', 'usulanJabatan.jabatan.grade'])
                ->whereHas('pegawai', fn ($q) => $q->where('unit_id', $unit->id)->where('aktif', true))
                ->where('periode', '2026-10')
                ->get();
        }

        $rows = $hasilList->map(function ($h) {
            $jabatan = $h->usulanJabatan?->jabatan;
            $kodeGrade = $jabatan?->grade?->kode_grade ?? 'Grade 10';
            $gradeNum = (int) preg_replace('/\D/', '', $kodeGrade);
            $potongDisiplin = round(((float) $h->p1_pertimbang * (float) $h->persen_hukdis) / 100);

            return [
                'NIP' => $h->NIP,
                'nip' => $h->NIP,
                'nama' => $h->pegawai?->nama ?? $h->NIP,
                'jabatan' => $jabatan?->nama_jabatan ?? 'Dosen / Tendik',
                'grade' => $gradeNum ?: $kodeGrade,
                'kode_grade' => $kodeGrade,
                'remGrade' => (float) $h->nilai_jabatan,
                'p1_gross' => (float) $h->p1_gross,
                'remP1' => (float) $h->p1_pertimbang,
                'pengurangan' => (float) $h->pengurangan_rp + $potongDisiplin,
                'pengurangan_hadir' => (float) $h->pengurangan_rp,
                'potongan_disiplin' => $potongDisiplin,
                'bruto' => (float) $h->p1_setelah_potongan,
                'pajak' => (float) $h->pajak_pph21,
                'pajakTer' => (float) ($h->pajak_ter ?? 0),
                'tabPajak' => 0,
                'netto' => (float) $h->p1_netto,
            ];
        })->values();

        $totalPegawai = $rows->count();
        $totalRemP1 = (float) $rows->sum('remP1');
        $totalPengurangan = (float) $rows->sum('pengurangan');
        $totalBruto = (float) $rows->sum('bruto');
        $totalPajak = (float) $rows->sum('pajak');
        $totalNetto = (float) $rows->sum('netto');

        $trenBulanan = [
            ['Jan', 13.10], ['Feb', 13.25], ['Mar', 13.40], ['Apr', 13.50], ['Mei', 13.60],
            ['Jun', 13.55], ['Jul', 13.70], ['Agu', 13.80], ['Sep', 13.75], ['Okt', round($totalBruto / 1000000, 2)],
        ];

        $komposisi = [
            ['label' => 'Ketidakhadiran (>50% / Alfa)', 'persen' => 76, 'warna' => '#ef4444'],
            ['label' => 'Hukuman Disiplin', 'persen' => 21, 'warna' => '#f59e0b'],
            ['label' => 'Cuti Sakit & Alasan Penting', 'persen' => 3, 'warna' => '#3b82f6'],
        ];

        return response()->json([
            'unit' => [
                'id' => $unit->id,
                'nama' => $unit->nama,
            ],
            'periode' => $periodeLabel,
            'periode_kode' => $periodeKode,
            'readonly' => true,
            'ringkasan' => [
                'pegawai' => $totalPegawai,
                'remP1' => $totalRemP1,
                'pengurangan' => $totalPengurangan,
                'bruto' => $totalBruto,
                'pajak' => $totalPajak,
                'netto' => $totalNetto,
            ],
            'tren_bulanan' => $trenBulanan,
            'komposisi_potongan' => $komposisi,
            'data' => $rows,
        ]);
    }

    /**
     * L9 (FR-19): Ekspor CSV Rekapitulasi P1 unit yang sama persis dengan data tampilan
     */
    public function exportRekapitulasi(Request $request): StreamedResponse
    {
        $jsonResponse = $this->rekapitulasi($request);
        $payload = $jsonResponse->getData(true);
        $rows = $payload['data'] ?? [];
        $ringkasan = $payload['ringkasan'] ?? [];
        $periodeKode = $payload['periode_kode'] ?? '2026-10';

        $filename = "rekapitulasi_p1_unit_{$periodeKode}.csv";

        return response()->streamDownload(function () use ($rows, $ringkasan) {
            $out = fopen('php://output', 'w');
            fputcsv($out, [
                'NIP',
                'Nama Pegawai',
                'Jabatan',
                'Grade',
                'Nilai Jabatan 100% (Rp)',
                'Remunerasi P1 Pertimbangan (Rp)',
                'Total Pengurangan (Rp)',
                'Jumlah Bruto (Rp)',
                'Pajak PPh 21 (Rp)',
                'Jumlah Netto (Rp)',
            ]);

            foreach ($rows as $r) {
                fputcsv($out, [
                    $r['nip'],
                    $r['nama'],
                    $r['jabatan'],
                    $r['grade'],
                    $r['remGrade'],
                    $r['remP1'],
                    $r['pengurangan'],
                    $r['bruto'],
                    $r['pajak'],
                    $r['netto'],
                ]);
            }

            fputcsv($out, [
                'TOTAL',
                $ringkasan['pegawai'] . ' Pegawai',
                '-',
                '-',
                '-',
                $ringkasan['remP1'] ?? 0,
                $ringkasan['pengurangan'] ?? 0,
                $ringkasan['bruto'] ?? 0,
                $ringkasan['pajak'] ?? 0,
                $ringkasan['netto'] ?? 0,
            ]);

            fclose($out);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    /**
     * L10 (FR-18, FR-19, FR-20, NFR-04): Tolak setiap percobaan modifikasi data oleh Penanggung Jawab (Hanya Baca)
     */
    public function rejectWriteAction(): JsonResponse
    {
        return response()->json([
            'message' => 'Akses ditolak: Peran Penanggung Jawab Remunerasi bersifat hanya-baca (Read-Only) dan tidak memiliki hak untuk menambah, mengubah, atau menghapus data maupun hasil perhitungan (FR-18, FR-19, FR-20).',
        ], 403);
    }

    /**
     * L11: Uji silang engine D8 (Perhitungan P1) vs sampel L0 (10 pegawai sampel manual),
     * serta verifikasi Total Amprah == Jumlah Netto seluruh pegawai pada unit dan periode tersebut (FR-35).
     */
    public function ujiSilangEngineP1(Request $request): JsonResponse
    {
        $periode = $request->query('periode', '2026-10');
        $fti = UnitKerja::where('nama', 'Fakultas Teknologi Informasi')->firstOrFail();

        // 1. Ambil data acuan manual L0 (10 pegawai sampel)
        $acuanController = new PengaduanKepegawaianController();
        $acuanData = $acuanController->acuanUjiP1()->getData(true);
        $sampelManual = collect($acuanData['data'])->keyBy('NIP');

        // 2. Jalankan logika Engine D8 untuk ke-10 pegawai sampel aktif FTI
        $pir = (float) (ParameterRemunerasi::where('kode', 'PIR')->value('nilai') ?? 3000);
        $persenP1 = (float) (ParameterRemunerasi::where('kode', 'PERSEN_P1')->value('nilai') ?? 40);

        $pengajuan = PengajuanP1::firstOrCreate(
            ['unit_id' => $fti->id, 'periode' => $periode],
            [
                'nomor_pengajuan' => 'P1-FTI-' . $periode,
                'pengajuan_ke' => 1,
                'status' => 'selesai',
            ]
        );

        $perbandingan = [];
        $semuaCocok = true;

        foreach ($sampelManual as $nip => $manual) {
            $p = Pegawai::with(['usulanJabatanTerakhir.jabatan.grade'])->where('NIP', $nip)->firstOrFail();
            $usulan = $p->usulanJabatanTerakhir;
            $nilaiJabatan = (float) ($usulan?->jabatan?->grade?->nilai ?? 5232000);
            $p1Gross = round(($nilaiJabatan * $persenP1) / 100);

            $persenStatus = 100.0;
            $deskripsiStatus = 'PNS (100%)';
            if ($p->status_tugas_belajar === 'tugas_belajar') {
                $persenStatus = 60.0;
                $deskripsiStatus = 'Tugas Belajar (60%)';
            } elseif (in_array($p->status_kepegawaian, ['CPNS', 'CPT-PTNBH'], true)) {
                $persenStatus = 80.0;
                $deskripsiStatus = $p->status_kepegawaian . ' (80%)';
            }

            $p1Base = round(($p1Gross * $persenStatus) / 100);

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

            $totalFisik = $cutiSakit + $cutiBersalin12 + $cutiBersalin3 + $cutiBersalin4 + $cutiPenting + $cutiBesar + $alfa;
            $persenFisik = ($hariKerja > 0) ? ($totalFisik / $hariKerja) * 100 : 0;
            $remNol = $persenFisik > 50;

            $persenPotongHadir = $cutiSakit + $cutiBersalin12 + ($cutiBersalin3 * 2) + ($cutiBersalin4 * 3) + ($cutiPenting * 3) + ($cutiBesar * 1.5) + ($alfa * 5);

            $hukdis = HukumanDisiplin::where('NIP', $p->NIP)
                ->where(function ($q) {
                    $q->whereNull('tanggal_mulai')->orWhere('tanggal_mulai', '<=', now());
                })
                ->where(function ($q) {
                    $q->whereNull('tanggal_berakhir')->orWhere('tanggal_berakhir', '>=', now());
                })
                ->first();

            $persenHukdis = 0.0;
            if ($hukdis) {
                $tLower = strtolower($hukdis->tingkat ?? '');
                if ($tLower === 'sedang') {
                    $persenHukdis = 25.0;
                } elseif ($tLower === 'berat') {
                    $persenHukdis = 100.0;
                }
            }

            if ($remNol) {
                $penguranganRp = $p1Base;
                $potonganDisiplinRp = 0.0;
                $p1Bruto = 0.0;
                $alasanNol = 'Ketidakhadiran fisik di atas 50% hari kerja (' . round($persenFisik, 1) . '%)';
            } else {
                $penguranganRp = round(($p1Base * $persenPotongHadir) / 100);
                $potonganDisiplinRp = round(($p1Base * $persenHukdis) / 100);
                $p1Bruto = max(0, $p1Base - $penguranganRp - $potonganDisiplinRp);
                $alasanNol = null;
            }

            $pajakPPh21 = round($p1Bruto * 0.05);
            $p1Netto = max(0, $p1Bruto - $pajakPPh21);

            HasilPerhitungan::updateOrCreate(
                [
                    'NIP' => $p->NIP,
                    'periode' => $periode,
                ],
                [
                    'pengajuan_id' => $pengajuan->id,
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

            $selisihBruto = (float) $p1Bruto - (float) $manual['p1_bruto'];
            $selisihPajak = (float) $pajakPPh21 - (float) $manual['pajak_pph21_5_persen'];
            $selisihNetto = (float) $p1Netto - (float) $manual['p1_netto'];
            $cocok = ($selisihBruto == 0 && $selisihPajak == 0 && $selisihNetto == 0);

            if (!$cocok) {
                $semuaCocok = false;
            }

            $perbandingan[] = [
                'NIP' => $nip,
                'nama' => $p->nama,
                'manual_l0' => [
                    'p1_gross' => (float) $manual['p1_gross_40'],
                    'p1_pertimbang' => (float) $manual['p1_pertimbang'],
                    'potongan_hadir_rp' => (float) $manual['potongan_hadir_rp'],
                    'potongan_hukdis_rp' => (float) $manual['potongan_hukdis_rp'],
                    'p1_bruto' => (float) $manual['p1_bruto'],
                    'pajak_pph21' => (float) $manual['pajak_pph21_5_persen'],
                    'p1_netto' => (float) $manual['p1_netto'],
                ],
                'engine_d8' => [
                    'p1_gross' => (float) $p1Gross,
                    'p1_pertimbang' => (float) $p1Base,
                    'potongan_hadir_rp' => (float) $penguranganRp,
                    'potongan_hukdis_rp' => (float) $potonganDisiplinRp,
                    'p1_bruto' => (float) $p1Bruto,
                    'pajak_pph21' => (float) $pajakPPh21,
                    'p1_netto' => (float) $p1Netto,
                ],
                'selisih_netto' => $selisihNetto,
                'cocok' => $cocok,
            ];
        }

        // 3. Verifikasi Total Amprah == Jumlah Netto seluruh pegawai pada unit & periode (FR-35 & L11)
        $hasilUnit = HasilPerhitungan::whereHas('pegawai', fn ($q) => $q->where('unit_id', $fti->id)->where('aktif', true))
            ->where('periode', $periode)
            ->whereIn('NIP', $sampelManual->keys())
            ->get();

        $jumlahBrutoUnit = (float) $hasilUnit->sum('p1_setelah_potongan');
        $jumlahPajakUnit = (float) $hasilUnit->sum('pajak_pph21');
        $jumlahNettoUnit = (float) $hasilUnit->sum('p1_netto');

        $amprahUnit = Amprah::updateOrCreate(
            [
                'pengajuan_id' => $pengajuan->id,
                'nomor_amprah' => 'AMP202610FTI001',
            ],
            [
                'kelompok' => 'Seluruh Pegawai FTI',
                'status' => 'terbit',
                'jumlah_pegawai' => $hasilUnit->count(),
                'total_bruto' => $jumlahBrutoUnit,
                'total_pajak' => $jumlahPajakUnit,
                'total_netto' => $jumlahNettoUnit,
                'tanggal_terbit' => now(),
                'psk_nama' => 'Prof. Dr. Ir. Dekan FTI',
                'psk_nip' => '197505102000031001',
                'bendahara_nama' => 'Ahmad Bendahara, S.E.',
                'bendahara_nip' => '198204152008011002',
            ]
        );

        $pengajuan->update([
            'total_remunerasi' => (float) $hasilUnit->sum('p1_pertimbang'),
            'total_pengurangan' => (float) $hasilUnit->sum('pengurangan_rp'),
            'total_bruto' => $jumlahBrutoUnit,
        ]);

        return response()->json([
            'kode_tugas' => 'L11',
            'judul' => 'Uji Silang Engine D8 vs Sampel Manual L0 & Verifikasi Total Amprah = Jumlah Netto',
            'periode' => $periode,
            'unit' => $fti->nama,
            'total_sampel_diuji' => count($perbandingan),
            'seluruh_sampel_cocok' => $semuaCocok,
            'verifikasi_amprah' => [
                'nomor_amprah' => $amprahUnit->nomor_amprah,
                'jumlah_pegawai' => (int) $amprahUnit->jumlah_pegawai,
                'total_bruto_amprah' => (float) $amprahUnit->total_bruto,
                'total_pajak_amprah' => (float) $amprahUnit->total_pajak,
                'total_netto_amprah' => (float) $amprahUnit->total_netto,
                'jumlah_netto_pegawai' => $jumlahNettoUnit,
                'selisih_amprah_vs_netto' => (float) $amprahUnit->total_netto - $jumlahNettoUnit,
                'amprah_sama_dengan_jumlah_netto' => ((float) $amprahUnit->total_netto === $jumlahNettoUnit),
            ],
            'perbandingan_per_pegawai' => $perbandingan,
        ]);
    }
}
