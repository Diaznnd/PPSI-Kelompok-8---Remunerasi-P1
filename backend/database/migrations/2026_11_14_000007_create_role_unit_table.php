<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabel role_unit:
     * Menyimpan relasi Akun (role_id) ↔ Unit Kerja (unit_id) ↔ Peran (peran).
     * Mendukung multi-role (1 akun punya banyak peran) dan unit-scoping isolasi data.
     */
    public function up(): void
    {
        Schema::create('role_unit', function (Blueprint $table) {
            $table->id();
            $table->foreignId('role_id')->constrained('akun')->cascadeOnDelete();
            $table->foreignId('unit_id')->nullable()->constrained('unit_kerja')->nullOnDelete();
            $table->string('peran', 50); // pegawai, bendahara, kepegawaian, pj_unit, verifikator, upt_remunerasi
            $table->boolean('aktif')->default(true);
            $table->timestamps();

            $table->unique(['role_id', 'unit_id', 'peran']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('role_unit');
    }
};

