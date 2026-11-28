<?php

namespace App\Http\Controllers\PenanggungJawab;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Pegawai;
use App\Models\PresensiReport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ApprovalPresensiController extends Controller
{
    /**
     * Get list of attendance reports waiting for approval by this unit head
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user() ?: Auth::user();
        $pegawai = Pegawai::where('NIP', $user->NIP)->first();

        if (!$pegawai) {
            return response()->json(['message' => 'Data pegawai tidak ditemukan'], 404);
        }

        // Get unit where this pegawai is penanggung jawab
        $unitId = $pegawai->unit_id;

        if (!$unitId) {
            return response()->json(['message' => 'Anda belum ditugaskan sebagai penanggung jawab unit'], 403);
        }

        $query = PresensiReport::with(['unitKerja', 'pegawai', 'approver'])
            ->where('unit_id', $unitId)
            ->where('status', 'valid');

        // Filter by approval status
        if ($request->has('status_approval')) {
            $query->where('status_approval', $request->status_approval);
        } else {
            // Default: show only waiting for approval
            $query->where('status_approval', 'menunggu_approval');
        }

        // Filter by period
        if ($request->has('periode')) {
            $query->where('periode', $request->periode);
        }

        $reports = $query->orderBy('dimpor_at', 'desc')->get();

        $data = $reports->map(fn($r) => [
            'id' => $r->id,
            'periode' => $r->periode,
            'masa_file' => $r->masa_file,
            'unit' => [
                'id' => $r->unitKerja?->id ?? 0,
                'kode' => 'UNIT-' . ($r->unitKerja?->id ?? 0),
                'nama' => $r->unitKerja?->nama ?? '-',
            ],
            'uploader' => [
                'nip' => $r->NIP,
                'nama' => $r->pegawai?->nama ?? '-',
            ],
            'status' => $r->status,
            'status_approval' => $r->status_approval,
            'jumlah_valid' => $r->jumlah_valid,
            'jumlah_gagal' => $r->jumlah_gagal,
            'dimpor_at' => $r->dimpor_at?->format('Y-m-d H:i:s'),
            'approved_by' => $r->approver ? [
                'nip' => $r->approved_by_nip,
                'nama' => $r->approver->nama,
            ] : null,
            'approved_at' => $r->approved_at?->format('Y-m-d H:i:s'),
            'catatan_approval' => $r->catatan_approval,
            'alasan_penolakan' => $r->alasan_penolakan,
            'can_be_approved' => $r->canBeApproved(),
        ]);

        return response()->json(['data' => $data]);
    }

    /**
     * Get detail of a specific attendance report
     */
    public function show(Request $request, $id): JsonResponse
    {
        $user = $request->user() ?: Auth::user();
        $pegawai = Pegawai::where('NIP', $user->NIP)->first();

        if (!$pegawai) {
            return response()->json(['message' => 'Data pegawai tidak ditemukan'], 404);
        }

        $report = PresensiReport::with(['unitKerja', 'pegawai', 'approver', 'presensiBulanan.pegawai'])
            ->findOrFail($id);

        // Check if user is penanggung jawab of this unit
        if ($report->unit_id !== $pegawai->unit_id) {
            return response()->json(['message' => 'Anda tidak berwenang melihat laporan ini'], 403);
        }

        $data = [
            'id' => $report->id,
            'periode' => $report->periode,
            'masa_file' => $report->masa_file,
            'unit' => [
                'id' => $report->unitKerja?->id ?? 0,
                'kode' => 'UNIT-' . ($report->unitKerja?->id ?? 0),
                'nama' => $report->unitKerja?->nama ?? '-',
            ],
            'uploader' => [
                'nip' => $report->NIP,
                'nama' => $report->pegawai?->nama ?? '-',
            ],
            'status' => $report->status,
            'status_approval' => $report->status_approval,
            'jumlah_valid' => $report->jumlah_valid,
            'jumlah_gagal' => $report->jumlah_gagal,
            'baris_gagal' => $report->baris_gagal,
            'dimpor_at' => $report->dimpor_at?->format('Y-m-d H:i:s'),
            'approved_by' => $report->approver ? [
                'nip' => $report->approved_by_nip,
                'nama' => $report->approver->nama,
            ] : null,
            'approved_at' => $report->approved_at?->format('Y-m-d H:i:s'),
            'catatan_approval' => $report->catatan_approval,
            'alasan_penolakan' => $report->alasan_penolakan,
            'can_be_approved' => $report->canBeApproved(),
            'detail_presensi' => $report->presensiBulanan->map(function ($p) {
                $cutiTotal = (float)(($p->cuti_bersalin_1_2 ?? 0) + ($p->cuti_bersalin_3 ?? 0) + ($p->cuti_bersalin_4_plus ?? 0) + ($p->cuti_alasan_penting ?? 0) + ($p->cuti_besar ?? 0) + ($p->cuti_tahunan ?? 0));
                $terlambatHari = (float)(($p->s1 ?? 0) + ($p->s2 ?? 0) + ($p->s3 ?? 0) + ($p->s4 ?? 0) + ($p->s5 ?? 0) + ($p->s6 ?? 0));
                $pulangCepatHari = (float)(($p->pw1 ?? 0) + ($p->pw2 ?? 0) + ($p->pw3 ?? 0) + ($p->pw4 ?? 0) + ($p->pw5 ?? 0) + ($p->pw6 ?? 0));

                return [
                    'nip' => $p->NIP,
                    'nama' => $p->pegawai?->nama ?? '-',
                    'hadir' => (float)($p->hadir ?? 0),
                    'sakit' => (float)($p->cuti_sakit ?? 0),
                    'izin' => (float)($p->izin ?? 0),
                    'cuti' => $cutiTotal,
                    'alfa' => (float)($p->alfa ?? 0),
                    'dinas_luar' => (float)($p->tugas_kedinasan ?? 0),
                    'terlambat' => $terlambatHari,
                    'pulang_cepat' => $pulangCepatHari,
                    'lembur' => 0,
                ];
            }),
        ];

        return response()->json(['data' => $data]);
    }

    /**
     * Approve attendance report
     */
    public function approve(Request $request, $id): JsonResponse
    {
        $request->validate([
            'catatan' => 'nullable|string|max:500',
        ]);

        $user = $request->user() ?: Auth::user();
        $pegawai = Pegawai::where('NIP', $user->NIP)->first();

        if (!$pegawai) {
            return response()->json(['message' => 'Data pegawai tidak ditemukan'], 404);
        }

        $report = PresensiReport::findOrFail($id);

        // Check if user is penanggung jawab of this unit
        if ($report->unit_id !== $pegawai->unit_id) {
            return response()->json(['message' => 'Anda tidak berwenang menyetujui laporan ini'], 403);
        }

        // Check if can be approved
        if (!$report->canBeApproved()) {
            return response()->json([
                'message' => 'Laporan ini tidak dapat disetujui. Status saat ini: ' . $report->status_approval
            ], 400);
        }

        DB::beginTransaction();
        try {
            $report->update([
                'status_approval' => 'disetujui',
                'approved_by_nip' => $pegawai->NIP,
                'approved_at' => now(),
                'catatan_approval' => $request->catatan,
                'siap_perhitungan' => true,
            ]);

            // Log audit
            AuditLog::create([
                'NIP' => $pegawai->NIP,
                'unit_id' => $pegawai->unit_id,
                'aksi' => 'Menyetujui Rekap Absensi',
                'objek_type' => 'PresensiReport',
                'objek_id' => (string) $report->id,
                'nilai_sebelum' => ['status_approval' => 'menunggu_approval'],
                'nilai_sesudah' => ['status_approval' => 'disetujui'],
                'alasan' => $request->catatan ?? 'Rekap absensi disetujui oleh Penanggung Jawab Unit',
                'dicatat_at' => now(),
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Rekap absensi berhasil disetujui. Bendahara kini dapat melakukan perhitungan.',
                'data' => [
                    'id' => $report->id,
                    'status_approval' => $report->status_approval,
                    'approved_at' => $report->approved_at->format('Y-m-d H:i:s'),
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal menyetujui laporan: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Reject attendance report
     */
    public function reject(Request $request, $id): JsonResponse
    {
        $request->validate([
            'alasan' => 'required|string|max:500',
        ]);

        $user = $request->user() ?: Auth::user();
        $pegawai = Pegawai::where('NIP', $user->NIP)->first();

        if (!$pegawai) {
            return response()->json(['message' => 'Data pegawai tidak ditemukan'], 404);
        }

        $report = PresensiReport::findOrFail($id);

        // Check if user is penanggung jawab of this unit
        if ($report->unit_id !== $pegawai->unit_id) {
            return response()->json(['message' => 'Anda tidak berwenang menolak laporan ini'], 403);
        }

        // Check if can be rejected
        if (!$report->canBeApproved()) {
            return response()->json([
                'message' => 'Laporan ini tidak dapat ditolak. Status saat ini: ' . $report->status_approval
            ], 400);
        }

        DB::beginTransaction();
        try {
            $report->update([
                'status_approval' => 'ditolak',
                'approved_by_nip' => $pegawai->NIP,
                'approved_at' => now(),
                'alasan_penolakan' => $request->alasan,
                'siap_perhitungan' => false,
            ]);

            // Log audit
            AuditLog::create([
                'NIP' => $pegawai->NIP,
                'unit_id' => $pegawai->unit_id,
                'aksi' => 'Menolak Rekap Absensi',
                'objek_type' => 'PresensiReport',
                'objek_id' => (string) $report->id,
                'nilai_sebelum' => ['status_approval' => 'menunggu_approval'],
                'nilai_sesudah' => ['status_approval' => 'ditolak'],
                'alasan' => $request->alasan,
                'dicatat_at' => now(),
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Rekap absensi ditolak. Kepegawaian perlu memperbaiki dan mengunggah ulang.',
                'data' => [
                    'id' => $report->id,
                    'status_approval' => $report->status_approval,
                    'alasan_penolakan' => $report->alasan_penolakan,
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal menolak laporan: ' . $e->getMessage()], 500);
        }
    }
}
