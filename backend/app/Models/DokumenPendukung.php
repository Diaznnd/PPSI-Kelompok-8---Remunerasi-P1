<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DokumenPendukung extends Model
{
    use HasFactory;

    protected $table = 'dokumen_pendukung';

    protected $fillable = [
        'akun_id',
        'nomor_dokumen',
        'tanggal_dokumen',
        'file_path',
        'jenis',
        'diunggah_at',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_dokumen' => 'date',
            'diunggah_at' => 'datetime',
        ];
    }

    public function akun(): BelongsTo
    {
        return $this->belongsTo(Akun::class, 'akun_id');
    }
}
