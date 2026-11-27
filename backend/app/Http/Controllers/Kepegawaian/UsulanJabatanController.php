<?php

namespace App\Http\Controllers\Kepegawaian;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\DokumenPendukung;
use App\Models\Grade;
use App\Models\HukumanDisiplin;
use App\Models\Jabatan;
use App\Models\Pegawai;
use App\Models\Pengaduan;
use App\Models\RoleUnit;
use App\Models\UsulanJabatan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class UsulanJabatanController extends Controller
{
    protected function getKepegawaianRoleUnit(Request $request): ?RoleUnit
    {
        $user = $request->user();
        if (!$user) {
            return null;
        }

        return RoleUnit::with('unitKerja')
            ->where('role_id', $user->id)
            ->where('peran', 'kepegawaian')
            ->where('aktif', true)
            ->first();
    }

    protected function resolveUsulan(string|int $id): UsulanJabatan
    {
        if (is_numeric($id)) {
            $found = UsulanJabatan::with(['pegawai.unitKerja', 'jabatan.grade', 'jabatanLama.grade', 'unitKerja', 'dokumen', 'dokumenSpmt'])->find((int) $id);
            if ($found) {
                return $found;
            }
        }

        if (preg_match('/^USL-(\d{4})-0*(\d+)$/i', (string) $id, $m)) {
            $nomor = (int) $m[2];
            $found = UsulanJabatan::with(['pegawai.unitKerja', 'jabatan.grade', 'jabatanLama.grade', 'unitKerja', 'dokumen', 'dokumenSpmt'])
                ->where('nomor_urutan', $nomor)
                ->orWhere('id', $nomor)
                ->first();
            if ($found) {
                return $found;
            }
        }

        return UsulanJabatan::with(['pegawai.unitKerja', 'jabatan.grade', 'jabatanLama.grade', 'unitKerja', 'dokumen', 'dokumenSpmt'])
            ->findOrFail($id);
    }

    protected function formatUsulan(UsulanJabatan $u): array
    {
        $pegawai = $u->pegawai;
        $jabatanBaru = $u->jabatan;
        $jabatanLama = $u->jabatanLama;

        if (!$jabatanLama) {
            $usulanSebelumnya = UsulanJabatan::with('jabatan.grade')
                ->where('NIP', $u->NIP)
                ->whereIn('status', ['ditetapkan', 'diverifikasi'])
                ->where('id', '!=', $u->id)
                ->orderByDesc('tanggal_berlaku')
                ->orderByDesc('id')
                ->first();
            $jabatanLama = $usulanSebelumnya?->jabatan;
        }

        $tahun = $u->diajukan_at ? $u->diajukan_at->format('Y') : ($u->created_at ? $u->created_at->format('Y') : '2026');
        $kodeUsulan = sprintf('USL-%s-%03d', $tahun, $u->nomor_urutan ?: $u->id);

        $gradeLamaNum = $jabatanLama?->grade?->kode_grade ? (int) preg_replace('/\D/', '', $jabatanLama->grade->kode_grade) : 0;
        $gradeBaruNum = $jabatanBaru?->grade?->kode_grade ? (int) preg_replace('/\D/', '', $jabatanBaru->grade->kode_grade) : 0;

        $statusNormalized = match (strtolower($u->status ?? 'diajukan')) {
            'dikembalikan', 'ditolak' => 'dikembalikan',
            'disetujui_verifikator', 'diverifikasi', 'terverifikasi' => 'disetujui_verifikator',
            'ditetapkan' => 'ditetapkan',
            default => 'diajukan',
        };

        $statusLabel = match ($statusNormalized) {
            'dikembalikan' => 'Dikembalikan',
            'disetujui_verifikator' => 'Disetujui Verifikator',
            'ditetapkan' => 'Ditetapkan',
            default => 'Diajukan',
        };

        $jenisMap = [
            'promosi' => 'Promosi',
            'kenaikan_grade' => 'Kenaikan grade',
            'mutasi' => 'Mutasi jabatan',
            'penyesuaian' => 'Penyesuaian',
        ];
        $jenisLabel = $jenisMap[strtolower($u->jenis_perubahan ?? '')] ?? ($u->jenis_perubahan ?: 'Promosi');

        $skNama = $u->dokumen?->nama_file ?? ($u->dokumen?->file_path ? basename($u->dokumen->file_path) : 'SK_' . str_replace(' ', '_', $pegawai?->nama ?? $u->NIP) . '.pdf');
        $spmtNama = $u->dokumenSpmt?->nama_file ?? ($u->dokumenSpmt?->file_path ? basename($u->dokumenSpmt->file_path) : 'SPMT_' . str_replace(' ', '_', $pegawai?->nama ?? $u->NIP) . '.pdf');

        $jejak = $u->jejak;
        if (empty($jejak) || !is_array($jejak)) {
            $jejak = [
                [
                    'label' => 'Diajukan',
                    'waktu' => ($u->diajukan_at ?? $u->created_at ?? now())->translatedFormat('d F Y \p\u\k\u\l H.i'),
                    'oleh' => 'Bidang Kepegawaian',
                ],
            ];
            if ($statusNormalized === 'dikembalikan') {
                $jejak[] = [
                    'label' => 'Dikembalikan',
                    'waktu' => ($u->updated_at ?? now())->translatedFormat('d F Y \p\u\k\u\l H.i'),
                    'oleh' => 'Verifikator',
                    'catatan' => $u->catatan_verifikator,
                ];
            } elseif (in_array($statusNormalized, ['disetujui_verifikator', 'ditetapkan'], true)) {
                $jejak[] = [
                    'label' => 'Disetujui',
                    'waktu' => ($u->updated_at ?? now())->translatedFormat('d F Y \p\u\k\u\l H.i'),
                    'oleh' => 'Verifikator',
                    'catatan' => $u->catatan_verifikator ?? 'Dokumen SK dan SPMT lengkap serta sesuai.',
                ];
            }
            if ($statusNormalized === 'ditetapkan') {
                $jejak[] = [
                    'label' => 'Ditetapkan ke Riwayat Resmi',
                    'waktu' => ($u->updated_at ?? now())->translatedFormat('d F Y \p\u\k\u\l H.i'),
                    'oleh' => 'UPT Remunerasi',
                ];
            }
        }

        return [
            'id' => $u->id,
            'kode_usulan' => $kodeUsulan,
            'nomor_urutan' => $u->nomor_urutan ?: $u->id,
            'NIP' => $u->NIP,
            'nip' => $u->NIP,
            'nama_pegawai' => $pegawai?->nama ?? '-',
            'nama' => $pegawai?->nama ?? '-',
            'jenis_pegawai' => $pegawai?->jenis ?? '-',
            'unit_nama' => $u->unitKerja?->nama ?? '-',
            'jabatan_lama' => [
                'id' => $jabatanLama?->id,
                'nama' => $jabatanLama?->nama_jabatan ?? 'Belum ada',
                'grade' => $jabatanLama?->grade?->kode_grade ?? '-',
                'grade_num' => $gradeLamaNum,
                'nilai' => (float) ($jabatanLama?->grade?->nilai ?? 0),
            ],
            'lama' => [
                'jabatan' => $jabatanLama?->nama_jabatan ?? 'Belum ada',
                'grade' => $gradeLamaNum,
            ],
            'jabatan_baru' => [
                'id' => $jabatanBaru?->id,
                'nama' => $jabatanBaru?->nama_jabatan ?? '-',
                'grade' => $jabatanBaru?->grade?->kode_grade ?? '-',
                'grade_num' => $gradeBaruNum,
                'nilai' => (float) ($jabatanBaru?->grade?->nilai ?? 0),
            ],
            'baru' => [
                'jabatan' => $jabatanBaru?->nama_jabatan ?? '-',
                'grade' => $gradeBaruNum,
            ],
            'jenis_perubahan' => strtolower($u->jenis_perubahan ?? 'promosi'),
            'jenis' => $jenisLabel,
            'tanggal_berlaku' => $u->tanggal_berlaku?->format('Y-m-d'),
            'mulai' => $u->tanggal_berlaku ? $u->tanggal_berlaku->translatedFormat('j F Y') : '-',
            'alasan' => $u->alasan ?? 'Pengajuan perubahan jabatan/grade berdasarkan SK dan SPMT.',
            'status' => $statusNormalized,
            'status_label' => $statusLabel,
            'catatan_verifikator' => $u->catatan_verifikator,
            'catatanKembali' => $u->catatan_verifikator,
            'diajukan_at' => $u->diajukan_at?->format('Y-m-d H:i:s'),
            'sk' => $skNama,
            'spmt' => $spmtNama,
            'jejak' => $jejak,
            'dokumen' => $u->dokumen ? [
                'id' => $u->dokumen->id,
                'jenis_dokumen' => $u->dokumen->jenis_dokumen ?? 'SK Jabatan',
                'nama_file' => $skNama,
                'file_path' => $u->dokumen->file_path,
                'ukuran_kb' => $u->dokumen->ukuran_kb ?? 1200,
                'url' => url("/api/kepegawaian/dokumen/{$u->dokumen->id}"),
            ] : null,
            'dokumen_spmt' => $u->dokumenSpmt ? [
                'id' => $u->dokumenSpmt->id,
                'jenis_dokumen' => $u->dokumenSpmt->jenis_dokumen ?? 'SPMT',
                'nama_file' => $spmtNama,
                'file_path' => $u->dokumenSpmt->file_path,
                'ukuran_kb' => $u->dokumenSpmt->ukuran_kb ?? 850,
                'url' => url("/api/kepegawaian/dokumen/{$u->dokumenSpmt->id}"),
            ] : null,
        ];
    }

    /**
     * Dapatkan dashboard stats untuk beranda kepegawaian
     */
    public function dashboard(Request $request): JsonResponse
    {
        $roleUnit = $this->getKepegawaianRoleUnit($request);
        $unitId = $roleUnit?->unit_id ?? $request->user()?->pegawai?->unit_id;
        $unitNama = $roleUnit?->unitKerja?->nama ?? ($request->user()?->pegawai?->unitKerja?->nama ?? 'Fakultas Teknologi Informasi');

        $pegawaiQuery = Pegawai::query();
        if ($unitId) {
            $pegawaiQuery->where('unit_id', $unitId);
        }
        $totalPegawai = $pegawaiQuery->count();
        $pegawaiAktif = (clone $pegawaiQuery)->where('aktif', true)->count();

        $usulanQuery = UsulanJabatan::query();
        if ($unitId) {
            $usulanQuery->where('unit_id', $unitId);
        }

        $usulanMenunggu = (clone $usulanQuery)->where('status', 'diajukan')->count();
        $usulanDikembalikan = (clone $usulanQuery)->whereIn('status', ['dikembalikan', 'ditolak'])->count();
        $usulanDisetujui = (clone $usulanQuery)->whereIn('status', ['disetujui_verifikator', 'diverifikasi', 'terverifikasi'])->count();
        $usulanDitetapkan = (clone $usulanQuery)->where('status', 'ditetapkan')->count();

        // Pengaduan menunggu diagnosis di unit
        $pengaduanQuery = Pengaduan::query();
        if ($unitId) {
            $pengaduanQuery->where('unit_id', $unitId);
        }
        $pengaduanMenunggu = $pengaduanQuery->whereIn('status', ['Diajukan', 'diajukan', 'Menunggu', 'menunggu'])->count();

        // Hukuman disiplin aktif di unit
        $hariIni = now()->format('Y-m-d');
        $hukumanQuery = HukumanDisiplin::query();
        if ($unitId) {
            $hukumanQuery->whereHas('pegawai', fn ($q) => $q->where('unit_id', $unitId));
        }
        $hukumanAktif = $hukumanQuery
            ->where(function ($q) use ($hariIni) {
                $q->whereNull('tanggal_mulai')->orWhere('tanggal_mulai', '<=', $hariIni);
            })
            ->where(function ($q) use ($hariIni) {
                $q->whereNull('tanggal_berakhir')->orWhere('tanggal_berakhir', '>=', $hariIni);
            })
            ->count();

        // Rekap presensi terkini & status approval
        $presensiTerkini = \App\Models\PresensiReport::where('unit_id', $unitId)
            ->latest('id')
            ->first();

        return response()->json([
            'unit_kerja' => $unitNama,
            'statistik' => [
                'pegawai_total' => $totalPegawai,
                'pegawai_aktif' => $pegawaiAktif,
                'usulan_menunggu' => $usulanMenunggu,
                'usulan_dikembalikan' => $usulanDikembalikan,
                'usulan_disetujui' => $usulanDisetujui,
                'usulan_ditetapkan' => $usulanDitetapkan,
                'pengaduan_menunggu' => $pengaduanMenunggu,
                'hukuman_aktif' => $hukumanAktif,
            ],
            'presensi' => [
                'exists' => $presensiTerkini !== null,
                'periode' => $presensiTerkini?->masa_file ?? $presensiTerkini?->periode,
                'status_approval' => $presensiTerkini?->status_approval ?? 'draft',
                'siap_perhitungan' => (bool) ($presensiTerkini?->siap_perhitungan ?? false),
                'alasan_penolakan' => $presensiTerkini?->alasan_penolakan,
                'jumlah_valid' => (int) ($presensiTerkini?->jumlah_valid ?? 0),
            ],
        ]);
    }

    /**
     * FR-04 (L5): Daftar usulan perubahan jabatan/grade
     */
    public function index(Request $request): JsonResponse
    {
        $roleUnit = $this->getKepegawaianRoleUnit($request);
        $unitId = $roleUnit?->unit_id ?? $request->user()?->pegawai?->unit_id;

        $query = UsulanJabatan::with(['pegawai', 'jabatan.grade', 'jabatanLama.grade', 'unitKerja', 'dokumen', 'dokumenSpmt']);

        if ($unitId) {
            $query->where('unit_id', $unitId);
        }

        if ($request->filled('status') && $request->query('status') !== 'semua') {
            $status = strtolower($request->query('status'));
            if ($status === 'disetujui verifikator' || $status === 'disetujui_verifikator') {
                $query->whereIn('status', ['disetujui_verifikator', 'diverifikasi', 'terverifikasi']);
            } elseif ($status === 'dikembalikan') {
                $query->whereIn('status', ['dikembalikan', 'ditolak']);
            } else {
                $query->where('status', $status);
            }
        }

        if ($request->filled('q')) {
            $q = $request->query('q');
            $query->where(function ($sub) use ($q) {
                $sub->where('NIP', 'like', "%{$q}%")
                    ->orWhereHas('pegawai', function ($pq) use ($q) {
                        $pq->where('nama', 'like', "%{$q}%")
                            ->orWhere('NIP', 'like', "%{$q}%");
                    });
            });
        }

        if ($request->filled('jenis') && $request->query('jenis') !== 'semua') {
            $query->where('jenis_perubahan', $request->query('jenis'));
        }

        $usulanList = $query->orderByDesc('diajukan_at')->orderByDesc('id')->get()
            ->map(fn ($u) => $this->formatUsulan($u));

        return response()->json([
            'unit_kerja' => $roleUnit?->unitKerja?->nama ?? 'Fakultas Teknologi Informasi',
            'total' => $usulanList->count(),
            'data' => $usulanList,
        ]);
    }

    /**
     * FR-04 & FR-05 (L5 & L6): Detail satu usulan jabatan beserta dokumen dan riwayat jabatan resmi pegawai
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $roleUnit = $this->getKepegawaianRoleUnit($request);
        $unitId = $roleUnit?->unit_id ?? $request->user()?->pegawai?->unit_id;

        $usulan = $this->resolveUsulan($id);

        if ($unitId && $usulan->unit_id !== $unitId) {
            return response()->json([
                'message' => 'Akses ditolak: Usulan ini bukan berasal dari unit kerja Anda.',
            ], 403);
        }

        $formatted = $this->formatUsulan($usulan);
        $pegawai = $usulan->pegawai;

        // Ambil seluruh riwayat jabatan resmi pegawai (FR-31: riwayat sebelumnya tidak ditimpa)
        $riwayatResmi = UsulanJabatan::with('jabatan.grade')
            ->where('NIP', $usulan->NIP)
            ->whereIn('status', ['ditetapkan', 'diverifikasi'])
            ->orderByDesc('tanggal_berlaku')
            ->orderByDesc('id')
            ->get()
            ->values()
            ->map(function ($r, $idx) {
                $gKode = $r->jabatan?->grade?->kode_grade ?? '-';
                return [
                    'id' => $r->id,
                    'jabatan' => $r->jabatan?->nama_jabatan ?? '-',
                    'grade' => $gKode,
                    'mulai_berlaku' => $r->tanggal_berlaku ? $r->tanggal_berlaku->translatedFormat('j F Y') : '-',
                    'berakhir' => $idx === 0 ? 'Sekarang' : 'Riwayat sebelumnya',
                    'status' => $idx === 0 ? 'Berlaku' : 'Riwayat lama',
                ];
            });

        $formatted['pegawai'] = [
            'NIP' => $pegawai?->NIP,
            'nama' => $pegawai?->nama ?? '-',
            'jenis' => $pegawai?->jenis ?? '-',
            'status_kepegawaian' => $pegawai?->status_kepegawaian ?? '-',
            'pangkat_golongan' => $pegawai?->pangkat_golongan ?? '-',
            'email' => $pegawai?->email ?? '-',
        ];
        $formatted['riwayat_jabatan'] = $riwayatResmi;

        return response()->json($formatted);
    }

    /**
     * Validasi berkas PDF maks 5 MB (FR-05 & NFR-11 - L6)
     */
    protected function validatePdfUpload(Request $request, string $fieldName): ?JsonResponse
    {
        if ($request->hasFile($fieldName)) {
            $file = $request->file($fieldName);
            $ext = strtolower($file->getClientOriginalExtension());
            $mime = strtolower($file->getClientMimeType() ?: $file->getMimeType() ?: '');
            $sizeBytes = $file->getSize();

            if ($ext !== 'pdf' || ($mime !== '' && !str_contains($mime, 'pdf'))) {
                return response()->json([
                    'message' => "Format berkas {$fieldName} ditolak (NFR-11): Dokumen pendukung SK/SPMT hanya diterima dalam format PDF.",
                    'errors' => [
                        $fieldName => ['Dokumen pendukung SK/SPMT hanya diterima dalam format PDF.'],
                    ],
                ], 422);
            }

            if ($sizeBytes > 5 * 1024 * 1024) {
                return response()->json([
                    'message' => "Ukuran berkas {$fieldName} ditolak (NFR-11): Ukuran dokumen pendukung SK/SPMT maksimal 5 MB.",
                    'errors' => [
                        $fieldName => ['Ukuran dokumen pendukung SK/SPMT maksimal 5 MB (5120 KB).'],
                    ],
                ], 422);
            }
        }

        return null;
    }

    /**
     * FR-04 & FR-05 & NFR-11 (L5 & L6): Buat usulan perubahan jabatan/grade baru beserta unggah SK/SPMT PDF maks 5 MB
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        $roleUnit = $this->getKepegawaianRoleUnit($request);
        $unitId = $roleUnit?->unit_id ?? $user?->pegawai?->unit_id;

        // Validasi eksplisit berkas PDF maks 5 MB (L6: FR-05 & NFR-11)
        foreach (['dokumen_sk', 'dokumen_spmt', 'file_sk', 'file_spmt'] as $fileField) {
            if ($errResponse = $this->validatePdfUpload($request, $fileField)) {
                return $errResponse;
            }
        }

        // Validasi nama file string jika dikirim tanpa binary upload
        foreach (['sk', 'spmt'] as $strField) {
            if ($request->filled($strField) && is_string($request->input($strField))) {
                $val = trim($request->input($strField));
                if (!str_ends_with(strtolower($val), '.pdf')) {
                    return response()->json([
                        'message' => "Format dokumen {$strField} ditolak (NFR-11): Dokumen pendukung SK/SPMT wajib berformat PDF.",
                        'errors' => [
                            $strField => ['Dokumen pendukung SK/SPMT wajib berformat PDF.'],
                        ],
                    ], 422);
                }
            }
        }

        $nip = $request->input('NIP') ?? $request->input('nip');
        $tanggalBerlaku = $request->input('tanggal_berlaku') ?? $request->input('mulaiIso') ?? $request->input('mulai');
        $jenisRaw = strtolower(trim((string) ($request->input('jenis_perubahan') ?? $request->input('jenis') ?? 'promosi')));
        $jenisNormalized = match ($jenisRaw) {
            'promosi' => 'promosi',
            'kenaikan grade', 'kenaikan_grade' => 'kenaikan_grade',
            'mutasi', 'mutasi jabatan', 'mutasi_jabatan' => 'mutasi',
            'penyesuaian' => 'penyesuaian',
            default => $jenisRaw,
        };

        // Resolusi jabatan_id dari master data UPT Remunerasi (FR-04 & FR-30)
        $jabatanId = $request->input('jabatan_id');
        if (!$jabatanId && ($request->filled('jabatan_baru') || $request->filled('jabatanBaru'))) {
            $namaJabatan = trim((string) ($request->input('jabatan_baru') ?? $request->input('jabatanBaru')));
            $gradeBaruInput = $request->input('grade_baru') ?? $request->input('gradeBaru');

            // Cek apakah jabatan ada di master data Jabatan
            $masterJabatanQuery = Jabatan::where('nama_jabatan', $namaJabatan);
            if (!$masterJabatanQuery->exists()) {
                return response()->json([
                    'message' => "Jabatan '{$namaJabatan}' tidak terdaftar pada daftar master Jabatan UPT Remunerasi (FR-04 & FR-30).",
                    'errors' => [
                        'jabatan_id' => ['Hanya jabatan dan grade pada daftar master UPT Remunerasi (FR-30) yang dapat dipilih.'],
                    ],
                ], 422);
            }

            if ($gradeBaruInput !== null && $gradeBaruInput !== '') {
                $kodeGradeStr = is_numeric($gradeBaruInput) ? "Grade {$gradeBaruInput}" : (string) $gradeBaruInput;
                $gradeModel = Grade::where('kode_grade', $kodeGradeStr)
                    ->orWhere('kode_grade', (string) $gradeBaruInput)
                    ->first();

                if (!$gradeModel) {
                    return response()->json([
                        'message' => "Grade '{$gradeBaruInput}' tidak terdaftar pada daftar master Grade UPT Remunerasi (FR-04 & FR-30).",
                        'errors' => [
                            'grade' => ['Hanya grade pada daftar master UPT Remunerasi (FR-30) yang dapat dipilih.'],
                        ],
                    ], 422);
                }

                // Cari kombinasi jabatan + grade di master, atau buat tautan master jika nama jabatan sudah ada di master
                $jabatanMatch = Jabatan::where('nama_jabatan', $namaJabatan)
                    ->where('kode_id', $gradeModel->id)
                    ->first();

                if (!$jabatanMatch) {
                    $jabatanMatch = Jabatan::where('nama_jabatan', $namaJabatan)->first();
                }
                $jabatanId = $jabatanMatch?->id;
            } else {
                $jabatanId = $masterJabatanQuery->first()?->id;
            }
        }

        $request->merge([
            'NIP' => $nip,
            'jabatan_id' => $jabatanId,
            'jenis_perubahan' => $jenisNormalized,
            'tanggal_berlaku' => $tanggalBerlaku,
        ]);

        $validated = $request->validate([
            'NIP' => ['required', 'string', 'exists:pegawai,NIP'],
            'jabatan_id' => ['required', 'integer', 'exists:jabatan,id'],
            'jenis_perubahan' => ['required', 'in:promosi,mutasi,kenaikan_grade,penyesuaian'],
            'tanggal_berlaku' => ['required', 'date'],
            'alasan' => ['nullable', 'string', 'max:2000'],
            'dokumen_sk' => ['nullable', 'file', 'mimes:pdf', 'max:5120'],
            'dokumen_spmt' => ['nullable', 'file', 'mimes:pdf', 'max:5120'],
        ], [
            'NIP.required' => 'Pegawai wajib dipilih.',
            'NIP.exists' => 'Pegawai tidak terdaftar.',
            'jabatan_id.required' => 'Jabatan dan grade baru wajib dipilih dari master data UPT Remunerasi.',
            'jabatan_id.exists' => 'Hanya jabatan/grade pada daftar master UPT Remunerasi (FR-30) yang dapat dipilih.',
            'tanggal_berlaku.required' => 'Tanggal mulai berlaku wajib diisi.',
            'dokumen_sk.mimes' => 'Berkas SK harus berformat PDF.',
            'dokumen_sk.max' => 'Ukuran berkas SK maksimal 5 MB.',
            'dokumen_spmt.mimes' => 'Berkas SPMT harus berformat PDF.',
            'dokumen_spmt.max' => 'Ukuran berkas SPMT maksimal 5 MB.',
        ]);

        $pegawai = Pegawai::where('NIP', $validated['NIP'])->firstOrFail();

        if ($unitId && $pegawai->unit_id !== $unitId) {
            return response()->json([
                'message' => 'Akses ditolak: Pegawai ini bukan berasal dari unit kerja Anda.',
            ], 403);
        }

        if (!$pegawai->aktif) {
            return response()->json([
                'message' => 'Tidak dapat mengajukan perubahan jabatan/grade untuk pegawai yang berstatus nonaktif.',
                'errors' => [
                    'NIP' => ['Pegawai berstatus nonaktif.'],
                ],
            ], 422);
        }

        // Cek apakah pegawai masih memiliki usulan yang sedang berjalan (belum ditetapkan)
        $usulanMenggantung = UsulanJabatan::where('NIP', $pegawai->NIP)
            ->whereIn('status', ['diajukan'])
            ->exists();
        if ($usulanMenggantung) {
            return response()->json([
                'message' => 'Pegawai ini masih memiliki usulan perubahan jabatan/grade yang sedang menunggu pemeriksaan Verifikator.',
                'errors' => [
                    'NIP' => ['Masih terdapat usulan aktif yang sedang diperiksa Verifikator untuk pegawai ini.'],
                ],
            ], 422);
        }

        // Cari jabatan resmi saat ini sebagai jabatan_lama_id dan pastikan tidak mengusulkan ke jabatan+grade yang sama persis
        $usulanResmiTerakhir = UsulanJabatan::where('NIP', $pegawai->NIP)
            ->whereIn('status', ['ditetapkan', 'diverifikasi'])
            ->orderByDesc('tanggal_berlaku')
            ->orderByDesc('id')
            ->first();

        if ($usulanResmiTerakhir && (int) $usulanResmiTerakhir->jabatan_id === (int) $validated['jabatan_id']) {
            return response()->json([
                'message' => 'Jabatan dan grade yang diusulkan sama persis dengan jabatan/grade pegawai yang sedang berlaku saat ini.',
                'errors' => [
                    'jabatan_id' => ['Jabatan/grade baru tidak boleh sama dengan jabatan/grade yang sedang berlaku.'],
                ],
            ], 422);
        }

        /** @var JsonResponse $response */
        $response = DB::transaction(function () use ($validated, $pegawai, $user, $request, $usulanResmiTerakhir): JsonResponse {
            // Simpan dokumen SK
            $dokumenSkId = null;
            $skFile = $request->file('dokumen_sk') ?? $request->file('file_sk');
            if ($skFile) {
                $path = $skFile->store('dokumen_usulan', 'public');
                $dokumenSk = DokumenPendukung::create([
                    'akun_id' => $user?->id,
                    'nama_file' => $skFile->getClientOriginalName(),
                    'file_path' => $path,
                    'jenis' => 'SK',
                    'jenis_dokumen' => 'SK Jabatan',
                    'ukuran_kb' => (int) ceil($skFile->getSize() / 1024),
                    'diunggah_at' => now(),
                ]);
                $dokumenSkId = $dokumenSk->id;
            } elseif ($request->filled('sk')) {
                $skNama = trim((string) $request->input('sk'));
                $dokumenSk = DokumenPendukung::create([
                    'akun_id' => $user?->id,
                    'nama_file' => $skNama,
                    'file_path' => 'dokumen_usulan/' . $skNama,
                    'jenis' => 'SK',
                    'jenis_dokumen' => 'SK Jabatan',
                    'ukuran_kb' => 1200,
                    'diunggah_at' => now(),
                ]);
                $dokumenSkId = $dokumenSk->id;
            }

            // Simpan dokumen SPMT
            $dokumenSpmtId = null;
            $spmtFile = $request->file('dokumen_spmt') ?? $request->file('file_spmt');
            if ($spmtFile) {
                $path = $spmtFile->store('dokumen_usulan', 'public');
                $dokumenSpmt = DokumenPendukung::create([
                    'akun_id' => $user?->id,
                    'nama_file' => $spmtFile->getClientOriginalName(),
                    'file_path' => $path,
                    'jenis' => 'SPMT',
                    'jenis_dokumen' => 'SPMT',
                    'ukuran_kb' => (int) ceil($spmtFile->getSize() / 1024),
                    'diunggah_at' => now(),
                ]);
                $dokumenSpmtId = $dokumenSpmt->id;
            } elseif ($request->filled('spmt')) {
                $spmtNama = trim((string) $request->input('spmt'));
                $dokumenSpmt = DokumenPendukung::create([
                    'akun_id' => $user?->id,
                    'nama_file' => $spmtNama,
                    'file_path' => 'dokumen_usulan/' . $spmtNama,
                    'jenis' => 'SPMT',
                    'jenis_dokumen' => 'SPMT',
                    'ukuran_kb' => 832,
                    'diunggah_at' => now(),
                ]);
                $dokumenSpmtId = $dokumenSpmt->id;
            }

            $tahun = now()->year;
            $lastUsulan = UsulanJabatan::whereYear('created_at', $tahun)->orderByDesc('nomor_urutan')->first();
            $nomorUrutan = $lastUsulan ? (max((int) $lastUsulan->nomor_urutan, 39) + 1) : 40;

            $pelakuNama = $user?->pegawai?->nama ?? 'Bidang Kepegawaian';
            $jejakAwal = [
                [
                    'label' => 'Diajukan',
                    'waktu' => now()->translatedFormat('d F Y \p\u\k\u\l H.i'),
                    'oleh' => "{$pelakuNama} (Bidang Kepegawaian)",
                ],
            ];

            // FR-04: Usulan tersimpan dengan status 'diajukan' menunggu pemeriksaan Verifikator (bukan langsung riwayat resmi)
            $usulan = UsulanJabatan::create([
                'dokumen_id' => $dokumenSkId,
                'dokumen_spmt_id' => $dokumenSpmtId,
                'akun_id' => $user?->id,
                'NIP' => $validated['NIP'],
                'unit_id' => $pegawai->unit_id,
                'jabatan_lama_id' => $usulanResmiTerakhir?->jabatan_id,
                'jabatan_id' => $validated['jabatan_id'],
                'nomor_urutan' => $nomorUrutan,
                'tanggal_berlaku' => $validated['tanggal_berlaku'],
                'alasan' => $validated['alasan'] ?? 'Pengajuan perubahan jabatan/grade berdasarkan SK dan SPMT.',
                'status' => 'diajukan',
                'jenis_perubahan' => $validated['jenis_perubahan'],
                'jejak' => $jejakAwal,
                'diajukan_at' => now(),
            ]);

            $usulan->load(['pegawai', 'jabatan.grade', 'jabatanLama.grade', 'unitKerja', 'dokumen', 'dokumenSpmt']);

            AuditLog::create([
                'NIP' => $user?->NIP,
                'unit_id' => $pegawai->unit_id,
                'aksi' => 'Ajukan Perubahan Jabatan/Grade',
                'objek_type' => 'UsulanJabatan',
                'objek_id' => $usulan->id,
                'nilai_sebelum' => [
                    'jabatan' => $usulan->jabatanLama?->nama_jabatan ?? 'Belum ada',
                    'grade' => $usulan->jabatanLama?->grade?->kode_grade ?? '-',
                ],
                'nilai_sesudah' => [
                    'NIP' => $usulan->NIP,
                    'jabatan_baru' => $usulan->jabatan?->nama_jabatan,
                    'grade_baru' => $usulan->jabatan?->grade?->kode_grade,
                    'tanggal_berlaku' => $validated['tanggal_berlaku'],
                    'status' => 'diajukan',
                ],
                'alasan' => $usulan->alasan,
                'dicatat_at' => now(),
            ]);

            return response()->json([
                'message' => 'Usulan perubahan jabatan/grade berhasil diajukan dan menunggu pemeriksaan Verifikator.',
                'usulan' => $this->formatUsulan($usulan),
            ], 201);
        });

        return $response;
    }

    /**
     * FR-04 & FR-05 (L5 & L6): Perbaiki dan ajukan ulang usulan jabatan (hanya jika status diajukan atau dikembalikan)
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $roleUnit = $this->getKepegawaianRoleUnit($request);
        $unitId = $roleUnit?->unit_id ?? $user?->pegawai?->unit_id;

        $usulan = $this->resolveUsulan($id);

        if ($unitId && $usulan->unit_id !== $unitId) {
            return response()->json([
                'message' => 'Akses ditolak: Usulan ini bukan berasal dari unit kerja Anda.',
            ], 403);
        }

        if (!in_array(strtolower($usulan->status), ['diajukan', 'dikembalikan', 'ditolak'], true)) {
            return response()->json([
                'message' => 'Usulan dengan status ' . $usulan->status . ' tidak dapat diubah atau diajukan ulang.',
            ], 422);
        }

        foreach (['dokumen_sk', 'dokumen_spmt', 'file_sk', 'file_spmt'] as $fileField) {
            if ($errResponse = $this->validatePdfUpload($request, $fileField)) {
                return $errResponse;
            }
        }

        $tanggalBerlaku = $request->input('tanggal_berlaku') ?? $request->input('mulaiIso') ?? $request->input('mulai');
        if ($tanggalBerlaku) {
            $request->merge(['tanggal_berlaku' => $tanggalBerlaku]);
        }

        $validated = $request->validate([
            'jabatan_id' => ['sometimes', 'exists:jabatan,id'],
            'jenis_perubahan' => ['sometimes', 'in:promosi,mutasi,kenaikan_grade,penyesuaian'],
            'tanggal_berlaku' => ['nullable', 'date'],
            'alasan' => ['nullable', 'string', 'max:2000'],
            'catatan' => ['nullable', 'string', 'max:1000'],
            'dokumen_sk' => ['nullable', 'file', 'mimes:pdf', 'max:5120'],
            'dokumen_spmt' => ['nullable', 'file', 'mimes:pdf', 'max:5120'],
        ]);

        /** @var JsonResponse $response */
        $response = DB::transaction(function () use ($validated, $usulan, $user, $request): JsonResponse {
            $statusLama = $usulan->status;

            $skFile = $request->file('dokumen_sk') ?? $request->file('file_sk');
            if ($skFile) {
                $path = $skFile->store('dokumen_usulan', 'public');
                $dokumen = DokumenPendukung::create([
                    'akun_id' => $user?->id,
                    'nama_file' => $skFile->getClientOriginalName(),
                    'file_path' => $path,
                    'jenis' => 'SK',
                    'jenis_dokumen' => 'SK Jabatan',
                    'ukuran_kb' => (int) ceil($skFile->getSize() / 1024),
                    'diunggah_at' => now(),
                ]);
                $usulan->dokumen_id = $dokumen->id;
            }

            $spmtFile = $request->file('dokumen_spmt') ?? $request->file('file_spmt');
            if ($spmtFile) {
                $path = $spmtFile->store('dokumen_usulan', 'public');
                $dokumenSpmt = DokumenPendukung::create([
                    'akun_id' => $user?->id,
                    'nama_file' => $spmtFile->getClientOriginalName(),
                    'file_path' => $path,
                    'jenis' => 'SPMT',
                    'jenis_dokumen' => 'SPMT',
                    'ukuran_kb' => (int) ceil($spmtFile->getSize() / 1024),
                    'diunggah_at' => now(),
                ]);
                $usulan->dokumen_spmt_id = $dokumenSpmt->id;
            }

            if (isset($validated['jabatan_id'])) {
                $usulan->jabatan_id = $validated['jabatan_id'];
            }
            if (isset($validated['jenis_perubahan'])) {
                $usulan->jenis_perubahan = $validated['jenis_perubahan'];
            }
            if (!empty($validated['tanggal_berlaku'])) {
                $usulan->tanggal_berlaku = $validated['tanggal_berlaku'];
            }
            if (array_key_exists('alasan', $validated) && $validated['alasan'] !== null) {
                $usulan->alasan = $validated['alasan'];
            }

            $pelakuNama = $user?->pegawai?->nama ?? 'Bidang Kepegawaian';
            $jejak = is_array($usulan->jejak) ? $usulan->jejak : [];
            $catatanPerbaikan = $validated['catatan'] ?? $request->input('catatan_perbaikan');

            if (in_array(strtolower($statusLama), ['dikembalikan', 'ditolak'], true)) {
                $usulan->status = 'diajukan';
                $usulan->catatan_verifikator = null;
                $usulan->catatan_perbaikan = $catatanPerbaikan;
                $jejak[] = [
                    'label' => 'Diajukan ulang',
                    'waktu' => now()->translatedFormat('d F Y \p\u\k\u\l H.i'),
                    'oleh' => "{$pelakuNama} (Bidang Kepegawaian)",
                    'catatan' => $catatanPerbaikan ?: 'Perbaikan usulan telah diajukan ulang ke Verifikator.',
                ];
            } else {
                $jejak[] = [
                    'label' => 'Diperbarui',
                    'waktu' => now()->translatedFormat('d F Y \p\u\k\u\l H.i'),
                    'oleh' => "{$pelakuNama} (Bidang Kepegawaian)",
                    'catatan' => $catatanPerbaikan,
                ];
            }

            $usulan->jejak = $jejak;
            $usulan->save();

            AuditLog::create([
                'NIP' => $user?->NIP,
                'unit_id' => $usulan->unit_id,
                'aksi' => in_array(strtolower($statusLama), ['dikembalikan', 'ditolak'], true)
                    ? 'Ajukan Ulang Usulan Jabatan'
                    : 'Ubah Usulan Jabatan',
                'objek_type' => 'UsulanJabatan',
                'objek_id' => $usulan->id,
                'nilai_sebelum' => ['status' => $statusLama],
                'nilai_sesudah' => [
                    'status' => $usulan->status,
                    'tanggal_berlaku' => $usulan->tanggal_berlaku?->format('Y-m-d'),
                    'catatan_perbaikan' => $catatanPerbaikan,
                ],
                'alasan' => $catatanPerbaikan ?? 'Perbaikan dan pengajuan ulang usulan perubahan jabatan/grade',
                'dicatat_at' => now(),
            ]);

            $usulan->load(['pegawai', 'jabatan.grade', 'jabatanLama.grade', 'unitKerja', 'dokumen', 'dokumenSpmt']);

            return response()->json([
                'message' => 'Usulan jabatan berhasil diperbarui dan diajukan ke Verifikator.',
                'usulan' => $this->formatUsulan($usulan),
            ]);
        });

        return $response;
    }

    /**
     * FR-05 & NFR-11 (L6): Unggah dokumen pendukung SK atau SPMT (PDF maks. 5 MB) pada usulan jabatan
     */
    public function uploadDokumen(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $roleUnit = $this->getKepegawaianRoleUnit($request);
        $unitId = $roleUnit?->unit_id ?? $user?->pegawai?->unit_id;

        $usulan = $this->resolveUsulan($id);

        if ($unitId && $usulan->unit_id !== $unitId) {
            return response()->json([
                'message' => 'Akses ditolak: Usulan ini bukan berasal dari unit kerja Anda.',
            ], 403);
        }

        // Cek file yang dikirim (bisa 'file', 'dokumen_sk', atau 'dokumen_spmt')
        $fileKey = $request->hasFile('file') ? 'file' : ($request->hasFile('dokumen_spmt') ? 'dokumen_spmt' : 'dokumen_sk');
        if (!$request->hasFile($fileKey)) {
            return response()->json([
                'message' => 'Berkas dokumen wajib diunggah.',
                'errors' => ['file' => ['Berkas dokumen PDF wajib diunggah.']],
            ], 422);
        }

        if ($errResponse = $this->validatePdfUpload($request, $fileKey)) {
            return $errResponse;
        }

        $file = $request->file($fileKey);
        $jenisInput = strtoupper($request->input('jenis', $fileKey === 'dokumen_spmt' ? 'SPMT' : 'SK'));
        $path = $file->store('dokumen_usulan', 'public');

        $dokumen = DokumenPendukung::create([
            'akun_id' => $user?->id,
            'nomor_dokumen' => $request->input('nomor_dokumen'),
            'tanggal_dokumen' => $request->input('tanggal_dokumen'),
            'nama_file' => $file->getClientOriginalName(),
            'file_path' => $path,
            'jenis' => $jenisInput,
            'jenis_dokumen' => $jenisInput === 'SPMT' ? 'SPMT' : 'SK Jabatan',
            'ukuran_kb' => (int) ceil($file->getSize() / 1024),
            'diunggah_at' => now(),
        ]);

        if ($jenisInput === 'SPMT') {
            $usulan->dokumen_spmt_id = $dokumen->id;
        } else {
            $usulan->dokumen_id = $dokumen->id;
        }
        $usulan->save();

        AuditLog::create([
            'NIP' => $user?->NIP,
            'unit_id' => $usulan->unit_id,
            'aksi' => "Unggah Dokumen {$jenisInput}",
            'objek_type' => 'DokumenPendukung',
            'objek_id' => $dokumen->id,
            'nilai_sebelum' => null,
            'nilai_sesudah' => [
                'usulan_id' => $usulan->id,
                'jenis' => $jenisInput,
                'nama_file' => $dokumen->nama_file,
                'ukuran_kb' => $dokumen->ukuran_kb,
            ],
            'alasan' => "Unggah dokumen pendukung {$jenisInput} untuk usulan jabatan #{$usulan->id}",
            'dicatat_at' => now(),
        ]);

        return response()->json([
            'message' => "Dokumen {$jenisInput} ({$dokumen->nama_file}) berhasil diunggah.",
            'dokumen' => [
                'id' => $dokumen->id,
                'jenis' => $dokumen->jenis,
                'jenis_dokumen' => $dokumen->jenis_dokumen,
                'nama_file' => $dokumen->nama_file,
                'ukuran_kb' => $dokumen->ukuran_kb,
                'file_path' => $dokumen->file_path,
                'url' => url("/api/kepegawaian/dokumen/{$dokumen->id}"),
            ],
        ], 201);
    }

    /**
     * FR-05 (L6): Lihat atau unduh kembali dokumen pendukung SK/SPMT (PDF)
     */
    public function downloadDokumen(Request $request, int $dokumenId)
    {
        $dokumen = DokumenPendukung::findOrFail($dokumenId);

        if ($dokumen->file_path && Storage::disk('public')->exists($dokumen->file_path)) {
            return Storage::disk('public')->download(
                $dokumen->file_path,
                $dokumen->nama_file ?: basename($dokumen->file_path),
                ['Content-Type' => 'application/pdf']
            );
        }

        // Jika dokumen berasal dari seeder (belum ada file fisik di disk), buat PDF valid on-the-fly
        $namaFile = $dokumen->nama_file ?: "Dokumen_{$dokumen->id}.pdf";
        $judul = $dokumen->jenis_dokumen ?? $dokumen->jenis ?? 'SK / SPMT Jabatan';
        $pdfContent = "%PDF-1.4\n1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n"
            . "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n"
            . "3 0 obj << /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >> endobj\n"
            . "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n"
            . "5 0 obj << /Length 120 >> stream\nBT /F1 14 Tf 72 720 Td (UNIVERSITAS ANDALAS - DOKUMEN PENDUKUNG: {$judul}) Tj 0 -24 Td ({$namaFile}) Tj ET\nendstream\nendobj\n"
            . "xref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000229 00000 n \n0000000297 00000 n \n"
            . "trailer << /Size 6 /Root 1 0 R >>\nstartxref\n469\n%%EOF";

        return response($pdfContent, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="' . $namaFile . '"',
        ]);
    }

    /**
     * Hapus usulan (hanya jika status masih diajukan atau dikembalikan)
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $roleUnit = $this->getKepegawaianRoleUnit($request);
        $unitId = $roleUnit?->unit_id ?? $user?->pegawai?->unit_id;

        $usulan = $this->resolveUsulan($id);

        if ($unitId && $usulan->unit_id !== $unitId) {
            return response()->json([
                'message' => 'Akses ditolak: Usulan ini bukan berasal dari unit kerja Anda.',
            ], 403);
        }

        if (!in_array(strtolower($usulan->status), ['diajukan', 'dikembalikan', 'ditolak'], true)) {
            return response()->json([
                'message' => 'Usulan dengan status ' . $usulan->status . ' tidak dapat dihapus.',
            ], 422);
        }

        /** @var JsonResponse $response */
        $response = DB::transaction(function () use ($usulan): JsonResponse {
            foreach ([$usulan->dokumen_id, $usulan->dokumen_spmt_id] as $dokId) {
                if ($dokId) {
                    $dokumen = DokumenPendukung::find($dokId);
                    if ($dokumen && $dokumen->file_path && Storage::disk('public')->exists($dokumen->file_path)) {
                        Storage::disk('public')->delete($dokumen->file_path);
                    }
                    $dokumen?->delete();
                }
            }

            $usulan->delete();

            return response()->json([
                'message' => 'Usulan jabatan berhasil dihapus.',
            ]);
        });

        return $response;
    }

    /**
     * FR-04 & FR-30: Daftar master jabatan dan grade yang dikelola UPT Remunerasi
     */
    public function listJabatan(Request $request): JsonResponse
    {
        $jabatanList = Jabatan::with('grade')
            ->orderBy('nama_jabatan')
            ->get()
            ->map(function ($j) {
                $kodeGrade = $j->grade?->kode_grade ?? '-';
                $gradeNum = (int) preg_replace('/\D/', '', $kodeGrade);
                return [
                    'id' => $j->id,
                    'nama_jabatan' => $j->nama_jabatan,
                    'kode_grade' => $kodeGrade,
                    'grade' => $gradeNum ?: $kodeGrade,
                    'nilai_grade' => (float) ($j->grade?->nilai ?? 0),
                ];
            });

        $gradeList = Grade::orderBy('id')->get()->map(function ($g) {
            $gradeNum = (int) preg_replace('/\D/', '', $g->kode_grade);
            return [
                'id' => $g->id,
                'kode_grade' => $g->kode_grade,
                'grade' => $gradeNum ?: $g->kode_grade,
                'nilai' => (float) $g->nilai,
            ];
        });

        return response()->json([
            'data' => $jabatanList,
            'grades' => $gradeList,
        ]);
    }
}
