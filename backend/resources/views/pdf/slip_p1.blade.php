<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Slip Pembayaran Remunerasi P1 - {{ $nomorSlip }}</title>
    <style>
        @page {
            size: a4 portrait;
            margin: 12mm 15mm 12mm 15mm;
        }
        * {
            box-sizing: border-box;
            -webkit-box-sizing: border-box;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 8.5pt;
            line-height: 1.35;
            color: #111827;
            background-color: #ffffff;
            margin: 0;
            padding: 0;
        }

        /* Kop Surat */
        .kop-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 0;
        }
        .kop-logo {
            width: 75px;
            vertical-align: middle;
            text-align: center;
            padding-right: 12px;
        }
        .kop-logo img {
            width: 68px;
            height: auto;
            max-height: 75px;
        }
        .kop-text {
            vertical-align: middle;
            text-align: center;
        }
        .kop-line-1 {
            font-size: 10pt;
            font-weight: bold;
            color: #111827;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 0;
        }
        .kop-line-2 {
            font-size: 13.5pt;
            font-weight: bold;
            color: #047857;
            letter-spacing: 1px;
            margin: 2px 0;
        }
        .kop-line-3 {
            font-size: 9.5pt;
            font-weight: bold;
            color: #1f2937;
            margin: 0;
        }
        .kop-line-4 {
            font-size: 8pt;
            color: #4b5563;
            margin-top: 2px;
        }

        .garis-kop {
            border-bottom: 3px double #111827;
            margin-top: 8px;
            margin-bottom: 10px;
        }

        /* Judul Dokumen */
        .doc-title-box {
            text-align: center;
            margin-bottom: 12px;
        }
        .doc-title {
            font-size: 12pt;
            font-weight: bold;
            color: #111827;
            text-transform: uppercase;
            letter-spacing: 0.8px;
        }
        .doc-subtitle {
            font-size: 8.5pt;
            color: #4b5563;
            margin-top: 2px;
        }

        /* Section Styling */
        .section-header {
            background-color: #f1f5f9;
            border: 1px solid #cbd5e1;
            border-left: 4px solid #047857;
            padding: 4px 8px;
            font-size: 8.5pt;
            font-weight: bold;
            color: #0f172a;
            margin-top: 8px;
            margin-bottom: 4px;
            text-transform: uppercase;
        }

        /* Tables */
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 6px;
        }
        .data-table td, .data-table th {
            padding: 4px 6px;
            font-size: 8pt;
            vertical-align: top;
        }
        .bordered-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 6px;
            border: 1px solid #cbd5e1;
        }
        .bordered-table th {
            background-color: #f8fafc;
            border: 1px solid #cbd5e1;
            padding: 5px 6px;
            font-size: 7.5pt;
            font-weight: bold;
            color: #334155;
            text-align: left;
        }
        .bordered-table td {
            border: 1px solid #cbd5e1;
            padding: 4px 6px;
            font-size: 8pt;
        }
        .bordered-table tr:nth-child(even) {
            background-color: #fafbfc;
        }

        .label-col {
            color: #475569;
            width: 28%;
        }
        .colon-col {
            width: 2%;
            text-align: center;
        }
        .val-col {
            color: #0f172a;
            font-weight: 500;
            width: 70%;
        }

        .text-right {
            text-align: right;
        }
        .text-center {
            text-align: center;
        }
        .font-bold {
            font-weight: bold;
        }
        .font-semibold {
            font-weight: 600;
        }
        .text-muted {
            color: #64748b;
            font-size: 7.5pt;
        }

        /* Kotak Sorotan Netto */
        .netto-box {
            background-color: #ecfdf5;
            border: 1.5px solid #059669;
            border-radius: 4px;
            padding: 8px 12px;
            margin-top: 8px;
            margin-bottom: 6px;
        }
        .netto-table {
            width: 100%;
            border-collapse: collapse;
        }
        .netto-title {
            font-size: 9.5pt;
            font-weight: bold;
            color: #065f46;
            text-transform: uppercase;
        }
        .netto-amount {
            font-size: 14pt;
            font-weight: bold;
            color: #047857;
            text-align: right;
        }
        .netto-terbilang {
            font-size: 7.5pt;
            color: #047857;
            font-style: italic;
            margin-top: 3px;
        }
        .netto-rekening {
            font-size: 8pt;
            color: #374151;
            margin-top: 2px;
        }

        /* Footer */
        .footer-box {
            margin-top: 14px;
            border-top: 1px solid #cbd5e1;
            padding-top: 6px;
        }
        .footer-table {
            width: 100%;
            border-collapse: collapse;
        }
        .footer-note {
            font-size: 7pt;
            color: #64748b;
            line-height: 1.3;
        }
        .footer-meta {
            font-size: 7pt;
            color: #475569;
            text-align: right;
            font-family: monospace;
        }
    </style>
