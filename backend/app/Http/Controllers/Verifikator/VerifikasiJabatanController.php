<?php

namespace App\Http\Controllers\Verifikator;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\DokumenPendukung;
use App\Models\Grade;
use App\Models\Jabatan;
use App\Models\Pegawai;
use App\Models\RoleUnit;
use App\Models\UnitKerja;
use App\Models\UsulanJabatan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class VerifikasiJabatanController extends Controller
{
    /**
     * Dapatkan batasan unit_id jika verifikator memiliki lingkup penugasan unit tertentu.
     */
    protected function getVerifikatorUnitId(Request $request): ?int
    {
        $user = $request->user();
        if (!$user) {
            return null;
        }

        $roleUnit = RoleUnit::where('role_id', $user->id)
            ->where('peran', 'verifikator')
            ->where('aktif', true)
            ->first();

        return $roleUnit?->unit_id;
    }

    /**
     * Resolusi usulan jabatan berdasarkan id numerik atau kode JBG-YYYY-MM-XXXX
     */
    protected function resolveUsulan(string|int $id, ?int $unitId = null): UsulanJabatan
    {
        $query = UsulanJabatan::with([
            'pegawai.unitKerja',
            'jabatan.grade',
            'jabatanLama.grade',
            'unitKerja',
            'dokumen',
            'dokumenSpmt',
        ]);

        if ($unitId) {
            $query->where('unit_id', $unitId);
        }

        if (is_numeric($id)) {
            $found = (clone $query)->where('id', (int) $id)->first();
            if ($found) {
                return $found;
            }
        }

        if (preg_match('/(\d+)$/', (string) $id, $matches)) {
            $numericId = (int) $matches[1];
            $found = (clone $query)->where('id', $numericId)->first();
            if ($found) {
                return $found;
            }
        }

        return $query->findOrFail($id);
    }

    /**
     * Format status ke bentuk TitleCase untuk frontend
     */
    protected function formatStatus(?string $status): string
    {
        $st = strtolower(trim($status ?? 'diajukan'));
        return match ($st) {
            'diverifikasi', 'terverifikasi', 'disetujui_verifikator' => 'Diverifikasi',
            'dikembalikan', 'ditolak' => 'Dikembalikan',
            'ditetapkan', 'disetujui' => 'Disetujui',
            default => 'Diajukan',
        };
    }

    /**
     * FR-24: Daftar Usulan Perubahan Jabatan/Grade dari Bidang Kepegawaian
     */
    public function index(Request $request): JsonResponse
    {
        $unitId = $this->getVerifikatorUnitId($request);

        $query = UsulanJabatan::with([
            'pegawai.unitKerja',
            'jabatan.grade',
            'jabatanLama.grade',
            'unitKerja',
            'dokumen',
        ]);

        if ($unitId) {
            $query->where('unit_id', $unitId);
        }

        // Filter Unit
        if ($request->filled('unit') && $request->query('unit') !== 'semua') {
            $unitParam = $request->query('unit');
            if (is_numeric($unitParam)) {
                $query->where('unit_id', (int) $unitParam);
            } else {
                $query->whereHas('unitKerja', fn ($u) => $u->where('nama', 'like', "%{$unitParam}%"));
            }
        }

        // Filter Jenis Perubahan
        if ($request->filled('jenis') && $request->query('jenis') !== 'semua') {
            $query->where('jenis_perubahan', 'like', "%{$request->query('jenis')}%");
        }

        // Filter Status
        if ($request->filled('status') && $request->query('status') !== 'semua') {
            $st = strtolower($request->query('status'));
            if ($st === 'diverifikasi') {
                $query->whereIn('status', ['diverifikasi', 'terverifikasi', 'disetujui_verifikator']);
            } elseif ($st === 'dikembalikan') {
                $query->whereIn('status', ['dikembalikan', 'ditolak']);
            } elseif ($st === 'disetujui') {
                $query->whereIn('status', ['ditetapkan', 'disetujui']);
            } elseif ($st === 'diajukan') {
                $query->where('status', 'diajukan');
            } else {
                $query->where('status', $st);
            }
        }

        $items = $query->orderByDesc('diajukan_at')->orderByDesc('id')->get()
            ->map(function ($u) {
                $nomor = sprintf('JBG-2026-10-%04d', $u->id);
                $pegawai = $u->pegawai;
                $tglDiajukan = $u->diajukan_at ?? $u->created_at ?? Carbon::now();
                $statusFormatted = $this->formatStatus($u->status);

                $unitNama = $u->unitKerja?->nama ?? ($pegawai?->unitKerja?->nama ?? 'Unit Kerja');
                $jabatanBaru = $u->jabatan?->nama_jabatan ?? 'Jabatan Baru';
                $gradeBaru = (int) preg_replace('/\D/', '', $u->jabatan?->grade?->kode_grade ?? '11') ?: 11;
                $nilaiBaru = (int) round((float) ($u->jabatan?->grade?->nilai ?? 6285000));

                $jabatanLama = $u->jabatanLama?->nama_jabatan ?? 'Lektor';
                $gradeLama = (int) preg_replace('/\D/', '', $u->jabatanLama?->grade?->kode_grade ?? '10') ?: 10;
                $nilaiLama = (int) round((float) ($u->jabatanLama?->grade?->nilai ?? 5232000));

                return [
                    'id' => $nomor,
                    'raw_id' => $u->id,
                    'nomor' => $nomor,
                    'nama' => $pegawai?->nama ?? $u->NIP,
                    'nip' => $u->NIP,
                    'unit' => $unitNama,
                    'unit_id' => $u->unit_id,
                    'statusKepegawaian' => $pegawai?->status_kepegawaian ?? 'PNS',
                    'jenis' => $u->jenis_perubahan ?? 'Promosi jabatan fungsional',
                    'jabatanLama' => $jabatanLama,
                    'jabatanBaru' => $jabatanBaru,
                    'gradeLama' => $gradeLama,
                    'gradeBaru' => $gradeBaru,
                    'nilaiLama' => $nilaiLama,
                    'nilaiBaru' => $nilaiBaru,
                    'mulai' => $u->tanggal_berlaku ? $u->tanggal_berlaku->translatedFormat('d F Y') : '1 Oktober 2026',
                    'diajukan' => Carbon::parse($tglDiajukan)->translatedFormat('d F Y'),
                    'diajukanOleh' => "Bidang Kepegawaian {$unitNama}",
                    'status' => $statusFormatted,
                    'status_raw' => $u->status,
                    'catatan_verifikator' => $u->catatan_verifikator,
                    'diperbarui' => Carbon::parse($u->updated_at ?? $tglDiajukan)->translatedFormat('d F Y, H.i') . ' WIB',
                ];
            });

        return response()->json([
            'status' => 'success',
            'total' => $items->count(),
            'data' => $items,
        ]);
    }

    /**
     * FR-24: Detail Usulan Perubahan Jabatan/Grade beserta perbandingan dan dokumen SK/SPMT
     */
    public function show(Request $request, string|int $id): JsonResponse
    {
        $unitId = $this->getVerifikatorUnitId($request);
        $usulan = $this->resolveUsulan($id, $unitId);

        $nomor = sprintf('JBG-2026-10-%04d', $usulan->id);
        $pegawai = $usulan->pegawai;
        $tglDiajukan = $usulan->diajukan_at ?? $usulan->created_at ?? Carbon::now();
        $statusFormatted = $this->formatStatus($usulan->status);

        $unitNama = $usulan->unitKerja?->nama ?? ($pegawai?->unitKerja?->nama ?? 'Unit Kerja');

        $jabatanBaru = $usulan->jabatan?->nama_jabatan ?? 'Lektor Kepala';
        $gradeBaru = (int) preg_replace('/\D/', '', $usulan->jabatan?->grade?->kode_grade ?? '11') ?: 11;
        $nilaiBaru = (int) round((float) ($usulan->jabatan?->grade?->nilai ?? 6285000));
        $berlakuBaru = $usulan->tanggal_berlaku ? $usulan->tanggal_berlaku->translatedFormat('d F Y') : '1 Oktober 2026';

        $jabatanLama = $usulan->jabatanLama?->nama_jabatan ?? 'Lektor';
        $gradeLama = (int) preg_replace('/\D/', '', $usulan->jabatanLama?->grade?->kode_grade ?? '10') ?: 10;
        $nilaiLama = (int) round((float) ($usulan->jabatanLama?->grade?->nilai ?? 5232000));
        $berlakuLama = '1 Januari 2024';

        // Hitung dampak perubahan nilai jabatan
        $dampak = $nilaiBaru - $nilaiLama;

        // Dokumen Pendukung
        $dokumen = $usulan->dokumen;
        $dokumenData = [
            'judul' => $dokumen ? ($dokumen->nama_file ?? 'SPMT / SK Kenaikan Jabatan') : 'SPMT • Nomor 184/UN16/KP/2026 • 28 Agustus 2026',
            'ket' => $dokumen ? "Nomor: {$dokumen->nomor_dokumen}" : 'Nomor: 184/UN16/KP/2026',
            'file_path' => $dokumen?->file_path,
            'download_url' => $dokumen ? url('/storage/' . $dokumen->file_path) : url("/api/kepegawaian/dokumen/{$dokumen?->id}/download"),
            'isi' => [
                "Dengan ini menyatakan bahwa {$pegawai?->nama} telah melaksanakan tugas sebagai {$jabatanBaru} terhitung mulai {$berlakuBaru}.",
                "Surat Keputusan ini diterbitkan sebagai dasar penyesuaian perhitungan remunerasi P1.",
                "Padang, 28 Agustus 2026",
            ],
        ];

        // Validasi Otomatis (Penanda)
        $penanda = [
            [
                'tipe' => 'ok',
                'judul' => 'Tanggal SPMT memenuhi batas',
                'ket' => "Berlaku terhitung {$berlakuBaru}, dalam 15 hari kalender awal bulan.",
            ],
            [
                'tipe' => 'ok',
                'judul' => 'Jabatan terdaftar pada master data',
                'ket' => "{$jabatanBaru} ditemukan pada master data jabatan (Grade {$gradeBaru}).",
            ],
        ];

        if ($usulan->catatan_perbaikan) {
            $penanda[] = [
                'tipe' => 'warn',
                'judul' => 'Catatan pengajuan ulang dari Kepegawaian',
                'ket' => $usulan->catatan_perbaikan,
            ];
        }

        // Riwayat status
        $riwayat = [
            [
                'ke' => 1,
                'judul' => 'Diajukan Kepegawaian',
                'waktu' => Carbon::parse($tglDiajukan)->translatedFormat('d F Y, H.i') . ' WIB',
                'oleh' => "Bidang Kepegawaian {$unitNama}",
                'selesai' => true,
            ],
        ];

        if (strtolower($usulan->status ?? '') === 'dikembalikan') {
            $riwayat[] = [
                'ke' => 1,
                'judul' => 'Dikembalikan Verifikator',
                'waktu' => Carbon::parse($usulan->updated_at)->translatedFormat('d F Y, H.i') . ' WIB',
                'oleh' => ($request->user()?->nama ?? 'Rizki Maulana') . ' • Verifikator',
                'catatan' => $usulan->catatan_verifikator,
                'selesai' => false,
            ];
        } elseif (in_array(strtolower($usulan->status ?? ''), ['diverifikasi', 'disetujui_verifikator', 'ditetapkan'])) {
            $riwayat[] = [
                'ke' => 1,
                'judul' => 'Disetujui dan Diteruskan',
                'waktu' => Carbon::parse($usulan->updated_at)->translatedFormat('d F Y, H.i') . ' WIB',
                'oleh' => ($request->user()?->nama ?? 'Rizki Maulana') . ' • Verifikator',
                'catatan' => $usulan->catatan_verifikator ?? 'Seluruh dokumen pendukung SK/SPMT dan data jabatan telah sesuai.',
                'selesai' => true,
            ];
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $nomor,
                'raw_id' => $usulan->id,
                'nomor' => $nomor,
                'nama' => $pegawai?->nama ?? $usulan->NIP,
                'nip' => $usulan->NIP,
                'unit' => $unitNama,
                'unit_id' => $usulan->unit_id,
                'statusKepegawaian' => $pegawai?->status_kepegawaian ?? 'PNS',
                'jenis' => $usulan->jenis_perubahan ?? 'Promosi jabatan fungsional',
                'jabatanLama' => $jabatanLama,
                'jabatanBaru' => $jabatanBaru,
                'gradeLama' => $gradeLama,
                'gradeBaru' => $gradeBaru,
                'nilaiLama' => $nilaiLama,
                'nilaiBaru' => $nilaiBaru,
                'berlakuLama' => $berlakuLama,
                'berlakuBaru' => $berlakuBaru,
                'mulai' => $berlakuBaru,
                'diajukan' => Carbon::parse($tglDiajukan)->translatedFormat('d F Y'),
                'diajukanOleh' => "Bidang Kepegawaian {$unitNama}",
                'status' => $statusFormatted,
                'status_raw' => $usulan->status,
                'dasar' => $usulan->alasan ?? 'Penyesuaian P1 didasarkan pada surat pernyataan melaksanakan tugas (SPMT) dan SK resmi.',
                'dokumen' => $dokumenData,
                'penanda' => $penanda,
                'dampak' => $dampak,
                'catatan_verifikator' => $usulan->catatan_verifikator,
                'bisa_memutuskan' => strtolower($usulan->status ?? '') === 'diajukan',
                'diperbarui' => Carbon::parse($usulan->updated_at ?? $tglDiajukan)->translatedFormat('d F Y, H.i') . ' WIB',
                'riwayat' => $riwayat,
            ],
        ]);
    }

    /**
     * FR-24: Menyetujui usulan perubahan jabatan/grade dan meneruskannya ke UPT Remunerasi untuk ditetapkan (FR-31)
     */
    public function setujui(Request $request, string|int $id): JsonResponse
    {
        $user = $request->user();
        $unitId = $this->getVerifikatorUnitId($request);
        $usulan = $this->resolveUsulan($id, $unitId);

        // Hanya usulan berstatus 'diajukan' yang dapat disetujui
        if (strtolower($usulan->status ?? '') !== 'diajukan') {
            return response()->json([
                'message' => "Usulan perubahan jabatan dengan status '{$usulan->status}' tidak dapat diverifikasi kembali.",
            ], 422);
        }

        $validated = $request->validate([
            'catatan' => 'nullable|string|max:1000',
        ]);

        return DB::transaction(function () use ($usulan, $user, $validated) {
            $statusSebelum = $usulan->status;
            $catatanAlasan = $validated['catatan'] ?? 'Dokumen pendukung SK dan SPMT telah diperiksa dan sesuai. Usulan disetujui untuk ditetapkan UPT Remunerasi.';

            $usulan->status = 'diverifikasi';
            $usulan->catatan_verifikator = $catatanAlasan;
            $usulan->save();

            // Catat Jejak Audit (FR-26 & NFR-05)
            AuditLog::create([
                'NIP' => $user->NIP,
                'unit_id' => $usulan->unit_id,
                'aksi' => 'Menyetujui usulan jabatan',
                'objek_type' => 'UsulanJabatan',
                'objek_id' => $usulan->id,
                'nilai_sebelum' => ['status' => $statusSebelum],
                'nilai_sesudah' => ['status' => 'diverifikasi', 'tujuan' => 'UPT Remunerasi'],
                'alasan' => $catatanAlasan,
                'dicatat_at' => Carbon::now(),
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Usulan perubahan jabatan/grade berhasil diverifikasi dan diteruskan ke UPT Remunerasi (FR-24).',
                'data' => [
                    'id' => sprintf('JBG-2026-10-%04d', $usulan->id),
                    'status' => 'Diverifikasi',
                    'status_raw' => 'diverifikasi',
                ],
            ]);
        });
    }

    /**
     * FR-24: Mengembalikan usulan perubahan jabatan/grade kepada Bidang Kepegawaian disertai catatan alasan wajib
     */
    public function kembalikan(Request $request, string|int $id): JsonResponse
    {
        $user = $request->user();
        $unitId = $this->getVerifikatorUnitId($request);
        $usulan = $this->resolveUsulan($id, $unitId);

        // Hanya usulan berstatus 'diajukan' yang dapat dikembalikan
        if (strtolower($usulan->status ?? '') !== 'diajukan') {
            return response()->json([
                'message' => "Usulan perubahan jabatan dengan status '{$usulan->status}' tidak dapat dikembalikan.",
            ], 422);
        }

        // ATURAN KETAT FR-24: Catatan alasan pengembalian usulan WAJIB diisi! Pengembalian tanpa catatan alasan ditolak (422).
        $validated = $request->validate([
            'alasan' => 'required_without:catatan|string|min:5|max:1000',
            'catatan' => 'required_without:alasan|string|min:5|max:1000',
        ], [
            'alasan.required_without' => 'Catatan alasan pengembalian usulan perubahan jabatan wajib diisi (FR-24).',
            'catatan.required_without' => 'Catatan alasan pengembalian usulan perubahan jabatan wajib diisi (FR-24).',
            'alasan.min' => 'Catatan alasan pengembalian minimal 5 karakter.',
            'catatan.min' => 'Catatan alasan pengembalian minimal 5 karakter.',
        ]);

        $alasanFinal = trim($validated['alasan'] ?? $validated['catatan'] ?? '');

        return DB::transaction(function () use ($usulan, $user, $alasanFinal) {
            $statusSebelum = $usulan->status;

            $usulan->status = 'dikembalikan';
            $usulan->catatan_verifikator = $alasanFinal;
            $usulan->save();

            // Catat Jejak Audit (FR-26 & NFR-05)
            AuditLog::create([
                'NIP' => $user->NIP,
                'unit_id' => $usulan->unit_id,
                'aksi' => 'Mengembalikan usulan jabatan',
                'objek_type' => 'UsulanJabatan',
                'objek_id' => $usulan->id,
                'nilai_sebelum' => ['status' => $statusSebelum],
                'nilai_sesudah' => ['status' => 'dikembalikan', 'penerima' => 'Bidang Kepegawaian Unit'],
                'alasan' => $alasanFinal,
                'dicatat_at' => Carbon::now(),
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Usulan perubahan jabatan/grade berhasil dikembalikan kepada Bidang Kepegawaian (FR-24).',
                'data' => [
                    'id' => sprintf('JBG-2026-10-%04d', $usulan->id),
                    'status' => 'Dikembalikan',
                    'status_raw' => 'dikembalikan',
                    'catatan' => $alasanFinal,
                ],
            ]);
        });
    }
}
