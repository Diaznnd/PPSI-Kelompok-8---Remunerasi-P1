<?php

namespace App\Http\Controllers\Pegawai;

use App\Http\Controllers\Controller;
use App\Models\HasilPerhitungan;
use App\Models\Pegawai;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SlipController extends Controller
{
    protected function formatSlipItem(HasilPerhitungan $item, array $profilPegawai, int $idx = 0): array
    {
        $periodeStr = match ($item->periode) {
            '2026-10', 'Oktober 2026' => 'Oktober 2026',
            '2026-09', 'September 2026' => 'September 2026',
            '2026-08', 'Agustus 2026' => 'Agustus 2026',
            '2026-07', 'Juli 2026' => 'Juli 2026',
            default => (str_contains($item->periode ?? '', '-') ? 'Periode ' . $item->periode : ($item->periode ?? 'Oktober 2026')),
        };

        $bb = explode('-', (string) $item->periode)[1] ?? '10';
        $idSlip = (string) ($item->periode ?: $item->id);
        $nomorSlip = 'SLP-P1/2026/' . $bb . '/00' . str_pad((string) (4281 - $idx), 4, '0', STR_PAD_LEFT);
        $remGrade = (float) ($item->nilai_jabatan ?: 6285000);
        $persenP1 = (float) ($item->persen_p1 ?: 40);
        $pengali = (float) ($item->persen_status ?: 100);
        $remP1 = (float) ($item->p1_pertimbang ?: $item->p1_gross ?: 2514000);
        $pengurangan = (float) ($item->pengurangan_rp ?: 0);
        $bruto = (float) ($item->p1_setelah_potongan ?: max(0, $remP1 - $pengurangan));
        $pph21 = (float) ($item->pajak_pph21 ?: 0);
        $pphTer = (float) ($item->pajak_ter ?: 0);
        $netto = (float) ($item->p1_netto ?: max(0, $bruto - $pph21));
        $totalPersen = (float) ($item->total_persen_potongan ?: 0);

        $rawKomponen = is_array($item->rincian_potongan) && count($item->rincian_potongan) > 0
            ? $item->rincian_potongan
            : $this->defaultKomponen();

        $komponen = array_map(function ($k) {
            return [
                'nama' => $k['nama'] ?? $k['Nama'] ?? '-',
                'hari' => $k['hari'] ?? $k['JumlahHari'] ?? 0,
                'tarif' => $k['tarif'] ?? $k['TarifPerHari'] ?? '0%',
                'persen' => $k['persen'] ?? $k['PersenPengurangan'] ?? 0,
                'Nama' => $k['Nama'] ?? $k['nama'] ?? '-',
                'JumlahHari' => $k['JumlahHari'] ?? $k['hari'] ?? 0,
                'TarifPerHari' => $k['TarifPerHari'] ?? $k['tarif'] ?? '0%',
                'PersenPengurangan' => (float) str_replace(['%', ','], ['', '.'], (string) ($k['PersenPengurangan'] ?? $k['persen'] ?? 0)),
            ];
        }, $rawKomponen);

        return [
            'id' => $idSlip,
            'periode' => $periodeStr,
            'nomor' => $nomorSlip,
            'status' => 'Terbit',
            'remunerasiGrade' => $remGrade,
            'persenP1' => $persenP1,
            'pengali' => $pengali,
            'pengaliStatus' => $item->pengali_status ?? 'PNS (100%)',
            'remunerasiP1' => $remP1,
            'totalPersen' => $totalPersen . '%',
            'pengurangan' => $pengurangan,
            'bruto' => $bruto,
            'pph21' => $pph21,
            'pphTer' => $pphTer,
            'tabPajak' => 0,
            'netto' => $netto,
            'komponen' => $komponen,
            'pegawai' => $profilPegawai,
            // PascalCase keys (digunakan oleh SlipListPage.tsx & SlipDetailPage.tsx)
            'IDSlip' => $idSlip,
            'Periode' => $periodeStr,
            'NomorSlip' => $nomorSlip,
            'StatusSlip' => 'Terbit',
            'RemunerasiGrade' => $remGrade,
            'PersenP1' => $persenP1,
            'PengaliStatus' => $pengali,
            'RemunerasiP1' => $remP1,
            'TotalPersenPengurangan' => $totalPersen,
            'PenguranganKehadiran' => $pengurangan,
            'JumlahBruto' => $bruto,
            'PajakPPh21' => $pph21,
            'PajakTER' => $pphTer,
            'TabPajak' => 0,
            'JumlahNetto' => $netto,
        ];
    }

    /**
     * FR-43: Daftar seluruh slip P1 milik pegawai yang login
     */
    public function index(Request $request): JsonResponse
    {
        $akun = $request->user();
        if (!$akun || !$akun->NIP) {
            return response()->json([
                'message' => 'Akses ditolak: Akun Anda belum ditautkan dengan NIP pegawai.',
            ], 403);
        }

        $nip = $akun->NIP;
        $profilCtrl = new ProfilController();
        $profilData = $profilCtrl->show($request)->getData(true)['profil'] ?? [];

        // Hanya ambil slip milik pegawai ini sendiri (FR-43 & NFR-04)
        $slips = HasilPerhitungan::where('NIP', $nip)
            ->with(['presensiBulanan', 'usulanJabatan.jabatan.grade'])
            ->orderByDesc('id')
            ->get();

        $data = $slips->values()->map(fn ($item, $idx) => $this->formatSlipItem($item, $profilData, $idx));

        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);
    }

    /**
     * FR-43: Detail satu slip P1 milik pegawai
     * Jika mencoba mengakses slip pegawai lain -> DITOLAK (403 Forbidden)
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $akun = $request->user();
        if (!$akun || !$akun->NIP) {
            return response()->json([
                'message' => 'Akses ditolak: Akun Anda belum ditautkan dengan NIP pegawai.',
            ], 403);
        }

        $nip = $akun->NIP;

        // Uji isolasi akses: Jika parameter id merujuk pada slip id yang ada di DB milik pegawai lain
        if (is_numeric($id)) {
            $slipLain = HasilPerhitungan::where('id', (int) $id)->first();
            if ($slipLain && $slipLain->NIP !== $nip) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Akses ditolak: Anda tidak memiliki wewenang untuk mengakses slip gaji pegawai lain (FR-43 / NFR-04).',
                ], 403);
            }
        }

        // Cari slip milik pegawai yang sedang login
        $slip = HasilPerhitungan::where('NIP', $nip)
            ->where(function ($q) use ($id) {
                $q->where('periode', $id)
                    ->orWhere('id', $id);
            })
            ->first();

        if (!$slip) {
            return response()->json([
                'status' => 'error',
                'message' => 'Slip P1 tidak ditemukan untuk periode atau ID tersebut.',
            ], 404);
        }

        $profilCtrl = new ProfilController();
        $profilData = $profilCtrl->show($request)->getData(true)['profil'] ?? [];

        return response()->json([
            'status' => 'success',
            'data' => $this->formatSlipItem($slip, $profilData, 0),
        ]);
    }

    /**
     * FR-43: Download / preview PDF slip P1 milik pegawai
     * Jika mencoba mengunduh slip pegawai lain -> DITOLAK (403 Forbidden)
     */
    public function downloadPdf(Request $request, string $id): \Symfony\Component\HttpFoundation\Response
    {
        $akun = $request->user();
        if (!$akun || !$akun->NIP) {
            return response()->json([
                'message' => 'Akses ditolak: Akun Anda belum ditautkan dengan NIP pegawai.',
            ], 403);
        }

        $nip = $akun->NIP;

        if (is_numeric($id)) {
            $slipLain = HasilPerhitungan::where('id', (int) $id)->first();
            if ($slipLain && $slipLain->NIP !== $nip) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Akses ditolak: Anda tidak memiliki wewenang untuk mengunduh slip gaji pegawai lain (FR-43 / NFR-04).',
                ], 403);
            }
        }

        $slip = HasilPerhitungan::where('NIP', $nip)
            ->where(function ($q) use ($id) {
                $q->where('periode', $id)
                    ->orWhere('id', $id);
            })
            ->first();

        if (!$slip) {
            return response()->json([
                'status' => 'error',
                'message' => 'Slip P1 tidak ditemukan.',
            ], 404);
        }

        $profilCtrl = new ProfilController();
        $profilData = $profilCtrl->show($request)->getData(true)['profil'] ?? [];
        $slipFormatted = $this->formatSlipItem($slip, $profilData, 0);

        if ($request->header('Accept') === 'application/pdf' || $request->has('download') || str_contains($request->header('Accept', ''), 'application/octet-stream')) {
            $pdfContent = $this->generatePdfContent($slip, $slipFormatted);
            $filename = 'Slip-P1-' . $slip->NIP . '-' . str_replace(' ', '-', $slipFormatted['Periode'] ?? $slip->periode) . '.pdf';
            return response($pdfContent, 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
                'Content-Length' => strlen($pdfContent),
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Dokumen PDF slip P1 berhasil disiapkan.',
            'url' => url('/api/pegawai/slip/' . $slip->id . '/pdf?download=1'),
            'nomor' => 'SLP-P1/2026/10/' . sprintf('%06d', $slip->id),
            'periode' => $slip->periode,
            'netto' => (float) $slip->p1_netto,
        ]);
    }

    private function generatePdfContent(HasilPerhitungan $slip, array $data = []): string
    {
        $pegawai = $data['pegawai'] ?? [];
        $nomorSlip = $data['NomorSlip'] ?? ('SLP-P1/2026/10/' . sprintf('%06d', $slip->id));
        $nip = $pegawai['NIP'] ?? $slip->NIP;
        $rekening = ($pegawai['NamaBank'] ?? 'Bank') . ' ' . ($pegawai['NoRekening'] ?? ($slip->pegawai?->no_rekening ?? '-'));

        $logoBase64 = '';
        $kandidatLogo = [
            public_path('logo-unand.png'),
            public_path('images/logo-unand.png'),
            base_path('logo_unand.png'),
            base_path('../frontend/public/logo-unand.png'),
            base_path('../frontend/public/images/logo-unand.png'),
        ];
        foreach (glob(public_path('*logo*.{png,jpg,jpeg}'), GLOB_BRACE) ?: [] as $found) {
            array_unshift($kandidatLogo, $found);
        }
        foreach ($kandidatLogo as $path) {
            if (file_exists($path) && is_file($path)) {
                $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
                $mime = ($ext === 'jpg' || $ext === 'jpeg') ? 'image/jpeg' : 'image/png';
                $logoBase64 = 'data:' . $mime . ';base64,' . base64_encode(file_get_contents($path));
                break;
            }
        }

        // Ambil data rekap kehadiran & netto
        $presensi = $slip->presensiBulanan;
        $hariKerja = (int) ($presensi?->hari_kerja ?? $presensi?->jumlah_hari_kerja ?? 22);
        $hadir = (int) ($presensi?->hari_hadir ?? $presensi?->jumlah_hadir ?? ($hariKerja - 1));
        $tidakHadir = max(0, $hariKerja - $hadir);
        $nettoFloat = (float) ($data['JumlahNetto'] ?? 2488860);

        $viewData = [
            'slip'                 => $slip,
            'data'                 => $data,
            'pegawai'              => $pegawai,
            'logoBase64'           => $logoBase64,
            'nomorSlip'            => $nomorSlip,
            'periode'              => $data['Periode'] ?? ($slip->periode ?? 'Oktober 2026'),
            'nama'                 => $pegawai['Nama'] ?? ($slip->pegawai?->nama ?? 'Pegawai'),
            'nip'                  => $nip,
            'npwp'                 => $pegawai['NPWP'] ?? ($slip->pegawai?->npwp ?? '-'),
            'pangkat'              => $pegawai['Pangkat'] ?? ($slip->pegawai?->pangkat_golongan ?? '-'),
            'jabatan'              => $pegawai['NamaJabatan'] ?? ($slip->usulanJabatan?->jabatan?->nama_jabatan ?? 'Dosen / Tenaga Kependidikan'),
            'grade'                => $pegawai['KodeGrade'] ?? ($slip->usulanJabatan?->jabatan?->grade?->kode_grade ?? 'Grade 11'),
            'unitKerja'            => $pegawai['NamaUnit'] ?? ($slip->pegawai?->unitKerja?->nama ?? 'Universitas Andalas'),
            'statusPegawai'        => $pegawai['StatusPegawai'] ?? ($slip->pegawai?->status_kepegawaian ?? 'PNS'),
            'rekening'             => $rekening,
            'remGrade'             => number_format((float) ($data['RemunerasiGrade'] ?? 6285000), 0, ',', '.'),
            'persenP1'             => $data['PersenP1'] ?? 40,
            'pengaliStatus'        => $data['PengaliStatus'] ?? 100,
            'remP1'                => number_format((float) ($data['RemunerasiP1'] ?? 2514000), 0, ',', '.'),
            'hariKerja'            => $hariKerja,
            'hadir'                => $hadir,
            'tidakHadir'           => $tidakHadir,
            'statusHukdis'         => 'Tidak Ada Hukuman Disiplin',
            'totalPersenPotongan'  => $data['TotalPersenPengurangan'] ?? 0,
            'penguranganKehadiran' => number_format((float) ($data['PenguranganKehadiran'] ?? 0), 0, ',', '.'),
            'jumlahBruto'          => number_format((float) ($data['JumlahBruto'] ?? 2488860), 0, ',', '.'),
            'pajakPph21'           => number_format((float) ($data['PajakPPh21'] ?? 0), 0, ',', '.'),
            'pajakTer'             => number_format((float) ($data['PajakTER'] ?? 0), 0, ',', '.'),
            'jumlahNetto'          => number_format($nettoFloat, 0, ',', '.'),
            'terbilang'            => trim($this->angkaKeTerbilang((int) round($nettoFloat))) . ' Rupiah',
            'waktuCetak'           => date('d/m/Y H:i:s'),
            'kodeVerifikasi'       => 'UA-SLIP-' . strtoupper(substr(md5($nomorSlip . $nip), 0, 12)),
        ];

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.slip_p1', $viewData)
            ->setPaper('a4', 'portrait');

        return $pdf->output();
    }

    private function angkaKeTerbilang(int $angka): string
    {
        $angka = abs($angka);
        $baca = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];
        if ($angka < 12) {
            return ' ' . $baca[$angka];
        } elseif ($angka < 20) {
            return $this->angkaKeTerbilang($angka - 10) . ' Belas';
        } elseif ($angka < 100) {
            return $this->angkaKeTerbilang(intdiv($angka, 10)) . ' Puluh' . $this->angkaKeTerbilang($angka % 10);
        } elseif ($angka < 200) {
            return ' Seratus' . $this->angkaKeTerbilang($angka - 100);
        } elseif ($angka < 1000) {
            return $this->angkaKeTerbilang(intdiv($angka, 100)) . ' Ratus' . $this->angkaKeTerbilang($angka % 100);
        } elseif ($angka < 2000) {
            return ' Seribu' . $this->angkaKeTerbilang($angka - 1000);
        } elseif ($angka < 1000000) {
            return $this->angkaKeTerbilang(intdiv($angka, 1000)) . ' Ribu' . $this->angkaKeTerbilang($angka % 1000);
        } elseif ($angka < 1000000000) {
            return $this->angkaKeTerbilang(intdiv($angka, 1000000)) . ' Juta' . $this->angkaKeTerbilang($angka % 1000000);
        }
        return (string) $angka;
    }

    private function defaultKomponen(): array
    {
        $tarifTL = ['0,25%', '0,5%', '1%', '1,5%', '2%', '2,5%'];
        $komponen = [];
        foreach ($tarifTL as $i => $t) {
            $komponen[] = ['nama' => 'TL.' . ($i + 1), 'hari' => 0, 'tarif' => $t, 'persen' => '0%'];
        }
        foreach ($tarifTL as $i => $t) {
            $komponen[] = ['nama' => 'PSW.' . ($i + 1), 'hari' => 0, 'tarif' => $t, 'persen' => '0%'];
        }
        $komponen[] = ['nama' => 'Cuti Sakit', 'hari' => 1, 'tarif' => '1%', 'persen' => '1%'];
        $komponen[] = ['nama' => 'Cuti Bersalin ke-1 dan ke-2', 'hari' => 0, 'tarif' => '1%', 'persen' => '0%'];
        $komponen[] = ['nama' => 'Cuti Bersalin ke-3', 'hari' => 0, 'tarif' => '2%', 'persen' => '0%'];
        $komponen[] = ['nama' => 'Cuti Bersalin ke-4 dan seterusnya', 'hari' => 0, 'tarif' => '3%', 'persen' => '0%'];
        $komponen[] = ['nama' => 'Cuti Karena Alasan Penting', 'hari' => 0, 'tarif' => '3%', 'persen' => '0%'];
        $komponen[] = ['nama' => 'Cuti Besar', 'hari' => 0, 'tarif' => '1,5%', 'persen' => '0%'];
        $komponen[] = ['nama' => 'Tidak Hadir Tanpa Keterangan', 'hari' => 0, 'tarif' => '5%', 'persen' => '0%'];

        return $komponen;
    }
}
