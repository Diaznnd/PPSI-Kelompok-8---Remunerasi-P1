<?php

namespace App\Http\Controllers\Pegawai;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Pegawai;
use App\Models\Pengaduan;
use App\Models\TanggapanPengaduan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class PengaduanController extends Controller
{
    /**
     * FR-44: Daftar pengaduan milik pegawai yang login
     */
    public function index(Request $request): JsonResponse
    {
        $akun = $request->user();
        if (!$akun || !$akun->NIP) {
            return response()->json([
                'message' => 'Akses ditolak: Akun Anda belum ditautkan dengan NIP pegawai.',
            ], 403);
        }

        $nip = $akun->NIP;

        $pengaduans = Pengaduan::where('NIP', $nip)
            ->with(['tanggapan'])
            ->orderByDesc('id')
            ->get();

        $data = $pengaduans->map(function ($p) {
            $langkahSelesai = match ($p->status) {
                'Diajukan' => 1,
                'Ditindaklanjuti' => 2,
                'Diteruskan' => 3,
                'Selesai' => 4,
                default => 2,
            };

            $nomor = sprintf('UA-FTI-2026-%04d', $p->id);
            $tglIso = ($p->diajukan_at ?: $p->created_at ?: now())->toIso8601String();

            return [
                'id' => $p->id,
                'nomor' => $nomor,
                'tanggal' => $p->diajukan_at ? Carbon::parse($p->diajukan_at)->translatedFormat('d F Y') : Carbon::now()->translatedFormat('d F Y'),
                'kategori' => $p->kategori,
                'judul' => $p->judul,
                'periode' => $p->periode ?: 'Oktober 2026',
                'status' => $p->status,
                'langkahSelesai' => $langkahSelesai,
                'uraian' => $p->uraian,
                'lampiran' => $p->lampiran_path ? url('/storage/' . $p->lampiran_path) : null,
                // PascalCase keys (digunakan oleh PengaduanListPage.tsx & PengaduanDetailPage.tsx)
                'IDPengaduan' => $p->id,
                'NomorPengaduan' => $nomor,
                'TanggalPengaduan' => $tglIso,
                'Kategori' => $p->kategori,
                'Periode' => $p->periode ?: 'Oktober 2026',
                'StatusPengaduan' => $p->status,
                'Isi' => $p->uraian,
                'FileLampiran' => $p->lampiran_path ? basename($p->lampiran_path) : null,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);
    }

    /**
     * FR-44: Buat pengaduan baru oleh pegawai (dengan kategori spesifik dan dokumen lampiran max 5 MB)
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'kategori' => 'required|string|max:100',
            'periode' => 'required|string|max:50',
            'judul' => 'nullable|string|max:255',
            'uraian' => 'required|string|min:10',
            'berkas' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ], [
            'kategori.required' => 'Kategori pengaduan wajib dipilih.',
            'periode.required' => 'Periode pengaduan wajib dipilih.',
            'uraian.min' => 'Uraian pengaduan minimal 10 karakter.',
            'berkas.max' => 'Ukuran berkas lampiran maksimal 5 MB (NFR-11).',
            'berkas.mimes' => 'Format berkas lampiran harus berupa PDF, JPG, JPEG, atau PNG.',
        ]);

        $akun = $request->user();
        if (!$akun || !$akun->NIP) {
            return response()->json([
                'message' => 'Akses ditolak: Akun Anda belum ditautkan dengan NIP pegawai.',
            ], 403);
        }

        $nip = $akun->NIP;
        $pegawai = $akun->pegawai ?? Pegawai::where('NIP', $nip)->first();
        $unitId = $pegawai?->unit_id ?? $pegawai?->usulanJabatanTerakhir?->unit_id ?? 1;

        $lampiranPath = null;
        if ($request->hasFile('berkas')) {
            $file = $request->file('berkas');
            $lampiranPath = $file->store('pengaduan', 'public');
        }

        $pengaduan = Pengaduan::create([
            'NIP' => $nip,
            'unit_id' => $unitId,
            'kategori' => $request->kategori,
            'periode' => $request->periode,
            'judul' => $request->judul ?: $request->kategori,
            'uraian' => $request->uraian,
            'lampiran_path' => $lampiranPath,
            'tingkat' => 'unit',
            'status' => 'Diajukan',
            'diajukan_at' => Carbon::now(),
        ]);

        // Catat pesan awal dalam utas pengaduan
        TanggapanPengaduan::create([
            'pengaduan_id' => $pengaduan->id,
            'NIP' => $nip,
            'tipe' => 'pertanyaan',
            'isi' => $request->uraian,
            'lampiran_path' => $lampiranPath,
            'dikirim_at' => Carbon::now(),
        ]);

        // Catat Jejak Audit (FR-26 & NFR-05)
        AuditLog::create([
            'NIP' => $nip,
            'unit_id' => $unitId,
            'aksi' => 'Mengajukan Pengaduan Pegawai',
            'objek_type' => 'Pengaduan',
            'objek_id' => $pengaduan->id,
            'nilai_sebelum' => null,
            'nilai_sesudah' => [
                'status' => 'Diajukan',
                'kategori' => $pengaduan->kategori,
                'periode' => $pengaduan->periode,
            ],
            'alasan' => $pengaduan->uraian,
            'dicatat_at' => Carbon::now(),
        ]);

        $nomor = sprintf('UA-FTI-2026-%04d', $pengaduan->id);

        return response()->json([
            'status' => 'success',
            'message' => 'Pengaduan berhasil diajukan dengan status awal Diajukan (FR-44).',
            'data' => [
                'id' => $pengaduan->id,
                'nomor' => $nomor,
                'status' => 'Diajukan',
                'IDPengaduan' => $pengaduan->id,
                'NomorPengaduan' => $nomor,
                'StatusPengaduan' => 'Diajukan',
            ],
        ], 201);
    }

    /**
     * FR-44: Detail pengaduan beserta linimasa dan riwayat tanggapan (real-time tracking)
     * Pegawai hanya dapat melihat pengaduannya sendiri (Isolasi data / 403 jika milik orang lain)
     */
    public function show(Request $request, $id): JsonResponse
    {
        $akun = $request->user();
        if (!$akun || !$akun->NIP) {
            return response()->json([
                'message' => 'Akses ditolak: Akun Anda belum ditautkan dengan NIP pegawai.',
            ], 403);
        }

        $nip = $akun->NIP;

        $pengaduan = Pengaduan::where('id', $id)
            ->with(['tanggapan.pegawai', 'pegawai'])
            ->first();

        if (!$pengaduan) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pengaduan tidak ditemukan.',
            ], 404);
        }

        // UJI ISOLASI AKSES: Jika mencoba mengakses pengaduan milik pegawai lain -> DITOLAK (403)
        if ($pengaduan->NIP !== $nip) {
            return response()->json([
                'status' => 'error',
                'message' => 'Akses ditolak: Anda tidak memiliki akses ke pengaduan pegawai lain (FR-44 / NFR-04).',
            ], 403);
        }

        $langkahSelesai = match ($pengaduan->status) {
            'Diajukan' => 1,
            'Ditindaklanjuti' => 2,
            'Diteruskan' => 3,
            'Selesai' => 4,
            default => 2,
        };

        $nomor = sprintf('UA-FTI-2026-%04d', $pengaduan->id);
        $tglDiajukanIso = ($pengaduan->diajukan_at ?: $pengaduan->created_at ?: now())->toIso8601String();

        $riwayatStatus = [
            [
                'IDRiwayat' => 1,
                'Status' => 'Diajukan',
                'TanggalStatus' => $tglDiajukanIso,
                'Oleh' => $pengaduan->pegawai?->nama ?? 'Pegawai',
            ],
        ];
        if ($langkahSelesai >= 2) {
            $riwayatStatus[] = [
                'IDRiwayat' => 2,
                'Status' => 'Ditindaklanjuti Bidang Kepegawaian',
                'TanggalStatus' => Carbon::parse($tglDiajukanIso)->addHours(2)->toIso8601String(),
                'Oleh' => 'Bidang Kepegawaian Unit',
            ];
        }
        if ($langkahSelesai >= 3) {
            $riwayatStatus[] = [
                'IDRiwayat' => 3,
                'Status' => 'Diteruskan ke UPT Remunerasi',
                'TanggalStatus' => Carbon::parse($tglDiajukanIso)->addHours(5)->toIso8601String(),
                'Oleh' => 'Bidang Kepegawaian Unit',
            ];
        }
        if ($langkahSelesai >= 4) {
            $riwayatStatus[] = [
                'IDRiwayat' => 4,
                'Status' => 'Selesai',
                'TanggalStatus' => $pengaduan->diselesaikan_at ? Carbon::parse($pengaduan->diselesaikan_at)->toIso8601String() : Carbon::parse($tglDiajukanIso)->addDay()->toIso8601String(),
                'Oleh' => 'Bidang Kepegawaian / UPT Remunerasi',
            ];
        }

        $tanggapanList = $pengaduan->tanggapan->map(function ($t) use ($nip) {
            $isOwn = $t->NIP === $nip;
            return [
                'id' => $t->id,
                'dari' => $isOwn ? 'Anda' : ($t->pegawai?->nama ?? 'Bidang Kepegawaian'),
                'waktu' => Carbon::parse($t->dikirim_at ?: $t->created_at)->translatedFormat('d F Y, H.i') . ' WIB',
                'teks' => $t->isi,
                'lampiran' => $t->lampiran_path ? basename($t->lampiran_path) : null,
                'lampiran_url' => $t->lampiran_path ? url('/storage/' . $t->lampiran_path) : null,
                // PascalCase keys
                'DariRole' => $isOwn ? 'Anda' : ($t->pegawai?->nama ?? 'Bidang Kepegawaian'),
                'TanggalTanggapan' => ($t->dikirim_at ?: $t->created_at ?: now())->toIso8601String(),
                'Isi' => $t->isi,
                'FileLampiran' => $t->lampiran_path ? basename($t->lampiran_path) : null,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $pengaduan->id,
                'nomor' => $nomor,
                'tanggal' => Carbon::parse($pengaduan->diajukan_at ?: $pengaduan->created_at)->translatedFormat('d F Y'),
                'kategori' => $pengaduan->kategori,
                'periode' => $pengaduan->periode,
                'judul' => $pengaduan->judul,
                'uraian' => $pengaduan->uraian,
                'status' => $pengaduan->status,
                'langkahSelesai' => $langkahSelesai,
                'lampiran' => $pengaduan->lampiran_path ? url('/storage/' . $pengaduan->lampiran_path) : null,
                'percacapan' => $tanggapanList,
                'tanggapan' => $tanggapanList,
                'riwayat_status' => $riwayatStatus,
                // PascalCase keys
                'IDPengaduan' => $pengaduan->id,
                'NomorPengaduan' => $nomor,
                'TanggalPengaduan' => $tglDiajukanIso,
                'Kategori' => $pengaduan->kategori,
                'Periode' => $pengaduan->periode ?: 'Oktober 2026',
                'StatusPengaduan' => $pengaduan->status,
                'Isi' => $pengaduan->uraian,
                'FileLampiran' => $pengaduan->lampiran_path ? basename($pengaduan->lampiran_path) : null,
            ],
        ]);
    }

    /**
     * FR-44: Kirim balasan pesan pada tiket pengaduan oleh pegawai
     */
    public function storeTanggapan(Request $request, $id): JsonResponse
    {
        $request->validate([
            'teks' => 'required_without_all:pesan,isi|nullable|string',
            'pesan' => 'required_without_all:teks,isi|nullable|string',
            'isi' => 'required_without_all:teks,pesan|nullable|string',
            'berkas' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'lampiran' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $akun = $request->user();
        if (!$akun || !$akun->NIP) {
            return response()->json([
                'message' => 'Akses ditolak: Akun Anda belum ditautkan dengan NIP pegawai.',
            ], 403);
        }

        $nip = $akun->NIP;

        $pengaduan = Pengaduan::where('id', $id)->first();
        if (!$pengaduan) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pengaduan tidak ditemukan.',
            ], 404);
        }

        // UJI ISOLASI AKSES: Tidak dapat membalas tiket milik pegawai lain
        if ($pengaduan->NIP !== $nip) {
            return response()->json([
                'status' => 'error',
                'message' => 'Akses ditolak: Anda tidak dapat menanggapi pengaduan pegawai lain (FR-44 / NFR-04).',
            ], 403);
        }

        $lampiranPath = null;
        if ($request->hasFile('berkas')) {
            $lampiranPath = $request->file('berkas')->store('pengaduan', 'public');
        } elseif ($request->hasFile('lampiran')) {
            $lampiranPath = $request->file('lampiran')->store('pengaduan', 'public');
        }

        $isiPesan = $request->input('teks') ?: ($request->input('pesan') ?: $request->input('isi'));

        $tanggapan = TanggapanPengaduan::create([
            'pengaduan_id' => $pengaduan->id,
            'NIP' => $nip,
            'tipe' => 'pertanyaan',
            'isi' => $isiPesan,
            'lampiran_path' => $lampiranPath,
            'dikirim_at' => Carbon::now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Pesan balasan berhasil dikirim.',
            'data' => [
                'id' => $tanggapan->id,
                'dari' => 'Anda',
                'waktu' => Carbon::now()->translatedFormat('d F Y, H.i') . ' WIB',
                'teks' => $tanggapan->isi,
                'lampiran' => $lampiranPath ? basename($lampiranPath) : null,
                'DariRole' => 'Anda',
                'TanggalTanggapan' => now()->toIso8601String(),
                'Isi' => $tanggapan->isi,
                'FileLampiran' => $lampiranPath ? basename($lampiranPath) : null,
            ],
        ], 201);
    }
}
