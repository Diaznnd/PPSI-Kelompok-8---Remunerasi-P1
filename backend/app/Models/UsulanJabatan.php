<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UsulanJabatan extends Model
{
    use HasFactory;

    protected $table = 'usulan_jabatan';

    protected $fillable = [
        'dokumen_id',
        'akun_id',
        'NIP',
        'unit_id',
        'jabatan_id',
        'nomor_urutan',
        'tanggal_berlaku',
        'status',
        'catatan_verifikator',
        'jenis_perubahan',
        'diajukan_at',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_berlaku' => 'date',
            'diajukan_at' => 'datetime',
        ];
    }

    public function dokumen(): BelongsTo
    {
        return $this->belongsTo(DokumenPendukung::class, 'dokumen_id');
    }

    public function akun(): BelongsTo
    {
        return $this->belongsTo(Akun::class, 'akun_id');
    }

    public function pegawai(): BelongsTo
    {
        return $this->belongsTo(Pegawai::class, 'NIP', 'NIP');
    }

    public function unitKerja(): BelongsTo
    {
        return $this->belongsTo(UnitKerja::class, 'unit_id');
    }

    public function jabatan(): BelongsTo
    {
        return $this->belongsTo(Jabatan::class, 'jabatan_id');
    }
}
