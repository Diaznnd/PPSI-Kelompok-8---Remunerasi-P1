<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pengaduan extends Model
{
    use HasFactory;

    protected $table = 'pengaduan';

    protected $fillable = [
        'NIP',
        'unit_id',
        'hasil_id',
        'kategori',
        'judul',
        'uraian',
        'lampiran_path',
        'tingkat',
        'status',
        'diajukan_at',
        'diselesaikan_at',
        'periode',
    ];

    protected function casts(): array
    {
        return [
            'diajukan_at' => 'datetime',
            'diselesaikan_at' => 'datetime',
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

    public function hasilPerhitungan(): BelongsTo
    {
        return $this->belongsTo(HasilPerhitungan::class, 'hasil_id');
    }

    public function tanggapan(): HasMany
    {
        return $this->hasMany(TanggapanPengaduan::class, 'pengaduan_id')->orderBy('dikirim_at', 'asc');
    }
}
