<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PresensiReport extends Model
{
    use HasFactory;

    protected $table = 'presensi_report';

    protected $fillable = [
        'unit_id',
        'NIP',
        'nama_file',
        'masa_file',
        'file_hash',
        'status',
        'jumlah_valid',
        'jumlah_gagal',
        'baris_gagal',
        'durasi',
        'dimpor_at',
        'periode',
    ];

    protected function casts(): array
    {
        return [
            'baris_gagal' => 'array',
            'dimpor_at' => 'datetime',
            'jumlah_valid' => 'integer',
            'jumlah_gagal' => 'integer',
        ];
    }

    public function unitKerja(): BelongsTo
    {
        return $this->belongsTo(UnitKerja::class, 'unit_id');
    }

    public function pegawai(): BelongsTo
    {
        return $this->belongsTo(Pegawai::class, 'NIP', 'NIP');
    }

    public function presensiBulanan(): HasMany
    {
        return $this->hasMany(PresensiBulanan::class, 'presensi_report_id');
    }
}
