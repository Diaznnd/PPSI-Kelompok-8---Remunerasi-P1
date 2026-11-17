<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\Bendahara\AmprahController as BendaharaAmprahController;
use App\Http\Controllers\Bendahara\DashboardController as BendaharaDashboardController;
use App\Http\Controllers\Bendahara\PerhitunganController as BendaharaPerhitunganController;
use App\Http\Controllers\Bendahara\RekapitulasiController as BendaharaRekapitulasiController;
use App\Http\Controllers\Bendahara\StatusPengajuanController as BendaharaStatusPengajuanController;
use App\Http\Controllers\Kepegawaian\StatusPegawaiController as KepegawaianStatusPegawaiController;
use App\Http\Controllers\Pegawai\PengaduanController as PegawaiPengaduanController;
use App\Http\Controllers\Pegawai\ProfilController as PegawaiProfilController;
use App\Http\Controllers\Pegawai\SlipController as PegawaiSlipController;
use App\Http\Controllers\UptRemunerasi\AmprahUniversitasController as UptAmprahUniversitasController;
use App\Http\Controllers\UptRemunerasi\AuditLogController as UptAuditLogController;
use App\Http\Controllers\UptRemunerasi\DashboardController as UptDashboardController;
use App\Http\Controllers\UptRemunerasi\EksporController as UptEksporController;
use App\Http\Controllers\UptRemunerasi\HitungPajakController as UptHitungPajakController;
use App\Http\Controllers\UptRemunerasi\KonfigurasiController as UptKonfigurasiController;
use App\Http\Controllers\UptRemunerasi\LaporanController as UptLaporanController;
use App\Http\Controllers\UptRemunerasi\ManajemenAkunController as UptManajemenAkunController;
use App\Http\Controllers\UptRemunerasi\MasterDataController as UptMasterDataController;
use App\Http\Controllers\UptRemunerasi\MonitoringController as UptMonitoringController;
use App\Http\Controllers\UptRemunerasi\NotifikasiController as UptNotifikasiController;
use App\Http\Controllers\UptRemunerasi\PenerbitanSlipController as UptPenerbitanSlipController;
use App\Http\Controllers\UptRemunerasi\PenetapanJabatanController as UptPenetapanJabatanController;
use App\Http\Controllers\UptRemunerasi\PengaduanEskalasiController as UptPengaduanEskalasiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::get('/ping', fn () => ['status' => 'ok']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth endpoints
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/check-ability/{ability}', [AuthController::class, 'checkAbility']);
    Route::put('/update-password', [AuthController::class, 'updatePassword']);

    // ========================================================
    // ROLE PEGAWAI (PORTAL MANDIRI)
    // ========================================================
    Route::prefix('pegawai')->group(function () {
        // Profil & Beranda Pegawai
        Route::get('/profil', [PegawaiProfilController::class, 'show']);
        Route::get('/beranda', [PegawaiProfilController::class, 'beranda']);

        // Slip Gaji P1
        Route::get('/slip', [PegawaiSlipController::class, 'index']);
        Route::get('/slip/{id}', [PegawaiSlipController::class, 'show']);
        Route::get('/slip/{id}/pdf', [PegawaiSlipController::class, 'downloadPdf']);

        // Pengaduan & Layanan
        Route::get('/pengaduan', [PegawaiPengaduanController::class, 'index']);
        Route::post('/pengaduan', [PegawaiPengaduanController::class, 'store']);
        Route::get('/pengaduan/{id}', [PegawaiPengaduanController::class, 'show']);
        Route::post('/pengaduan/{id}/tanggapan', [PegawaiPengaduanController::class, 'storeTanggapan']);
    });

    // ========================================================
    // ROLE KEPEGAWAIAN (MANAJEMEN PEGAWAI & STATUS TUGAS BELAJAR)
    // ========================================================
    Route::prefix('kepegawaian')->group(function () {
        // Data Pegawai
        Route::get('/pegawai', [KepegawaianStatusPegawaiController::class, 'index']);
        Route::put('/pegawai/{nip}/tugas-belajar', [KepegawaianStatusPegawaiController::class, 'updateStatusTugasBelajar']);

        // Usulan Jabatan
        Route::get('/dashboard', [\App\Http\Controllers\Kepegawaian\UsulanJabatanController::class, 'dashboard']);
        Route::get('/usulan', [\App\Http\Controllers\Kepegawaian\UsulanJabatanController::class, 'index']);
        Route::post('/usulan', [\App\Http\Controllers\Kepegawaian\UsulanJabatanController::class, 'store']);
        Route::get('/usulan/{id}', [\App\Http\Controllers\Kepegawaian\UsulanJabatanController::class, 'show']);
        Route::put('/usulan/{id}', [\App\Http\Controllers\Kepegawaian\UsulanJabatanController::class, 'update']);
        Route::delete('/usulan/{id}', [\App\Http\Controllers\Kepegawaian\UsulanJabatanController::class, 'destroy']);
        Route::get('/jabatan/list', [\App\Http\Controllers\Kepegawaian\UsulanJabatanController::class, 'listJabatan']);
    });

    // ========================================================
    // ROLE BENDAHARA (PERHITUNGAN, PENGAJUAN, STATUS, AMPRAH, REKAPITULASI)
    // ========================================================
    Route::prefix('bendahara')->group(function () {
        Route::get('/dashboard', [BendaharaDashboardController::class, 'index']);
        Route::get('/kesiapan', [BendaharaPerhitunganController::class, 'kesiapan']);
        Route::post('/hitung', [BendaharaPerhitunganController::class, 'hitung']);
        Route::get('/pratinjau', [BendaharaPerhitunganController::class, 'pratinjau']);
        Route::put('/koreksi-presensi/{nip}', [BendaharaPerhitunganController::class, 'koreksiPresensi']);
        Route::post('/ajukan', [BendaharaPerhitunganController::class, 'ajukan']);
        Route::get('/status', [BendaharaStatusPengajuanController::class, 'index']);
        Route::get('/amprah', [BendaharaAmprahController::class, 'index']);
        Route::get('/amprah/{id}', [BendaharaAmprahController::class, 'show']);
        Route::get('/rekapitulasi', [BendaharaRekapitulasiController::class, 'index']);
    });

    // ========================================================
    // ROLE UPT REMUNERASI (PUSAT / TINGKAT UNIVERSITAS)
    // ========================================================
    Route::prefix('upt-remunerasi')->group(function () {
        // Dashboard
        Route::get('/dashboard', [UptDashboardController::class, 'index']);

        // Penetapan Jabatan/Grade
        Route::get('/penetapan-jabatan', [UptPenetapanJabatanController::class, 'index']);
        Route::get('/penetapan-jabatan/{id}', [UptPenetapanJabatanController::class, 'show']);
        Route::post('/penetapan-jabatan/{id}/tetapkan', [UptPenetapanJabatanController::class, 'tetapkan']);

        // Hitung Pajak & Penetapan Netto
        Route::get('/hitung-pajak', [UptHitungPajakController::class, 'index']);
        Route::get('/hitung-pajak/{id}', [UptHitungPajakController::class, 'detail']);
        Route::post('/hitung-pajak/{id}/tetapkan-netto', [UptHitungPajakController::class, 'tetapkanNetto']);

        // Penerbitan Slip P1
        Route::get('/penerbitan-slip', [UptPenerbitanSlipController::class, 'index']);
        Route::post('/penerbitan-slip/{pengajuanId}/terbitkan', [UptPenerbitanSlipController::class, 'terbitkan']);

        // Amprah Universitas
        Route::get('/amprah', [UptAmprahUniversitasController::class, 'index']);
        Route::post('/amprah/generate', [UptAmprahUniversitasController::class, 'generate']);
        Route::get('/amprah/{id}', [UptAmprahUniversitasController::class, 'show']);

        // Master Data
        Route::get('/master/unit', [UptMasterDataController::class, 'listUnits']);
        Route::post('/master/unit', [UptMasterDataController::class, 'storeUnit']);
        Route::put('/master/unit/{id}', [UptMasterDataController::class, 'updateUnit']);
        Route::patch('/master/unit/{id}/status', [UptMasterDataController::class, 'toggleUnitStatus']);

        Route::get('/master/grade', [UptMasterDataController::class, 'listGrades']);
        Route::put('/master/grade/{id}', [UptMasterDataController::class, 'updateGrade']);

        Route::get('/master/parameter', [UptMasterDataController::class, 'listParameters']);
        Route::put('/master/parameter/{id}', [UptMasterDataController::class, 'updateParameter']);

        // Manajemen Akun & Hak Akses (RBAC)
        Route::get('/akun', [UptManajemenAkunController::class, 'index']);
        Route::post('/akun', [UptManajemenAkunController::class, 'store']);
        Route::put('/akun/{id}', [UptManajemenAkunController::class, 'update']);
        Route::patch('/akun/{id}/status', [UptManajemenAkunController::class, 'toggleStatus']);
        Route::post('/akun/{id}/reset-password', [UptManajemenAkunController::class, 'resetPassword']);

        // Pengaduan Eskalasi
        Route::get('/pengaduan', [UptPengaduanEskalasiController::class, 'index']);
        Route::get('/pengaduan/{id}', [UptPengaduanEskalasiController::class, 'show']);
        Route::post('/pengaduan/{id}/tanggapi', [UptPengaduanEskalasiController::class, 'tanggapi']);

        // Jejak Audit
        Route::get('/audit-log', [UptAuditLogController::class, 'index']);

        // Monitoring & Tracking
        Route::get('/monitoring/status', [UptMonitoringController::class, 'statusPengajuan']);
        Route::get('/monitoring/timeline/{pengajuanId}', [UptMonitoringController::class, 'timelinePengajuan']);
        Route::get('/monitoring/kinerja-bendahara', [UptMonitoringController::class, 'kinerjaBendahara']);
        Route::get('/monitoring/alerts', [UptMonitoringController::class, 'alerts']);

        // Laporan & Rekapitulasi
        Route::get('/laporan/rekapitulasi', [UptLaporanController::class, 'rekapitulasiUniversitas']);
        Route::get('/laporan/distribusi-grade', [UptLaporanController::class, 'distribusiGrade']);
        Route::get('/laporan/tren', [UptLaporanController::class, 'trenRemunerasi']);
        Route::get('/laporan/pajak', [UptLaporanController::class, 'laporanPajak']);
        Route::get('/laporan/keterlambatan', [UptLaporanController::class, 'laporanKeterlambatan']);

        // Notifikasi
        Route::get('/notifikasi', [UptNotifikasiController::class, 'index']);
        Route::patch('/notifikasi/{id}/baca', [UptNotifikasiController::class, 'markAsRead']);
        Route::patch('/notifikasi/baca-semua', [UptNotifikasiController::class, 'markAllAsRead']);
        Route::delete('/notifikasi/{id}', [UptNotifikasiController::class, 'destroy']);
        Route::post('/notifikasi/broadcast', [UptNotifikasiController::class, 'broadcast']);

        // Ekspor Data
        Route::get('/ekspor/rekapitulasi-csv', [UptEksporController::class, 'eksporRekapitulasiCSV']);
        Route::get('/ekspor/detail-pegawai-csv', [UptEksporController::class, 'eksporDetailPegawaiCSV']);
        Route::get('/ekspor/usulan-jabatan-csv', [UptEksporController::class, 'eksporUsulanJabatanCSV']);
        Route::get('/ekspor/data-excel', [UptEksporController::class, 'dataEksporExcel']);

        // Konfigurasi Sistem
        Route::get('/konfigurasi', [UptKonfigurasiController::class, 'index']);
        Route::put('/konfigurasi/periode-aktif', [UptKonfigurasiController::class, 'updatePeriodeAktif']);
        Route::put('/konfigurasi/batas-pengajuan', [UptKonfigurasiController::class, 'updateBatasPengajuan']);
        Route::put('/konfigurasi/mode-sistem', [UptKonfigurasiController::class, 'toggleModeSistem']);
        Route::put('/konfigurasi/fitur', [UptKonfigurasiController::class, 'toggleFitur']);
        Route::put('/konfigurasi/parameter-batch', [UptKonfigurasiController::class, 'updateParameterBatch']);
        Route::post('/konfigurasi/backup', [UptKonfigurasiController::class, 'backup']);
    });

    // ========================================================
    // PENGAJUAN P1 (ALUR RBAC SEMUA PERAN)
    // ========================================================
    Route::prefix('pengajuan')->group(function () {
        // Buat pengajuan baru (pegawai only)
        Route::post('/', function (Request $request) {
            return ['message' => 'Pengajuan created'];
        })->middleware('ability:pengajuan:create');

        // Lihat semua pengajuan (kepegawaian, verifikator, bendahara, upt_remunerasi)
        Route::get('/', function (Request $request) {
            return ['message' => 'List all pengajuan'];
        })->middleware('ability:pengajuan:read-all,pengajuan:read-unit');

        // Lihat pengajuan sendiri
        Route::get('/own', function (Request $request) {
            return ['message' => 'List own pengajuan'];
        })->middleware('ability:pengajuan:read-own');

        // Verify pengajuan (kepegawaian, verifikator)
        Route::post('/{id}/verify', function (Request $request, $id) {
            return ['message' => "Pengajuan {$id} verified"];
        })->middleware('ability:pengajuan:verify');

        // Approve pengajuan (bendahara, pj_unit, upt_remunerasi)
        Route::post('/{id}/approve', function (Request $request, $id) {
            return ['message' => "Pengajuan {$id} approved"];
        })->middleware('ability:pengajuan:approve,pengajuan:approve-unit,pengajuan:approve-final');

        // Reject pengajuan
        Route::post('/{id}/reject', function (Request $request, $id) {
            return ['message' => "Pengajuan {$id} rejected"];
        })->middleware('ability:pengajuan:reject,pengajuan:reject-unit');
    });

    // Manajemen Pegawai (Kepegawaian / Admin)
    Route::prefix('manajemen-pegawai')->group(function () {
        Route::get('/', fn () => ['message' => 'List pegawai'])->middleware('ability:pegawai:read-all,pegawai:read-unit');
        Route::post('/', fn () => ['message' => 'Create pegawai'])->middleware('ability:pegawai:create');
        Route::put('/{id}', fn ($id) => ['message' => "Update pegawai {$id}"])->middleware('ability:pegawai:update');
    });

    // Laporan
    Route::prefix('laporan')->group(function () {
        Route::get('/', fn () => ['message' => 'List laporan'])->middleware('ability:laporan:read-all,laporan:read-unit');
        Route::post('/generate', fn () => ['message' => 'Generate laporan'])->middleware('ability:laporan:generate');
    });

    // Pengaturan Sistem
    Route::prefix('pengaturan')->group(function () {
        Route::get('/', fn () => ['message' => 'Get pengaturan'])->middleware('ability:pengaturan:manage');
        Route::put('/', fn () => ['message' => 'Update pengaturan'])->middleware('ability:pengaturan:manage');
    });
});
