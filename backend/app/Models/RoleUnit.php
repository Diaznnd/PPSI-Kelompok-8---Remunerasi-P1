<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RoleUnit extends Model
{
    use HasFactory;

    protected $table = 'role_unit';

    protected $fillable = [
        'role_id',
        'unit_id',
        'peran',
        'aktif',
    ];

    protected function casts(): array
    {
        return [
            'aktif' => 'boolean',
        ];
    }

    /**
     * Relasi ke Akun pengguna
     */
    public function akun(): BelongsTo
    {
        return $this->belongsTo(Akun::class, 'role_id');
    }

    /**
     * Relasi ke Unit Kerja
     */
    public function unitKerja(): BelongsTo
    {
        return $this->belongsTo(UnitKerja::class, 'unit_id');
    }
}
