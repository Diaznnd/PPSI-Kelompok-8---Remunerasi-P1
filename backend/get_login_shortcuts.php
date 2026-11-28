<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

$akuns = DB::table('akun')
    ->join('pegawai', 'akun.NIP', '=', 'pegawai.NIP')
    ->join('unit_kerja', 'pegawai.unit_id', '=', 'unit_kerja.id')
    ->where('unit_kerja.nama', 'Fakultas Teknologi Informasi')
    ->select('akun.username', 'akun.peran', 'pegawai.nama', 'akun.NIP')
    ->orderByRaw('FIELD(akun.peran, "penanggung_jawab", "bendahara", "kepegawaian", "verifikator", "upt_remunerasi", "pegawai")')
    ->get()
    ->groupBy('peran');

echo "=== LOGIN SHORTCUTS FTI ===" . PHP_EOL . PHP_EOL;

$roles = ['penanggung_jawab', 'bendahara', 'kepegawaian', 'verifikator', 'upt_remunerasi', 'pegawai'];

foreach ($roles as $role) {
    if (isset($akuns[$role])) {
        $user = $akuns[$role]->first();
        echo strtoupper(str_replace('_', ' ', $role)) . PHP_EOL;
        echo "  Username: {$user->username}" . PHP_EOL;
        echo "  Password: password123" . PHP_EOL;
        echo "  Nama: {$user->nama}" . PHP_EOL;
        echo PHP_EOL;
    }
}
