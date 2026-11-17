<?php

namespace App\Http\Controllers;

use App\Models\Akun;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Login user dan generate token
     */
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $akun = Akun::where('username', $request->username)
            ->where('aktif', true)
            ->first();

        if (!$akun || !Hash::check($request->password, $akun->password)) {
            throw ValidationException::withMessages([
                'username' => ['Username atau password salah.'],
            ]);
        }

        // Hapus token lama
        $akun->tokens()->delete();

        // Generate token baru dengan abilities gabungan dari seluruh peran yang dimiliki akun
        $roles = collect($akun->daftar_peran)->pluck('peran')->unique();
        $abilities = [];
        foreach ($roles as $role) {
            $abilities = array_merge($abilities, $this->getAbilitiesForRole((string) $role));
        }
        $abilities = array_values(array_unique($abilities));

        $token = $akun->createToken('auth-token', $abilities)->plainTextToken;

        $primaryUnit = $akun->roleUnits()->where('aktif', true)->whereNotNull('unit_id')->with('unitKerja')->first()?->unitKerja?->nama 
            ?? $akun->pegawai?->unitKerja?->nama;
        $namaLengkap = $akun->pegawai?->nama ?? $akun->username;

        return response()->json([
            'token' => $token,
            'akun' => [
                'id' => $akun->id,
                'username' => $akun->username,
                'email' => $akun->username . '@unand.ac.id', // Generate email
                'nama' => $namaLengkap,
                'unit_nama' => $primaryUnit,
                'peran' => is_object($akun->peran) ? $akun->peran->value : (string) $akun->peran,
                'NIP' => $akun->NIP,
                'daftar_peran' => $akun->daftar_peran,
                'pegawai_id' => $akun->pegawai_id,
            ],
            'abilities' => $abilities,
        ]);
    }

    /**
     * Logout user
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Berhasil logout',
        ]);
    }

    /**
     * Get authenticated user info
     */
    public function me(Request $request)
    {
        $akun = $request->user();
        $abilities = $akun->currentAccessToken()->abilities ?? [];

        $primaryUnit = $akun->roleUnits()->where('aktif', true)->whereNotNull('unit_id')->with('unitKerja')->first()?->unitKerja?->nama 
            ?? $akun->pegawai?->unitKerja?->nama;
        $namaLengkap = $akun->pegawai?->nama ?? $akun->username;

        return response()->json([
            'id' => $akun->id,
            'username' => $akun->username,
            'email' => $akun->username . '@unand.ac.id', // Generate email
            'nama' => $namaLengkap,
            'unit_nama' => $primaryUnit,
            'peran' => is_object($akun->peran) ? $akun->peran->value : (string) $akun->peran,
            'NIP' => $akun->NIP,
            'daftar_peran' => $akun->daftar_peran,
            'pegawai_id' => $akun->pegawai_id,
            'abilities' => $abilities,
        ]);
    }

    /**
     * Get abilities untuk setiap role
     * Format: resource:action (contoh: pengajuan:create, pengajuan:read, dll)
     */
    private function getAbilitiesForRole(string $peran): array
    {
        return match ($peran) {
            'pegawai' => [
                'pengajuan:create',
                'pengajuan:read-own',
                'pengajuan:update-own',
                'dokumen:upload-own',
                'profil:read-own',
                'profil:update-own',
            ],
            'kepegawaian' => [
                'pengajuan:read-all',
                'pengajuan:verify',
                'pengajuan:reject',
                'pegawai:read-all',
                'pegawai:create',
                'pegawai:update',
                'akun:create',
                'akun:update',
                'dokumen:read-all',
            ],
            'bendahara' => [
                'pengajuan:read-verified',
                'pengajuan:approve',
                'pengajuan:reject',
                'pembayaran:create',
                'pembayaran:read-all',
                'laporan:generate',
                'dokumen:read-all',
            ],
            'verifikator' => [
                'pengajuan:read-all',
                'pengajuan:verify',
                'pengajuan:reject',
                'pengajuan:request-revision',
                'dokumen:read-all',
                'dokumen:verify',
            ],
            'pj_unit' => [
                'pengajuan:read-unit',
                'pengajuan:approve-unit',
                'pengajuan:reject-unit',
                'pegawai:read-unit',
                'laporan:read-unit',
                'dokumen:read-unit',
            ],
            'upt_remunerasi' => [
                'pengajuan:read-all',
                'pengajuan:approve-final',
                'pengajuan:reject',
                'pembayaran:read-all',
                'pembayaran:process',
                'laporan:read-all',
                'laporan:generate',
                'dokumen:read-all',
                'pengaturan:manage',
            ],
            default => [],
        };
    }

    /**
     * Check if user has specific ability
     */
    public function checkAbility(Request $request, string $ability)
    {
        return response()->json([
            'has_ability' => $request->user()->tokenCan($ability),
        ]);
    }

    /**
     * Update password user yang sedang login
     */
    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6|confirmed',
        ], [
            'current_password.required' => 'Password lama wajib diisi',
            'new_password.required' => 'Password baru wajib diisi',
            'new_password.min' => 'Password baru minimal 6 karakter',
            'new_password.confirmed' => 'Konfirmasi password tidak cocok',
        ]);

        $akun = $request->user();

        // Verifikasi password lama
        if (!Hash::check($request->current_password, $akun->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Password lama tidak sesuai.'],
            ]);
        }

        // Update password
        $akun->password = Hash::make($request->new_password);
        $akun->save();

        return response()->json([
            'message' => 'Password berhasil diubah',
        ]);
    }
}
