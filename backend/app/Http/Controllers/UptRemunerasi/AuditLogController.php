<?php

namespace App\Http\Controllers\UptRemunerasi;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    protected function authorizeUpt(Request $request): void
    {
        $user = $request->user();
        if (!$user || !$user->hasRole('upt_remunerasi')) {
            abort(403, 'Akses ditolak: Anda tidak memiliki wewenang sebagai UPT Remunerasi.');
        }
    }

    /**
     * Menampilkan daftar jejak audit aktivitas sistem
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorizeUpt($request);

        $query = AuditLog::with(['pegawai.unitKerja', 'unitKerja']);

        if ($request->filled('aksi')) {
            $query->where('aksi', 'like', '%' . $request->query('aksi') . '%');
        }

        if ($request->filled('q')) {
            $q = $request->query('q');
            $query->where(function ($sub) use ($q) {
                $sub->where('aksi', 'like', "%{$q}%")
                    ->orWhere('alasan', 'like', "%{$q}%")
                    ->orWhere('objek_type', 'like', "%{$q}%")
                    ->orWhere('NIP', 'like', "%{$q}%");
            });
        }

        $logs = $query->latest('id')->paginate(20)->through(fn ($a) => [
            'id' => $a->id,
            'aktor' => $a->pegawai?->nama ?? ($a->NIP ?? 'Sistem'),
            'nip' => $a->NIP,
            'unit' => $a->unitKerja?->nama ?? '-',
            'aksi' => $a->aksi,
            'objek_type' => $a->objek_type,
            'objek_id' => $a->objek_id,
            'nilai_sebelum' => $a->nilai_sebelum,
            'nilai_sesudah' => $a->nilai_sesudah,
            'alasan' => $a->alasan,
            'waktu' => $a->created_at?->translatedFormat('d F Y, H.i') ?? $a->dicatat_at?->translatedFormat('d F Y, H.i'),
        ]);

        return response()->json($logs);
    }
}
