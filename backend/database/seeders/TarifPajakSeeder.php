<?php

namespace Database\Seeders;

use App\Models\TarifPajak;
use Illuminate\Database\Seeder;

class TarifPajakSeeder extends Seeder
{
    /**
     * Seed tarif pajak PPh 21 (TER - Tarif Efektif Rata-rata) 2024
     * Sesuai Peraturan Menteri Keuangan
     */
    public function run(): void
    {
        $tarifPajak = [
            // TER Kategori A (TK/0, TK/1, K/0)
            ['kategori_ter' => 'TER Kategori A (TK/0, TK/1, K/0)', 'bruto_min' => 0, 'bruto_max' => 5400000, 'tarif' => '0%', 'tarif_decimal' => 0.00],
            ['kategori_ter' => 'TER Kategori A (TK/0, TK/1, K/0)', 'bruto_min' => 5400001, 'bruto_max' => 5650000, 'tarif' => '0.25%', 'tarif_decimal' => 0.25],
            ['kategori_ter' => 'TER Kategori A (TK/0, TK/1, K/0)', 'bruto_min' => 5650001, 'bruto_max' => 5950000, 'tarif' => '0.50%', 'tarif_decimal' => 0.50],
            ['kategori_ter' => 'TER Kategori A (TK/0, TK/1, K/0)', 'bruto_min' => 5950001, 'bruto_max' => 6300000, 'tarif' => '0.75%', 'tarif_decimal' => 0.75],
            ['kategori_ter' => 'TER Kategori A (TK/0, TK/1, K/0)', 'bruto_min' => 6300001, 'bruto_max' => 6750000, 'tarif' => '1.00%', 'tarif_decimal' => 1.00],
            ['kategori_ter' => 'TER Kategori A (TK/0, TK/1, K/0)', 'bruto_min' => 6750001, 'bruto_max' => 7500000, 'tarif' => '1.25%', 'tarif_decimal' => 1.25],
            ['kategori_ter' => 'TER Kategori A (TK/0, TK/1, K/0)', 'bruto_min' => 7500001, 'bruto_max' => 8550000, 'tarif' => '1.50%', 'tarif_decimal' => 1.50],
            ['kategori_ter' => 'TER Kategori A (TK/0, TK/1, K/0)', 'bruto_min' => 8550001, 'bruto_max' => 9650000, 'tarif' => '1.75%', 'tarif_decimal' => 1.75],
            ['kategori_ter' => 'TER Kategori A (TK/0, TK/1, K/0)', 'bruto_min' => 9650001, 'bruto_max' => 10050000, 'tarif' => '2.00%', 'tarif_decimal' => 2.00],
            ['kategori_ter' => 'TER Kategori A (TK/0, TK/1, K/0)', 'bruto_min' => 10050001, 'bruto_max' => 10350000, 'tarif' => '2.25%', 'tarif_decimal' => 2.25],
            ['kategori_ter' => 'TER Kategori A (TK/0, TK/1, K/0)', 'bruto_min' => 10350001, 'bruto_max' => 10700000, 'tarif' => '2.50%', 'tarif_decimal' => 2.50],
            
            // TER Kategori B (TK/2, TK/3, K/1, K/2)
            ['kategori_ter' => 'TER Kategori B (TK/2, TK/3, K/1, K/2)', 'bruto_min' => 0, 'bruto_max' => 6200000, 'tarif' => '0%', 'tarif_decimal' => 0.00],
            ['kategori_ter' => 'TER Kategori B (TK/2, TK/3, K/1, K/2)', 'bruto_min' => 6200001, 'bruto_max' => 6500000, 'tarif' => '0.25%', 'tarif_decimal' => 0.25],
            ['kategori_ter' => 'TER Kategori B (TK/2, TK/3, K/1, K/2)', 'bruto_min' => 6500001, 'bruto_max' => 6850000, 'tarif' => '0.50%', 'tarif_decimal' => 0.50],
            ['kategori_ter' => 'TER Kategori B (TK/2, TK/3, K/1, K/2)', 'bruto_min' => 6850001, 'bruto_max' => 7300000, 'tarif' => '0.75%', 'tarif_decimal' => 0.75],
            ['kategori_ter' => 'TER Kategori B (TK/2, TK/3, K/1, K/2)', 'bruto_min' => 7300001, 'bruto_max' => 9200000, 'tarif' => '1.00%', 'tarif_decimal' => 1.00],
            ['kategori_ter' => 'TER Kategori B (TK/2, TK/3, K/1, K/2)', 'bruto_min' => 9200001, 'bruto_max' => 10750000, 'tarif' => '1.50%', 'tarif_decimal' => 1.50],
            ['kategori_ter' => 'TER Kategori B (TK/2, TK/3, K/1, K/2)', 'bruto_min' => 10750001, 'bruto_max' => 11250000, 'tarif' => '2.00%', 'tarif_decimal' => 2.00],
            ['kategori_ter' => 'TER Kategori B (TK/2, TK/3, K/1, K/2)', 'bruto_min' => 11250001, 'bruto_max' => 11600000, 'tarif' => '2.50%', 'tarif_decimal' => 2.50],
            
            // TER Kategori C (K/3)
            ['kategori_ter' => 'TER Kategori C (K/3)', 'bruto_min' => 0, 'bruto_max' => 6600000, 'tarif' => '0%', 'tarif_decimal' => 0.00],
            ['kategori_ter' => 'TER Kategori C (K/3)', 'bruto_min' => 6600001, 'bruto_max' => 6950000, 'tarif' => '0.25%', 'tarif_decimal' => 0.25],
            ['kategori_ter' => 'TER Kategori C (K/3)', 'bruto_min' => 6950001, 'bruto_max' => 7350000, 'tarif' => '0.50%', 'tarif_decimal' => 0.50],
            ['kategori_ter' => 'TER Kategori C (K/3)', 'bruto_min' => 7350001, 'bruto_max' => 7800000, 'tarif' => '0.75%', 'tarif_decimal' => 0.75],
            ['kategori_ter' => 'TER Kategori C (K/3)', 'bruto_min' => 7800001, 'bruto_max' => 8850000, 'tarif' => '1.00%', 'tarif_decimal' => 1.00],
            ['kategori_ter' => 'TER Kategori C (K/3)', 'bruto_min' => 8850001, 'bruto_max' => 9800000, 'tarif' => '1.25%', 'tarif_decimal' => 1.25],
            ['kategori_ter' => 'TER Kategori C (K/3)', 'bruto_min' => 9800001, 'bruto_max' => 10950000, 'tarif' => '1.50%', 'tarif_decimal' => 1.50],
            ['kategori_ter' => 'TER Kategori C (K/3)', 'bruto_min' => 10950001, 'bruto_max' => 11200000, 'tarif' => '1.75%', 'tarif_decimal' => 1.75],
            ['kategori_ter' => 'TER Kategori C (K/3)', 'bruto_min' => 11200001, 'bruto_max' => 12050000, 'tarif' => '2.00%', 'tarif_decimal' => 2.00],
        ];

        foreach ($tarifPajak as $tarif) {
            TarifPajak::updateOrCreate(
                [
                    'kategori_ter' => $tarif['kategori_ter'],
                    'bruto_min' => $tarif['bruto_min'],
                ],
                array_merge($tarif, [
                    'berlaku_mulai' => '2026-01-01',
                    'berlaku_sampai' => null, // Currently active
                ])
            );
        }
    }
}
