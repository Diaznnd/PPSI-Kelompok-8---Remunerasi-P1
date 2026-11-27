<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tarif_pajak', function (Blueprint $table) {
            $table->id();
            $table->string('kategori_ter', 100); // e.g., "TER Kategori A (TK/0, TK/1, K/0)"
            $table->bigInteger('bruto_min'); // Minimum bruto monthly salary
            $table->bigInteger('bruto_max'); // Maximum bruto monthly salary
            $table->string('tarif', 20); // Tax rate percentage as string (e.g., "0%", "0.25%", "5%")
            $table->decimal('tarif_decimal', 5, 2)->nullable(); // Tax rate as decimal for calculation (e.g., 0.00, 0.25, 5.00)
            $table->date('berlaku_mulai')->default('2026-01-01'); // Effective start date
            $table->date('berlaku_sampai')->nullable(); // Effective end date (null = still active)
            $table->timestamps();
            
            // Index for efficient queries
            $table->index(['kategori_ter', 'berlaku_mulai']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tarif_pajak');
    }
};
