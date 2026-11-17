<?php

namespace App\Http\Controllers\Bendahara;

use App\Http\Controllers\Controller;
use App\Models\PengajuanP1;
use App\Models\RiwayatStatus;
use App\Models\RoleUnit;
use App\Models\UnitKerja;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StatusPengajuanController extends Controller
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
     * Menampilkan status pengajuan dan riwayat putaran verifikasi per periode
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $unit = $this->getBendaharaUnit($user);

        if (!$unit) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $daftarPengajuan = PengajuanP1::where('unit_id', $unit->id)
            ->with(['riwayatStatus' => fn ($q) => $q->latest('id')])
            ->orderByDesc('periode')
            ->get();

        $result = $daftarPengajuan->map(function ($p) {
            $dikembalikan = $p->status === 'dikembalikan';
            $done = 1;
            if ($p->status === 'draft') {
                $done = 1;
            } elseif ($p->status === 'diajukan') {
                $done = 2;
            } elseif ($p->status === 'diverifikasi') {
                $done = 3;
            } elseif (in_array($p->status, ['disetujui', 'selesai'])) {
                $done = 4;
            }

            $riwayatFormatted = $p->riwayatStatus->map(function ($r, $idx) use ($p) {
                $keputusan = 'Diajukan';
                if ($r->ke_status === 'disetujui' || $r->ke_status === 'selesai') {
                    $keputusan = 'Disetujui';
                } elseif ($r->ke_status === 'dikembalikan') {
                    $keputusan = 'Dikembalikan';
                } elseif ($r->ke_status === 'diverifikasi') {
                    $keputusan = 'Diverifikasi';
                }

                return [
                    'ke' => $p->pengajuan_ke ?? ($idx + 1),
                    'diajukan' => $p->diajukan_at?->translatedFormat('d F Y, H.i') ?? '-',
                    'keputusan' => $keputusan,
                    'tglKeputusan' => $r->dicatat_at?->translatedFormat('d F Y, H.i') ?? '-',
                    'catatan' => $r->catatan_alasan ?? 'Data telah diverifikasi sesuai ketentuan.',
                ];
            });

            return [
                'id' => $p->id,
                'periode' => $p->periode,
                'nomor_pengajuan' => $p->nomor_pengajuan,
                'status' => $p->status,
                'done' => $done,
                'dikembalikan' => $dikembalikan,
                'total_remunerasi' => (float) $p->total_remunerasi,
                'total_pengurangan' => (float) $p->total_pengurangan,
                'total_bruto' => (float) $p->total_bruto,
                'riwayat' => $riwayatFormatted,
            ];
        });

        return response()->json([
            'unit' => [
                'id' => $unit->id,
                'nama' => $unit->nama,
            ],
            'daftar_periode' => $daftarPengajuan->pluck('periode')->unique()->values(),
            'data' => $result,
        ]);
    }
}
