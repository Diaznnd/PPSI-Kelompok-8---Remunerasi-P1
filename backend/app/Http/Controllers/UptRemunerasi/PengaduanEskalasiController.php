<?php

namespace App\Http\Controllers\UptRemunerasi;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Pengaduan;
use App\Models\TanggapanPengaduan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class PengaduanEskalasiController extends Controller
{
    protected function authorizeUpt(Request $request): void
    {
        $user = $request->user();
        if (!$user || !$user->hasRole('upt_remunerasi')) {
            abort(403, 'Akses ditolak: Anda tidak memiliki wewenang sebagai UPT Remunerasi.');
        }
    }

    /**
     * Daftar tiket pengaduan yang dieskalasi ke tingkat universitas
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorizeUpt($request);

        $query = Pengaduan::with(['pegawai.unitKerja', 'unitKerja'])
            ->where(function ($q) {
                $q->where('tingkat', 'universitas')
                    ->orWhere('status', 'diteruskan');
            });

        if ($request->filled('status') && $request->query('status') !== 'semua') {
            $query->where('status', $request->query('status'));
        }

        $list = $query->latest('id')->get()->map(fn ($p) => [
            'id' => $p->id,
            'nip' => $p->NIP,
            'nama' => $p->pegawai?->nama ?? $p->NIP,
            'unit' => $p->unitKerja?->nama ?? '-',
            'kategori' => $p->kategori,
            'judul' => $p->judul,
            'uraian' => $p->uraian,
            'status' => $p->status,
            'periode' => $p->periode,
            'diajukan_pada' => $p->diajukan_at?->translatedFormat('d F Y, H.i') ?? $p->created_at?->translatedFormat('d F Y'),
        ]);

        return response()->json([
            'total' => $list->count(),
            'menunggu_tanggapan' => $list->where('status', '!=', 'Selesai')->count(),
            'selesai' => $list->where('status', 'Selesai')->count(),
            'data' => $list,
        ]);
    }

    /**
     * Detail satu tiket pengaduan eskalasi beserta utas tanggapannya
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $this->authorizeUpt($request);

        $pengaduan = Pengaduan::with(['pegawai.unitKerja', 'unitKerja', 'tanggapan.pegawai'])
            ->findOrFail($id);

        $tanggapanList = $pengaduan->tanggapan->map(fn ($t) => [
            'id' => $t->id,
            'pengirim' => $t->pegawai?->nama ?? $t->NIP,
            'tipe' => $t->tipe,
            'isi' => $t->isi,
            'lampiran' => $t->lampiran_path,
            'waktu' => $t->dikirim_at?->translatedFormat('d F Y, H.i') ?? $t->created_at?->translatedFormat('d F Y, H.i'),
        ]);

        return response()->json([
            'pengaduan' => [
                'id' => $pengaduan->id,
                'nip' => $pengaduan->NIP,
                'nama' => $pengaduan->pegawai?->nama,
                'unit' => $pengaduan->unitKerja?->nama,
                'kategori' => $pengaduan->kategori,
                'judul' => $pengaduan->judul,
                'uraian' => $pengaduan->uraian,
                'status' => $pengaduan->status,
                'periode' => $pengaduan->periode,
                'diajukan_pada' => $pengaduan->diajukan_at?->translatedFormat('d F Y, H.i'),
            ],
            'tanggapan' => $tanggapanList,
        ]);
    }

    /**
     * Berikan tanggapan resmi atau selesaikan pengaduan
     */
    public function tanggapi(Request $request, string $id): JsonResponse
    {
        $this->authorizeUpt($request);

        $validated = $request->validate([
            'isi' => 'required|string',
            'status' => 'nullable|in:ditindaklanjuti,selesai',
        ]);

        $pengaduan = Pengaduan::findOrFail($id);
        $user = $request->user();

        // Tambah rekaman tanggapan
        $tanggapan = TanggapanPengaduan::create([
            'pengaduan_id' => $pengaduan->id,
            'NIP' => $user->NIP,
            'isi' => $validated['isi'],
            'tipe' => 'jawaban',
            'dikirim_at' => Carbon::now(),
        ]);

        if (!empty($validated['status'])) {
            $pengaduan->status = $validated['status'] === 'selesai' ? 'Selesai' : 'Ditindaklanjuti';
            if ($validated['status'] === 'selesai') {
                $pengaduan->diselesaikan_at = Carbon::now();
            }
            $pengaduan->save();
        }

        // Audit log
        AuditLog::create([
            'NIP' => $user->NIP,
            'unit_id' => $pengaduan->unit_id,
            'aksi' => 'Penanganan Pengaduan Eskalasi',
            'objek_type' => 'Pengaduan',
            'objek_id' => $pengaduan->id,
            'alasan' => 'Tanggapan resmi UPT Remunerasi pada tiket pengaduan',
            'dicatat_at' => Carbon::now(),
        ]);

        return response()->json([
            'message' => 'Tanggapan pengaduan berhasil dikirimkan.',
            'status' => $pengaduan->status,
            'tanggapan' => $tanggapan,
        ]);
    }
}
