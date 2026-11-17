<?php

namespace App\Models;

use App\Enums\Peran;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Akun extends Authenticatable
{
    use HasApiTokens;

    protected $table = 'akun';

    protected $fillable = [
        'NIP',
        'pegawai_id',
        'username',
        'password',
        'peran',
        'aktif',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'peran' => Peran::class,
            'aktif' => 'boolean',
        ];
    }

    /**
     * Relasi ke role_unit (daftar peran dan unit kerja yang dimiliki akun)
     */
    public function roleUnits(): HasMany
    {
        return $this->hasMany(RoleUnit::class, 'role_id');
    }

    /**
     * Cek apakah akun memiliki peran tertentu (baik dari kolom peran langsung maupun tabel role_unit)
     */
    public function hasRole(string $roleName): bool
    {
        $roleName = strtolower(trim($roleName));

        // Cek peran utama akun
        $currentPeran = is_object($this->peran) ? $this->peran->value : (string) $this->peran;
        if (strtolower($currentPeran) === $roleName) {
            return true;
        }

        // Jika memiliki NIP, otomatis juga merupakan pegawai
        if ($roleName === 'pegawai' && !empty($this->NIP)) {
            return true;
        }

        // Cek tabel role_unit
        return $this->roleUnits()->where('aktif', true)->where('peran', $roleName)->exists();
    }

    /**
     * Dapatkan semua peran aktif akun beserta unit kerjanya
     */
    public function getDaftarPeranAttribute(): array
    {
        $roles = [];

        // Peran default/utama
        $currentPeran = is_object($this->peran) ? $this->peran->value : (string) $this->peran;
        if (!empty($currentPeran)) {
            $roles[$currentPeran] = [
                'peran' => $currentPeran,
                'unit_id' => null,
                'unit_nama' => null,
            ];
        }

        // Jika ada NIP, selalu sertakan peran 'pegawai'
        if (!empty($this->NIP)) {
            $roles['pegawai'] = [
                'peran' => 'pegawai',
                'unit_id' => null,
                'unit_nama' => null,
            ];
        }

        // Ambil dari role_unit
        $assigned = $this->roleUnits()->with('unitKerja')->where('aktif', true)->get();
        foreach ($assigned as $ru) {
            $roles[$ru->peran . '_' . ($ru->unit_id ?? 'all')] = [
                'peran' => $ru->peran,
                'unit_id' => $ru->unit_id,
                'unit_nama' => $ru->unitKerja?->nama,
            ];
        }

        return array_values($roles);
    }

    /**
     * Relasi ke biodata Pegawai berdasarkan NIP
     */
    public function pegawai(): BelongsTo
    {
        return $this->belongsTo(Pegawai::class, 'NIP', 'NIP');
    }

    /**
     * Relasi many-to-many ke Unit Kerja (via role_unit)
     */
    public function unitKerja(): BelongsToMany
    {
        return $this->belongsToMany(UnitKerja::class, 'role_unit', 'role_id', 'unit_id');
    }

    /**
     * Notifikasi milik akun ini
     */
    public function notifikasi(): HasMany
    {
        return $this->hasMany(Notifikasi::class, 'akun_id');
    }

    /**
     * Dokumen pendukung yang diunggah akun ini
     */
    public function dokumenPendukung(): HasMany
    {
        return $this->hasMany(DokumenPendukung::class, 'akun_id');
    }

    /**
     * Usulan jabatan yang diajukan oleh/untuk akun ini
     */
    public function usulanJabatan(): HasMany
    {
        return $this->hasMany(UsulanJabatan::class, 'akun_id');
    }

    /**
     * Catatan hukuman disiplin terkait akun ini
     */
    public function hukumanDisiplin(): HasMany
    {
        return $this->hasMany(HukumanDisiplin::class, 'akun_id');
    }
}
