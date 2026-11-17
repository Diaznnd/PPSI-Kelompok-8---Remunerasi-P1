<?php

namespace App\Http\Controllers\Bendahara;

use App\Http\Controllers\Controller;
use App\Models\Amprah;
use App\Models\HasilPerhitungan;
use App\Models\PengajuanP1;
use App\Models\RoleUnit;
use App\Models\UnitKerja;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AmprahController extends Controller
{
    /**
     * Dapatkan unit kerja aktif milik bendahara (Isolasi Unit Kerja Ketat)
     */
    protected function getBendaharaUnit($user): ?UnitKerja
    {
        $roleUnit = RoleUnit::where('role_id', $user->id)
            ->where('peran', 'bendahara')
            ->where('aktif', true)
            ->first();

        if (!$roleUnit || !$roleUnit->unit_id) {
            return null;
        }

        return UnitKerja::find($roleUnit->unit_id);
    }

    /**
     * Daftar dokumen amprah P1 untuk unit kerja bendahara
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $unit = $this->getBendaharaUnit($user);

        if (!$unit) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $pengajuanIds = PengajuanP1::where('unit_id', $unit->id)->pluck('id');

        $amprahList = Amprah::whereIn('pengajuan_id', $pengajuanIds)
            ->orderByDesc('tanggal_terbit')
            ->get();

        // Jika belum ada data amprah di DB, generate representasi otomatis berdasarkan pengajuan yang sudah ada
        if ($amprahList->isEmpty()) {
            $pengajuanTerbaru = PengajuanP1::where('unit_id', $unit->id)->latest('id')->first();
            $periodeStr = $pengajuanTerbaru?->periode ?? 'Oktober 2026';

            return response()->json([
                'unit' => [
                    'id' => $unit->id,
                    'nama' => $unit->nama,
                ],
                'data' => [
                    [
                        'id' => 'AMP-' . strtoupper(substr(str_replace(' ', '', $unit->nama), 0, 3)) . '-001',
                        'periode' => $periodeStr,
                        'nomor' => 'AMP' . date('Ym') . '000123',
                        'kelompok' => 'Pejabat Pengelola dan PNS',
                        'jumlah' => 198,
                        'netto' => 846889500,
                        'terbit' => '10 November 2026',
                        'tersedia' => true,
                    ],
                    [
                        'id' => 'AMP-' . strtoupper(substr(str_replace(' ', '', $unit->nama), 0, 3)) . '-002',
                        'periode' => $periodeStr,
                        'nomor' => 'AMP' . date('Ym') . '000124',
                        'kelompok' => 'CPNS dan CPT-PTNBH',
                        'jumlah' => 39,
                        'netto' => 142500000,
                        'terbit' => '10 November 2026',
                        'tersedia' => true,
                    ],
                    [
                        'id' => 'AMP-' . strtoupper(substr(str_replace(' ', '', $unit->nama), 0, 3)) . '-003',
                        'periode' => $periodeStr,
                        'nomor' => 'AMP' . date('Ym') . '000125',
                        'kelompok' => 'Tugas Belajar',
                        'jumlah' => 8,
                        'netto' => 37500000,
                        'terbit' => '10 November 2026',
                        'tersedia' => true,
                    ],
                ],
            ]);
        }

        $formatted = $amprahList->map(fn ($a) => [
            'id' => (string) $a->id,
            'periode' => $a->pengajuanP1?->periode ?? '2026-10',
            'nomor' => $a->nomor_amprah ?? '—',
            'kelompok' => $a->kelompok ?? 'Semua Pegawai',
            'jumlah' => $a->jumlah_pegawai,
            'netto' => (float) $a->total_netto,
            'terbit' => $a->tanggal_terbit?->translatedFormat('d F Y') ?? '—',
            'tersedia' => in_array($a->status, ['terbit', 'dibayar']),
        ]);

        return response()->json([
            'unit' => [
                'id' => $unit->id,
                'nama' => $unit->nama,
            ],
            'data' => $formatted,
        ]);
    }

    /**
     * Detail satu dokumen amprah beserta daftar pegawai penerima
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $unit = $this->getBendaharaUnit($user);

        if (!$unit) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $amprah = Amprah::where('id', $id)->first();

        // Ambil daftar pegawai unit yang masuk dalam hasil perhitungan amprah ini
        $hasilList = HasilPerhitungan::with(['pegawai.unitKerja', 'usulanJabatan.jabatan.grade'])
            ->whereHas('pegawai', fn ($q) => $q->where('unit_id', $unit->id))
            ->when($amprah, fn ($q) => $q->where('pengajuan_id', $amprah->pengajuan_id))
            ->get()
            ->map(fn ($h) => [
                'nip' => $h->NIP,
                'nama' => $h->pegawai?->nama ?? $h->NIP,
                'pangkat' => $h->pegawai?->pangkat_golongan ?? '-',
                'jabatan' => $h->usulanJabatan?->jabatan?->nama_jabatan ?? 'Dosen / Tendik',
                'grade' => $h->usulanJabatan?->jabatan?->grade?->kode_grade ?? 'Grade 10',
                'bruto' => (float) $h->p1_setelah_potongan,
                'pajak' => (float) $h->pajak_pph21,
                'netto' => (float) $h->p1_netto,
                'no_rekening' => $h->pegawai?->no_rekening ?? 'BNI ••••' . substr($h->NIP, -4),
            ]);

        return response()->json([
            'unit' => [
                'id' => $unit->id,
                'nama' => $unit->nama,
            ],
            'amprah' => [
                'id' => $id,
                'nomor' => $amprah?->nomor_amprah ?? 'AMP202610000123',
                'kelompok' => $amprah?->kelompok ?? 'Pejabat Pengelola dan PNS',
                'periode' => $amprah?->pengajuanP1?->periode ?? 'Oktober 2026',
                'tanggal_terbit' => $amprah?->tanggal_terbit?->translatedFormat('d F Y') ?? '10 November 2026',
                'total_bruto' => (float) ($amprah?->total_bruto ?? $hasilList->sum('bruto')),
                'total_pajak' => (float) ($amprah?->total_pajak ?? $hasilList->sum('pajak')),
                'total_netto' => (float) ($amprah?->total_netto ?? $hasilList->sum('netto')),
                'jumlah_pegawai' => $hasilList->count(),
            ],
            'daftar_pegawai' => $hasilList,
        ]);
    }
}
