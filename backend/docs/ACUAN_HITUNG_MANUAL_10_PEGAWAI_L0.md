# L0 – Acuan Hitung Manual 10 Pegawai Sampel Uji Engine P1

Dokumen ini merupakan lembar kerja acuan hitung manual untuk **10 pegawai sampel** pada unit **Fakultas Teknologi Informasi (FTI)** sesuai ketentuan **Peraturan Rektor Universitas Andalas Nomor 2 Tahun 2026** dan **Dokumen A2 Bagian 2.4.2 Butir 4**.

---

## 1. Parameter Acuan Perhitungan P1
- **PIR (Poin Indeks Rupiah)**: `Rp 3.000`
- **Proporsi P1 (Pay for Position)**: `40%` dari Nilai Jabatan (`Nilai Jabatan 100% = Poin Jabatan × PIR`)
- **Faktor Pengali Status Kepegawaian**:
  - `PNS` / `Pegawai Tetap`: `100%`
  - `CPNS` / `CPT-PTNBH`: `80%`
  - `Tugas Belajar`: `60%`
- **Ketentuan Potongan Kehadiran**:
  - Ketidakhadiran fisik `> 50%` dari Hari Kerja (22 hari) $\rightarrow$ **Tidak Layak Bayar (`P1 Bruto = Rp 0`)**
  - Cuti Tahunan / Tugas Kedinasan: `0%` per hari
  - Cuti Sakit: `1%` per hari
  - Cuti Bersalin anak ke-1 & ke-2: `1%` per hari; anak ke-3: `2%` per hari; anak ke-4+: `3%` per hari
  - Cuti Karena Alasan Penting: `3%` per hari
  - Cuti Besar: `1,5%` per hari
  - Tanpa Keterangan (`Alfa`): `5%` per hari
- **Ketentuan Potongan Hukuman Disiplin (`Hukdis`)**:
  - `Ringan`: `0%`
  - `Sedang`: `25%` dari `P1 Pertimbangan`
  - `Berat`: `100%` (`P1 Bruto = Rp 0`)

---

## 2. Tabel Hitung Manual 10 Pegawai Sampel (Periode Oktober 2026 – 22 Hari Kerja)

| No | NIP | Nama Pegawai | Status (Pengali) | Jabatan & Grade (Poin) | Nilai Jabatan 100% (Rp) | P1 Gross 40% (Rp) | P1 Pertimbangan (Rp) | Potongan Hadir (%) & (Rp) | Potongan Hukdis (%) & (Rp) | P1 Setelah Potongan / Bruto (Rp) | Pajak PPh21 5% (Rp) | P1 Netto (Rp) | Skenario Uji |
|:--:|:---|:---|:---:|:---|---:|---:|---:|---:|---:|---:|---:|---:|:---|
| 1 | `198803122015042001` | Dr. Rina Maharani, M.T. | PNS (100%) | Lektor Kepala • Grade 11 (2.095) | 6.285.000 | 2.514.000 | 2.514.000 | 1% (25.140) | 0% (0) | **2.488.860** | 124.443 | **2.364.417** | Potongan Cuti Sakit 1 hari (1%) |
| 2 | `198710082016041002` | Andi Pratama, S.Kom. | PNS (100%) | Pranata Komputer • Grade 8 (1.312) | 3.936.000 | 1.574.400 | 1.574.400 | 0% (0) | 0% (0) | **1.574.400** | 78.720 | **1.495.680** | Tanpa potongan (Hukdis Ringan sudah berakhir) |
| 3 | `198603131803022004` | Siti Rahmah, M.Kom. | PNS (100%) | Lektor • Grade 10 (1.744) | 5.232.000 | 2.092.800 | 2.092.800 | 59,09% > 50% (2.092.800) | 0% (0) | **0** | 0 | **0** | Ketidakhadiran fisik > 50% (13/22 hari Alfa) |
| 4 | `198506202010121001` | Budi Santoso, M.T. | PNS (100%) | Lektor Kepala • Grade 11 (2.095) | 6.285.000 | 2.514.000 | 2.514.000 | 10% (251.400) | 25% (628.500) | **1.634.100** | 81.705 | **1.552.395** | Hukdis Sedang Aktif (25%) + 2 hari Alfa (10%) |
| 5 | `198907122015042001` | Sri Madona, S.Kom | CPT-PTNBH (80%) | Pengelola Data dan Informasi • Grade 6 (997) | 2.991.000 | 1.196.400 | 957.120 | 0% (0) | 0% (0) | **957.120** | 47.856 | **909.264** | CPT-PTNBH 80% sesuai Contoh Amprah A2 |
| 6 | `198904062019071012` | Fikri Ananda, M.Kom. | PNS (100%) | Asisten Ahli • Grade 9 (1.453) | 4.359.000 | 1.743.600 | 1.743.600 | 0% (0) | 0% (0) | **1.743.600** | 87.180 | **1.656.420** | PNS Dosen Grade 9 tanpa potongan |
| 7 | `199507212022032008` | Nadia Putri, S.Kom. | CPNS (80%) | Pranata Komputer • Grade 8 (1.312) | 3.936.000 | 1.574.400 | 1.259.520 | 0% (0) | 0% (0) | **1.259.520** | 62.976 | **1.196.544** | CPNS 80% + 2 hari Cuti Tahunan (potongan 0%) |
| 8 | `198209102010011003` | Ricky Akbar, M.Kom. | CPT-PTNBH (80%) | Lektor • Grade 10 (1.744) | 5.232.000 | 2.092.800 | 1.674.240 | 0% (0) | 0% (0) | **1.674.240** | 83.712 | **1.590.528** | CPT-PTNBH Dosen 80% tanpa potongan |
| 9 | `199001152018022005` | Dewi Anggraini, S.Sos. | PNS (100%) | Analis Kepegawaian Ahli Muda • Grade 8 (1.312) | 3.936.000 | 1.574.400 | 1.574.400 | 3% (47.232) | 0% (0) | **1.527.168** | 76.358 | **1.450.810** | Potongan Cuti Alasan Penting 1 hari (3%) |
| 10 | `199202152019031002` | Dr. Ir. Rudi Hartono, M.Sc. | Tugas Belajar (60%) | Lektor • Grade 9 (1.453) | 4.359.000 | 1.743.600 | 1.046.160 | 0% (0) | 0% (0) | **1.046.160** | 52.308 | **993.852** | Tugas Belajar 60% tanpa potongan kehadiran |
| **-** | `198412302009121004` | Hendro Wibowo, S.T. | Nonaktif | Lektor • Grade 10 | - | - | - | - | - | **Tidak Dihitung** | - | - | Pegawai Nonaktif (Mutasi keluar unit – FR-03) |

---

## 3. Total Rekapitulasi 10 Pegawai Sampel Aktif FTI
- **Total P1 Pertimbangan**: `Rp 16.950.240`
- **Total Potongan Kehadiran**: `Rp 2.416.572` (termasuk Rp 2.092.800 dari pegawai ketidakhadiran > 50%)
- **Total Potongan Hukuman Disiplin**: `Rp 628.500`
- **Total P1 Setelah Potongan (Bruto)**: `Rp 13.905.168`
- **Total Pajak PPh 21 (5%)**: `Rp 695.258`
- **Total P1 Netto**: `Rp 13.209.910`
