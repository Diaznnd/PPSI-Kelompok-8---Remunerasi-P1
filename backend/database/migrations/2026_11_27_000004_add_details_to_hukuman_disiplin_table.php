<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('hukuman_disiplin', function (Blueprint $table) {
            if (!Schema::hasColumn('hukuman_disiplin', 'jenis')) {
                $table->string('jenis')->nullable()->after('tingkat');
            }
            if (!Schema::hasColumn('hukuman_disiplin', 'nomor_sk')) {
                $table->string('nomor_sk')->nullable()->after('jenis');
            }
            if (!Schema::hasColumn('hukuman_disiplin', 'uraian')) {
                $table->text('uraian')->nullable()->after('tanggal_berakhir');
            }
        });
    }

    public function down(): void
    {
        Schema::table('hukuman_disiplin', function (Blueprint $table) {
            if (Schema::hasColumn('hukuman_disiplin', 'jenis')) {
                $table->dropColumn('jenis');
            }
            if (Schema::hasColumn('hukuman_disiplin', 'nomor_sk')) {
                $table->dropColumn('nomor_sk');
            }
            if (Schema::hasColumn('hukuman_disiplin', 'uraian')) {
                $table->dropColumn('uraian');
            }
        });
    }
};
