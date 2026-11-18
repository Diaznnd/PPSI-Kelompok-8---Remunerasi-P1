<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dokumen_pendukung', function (Blueprint $table) {
            $table->id();
            $table->foreignId('akun_id')->nullable()->constrained('akun')->nullOnDelete();
            $table->string('nomor_dokumen')->nullable();
            $table->date('tanggal_dokumen')->nullable();
            $table->string('nama_file')->nullable();
            $table->string('file_path');
            $table->string('jenis')->nullable(); // SK, SPMT, dll.
            $table->string('jenis_dokumen')->nullable(); // SK Jabatan, SPMT, dll.
            $table->unsignedInteger('ukuran_kb')->nullable();
            $table->timestamp('diunggah_at')->useCurrent();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dokumen_pendukung');
    }
};

