<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Rekapitulasi Absensi - {{ $nomorSurat }}</title>
    <style>
        @page { size: a4 portrait; margin: 14mm 16mm; }
        * { box-sizing: border-box; }
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 9pt; color: #111827; margin: 0; padding: 0; line-height: 1.4; }
        .kop-table { width: 100%; border-collapse: collapse; }
        .kop-logo { width: 72px; vertical-align: middle; text-align: center; padding-right: 12px; }
        .kop-logo img { width: 64px; height: auto; }
        .kop-text { text-align: center; vertical-align: middle; }
        .kop-1 { font-size: 10pt; font-weight: bold; text-transform: uppercase; }
        .kop-2 { font-size: 13pt; font-weight: bold; color: #047857; letter-spacing: 0.8px; }
        .kop-3 { font-size: 10pt; font-weight: bold; text-transform: uppercase; color: #1f2937; }
        .kop-4 { font-size: 8pt; color: #4b5563; }
        .garis-kop { border-bottom: 3px double #111827; margin: 8px 0 12px 0; }
        .title-box { text-align: center; margin-bottom: 14px; }
        .title { font-size: 12pt; font-weight: bold; text-transform: uppercase; text-decoration: underline; }
        .subtitle { font-size: 8.5pt; color: #475569; margin-top: 2px; }
        .section { background: #f1f5f9; border: 1px solid #cbd5e1; border-left: 4px solid #047857; padding: 5px 8px; font-weight: bold; font-size: 8.5pt; margin: 10px 0 6px 0; text-transform: uppercase; }
        table.info { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
        table.info td { padding: 3px 6px; font-size: 8.5pt; }
        table.grid { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
        table.grid th { background: #f8fafc; border: 1px solid #cbd5e1; padding: 6px; font-size: 8pt; text-align: left; }
        table.grid td { border: 1px solid #cbd5e1; padding: 5px 6px; font-size: 8.5pt; }
        .tc { text-align: center; }
        .tr { text-align: right; }
        .badge-ok { background: #ecfdf5; color: #065f46; padding: 2px 6px; border-radius: 3px; font-weight: bold; font-size: 7.5pt; }
    </style>
</head>
<body>
    <table class="kop-table">
        <tr>
            <td class="kop-logo">
                @if(!empty($logoBase64))
                    <img src="{{ $logoBase64 }}" alt="Logo UNAND">
                @endif
            </td>
            <td class="kop-text">
                <div class="kop-1">KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI</div>
                <div class="kop-2">UNIVERSITAS ANDALAS</div>
                <div class="kop-3">{{ strtoupper($unitKerja) }}</div>
                <div class="kop-4">Kampus Limau Manis, Padang, Sumatera Barat 25163 | Laman: unand.ac.id</div>
            </td>
        </tr>
    </table>
    <div class="garis-kop"></div>

    <div class="title-box">
        <div class="title">LAPORAN REKAPITULASI KEHADIRAN PEGAWAI</div>
        <div class="subtitle">Nomor: <strong>{{ $nomorSurat }}</strong> &bull; Periode: <strong>{{ $periode }}</strong></div>
    </div>

    <div class="section">1. Identitas Pegawai</div>
    <table class="info">
        <tr>
            <td style="width: 20%;">Nama Lengkap</td><td style="width: 2%;">:</td><td style="width: 35%;"><strong>{{ $nama }}</strong></td>
            <td style="width: 18%;">Unit Kerja</td><td style="width: 2%;">:</td><td>{{ $unitKerja }}</td>
        </tr>
        <tr>
            <td>NIP</td><td>:</td><td>{{ $nip }}</td>
            <td>Jabatan</td><td>:</td><td>{{ $jabatan }}</td>
        </tr>
        <tr>
            <td>Pangkat / Gol</td><td>:</td><td>{{ $pangkat }}</td>
            <td>Grade</td><td>:</td><td>{{ $grade }}</td>
        </tr>
    </table>

    <div class="section">2. Ringkasan Kehadiran Periode {{ $periode }}</div>
    <table class="grid">
        <thead>
            <tr>
                <th>Hari Kerja Efektif</th>
                <th class="tc">Hadir</th>
                <th class="tc">Cuti / Izin</th>
                <th class="tc">Alfa (Tanpa Ket.)</th>
                <th class="tc">Tingkat Kehadiran</th>
                <th class="tc">Status</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><strong>{{ $absensi['hari_kerja'] ?? 22 }} Hari</strong></td>
                <td class="tc"><strong>{{ $absensi['hadir'] ?? 22 }} Hari</strong></td>
                <td class="tc">{{ $absensi['cuti_izin'] ?? 0 }} Hari</td>
                <td class="tc">{{ $absensi['tidak_hadir'] ?? 0 }} Hari</td>
                <td class="tc"><strong>{{ $absensi['persen_kehadiran'] ?? 100 }}%</strong></td>
                <td class="tc"><span class="badge-ok">{{ strtoupper($absensi['status_validasi'] ?? 'VALID') }}</span></td>
            </tr>
        </tbody>
    </table>

    <div class="section">3. Rincian Keterlambatan (TL) &amp; Pulang Sebelum Waktunya (PSW)</div>
    <table class="grid">
        <thead>
            <tr>
                <th>Kategori TL</th>
                <th class="tc">Jumlah</th>
                <th>Kategori PSW</th>
                <th class="tc">Jumlah</th>
            </tr>
        </thead>
        <tbody>
            @for($i = 1; $i <= 6; $i++)
            <tr>
                <td>TL.{{ $i }}</td>
                <td class="tc">{{ $absensi['tl_detail']['TL.' . $i] ?? 0 }} kali</td>
                <td>PSW.{{ $i }}</td>
                <td class="tc">{{ $absensi['psw_detail']['PSW.' . $i] ?? 0 }} kali</td>
            </tr>
            @endfor
        </tbody>
    </table>

    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <tr>
            <td style="width: 55%; vertical-align: top; font-size: 7.5pt; color: #64748b;">
                Dokumen rekapitulasi absensi ini digunakan sebagai dasar perhitungan Remunerasi P1.<br>
                Dicetak: {{ $waktuCetak }} WIB &bull; Kode: <strong>{{ $kodeVerifikasi }}</strong>
            </td>
            <td style="width: 45%; text-align: center; font-size: 8.5pt;">
                <div>Padang, {{ $tanggalSurat }}</div>
                <div style="font-weight: bold;">Bidang Kepegawaian {{ $unitKerja }}</div>
                <div style="height: 36px;"></div>
                <div style="font-weight: bold; text-decoration: underline;">Kepala Subbagian Kepegawaian</div>
                <div style="font-size: 7.5pt; color: #64748b;">Diverifikasi secara elektronik</div>
            </td>
        </tr>
    </table>
</body>
</html>
