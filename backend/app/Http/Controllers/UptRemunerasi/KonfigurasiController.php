<?php

namespace App\Http\Controllers\UptRemunerasi;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\ParameterRemunerasi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;

class KonfigurasiController extends Controller
{
    protected function authorizeUpt(Request $request): void
    {
        $user = $request->user();
        if (!$user || !$user->hasRole('upt_remunerasi')) {
            abort(403, 'Akses ditolak: Anda tidak memiliki wewenang sebagai UPT Remunerasi.');
        }
    }

    /**
     * Ambil konfigurasi sistem
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorizeUpt($request);

        $config = [
            'periode_aktif' => $this->getPeriodeAktif(),
            'batas_pengajuan' => $this->getBatasPengajuan(),
            'mode_sistem' => $this->getModeSistem(),
            'fitur' => [
                'auto_hitung_pajak' => $this->getFiturStatus('auto_hitung_pajak'),
                'notifikasi_otomatis' => $this->getFiturStatus('notifikasi_otomatis'),
                'validasi_ketat' => $this->getFiturStatus('validasi_ketat'),
            ],
            'parameter_remunerasi' => $this->getParameterRemunerasi(),
        ];

        return response()->json($config);
    }

    /**
     * Update konfigurasi periode aktif
     */
    public function updatePeriodeAktif(Request $request): JsonResponse
    {
        $this->authorizeUpt($request);

        $validated = $request->validate([
            'periode' => 'required|string|regex:/^\d{4}-\d{2}$/',
        ]);

        $periodeSebelum = $this->getPeriodeAktif();
        
        Cache::put('periode_aktif', $validated['periode'], now()->addMonths(3));

        // Audit log
        AuditLog::create([
            'NIP' => $request->user()->NIP,
            'aksi' => 'Update Periode Aktif',
            'objek_type' => 'Konfigurasi',
            'objek_id' => null,
            'nilai_sebelum' => ['periode' => $periodeSebelum],
            'nilai_sesudah' => ['periode' => $validated['periode']],
            'alasan' => 'Perubahan periode remunerasi aktif',
            'dicatat_at' => Carbon::now(),
        ]);

        return response()->json([
            'message' => 'Periode aktif berhasil diperbarui.',
            'periode' => $validated['periode'],
        ]);
    }

    /**
     * Update batas tanggal pengajuan
     */
    public function updateBatasPengajuan(Request $request): JsonResponse
    {
        $this->authorizeUpt($request);

        $validated = $request->validate([
            'tanggal' => 'required|integer|min:1|max:28',
        ]);

        $batasSebelum = $this->getBatasPengajuan();
        
        Cache::put('batas_pengajuan', $validated['tanggal'], now()->addMonths(3));

        // Audit log
        AuditLog::create([
            'NIP' => $request->user()->NIP,
            'aksi' => 'Update Batas Pengajuan',
            'objek_type' => 'Konfigurasi',
            'objek_id' => null,
            'nilai_sebelum' => ['tanggal' => $batasSebelum],
            'nilai_sesudah' => ['tanggal' => $validated['tanggal']],
            'alasan' => 'Perubahan batas waktu pengajuan remunerasi',
            'dicatat_at' => Carbon::now(),
        ]);

        return response()->json([
            'message' => 'Batas pengajuan berhasil diperbarui.',
            'tanggal' => $validated['tanggal'],
        ]);
    }

    /**
     * Toggle mode sistem (normal/maintenance)
     */
    public function toggleModeSistem(Request $request): JsonResponse
    {
        $this->authorizeUpt($request);

        $validated = $request->validate([
            'mode' => 'required|string|in:normal,maintenance,read_only',
            'alasan' => 'nullable|string|max:500',
        ]);

        $modeSebelum = $this->getModeSistem();
        
        Cache::put('mode_sistem', $validated['mode'], now()->addDays(1));

        // Audit log
        AuditLog::create([
            'NIP' => $request->user()->NIP,
            'aksi' => 'Ubah Mode Sistem',
            'objek_type' => 'Konfigurasi',
            'objek_id' => null,
            'nilai_sebelum' => ['mode' => $modeSebelum],
            'nilai_sesudah' => ['mode' => $validated['mode']],
            'alasan' => $validated['alasan'] ?? 'Perubahan mode sistem',
            'dicatat_at' => Carbon::now(),
        ]);

        return response()->json([
            'message' => 'Mode sistem berhasil diubah.',
            'mode' => $validated['mode'],
        ]);
    }

