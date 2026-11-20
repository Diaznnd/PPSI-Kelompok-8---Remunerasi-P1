<?php

namespace App\Http\Controllers\Kepegawaian;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\HasilPerhitungan;
use App\Models\HukumanDisiplin;
use App\Models\Pengaduan;
use App\Models\PresensiBulanan;
use App\Models\RoleUnit;
use App\Models\TanggapanPengaduan;
use App\Models\UsulanJabatan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class PengaduanKepegawaianController extends Controller
{
    protected function getKepegawaianUnitId(Request $request): ?int
    {
        $user = $request->user();
        if (!$user) {
            return null;
        }

        $roleUnit = RoleUnit::where('role_id', $user->id)
            ->where('peran', 'kepegawaian')
            ->where('aktif', true)
            ->first();

        return $roleUnit?->unit_id ?? $user->pegawai?->unit_id;
    }

    protected function resolvePengaduan(string|int $id): Pengaduan
    {
        if (is_numeric($id)) {
            $found = Pengaduan::with(['pegawai.unitKerja', 'tanggapan', 'hasilPerhitungan.pengajuan'])->find((int) $id);
            if ($found) {
                return $found;
            }
        }

        if (preg_match('/^ADU-(\d{4})-0*(\d+)$/i', (string) $id, $m)) {
            $num = (int) $m[2];
            $found = Pengaduan::with(['pegawai.unitKerja', 'tanggapan', 'hasilPerhitungan.pengajuan'])->find($num);
            if ($found) {
                return $found;
            }
        }

        return Pengaduan::with(['pegawai.unitKerja', 'tanggapan', 'hasilPerhitungan.pengajuan'])->findOrFail($id);
    }

    protected function formatPengaduan(Pengaduan $a): array
    {
        $tahun = $a->diajukan_at ? $a->diajukan_at->format('Y') : '2026';
        $kode = sprintf('ADU-%s-%03d', $tahun, $a->id);

        $statusRaw = strtolower($a->status ?? 'diajukan');
        $status = match (true) {
            in_array($statusRaw, ['selesai', 'diselesaikan'], true) => 'Selesai',
            in_array($statusRaw, ['diteruskan', 'dieskalasi', 'eskalasi', 'ditindaklanjuti'], true) || in_array(strtolower($a->tingkat ?? ''), ['upt', 'universitas'], true) => 'Diteruskan',
            default => 'Diajukan',
        };

        $penanganan = match ($status) {
            'Selesai' => 'Diselesaikan di unit',
            'Diteruskan' => 'Diteruskan ke UPT Remunerasi',
            default => 'Menunggu diagnosis',
        };

        $tanggapanTerakhir = $a->tanggapan?->sortByDesc('id')->first();

        return [
            'id' => $kode,
            'raw_id' => $a->id,
            'NIP' => $a->NIP,
            'nip' => $a->NIP,
            'nama' => $a->pegawai?->nama ?? $a->NIP,
            'kategori' => $a->kategori ?? 'Hasil perhitungan',
            'masuk' => $a->diajukan_at ? $a->diajukan_at->translatedFormat('j F Y') : now()->translatedFormat('j F Y'),
            'periode' => $a->periode ?? 'September 2026',
            'pengajuan' => $a->hasilPerhitungan?->pengajuan?->nomor_pengajuan ?? 'P1-FTI-2026-10',
            'isi' => $a->uraian ?? $a->judul ?? '',
            'status' => $status,
            'tingkat' => $a->tingkat ?? 'unit',
            'penanganan' => $penanganan,
            'tanggapan' => $tanggapanTerakhir?->isi,
        ];
    }

    /**
     * FR-08: Daftar pengaduan pegawai pada unit kerja Kepegawaian
     */
    public function index(Request $request): JsonResponse
    {
        $unitId = $this->getKepegawaianUnitId($request);

        $query = Pengaduan::with(['pegawai.unitKerja', 'tanggapan', 'hasilPerhitungan.pengajuan']);
        if ($unitId) {
            $query->where('unit_id', $unitId);
        }

        $items = $query->orderByDesc('diajukan_at')->orderByDesc('id')->get()
            ->map(fn ($a) => $this->formatPengaduan($a));

        if ($request->filled('status') && $request->query('status') !== 'semua') {
            $st = strtolower($request->query('status'));
            $items = $items->filter(fn ($i) => strtolower($i['status']) === $st)->values();
        }

        if ($request->filled('kategori') && $request->query('kategori') !== 'semua') {
            $kat = strtolower($request->query('kategori'));
            $items = $items->filter(fn ($i) => str_contains(strtolower($i['kategori']), $kat))->values();
        }

        if ($request->filled('q')) {
            $q = strtolower($request->query('q'));
            $items = $items->filter(fn ($i) => str_contains(strtolower($i['id'] . $i['nama'] . $i['isi']), $q))->values();
        }

        return response()->json([
            'total' => $items->count(),
            'data' => $items,
        ]);
    }

    /**
     * FR-08: Detail pengaduan beserta data diagnosis sumber (riwayat jabatan/grade, presensi, hukuman disiplin, rincian P1)
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $unitId = $this->getKepegawaianUnitId($request);
        $pengaduan = $this->resolvePengaduan($id);

        if ($unitId && $pengaduan->unit_id && $pengaduan->unit_id !== $unitId) {
            return response()->json([
                'message' => 'Akses ditolak: Pengaduan ini bukan berasal dari unit kerja Anda.',
            ], 403);
        }

        $formatted = $this->formatPengaduan($pengaduan);
        $nip = $pengaduan->NIP;

        $riwayatJabatan = UsulanJabatan::with('jabatan.grade')
            ->where('NIP', $nip)
            ->whereIn('status', ['ditetapkan', 'diverifikasi', 'disetujui_verifikator'])
            ->orderByDesc('tanggal_berlaku')
            ->get()
            ->map(fn ($u) => [
                'jabatan' => $u->jabatan?->nama_jabatan ?? '-',
                'grade' => $u->jabatan?->grade?->kode_grade ?? '-',
                'mulai_berlaku' => $u->tanggal_berlaku?->translatedFormat('j F Y') ?? '-',
                'status' => $u->status,
            ]);

        $presensi = PresensiBulanan::where('NIP', $nip)->latest('id')->first();
        $hukuman = HukumanDisiplin::where('NIP', $nip)->orderByDesc('tanggal_mulai')->get();
        $hasilP1 = HasilPerhitungan::where('NIP', $nip)->latest('id')->first();

        $formatted['diagnosis'] = [
            'riwayat_jabatan' => $riwayatJabatan,
            'presensi' => $presensi ? [
                'hari_kerja' => (int) round((float) $presensi->hari_kerja),
                'hadir' => (int) round((float) $presensi->hadir),
                'tidak_hadir' => (int) round((float) ($presensi->tidak_hadir ?: $presensi->alfa)),
                'cuti_izin' => (int) round((float) ($presensi->cuti_izin ?: ($presensi->cuti_sakit + $presensi->cuti_tahunan + $presensi->izin))),
            ] : null,
            'hukuman_disiplin' => $hukuman->map(fn ($h) => [
                'tingkat' => ucfirst(strtolower($h->tingkat ?? 'Ringan')),
                'jenis' => $h->jenis ?? '-',
                'nomor_sk' => $h->nomor_sk ?? '-',
                'mulai' => $h->tanggal_mulai?->format('Y-m-d'),
                'berakhir' => $h->tanggal_berakhir?->format('Y-m-d'),
            ]),
            'rincian_p1' => $hasilP1 ? [
                'p1_gross' => (float) $hasilP1->p1_gross,
                'p1_pertimbang' => (float) $hasilP1->p1_pertimbang,
                'pengurangan_rp' => (float) $hasilP1->pengurangan_rp,
                'persen_hukdis' => (float) $hasilP1->persen_hukdis,
                'p1_setelah_potongan' => (float) $hasilP1->p1_setelah_potongan,
                'pajak_pph21' => (float) $hasilP1->pajak_pph21,
                'p1_netto' => (float) $hasilP1->p1_netto,
            ] : null,
        ];

        return response()->json([
            'data' => $formatted,
        ]);
    }

    /**
     * FR-08: Tanggapi dan selesaikan pengaduan di unit atau teruskan (eskalasi) ke UPT Remunerasi (FR-40)
     */
    public function tanggapi(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $unitId = $this->getKepegawaianUnitId($request);
        $pengaduan = $this->resolvePengaduan($id);

        if ($unitId && $pengaduan->unit_id && $pengaduan->unit_id !== $unitId) {
            return response()->json([
                'message' => 'Akses ditolak: Pengaduan ini bukan berasal dari unit kerja Anda.',
            ], 403);
        }

        if (in_array(strtolower($pengaduan->status ?? ''), ['selesai', 'diteruskan'], true)) {
            return response()->json([
                'message' => 'Pengaduan ini sudah selesai ditangani atau sudah diteruskan ke UPT Remunerasi.',
            ], 422);
        }

        $validated = $request->validate([
            'tindakan' => ['required', 'in:selesai,teruskan'],
            'tanggapan' => ['required', 'string', 'min:10', 'max:2000'],
        ], [
            'tanggapan.required' => 'Isi tanggapan wajib diisi.',
            'tanggapan.min' => 'Tanggapan minimal 10 karakter.',
        ]);

        /** @var JsonResponse $response */
        $response = DB::transaction(function () use ($pengaduan, $validated, $user, $unitId): JsonResponse {
            $statusSebelum = $pengaduan->status;
            $tingkatSebelum = $pengaduan->tingkat;

            if ($validated['tindakan'] === 'selesai') {
                $pengaduan->status = 'Selesai';
                $pengaduan->tingkat = 'unit';
                $pengaduan->diselesaikan_at = now();
            } else {
                // Eskalasi ke UPT Remunerasi (FR-08 -> FR-40)
                $pengaduan->status = 'Diteruskan';
                $pengaduan->tingkat = 'universitas';
            }
            $pengaduan->save();

            TanggapanPengaduan::create([
                'pengaduan_id' => $pengaduan->id,
                'NIP' => $user?->NIP,
                'isi' => trim($validated['tanggapan']),
                'tipe' => 'jawaban',
                'dikirim_at' => now(),
            ]);

            AuditLog::create([
                'NIP' => $user?->NIP,
                'unit_id' => $pengaduan->unit_id ?? $unitId,
                'aksi' => $validated['tindakan'] === 'selesai' ? 'Selesaikan Pengaduan Pegawai' : 'Teruskan Pengaduan ke UPT Remunerasi',
                'objek_type' => 'Pengaduan',
                'objek_id' => $pengaduan->id,
                'nilai_sebelum' => ['status' => $statusSebelum, 'tingkat' => $tingkatSebelum],
                'nilai_sesudah' => ['status' => $pengaduan->status, 'tingkat' => $pengaduan->tingkat],
                'alasan' => trim($validated['tanggapan']),
                'dicatat_at' => now(),
            ]);

            $pengaduan->load(['pegawai.unitKerja', 'tanggapan', 'hasilPerhitungan.pengajuan']);

            return response()->json([
                'message' => $validated['tindakan'] === 'selesai'
                    ? 'Tanggapan terkirim dan pengaduan telah diselesaikan di tingkat unit.'
                    : 'Pengaduan berhasil diteruskan (dieskalasi) ke UPT Remunerasi.',
                'data' => $this->formatPengaduan($pengaduan),
            ]);
        });

        return $response;
    }

    /**
     * L0: Hitung manual 10 pegawai sampel acuan uji engine P1
     * Berdasarkan Peraturan Rektor Universitas Andalas Nomor 2 Tahun 2026 (Bagian 2.4.2 butir 4 Dokumen A2)
     */
    public function acuanUjiP1(): JsonResponse
    {
        $sampelAcuan = [
            [
                'no' => 1,
                'NIP' => '198803122015042001',
                'nama' => 'Dr. Rina Maharani, M.T.',
                'skenario_uji' => 'PNS Dosen Grade 11 dengan potongan Cuti Sakit 1 hari (1%)',
                'status_kepegawaian' => 'PNS',
                'jabatan' => 'Lektor Kepala',
                'grade' => 'Grade 11',
                'poin_jabatan' => 2095,
                'pir' => 3000,
                'nilai_jabatan_100' => 6285000,
                'p1_gross_40' => 2514000,
                'pengali_status_persen' => 100,
                'p1_pertimbang' => 2514000,
                'hari_kerja' => 22,
                'hadir' => 21,
                'rincian_ketidakhadiran' => '1 hari Cuti Sakit (1%)',
                'potongan_hadir_persen' => 1.0,
                'potongan_hadir_rp' => 25140,
                'hukdis_tingkat' => 'Tidak ada',
                'potongan_hukdis_persen' => 0.0,
                'potongan_hukdis_rp' => 0,
                'p1_bruto' => 2488860,
                'pajak_pph21_5_persen' => 124443,
                'p1_netto' => 2364417,
                'layak_bayar' => true,
            ],
            [
                'no' => 2,
                'NIP' => '198710082016041002',
                'nama' => 'Andi Pratama, S.Kom.',
                'skenario_uji' => 'PNS Tendik Grade 8 tanpa potongan (Hadir penuh 22 hari, Hukdis Ringan 0%)',
                'status_kepegawaian' => 'PNS',
                'jabatan' => 'Pranata Komputer',
                'grade' => 'Grade 8',
                'poin_jabatan' => 1312,
                'pir' => 3000,
                'nilai_jabatan_100' => 3936000,
                'p1_gross_40' => 1574400,
                'pengali_status_persen' => 100,
                'p1_pertimbang' => 1574400,
                'hari_kerja' => 22,
                'hadir' => 22,
                'rincian_ketidakhadiran' => 'Hadir penuh 22 hari',
                'potongan_hadir_persen' => 0.0,
                'potongan_hadir_rp' => 0,
                'hukdis_tingkat' => 'Ringan (Sudah berakhir / potongan 0%)',
                'potongan_hukdis_persen' => 0.0,
                'potongan_hukdis_rp' => 0,
                'p1_bruto' => 1574400,
                'pajak_pph21_5_persen' => 78720,
                'p1_netto' => 1495680,
                'layak_bayar' => true,
            ],
            [
                'no' => 3,
                'NIP' => '198603131803022004',
                'nama' => 'Siti Rahmah, M.Kom.',
                'skenario_uji' => 'Ketidakhadiran fisik > 50% (Tidak hadir 13 dari 22 hari kerja = 59,09% -> Tidak Layak Bayar / P1 = Rp 0)',
                'status_kepegawaian' => 'PNS',
                'jabatan' => 'Lektor',
                'grade' => 'Grade 10',
                'poin_jabatan' => 1744,
                'pir' => 3000,
                'nilai_jabatan_100' => 5232000,
                'p1_gross_40' => 2092800,
                'pengali_status_persen' => 100,
                'p1_pertimbang' => 2092800,
                'hari_kerja' => 22,
                'hadir' => 9,
                'rincian_ketidakhadiran' => '13 hari Alfa (59,09% > batas 50%)',
                'potongan_hadir_persen' => 100.0,
                'potongan_hadir_rp' => 2092800,
                'hukdis_tingkat' => 'Tidak ada',
                'potongan_hukdis_persen' => 0.0,
                'potongan_hukdis_rp' => 0,
                'p1_bruto' => 0,
                'pajak_pph21_5_persen' => 0,
                'p1_netto' => 0,
                'layak_bayar' => false,
            ],
            [
                'no' => 4,
                'NIP' => '198506202010121001',
                'nama' => 'Budi Santoso, M.T.',
                'skenario_uji' => 'PNS Dosen Grade 11 dengan Hukuman Disiplin Sedang Aktif (potongan 25%) + 2 hari Alfa (10%) + 2 hari Cuti Tahunan (0%)',
                'status_kepegawaian' => 'PNS',
                'jabatan' => 'Lektor Kepala',
                'grade' => 'Grade 11',
                'poin_jabatan' => 2095,
                'pir' => 3000,
                'nilai_jabatan_100' => 6285000,
                'p1_gross_40' => 2514000,
                'pengali_status_persen' => 100,
                'p1_pertimbang' => 2514000,
                'hari_kerja' => 22,
                'hadir' => 18,
                'rincian_ketidakhadiran' => '2 hari Alfa (2 x 5% = 10%), 2 hari Cuti Tahunan (0%)',
                'potongan_hadir_persen' => 10.0,
                'potongan_hadir_rp' => 251400,
                'hukdis_tingkat' => 'Sedang (Potongan 25%)',
                'potongan_hukdis_persen' => 25.0,
                'potongan_hukdis_rp' => 628500,
                'p1_bruto' => 1634100,
                'pajak_pph21_5_persen' => 81705,
                'p1_netto' => 1552395,
                'layak_bayar' => true,
            ],
            [
                'no' => 5,
                'NIP' => '198907122015042001',
                'nama' => 'Sri Madona, S.Kom',
                'skenario_uji' => 'CPT-PTNBH (pengali 80%) Grade 6 tanpa potongan (Sesuai Lampiran Contoh Amprah A2 halaman 32)',
                'status_kepegawaian' => 'CPT-PTNBH',
                'jabatan' => 'Pengelola Data dan Informasi',
                'grade' => 'Grade 6',
                'poin_jabatan' => 997,
                'pir' => 3000,
                'nilai_jabatan_100' => 2991000,
                'p1_gross_40' => 1196400,
                'pengali_status_persen' => 80,
                'p1_pertimbang' => 957120,
                'hari_kerja' => 22,
                'hadir' => 22,
                'rincian_ketidakhadiran' => 'Hadir penuh 22 hari',
                'potongan_hadir_persen' => 0.0,
                'potongan_hadir_rp' => 0,
                'hukdis_tingkat' => 'Tidak ada',
                'potongan_hukdis_persen' => 0.0,
                'potongan_hukdis_rp' => 0,
                'p1_bruto' => 957120,
                'pajak_pph21_5_persen' => 47856,
                'p1_netto' => 909264,
                'layak_bayar' => true,
            ],
            [
                'no' => 6,
                'NIP' => '198904062019071012',
                'nama' => 'Fikri Ananda, M.Kom.',
                'skenario_uji' => 'PNS Dosen Grade 9 tanpa potongan (Hadir penuh 22 hari)',
                'status_kepegawaian' => 'PNS',
                'jabatan' => 'Asisten Ahli',
                'grade' => 'Grade 9',
                'poin_jabatan' => 1453,
                'pir' => 3000,
                'nilai_jabatan_100' => 4359000,
                'p1_gross_40' => 1743600,
                'pengali_status_persen' => 100,
                'p1_pertimbang' => 1743600,
                'hari_kerja' => 22,
                'hadir' => 22,
                'rincian_ketidakhadiran' => 'Hadir penuh 22 hari',
                'potongan_hadir_persen' => 0.0,
                'potongan_hadir_rp' => 0,
                'hukdis_tingkat' => 'Tidak ada',
                'potongan_hukdis_persen' => 0.0,
                'potongan_hukdis_rp' => 0,
                'p1_bruto' => 1743600,
                'pajak_pph21_5_persen' => 87180,
                'p1_netto' => 1656420,
                'layak_bayar' => true,
            ],
            [
                'no' => 7,
                'NIP' => '199507212022032008',
                'nama' => 'Nadia Putri, S.Kom.',
                'skenario_uji' => 'CPNS Tendik (pengali 80%) Grade 8 dengan 2 hari Cuti Tahunan (potongan 0%)',
                'status_kepegawaian' => 'CPNS',
                'jabatan' => 'Pranata Komputer',
                'grade' => 'Grade 8',
                'poin_jabatan' => 1312,
                'pir' => 3000,
                'nilai_jabatan_100' => 3936000,
                'p1_gross_40' => 1574400,
                'pengali_status_persen' => 80,
                'p1_pertimbang' => 1259520,
                'hari_kerja' => 22,
                'hadir' => 20,
                'rincian_ketidakhadiran' => '2 hari Cuti Tahunan (tarif potongan 0%)',
                'potongan_hadir_persen' => 0.0,
                'potongan_hadir_rp' => 0,
                'hukdis_tingkat' => 'Tidak ada',
                'potongan_hukdis_persen' => 0.0,
                'potongan_hukdis_rp' => 0,
                'p1_bruto' => 1259520,
                'pajak_pph21_5_persen' => 62976,
                'p1_netto' => 1196544,
                'layak_bayar' => true,
            ],
            [
                'no' => 8,
                'NIP' => '198209102010011003',
                'nama' => 'Ricky Akbar, M.Kom.',
                'skenario_uji' => 'CPT-PTNBH Dosen (pengali 80%) Grade 10 tanpa potongan',
                'status_kepegawaian' => 'CPT-PTNBH',
                'jabatan' => 'Lektor',
                'grade' => 'Grade 10',
                'poin_jabatan' => 1744,
                'pir' => 3000,
                'nilai_jabatan_100' => 5232000,
                'p1_gross_40' => 2092800,
                'pengali_status_persen' => 80,
                'p1_pertimbang' => 1674240,
                'hari_kerja' => 22,
                'hadir' => 22,
                'rincian_ketidakhadiran' => 'Hadir penuh 22 hari',
                'potongan_hadir_persen' => 0.0,
                'potongan_hadir_rp' => 0,
                'hukdis_tingkat' => 'Tidak ada',
                'potongan_hukdis_persen' => 0.0,
                'potongan_hukdis_rp' => 0,
                'p1_bruto' => 1674240,
                'pajak_pph21_5_persen' => 83712,
                'p1_netto' => 1590528,
                'layak_bayar' => true,
            ],
            [
                'no' => 9,
                'NIP' => '199001152018022005',
                'nama' => 'Dewi Anggraini, S.Sos.',
                'skenario_uji' => 'PNS Tendik Grade 8 dengan potongan Cuti Karena Alasan Penting 1 hari (3%)',
                'status_kepegawaian' => 'PNS',
                'jabatan' => 'Analis Kepegawaian Ahli Muda',
                'grade' => 'Grade 8',
                'poin_jabatan' => 1312,
                'pir' => 3000,
                'nilai_jabatan_100' => 3936000,
                'p1_gross_40' => 1574400,
                'pengali_status_persen' => 100,
                'p1_pertimbang' => 1574400,
                'hari_kerja' => 22,
                'hadir' => 21,
                'rincian_ketidakhadiran' => '1 hari Cuti Alasan Penting (3%)',
                'potongan_hadir_persen' => 3.0,
                'potongan_hadir_rp' => 47232,
                'hukdis_tingkat' => 'Tidak ada',
                'potongan_hukdis_persen' => 0.0,
                'potongan_hukdis_rp' => 0,
                'p1_bruto' => 1527168,
                'pajak_pph21_5_persen' => 76358,
                'p1_netto' => 1450810,
                'layak_bayar' => true,
            ],
            [
                'no' => 10,
                'NIP' => '199202152019031002',
                'nama' => 'Dr. Ir. Rudi Hartono, M.Sc.',
                'skenario_uji' => 'PNS Dosen Tugas Belajar (pengali 60%) Grade 9 tanpa potongan kehadiran',
                'status_kepegawaian' => 'PNS (Tugas Belajar)',
                'jabatan' => 'Lektor',
                'grade' => 'Grade 9',
                'poin_jabatan' => 1453,
                'pir' => 3000,
                'nilai_jabatan_100' => 4359000,
                'p1_gross_40' => 1743600,
                'pengali_status_persen' => 60,
                'p1_pertimbang' => 1046160,
                'hari_kerja' => 22,
                'hadir' => 22,
                'rincian_ketidakhadiran' => 'Tugas Belajar Aktif (SK-TUBEL/2026/041)',
                'potongan_hadir_persen' => 0.0,
                'potongan_hadir_rp' => 0,
                'hukdis_tingkat' => 'Tidak ada',
                'potongan_hukdis_persen' => 0.0,
                'potongan_hukdis_rp' => 0,
                'p1_bruto' => 1046160,
                'pajak_pph21_5_persen' => 52308,
                'p1_netto' => 993852,
                'layak_bayar' => true,
            ],
        ];

        return response()->json([
            'kode_tugas' => 'L0',
            'judul' => 'Acuan Hitung Manual 10 Pegawai Sampel Uji Engine P1 (Peraturan Rektor UNAND No. 2 Tahun 2026)',
            'parameter_acuan' => [
                'PIR' => 3000,
                'PERSEN_P1' => 40,
                'PENGALI_PNS_TETAP' => 100,
                'PENGALI_CPNS_CPT_PTNBH' => 80,
                'PENGALI_TUGAS_BELAJAR' => 60,
                'BATAS_KETIDAKHADIRAN_FISIK_MAX' => 50,
            ],
            'total_sampel' => count($sampelAcuan),
            'ringkasan_manual' => [
                'total_p1_pertimbang' => array_sum(array_column($sampelAcuan, 'p1_pertimbang')),
                'total_potongan_hadir_rp' => array_sum(array_column($sampelAcuan, 'potongan_hadir_rp')),
                'total_potongan_hukdis_rp' => array_sum(array_column($sampelAcuan, 'potongan_hukdis_rp')),
                'total_p1_bruto' => array_sum(array_column($sampelAcuan, 'p1_bruto')),
                'total_pajak_pph21' => array_sum(array_column($sampelAcuan, 'pajak_pph21_5_persen')),
                'total_p1_netto' => array_sum(array_column($sampelAcuan, 'p1_netto')),
            ],
            'data' => $sampelAcuan,
        ]);
    }
}
