<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('presensi_report', function (Blueprint $table) {
            if (!Schema::hasColumn('presensi_report', 'nama_file')) {
                $table->string('nama_file')->nullable()->after('NIP');
            }
            if (!Schema::hasColumn('presensi_report', 'durasi')) {
                $table->string('durasi')->nullable()->after('baris_gagal');
            }
        });
    }

    public function down(): void
    {
        Schema::table('presensi_report', function (Blueprint $table) {
            if (Schema::hasColumn('presensi_report', 'nama_file')) {
                $table->dropColumn('nama_file');
            }
            if (Schema::hasColumn('presensi_report', 'durasi')) {
                $table->dropColumn('durasi');
            }
        });
    }
};
