<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('presensi_bulanan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('presensi_report_id')->constrained('presensi_report')->cascadeOnDelete();
            $table->string('NIP', 30);
            $table->foreign('NIP')->references('NIP')->on('pegawai')->cascadeOnDelete();

            $table->decimal('hari_kerja', 5, 1)->default(0);
            $table->decimal('hadir', 5, 1)->default(0);
            $table->decimal('tidak_hadir', 5, 1)->default(0);
            $table->decimal('cuti_izin', 5, 1)->default(0);

            // Sakit / Terlambat (s1–s6 hari)
            $table->decimal('s1', 5, 1)->default(0);
            $table->decimal('s2', 5, 1)->default(0);
            $table->decimal('s3', 5, 1)->default(0);
            $table->decimal('s4', 5, 1)->default(0);
            $table->decimal('s5', 5, 1)->default(0);
            $table->decimal('s6', 5, 1)->default(0);

            // Pulang walau (pw1–pw6)
            $table->decimal('pw1', 5, 1)->default(0);
            $table->decimal('pw2', 5, 1)->default(0);
            $table->decimal('pw3', 5, 1)->default(0);
            $table->decimal('pw4', 5, 1)->default(0);
            $table->decimal('pw5', 5, 1)->default(0);
            $table->decimal('pw6', 5, 1)->default(0);

            // Jenis Cuti
            $table->decimal('cuti_sakit', 5, 1)->default(0);
            $table->decimal('cuti_bersalin_1_2', 5, 1)->default(0);
            $table->decimal('cuti_bersalin_3', 5, 1)->default(0);
            $table->decimal('cuti_bersalin_4_plus', 5, 1)->default(0);
            $table->decimal('cuti_alasan_penting', 5, 1)->default(0);
            $table->decimal('cuti_besar', 5, 1)->default(0);
            $table->decimal('cuti_tahunan', 5, 1)->default(0);

            // Keterangan lain
            $table->decimal('izin', 5, 1)->default(0);
            $table->decimal('tugas_kedinasan', 5, 1)->default(0);
            $table->decimal('alfa', 5, 1)->default(0); // Tanpa Keterangan

            $table->boolean('dikoreksi')->default(false);
            $table->text('alasan_koreksi')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('presensi_bulanan');
    }
};

