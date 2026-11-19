<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hukuman_disiplin', function (Blueprint $table) {
            $table->id();
            $table->string('NIP', 30);
            $table->foreign('NIP')->references('NIP')->on('pegawai')->cascadeOnDelete();
            $table->foreignId('akun_id')->nullable()->constrained('akun')->nullOnDelete();
            $table->string('tingkat')->nullable(); // ringan, sedang, berat
            $table->string('jenis')->nullable();
            $table->string('nomor_sk')->nullable();
            $table->date('tanggal_mulai')->nullable();
            $table->date('tanggal_berakhir')->nullable();
            $table->text('uraian')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hukuman_disiplin');
    }
};

