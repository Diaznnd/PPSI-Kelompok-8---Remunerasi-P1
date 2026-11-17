<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hasil_perhitungan', function (Blueprint $table) {
            $table->id();

            // Foreign Keys
            $table->foreignId('pengajuan_id')->nullable()->constrained('pengajuan_p1')->nullOnDelete();
            $table->foreignId('usulan_jabatan_id')->nullable()->constrained('usulan_jabatan')->nullOnDelete();
            $table->string('NIP', 30);
            $table->foreign('NIP')->references('NIP')->on('pegawai')->cascadeOnDelete();
            $table->foreignId('presensi_bulanan_id')->nullable()->constrained('presensi_bulanan')->nullOnDelete();
            $table->foreignId('hukuman_id')->nullable()->constrained('hukuman_disiplin')->nullOnDelete();

            // Periode Slip (contoh: "2026-10")
            $table->string('periode', 20)->nullable();

            // Data Perhitungan
            $table->string('kelompok_amprah')->nullable();         // Dosen/Tendik/dll.
            $table->decimal('nilai_jabatan', 20, 2)->nullable();
            $table->decimal('pir', 10, 4)->nullable();             // Persentase IKU/Review (standar 3000)
            $table->decimal('persen_p1', 10, 4)->nullable();       // Bobot P1 (standar 40%)
            $table->decimal('p1_gross', 20, 2)->nullable();
            $table->decimal('persen_status', 10, 4)->nullable()->default(100.00); // PNS/PT=100%, CPNS/CPT=80%, Tubel=60%
            $table->decimal('p1_pertimbang', 20, 2)->nullable();
            $table->decimal('pengurangan_rp', 20, 2)->nullable();  // Pengurangan Rupiah (TP, dll)
            $table->decimal('pengurangan_tp', 20, 2)->nullable();  // Alias kompatibilitas
            $table->string('pengali_status')->nullable();          // Deskripsi status (misal "PNS (100%)", "Tugas Belajar (60%)")
            $table->string('penjeki_status')->nullable();          // Alias kompatibilitas
            $table->decimal('persen_potongan_hadir', 10, 4)->nullable();
            $table->decimal('no_persen_potongan_hadir', 10, 4)->nullable(); // Alias kompatibilitas
            $table->decimal('persen_hukdis', 10, 4)->nullable();   // Persen potongan hukuman disiplin
            $table->decimal('total_persen_potongan', 10, 4)->nullable();
            $table->decimal('total_persen_golongan', 10, 4)->nullable(); // Alias
            $table->json('rincian_potongan')->nullable();           // Detail potongan per komponen
            $table->text('alasan_nol')->nullable();                 // Alasan jika P1 = 0
            $table->decimal('p1_setelah_potongan', 20, 2)->nullable();
            $table->decimal('p1_setelah_golongan', 20, 2)->nullable(); // Alias
            $table->decimal('pajak_pph21', 20, 2)->nullable();
            $table->decimal('pajak_ter', 20, 2)->nullable();
            $table->decimal('pajak_tcr', 20, 2)->nullable();        // Alias
            $table->json('tab_pajak')->nullable();                  // Tabel pajak
            $table->json('tbl_pajak')->nullable();                  // Alias
            $table->decimal('p1_netto', 20, 2)->nullable();
            $table->text('catatan_verifikator')->nullable();
            $table->timestamp('amprah_terbit_at')->nullable();
            $table->string('slip_file_path')->nullable();
            $table->timestamp('slip_terbit_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hasil_perhitungan');
    }
};
