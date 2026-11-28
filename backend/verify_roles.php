<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Enums\Peran;
use Illuminate\Support\Facades\DB;

echo "=== ENUM PERAN (6 roles expected) ===" . PHP_EOL;
foreach (Peran::cases() as $peran) {
    echo "  {$peran->name} => {$peran->value}" . PHP_EOL;
}
echo PHP_EOL;

echo "=== DISTRIBUSI AKUN BY PERAN ===" . PHP_EOL;
$counts = DB::table('akun')
    ->selectRaw('peran, COUNT(*) as total')
    ->groupBy('peran')
    ->orderBy('peran')
    ->get();

foreach ($counts as $row) {
    echo "  {$row->peran}: {$row->total} akun" . PHP_EOL;
}

$total = DB::table('akun')->count();
echo PHP_EOL . "Total akun: {$total}" . PHP_EOL;

echo PHP_EOL . "=== DISTRIBUSI PEGAWAI BY UNIT ===" . PHP_EOL;
$units = DB::table('pegawai')
    ->join('unit_kerja', 'pegawai.unit_id', '=', 'unit_kerja.id')
    ->selectRaw('unit_kerja.nama, COUNT(*) as total')
    ->groupBy('unit_kerja.nama')
    ->get();

foreach ($units as $unit) {
    echo "  {$unit->nama}: {$unit->total} pegawai" . PHP_EOL;
}

$totalPegawai = DB::table('pegawai')->count();
echo PHP_EOL . "Total pegawai: {$totalPegawai}" . PHP_EOL;
