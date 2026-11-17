<?php

namespace App\Http\Controllers\UptRemunerasi;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\HasilPerhitungan;
use App\Models\Pegawai;
use App\Models\UsulanJabatan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class PenetapanJabatanController extends Controller
{
    protected function authorizeUpt(Request $request): void
    {
        $user = $request->user();
        if (!$user || !$user->hasRole('upt_remunerasi')) {
            abort(403, 'Akses ditolak: Anda tidak memiliki wewenang sebagai UPT Remunerasi.');
        }
    }

    /**
     * Daftar seluruh usulan jabatan dan grade pegawai se-universitas
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorizeUpt($request);

        $query = UsulanJabatan::with(['pegawai.unitKerja', 'jabatan.grade', 'unitKerja']);

        // Filter status usulan (terverifikasi, ditetapkan, ditolak, dll)
        if ($request->filled('status') && $request->query('status') !== 'semua') {
            $status = $request->query('status');
            if ($status === 'menunggu') {
                $query->whereIn('status', ['diajukan', 'diverifikasi', 'terverifikasi']);
            } else {
                $query->where('status', $status);
            }
        }

        // Filter unit kerja
        if ($request->filled('unit_id') && $request->query('unit_id') !== 'semua') {
            $query->where('unit_id', $request->query('unit_id'));
        }

        // Filter pencarian nama / NIP
        if ($request->filled('q')) {
            $q = $request->query('q');
            $query->whereHas('pegawai', function ($sub) use ($q) {
                $sub->where('nama', 'like', "%{$q}%")
                    ->orWhere('NIP', 'like', "%{$q}%");
            });
        }

        $list = $query->latest('id')->get()->map(function ($u) {
            return [
                'id' => (string) $u->id,
                'nip' => $u->NIP,
                'nama' => $u->pegawai?->nama ?? $u->NIP,
                'unit' => $u->unitKerja?->nama ?? ($u->pegawai?->unitKerja?->nama ?? '-'),
                'unit_id' => $u->unit_id,
                'jenis_perubahan' => $u->jenis_perubahan ?? 'Kenaikan Jabatan',
                'jabatan_baru' => $u->jabatan?->nama_jabatan ?? 'Jabatan Baru',
                'grade_baru' => $u->jabatan?->grade?->kode_grade ?? 'Grade 10',
                'nilai_grade' => (float) ($u->jabatan?->grade?->nilai ?? 5232000),
                'tanggal_berlaku' => $u->tanggal_berlaku?->format('Y-m-d'),
                'status' => $u->status,
                'catatan_verifikator' => $u->catatan_verifikator,
                'diajukan_pada' => $u->diajukan_at?->translatedFormat('d F Y') ?? $u->created_at?->translatedFormat('d F Y'),
            ];
        });

        return response()->json([
            'total' => $list->count(),
            'menunggu_penetapan' => $list->whereIn('status', ['diverifikasi', 'terverifikasi'])->count(),
            'ditetapkan' => $list->where('status', 'ditetapkan')->count(),
            'data' => $list,
        ]);
    }

    /**
     * Detail satu usulan jabatan
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $this->authorizeUpt($request);

        $usulan = UsulanJabatan::with(['pegawai.unitKerja', 'jabatan.grade', 'unitKerja', 'dokumen'])
            ->findOrFail($id);

        return response()->json([
            'usulan' => [
                'id' => $usulan->id,
                'nip' => $usulan->NIP,
                'nama' => $usulan->pegawai?->nama,
                'unit' => $usulan->unitKerja?->nama,
                'jenis_perubahan' => $usulan->jenis_perubahan,
                'jabatan' => $usulan->jabatan?->nama_jabatan,
                'grade' => $usulan->jabatan?->grade?->kode_grade,
                'nilai' => (float) ($usulan->jabatan?->grade?->nilai ?? 0),
                'tanggal_berlaku' => $usulan->tanggal_berlaku?->translatedFormat('d F Y'),
                'status' => $usulan->status,
                'catatan_verifikator' => $usulan->catatan_verifikator,
                'dokumen' => $usulan->dokumen ? [
                    'nama_file' => $usulan->dokumen->nama_file,
                    'file_path' => $usulan->dokumen->file_path,
                ] : null,
            ],
        ]);
    }

    /**
     * Penetapan resmi usulan jabatan/grade oleh UPT Remunerasi
     */
    public function tetapkan(Request $request, string $id): JsonResponse
    {
        $this->authorizeUpt($request);

        $validated = $request->validate([
            'sk_penetapan' => 'nullable|string|max:150',
            'catatan' => 'nullable|string|max:500',
        ]);

        return DB::transaction(function () use ($id, $validated, $request) {
            $usulan = UsulanJabatan::with(['jabatan.grade', 'pegawai'])->findOrFail($id);
            $user = $request->user();

            $statusSebelum = $usulan->status;
            $usulan->status = 'ditetapkan';
            $usulan->catatan_verifikator = $validated['catatan'] ?? 'Telah ditetapkan secara resmi oleh UPT Remunerasi.';
            $usulan->save();

            // Perbarui hasil perhitungan aktif jika ada
            if ($usulan->jabatan?->grade) {
                HasilPerhitungan::where('NIP', $usulan->NIP)
                    ->where('periode', '2026-10')
                    ->update([
                        'usulan_jabatan_id' => $usulan->id,
                        'nilai_jabatan' => $usulan->jabatan->grade->nilai,
                    ]);
            }

            // Catat jejak audit
            AuditLog::create([
                'NIP' => $user->NIP,
                'unit_id' => $usulan->unit_id,
                'aksi' => 'Penetapan Jabatan/Grade',
                'objek_type' => 'UsulanJabatan',
                'objek_id' => $usulan->id,
                'nilai_sebelum' => ['status' => $statusSebelum],
                'nilai_sesudah' => ['status' => 'ditetapkan', 'sk' => $validated['sk_penetapan'] ?? null],
                'alasan' => $validated['catatan'] ?? 'Penetapan resmi oleh UPT Remunerasi',
                'dicatat_at' => Carbon::now(),
            ]);

            return response()->json([
                'message' => 'Usulan jabatan dan grade pegawai berhasil ditetapkan.',
                'usulan' => [
                    'id' => $usulan->id,
                    'nip' => $usulan->NIP,
                    'nama' => $usulan->pegawai?->nama,
                    'status' => $usulan->status,
                    'jabatan' => $usulan->jabatan?->nama_jabatan,
                    'grade' => $usulan->jabatan?->grade?->kode_grade,
                ],
            ]);
        });
    }
}
