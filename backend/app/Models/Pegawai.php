<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Pegawai extends Model
{
    use HasFactory;

    protected $table = 'pegawai';
    protected $primaryKey = 'NIP';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'NIP',
        'unit_id',
        'nama',
        'email',
        'jenis',
        'status_kepegawaian',
        'status_tugas_belajar',
        'sk_tugas_belajar',
        'tgl_mulai_tubel',
        'tgl_selesai_tubel',
        'pangkat_golongan',
        'tmt',
        'npwp',
        'nowo',
        'status_skp',
        'no_rekening',
        'aktif',
        'alasan_nonaktif',
    ];

    protected function casts(): array
    {
        return [
            'aktif' => 'boolean',
            'tmt' => 'date:Y-m-d',
        ];
    }

    public function unitKerja(): BelongsTo
    {
        return $this->belongsTo(UnitKerja::class, 'unit_id');
    }

    public function akun(): HasOne
    {
        return $this->hasOne(Akun::class, 'NIP', 'NIP');
    }

    public function usulanJabatan(): HasMany
    {
        return $this->hasMany(UsulanJabatan::class, 'NIP', 'NIP');
    }

    public function usulanJabatanTerakhir(): HasOne
    {
        return $this->hasOne(UsulanJabatan::class, 'NIP', 'NIP')
            ->ofMany(['id' => 'max'], function ($query) {
                $query->whereIn('status', ['ditetapkan', 'diverifikasi']);
            });
    }

    public function hasilPerhitungan(): HasMany
    {
        return $this->hasMany(HasilPerhitungan::class, 'NIP', 'NIP');
    }

    public function presensiBulanan(): HasMany
    {
        return $this->hasMany(PresensiBulanan::class, 'NIP', 'NIP');
    }

    public function hukumanDisiplin(): HasMany
    {
        return $this->hasMany(HukumanDisiplin::class, 'NIP', 'NIP');
    }

    public function pengaduan(): HasMany
    {
        return $this->hasMany(Pengaduan::class, 'NIP', 'NIP');
    }

    public function tanggapanPengaduan(): HasMany
    {
        return $this->hasMany(TanggapanPengaduan::class, 'NIP', 'NIP');
    }
}
