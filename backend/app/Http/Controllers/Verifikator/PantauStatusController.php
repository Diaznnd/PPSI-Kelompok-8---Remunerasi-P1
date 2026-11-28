<?php

namespace App\Http\Controllers\Verifikator;

use App\Http\Controllers\Controller;
use App\Models\PengajuanP1;
use App\Models\RoleUnit;
use App\Models\UsulanJabatan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class PantauStatusController extends Controller
{
    /**
     * Dapatkan batasan unit_id jika verifikator memiliki lingkup penugasan unit tertentu.
     */
    protected function getVerifikatorUnitId(Request $request): ?int
    {
        $user = $request->user();
        if (!$user) {
            return null;
        }

        $roleUnit = RoleUnit::where('role_id', $user->id)
            ->where('peran', 'verifikator')
            ->where('aktif', true)
            ->first();

        return $roleUnit?->unit_id;
    }

    /**
     * Format status ke bentuk label yang sesuai untuk pemantauan
     */
    protected function formatStatus(?string $status): string
    {
        $st = strtolower(trim($status ?? 'diajukan'));
        return match ($st) {
            'diverifikasi', 'terverifikasi', 'disetujui_verifikator' => 'Diteruskan',
            'dikembalikan', 'ditolak' => 'Dikembalikan',
            'disetujui', 'ditetapkan', 'selesai', 'netto_ditetapkan' => 'Disetujui',
            default => 'Diajukan',
        };
    }

    /**
     * FR-25: Memantau status pengajuan P1 dan perubahan jabatan/grade secara transparan
     */
    public function index(Request $request): JsonResponse
    {
        $unitId = $this->getVerifikatorUnitId($request);
        $tab = strtolower($request->query('tab', 'p1'));

        $periodeParam = $request->query('periode');
        $unitParam = $request->query('unit');
        $statusParam = $request->query('status');

        if ($tab === 'jbg' || $tab === 'jabatan') {
            // Pemantauan Perubahan Jabatan/Grade
            $query = UsulanJabatan::with(['pegawai.unitKerja', 'jabatan.grade', 'unitKerja']);
            if ($unitId) {
                $query->where('unit_id', $unitId);
            }

            if ($unitParam && $unitParam !== 'semua') {
                if (is_numeric($unitParam)) {
                    $query->where('unit_id', (int) $unitParam);
                } else {
                    $query->whereHas('unitKerja', fn ($u) => $u->where('nama', 'like', "%{$unitParam}%"));
                }
            }

            if ($statusParam && $statusParam !== 'semua') {
                $st = strtolower($statusParam);
                if ($st === 'diteruskan' || $st === 'diverifikasi') {
                    $query->whereIn('status', ['diverifikasi', 'terverifikasi', 'disetujui_verifikator']);
                } elseif ($st === 'dikembalikan') {
                    $query->whereIn('status', ['dikembalikan', 'ditolak']);
                } elseif ($st === 'disetujui') {
                    $query->whereIn('status', ['ditetapkan', 'disetujui']);
                } elseif ($st === 'diajukan') {
                    $query->where('status', 'diajukan');
                }
            }

            $rows = $query->orderByDesc('diajukan_at')->orderByDesc('id')->get()
                ->map(function ($u) {
                    $nomor = sprintf('JBG-2026-10-%04d', $u->id);
                    $pegawai = $u->pegawai;
                    $unitNama = $u->unitKerja?->nama ?? ($pegawai?->unitKerja?->nama ?? 'Unit Kerja');
                    $tglDiajukan = $u->diajukan_at ?? $u->created_at ?? Carbon::now();
                    $tglUpdated = $u->updated_at ?? $tglDiajukan;
                    $statusTampil = $this->formatStatus($u->status);

                    $riwayat = [
                        [
                            'ke' => 1,
                            'judul' => 'Diajukan Kepegawaian',
                            'waktu' => Carbon::parse($tglDiajukan)->translatedFormat('d F Y, H.i') . ' WIB',
                            'oleh' => "Bidang Kepegawaian {$unitNama}",
                            'catatan' => null,
                            'selesai' => true,
                        ],
                    ];

                    if (strtolower($u->status ?? '') === 'dikembalikan') {
                        $riwayat[] = [
                            'ke' => 1,
                            'judul' => 'Dikembalikan Verifikator',
                            'waktu' => Carbon::parse($tglUpdated)->translatedFormat('d F Y, H.i') . ' WIB',
                            'oleh' => 'Rizki Maulana • Verifikator',
                            'catatan' => $u->catatan_verifikator,
                            'selesai' => false,
                        ];
                    } elseif (in_array(strtolower($u->status ?? ''), ['diverifikasi', 'disetujui_verifikator', 'ditetapkan'])) {
                        $riwayat[] = [
                            'ke' => 1,
                            'judul' => 'Disetujui dan Diteruskan ke UPT',
                            'waktu' => Carbon::parse($tglUpdated)->translatedFormat('d F Y, H.i') . ' WIB',
                            'oleh' => 'Rizki Maulana • Verifikator',
                            'catatan' => $u->catatan_verifikator,
                            'selesai' => true,
                        ];
                    }

                    return [
                        'id' => $nomor,
                        'raw_id' => $u->id,
                        'unit' => $unitNama,
                        'unit_id' => $u->unit_id,
                        'periode' => 'Oktober 2026',
                        'jenis' => 'Perubahan Jabatan',
                        'status' => $statusTampil,
                        'status_raw' => $u->status,
                        'diperbarui' => Carbon::parse($tglUpdated)->translatedFormat('d F Y, H.i') . ' WIB',
                        'sub' => $pegawai?->nama ?? $u->NIP,
                        'riwayat' => $riwayat,
                    ];
                });
        } else {
            // Pemantauan Pengajuan P1
            $query = PengajuanP1::with(['unitKerja', 'riwayatStatus']);
            if ($unitId) {
                $query->where('unit_id', $unitId);
            }

            if ($unitParam && $unitParam !== 'semua') {
                if (is_numeric($unitParam)) {
                    $query->where('unit_id', (int) $unitParam);
                } else {
                    $query->whereHas('unitKerja', fn ($u) => $u->where('nama', 'like', "%{$unitParam}%"));
                }
            }

            if ($periodeParam && $periodeParam !== 'semua') {
                $query->where('periode', $periodeParam);
            }

            if ($statusParam && $statusParam !== 'semua') {
                $st = strtolower($statusParam);
                if ($st === 'diteruskan' || $st === 'diverifikasi') {
                    $query->whereIn('status', ['diverifikasi', 'terverifikasi']);
                } elseif ($st === 'dikembalikan') {
                    $query->whereIn('status', ['dikembalikan', 'ditolak']);
                } elseif ($st === 'disetujui') {
                    $query->whereIn('status', ['disetujui', 'selesai', 'netto_ditetapkan']);
                } elseif ($st === 'diajukan') {
                    $query->where('status', 'diajukan');
                }
            }

            $rows = $query->orderByDesc('diajukan_at')->orderByDesc('id')->get()
                ->map(function ($p) {
                    $nomor = $p->nomor_pengajuan ?: sprintf('P1-2026-09-%03d', $p->id);
                    $tglDiajukan = $p->diajukan_at ?? $p->created_at ?? Carbon::now();
                    $tglUpdated = $p->updated_at ?? $tglDiajukan;
                    $statusTampil = $this->formatStatus($p->status);
                    $hariTertahan = max(0, (int) Carbon::parse($tglDiajukan)->diffInDays(Carbon::now()));

                    $riwayat = $p->riwayatStatus->map(function ($r) use ($p) {
                        $judul = match (strtolower($r->ke_status ?? '')) {
                            'diverifikasi' => 'Disetujui dan Diteruskan',
                            'dikembalikan' => 'Dikembalikan Verifikator',
                            'disetujui', 'selesai' => 'Disetujui UPT Remunerasi',
                            default => 'Diajukan Bendahara',
                        };

                        return [
                            'ke' => (int) ($p->pengajuan_ke ?: 1),
                            'judul' => $judul,
                            'waktu' => Carbon::parse($r->dicatat_at ?? $r->created_at)->translatedFormat('d F Y, H.i') . ' WIB',
                            'oleh' => ($r->pegawai?->nama ?? 'Sistem') . ' • ' . (str_contains(strtolower($judul), 'bendahara') ? 'Bendahara' : 'Verifikator'),
                            'catatan' => $r->catatan_alasan,
                            'selesai' => in_array(strtolower($r->ke_status ?? ''), ['diverifikasi', 'disetujui', 'selesai'], true),
                        ];
                    });

                    if ($riwayat->isEmpty()) {
                        $riwayat = collect([
                            [
                                'ke' => (int) ($p->pengajuan_ke ?: 1),
                                'judul' => 'Diajukan Bendahara',
                                'waktu' => Carbon::parse($tglDiajukan)->translatedFormat('d F Y, H.i') . ' WIB',
                                'oleh' => ($p->bendahara_nama ?? 'Bendahara') . ' • Bendahara',
                                'catatan' => null,
                                'selesai' => true,
                            ],
                        ]);
                    }

                    $sub = ((int) ($p->pengajuan_ke ?: 1)) > 1
                        ? "Pengajuan Ulang ke-{$p->pengajuan_ke}"
                        : 'Pengajuan ke-1';

                    return [
                        'id' => $nomor,
                        'raw_id' => $p->id,
                        'unit' => $p->unitKerja?->nama ?? 'Unit Kerja',
                        'unit_id' => $p->unit_id,
                        'periode' => $p->periode ?? 'Oktober 2026',
                        'jenis' => 'Pengajuan P1',
                        'status' => $statusTampil,
                        'status_raw' => $p->status,
                        'diperbarui' => Carbon::parse($tglUpdated)->translatedFormat('d F Y, H.i') . ' WIB',
                        'tertahan' => $hariTertahan > 0 ? $hariTertahan : null,
                        'sub' => $sub,
                        'riwayat' => $riwayat->values()->all(),
                    ];
                });
        }

        return response()->json([
            'status' => 'success',
            'tab' => $tab,
            'total' => $rows->count(),
            'data' => $rows->values()->all(),
        ]);
    }
}
