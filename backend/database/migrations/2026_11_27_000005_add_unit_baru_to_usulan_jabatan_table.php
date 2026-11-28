<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('usulan_jabatan', function (Blueprint $table) {
            // Field untuk unit baru jika terjadi mutasi unit
            $table->foreignId('unit_baru_id')
                ->nullable()
                ->after('unit_id')
                ->constrained('unit_kerja')
                ->nullOnDelete();
            
            // Field untuk mencatat minggu mutasi (1-4)
            $table->unsignedTinyInteger('minggu_mutasi')
                ->nullable()
                ->after('unit_baru_id')
                ->comment('Minggu ke berapa mutasi terjadi dalam bulan: 1-2 = unit baru, 3-4 = unit lama');
        });
    }

    public function down(): void
    {
        Schema::table('usulan_jabatan', function (Blueprint $table) {
            $table->dropForeign(['unit_baru_id']);
            $table->dropColumn(['unit_baru_id', 'minggu_mutasi']);
        });
    }
};
