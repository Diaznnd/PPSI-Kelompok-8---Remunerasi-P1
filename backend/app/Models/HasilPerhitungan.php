<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class HasilPerhitungan extends Model
{
    use HasFactory;

    protected $table = 'hasil_perhitungan';

    protected $fillable = [
        'pengajuan_id',
        'usulan_jabatan_id',
        'NIP',
        'presensi_bulanan_id',
        'hukuman_id',
        'periode',
        'kelompok_amprah',
        'nilai_jabatan',
        'pir',
        'persen_p1',
        'p1_gross',
        'persen_status',
        'p1_pertimbang',
        'pengurangan_rp',
        'pengurangan_tp',
        'pengali_status',
        'penjeki_status',
        'persen_potongan_hadir',
        'no_persen_potongan_hadir',
        'persen_hukdis',
        'total_persen_potongan',
        'total_persen_golongan',
        'rincian_potongan',
        'alasan_nol',
        'p1_setelah_potongan',
        'p1_setelah_golongan',
        'pajak_pph21',
        'pajak_ter',
        'pajak_tcr',
        'tab_pajak',
        'tbl_pajak',
        'p1_netto',
        'catatan_verifikator',
        'amprah_terbit_at',
        'slip_file_path',
        'slip_terbit_at',
    ];

    protected function casts(): array
    {
        return [
            'rincian_potongan' => 'array',
            'tab_pajak' => 'array',
            'tbl_pajak' => 'array',
            'amprah_terbit_at' => 'datetime',
            'slip_terbit_at' => 'datetime',
            'nilai_jabatan' => 'decimal:2',
            'p1_gross' => 'decimal:2',
            'p1_pertimbang' => 'decimal:2',
            'pengurangan_rp' => 'decimal:2',
            'pengurangan_tp' => 'decimal:2',
            'p1_setelah_potongan' => 'decimal:2',
            'p1_setelah_golongan' => 'decimal:2',
            'pajak_pph21' => 'decimal:2',
            'pajak_ter' => 'decimal:2',
            'pajak_tcr' => 'decimal:2',
            'p1_netto' => 'decimal:2',
            'pir' => 'decimal:4',
            'persen_p1' => 'decimal:4',
            'persen_potongan_hadir' => 'decimal:4',
            'no_persen_potongan_hadir' => 'decimal:4',
            'persen_hukdis' => 'decimal:4',
            'total_persen_potongan' => 'decimal:4',
            'total_persen_golongan' => 'decimal:4',
        ];
    }

    public function pegawai(): BelongsTo
    {
        return $this->belongsTo(Pegawai::class, 'NIP', 'NIP');
    }

    public function pengajuanP1(): BelongsTo
    {
        return $this->belongsTo(PengajuanP1::class, 'pengajuan_id');
    }

    public function usulanJabatan(): BelongsTo
    {
        return $this->belongsTo(UsulanJabatan::class, 'usulan_jabatan_id');
    }

    public function presensiBulanan(): BelongsTo
    {
        return $this->belongsTo(PresensiBulanan::class, 'presensi_bulanan_id');
    }

    public function hukumanDisiplin(): BelongsTo
    {
        return $this->belongsTo(HukumanDisiplin::class, 'hukuman_id');
    }

    public function amprah(): HasMany
    {
        return $this->hasMany(Amprah::class, 'hasil_id');
    }

    public function pengaduan(): HasMany
    {
        return $this->hasMany(Pengaduan::class, 'hasil_id');
    }
}
