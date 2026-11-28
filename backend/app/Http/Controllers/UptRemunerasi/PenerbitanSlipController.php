<?php

namespace App\Http\Controllers\UptRemunerasi;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\HasilPerhitungan;
use App\Models\PengajuanP1;
use App\Models\RiwayatStatus;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class PenerbitanSlipController extends Controller
{
    protected function authorizeUpt(Request $request): void
    {
        $user = $request->user();
        if (!$user || !$user->hasRole('upt_remunerasi')) {
            abort(403, 'Akses ditolak: Anda tidak memiliki wewenang sebagai UPT Remunerasi.');
        }
    }

    /**
     * Status penerbitan slip P1 seluruh unit kerja
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorizeUpt($request);

        $periode = $request->query('periode', '2026-10');

        $list = PengajuanP1::with('unitKerja')
            ->where('periode', $periode)
            ->get()
            ->map(function ($p) {
                $hasilQuery = HasilPerhitungan::where('pengajuan_id', $p->id);
                $totalPegawai = (clone $hasilQuery)->count();
                $slipTerbitCount = (clone $hasilQuery)->whereNotNull('slip_terbit_at')->count();

                $statusSlip = 'belum_terbit';
                if ($slipTerbitCount > 0 && $slipTerbitCount >= $totalPegawai) {
                    $statusSlip = 'terbit';
                } elseif ($slipTerbitCount > 0) {
                    $statusSlip = 'sebagian';
                }

                return [
                    'pengajuan_id' => $p->id,
                    'unit_id' => $p->unit_id,
                    'unit' => $p->unitKerja?->nama ?? 'Unit',
                    'periode' => $p->periode,
                    'total_pegawai' => $totalPegawai,
                    'slip_terbit' => $slipTerbitCount,
                    'status_slip' => $statusSlip,
                    'siap_terbit' => in_array($p->status, ['netto_ditetapkan', 'disetujui', 'disahkan', 'selesai']),
                ];
            });

        return response()->json([
            'periode' => $periode,
            'total_unit' => $list->count(),
            'sudah_terbit' => $list->where('status_slip', 'terbit')->count(),
            'belum_terbit' => $list->where('status_slip', '!=', 'terbit')->count(),
            'data' => $list,
        ]);
    }

    /**
     * Terbitkan Slip P1 secara massal untuk unit kerja pada periode terpilih
     */
    public function terbitkan(Request $request, string $pengajuanId): JsonResponse
    {
        $this->authorizeUpt($request);

        return DB::transaction(function () use ($pengajuanId, $request) {
            $pengajuan = PengajuanP1::with('unitKerja')->findOrFail($pengajuanId);
            $user = $request->user();

            $hasilList = HasilPerhitungan::where('pengajuan_id', $pengajuan->id)->get();

            $waktuTerbit = Carbon::now();

            foreach ($hasilList as $h) {
                $h->slip_terbit_at = $waktuTerbit;
                $h->slip_file_path = 'slips/' . $pengajuan->periode . '_' . $h->NIP . '.pdf';
                $h->save();
            }

            $statusSebelum = $pengajuan->status;
            $pengajuan->status = 'selesai';
            $pengajuan->save();

            // Jejak riwayat status
            RiwayatStatus::create([
                'pengajuan_id' => $pengajuan->id,
                'NIP' => $user->NIP,
                'dari_status' => $statusSebelum,
                'ke_status' => 'selesai',
                'catatan_alasan' => 'Slip P1 resmi diterbitkan dan dapat diakses mandiri oleh seluruh pegawai unit.',
                'dicatat_at' => $waktuTerbit,
            ]);

            // Audit log
            AuditLog::create([
                'NIP' => $user->NIP,
                'unit_id' => $pengajuan->unit_id,
                'aksi' => 'Penerbitan Slip P1',
                'objek_type' => 'PengajuanP1',
                'objek_id' => $pengajuan->id,
                'nilai_sebelum' => ['slip_terbit' => false],
                'nilai_sesudah' => ['slip_terbit' => true, 'jumlah_pegawai' => $hasilList->count()],
                'alasan' => 'Penerbitan resmi slip P1 oleh UPT Remunerasi',
                'dicatat_at' => $waktuTerbit,
            ]);

            return response()->json([
                'message' => 'Slip P1 untuk ' . $pengajuan->unitKerja?->nama . ' berhasil diterbitkan.',
                'jumlah_pegawai' => $hasilList->count(),
                'status' => 'terbit',
                'terbit_pada' => $waktuTerbit->translatedFormat('d F Y, H.i'),
            ]);
        });
    }
}
