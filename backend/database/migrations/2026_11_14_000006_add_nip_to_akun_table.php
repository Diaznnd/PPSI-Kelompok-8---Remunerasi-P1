<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabel role (akun pengguna sistem).
     * FK NIP → pegawai.NIP
     */
    public function up(): void
    {
        // Tambah FK ke tabel akun (NIP → pegawai) dan update tabel akun jika perlu
        Schema::table('akun', function (Blueprint $table) {
            // Rename kolom pegawai_id → NIP jika belum ada kolom NIP
            // Karena ERD menunjukkan Role memiliki NIP sebagai FK ke Pegawai
            if (!Schema::hasColumn('akun', 'NIP')) {
                $table->string('NIP', 30)->nullable()->after('id');
                $table->foreign('NIP')->references('NIP')->on('pegawai')->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('akun', function (Blueprint $table) {
            $table->dropForeign(['NIP']);
            $table->dropColumn('NIP');
        });
    }
};

