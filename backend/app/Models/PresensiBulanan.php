<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PresensiBulanan extends Model
{
    use HasFactory;

    protected $table = 'presensi_bulanan';

    protected $fillable = [
        'presensi_report_id',
        'NIP',
        'hari_kerja',
        'hadir',
        'tidak_hadir',
        'cuti_izin',
        's1', 's2', 's3', 's4', 's5', 's6',
        'pw1', 'pw2', 'pw3', 'pw4', 'pw5', 'pw6',
        'cuti_sakit',
        'cuti_bersalin_1_2',
        'cuti_bersalin_3',
        'cuti_bersalin_4_plus',
        'cuti_alasan_penting',
        'cuti_besar',
        'cuti_tahunan',
        'izin',
        'tugas_kedinasan',
        'alfa',
        'dikoreksi',
        'alasan_koreksi',
    ];

    protected function casts(): array
    {
        return [
            'dikoreksi' => 'boolean',
            'hari_kerja' => 'decimal:1',
            'hadir' => 'decimal:1',
            'tidak_hadir' => 'decimal:1',
            'cuti_izin' => 'decimal:1',
            's1' => 'decimal:1', 's2' => 'decimal:1', 's3' => 'decimal:1',
            's4' => 'decimal:1', 's5' => 'decimal:1', 's6' => 'decimal:1',
            'pw1' => 'decimal:1', 'pw2' => 'decimal:1', 'pw3' => 'decimal:1',
            'pw4' => 'decimal:1', 'pw5' => 'decimal:1', 'pw6' => 'decimal:1',
            'cuti_sakit' => 'decimal:1',
            'cuti_bersalin_1_2' => 'decimal:1',
            'cuti_bersalin_3' => 'decimal:1',
            'cuti_bersalin_4_plus' => 'decimal:1',
            'cuti_alasan_penting' => 'decimal:1',
            'cuti_besar' => 'decimal:1',
            'cuti_tahunan' => 'decimal:1',
            'izin' => 'decimal:1',
            'tugas_kedinasan' => 'decimal:1',
            'alfa' => 'decimal:1',
        ];
    }

    public function presensiReport(): BelongsTo
    {
        return $this->belongsTo(PresensiReport::class, 'presensi_report_id');
    }

    public function pegawai(): BelongsTo
    {
        return $this->belongsTo(Pegawai::class, 'NIP', 'NIP');
    }
}
