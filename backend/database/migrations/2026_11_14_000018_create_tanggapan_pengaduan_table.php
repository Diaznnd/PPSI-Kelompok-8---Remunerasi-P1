<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tanggapan_pengaduan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pengaduan_id')->constrained('pengaduan')->cascadeOnDelete();
            $table->string('NIP', 30)->nullable();
            $table->foreign('NIP')->references('NIP')->on('pegawai')->nullOnDelete();
            $table->string('tipe')->nullable(); // pertanyaan, jawaban, eskalasi
            $table->text('isi');
            $table->string('lampiran_path')->nullable();
            $table->timestamp('dikirim_at')->useCurrent();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tanggapan_pengaduan');
    }
};

