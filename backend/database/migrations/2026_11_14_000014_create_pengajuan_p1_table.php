<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pengajuan_p1', function (Blueprint $table) {
            $table->id();
            $table->foreignId('unit_id')->constrained('unit_kerja')->cascadeOnDelete();
            $table->string('nomor_pengajuan')->unique()->nullable();
            $table->integer('pengajuan_ke')->nullable(); // Urutan pengajuan ke-N untuk unit di periode ini
            $table->string('status')->default('draft'); // draft, diajukan, diproses, selesai, ditolak
            $table->decimal('total_remunerasi', 20, 2)->default(0);
            $table->decimal('total_pengurangan', 20, 2)->default(0);
            $table->decimal('total_bruto', 20, 2)->default(0);
            $table->string('psk_nama')->nullable();  // Pejabat Pembuat Komitmen
            $table->string('psk_nip')->nullable();
            $table->string('bendahara_nama')->nullable();
            $table->string('bendahara_nip')->nullable();
            $table->timestamp('diajukan_at')->nullable();
            $table->string('periode')->nullable(); // Format: YYYY-MM
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pengajuan_p1');
    }
};

