<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('parameter_remunerasi', function (Blueprint $table) {
            $table->id();
            $table->string('kode')->unique();
            $table->string('kategori')->nullable();
            $table->decimal('nilai', 20, 4)->nullable();
            $table->decimal('batas_min', 20, 4)->nullable();
            $table->decimal('batas_maks', 20, 4)->nullable();
            $table->date('berlaku_mulai')->nullable();
            $table->date('berlaku_sampai')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('parameter_remunerasi');
    }
};