    /**
     * Toggle status fitur
     */
    public function toggleFitur(Request $request): JsonResponse
    {
        $this->authorizeUpt($request);

        $validated = $request->validate([
            'fitur' => 'required|string|in:auto_hitung_pajak,notifikasi_otomatis,validasi_ketat',
            'aktif' => 'required|boolean',
        ]);

        $statusSebelum = $this->getFiturStatus($validated['fitur']);
        
        Cache::put("fitur_{$validated['fitur']}", $validated['aktif'], now()->addMonths(1));

        // Audit log
        AuditLog::create([
            'NIP' => $request->user()->NIP,
            'aksi' => 'Toggle Fitur',
            'objek_type' => 'Konfigurasi',
            'objek_id' => null,
            'nilai_sebelum' => ['fitur' => $validated['fitur'], 'aktif' => $statusSebelum],
            'nilai_sesudah' => ['fitur' => $validated['fitur'], 'aktif' => $validated['aktif']],
            'alasan' => 'Perubahan status fitur sistem',
            'dicatat_at' => Carbon::now(),
        ]);

        return response()->json([
            'message' => 'Status fitur berhasil diubah.',
            'fitur' => $validated['fitur'],
            'aktif' => $validated['aktif'],
        ]);
    }

    /**
     * Update parameter remunerasi batch
     */
    public function updateParameterBatch(Request $request): JsonResponse
    {
        $this->authorizeUpt($request);

        $validated = $request->validate([
            'parameters' => 'required|array',
            'parameters.*.id' => 'required|integer|exists:parameter_remunerasi,id',
            'parameters.*.nilai' => 'required|numeric',
        ]);

        $updated = [];

        foreach ($validated['parameters'] as $param) {
            $parameter = ParameterRemunerasi::findOrFail($param['id']);
            $nilaiLama = $parameter->nilai;
            $parameter->nilai = $param['nilai'];
            $parameter->save();

            $updated[] = [
                'id' => $parameter->id,
                'kode' => $parameter->kode,
                'nilai_lama' => (float) $nilaiLama,
                'nilai_baru' => (float) $parameter->nilai,
            ];

            // Audit log
            AuditLog::create([
                'NIP' => $request->user()->NIP,
                'aksi' => 'Update Parameter Batch',
                'objek_type' => 'ParameterRemunerasi',
                'objek_id' => $parameter->id,
                'nilai_sebelum' => ['kode' => $parameter->kode, 'nilai' => $nilaiLama],
                'nilai_sesudah' => ['kode' => $parameter->kode, 'nilai' => $parameter->nilai],
                'alasan' => 'Pembaruan batch parameter remunerasi',
                'dicatat_at' => Carbon::now(),
            ]);
        }

        // Clear cache parameter
        Cache::forget('parameter_remunerasi');

        return response()->json([
            'message' => count($updated) . ' parameter berhasil diperbarui.',
            'updated' => $updated,
        ]);
    }

    /**
     * Backup konfigurasi
     */
    public function backup(Request $request): JsonResponse
    {
        $this->authorizeUpt($request);

        $backup = [
            'timestamp' => now()->toIso8601String(),
            'periode_aktif' => $this->getPeriodeAktif(),
            'batas_pengajuan' => $this->getBatasPengajuan(),
            'mode_sistem' => $this->getModeSistem(),
            'fitur' => [
                'auto_hitung_pajak' => $this->getFiturStatus('auto_hitung_pajak'),
                'notifikasi_otomatis' => $this->getFiturStatus('notifikasi_otomatis'),
                'validasi_ketat' => $this->getFiturStatus('validasi_ketat'),
            ],
            'parameter_remunerasi' => ParameterRemunerasi::all()->map(fn ($p) => [
                'id' => $p->id,
                'kode' => $p->kode,
                'kategori' => $p->kategori,
                'nilai' => (float) $p->nilai,
            ]),
        ];

        // Simpan backup ke cache dengan TTL 30 hari
        $backupKey = 'backup_config_' . now()->timestamp;
        Cache::put($backupKey, $backup, now()->addDays(30));

        return response()->json([
            'message' => 'Backup konfigurasi berhasil dibuat.',
            'backup_key' => $backupKey,
            'backup' => $backup,
        ]);
    }

    // ==========================================
    // HELPER METHODS
    // ==========================================

    protected function getPeriodeAktif(): string
    {
        return Cache::get('periode_aktif', now()->format('Y-m'));
    }

    protected function getBatasPengajuan(): int
    {
        return (int) Cache::get('batas_pengajuan', 5);
    }

    protected function getModeSistem(): string
    {
        return Cache::get('mode_sistem', 'normal');
    }

    protected function getFiturStatus(string $fitur): bool
    {
        return (bool) Cache::get("fitur_{$fitur}", true);
    }

    protected function getParameterRemunerasi(): array
    {
        return Cache::remember('parameter_remunerasi', now()->addHours(6), function () {
            return ParameterRemunerasi::all()->map(fn ($p) => [
                'id' => $p->id,
                'kode' => $p->kode,
                'kategori' => $p->kategori,
                'nilai' => (float) $p->nilai,
                'berlaku_mulai' => $p->berlaku_mulai?->format('Y-m-d'),
            ])->toArray();
        });
    }
}
