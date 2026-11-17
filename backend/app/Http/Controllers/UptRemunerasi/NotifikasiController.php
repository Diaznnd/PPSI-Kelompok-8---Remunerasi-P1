<?php

namespace App\Http\Controllers\UptRemunerasi;

use App\Http\Controllers\Controller;
use App\Models\Notifikasi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotifikasiController extends Controller
{
    protected function authorizeUpt(Request $request): void
    {
        $user = $request->user();
        if (!$user || !$user->hasRole('upt_remunerasi')) {
            abort(403, 'Akses ditolak: Anda tidak memiliki wewenang sebagai UPT Remunerasi.');
        }
    }

    /**
     * Daftar notifikasi untuk UPT Remunerasi
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorizeUpt($request);
        
        $user = $request->user();
        
        $query = Notifikasi::where('NIP', $user->NIP)
            ->orWhereNull('NIP'); // Notifikasi broadcast

        // Filter berdasarkan status baca
        if ($request->filled('status')) {
            $status = $request->query('status');
            if ($status === 'belum_dibaca') {
                $query->where('dibaca', false);
            } elseif ($status === 'sudah_dibaca') {
                $query->where('dibaca', true);
            }
        }

        // Filter berdasarkan kategori
        if ($request->filled('kategori')) {
            $query->where('kategori', $request->query('kategori'));
        }

        $notifikasi = $query->latest('created_at')
            ->limit(50)
            ->get()
            ->map(fn ($n) => [
                'id' => $n->id,
                'kategori' => $n->kategori,
                'judul' => $n->judul,
                'isi' => $n->isi,
                'dibaca' => $n->dibaca,
                'url_tujuan' => $n->url_tujuan,
                'waktu' => $n->created_at?->translatedFormat('d F Y, H:i'),
                'waktu_relatif' => $n->created_at?->diffForHumans(),
            ]);

        $belumDibaca = Notifikasi::where('NIP', $user->NIP)
            ->orWhereNull('NIP')
            ->where('dibaca', false)
            ->count();

        return response()->json([
            'total' => $notifikasi->count(),
            'belum_dibaca' => $belumDibaca,
            'data' => $notifikasi,
        ]);
    }

    /**
     * Tandai notifikasi sebagai dibaca
     */
    public function markAsRead(Request $request, string $id): JsonResponse
    {
        $this->authorizeUpt($request);

        $notifikasi = Notifikasi::findOrFail($id);
        
        // Verifikasi notifikasi milik user atau broadcast
        $user = $request->user();
        if ($notifikasi->NIP && $notifikasi->NIP !== $user->NIP) {
            abort(403, 'Notifikasi ini bukan milik Anda.');
        }

        $notifikasi->dibaca = true;
        $notifikasi->dibaca_at = now();
        $notifikasi->save();

        return response()->json([
            'message' => 'Notifikasi ditandai sebagai dibaca.',
        ]);
    }

    /**
     * Tandai semua notifikasi sebagai dibaca
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $this->authorizeUpt($request);

        $user = $request->user();

        $updated = Notifikasi::where(function ($q) use ($user) {
            $q->where('NIP', $user->NIP)
                ->orWhereNull('NIP');
        })
        ->where('dibaca', false)
        ->update([
            'dibaca' => true,
            'dibaca_at' => now(),
        ]);

        return response()->json([
            'message' => $updated . ' notifikasi ditandai sebagai dibaca.',
            'jumlah' => $updated,
        ]);
    }

    /**
     * Hapus notifikasi
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $this->authorizeUpt($request);

        $notifikasi = Notifikasi::findOrFail($id);
        
        // Verifikasi notifikasi milik user
        $user = $request->user();
        if ($notifikasi->NIP && $notifikasi->NIP !== $user->NIP) {
            abort(403, 'Notifikasi ini bukan milik Anda.');
        }

        $notifikasi->delete();

        return response()->json([
            'message' => 'Notifikasi berhasil dihapus.',
        ]);
    }

    /**
     * Kirim notifikasi broadcast ke semua unit
     */
    public function broadcast(Request $request): JsonResponse
    {
        $this->authorizeUpt($request);

        $validated = $request->validate([
            'judul' => 'required|string|max:200',
            'isi' => 'required|string|max:1000',
            'kategori' => 'required|string|in:info,peringatan,penting,pengumuman',
            'target' => 'required|string|in:semua,bendahara,pegawai',
        ]);

        $targetNIP = [];
        
        if ($validated['target'] === 'bendahara') {
            $targetNIP = \App\Models\Akun::whereHas('roles', fn ($q) => 
                $q->where('peran', 'bendahara')
            )->pluck('NIP')->toArray();
        } elseif ($validated['target'] === 'pegawai') {
            $targetNIP = \App\Models\Pegawai::pluck('NIP')->toArray();
        }

        // Jika target "semua", buat satu notifikasi broadcast (NIP = null)
        if ($validated['target'] === 'semua') {
            Notifikasi::create([
                'NIP' => null,
                'kategori' => $validated['kategori'],
                'judul' => $validated['judul'],
                'isi' => $validated['isi'],
                'dibaca' => false,
            ]);
            
            $jumlahTarget = \App\Models\Akun::count();
        } else {
            // Buat notifikasi untuk setiap target
            foreach ($targetNIP as $nip) {
                Notifikasi::create([
                    'NIP' => $nip,
                    'kategori' => $validated['kategori'],
                    'judul' => $validated['judul'],
                    'isi' => $validated['isi'],
                    'dibaca' => false,
                ]);
            }
            
            $jumlahTarget = count($targetNIP);
        }

        return response()->json([
            'message' => 'Notifikasi broadcast berhasil dikirim.',
            'target' => $validated['target'],
            'jumlah_penerima' => $jumlahTarget,
        ]);
    }
}
