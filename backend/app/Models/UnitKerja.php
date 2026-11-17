<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class UnitKerja extends Model
{
    use HasFactory;

    protected $table = 'unit_kerja';

    protected $fillable = [
        'nama',
        'jenis',
        'aktif',
    ];

    protected function casts(): array
    {
        return [
            'aktif' => 'boolean',
        ];
    }

    public function akuns(): BelongsToMany
    {
        return $this->belongsToMany(Akun::class, 'role_unit', 'unit_id', 'role_id');
    }

    public function pengajuanP1(): HasMany
    {
        return $this->hasMany(PengajuanP1::class, 'unit_id');
    }

    public function usulanJabatan(): HasMany
    {
        return $this->hasMany(UsulanJabatan::class, 'unit_id');
    }

    public function pengaduan(): HasMany
    {
        return $this->hasMany(Pengaduan::class, 'unit_id');
    }
}
