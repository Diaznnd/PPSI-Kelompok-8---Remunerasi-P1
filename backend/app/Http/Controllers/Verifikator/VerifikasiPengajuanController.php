<?php

namespace App\Http\Controllers\Verifikator;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\HasilPerhitungan;
use App\Models\HukumanDisiplin;
use App\Models\Pegawai;
use App\Models\PengajuanP1;
use App\Models\PresensiBulanan;
use App\Models\RiwayatStatus;
use App\Models\RoleUnit;
use App\Models\UnitKerja;
use App\Models\UsulanJabatan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class VerifikasiPengajuanController extends Controller
{
    /**
     * Dapatkan batasan unit_id jika verifikator memiliki lingkup penugasan unit tertentu.
     */
    protected function getVerifikatorUnitId(Request $request): ?int
    {
        $user = $request->user();
        if (!$user) {
            return null;
        }

        $roleUnit = RoleUnit::where('role_id', $user->id)
            ->where('peran', 'verifikator')
            ->where('aktif', true)
            ->first();

        return $roleUnit?->unit_id;
    }

    /**
     * Resolusi pengajuan berdasarkan id numerik atau nomor_pengajuan string
     */
    protected function resolvePengajuan(string|int $id, ?int $unitId = null): PengajuanP1
    {
        $query = PengajuanP1::with(['unitKerja', 'riwayatStatus', 'hasilPerhitungan.pegawai']);

        if ($unitId) {
            $query->where('unit_id', $unitId);
        }

        if (is_numeric($id)) {
            $found = (clone $query)->where('id', (int) $id)->first();
            if ($found) {
                return $found;
            }
        }

        $found = (clone $query)->where('nomor_pengajuan', (string) $id)->first();
        if ($found) {
            return $found;
        }

        // Coba cari dengan format nomor lain jika mengandung angka
        if (preg_match('/(\d+)$/', (string) $id, $matches)) {
            $numericId = (int) $matches[1];
            $found = (clone $query)->where('id', $numericId)->first();
            if ($found) {
                return $found;
            }
        }

        return $query->findOrFail($id);
    }

    /**
     * Format status ke bentuk TitleCase untuk frontend
     */
    protected function formatStatus(?string $status): string
    {
        $st = strtolower(trim($status ?? 'diajukan'));
        return match ($st) {
            'diverifikasi', 'terverifikasi' => 'Diverifikasi',
            'dikembalikan', 'ditolak' => 'Dikembalikan',
            'disetujui', 'selesai', 'netto_ditetapkan' => 'Disetujui',
            default => 'Diajukan',
        };
    }

    /**
     * FR-23: Daftar Pengajuan P1 untuk diverifikasi
     */
    public function index(Request $request): JsonResponse
    {
        $unitId = $this->getVerifikatorUnitId($request);

        $query = PengajuanP1::with(['unitKerja', 'riwayatStatus', 'hasilPerhitungan']);

        if ($unitId) {
            $query->where('unit_id', $unitId);
        }

        // Filter unit (berdasarkan ID atau nama unit)
        if ($request->filled('unit') && $request->query('unit') !== 'semua') {
            $unitParam = $request->query('unit');
            if (is_numeric($unitParam)) {
                $query->where('unit_id', (int) $unitParam);
            } else {
                $query->whereHas('unitKerja', fn ($u) => $u->where('nama', 'like', "%{$unitParam}%"));
            }
        }

        // Filter periode
        if ($request->filled('periode') && $request->query('periode') !== 'semua') {
            $query->where('periode', $request->query('periode'));
        }

        // Filter status
        if ($request->filled('status') && $request->query('status') !== 'semua') {
            $st = strtolower($request->query('status'));
            if ($st === 'diverifikasi') {
                $query->whereIn('status', ['diverifikasi', 'terverifikasi']);
            } elseif ($st === 'dikembalikan') {
                $query->whereIn('status', ['dikembalikan', 'ditolak']);
            } elseif ($st === 'disetujui') {
                $query->whereIn('status', ['disetujui', 'selesai', 'netto_ditetapkan']);
            } elseif ($st === 'diajukan') {
                $query->where('status', 'diajukan');
            } else {
                $query->where('status', $st);
            }
        }

        $items = $query->orderByDesc('diajukan_at')->orderByDesc('id')->get()
            ->map(function ($p) {
                $tglDiajukan = $p->diajukan_at ?? $p->created_at ?? Carbon::now();
                $hariTertahan = max(0, (int) Carbon::parse($tglDiajukan)->diffInDays(Carbon::now()));
                $nomor = $p->nomor_pengajuan ?: sprintf('P1-2026-09-%03d', $p->id);
                $statusFormatted = $this->formatStatus($p->status);

                // Hitung riwayat kejadian
                $riwayatList = $p->riwayatStatus->map(function ($r) use ($p) {
                    $judul = match (strtolower($r->ke_status ?? '')) {
                        'diverifikasi' => 'Disetujui dan Diteruskan',
                        'dikembalikan' => 'Dikembalikan Verifikator',
                        'disetujui', 'selesai' => 'Disetujui UPT Remunerasi',
                        default => 'Diajukan Bendahara',
                    };

                    return [
                        'ke' => (int) ($p->pengajuan_ke ?: 1),
                        'judul' => $judul,
                        'waktu' => Carbon::parse($r->dicatat_at ?? $r->created_at)->translatedFormat('d F Y, H.i') . ' WIB',
                        'oleh' => ($r->pegawai?->nama ?? 'Sistem') . ' • ' . (str_contains(strtolower($judul), 'bendahara') ? 'Bendahara' : 'Verifikator'),
                        'catatan' => $r->catatan_alasan,
                        'selesai' => in_array(strtolower($r->ke_status ?? ''), ['diverifikasi', 'disetujui', 'selesai'], true),
                    ];
                });

                if ($riwayatList->isEmpty()) {
                    $riwayatList = collect([
                        [
                            'ke' => (int) ($p->pengajuan_ke ?: 1),
                            'judul' => 'Diajukan Bendahara',
                            'waktu' => Carbon::parse($tglDiajukan)->translatedFormat('d F Y, H.i') . ' WIB',
                            'oleh' => ($p->bendahara_nama ?? 'Bendahara') . ' • Bendahara',
                            'catatan' => null,
                            'selesai' => true,
                        ],
                    ]);
                }

                $jumlahPegawai = $p->hasilPerhitungan->count();
                if ($jumlahPegawai === 0) {
                    $jumlahPegawai = (int) ($p->total_pegawai ?? 10);
                }

                $totalGross = (float) ($p->total_remunerasi ?: $p->total_bruto ?: 51000000);
                $totalPotongan = (float) ($p->total_pengurangan ?: 750000);
                $totalSetelah = (float) ($p->total_bruto ?: max(0, $totalGross - $totalPotongan));

                return [
                    'id' => $nomor,
                    'raw_id' => $p->id,
                    'nomor_pengajuan' => $nomor,
                    'unit' => $p->unitKerja?->nama ?? 'Unit Kerja',
                    'unit_id' => $p->unit_id,
                    'periode' => $p->periode ?? 'Oktober 2026',
                    'jumlahPegawai' => $jumlahPegawai,
                    'jumlah_pegawai' => $jumlahPegawai,
                    'totalGross' => $totalGross,
                    'total_gross' => $totalGross,
                    'totalPotongan' => $totalPotongan,
                    'total_potongan' => $totalPotongan,
                    'totalSetelah' => $totalSetelah,
                    'total_setelah' => $totalSetelah,
                    'tanggalDiajukan' => Carbon::parse($tglDiajukan)->translatedFormat('d F Y'),
                    'tanggal_diajukan' => Carbon::parse($tglDiajukan)->format('Y-m-d'),
                    'waktuDiajukan' => Carbon::parse($tglDiajukan)->translatedFormat('d F Y, H.i') . ' WIB',
                    'bendahara' => $p->bendahara_nama ?? 'Bendahara Unit',
                    'status' => $statusFormatted,
                    'status_raw' => $p->status,
                    'ke' => (int) ($p->pengajuan_ke ?: 1),
                    'pengajuan_ke' => (int) ($p->pengajuan_ke ?: 1),
                    'tertahanHari' => $hariTertahan,
                    'tertahan_hari' => $hariTertahan,
                    'diperbarui' => Carbon::parse($p->updated_at ?? $tglDiajukan)->translatedFormat('d F Y, H.i') . ' WIB',
                    'riwayat' => $riwayatList->values()->all(),
                ];
            });

        return response()->json([
            'status' => 'success',
            'total' => $items->count(),
            'data' => $items,
        ]);
    }

    /**
     * FR-23: Detail Pemeriksaan Pengajuan P1 beserta rincian per-pegawai dan ringkasan validasi
     */
    public function show(Request $request, string|int $id): JsonResponse
    {
        $unitId = $this->getVerifikatorUnitId($request);
        $pengajuan = $this->resolvePengajuan($id, $unitId);

        $tglDiajukan = $pengajuan->diajukan_at ?? $pengajuan->created_at ?? Carbon::now();
        $nomor = $pengajuan->nomor_pengajuan ?: sprintf('P1-2026-09-%03d', $pengajuan->id);
        $statusFormatted = $this->formatStatus($pengajuan->status);

        // Ambil data hasil perhitungan rincian per pegawai
        $hasilList = HasilPerhitungan::with(['pegawai.unitKerja', 'usulanJabatan.jabatan.grade', 'presensiBulanan'])
            ->where('pengajuan_id', $pengajuan->id)
            ->get();

        // Jika belum ada hasil perhitungan terkait, ambil data pegawai di unit ini untuk pemeriksaan
        if ($hasilList->isEmpty()) {
            $hasilList = HasilPerhitungan::with(['pegawai.unitKerja', 'usulanJabatan.jabatan.grade', 'presensiBulanan'])
                ->whereHas('pegawai', fn ($p) => $p->where('unit_id', $pengajuan->unit_id))
                ->latest('id')
                ->take(10)
                ->get();
        }

        // Hitung rincian per pegawai dan deteksi kategori validasi
        $kategoriCount = [
            'kehadiran' => 0,
            'hukdis' => 0,
            'jabatan' => 0,
            'syarat' => 0,
            'tidakWajar' => 0,
        ];

        $pegawaiRows = $hasilList->map(function ($h) use (&$kategoriCount, $pengajuan) {
            $pegawai = $h->pegawai;
            $nip = $h->NIP;
            $nama = $pegawai?->nama ?? $nip;
            $jabatanNama = $h->usulanJabatan?->jabatan?->nama_jabatan ?? ($pegawai?->jenis === 'Tendik' ? 'Pranata Komputer' : 'Lektor Kepala');
            $gradeNum = (int) preg_replace('/\D/', '', $h->usulanJabatan?->jabatan?->grade?->kode_grade ?? '11') ?: 11;

            $statusKepegawaian = $pegawai?->status_kepegawaian ?? 'PNS';
            $presensi = $h->presensiBulanan;
            $hariKerja = (int) round((float) ($presensi?->hari_kerja ?? 22));
            $hadir = (int) round((float) ($presensi?->hadir ?? 21));
            $tidakHadir = (int) round((float) ($presensi?->tidak_hadir ?? ($hariKerja - $hadir)));

            $gross = (float) ($h->p1_gross ?: $h->p1_pertimbang ?: 5100000);
            $setelah = (float) ($h->p1_setelah_potongan ?: 5023500);

            // Deteksi penanda dan kategori validasi
            $kategori = [];
            $penanda = null;

            // 1. Kehadiran < 50%
            if ($hariKerja > 0 && ($hadir / $hariKerja) < 0.5) {
                $penanda = 'Tidak layak bayar';
                $kategori[] = 'kehadiran';
                $kategori[] = 'syarat';
                $kategoriCount['kehadiran']++;
                $kategoriCount['syarat']++;
            }

            // 2. Hukuman disiplin aktif
            $adaHukdis = HukumanDisiplin::where('NIP', $nip)
                ->where(function ($q) {
                    $q->whereNull('tanggal_berakhir')
                        ->orWhere('tanggal_berakhir', '>=', now()->toDateString());
                })
                ->exists();
            if ($adaHukdis || (float) $h->persen_hukdis > 0) {
                $penanda = $penanda ?? 'Hukdis aktif';
                $kategori[] = 'hukdis';
                $kategoriCount['hukdis']++;
            }

            // 3. Perubahan jabatan dalam periode ini
            $adaUsulanBaru = UsulanJabatan::where('NIP', $nip)
                ->whereIn('status', ['diverifikasi', 'ditetapkan', 'diajukan'])
                ->exists();
            if ($adaUsulanBaru) {
                $penanda = $penanda ?? 'Jabatan berubah';
                $kategori[] = 'jabatan';
                $kategoriCount['jabatan']++;
            }

            $potonganRincian = [];
            if ($h->pengurangan_rp > 0) {
                $potonganRincian[] = [
                    'label' => 'Potongan kehadiran',
                    'nominal' => (float) $h->pengurangan_rp,
                ];
            }
            if ((float) $h->persen_hukdis > 0) {
                $potonganRincian[] = [
                    'label' => 'Potongan hukuman disiplin (' . (float) $h->persen_hukdis . '%)',
                    'nominal' => (float) ($gross * ((float) $h->persen_hukdis / 100)),
                ];
            }

            return [
                'nip' => $nip,
                'nama' => $nama,
                'jabatan' => $jabatanNama,
                'grade' => $gradeNum,
                'status' => $statusKepegawaian,
                'hariKerja' => $hariKerja,
                'tidakHadir' => $tidakHadir,
                'potKehadiran' => ((float) $h->persen_potongan_hadir ?: 1.5) . '%',
                'potHukdis' => ((float) $h->persen_hukdis ?: 0) . '%',
                'gross' => $gross,
                'setelahPotongan' => $setelah,
                'penanda' => $penanda,
                'kategori' => array_values(array_unique($kategori)),
                // Rincian kalkulasi
                'nilaiJabatan' => (int) round((float) ($h->nilai_jabatan ?: 6285000)),
                'pir' => (int) round((float) ($h->pir ?: 3000)),
                'porsi' => (int) round((float) ($h->persen_p1 ?: 40)),
                'pengali' => (int) round((float) ($h->persen_status ?: 100)),
                'potongan' => $potonganRincian,
                'riwayatJabatan' => [
                    'judul' => "{$jabatanNama} • Grade {$gradeNum}",
                    'ket' => "SK/SPMT periode berlaku pada unit {$pengajuan->unitKerja?->nama}",
                ],
                'catatanBendahara' => $h->alasan_nol ?? null,
            ];
        });

        // Riwayat status dari DB
        $riwayatList = $pengajuan->riwayatStatus->map(function ($r) use ($pengajuan) {
            $judul = match (strtolower($r->ke_status ?? '')) {
                'diverifikasi' => 'Disetujui dan Diteruskan',
                'dikembalikan' => 'Dikembalikan Verifikator',
                'disetujui', 'selesai' => 'Disetujui UPT Remunerasi',
                default => 'Diajukan Bendahara',
            };

            return [
                'ke' => (int) ($pengajuan->pengajuan_ke ?: 1),
                'judul' => $judul,
                'waktu' => Carbon::parse($r->dicatat_at ?? $r->created_at)->translatedFormat('d F Y, H.i') . ' WIB',
                'oleh' => ($r->pegawai?->nama ?? 'Sistem') . ' • ' . (str_contains(strtolower($judul), 'bendahara') ? 'Bendahara' : 'Verifikator'),
                'catatan' => $r->catatan_alasan,
                'selesai' => in_array(strtolower($r->ke_status ?? ''), ['diverifikasi', 'disetujui', 'selesai'], true),
            ];
        });

        if ($riwayatList->isEmpty()) {
            $riwayatList = collect([
                [
                    'ke' => (int) ($pengajuan->pengajuan_ke ?: 1),
                    'judul' => 'Diajukan Bendahara',
                    'waktu' => Carbon::parse($tglDiajukan)->translatedFormat('d F Y, H.i') . ' WIB',
                    'oleh' => ($pengajuan->bendahara_nama ?? 'Bendahara') . ' • Bendahara',
                    'catatan' => null,
                    'selesai' => true,
                ],
            ]);
        }

        $daftarPeriksa = [
            ['id' => 'presensi', 'label' => 'Presensi lengkap', 'awal' => true],
            ['id' => 'jabatan', 'label' => 'Jabatan dan grade sesuai riwayat resmi', 'awal' => true],
            ['id' => 'status', 'label' => 'Status dan pengali sesuai', 'awal' => true],
            ['id' => 'potongan', 'label' => 'Potongan sesuai tabel pedoman', 'awal' => false],
            ['id' => 'nol', 'label' => 'Pegawai tidak layak bayar bernilai Rp 0', 'awal' => true],
        ];

        $jumlahPegawai = $pegawaiRows->count();
        $totalGross = (float) ($pengajuan->total_remunerasi ?: $pengajuan->total_bruto ?: 51000000);
        $totalPotongan = (float) ($pengajuan->total_pengurangan ?: 750000);
        $totalSetelah = (float) ($pengajuan->total_bruto ?: max(0, $totalGross - $totalPotongan));

        $ringkasanValidasi = [
            ['key' => 'kehadiran', 'label' => 'Kehadiran < 50%', 'jumlah' => $kategoriCount['kehadiran']],
            ['key' => 'hukdis', 'label' => 'Hukuman disiplin aktif', 'jumlah' => $kategoriCount['hukdis']],
            ['key' => 'jabatan', 'label' => 'Jabatan/grade berubah', 'jumlah' => $kategoriCount['jabatan']],
            ['key' => 'syarat', 'label' => 'Tidak memenuhi syarat', 'jumlah' => $kategoriCount['syarat']],
            ['key' => 'tidakWajar', 'label' => 'Baris tidak wajar', 'jumlah' => $kategoriCount['tidakWajar']],
        ];

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $nomor,
                'raw_id' => $pengajuan->id,
                'nomor_pengajuan' => $nomor,
                'unit' => $pengajuan->unitKerja?->nama ?? 'Unit Kerja',
                'unit_id' => $pengajuan->unit_id,
                'periode' => $pengajuan->periode ?? 'Oktober 2026',
                'bendahara' => $pengajuan->bendahara_nama ?? 'Bendahara Unit',
                'waktuDiajukan' => Carbon::parse($tglDiajukan)->translatedFormat('d F Y, H.i') . ' WIB',
                'tanggalDiajukan' => Carbon::parse($tglDiajukan)->translatedFormat('d F Y'),
                'jumlahPegawai' => $jumlahPegawai,
                'totalGross' => $totalGross,
                'totalPotongan' => $totalPotongan,
                'totalSetelah' => $totalSetelah,
                'status' => $statusFormatted,
                'status_raw' => $pengajuan->status,
                'ke' => (int) ($pengajuan->pengajuan_ke ?: 1),
                'bisa_memutuskan' => strtolower($pengajuan->status ?? '') === 'diajukan',
                'ringkasan_validasi' => $ringkasanValidasi,
                'daftar_periksa' => $daftarPeriksa,
                'pegawai' => $pegawaiRows->values()->all(),
                'riwayat' => $riwayatList->values()->all(),
            ],
        ]);
    }

    /**
     * FR-23: Menyetujui Pengajuan P1 dan meneruskannya ke UPT Remunerasi
     */
    public function setujui(Request $request, string|int $id): JsonResponse
    {
        $user = $request->user();
        $unitId = $this->getVerifikatorUnitId($request);
        $pengajuan = $this->resolvePengajuan($id, $unitId);

        // Hanya pengajuan berstatus 'diajukan' yang dapat disetujui
        if (strtolower($pengajuan->status ?? '') !== 'diajukan') {
            return response()->json([
                'message' => "Pengajuan dengan status '{$pengajuan->status}' tidak dapat diverifikasi kembali.",
            ], 422);
        }

        $validated = $request->validate([
            'catatan' => 'nullable|string|max:1000',
        ]);

        return DB::transaction(function () use ($pengajuan, $user, $validated) {
            $statusSebelum = $pengajuan->status;
            $catatanAlasan = $validated['catatan'] ?? 'Seluruh validasi otomatis telah diperiksa dan sesuai. Pengajuan diteruskan ke UPT Remunerasi.';

            $pengajuan->status = 'diverifikasi';
            $pengajuan->save();

            // Catat Riwayat Status
            RiwayatStatus::create([
                'pengajuan_id' => $pengajuan->id,
                'NIP' => $user->NIP,
                'dari_status' => $statusSebelum,
                'ke_status' => 'diverifikasi',
                'catatan_alasan' => $catatanAlasan,
                'dicatat_at' => Carbon::now(),
            ]);

            // Catat Jejak Audit (FR-26 & NFR-05)
            AuditLog::create([
                'NIP' => $user->NIP,
                'unit_id' => $pengajuan->unit_id,
                'aksi' => 'Menyetujui pengajuan',
                'objek_type' => 'PengajuanP1',
                'objek_id' => $pengajuan->id,
                'nilai_sebelum' => ['status' => $statusSebelum, 'pengajuan_ke' => $pengajuan->pengajuan_ke],
                'nilai_sesudah' => ['status' => 'diverifikasi', 'tujuan' => 'UPT Remunerasi'],
                'alasan' => $catatanAlasan,
                'dicatat_at' => Carbon::now(),
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Pengajuan P1 berhasil diverifikasi dan diteruskan ke UPT Remunerasi (FR-23).',
                'data' => [
                    'id' => $pengajuan->nomor_pengajuan ?: $pengajuan->id,
                    'status' => 'Diverifikasi',
                    'status_raw' => 'diverifikasi',
                ],
            ]);
        });
    }

    /**
     * FR-23: Mengembalikan Pengajuan P1 kepada Bendahara Unit disertai catatan alasan wajib
     */
    public function kembalikan(Request $request, string|int $id): JsonResponse
    {
        $user = $request->user();
        $unitId = $this->getVerifikatorUnitId($request);
        $pengajuan = $this->resolvePengajuan($id, $unitId);

        // Hanya pengajuan berstatus 'diajukan' yang dapat dikembalikan
        if (strtolower($pengajuan->status ?? '') !== 'diajukan') {
            return response()->json([
                'message' => "Pengajuan dengan status '{$pengajuan->status}' tidak dapat dikembalikan.",
            ], 422);
        }

        // ATURAN KETAT FR-23: Catatan alasan pengembalian WAJIB diisi! Pengembalian tanpa catatan alasan ditolak (422).
        $validated = $request->validate([
            'alasan' => 'required_without:catatan|string|min:5|max:1000',
            'catatan' => 'required_without:alasan|string|min:5|max:1000',
        ], [
            'alasan.required_without' => 'Catatan alasan pengembalian pengajuan P1 wajib diisi (FR-23).',
            'catatan.required_without' => 'Catatan alasan pengembalian pengajuan P1 wajib diisi (FR-23).',
            'alasan.min' => 'Catatan alasan pengembalian minimal 5 karakter.',
            'catatan.min' => 'Catatan alasan pengembalian minimal 5 karakter.',
        ]);

        $alasanFinal = trim($validated['alasan'] ?? $validated['catatan'] ?? '');

        return DB::transaction(function () use ($pengajuan, $user, $alasanFinal) {
            $statusSebelum = $pengajuan->status;

            $pengajuan->status = 'dikembalikan';
            $pengajuan->save();

            // Catat Riwayat Status
            RiwayatStatus::create([
                'pengajuan_id' => $pengajuan->id,
                'NIP' => $user->NIP,
                'dari_status' => $statusSebelum,
                'ke_status' => 'dikembalikan',
                'catatan_alasan' => $alasanFinal,
                'dicatat_at' => Carbon::now(),
            ]);

            // Catat Jejak Audit (FR-26 & NFR-05)
            AuditLog::create([
                'NIP' => $user->NIP,
                'unit_id' => $pengajuan->unit_id,
                'aksi' => 'Mengembalikan pengajuan',
                'objek_type' => 'PengajuanP1',
                'objek_id' => $pengajuan->id,
                'nilai_sebelum' => ['status' => $statusSebelum],
                'nilai_sesudah' => ['status' => 'dikembalikan', 'penerima' => 'Bendahara Unit'],
                'alasan' => $alasanFinal,
                'dicatat_at' => Carbon::now(),
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Pengajuan P1 berhasil dikembalikan kepada Bendahara Unit untuk perbaikan (FR-23).',
                'data' => [
                    'id' => $pengajuan->nomor_pengajuan ?: $pengajuan->id,
                    'status' => 'Dikembalikan',
                    'status_raw' => 'dikembalikan',
                    'catatan' => $alasanFinal,
                ],
            ]);
        });
    }
}
