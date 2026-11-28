<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PresensiReport extends Model
{
    use HasFactory;

    protected $table = 'presensi_report';

    protected $fillable = [
        'unit_id',
        'NIP',
        'nama_file',
        'masa_file',
        'file_hash',
        'status',
        'status_approval',
        'jumlah_valid',
        'jumlah_gagal',
        'baris_gagal',
        'durasi',
        'dimpor_at',
        'periode',
        'approved_by_nip',
        'approved_at',
        'catatan_approval',
        'alasan_penolakan',
        'siap_perhitungan',
    ];

    protected function casts(): array
    {
        return [
            'baris_gagal' => 'array',
            'dimpor_at' => 'datetime',
            'approved_at' => 'datetime',
            'jumlah_valid' => 'integer',
            'jumlah_gagal' => 'integer',
            'siap_perhitungan' => 'boolean',
        ];
    }

    public function unitKerja(): BelongsTo
    {
        return $this->belongsTo(UnitKerja::class, 'unit_id');
    }

    public function pegawai(): BelongsTo
    {
        return $this->belongsTo(Pegawai::class, 'NIP', 'NIP');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(Pegawai::class, 'approved_by_nip', 'NIP');
    }

    public function presensiBulanan(): HasMany
    {
        return $this->hasMany(PresensiBulanan::class, 'presensi_report_id');
    }

    /**
     * Check if report can be approved (status is valid and waiting for approval)
     */
    public function canBeApproved(): bool
    {
        return $this->status === 'valid' && $this->status_approval === 'menunggu_approval';
    }

    /**
     * Check if report allows calculation to proceed
     */
    public function isReadyForCalculation(): bool
    {
        return $this->status_approval === 'disetujui' && $this->siap_perhitungan;
    }
}
