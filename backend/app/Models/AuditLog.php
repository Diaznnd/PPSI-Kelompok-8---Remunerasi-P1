<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends Model
{
    use HasFactory;

    protected $table = 'audit_log';

    protected $fillable = [
        'NIP',
        'unit_id',
        'aksi',
        'objek_type',
        'objek_id',
        'nilai_sebelum',
        'nilai_sesudah',
        'alasan',
        'dicatat_at',
    ];

    protected function casts(): array
    {
        return [
            'nilai_sebelum' => 'array',
            'nilai_sesudah' => 'array',
            'dicatat_at' => 'datetime',
        ];
    }

    public function pegawai(): BelongsTo
    {
        return $this->belongsTo(Pegawai::class, 'NIP', 'NIP');
    }

    public function unitKerja(): BelongsTo
    {
        return $this->belongsTo(UnitKerja::class, 'unit_id');
    }
}
