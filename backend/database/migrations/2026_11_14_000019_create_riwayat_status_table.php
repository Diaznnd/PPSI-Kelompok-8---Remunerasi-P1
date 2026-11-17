<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('riwayat_status', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pengajuan_id')->constrained('pengajuan_p1')->cascadeOnDelete();
            $table->string('NIP', 30)->nullable(); // Pegawai yang mengubah status
            $table->foreign('NIP')->references('NIP')->on('pegawai')->nullOnDelete();
            $table->string('dari_status')->nullable();
            $table->string('ke_status');
            $table->text('catatan_alasan')->nullable();
            $table->timestamp('dicatat_at')->useCurrent();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('riwayat_status');
    }
};

