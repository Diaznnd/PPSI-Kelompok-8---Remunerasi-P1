<?php

namespace App\Http\Controllers\UptRemunerasi;

use App\Http\Controllers\Controller;
use App\Models\Akun;
use App\Models\AuditLog;
use App\Models\Pegawai;
use App\Models\RoleUnit;
use App\Models\UnitKerja;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ManajemenAkunController extends Controller
{
    protected function authorizeUpt(Request $request): void
    {
        $user = $request->user();
        if (!$user || !$user->hasRole('upt_remunerasi')) {
            abort(403, 'Akses ditolak: Anda tidak memiliki wewenang sebagai UPT Remunerasi.');
        }
    }

    /**
     * Daftar seluruh akun pengguna beserta penugasan peran dan unit kerjanya
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorizeUpt($request);

        $query = Akun::with(['roleUnits.unitKerja']);

        if ($request->filled('q')) {
            $q = $request->query('q');
            $query->where(function ($sub) use ($q) {
                $sub->where('username', 'like', "%{$q}%")
                    ->orWhere('NIP', 'like', "%{$q}%");
            });
        }

        $list = $query->orderBy('username')->get()->map(function ($acc) {
            // Pegawai info jika ada
            $pegawai = Pegawai::with('unitKerja')->where('NIP', $acc->NIP)->first();

            $peranUtama = is_object($acc->peran) ? $acc->peran->value : (string) $acc->peran;

            return [
                'id' => $acc->id,
                'username' => $acc->username,
                'NIP' => $acc->NIP,
                'nama' => $pegawai?->nama ?? $acc->username,
                'email' => $acc->username . '@unand.ac.id',
                'peran_utama' => $peranUtama,
                'unit_asal' => $pegawai?->unitKerja?->nama ?? '-',
                'unit_id' => $pegawai?->unit_id,
                'aktif' => $acc->aktif,
                'daftar_peran' => $acc->daftar_peran,
                'role_units' => $acc->roleUnits->map(fn ($ru) => [
                    'id' => $ru->id,
                    'peran' => $ru->peran,
                    'unit_id' => $ru->unit_id,
                    'unit_nama' => $ru->unitKerja?->nama ?? 'Universitas',
                    'aktif' => $ru->aktif,
                ]),
            ];
        });

        return response()->json([
            'total' => $list->count(),
            'data' => $list,
        ]);
    }

    /**
     * Buat akun baru atau tambah penugasan peran unit
     */
    public function store(Request $request): JsonResponse
    {
        $this->authorizeUpt($request);

        $validated = $request->validate([
            'username' => 'required|string|max:50|unique:akun,username',
            'NIP' => 'nullable|string|max:30',
            'password' => 'nullable|string|min:4',
            'peran' => 'required|string|max:50',
            'unit_id' => 'nullable|exists:unit_kerja,id',
            'roles' => 'nullable|array', // Multi-role assignments
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $user = $request->user();

            $akun = Akun::create([
                'username' => $validated['username'],
                'NIP' => $validated['NIP'] ?? null,
                'password' => Hash::make($validated['password'] ?? 'password'),
                'peran' => $validated['peran'],
                'aktif' => true,
            ]);

            // Buat penugasan peran unit utama
            RoleUnit::create([
                'role_id' => $akun->id,
                'unit_id' => $validated['unit_id'] ?? null,
                'peran' => $validated['peran'],
                'aktif' => true,
            ]);

            // Jika ada multi-roles tambahan
            if (!empty($validated['roles'])) {
                foreach ($validated['roles'] as $r) {
                    RoleUnit::firstOrCreate([
                        'role_id' => $akun->id,
                        'unit_id' => $r['unit_id'] ?? null,
                        'peran' => $r['peran'],
                    ], ['aktif' => true]);
                }
            }

            // Jika memiliki NIP, tambahkan peran pegawai otomatis
            if (!empty($validated['NIP'])) {
                $pegawai = Pegawai::where('NIP', $validated['NIP'])->first();
                RoleUnit::firstOrCreate([
                    'role_id' => $akun->id,
                    'unit_id' => $pegawai?->unit_id,
                    'peran' => 'pegawai',
                ], ['aktif' => true]);
            }

            // Audit log
            AuditLog::create([
                'NIP' => $user->NIP,
                'aksi' => 'Pembuatan Akun Pengguna',
                'objek_type' => 'Akun',
                'objek_id' => $akun->id,
                'nilai_sesudah' => ['username' => $akun->username, 'peran' => $validated['peran']],
                'alasan' => 'Registrasi akun pengguna baru dan penugasan RBAC oleh UPT',
                'dicatat_at' => Carbon::now(),
            ]);

            return response()->json([
                'message' => 'Akun pengguna berhasil dibuat.',
                'akun' => $akun,
            ], 201);
        });
    }

    /**
     * Perbarui penugasan peran dan unit kerja akun
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $this->authorizeUpt($request);

        $akun = Akun::findOrFail($id);

        $validated = $request->validate([
            'peran' => 'nullable|string|max:50',
            'unit_id' => 'nullable|exists:unit_kerja,id',
            'roles' => 'nullable|array',
        ]);

        return DB::transaction(function () use ($akun, $validated, $request) {
            $user = $request->user();

            if (!empty($validated['peran'])) {
                $akun->peran = $validated['peran'];
                $akun->save();
            }

            // Jika diberikan array roles baru, sinkronkan
            if (isset($validated['roles'])) {
                // Nonaktifkan yang lama lalu pasang yang baru
                RoleUnit::where('role_id', $akun->id)->delete();

                foreach ($validated['roles'] as $r) {
                    RoleUnit::create([
                        'role_id' => $akun->id,
                        'unit_id' => $r['unit_id'] ?? null,
                        'peran' => $r['peran'],
                        'aktif' => true,
                    ]);
                }

                // Tetap pastikan peran pegawai terpasang jika ada NIP
                if ($akun->NIP) {
                    $peg = Pegawai::where('NIP', $akun->NIP)->first();
                    RoleUnit::firstOrCreate([
                        'role_id' => $akun->id,
                        'unit_id' => $peg?->unit_id,
                        'peran' => 'pegawai',
                    ], ['aktif' => true]);
                }
            }

            // Audit log
            AuditLog::create([
                'NIP' => $user->NIP,
                'aksi' => 'Perubahan Hak Akses / Multi-Role Akun',
                'objek_type' => 'Akun',
                'objek_id' => $akun->id,
                'alasan' => 'Pembaruan penugasan peran dan isolasi unit kerja oleh UPT',
                'dicatat_at' => Carbon::now(),
            ]);

            return response()->json([
                'message' => 'Penugasan peran dan hak akses akun berhasil diperbarui.',
                'akun' => $akun->fresh(['roleUnits.unitKerja']),
            ]);
        });
    }

    /**
     * Aktif / Nonaktifkan status akun
     */
    public function toggleStatus(Request $request, string $id): JsonResponse
    {
        $this->authorizeUpt($request);

        $akun = Akun::findOrFail($id);
        $akun->aktif = !$akun->aktif;
        $akun->save();

        return response()->json([
            'message' => 'Status akun ' . $akun->username . ' berhasil diubah.',
            'aktif' => $akun->aktif,
        ]);
    }

    /**
     * Reset password akun
     */
    public function resetPassword(Request $request, string $id): JsonResponse
    {
        $this->authorizeUpt($request);

        $akun = Akun::findOrFail($id);
        $newPass = $request->input('password', 'password');
        $akun->password = Hash::make($newPass);
        $akun->save();

        return response()->json([
            'message' => 'Kata sandi untuk akun ' . $akun->username . ' berhasil direset.',
        ]);
    }
}
