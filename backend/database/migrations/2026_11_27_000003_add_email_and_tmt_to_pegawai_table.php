<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pegawai', function (Blueprint $table) {
            if (!Schema::hasColumn('pegawai', 'email')) {
                $table->string('email')->nullable()->after('nama');
            }
            if (!Schema::hasColumn('pegawai', 'tmt')) {
                $table->date('tmt')->nullable()->after('pangkat_golongan');
            }
        });
    }

    public function down(): void
    {
        Schema::table('pegawai', function (Blueprint $table) {
            if (Schema::hasColumn('pegawai', 'email')) {
                $table->dropColumn('email');
            }
            if (Schema::hasColumn('pegawai', 'tmt')) {
                $table->dropColumn('tmt');
            }
        });
    }
};
