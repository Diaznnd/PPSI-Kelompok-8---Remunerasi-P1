<?php

namespace App\Http\Controllers\UptRemunerasi;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\HasilPerhitungan;
use App\Models\PengajuanP1;
use App\Models\RiwayatStatus;
use App\Models\UnitKerja;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class HitungPajakController extends Controller
{
    protected function authorizeUpt(Request $request): void
    {
        $user = $request->user();
        if (!$user || !$user->hasRole('upt_remunerasi')) {
            abort(403, 'Akses ditolak: Anda tidak memiliki wewenang sebagai UPT Remunerasi.');
        }
    }

    /**
     * Daftar pengajuan unit kerja untuk proses penghitungan pajak & penetapan P1 Netto
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorizeUpt($request);

        $periode = $request->query('periode', '2026-10');

        $pengajuanList = PengajuanP1::with(['unitKerja'])
            ->where('periode', $periode)
            ->get()
            ->map(function ($p) {
                $hasilQuery = HasilPerhitungan::where('pengajuan_id', $p->id);
                $totalPegawai = (clone $hasilQuery)->count();
                $totalBruto = (float) $p->total_bruto;
                $totalPajak = (float) (clone $hasilQuery)->sum('pajak_pph21');
                $totalNetto = (float) (clone $hasilQuery)->sum('p1_netto');

                return [
                    'id' => (string) $p->id,
                    'unit_id' => $p->unit_id,
                    'unit' => $p->unitKerja?->nama ?? 'Unit',
                    'periode' => $p->periode,
                    'status' => $p->status,
                    'total_pegawai' => $totalPegawai,
                    'total_bruto' => $totalBruto,
                    'total_pajak' => $totalPajak,
                    'total_netto' => $totalNetto > 0 ? $totalNetto : max(0, $totalBruto - $totalPajak),
                    'siap_dihitung' => in_array($p->status, ['diverifikasi', 'terverifikasi', 'diajukan']),
                    'sudah_ditetapkan' => in_array($p->status, ['netto_ditetapkan', 'disetujui', 'selesai']),
                ];
            });

        return response()->json([
            'periode' => $periode,
            'menunggu_hitung' => $pengajuanList->where('siap_dihitung', true)->count(),
            'sudah_ditetapkan' => $pengajuanList->where('sudah_ditetapkan', true)->count(),
            'data' => $pengajuanList->values(),
        ]);
    }

    /**
     * Rincian perhitungan pajak per pegawai untuk satu pengajuan unit kerja
     */
    public function detail(Request $request, string $id): JsonResponse
    {
        $this->authorizeUpt($request);

        $pengajuan = PengajuanP1::with('unitKerja')->findOrFail($id);

        $hasilList = HasilPerhitungan::with(['pegawai', 'usulanJabatan.jabatan.grade'])
            ->where('pengajuan_id', $pengajuan->id)
            ->get()
            ->map(function ($h) {
                $bruto = (float) $h->p1_setelah_potongan;
                $pangkatGol = (string) ($h->pegawai?->pangkat_golongan ?? '');

                // Hitung Pajak PPh 21 Berdasarkan Golongan (Tabel Potongan Pajak Page 2)
                $tarifPersen = 5;
                if (preg_match('/\bIV\/[a-e]\b/i', $pangkatGol) || str_contains($pangkatGol, 'IV/') || stripos($pangkatGol, 'Pembina') !== false) {
                    $tarifPersen = 15;
                } elseif (preg_match('/\bIII\/[a-d]\b/i', $pangkatGol) || str_contains($pangkatGol, 'III/') || stripos($pangkatGol, 'Penata') !== false) {
                    $tarifPersen = 5;
                } elseif (preg_match('/\bII\/[a-d]\b/i', $pangkatGol) || str_contains($pangkatGol, 'II/') || stripos($pangkatGol, 'Pengatur') !== false) {
                    $tarifPersen = 5;
                } elseif (preg_match('/\bI\/[a-d]\b/i', $pangkatGol) || str_contains($pangkatGol, 'I/') || stripos($pangkatGol, 'Juru') !== false) {
                    $tarifPersen = 0;
                }

                $pajak = (float) ($h->pajak_pph21 ?? round(($bruto * $tarifPersen) / 100));
                $netto = max(0, $bruto - $pajak);

                return [
                    'id' => $h->id,
                    'nip' => $h->NIP,
                    'nama' => $h->pegawai?->nama ?? $h->NIP,
                    'pangkat' => $h->pegawai?->pangkat_golongan ?? '-',
                    'npwp' => $h->pegawai?->npwp ?? '-',
                    'jabatan' => $h->usulanJabatan?->jabatan?->nama_jabatan ?? 'Pegawai',
                    'grade' => $h->usulanJabatan?->jabatan?->grade?->kode_grade ?? 'Grade 10',
                    'bruto' => $bruto,
                    'tarif_pajak' => $tarifPersen . '%',
                    'pajak' => $pajak,
                    'netto' => $netto,
                    'slip_terbit' => $h->slip_terbit_at !== null,
                    'status_hitung' => $h->pajak_pph21 !== null ? 'Dihitung' : 'Simulasi',
                ];
            });

        return response()->json([
            'pengajuan' => [
                'id' => $pengajuan->id,
                'nomor' => $pengajuan->nomor_pengajuan,
                'unit' => $pengajuan->unitKerja?->nama,
                'periode' => $pengajuan->periode,
                'status' => $pengajuan->status,
                'total_pegawai' => $hasilList->count(),
                'total_bruto' => (float) $pengajuan->total_bruto,
                'total_pajak' => $hasilList->sum('pajak'),
                'total_netto' => $hasilList->sum('netto'),
            ],
            'pegawai' => $hasilList,
        ]);
    }

    /**
     * Menetapkan P1 Netto resmi setelah pajak terhitung
     */
    public function tetapkanNetto(Request $request, string $id): JsonResponse
    {
        $this->authorizeUpt($request);

        $validated = $request->validate([
            'catatan' => 'nullable|string|max:500',
        ]);

        return DB::transaction(function () use ($id, $validated, $request) {
            $pengajuan = PengajuanP1::with('unitKerja')->findOrFail($id);
            $user = $request->user();

            $now = Carbon::now();
            $hasilList = HasilPerhitungan::with('pegawai')->where('pengajuan_id', $pengajuan->id)->get();

            $totalPajak = 0;
            $totalNetto = 0;

            foreach ($hasilList as $h) {
                $bruto = (float) $h->p1_setelah_potongan;
                $pangkatGol = (string) ($h->pegawai?->pangkat_golongan ?? '');

                // Hitung Pajak PPh 21 Berdasarkan Golongan (Tabel Potongan Pajak Page 2)
                $tarifPersen = 5;
                if (preg_match('/\bIV\/[a-e]\b/i', $pangkatGol) || str_contains($pangkatGol, 'IV/') || stripos($pangkatGol, 'Pembina') !== false) {
                    $tarifPersen = 15;
                } elseif (preg_match('/\bIII\/[a-d]\b/i', $pangkatGol) || str_contains($pangkatGol, 'III/') || stripos($pangkatGol, 'Penata') !== false) {
                    $tarifPersen = 5;
                } elseif (preg_match('/\bII\/[a-d]\b/i', $pangkatGol) || str_contains($pangkatGol, 'II/') || stripos($pangkatGol, 'Pengatur') !== false) {
                    $tarifPersen = 5;
                } elseif (preg_match('/\bI\/[a-d]\b/i', $pangkatGol) || str_contains($pangkatGol, 'I/') || stripos($pangkatGol, 'Juru') !== false) {
                    $tarifPersen = 0;
                }

                $pajak = round(($bruto * $tarifPersen) / 100);
                $netto = max(0, $bruto - $pajak);

                $h->pajak_pph21 = $pajak;
                $h->p1_netto = $netto;
                $h->tab_pajak = ['skema' => 'Golongan', 'tarif' => $tarifPersen . '%', 'golongan' => $pangkatGol, 'bruto' => $bruto];
                $h->slip_terbit_at = $now; // Penerbitan Slip P1 Netto otomatis saat disahkan
                $h->amprah_terbit_at = $now;
                $h->save();

                $totalPajak += $pajak;
                $totalNetto += $netto;
            }

            $statusSebelum = $pengajuan->status;
            // Status disahkan (approval bertingkat final)
            $pengajuan->status = 'disahkan';
            $pengajuan->save();

            // Catat riwayat status
            RiwayatStatus::create([
                'pengajuan_id' => $pengajuan->id,
                'NIP' => $user->NIP,
                'dari_status' => $statusSebelum,
                'ke_status' => 'disahkan',
                'catatan_alasan' => $validated['catatan'] ?? 'Approval bertingkat UPT selesai. Lembar verifikasi dan slip P1 netto resmi diterbitkan.',
                'dicatat_at' => $now,
            ]);

            // Catat audit log
            AuditLog::create([
                'NIP' => $user->NIP,
                'unit_id' => $pengajuan->unit_id,
                'aksi' => 'Pengesahan P1 & Penerbitan Slip Netto',
                'objek_type' => 'PengajuanP1',
                'objek_id' => $pengajuan->id,
                'nilai_sebelum' => ['status' => $statusSebelum],
                'nilai_sesudah' => ['status' => 'disahkan', 'total_pajak' => $totalPajak, 'total_netto' => $totalNetto],
                'alasan' => $validated['catatan'] ?? 'Approval bertingkat UPT Remunerasi',
                'dicatat_at' => $now,
            ]);

            return response()->json([
                'message' => 'Pengajuan P1 unit ' . $pengajuan->unitKerja?->nama . ' berhasil disahkan dan slip P1 netto telah diterbitkan.',
                'pengajuan' => [
                    'id' => $pengajuan->id,
                    'status' => $pengajuan->status,
                    'total_bruto' => (float) $pengajuan->total_bruto,
                    'total_pajak' => $totalPajak,
                    'total_netto' => $totalNetto,
                ],
            ]);
        });
    }

    /**
     * Data Lembar Verifikasi Resmi UPT (Format Page 1 PDF)
     */
    public function lembarVerifikasi(Request $request, string $id): JsonResponse
    {
        $this->authorizeUpt($request);

        $pengajuan = PengajuanP1::with(['unitKerja', 'hasilPerhitungan'])->findOrFail($id);
        $user = $request->user();

        $totalPenerima = $pengajuan->hasilPerhitungan()->count();
        $totalKotor = (float) $pengajuan->total_bruto;

        $namaKetua = $user->nama ?? 'Ketua UPT Remunerasi';
        $nipKetua = $user->NIP ?? '197501012000031001';

        $periodeStr = match ($pengajuan->periode) {
            '2026-10' => 'Oktober 2026',
            '2026-09' => 'September 2026',
            '2026-08' => 'Agustus 2026',
            '2026-07' => 'Juli 2026',
            default => $pengajuan->periode,
        };

        $tglVerif = Carbon::parse($pengajuan->updated_at ?? now())->translatedFormat('d F Y');

        return response()->json([
            'status' => 'success',
            'data' => [
                'kop' => [
                    'kementerian' => 'KEMENTERIAN PENDIDIKAN TINGGI, SAINS DAN TEKNOLOGI',
                    'universitas' => 'UNIVERSITAS ANDALAS',
                    'upt' => 'UPT REMUNERASI',
                    'alamat' => 'Gedung Rektorat, Limau Manis Padang Kode Pos 25163',
                    'kontak' => 'Telepon : 0751-71181,71175,71086,71087,71699 Faksimile : 0751-71085',
                    'web_email' => 'Website: www.unand.ac.id  e-mail : sekretariatrektor@unand.ac.id',
                ],
                'judul' => 'LEMBAR VERIFIKASI',
                'pejabat' => [
                    'nama' => $namaKetua,
                    'nip' => $nipKetua,
                    'jabatan' => 'Ketua UPT Remunerasi Universitas Andalas',
                ],
                'pengajuan' => [
                    'id' => $pengajuan->id,
                    'nomor_pengajuan' => $pengajuan->nomor_pengajuan,
                    'unit' => $pengajuan->unitKerja?->nama ?? 'Unit Kerja',
                    'periode' => $periodeStr,
                    'jumlah_penerima' => $totalPenerima,
                    'jumlah_kotor' => $totalKotor,
                    'kelompok' => 'Tenaga Kependidikan',
                ],
                'titimangsa' => [
                    'tempat' => 'Padang',
                    'tanggal' => $tglVerif,
                ],
            ],
        ]);
    }
}
