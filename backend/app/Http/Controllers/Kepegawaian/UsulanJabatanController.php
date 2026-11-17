<?php

namespace App\Http\Controllers\Kepegawaian;

use App\Http\Controllers\Controller;
use App\Models\DokumenPendukung;
use App\Models\Jabatan;
use App\Models\Pegawai;
use App\Models\RoleUnit;
use App\Models\UsulanJabatan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class UsulanJabatanController extends Controller
{
    /**
     * Dapatkan dashboard stats untuk beranda kepegawaian
     */
    public function dashboard(Request $request): JsonResponse
    {
        $user = $request->user();

        // Cari unit kerja pengguna untuk peran kepegawaian
        $roleUnit = RoleUnit::where('role_id', $user->id)
            ->where('peran', 'kepegawaian')
            ->where('aktif', true)
            ->first();

        $unitId = $roleUnit?->unit_id;
        $unitNama = $roleUnit?->unitKerja?->nama ?? 'Semua Unit Kerja';

        // Statistik pegawai
        $pegawaiQuery = Pegawai::query();
        if ($unitId) {
            $pegawaiQuery->where('unit_id', $unitId);
        }
        $totalPegawai = $pegawaiQuery->count();
        $pegawaiAktif = (clone $pegawaiQuery)->where('aktif', true)->count();

        // Statistik usulan jabatan
        $usulanQuery = UsulanJabatan::query();
        if ($unitId) {
            $usulanQuery->where('unit_id', $unitId);
        }

        $usulanMenunggu = (clone $usulanQuery)->where('status', 'diajukan')->count();
        $usulanDikembalikan = (clone $usulanQuery)->where('status', 'dikembalikan')->count();
        $usulanDisetujui = (clone $usulanQuery)->where('status', 'disetujui_verifikator')->count();
        $usulanDitetapkan = (clone $usulanQuery)->where('status', 'ditetapkan')->count();

        // Pengaduan (mock - bisa disesuaikan)
        $pengaduanMenunggu = 0;

        // Hukuman disiplin aktif (mock - bisa disesuaikan)
        $hukumanAktif = 0;

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
        ]);
    }

    /**
     * Dapatkan daftar usulan jabatan (dengan filter & search)
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // Cari unit kerja pengguna untuk peran kepegawaian
        $roleUnit = RoleUnit::where('role_id', $user->id)
            ->where('peran', 'kepegawaian')
            ->where('aktif', true)
            ->first();

        $query = UsulanJabatan::with(['pegawai', 'jabatan.grade', 'unitKerja', 'dokumen']);

        // Isolasi unit kerja
        if ($roleUnit && $roleUnit->unit_id) {
            $query->where('unit_id', $roleUnit->unit_id);
        }

        // Filter status
        if ($request->filled('status')) {
            $status = $request->query('status');
            if ($status !== 'semua') {
                $query->where('status', $status);
            }
        }

        // Search
        if ($request->filled('q')) {
            $q = $request->query('q');
            $query->where(function ($sub) use ($q) {
                $sub->whereHas('pegawai', function ($pq) use ($q) {
                    $pq->where('nama', 'like', "%{$q}%")
                        ->orWhere('NIP', 'like', "%{$q}%");
                });
            });
        }

        // Filter jenis perubahan
        if ($request->filled('jenis')) {
            $jenis = $request->query('jenis');
            if ($jenis !== 'semua') {
                $query->where('jenis_perubahan', $jenis);
            }
        }

        $usulanList = $query->orderBy('diajukan_at', 'desc')->get()->map(function ($u) {
            $pegawai = $u->pegawai;
            $jabatanBaru = $u->jabatan;

            // Get jabatan lama dari usulan terakhir yang ditetapkan
            $usulanSebelumnya = UsulanJabatan::where('NIP', $u->NIP)
                ->where('status', 'ditetapkan')
                ->where('id', '<', $u->id)
                ->orderBy('id', 'desc')
                ->first();

            $jabatanLama = $usulanSebelumnya?->jabatan;

            return [
                'id' => $u->id,
                'nomor_urutan' => $u->nomor_urutan,
                'NIP' => $u->NIP,
                'nama_pegawai' => $pegawai?->nama ?? '-',
                'jenis_pegawai' => $pegawai?->jenis ?? '-',
                'unit_nama' => $u->unitKerja?->nama ?? '-',
                'jabatan_lama' => [
                    'nama' => $jabatanLama?->nama_jabatan ?? 'Belum ada',
                    'grade' => $jabatanLama?->grade?->kode_grade ?? '-',
                ],
                'jabatan_baru' => [
                    'nama' => $jabatanBaru?->nama_jabatan ?? '-',
                    'grade' => $jabatanBaru?->grade?->kode_grade ?? '-',
                ],
                'jenis_perubahan' => $u->jenis_perubahan,
                'tanggal_berlaku' => $u->tanggal_berlaku?->format('Y-m-d'),
                'status' => $u->status,
                'catatan_verifikator' => $u->catatan_verifikator,
                'diajukan_at' => $u->diajukan_at?->format('Y-m-d H:i:s'),
                'dokumen' => $u->dokumen ? [
                    'id' => $u->dokumen->id,
                    'jenis_dokumen' => $u->dokumen->jenis_dokumen,
                    'nama_file' => $u->dokumen->nama_file,
                ] : null,
            ];
        });

        return response()->json([
            'unit_kerja' => $roleUnit?->unitKerja?->nama ?? 'Semua Unit Kerja',
            'total' => $usulanList->count(),
            'data' => $usulanList,
        ]);
    }

    /**
     * Tampilkan detail usulan jabatan
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $roleUnit = RoleUnit::where('role_id', $user->id)
            ->where('peran', 'kepegawaian')
            ->where('aktif', true)
            ->first();

        $usulan = UsulanJabatan::with(['pegawai', 'jabatan.grade', 'unitKerja', 'dokumen'])
            ->findOrFail($id);

        // Validasi isolasi unit kerja
        if ($roleUnit && $roleUnit->unit_id && $usulan->unit_id !== $roleUnit->unit_id) {
            return response()->json([
                'message' => 'Akses ditolak: Usulan ini bukan berasal dari unit kerja Anda.',
            ], 403);
        }

        $pegawai = $usulan->pegawai;
        $jabatanBaru = $usulan->jabatan;

        // Get jabatan lama
        $usulanSebelumnya = UsulanJabatan::where('NIP', $usulan->NIP)
            ->where('status', 'ditetapkan')
            ->where('id', '<', $usulan->id)
            ->orderBy('id', 'desc')
            ->first();

        $jabatanLama = $usulanSebelumnya?->jabatan;

        return response()->json([
            'id' => $usulan->id,
            'nomor_urutan' => $usulan->nomor_urutan,
            'NIP' => $usulan->NIP,
            'pegawai' => [
                'NIP' => $pegawai?->NIP,
                'nama' => $pegawai?->nama ?? '-',
                'jenis' => $pegawai?->jenis ?? '-',
                'status_kepegawaian' => $pegawai?->status_kepegawaian ?? '-',
                'pangkat_golongan' => $pegawai?->pangkat_golongan ?? '-',
                'email' => $pegawai?->email ?? '-',
            ],
            'unit_nama' => $usulan->unitKerja?->nama ?? '-',
            'jabatan_lama' => [
                'id' => $jabatanLama?->id,
                'nama' => $jabatanLama?->nama_jabatan ?? 'Belum ada',
                'grade' => $jabatanLama?->grade?->kode_grade ?? '-',
                'nilai' => $jabatanLama?->grade?->nilai ?? 0,
            ],
            'jabatan_baru' => [
                'id' => $jabatanBaru?->id,
                'nama' => $jabatanBaru?->nama_jabatan ?? '-',
                'grade' => $jabatanBaru?->grade?->kode_grade ?? '-',
                'nilai' => $jabatanBaru?->grade?->nilai ?? 0,
            ],
            'jenis_perubahan' => $usulan->jenis_perubahan,
            'tanggal_berlaku' => $usulan->tanggal_berlaku?->format('Y-m-d'),
            'status' => $usulan->status,
            'catatan_verifikator' => $usulan->catatan_verifikator,
            'diajukan_at' => $usulan->diajukan_at?->format('Y-m-d H:i:s'),
            'dokumen' => $usulan->dokumen ? [
                'id' => $usulan->dokumen->id,
                'jenis_dokumen' => $usulan->dokumen->jenis_dokumen,
                'nama_file' => $usulan->dokumen->nama_file,
                'file_path' => $usulan->dokumen->file_path,
            ] : null,
        ]);
    }

    /**
     * Buat usulan jabatan baru
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $roleUnit = RoleUnit::where('role_id', $user->id)
            ->where('peran', 'kepegawaian')
            ->where('aktif', true)
            ->first();

        $validated = $request->validate([
            'NIP' => 'required|string|exists:pegawai,NIP',
            'jabatan_id' => 'required|exists:jabatan,id',
            'jenis_perubahan' => 'required|in:promosi,mutasi,kenaikan_grade,penyesuaian',
            'tanggal_berlaku' => 'required|date',
            'dokumen_sk' => 'nullable|file|mimes:pdf|max:5120',
            'dokumen_spmt' => 'nullable|file|mimes:pdf|max:5120',
        ]);

        $pegawai = Pegawai::where('NIP', $validated['NIP'])->firstOrFail();

        // Validasi isolasi unit kerja
        if ($roleUnit && $roleUnit->unit_id && $pegawai->unit_id !== $roleUnit->unit_id) {
            return response()->json([
                'message' => 'Akses ditolak: Pegawai ini bukan berasal dari unit kerja Anda.',
            ], 403);
        }

        return DB::transaction(function () use ($validated, $pegawai, $user, $request) {
            // Upload dokumen jika ada
            $dokumenId = null;
            if ($request->hasFile('dokumen_sk') || $request->hasFile('dokumen_spmt')) {
                $dokumen = new DokumenPendukung();
                $dokumen->jenis_dokumen = 'SK Jabatan';

                if ($request->hasFile('dokumen_sk')) {
                    $file = $request->file('dokumen_sk');
                    $path = $file->store('dokumen_usulan', 'public');
                    $dokumen->file_path = $path;
                    $dokumen->nama_file = $file->getClientOriginalName();
                }

                $dokumen->save();
                $dokumenId = $dokumen->id;
            }

            // Generate nomor urutan (simple increment per tahun)
            $tahun = now()->year;
            $lastUsulan = UsulanJabatan::whereYear('created_at', $tahun)->orderBy('nomor_urutan', 'desc')->first();
            $nomorUrutan = $lastUsulan ? ($lastUsulan->nomor_urutan + 1) : 1;

            // Buat usulan
            $usulan = UsulanJabatan::create([
                'dokumen_id' => $dokumenId,
                'akun_id' => $user->id,
                'NIP' => $validated['NIP'],
                'unit_id' => $pegawai->unit_id,
                'jabatan_id' => $validated['jabatan_id'],
                'nomor_urutan' => $nomorUrutan,
                'tanggal_berlaku' => $validated['tanggal_berlaku'],
                'status' => 'diajukan',
                'jenis_perubahan' => $validated['jenis_perubahan'],
                'diajukan_at' => now(),
            ]);

            return response()->json([
                'message' => 'Usulan jabatan berhasil dibuat dan menunggu verifikasi.',
                'usulan' => [
                    'id' => $usulan->id,
                    'nomor_urutan' => $usulan->nomor_urutan,
                    'status' => $usulan->status,
                ],
            ], 201);
        });
    }

    /**
     * Update usulan jabatan (hanya jika status masih diajukan atau dikembalikan)
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $roleUnit = RoleUnit::where('role_id', $user->id)
            ->where('peran', 'kepegawaian')
            ->where('aktif', true)
            ->first();

        $usulan = UsulanJabatan::findOrFail($id);

        // Validasi isolasi unit kerja
        if ($roleUnit && $roleUnit->unit_id && $usulan->unit_id !== $roleUnit->unit_id) {
            return response()->json([
                'message' => 'Akses ditolak: Usulan ini bukan berasal dari unit kerja Anda.',
            ], 403);
        }

        // Hanya bisa edit jika status masih diajukan atau dikembalikan
        if (!in_array($usulan->status, ['diajukan', 'dikembalikan'])) {
            return response()->json([
                'message' => 'Usulan dengan status ' . $usulan->status . ' tidak dapat diubah.',
            ], 422);
        }

        $validated = $request->validate([
            'jabatan_id' => 'sometimes|exists:jabatan,id',
            'jenis_perubahan' => 'sometimes|in:promosi,mutasi,kenaikan_grade,penyesuaian',
            'tanggal_berlaku' => 'sometimes|date',
            'dokumen_sk' => 'nullable|file|mimes:pdf|max:5120',
        ]);

        return DB::transaction(function () use ($validated, $usulan, $request) {
            // Upload dokumen baru jika ada
            if ($request->hasFile('dokumen_sk')) {
                // Hapus dokumen lama jika ada
                if ($usulan->dokumen_id) {
                    $dokumenLama = DokumenPendukung::find($usulan->dokumen_id);
                    if ($dokumenLama && $dokumenLama->file_path) {
                        Storage::disk('public')->delete($dokumenLama->file_path);
                    }
                    $dokumenLama?->delete();
                }

                $file = $request->file('dokumen_sk');
                $path = $file->store('dokumen_usulan', 'public');

                $dokumen = DokumenPendukung::create([
                    'jenis_dokumen' => 'SK Jabatan',
                    'file_path' => $path,
                    'nama_file' => $file->getClientOriginalName(),
                ]);

                $usulan->dokumen_id = $dokumen->id;
            }

            // Update fields lainnya
            if (isset($validated['jabatan_id'])) {
                $usulan->jabatan_id = $validated['jabatan_id'];
            }
            if (isset($validated['jenis_perubahan'])) {
                $usulan->jenis_perubahan = $validated['jenis_perubahan'];
            }
            if (isset($validated['tanggal_berlaku'])) {
                $usulan->tanggal_berlaku = $validated['tanggal_berlaku'];
            }

            // Jika status dikembalikan, ubah kembali ke diajukan
            if ($usulan->status === 'dikembalikan') {
                $usulan->status = 'diajukan';
                $usulan->catatan_verifikator = null;
            }

            $usulan->save();

            return response()->json([
                'message' => 'Usulan jabatan berhasil diperbarui.',
                'usulan' => [
                    'id' => $usulan->id,
                    'status' => $usulan->status,
                ],
            ]);
        });
    }

    /**
     * Hapus usulan (hanya jika status masih diajukan atau dikembalikan)
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $roleUnit = RoleUnit::where('role_id', $user->id)
            ->where('peran', 'kepegawaian')
            ->where('aktif', true)
            ->first();

        $usulan = UsulanJabatan::findOrFail($id);

        // Validasi isolasi unit kerja
        if ($roleUnit && $roleUnit->unit_id && $usulan->unit_id !== $roleUnit->unit_id) {
            return response()->json([
                'message' => 'Akses ditolak: Usulan ini bukan berasal dari unit kerja Anda.',
            ], 403);
        }

        // Hanya bisa hapus jika status masih diajukan atau dikembalikan
        if (!in_array($usulan->status, ['diajukan', 'dikembalikan'])) {
            return response()->json([
                'message' => 'Usulan dengan status ' . $usulan->status . ' tidak dapat dihapus.',
            ], 422);
        }

        return DB::transaction(function () use ($usulan) {
            // Hapus dokumen jika ada
            if ($usulan->dokumen_id) {
                $dokumen = DokumenPendukung::find($usulan->dokumen_id);
                if ($dokumen && $dokumen->file_path) {
                    Storage::disk('public')->delete($dokumen->file_path);
                }
                $dokumen?->delete();
            }

            $usulan->delete();

            return response()->json([
                'message' => 'Usulan jabatan berhasil dihapus.',
            ]);
        });
    }

    /**
     * Dapatkan daftar jabatan untuk dropdown
     */
    public function listJabatan(Request $request): JsonResponse
    {
        $jabatanList = Jabatan::with('grade')
            ->orderBy('nama_jabatan')
            ->get()
            ->map(function ($j) {
                return [
                    'id' => $j->id,
                    'nama_jabatan' => $j->nama_jabatan,
                    'kode_grade' => $j->grade?->kode_grade ?? '-',
                    'nilai_grade' => $j->grade?->nilai ?? 0,
                ];
            });

        return response()->json([
            'data' => $jabatanList,
        ]);
    }
}
