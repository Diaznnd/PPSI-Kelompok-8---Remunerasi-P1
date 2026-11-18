<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('presensi_report', function (Blueprint $table) {
            $table->id();
            $table->foreignId('unit_id')->constrained('unit_kerja')->cascadeOnDelete();
            $table->string('NIP', 30)->nullable(); // Operator yang impor
            $table->foreign('NIP')->references('NIP')->on('pegawai')->nullOnDelete();
            $table->string('nama_file')->nullable();
            $table->string('masa_file')->nullable(); // Contoh: "Oktober 2026"
            $table->string('file_hash')->nullable(); // Hash MD5/SHA untuk cek duplikat
            $table->string('status')->default('pending'); // pending, valid, perlu_koreksi, gagal
            $table->integer('jumlah_valid')->default(0);
            $table->integer('jumlah_gagal')->default(0);
            $table->json('baris_gagal')->nullable(); // Daftar baris yang gagal diproses
            $table->string('durasi')->nullable();
            $table->timestamp('dimpor_at')->nullable();
            $table->string('periode')->nullable(); // Format: YYYY-MM
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('presensi_report');
    }
};

