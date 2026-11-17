<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RiwayatStatus extends Model
{
    use HasFactory;

    protected $table = 'riwayat_status';

    protected $fillable = [
        'pengajuan_id',
        'NIP',
        'dari_status',
        'ke_status',
        'catatan_alasan',
        'dicatat_at',
    ];

    protected function casts(): array
    {
        return [
            'dicatat_at' => 'datetime',
        ];
    }

    public function pengajuanP1(): BelongsTo
    {
        return $this->belongsTo(PengajuanP1::class, 'pengajuan_id');
    }

    public function pegawai(): BelongsTo
    {
        return $this->belongsTo(Pegawai::class, 'NIP', 'NIP');
    }
}