</head>
<body>

    <!-- KOP SURAT RESMI -->
    <table class="kop-table">
        <tr>
            <td class="kop-logo">
                @if(!empty($logoBase64))
                    <img src="{{ $logoBase64 }}" alt="Logo Universitas Andalas">
                @endif
            </td>
            <td class="kop-text">
                <div class="kop-line-1">KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI</div>
                <div class="kop-line-2">UNIVERSITAS ANDALAS</div>
                <div class="kop-line-3">SISTEM INFORMASI REMUNERASI KINERJA (SIREMUN-P1)</div>
                <div class="kop-line-4">Alamat: Kampus Limau Manis, Padang, Sumatera Barat 25163 | Laman: unand.ac.id</div>
            </td>
        </tr>
    </table>

    <div class="garis-kop"></div>

    <!-- JUDUL DOKUMEN -->
    <div class="doc-title-box">
        <div class="doc-title">SLIP BUKTI PEMBAYARAN REMUNERASI P1</div>
        <div class="doc-subtitle">Nomor: <strong>{{ $nomorSlip }}</strong> &bull; Periode: <strong>{{ $periode }}</strong></div>
    </div>

    <!-- 1. IDENTITAS PEGAWAI & PERIODE -->
    <div class="section-header">1. IDENTITAS PEGAWAI &amp; PERIODE PEMBAYARAN</div>
    <table class="bordered-table" style="margin-bottom: 8px;">
        <tr>
            <td style="width: 50%; padding: 6px 8px; vertical-align: top;">
                <table class="data-table" style="margin: 0;">
                    <tr>
                        <td class="label-col">Nama Lengkap</td>
                        <td class="colon-col">:</td>
                        <td class="val-col"><strong>{{ $nama }}</strong></td>
                    </tr>
                    <tr>
                        <td class="label-col">NIP</td>
                        <td class="colon-col">:</td>
                        <td class="val-col">{{ $nip }}</td>
                    </tr>
                    <tr>
                        <td class="label-col">NPWP</td>
                        <td class="colon-col">:</td>
                        <td class="val-col">{{ $npwp }}</td>
                    </tr>
                    <tr>
                        <td class="label-col">Pangkat / Gol</td>
                        <td class="colon-col">:</td>
                        <td class="val-col">{{ $pangkat }}</td>
                    </tr>
                    <tr>
                        <td class="label-col">Status Kepegawaian</td>
                        <td class="colon-col">:</td>
                        <td class="val-col">{{ $statusPegawai }}</td>
                    </tr>
                </table>
            </td>
            <td style="width: 50%; padding: 6px 8px; vertical-align: top;">
                <table class="data-table" style="margin: 0;">
                    <tr>
                        <td class="label-col">Nomor Slip</td>
                        <td class="colon-col">:</td>
                        <td class="val-col"><strong>{{ $nomorSlip }}</strong></td>
                    </tr>
                    <tr>
                        <td class="label-col">Periode</td>
                        <td class="colon-col">:</td>
                        <td class="val-col"><strong>{{ $periode }}</strong></td>
                    </tr>
                    <tr>
                        <td class="label-col">Jabatan</td>
                        <td class="colon-col">:</td>
                        <td class="val-col">{{ $jabatan }}</td>
                    </tr>
                    <tr>
                        <td class="label-col">Grade Jabatan</td>
                        <td class="colon-col">:</td>
                        <td class="val-col">{{ $grade }}</td>
                    </tr>
                    <tr>
                        <td class="label-col">Unit Kerja</td>
                        <td class="colon-col">:</td>
                        <td class="val-col">{{ $unitKerja }}</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <!-- 2. DASAR PERHITUNGAN REMUNERASI P1 -->
    <div class="section-header">2. DASAR PERHITUNGAN REMUNERASI P1</div>
    <table class="bordered-table">
        <thead>
            <tr>
                <th style="width: 40%;">Komponen Dasar</th>
                <th style="width: 25%; text-align: center;">Faktor / Porsi</th>
                <th style="width: 35%; text-align: right;">Nilai Nominal</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Remunerasi per Grade Jabatan ({{ $grade }})</td>
                <td class="text-center">-</td>
                <td class="text-right">Rp {{ $remGrade }}</td>
            </tr>
            <tr>
                <td>Porsi Alokasi Remunerasi P1</td>
                <td class="text-center">{{ $persenP1 }}%</td>
                <td class="text-right">Rp {{ $remP1 }}</td>
            </tr>
            <tr>
                <td>Pengali Status Kepegawaian ({{ $statusPegawai }})</td>
                <td class="text-center">{{ $pengaliStatus }}%</td>
                <td class="text-right">Pengali {{ $pengaliStatus }}%</td>
            </tr>
            <tr style="background-color: #f8fafc; font-weight: bold;">
                <td colspan="2">Total Remunerasi P1 Bruto Awal</td>
                <td class="text-right" style="color: #047857;">Rp {{ $remP1 }}</td>
            </tr>
        </tbody>
    </table>
    <div class="text-muted" style="margin-top: -3px; margin-bottom: 6px;">
        * Rumus Ketentuan: Remunerasi P1 = Remunerasi per Grade Jabatan &times; 40% &times; Pengali Status Kepegawaian.
    </div>

    <!-- 3. REKAPITULASI PENGURANGAN KEHADIRAN & HUKUMAN DISIPLIN -->
    <div class="section-header">3. REKAPITULASI PENGURANGAN KEHADIRAN &amp; DISIPLIN</div>
    <table class="bordered-table">
        <thead>
            <tr>
                <th style="width: 30%;">Parameter Rekapitulasi</th>
                <th style="width: 20%; text-align: center;">Keterangan / Nilai</th>
                <th style="width: 25%; text-align: center;">Persentase (%)</th>
                <th style="width: 25%; text-align: right;">Nominal Pengurangan</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Hari Kerja Efektif</td>
                <td class="text-center">{{ $hariKerja }} Hari</td>
                <td class="text-center">-</td>
                <td class="text-right">-</td>
            </tr>
            <tr>
                <td>Kehadiran Tercatat</td>
                <td class="text-center">{{ $hadir }} Hari</td>
                <td class="text-center">-</td>
                <td class="text-right">-</td>
            </tr>
            <tr>
                <td>Ketidakhadiran / Cuti / Izin</td>
                <td class="text-center">{{ $tidakHadir }} Hari</td>
                <td class="text-center">{{ $totalPersenPotongan }}%</td>
                <td class="text-right">Rp {{ $penguranganKehadiran }}</td>
            </tr>
            <tr>
                <td>Hukuman Disiplin Pegawai</td>
                <td class="text-center">{{ $statusHukdis }}</td>
                <td class="text-center">0%</td>
                <td class="text-right">Rp 0</td>
            </tr>
            <tr style="background-color: #f8fafc; font-weight: bold;">
                <td colspan="2">Total Pengurangan Kehadiran</td>
                <td class="text-center">{{ $totalPersenPotongan }}%</td>
                <td class="text-right" style="color: #b91c1c;">(Rp {{ $penguranganKehadiran }})</td>
            </tr>
        </tbody>
    </table>

    <!-- 4. RINCIAN PEMBAYARAN DAN PAJAK -->
    <div class="section-header">4. RINCIAN PEMBAYARAN &amp; PAJAK PENGHASILAN (PPH 21)</div>
    <table class="bordered-table">
        <thead>
            <tr>
                <th style="width: 60%;">Uraian Perhitungan</th>
                <th style="width: 40%; text-align: right;">Jumlah (Rupiah)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><strong>Jumlah Penghasilan Bruto P1</strong> (Remunerasi P1 Bruto &minus; Pengurangan Kehadiran)</td>
                <td class="text-right font-bold">Rp {{ $jumlahBruto }}</td>
            </tr>
            <tr>
                <td>Potongan Pajak Penghasilan (PPh Pasal 21)</td>
                <td class="text-right" style="color: #b91c1c;">(Rp {{ $pajakPph21 }})</td>
            </tr>
            @if((float) str_replace(['.', ','], '', $pajakTer) > 0)
            <tr>
                <td>Potongan Pajak TER (Tarif Efektif Rata-rata)</td>
                <td class="text-right" style="color: #b91c1c;">(Rp {{ $pajakTer }})</td>
            </tr>
            @endif
        </tbody>
    </table>

    <!-- KOTAK SOROTAN NETTO -->
    <div class="netto-box">
        <table class="netto-table">
            <tr>
                <td style="vertical-align: middle;">
                    <div class="netto-title">TOTAL P1 NETTO DITERIMA</div>
                    <div class="netto-terbilang">Terbilang: # {{ $terbilang }} #</div>
                    <div class="netto-rekening">Rekening Tujuan: <strong>{{ $rekening }}</strong></div>
                </td>
                <td style="vertical-align: middle; text-align: right; width: 45%;">
                    <div class="netto-amount">Rp {{ $jumlahNetto }}</div>
                </td>
            </tr>
        </table>
    </div>

    <!-- FOOTER / PENGESAHAN ELEKTRONIK -->
    <div class="footer-box">
        <table class="footer-table">
            <tr>
                <td style="width: 65%; vertical-align: top;">
                    <div class="footer-note">
                        <strong>Catatan Resmi:</strong><br>
                        1. Dokumen ini dicetak secara elektronik melalui sistem <strong>SIREMUN-P1 Universitas Andalas</strong> dan sah tanpa tanda tangan basah berdasarkan UU RI No. 11 Tahun 2008 tentang ITE.<br>
                        2. Apabila terdapat ketidaksesuaian perhitungan pada slip ini, pegawai berhak mengajukan pengaduan resmi melalui Portal Pegawai SIREMUN-P1 dalam jangka waktu yang telah ditetapkan.
                    </div>
                </td>
                <td style="width: 35%; vertical-align: top;" class="footer-meta">
                    Dicetak pada: {{ $waktuCetak }} WIB<br>
                    Kode Keaslian: <strong>{{ $kodeVerifikasi }}</strong>
                </td>
            </tr>
        </table>
    </div>

</body>
</html>
