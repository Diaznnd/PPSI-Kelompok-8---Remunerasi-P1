<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HukumanDisiplin extends Model
{
    use HasFactory;

    protected $table = 'hukuman_disiplin';

    protected $fillable = [
        'NIP',
        'akun_id',
        'tingkat',
        'jenis',
        'nomor_sk',
        'tanggal_mulai',
        'tanggal_berakhir',
        'uraian',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_mulai' => 'date',
            'tanggal_berakhir' => 'date',
        ];
    }

    public function pegawai(): BelongsTo
    {
        return $this->belongsTo(Pegawai::class, 'NIP', 'NIP');
    }

    public function akun(): BelongsTo
    {
        return $this->belongsTo(Akun::class, 'akun_id');
    }
}
