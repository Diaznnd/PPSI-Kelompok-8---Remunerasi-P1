<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ParameterRemunerasi extends Model
{
    use HasFactory;

    protected $table = 'parameter_remunerasi';

    protected $fillable = [
        'kode',
        'kategori',
        'nilai',
        'batas_min',
        'batas_maks',
        'berlaku_mulai',
        'berlaku_sampai',
    ];

    protected function casts(): array
    {
        return [
            'nilai' => 'decimal:4',
            'batas_min' => 'decimal:4',
            'batas_maks' => 'decimal:4',
            'berlaku_mulai' => 'date',
            'berlaku_sampai' => 'date',
        ];
    }
}
