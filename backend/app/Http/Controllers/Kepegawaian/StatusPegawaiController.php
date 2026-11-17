<?php

namespace App\Http\Controllers\Kepegawaian;

use App\Http\Controllers\Controller;
use App\Models\Pegawai;
use App\Models\RoleUnit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StatusPegawaiController extends Controller
{
    /**
     * Dapatkan daftar pegawai pada unit kerja kepegawaian (Isolasi Unit Kerja)
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // Cari unit kerja pengguna untuk peran kepegawaian
        $roleUnit = RoleUnit::where('role_id', $user->id)
            ->where('peran', 'kepegawaian')
            ->where('aktif', true)
            ->first();

        $query = Pegawai::with('unitKerja');

        // Jika kepegawaian terikat pada unit tertentu, batasi hanya unit tersebut (Isolasi Ketat)
        if ($roleUnit && $roleUnit->unit_id) {
            $query->where('unit_id', $roleUnit->unit_id);
        }

        // Filter pencarian atau status jika ada
        if ($request->filled('q')) {
            $q = $request->query('q');
            $query->where(function ($sub) use ($q) {
                $sub->where('nama', 'like', "%{$q}%")
                    ->orWhere('NIP', 'like', "%{$q}%");
            });
        }

        if ($request->filled('status_tugas_belajar')) {
            $query->where('status_tugas_belajar', $request->query('status_tugas_belajar'));
        }

        $pegawaiList = $query->orderBy('nama')->get()->map(function ($p) {
            // Tentukan persentase hak P1 berdasarkan Peraturan Rektor No. 2 Tahun 2026
            $persenP1 = 100;
            if ($p->status_tugas_belajar === 'tugas_belajar') {
                $persenP1 = 60;
            } elseif (in_array($p->status_kepegawaian, ['CPNS', 'CPT-PTNBH'])) {
                $persenP1 = 80;
            }

            return [
                'NIP' => $p->NIP,
                'nama' => $p->nama,
                'jenis' => $p->jenis,
                'unit_id' => $p->unit_id,
                'unit_nama' => $p->unitKerja?->nama ?? '-',
                'status_kepegawaian' => $p->status_kepegawaian,
                'status_tugas_belajar' => $p->status_tugas_belajar ?? 'aktif',
                'persen_hak_p1' => $persenP1,
                'sk_tugas_belajar' => $p->sk_tugas_belajar,
                'tgl_mulai_tubel' => $p->tgl_mulai_tubel,
                'tgl_selesai_tubel' => $p->tgl_selesai_tubel,
                'pangkat_golongan' => $p->pangkat_golongan,
                'aktif' => $p->aktif,
            ];
        });

        return response()->json([
            'unit_kerja' => $roleUnit?->unitKerja?->nama ?? 'Semua Unit Kerja',
            'total' => $pegawaiList->count(),
            'data' => $pegawaiList,
        ]);
    }

    /**
     * Update status kepegawaian dari aktif menjadi tugas belajar atau sebaliknya
     */
    public function updateStatusTugasBelajar(Request $request, string $nip): JsonResponse
    {
        $validated = $request->validate([
            'status_tugas_belajar' => 'required|in:aktif,tugas_belajar',
            'sk_tugas_belajar' => 'nullable|string|max:100',
            'tgl_mulai_tubel' => 'nullable|date',
            'tgl_selesai_tubel' => 'nullable|date|after_or_equal:tgl_mulai_tubel',
        ]);

        $pegawai = Pegawai::where('NIP', $nip)->firstOrFail();

        // Validasi isolasi unit kerja
        $user = $request->user();
        $roleUnit = RoleUnit::where('role_id', $user->id)
            ->where('peran', 'kepegawaian')
            ->where('aktif', true)
            ->first();

        if ($roleUnit && $roleUnit->unit_id && $pegawai->unit_id !== $roleUnit->unit_id) {
            return response()->json([
                'message' => 'Akses ditolak: Pegawai ini bukan berasal dari unit kerja Anda.',
            ], 403);
        }

        // Terapkan perubahan status
        $pegawai->status_tugas_belajar = $validated['status_tugas_belajar'];
        if ($validated['status_tugas_belajar'] === 'tugas_belajar') {
            $pegawai->sk_tugas_belajar = $validated['sk_tugas_belajar'] ?? $pegawai->sk_tugas_belajar;
            $pegawai->tgl_mulai_tubel = $validated['tgl_mulai_tubel'] ?? $pegawai->tgl_mulai_tubel;
            $pegawai->tgl_selesai_tubel = $validated['tgl_selesai_tubel'] ?? $pegawai->tgl_selesai_tubel;
        } else {
            // Kembali aktif
            $pegawai->sk_tugas_belajar = null;
            $pegawai->tgl_mulai_tubel = null;
            $pegawai->tgl_selesai_tubel = null;
        }

        $pegawai->save();

        $persenHak = ($pegawai->status_tugas_belajar === 'tugas_belajar') ? 60 : 100;

        return response()->json([
            'message' => 'Status tugas belajar pegawai berhasil diperbarui.',
            'pegawai' => [
                'NIP' => $pegawai->NIP,
                'nama' => $pegawai->nama,
                'status_tugas_belajar' => $pegawai->status_tugas_belajar,
                'persen_hak_p1' => $persenHak,
                'sk_tugas_belajar' => $pegawai->sk_tugas_belajar,
                'tgl_mulai_tubel' => $pegawai->tgl_mulai_tubel,
                'tgl_selesai_tubel' => $pegawai->tgl_selesai_tubel,
            ],
        ]);
    }
}
