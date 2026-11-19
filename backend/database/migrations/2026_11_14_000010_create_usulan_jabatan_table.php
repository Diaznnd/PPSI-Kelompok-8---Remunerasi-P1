<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('usulan_jabatan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dokumen_id')->nullable()->constrained('dokumen_pendukung')->nullOnDelete();
            $table->foreignId('dokumen_spmt_id')->nullable()->constrained('dokumen_pendukung')->nullOnDelete();
            $table->foreignId('akun_id')->nullable()->constrained('akun')->nullOnDelete();
            $table->string('NIP', 30)->nullable();
            $table->foreign('NIP')->references('NIP')->on('pegawai')->nullOnDelete();
            $table->foreignId('unit_id')->nullable()->constrained('unit_kerja')->nullOnDelete();
            $table->foreignId('jabatan_lama_id')->nullable()->constrained('jabatan')->nullOnDelete();
            $table->foreignId('jabatan_id')->nullable()->constrained('jabatan')->nullOnDelete();
            $table->integer('nomor_urutan')->nullable();
            $table->date('tanggal_berlaku')->nullable();
            $table->string('status')->default('diajukan'); // diajukan, dikembalikan, disetujui_verifikator, diverifikasi, ditetapkan
            $table->text('alasan')->nullable();
            $table->text('catatan_verifikator')->nullable();
            $table->text('catatan_perbaikan')->nullable();
            $table->string('jenis_perubahan')->nullable(); // promosi, mutasi, kenaikan_grade, penyesuaian
            $table->json('jejak')->nullable();
            $table->timestamp('diajukan_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('usulan_jabatan');
    }
};

