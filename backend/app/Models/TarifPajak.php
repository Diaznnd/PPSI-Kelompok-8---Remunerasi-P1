<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TarifPajak extends Model
{
    protected $table = 'tarif_pajak';

    protected $fillable = [
        'kategori_ter',
        'bruto_min',
        'bruto_max',
        'tarif',
        'tarif_decimal',
        'berlaku_mulai',
        'berlaku_sampai',
    ];

    protected function casts(): array
    {
        return [
            'bruto_min' => 'integer',
            'bruto_max' => 'integer',
            'tarif_decimal' => 'decimal:2',
            'berlaku_mulai' => 'date',
            'berlaku_sampai' => 'date',
        ];
    }
}
