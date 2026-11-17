<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PengajuanP1 extends Model
{
    use HasFactory;

    protected $table = 'pengajuan_p1';

    protected $fillable = [
        'unit_id',
        'nomor_pengajuan',
        'pengajuan_ke',
        'status',
        'total_remunerasi',
        'total_pengurangan',
        'total_bruto',
        'psk_nama',
        'psk_nip',
        'bendahara_nama',
        'bendahara_nip',
        'diajukan_at',
        'periode',
    ];

    protected function casts(): array
    {
        return [
            'diajukan_at' => 'datetime',
            'total_remunerasi' => 'decimal:2',
            'total_pengurangan' => 'decimal:2',
            'total_bruto' => 'decimal:2',
        ];
    }

    public function unitKerja(): BelongsTo
    {
        return $this->belongsTo(UnitKerja::class, 'unit_id');
    }

    public function hasilPerhitungan(): HasMany
    {
        return $this->hasMany(HasilPerhitungan::class, 'pengajuan_id');
    }

    public function riwayatStatus(): HasMany
    {
        return $this->hasMany(RiwayatStatus::class, 'pengajuan_id');
    }

    public function amprah(): HasMany
    {
        return $this->hasMany(Amprah::class, 'pengajuan_id');
    }
}
