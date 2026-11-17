<?php

namespace Database\Seeders;

use App\Enums\Peran;
use App\Models\Akun;
use Illuminate\Database\Seeder;

class AkunSeeder extends Seeder
{
    /**
     * Seed akun untuk testing RBAC
     */
    public function run(): void
    {
        $akuns = [
            [
                'username' => '1',
                'password' => '1',
                'peran' => Peran::PEGAWAI,
            ],
            [
                'username' => '2',
                'password' => '2',
                'peran' => Peran::BENDAHARA,
            ],
            [
                'username' => '3',
                'password' => '3',
                'peran' => Peran::KEPEGAWAIAN,
            ],
            [
                'username' => '4',
                'password' => '4',
                'peran' => Peran::VERIFIKATOR,
            ],
            [
                'username' => '5',
                'password' => '5',
                'peran' => Peran::PJ_UNIT,
            ],
            [
                'username' => '6',
                'password' => '6',
                'peran' => Peran::UPT_REMUNERASI,
            ],
            // Akun Multi-Role dari Unit Selain FTI
            [
                'username' => 'bendahara.fk',
                'password' => 'password',
                'peran' => Peran::BENDAHARA,
            ],
            [
                'username' => 'kepegawaian.fmipa',
                'password' => 'password',
                'peran' => Peran::KEPEGAWAIAN,
            ],
            [
                'username' => 'pegawai.tubel',
                'password' => 'password',
                'peran' => Peran::PEGAWAI,
            ],
        ];

        foreach ($akuns as $data) {
            Akun::updateOrCreate(
                ['username' => $data['username']],
                [
                    'password' => $data['password'],
                    'peran' => $data['peran'],
                    'aktif' => true,
                ]
            );
        }
    }
}
