<?php

namespace App\Http\Controllers\Verifikator;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\RoleUnit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class AuditLogVerifikatorController extends Controller
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
     * FR-26: Melihat log jejak audit verifikasi pengajuan (Read-Only)
     * Verifikator tidak dapat melihat log pengajuan dari unit di luar tanggung jawabnya.
     */
    public function index(Request $request): JsonResponse
    {
        $unitId = $this->getVerifikatorUnitId($request);

        $query = AuditLog::with(['pegawai.unitKerja', 'unitKerja']);

        // Isolasi unit: Verifikator yang ditugaskan di unit tertentu hanya melihat log unitnya
        if ($unitId) {
            $query->where('unit_id', $unitId);
        } else {
            // Verifikator universitas melihat seluruh log terkait verifikasi pengajuan P1, usulan jabatan, dan remunerasi
            $query->where(function ($q) {
                $q->whereIn('objek_type', ['PengajuanP1', 'UsulanJabatan', 'HasilPerhitungan'])
                    ->orWhere('aksi', 'like', '%pengajuan%')
                    ->orWhere('aksi', 'like', '%jabatan%')
                    ->orWhere('aksi', 'like', '%verifik%');
            });
        }

        // Filter rentang tanggal
        if ($request->filled('dari')) {
            $query->whereDate('dicatat_at', '>=', $request->query('dari'));
        }
        if ($request->filled('sampai')) {
            $query->whereDate('dicatat_at', '<=', $request->query('sampai'));
        }

        // Filter jenis aksi
        if ($request->filled('aksi') && $request->query('aksi') !== 'semua') {
            $query->where('aksi', $request->query('aksi'));
        }

        // Filter peran pelaku
        if ($request->filled('peran') && $request->query('peran') !== 'semua') {
            $peranQuery = strtolower($request->query('peran'));
            $query->whereHas('pegawai.akun', function ($sub) use ($peranQuery) {
                $sub->where('peran', $peranQuery);
            });
        }

        // Filter pencarian teks (q)
        if ($request->filled('q')) {
            $q = $request->query('q');
            $query->where(function ($sub) use ($q) {
                $sub->where('aksi', 'like', "%{$q}%")
                    ->orWhere('alasan', 'like', "%{$q}%")
                    ->orWhere('objek_id', 'like', "%{$q}%")
                    ->orWhereHas('pegawai', fn ($p) => $p->where('nama', 'like', "%{$q}%")->orWhere('NIP', 'like', "%{$q}%"));
            });
        }

        $logs = $query->orderByDesc('dicatat_at')->orderByDesc('id')->get()
            ->map(function ($log) {
                $tgl = $log->dicatat_at ?? $log->created_at ?? Carbon::now();
                $pegawai = $log->pegawai;
                $pelakuNama = $pegawai?->nama ?? $log->NIP ?? 'Sistem Verifikasi';

                // Tentukan peran pelaku
                $peranPelaku = match (true) {
                    str_contains(strtolower($log->aksi), 'verifik') || str_contains(strtolower($log->aksi), 'menyetujui') || str_contains(strtolower($log->aksi), 'mengembalikan') => 'Verifikator',
                    str_contains(strtolower($log->aksi), 'bendahara') || str_contains(strtolower($log->aksi), 'hitung') => 'Bendahara',
                    str_contains(strtolower($log->aksi), 'kepegawaian') || str_contains(strtolower($log->aksi), 'usulan') => 'Bidang Kepegawaian',
                    str_contains(strtolower($log->aksi), 'upt') || str_contains(strtolower($log->aksi), 'tetapkan') => 'UPT Remunerasi',
                    default => 'Verifikator',
                };

                $objekLabel = match ($log->objek_type) {
                    'PengajuanP1' => "Pengajuan #{$log->objek_id}",
                    'UsulanJabatan' => "Usulan Jabatan #{$log->objek_id}",
                    'HasilPerhitungan' => "Hasil P1 #{$log->objek_id}",
                    default => "{$log->objek_type} #{$log->objek_id}",
                };

                $sebelum = is_array($log->nilai_sebelum) ? $log->nilai_sebelum : json_decode($log->nilai_sebelum ?? '[]', true);
                $sesudah = is_array($log->nilai_sesudah) ? $log->nilai_sesudah : json_decode($log->nilai_sesudah ?? '[]', true);

                $judulAksi = match (strtolower($log->aksi)) {
                    'menyetujui pengajuan' => 'Persetujuan Pengajuan P1',
                    'mengembalikan pengajuan' => 'Pengembalian Pengajuan P1',
                    'menyetujui usulan jabatan' => 'Persetujuan Usulan Jabatan',
                    'mengembalikan usulan jabatan' => 'Pengembalian Usulan Jabatan',
                    default => $log->aksi,
                };

                return [
                    'id' => (string) $log->id,
                    'tanggal' => Carbon::parse($tgl)->format('Y-m-d'),
                    'waktu' => Carbon::parse($tgl)->translatedFormat('d F Y, H.i'),
                    'pelaku' => $pelakuNama,
                    'peran' => $peranPelaku,
                    'aksi' => $log->aksi,
                    'objek' => $objekLabel,
                    'judul' => $judulAksi,
                    'sebelum' => [
                        'judul' => 'Status: ' . ($sebelum['status'] ?? 'Diajukan'),
                        'ket' => isset($sebelum['pengajuan_ke']) ? "Pengajuan ke-{$sebelum['pengajuan_ke']}" : 'Status awal',
                    ],
                    'sesudah' => [
                        'judul' => 'Status: ' . ($sesudah['status'] ?? 'Diverifikasi'),
                        'ket' => $sesudah['tujuan'] ?? ($sesudah['penerima'] ?? 'Diproses ke tahap berikutnya'),
                    ],
                    'alasan' => $log->alasan ?? '-',
                ];
            });

        return response()->json([
            'status' => 'success',
            'total' => $logs->count(),
            'data' => $logs->values()->all(),
        ]);
    }
}
