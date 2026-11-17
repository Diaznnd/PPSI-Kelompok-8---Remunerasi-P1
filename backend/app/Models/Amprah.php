<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Amprah extends Model
{
    use HasFactory;

    protected $table = 'amprah';

    protected $fillable = [
        'hasil_id',
        'pengajuan_id',
        'nomor_amprah',
        'kelompok',
        'status',
        'total_remunerasi',
        'total_pengurangan',
        'total_pajak',
        'total_lkb_pajak',
        'total_netto',
        'total_bruto',
        'psk_nama',
        'psk_nip',
        'bendahara_nama',
        'bendahara_nip',
        'jumlah_pegawai',
        'tanggal_terbit',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_terbit' => 'date',
            'total_remunerasi' => 'decimal:2',
            'total_pengurangan' => 'decimal:2',
            'total_pajak' => 'decimal:2',
            'total_lkb_pajak' => 'decimal:2',
            'total_netto' => 'decimal:2',
            'total_bruto' => 'decimal:2',
        ];
    }

    public function hasilPerhitungan(): BelongsTo
    {
        return $this->belongsTo(HasilPerhitungan::class, 'hasil_id');
    }

    public function pengajuanP1(): BelongsTo
    {
        return $this->belongsTo(PengajuanP1::class, 'pengajuan_id');
    }
}
