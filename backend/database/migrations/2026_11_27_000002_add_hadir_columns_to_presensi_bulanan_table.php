<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('presensi_bulanan', function (Blueprint $table) {
            if (!Schema::hasColumn('presensi_bulanan', 'hadir')) {
                $table->decimal('hadir', 5, 1)->default(0)->after('hari_kerja');
            }
            if (!Schema::hasColumn('presensi_bulanan', 'tidak_hadir')) {
                $table->decimal('tidak_hadir', 5, 1)->default(0)->after('hadir');
            }
            if (!Schema::hasColumn('presensi_bulanan', 'cuti_izin')) {
                $table->decimal('cuti_izin', 5, 1)->default(0)->after('tidak_hadir');
            }
            if (!Schema::hasColumn('presensi_bulanan', 'alasan_koreksi')) {
                $table->text('alasan_koreksi')->nullable()->after('dikoreksi');
            }
        });
    }

    public function down(): void
    {
        Schema::table('presensi_bulanan', function (Blueprint $table) {
            if (Schema::hasColumn('presensi_bulanan', 'hadir')) {
                $table->dropColumn('hadir');
            }
            if (Schema::hasColumn('presensi_bulanan', 'tidak_hadir')) {
                $table->dropColumn('tidak_hadir');
            }
            if (Schema::hasColumn('presensi_bulanan', 'cuti_izin')) {
                $table->dropColumn('cuti_izin');
            }
            if (Schema::hasColumn('presensi_bulanan', 'alasan_koreksi')) {
                $table->dropColumn('alasan_koreksi');
            }
        });
    }
};
