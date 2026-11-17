<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_log', function (Blueprint $table) {
            $table->id();
            $table->string('NIP', 30)->nullable(); // Pelaku aksi
            $table->foreign('NIP')->references('NIP')->on('pegawai')->nullOnDelete();
            $table->foreignId('unit_id')->nullable()->constrained('unit_kerja')->nullOnDelete();
            $table->string('aksi');               // create, update, delete, approve, dll.
            $table->string('objek_type');         // Nama model: Pengajuan, Pegawai, dll.
            $table->unsignedBigInteger('objek_id')->nullable();
            $table->json('nilai_sebelum')->nullable();
            $table->json('nilai_sesudah')->nullable();
            $table->text('alasan')->nullable();
            $table->timestamp('dicatat_at')->useCurrent();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_log');
    }
};

