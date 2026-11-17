<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pegawai', function (Blueprint $table) {
            $table->string('NIP', 30)->primary();
            $table->foreignId('unit_id')->nullable()->constrained('unit_kerja')->nullOnDelete();
            $table->string('nama');
            $table->string('jenis')->nullable(); // Dosen / Tendik
            $table->string('status_kepegawaian')->nullable(); // PNS, Pegawai Tetap, CPNS, CPT-PTNBH
            $table->string('status_tugas_belajar', 30)->default('aktif'); // aktif / tugas_belajar (dikelola Kepegawaian)
            $table->string('sk_tugas_belajar')->nullable();
            $table->date('tgl_mulai_tubel')->nullable();
            $table->date('tgl_selesai_tubel')->nullable();
            $table->string('pangkat_golongan')->nullable();
            $table->string('npwp', 50)->nullable();
            $table->string('nowo')->nullable(); // Nomor Wajib Online
            $table->string('status_skp')->nullable();
            $table->string('no_rekening')->nullable();
            $table->boolean('aktif')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pegawai');
    }
};

