<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('amprah', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hasil_id')->nullable()->constrained('hasil_perhitungan')->nullOnDelete();
            $table->foreignId('pengajuan_id')->nullable()->constrained('pengajuan_p1')->nullOnDelete();
            $table->string('nomor_amprah')->nullable();
            $table->string('kelompok')->nullable(); // Dosen / Tendik / dll.
            $table->string('status')->default('draft'); // draft, terbit, dibayar
            $table->decimal('total_remunerasi', 20, 2)->default(0);
            $table->decimal('total_pengurangan', 20, 2)->default(0);
            $table->decimal('total_pajak', 20, 2)->default(0);
            $table->decimal('total_lkb_pajak', 20, 2)->default(0); // LKB = Lebih Kasur Bayar
            $table->decimal('total_netto', 20, 2)->default(0);
            $table->decimal('total_bruto', 20, 2)->default(0);
            $table->string('psk_nama')->nullable();
            $table->string('psk_nip')->nullable();
            $table->string('bendahara_nama')->nullable();
            $table->string('bendahara_nip')->nullable();
            $table->integer('jumlah_pegawai')->default(0);
            $table->date('tanggal_terbit')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('amprah');
    }
};

