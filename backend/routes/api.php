<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\Bendahara\AmprahController as BendaharaAmprahController;
use App\Http\Controllers\Bendahara\DashboardController as BendaharaDashboardController;
use App\Http\Controllers\Bendahara\PerhitunganController as BendaharaPerhitunganController;
use App\Http\Controllers\Bendahara\RekapitulasiController as BendaharaRekapitulasiController;
use App\Http\Controllers\Bendahara\StatusPengajuanController as BendaharaStatusPengajuanController;
use App\Http\Controllers\Kepegawaian\HukumanDisiplinController as KepegawaianHukumanDisiplinController;
use App\Http\Controllers\Kepegawaian\PengaduanKepegawaianController as KepegawaianPengaduanController;
use App\Http\Controllers\Kepegawaian\PresensiController as KepegawaianPresensiController;
use App\Http\Controllers\Kepegawaian\StatusPegawaiController as KepegawaianStatusPegawaiController;
use App\Http\Controllers\Kepegawaian\UsulanJabatanController as KepegawaianUsulanJabatanController;
use App\Http\Controllers\Pegawai\PengaduanController as PegawaiPengaduanController;
use App\Http\Controllers\Pegawai\ProfilController as PegawaiProfilController;
use App\Http\Controllers\Pegawai\SlipController as PegawaiSlipController;
use App\Http\Controllers\PjUnit\PjUnitController;
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
use App\Http\Controllers\Verifikator\AuditLogVerifikatorController as VerifikatorAuditLogController;
use App\Http\Controllers\Verifikator\DashboardController as VerifikatorDashboardController;
use App\Http\Controllers\Verifikator\PantauStatusController as VerifikatorPantauStatusController;
use App\Http\Controllers\Verifikator\VerifikasiJabatanController as VerifikatorJabatanController;
use App\Http\Controllers\Verifikator\VerifikasiPengajuanController as VerifikatorPengajuanController;
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
        Route::post('/pengaduan/{id}/pesan', [PegawaiPengaduanController::class, 'storeTanggapan']);
    });

    // ========================================================
    // ROLE KEPEGAWAIAN (L0-L6: PEGAWAI, HUKDIS, PRESENSI, USULAN, DOKUMEN, PENGADUAN)
    // ========================================================
    Route::prefix('kepegawaian')->middleware('peran:kepegawaian')->group(function () {
        // Dashboard, L0 Acuan Hitung Manual 10 Pegawai Sampel, & L11 Uji Silang Engine P1
        Route::get('/dashboard', [KepegawaianUsulanJabatanController::class, 'dashboard']);
        Route::get('/acuan-uji-p1', [KepegawaianPengaduanController::class, 'acuanUjiP1']);
        Route::get('/uji-silang-p1', [PjUnitController::class, 'ujiSilangEngineP1']);

        // L1 (FR-03): CRUD Data Pegawai, Tolak NIP Ganda, Nonaktifkan/Aktifkan, Status Tugas Belajar
        Route::get('/pegawai', [KepegawaianStatusPegawaiController::class, 'index']);
        Route::post('/pegawai', [KepegawaianStatusPegawaiController::class, 'store']);
        Route::get('/pegawai/{nip}', [KepegawaianStatusPegawaiController::class, 'show']);
        Route::put('/pegawai/{nip}', [KepegawaianStatusPegawaiController::class, 'update']);
        Route::patch('/pegawai/{nip}/nonaktifkan', [KepegawaianStatusPegawaiController::class, 'nonaktifkan']);
        Route::delete('/pegawai/{nip}', [KepegawaianStatusPegawaiController::class, 'nonaktifkan']);
        Route::patch('/pegawai/{nip}/aktifkan', [KepegawaianStatusPegawaiController::class, 'aktifkan']);
        Route::put('/pegawai/{nip}/tugas-belajar', [KepegawaianStatusPegawaiController::class, 'updateStatusTugasBelajar']);

        // L2 (FR-06): Hukuman Disiplin & Validasi Tanggal
        Route::get('/hukuman', [KepegawaianHukumanDisiplinController::class, 'index']);
        Route::post('/hukuman', [KepegawaianHukumanDisiplinController::class, 'store']);
        Route::put('/hukuman/{id}', [KepegawaianHukumanDisiplinController::class, 'update']);

        // L3 & L4 (FR-07, NFR-11): Impor Presensi & Cuti/Izin, Baris Gagal, dan Koreksi Presensi
        Route::get('/presensi', [KepegawaianPresensiController::class, 'index']);
        Route::post('/presensi/import', [KepegawaianPresensiController::class, 'import']);
        Route::put('/presensi/baris-gagal/{reportId}/{barisIndex}', [KepegawaianPresensiController::class, 'koreksiBarisGagal']);
        Route::put('/presensi/{nip}', [KepegawaianPresensiController::class, 'koreksiPresensi']);
        Route::get('/presensi/export', [KepegawaianPresensiController::class, 'exportCsv']);

        // L5 & L6 (FR-04, FR-05, NFR-11): Usulan Perubahan Jabatan/Grade & Unggah Dokumen SK/SPMT PDF maks. 5 MB
        Route::get('/usulan', [KepegawaianUsulanJabatanController::class, 'index']);
        Route::post('/usulan', [KepegawaianUsulanJabatanController::class, 'store']);
        Route::get('/usulan/{id}', [KepegawaianUsulanJabatanController::class, 'show']);
        Route::put('/usulan/{id}', [KepegawaianUsulanJabatanController::class, 'update']);
        Route::post('/usulan/{id}', [KepegawaianUsulanJabatanController::class, 'update']);
        Route::post('/usulan/{id}/ajukan-ulang', [KepegawaianUsulanJabatanController::class, 'update']);
        Route::delete('/usulan/{id}', [KepegawaianUsulanJabatanController::class, 'destroy']);
        Route::post('/usulan/{id}/dokumen', [KepegawaianUsulanJabatanController::class, 'uploadDokumen']);
        Route::get('/dokumen/{dokumenId}', [KepegawaianUsulanJabatanController::class, 'downloadDokumen']);
        Route::get('/dokumen/{dokumenId}/download', [KepegawaianUsulanJabatanController::class, 'downloadDokumen']);
        Route::get('/jabatan/list', [KepegawaianUsulanJabatanController::class, 'listJabatan']);

        // FR-08: Menindaklanjuti Pengaduan Pegawai
        Route::get('/pengaduan', [KepegawaianPengaduanController::class, 'index']);
        Route::get('/pengaduan/{id}', [KepegawaianPengaduanController::class, 'show']);
        Route::post('/pengaduan/{id}/tanggapi', [KepegawaianPengaduanController::class, 'tanggapi']);
        Route::post('/pengaduan/{id}/tanggapan', [KepegawaianPengaduanController::class, 'tanggapi']);
    });

    // ========================================================
    // ROLE PENANGGUNG JAWAB REMUNERASI UNIT (L7-L11: FR-18, FR-19, FR-20 - HANYA BACA)
    // ========================================================
    Route::prefix('pj-unit')->middleware('peran:pj_unit')->group(function () {
        Route::get('/dashboard', [PjUnitController::class, 'dashboard']);
        Route::get('/pegawai', [PjUnitController::class, 'pegawai']);               // L7 (FR-20)
        Route::get('/status', [PjUnitController::class, 'statusPengajuan']);        // L8 (FR-18)
        Route::get('/rekapitulasi', [PjUnitController::class, 'rekapitulasi']);     // L9 (FR-19)
        Route::get('/rekapitulasi/export', [PjUnitController::class, 'exportRekapitulasi']);
        Route::get('/uji-silang-p1', [PjUnitController::class, 'ujiSilangEngineP1']); // L11

        // L10: Penolakan tegas terhadap seluruh percobaan modifikasi data (Hanya Baca / Read-Only)
        Route::match(['post', 'put', 'patch', 'delete'], '/pegawai/{any?}', [PjUnitController::class, 'rejectWriteAction'])->where('any', '.*');
        Route::match(['post', 'put', 'patch', 'delete'], '/status/{any?}', [PjUnitController::class, 'rejectWriteAction'])->where('any', '.*');
        Route::match(['post', 'put', 'patch', 'delete'], '/rekapitulasi/{any?}', [PjUnitController::class, 'rejectWriteAction'])->where('any', '.*');
        Route::match(['post', 'put', 'patch', 'delete'], '/{any?}', [PjUnitController::class, 'rejectWriteAction'])->where('any', '.*');
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
    // ROLE VERIFIKATOR (FR-21 S.D. FR-26)
    // ========================================================
    Route::prefix('verifikator')->middleware('peran:verifikator')->group(function () {
        // Beranda & Ringkasan Antrean
        Route::get('/dashboard', [VerifikatorDashboardController::class, 'index']);
        Route::get('/beranda', [VerifikatorDashboardController::class, 'index']);

        // FR-23: Memverifikasi Pengajuan P1
        Route::get('/pengajuan', [VerifikatorPengajuanController::class, 'index']);
        Route::get('/pengajuan/{id}', [VerifikatorPengajuanController::class, 'show']);
        Route::post('/pengajuan/{id}/setujui', [VerifikatorPengajuanController::class, 'setujui']);
        Route::post('/pengajuan/{id}/verifikasi', [VerifikatorPengajuanController::class, 'setujui']);
        Route::post('/pengajuan/{id}/kembalikan', [VerifikatorPengajuanController::class, 'kembalikan']);

        // FR-24: Memverifikasi Perubahan Jabatan/Grade
        Route::get('/jabatan', [VerifikatorJabatanController::class, 'index']);
        Route::get('/usulan', [VerifikatorJabatanController::class, 'index']);
        Route::get('/jabatan/{id}', [VerifikatorJabatanController::class, 'show']);
        Route::get('/usulan/{id}', [VerifikatorJabatanController::class, 'show']);
        Route::post('/jabatan/{id}/setujui', [VerifikatorJabatanController::class, 'setujui']);
        Route::post('/usulan/{id}/setujui', [VerifikatorJabatanController::class, 'setujui']);
        Route::post('/jabatan/{id}/verifikasi', [VerifikatorJabatanController::class, 'setujui']);
        Route::post('/usulan/{id}/verifikasi', [VerifikatorJabatanController::class, 'setujui']);
        Route::post('/jabatan/{id}/kembalikan', [VerifikatorJabatanController::class, 'kembalikan']);
        Route::post('/usulan/{id}/kembalikan', [VerifikatorJabatanController::class, 'kembalikan']);

        // FR-25: Memantau Status Pengajuan P1
        Route::get('/status', [VerifikatorPantauStatusController::class, 'index']);

        // FR-26: Melihat Jejak Audit
        Route::get('/audit', [VerifikatorAuditLogController::class, 'index']);
        Route::get('/audit-log', [VerifikatorAuditLogController::class, 'index']);
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
