<?php

namespace App\Http\Controllers\UptRemunerasi;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Grade;
use App\Models\Jabatan;
use App\Models\ParameterRemunerasi;
use App\Models\TarifPajak;
use App\Models\UnitKerja;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class MasterDataController extends Controller
{
    protected function authorizeUpt(Request $request): void
    {
        $user = $request->user();
        if (!$user || !$user->hasRole('upt_remunerasi')) {
            abort(403, 'Akses ditolak: Anda tidak memiliki wewenang sebagai UPT Remunerasi.');
        }
    }

    // ==========================================
    // 1. MASTER UNIT KERJA
    // ==========================================
    public function listUnits(Request $request): JsonResponse
    {
        $this->authorizeUpt($request);

        $units = UnitKerja::withCount(['pengajuanP1'])->get()->map(fn ($u) => [
            'id' => $u->id,
            'nama' => $u->nama,
            'jenis' => $u->jenis,
            'aktif' => $u->aktif,
            'jumlah_pengajuan' => $u->pengajuan_p1_count,
        ]);

        return response()->json(['data' => $units]);
    }

    public function storeUnit(Request $request): JsonResponse
    {
        $this->authorizeUpt($request);

        $validated = $request->validate([
            'nama' => 'required|string|max:150|unique:unit_kerja,nama',
            'jenis' => 'required|string|max:50',
            'aktif' => 'boolean',
        ]);

        $unit = UnitKerja::create($validated);

        return response()->json(['message' => 'Unit kerja berhasil ditambahkan.', 'data' => $unit], 201);
    }

    public function updateUnit(Request $request, string $id): JsonResponse
    {
        $this->authorizeUpt($request);

        $unit = UnitKerja::findOrFail($id);
        $validated = $request->validate([
            'nama' => 'required|string|max:150|unique:unit_kerja,nama,' . $unit->id,
            'jenis' => 'required|string|max:50',
            'aktif' => 'boolean',
        ]);

        $unit->update($validated);

        return response()->json(['message' => 'Unit kerja berhasil diperbarui.', 'data' => $unit]);
    }

    public function toggleUnitStatus(Request $request, string $id): JsonResponse
    {
        $this->authorizeUpt($request);

        $unit = UnitKerja::findOrFail($id);
        $unit->aktif = !$unit->aktif;
        $unit->save();

        return response()->json([
            'message' => 'Status unit kerja berhasil diubah.',
            'aktif' => $unit->aktif,
        ]);
    }

    // ==========================================
    // 2. MASTER GRADE & JABATAN
    // ==========================================
    public function listGrades(Request $request): JsonResponse
    {
        $this->authorizeUpt($request);

        $grades = Grade::with('jabatan')->orderBy('kode_grade')->get()->map(fn ($g) => [
            'id' => $g->id,
            'kode_grade' => $g->kode_grade,
            'nilai' => (float) $g->nilai,
            'daftar_jabatan' => $g->jabatan->pluck('nama_jabatan'),
        ]);

        return response()->json(['data' => $grades]);
    }

    public function updateGrade(Request $request, string $id): JsonResponse
    {
        $this->authorizeUpt($request);

        $grade = Grade::findOrFail($id);
        $validated = $request->validate([
            'nilai' => 'required|numeric|min:0',
        ]);

        $nilaiLama = $grade->nilai;
        $grade->nilai = $validated['nilai'];
        $grade->save();

        // Audit log
        AuditLog::create([
            'NIP' => $request->user()->NIP,
            'aksi' => 'Perubahan Nilai Grade',
            'objek_type' => 'Grade',
            'objek_id' => $grade->id,
            'nilai_sebelum' => ['nilai' => $nilaiLama],
            'nilai_sesudah' => ['nilai' => $grade->nilai],
            'alasan' => 'Penyesuaian nilai remunerasi grade oleh UPT',
            'dicatat_at' => Carbon::now(),
        ]);

        return response()->json(['message' => 'Nilai grade berhasil diperbarui.', 'data' => $grade]);
    }

    // ==========================================
    // 3. PARAMETER REMUNERASI
    // ==========================================
    public function listParameters(Request $request): JsonResponse
    {
        $this->authorizeUpt($request);

        $params = ParameterRemunerasi::all()->map(fn ($p) => [
            'id' => $p->id,
            'kode' => $p->kode,
            'kategori' => $p->kategori,
            'nilai' => (float) $p->nilai,
            'berlaku_mulai' => $p->berlaku_mulai?->format('Y-m-d'),
        ]);

        return response()->json(['data' => $params]);
    }

    public function updateParameter(Request $request, string $id): JsonResponse
    {
        $this->authorizeUpt($request);

        $param = ParameterRemunerasi::findOrFail($id);
        $validated = $request->validate([
            'nilai' => 'required|numeric',
        ]);

        $nilaiLama = $param->nilai;
        $param->nilai = $validated['nilai'];
        $param->save();

        // Audit log
        AuditLog::create([
            'NIP' => $request->user()->NIP,
            'aksi' => 'Perubahan Parameter Remunerasi',
            'objek_type' => 'ParameterRemunerasi',
            'objek_id' => $param->id,
            'nilai_sebelum' => ['kode' => $param->kode, 'nilai' => $nilaiLama],
            'nilai_sesudah' => ['kode' => $param->kode, 'nilai' => $param->nilai],
            'alasan' => 'Pembaruan konstanta remunerasi resmi universitas',
            'dicatat_at' => Carbon::now(),
        ]);

        return response()->json(['message' => 'Parameter remunerasi berhasil diperbarui.', 'data' => $param]);
    }

    // ==========================================
    // 4. TARIF PAJAK (TER - Tarif Efektif Rata-rata)
    // ==========================================
    public function listTarifPajak(Request $request): JsonResponse
    {
        $this->authorizeUpt($request);

        // Get currently active tax rates
        $tarifPajak = TarifPajak::whereNull('berlaku_sampai')
            ->orWhere('berlaku_sampai', '>=', now())
            ->orderBy('kategori_ter')
            ->orderBy('bruto_min')
            ->get()
            ->map(fn ($t) => [
                'id' => $t->id,
                'kategori' => $t->kategori_ter,
                'brutoMin' => (int) $t->bruto_min,
                'brutoMax' => (int) $t->bruto_max,
                'tarif' => $t->tarif,
                'tarifDecimal' => (float) $t->tarif_decimal,
            ]);

        return response()->json(['data' => $tarifPajak]);
    }
}
