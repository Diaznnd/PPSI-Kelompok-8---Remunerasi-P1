<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pengaduan', function (Blueprint $table) {
            $table->id();
            $table->string('NIP', 30)->nullable();
            $table->foreign('NIP')->references('NIP')->on('pegawai')->nullOnDelete();
            $table->foreignId('unit_id')->nullable()->constrained('unit_kerja')->nullOnDelete();
            $table->foreignId('hasil_id')->nullable()->constrained('hasil_perhitungan')->nullOnDelete();
            $table->string('kategori')->nullable(); // Potongan, Nilai Jabatan, Presensi, dll.
            $table->string('judul');
            $table->text('uraian')->nullable();
            $table->string('lampiran_path')->nullable();
            $table->string('tingkat')->nullable(); // unit, fakultas, universitas
            $table->string('status')->default('baru'); // baru, diproses, selesai, ditolak
            $table->timestamp('diajukan_at')->nullable();
            $table->timestamp('diselesaikan_at')->nullable();
            $table->string('periode')->nullable(); // Format: YYYY-MM
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pengaduan');
    }
};

