<?php

namespace Database\Seeders;

use App\Models\ParameterRemunerasi;
use Illuminate\Database\Seeder;

class ParameterRemunerasiSeeder extends Seeder
{
    /**
     * Parameter Remunerasi sesuai Peraturan Rektor UNAND No. 2 Tahun 2026
     */
    public function run(): void
    {
        $parameters = [
            // Parameter Pokok P1
            [
                'kode' => 'PIR',
                'kategori' => 'Formula P1',
                'nilai' => 3000.00,
                'berlaku_mulai' => '2026-01-01',
            ],
            [
                'kode' => 'PERSEN_P1',
                'kategori' => 'Formula P1',
                'nilai' => 40.00,
                'berlaku_mulai' => '2026-01-01',
            ],

            // Faktor Pengali Status Kepegawaian
            [
                'kode' => 'PERSEN_STATUS_PNS',
                'kategori' => 'Status Kepegawaian',
                'nilai' => 100.00,
                'berlaku_mulai' => '2026-01-01',
            ],
            [
                'kode' => 'PERSEN_STATUS_PEGAWAI_TETAP',
                'kategori' => 'Status Kepegawaian',
                'nilai' => 100.00,
                'berlaku_mulai' => '2026-01-01',
            ],
            [
                'kode' => 'PERSEN_STATUS_CPNS',
                'kategori' => 'Status Kepegawaian',
                'nilai' => 80.00,
                'berlaku_mulai' => '2026-01-01',
            ],
            [
                'kode' => 'PERSEN_STATUS_CPT_PTNBH',
                'kategori' => 'Status Kepegawaian',
                'nilai' => 80.00,
                'berlaku_mulai' => '2026-01-01',
            ],
            [
                'kode' => 'PERSEN_STATUS_TUBEL',
                'kategori' => 'Status Kepegawaian',
                'nilai' => 60.00,
                'berlaku_mulai' => '2026-01-01',
            ],

            // Batas Kelayakan & Hukuman Disiplin
            [
                'kode' => 'BATAS_KETIDAKHADIRAN_MAX',
                'kategori' => 'Kelayakan Kehadiran',
                'nilai' => 50.00, // Ketidakhadiran fisik > 50% = P1 0 rupiah
                'berlaku_mulai' => '2026-01-01',
            ],
            [
                'kode' => 'POTONGAN_HUKDIS_SEDANG',
                'kategori' => 'Hukuman Disiplin',
                'nilai' => 25.00, // Potong 25% dari P1
                'berlaku_mulai' => '2026-01-01',
            ],
            [
                'kode' => 'POTONGAN_HUKDIS_BERAT',
                'kategori' => 'Hukuman Disiplin',
                'nilai' => 100.00, // P1 = 0 rupiah
                'berlaku_mulai' => '2026-01-01',
            ],

            // Tarif Potongan Cuti & Ketidakhadiran (Tabel 2.1 - 2.3)
            [
                'kode' => 'POTONGAN_CUTI_SAKIT',
                'kategori' => 'Cuti',
                'nilai' => 1.00,
                'berlaku_mulai' => '2026-01-01',
            ],
            [
                'kode' => 'POTONGAN_CUTI_BERSALIN_1_2',
                'kategori' => 'Cuti',
                'nilai' => 1.00,
                'berlaku_mulai' => '2026-01-01',
            ],
            [
                'kode' => 'POTONGAN_CUTI_BERSALIN_3',
                'kategori' => 'Cuti',
                'nilai' => 2.00,
                'berlaku_mulai' => '2026-01-01',
            ],
            [
                'kode' => 'POTONGAN_CUTI_BERSALIN_4_PLUS',
                'kategori' => 'Cuti',
                'nilai' => 3.00,
                'berlaku_mulai' => '2026-01-01',
            ],
            [
                'kode' => 'POTONGAN_CUTI_ALASAN_PENTING',
                'kategori' => 'Cuti',
                'nilai' => 3.00,
                'berlaku_mulai' => '2026-01-01',
            ],
            [
                'kode' => 'POTONGAN_CUTI_BESAR',
                'kategori' => 'Cuti',
                'nilai' => 1.50,
                'berlaku_mulai' => '2026-01-01',
            ],
            [
                'kode' => 'POTONGAN_ALFA',
                'kategori' => 'Ketidakhadiran',
                'nilai' => 5.00,
                'berlaku_mulai' => '2026-01-01',
            ],
        ];

        foreach ($parameters as $param) {
            ParameterRemunerasi::updateOrCreate(
                ['kode' => $param['kode']],
                $param
            );
        }
    }
}
