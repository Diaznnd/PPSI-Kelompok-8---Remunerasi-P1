<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TanggapanPengaduan extends Model
{
    use HasFactory;

    protected $table = 'tanggapan_pengaduan';

    protected $fillable = [
        'pengaduan_id',
        'NIP',
        'tipe',
        'isi',
        'lampiran_path',
        'dikirim_at',
    ];

    protected function casts(): array
    {
        return [
            'dikirim_at' => 'datetime',
        ];
    }

    public function pengaduan(): BelongsTo
    {
        return $this->belongsTo(Pengaduan::class, 'pengaduan_id');
    }

    public function pegawai(): BelongsTo
    {
        return $this->belongsTo(Pegawai::class, 'NIP', 'NIP');
    }
}
