<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('presensi_report', function (Blueprint $table) {
            // Update status enum to include approval states
            $table->enum('status_approval', ['draft', 'menunggu_approval', 'disetujui', 'ditolak'])
                ->default('draft')
                ->after('status');
            
            // Approval tracking
            $table->string('approved_by_nip', 30)->nullable()->after('status_approval');
            $table->foreign('approved_by_nip')->references('NIP')->on('pegawai')->nullOnDelete();
            $table->timestamp('approved_at')->nullable()->after('approved_by_nip');
            $table->text('catatan_approval')->nullable()->after('approved_at');
            $table->text('alasan_penolakan')->nullable()->after('catatan_approval');
            
            // Flag to indicate if calculation can proceed
            $table->boolean('siap_perhitungan')->default(false)->after('alasan_penolakan');
        });
    }

    public function down(): void
    {
        Schema::table('presensi_report', function (Blueprint $table) {
            $table->dropForeign(['approved_by_nip']);
            $table->dropColumn([
                'status_approval',
                'approved_by_nip',
                'approved_at',
                'catatan_approval',
                'alasan_penolakan',
                'siap_perhitungan',
            ]);
        });
    }
};
