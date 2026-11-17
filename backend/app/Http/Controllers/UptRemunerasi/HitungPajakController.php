<?php

namespace App\Http\Controllers\UptRemunerasi;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\HasilPerhitungan;
use App\Models\PengajuanP1;
use App\Models\RiwayatStatus;
use App\Models\UnitKerja;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class HitungPajakController extends Controller
{
    protected function authorizeUpt(Request $request): void
    {
        $user = $request->user();
        if (!$user || !$user->hasRole('upt_remunerasi')) {
            abort(403, 'Akses ditolak: Anda tidak memiliki wewenang sebagai UPT Remunerasi.');
        }
    }

    /**
     * Daftar pengajuan unit kerja untuk proses penghitungan pajak & penetapan P1 Netto
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorizeUpt($request);

        $periode = $request->query('periode', '2026-10');

        $pengajuanList = PengajuanP1::with(['unitKerja'])
            ->where('periode', $periode)
            ->get()
            ->map(function ($p) {
                $hasilQuery = HasilPerhitungan::where('pengajuan_id', $p->id);
                $totalPegawai = (clone $hasilQuery)->count();
                $totalBruto = (float) $p->total_bruto;
                $totalPajak = (float) (clone $hasilQuery)->sum('pajak_pph21');
                $totalNetto = (float) (clone $hasilQuery)->sum('p1_netto');

                return [
                    'id' => (string) $p->id,
                    'unit_id' => $p->unit_id,
                    'unit' => $p->unitKerja?->nama ?? 'Unit',
                    'periode' => $p->periode,
                    'status' => $p->status,
                    'total_pegawai' => $totalPegawai,
                    'total_bruto' => $totalBruto,
                    'total_pajak' => $totalPajak,
                    'total_netto' => $totalNetto > 0 ? $totalNetto : max(0, $totalBruto - $totalPajak),
                    'siap_dihitung' => in_array($p->status, ['diverifikasi', 'terverifikasi', 'diajukan']),
                    'sudah_ditetapkan' => in_array($p->status, ['netto_ditetapkan', 'disetujui', 'selesai']),
                ];
            });

        return response()->json([
            'periode' => $periode,
            'menunggu_hitung' => $pengajuanList->where('siap_dihitung', true)->count(),
            'sudah_ditetapkan' => $pengajuanList->where('sudah_ditetapkan', true)->count(),
            'data' => $pengajuanList->values(),
        ]);
    }

    /**
     * Rincian perhitungan pajak per pegawai untuk satu pengajuan unit kerja
     */
    public function detail(Request $request, string $id): JsonResponse
    {
        $this->authorizeUpt($request);

        $pengajuan = PengajuanP1::with('unitKerja')->findOrFail($id);

        $hasilList = HasilPerhitungan::with(['pegawai', 'usulanJabatan.jabatan.grade'])
            ->where('pengajuan_id', $pengajuan->id)
            ->get()
            ->map(function ($h) {
                $bruto = (float) $h->p1_setelah_potongan;

                // Hitung Pajak TER simulasi jika belum ada
                $tarifPersen = 5; // Default tarif PPh 21 Pasal 21 PNS / TER
                if ($bruto > 10000000) {
                    $tarifPersen = 15;
                } elseif ($bruto > 5000000) {
                    $tarifPersen = 10;
                }

                $pajak = (float) ($h->pajak_pph21 ?? round(($bruto * $tarifPersen) / 100));
                $netto = max(0, $bruto - $pajak);

                return [
                    'id' => $h->id,
                    'nip' => $h->NIP,
                    'nama' => $h->pegawai?->nama ?? $h->NIP,
                    'pangkat' => $h->pegawai?->pangkat_golongan ?? '-',
                    'npwp' => $h->pegawai?->npwp ?? '-',
                    'jabatan' => $h->usulanJabatan?->jabatan?->nama_jabatan ?? 'Pegawai',
                    'grade' => $h->usulanJabatan?->jabatan?->grade?->kode_grade ?? 'Grade 10',
                    'bruto' => $bruto,
                    'tarif_pajak' => $tarifPersen . '%',
                    'pajak' => $pajak,
                    'netto' => $netto,
                    'status_hitung' => $h->pajak_pph21 !== null ? 'Dihitung' : 'Simulasi',
                ];
            });

        return response()->json([
            'pengajuan' => [
                'id' => $pengajuan->id,
                'nomor' => $pengajuan->nomor_pengajuan,
                'unit' => $pengajuan->unitKerja?->nama,
                'periode' => $pengajuan->periode,
                'status' => $pengajuan->status,
                'total_pegawai' => $hasilList->count(),
                'total_bruto' => (float) $pengajuan->total_bruto,
                'total_pajak' => $hasilList->sum('pajak'),
                'total_netto' => $hasilList->sum('netto'),
            ],
            'pegawai' => $hasilList,
        ]);
    }

    /**
     * Menetapkan P1 Netto resmi setelah pajak terhitung
     */
    public function tetapkanNetto(Request $request, string $id): JsonResponse
    {
        $this->authorizeUpt($request);

        $validated = $request->validate([
            'catatan' => 'nullable|string|max:500',
        ]);

        return DB::transaction(function () use ($id, $validated, $request) {
            $pengajuan = PengajuanP1::with('unitKerja')->findOrFail($id);
            $user = $request->user();

            $hasilList = HasilPerhitungan::where('pengajuan_id', $pengajuan->id)->get();

            $totalPajak = 0;
            $totalNetto = 0;

            foreach ($hasilList as $h) {
                $bruto = (float) $h->p1_setelah_potongan;
                $tarifPersen = 5;
                if ($bruto > 10000000) {
                    $tarifPersen = 15;
                } elseif ($bruto > 5000000) {
                    $tarifPersen = 10;
                }

                $pajak = round(($bruto * $tarifPersen) / 100);
                $netto = max(0, $bruto - $pajak);

                $h->pajak_pph21 = $pajak;
                $h->p1_netto = $netto;
                $h->tab_pajak = ['skema' => 'TER', 'tarif' => $tarifPersen . '%', 'bruto' => $bruto];
                $h->save();

                $totalPajak += $pajak;
                $totalNetto += $netto;
            }

            $statusSebelum = $pengajuan->status;
            $pengajuan->status = 'netto_ditetapkan';
            $pengajuan->save();

            // Catat riwayat status
            RiwayatStatus::create([
                'pengajuan_id' => $pengajuan->id,
                'NIP' => $user->NIP,
                'dari_status' => $statusSebelum,
                'ke_status' => 'netto_ditetapkan',
                'catatan_alasan' => $validated['catatan'] ?? 'Penghitungan pajak TER dan penetapan P1 Netto selesai oleh UPT Remunerasi.',
                'dicatat_at' => Carbon::now(),
            ]);

            // Catat audit log
            AuditLog::create([
                'NIP' => $user->NIP,
                'unit_id' => $pengajuan->unit_id,
                'aksi' => 'Penetapan Pajak & P1 Netto',
                'objek_type' => 'PengajuanP1',
                'objek_id' => $pengajuan->id,
                'nilai_sebelum' => ['status' => $statusSebelum],
                'nilai_sesudah' => ['status' => 'netto_ditetapkan', 'total_pajak' => $totalPajak, 'total_netto' => $totalNetto],
                'alasan' => $validated['catatan'] ?? 'Penetapan P1 Netto definitif',
                'dicatat_at' => Carbon::now(),
            ]);

            return response()->json([
                'message' => 'P1 Netto unit ' . $pengajuan->unitKerja?->nama . ' berhasil ditetapkan.',
                'pengajuan' => [
                    'id' => $pengajuan->id,
                    'status' => $pengajuan->status,
                    'total_bruto' => (float) $pengajuan->total_bruto,
                    'total_pajak' => $totalPajak,
                    'total_netto' => $totalNetto,
                ],
            ]);
        });
    }
}
