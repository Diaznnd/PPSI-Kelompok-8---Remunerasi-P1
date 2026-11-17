# API Documentation - UPT Remunerasi

Dokumentasi lengkap endpoint API untuk role **UPT Remunerasi** (Pusat / Tingkat Universitas).

Base URL: `/api/upt-remunerasi`

Semua endpoint memerlukan autentikasi via `Authorization: Bearer {token}` dan role `upt_remunerasi`.

---

## 1. Dashboard

### GET /dashboard
Menampilkan ringkasan dashboard eksekutif tingkat universitas.

**Query Parameters:**
- `periode` (optional): Format `YYYY-MM`, default periode saat ini

**Response:**
```json
{
  "periode": "2026-10",
  "statistik": {
    "total_unit": 12,
    "unit_mengajukan": 10,
    "menunggu_hitung_pajak": 3,
    "selesai_hitung_pajak": 7,
    "menunggu_penetapan_jabatan": 5,
    "pengaduan_eskalasi": 2,
    "total_remunerasi": 4587650000,
    "total_pengurangan": 0,
    "total_bruto": 4587650000,
    "total_pajak": 412305000,
    "total_netto": 4175345000
  },
  "pengajuan_unit": [...],
  "audit_terbaru": [...]
}
```

---

## 2. Penetapan Jabatan & Grade

### GET /penetapan-jabatan
Daftar seluruh usulan jabatan/grade se-universitas.

**Query Parameters:**
- `status` (optional): `semua`, `menunggu`, `ditetapkan`, `ditolak`
- `unit_id` (optional): Filter berdasarkan unit
- `q` (optional): Search nama/NIP

### GET /penetapan-jabatan/{id}
Detail satu usulan jabatan.

### POST /penetapan-jabatan/{id}/tetapkan
Penetapan resmi usulan jabatan oleh UPT Remunerasi.

**Request Body:**
```json
{
  "sk_penetapan": "SK/UPT/2026/123",
  "catatan": "Ditetapkan sesuai SK Rektor"
}
```

---

## 3. Perhitungan Pajak & Penetapan Netto

### GET /hitung-pajak
Daftar pengajuan yang siap hitung pajak.

**Query Parameters:**
- `periode` (optional): Format `YYYY-MM`
- `unit_id` (optional): Filter berdasarkan unit

### GET /hitung-pajak/{id}
Detail perhitungan pajak untuk satu pengajuan.

### POST /hitung-pajak/{id}/tetapkan-netto
Tetapkan nilai netto setelah perhitungan pajak.

**Request Body:**
```json
{
  "catatan": "Perhitungan pajak telah diverifikasi"
}
```

---

## 4. Penerbitan Slip P1

### GET /penerbitan-slip
Daftar pengajuan yang siap diterbitkan slip.

**Query Parameters:**
- `periode` (optional): Format `YYYY-MM`
- `status` (optional): `siap`, `diterbitkan`

### POST /penerbitan-slip/{pengajuanId}/terbitkan
Terbitkan slip P1 untuk seluruh pegawai di pengajuan tersebut.

---

## 5. Amprah Universitas

### GET /amprah
Daftar amprah remunerasi universitas.

**Query Parameters:**
- `periode` (optional): Format `YYYY-MM`

### POST /amprah/generate
Generate amprah baru untuk periode tertentu.

**Request Body:**
```json
{
  "periode": "2026-10"
}
```

### GET /amprah/{id}
Detail amprah termasuk breakdown per unit.

---

## 6. Master Data

### Unit Kerja
- `GET /master/unit` - Daftar unit kerja
- `POST /master/unit` - Tambah unit baru
- `PUT /master/unit/{id}` - Update unit
- `PATCH /master/unit/{id}/status` - Toggle status aktif

### Grade & Jabatan
- `GET /master/grade` - Daftar grade
- `PUT /master/grade/{id}` - Update nilai grade

### Parameter Remunerasi
- `GET /master/parameter` - Daftar parameter
- `PUT /master/parameter/{id}` - Update parameter

---

## 7. Manajemen Akun & RBAC

### GET /akun
Daftar akun pengguna sistem.

**Query Parameters:**
- `peran` (optional): Filter berdasarkan role
- `status` (optional): `aktif`, `nonaktif`
- `q` (optional): Search nama/NIP

### POST /akun
Buat akun baru.

**Request Body:**
```json
{
  "NIP": "199001012020011001",
  "peran": "bendahara",
  "unit_id": 1,
  "password": "password123"
}
```

### PUT /akun/{id}
Update akun.

### PATCH /akun/{id}/status
Toggle status aktif/nonaktif.

### POST /akun/{id}/reset-password
Reset password akun.

---

## 8. Pengaduan Eskalasi

### GET /pengaduan
Daftar pengaduan eskalasi tingkat universitas.

**Query Parameters:**
- `status` (optional): `Menunggu`, `Diproses`, `Selesai`

### GET /pengaduan/{id}
Detail pengaduan.

### POST /pengaduan/{id}/tanggapi
Tanggapi pengaduan.

**Request Body:**
```json
{
  "tanggapan": "Telah ditindaklanjuti sesuai prosedur"
}
```

---

## 9. Jejak Audit

### GET /audit-log
Daftar audit log aktivitas sistem.

**Query Parameters:**
- `NIP` (optional): Filter berdasarkan aktor
- `aksi` (optional): Filter berdasarkan jenis aksi
- `dari_tanggal` (optional): Format `YYYY-MM-DD`
- `sampai_tanggal` (optional): Format `YYYY-MM-DD`

---

## 10. Monitoring & Tracking

### GET /monitoring/status
Monitoring realtime status pengajuan seluruh unit.

**Query Parameters:**
- `periode` (optional): Format `YYYY-MM`

**Response:**
```json
{
  "periode": "2026-10",
  "ringkasan": {
    "total_unit": 12,
    "belum_mengajukan": 2,
    "dalam_proses": 6,
    "selesai": 4,
    "ditolak": 0
  },
  "monitoring": [...]
}
```

### GET /monitoring/timeline/{pengajuanId}
Timeline detail perjalanan satu pengajuan.

### GET /monitoring/kinerja-bendahara
Monitoring kinerja bendahara per unit.

### GET /monitoring/alerts
Alert dan peringatan untuk UPT.

**Response:**
```json
{
  "periode": "2026-10",
  "total_alerts": 3,
  "kritis": 1,
  "tinggi": 1,
  "sedang": 1,
  "alerts": [
    {
      "tipe": "warning",
      "kategori": "pengajuan",
      "judul": "Unit Belum Mengajukan",
      "pesan": "2 unit belum mengajukan remunerasi periode 2026-10",
      "prioritas": "tinggi"
    }
  ]
}
```

---

## 11. Laporan & Rekapitulasi

### GET /laporan/rekapitulasi
Generate laporan rekapitulasi remunerasi universitas.

**Query Parameters:**
- `periode` (required): Format `YYYY-MM`
- `format` (optional): `json`, `excel`, `pdf`

### GET /laporan/distribusi-grade
Laporan distribusi grade dan jabatan.

### GET /laporan/tren
Laporan tren remunerasi per periode.

**Query Parameters:**
- `periode_awal` (required): Format `YYYY-MM`
- `periode_akhir` (required): Format `YYYY-MM`

### GET /laporan/pajak
Laporan pajak PPh21 per unit.

**Query Parameters:**
- `periode` (required): Format `YYYY-MM`

### GET /laporan/keterlambatan
Laporan keterlambatan pengajuan.

**Query Parameters:**
- `periode` (required): Format `YYYY-MM`
- `batas_tanggal` (required): Format `YYYY-MM-DD`

---

## 12. Notifikasi

### GET /notifikasi
Daftar notifikasi untuk UPT.

**Query Parameters:**
- `status` (optional): `belum_dibaca`, `sudah_dibaca`
- `kategori` (optional): `info`, `peringatan`, `penting`

### PATCH /notifikasi/{id}/baca
Tandai notifikasi sebagai dibaca.

### PATCH /notifikasi/baca-semua
Tandai semua notifikasi sebagai dibaca.

### DELETE /notifikasi/{id}
Hapus notifikasi.

### POST /notifikasi/broadcast
Kirim notifikasi broadcast ke semua unit.

**Request Body:**
```json
{
  "judul": "Pengumuman Penting",
  "isi": "Batas pengajuan remunerasi diperpanjang hingga tanggal 10",
  "kategori": "pengumuman",
  "target": "semua"
}
```

**Target options:** `semua`, `bendahara`, `pegawai`

---

## 13. Ekspor Data

### GET /ekspor/rekapitulasi-csv
Ekspor rekapitulasi ke CSV.

**Query Parameters:**
- `periode` (required): Format `YYYY-MM`

**Response:** File CSV download

### GET /ekspor/detail-pegawai-csv
Ekspor detail perhitungan per pegawai ke CSV.

**Query Parameters:**
- `pengajuan_id` (required): ID pengajuan

**Response:** File CSV download

### GET /ekspor/usulan-jabatan-csv
Ekspor daftar usulan jabatan ke CSV.

**Query Parameters:**
- `status` (optional): Filter status

**Response:** File CSV download

### GET /ekspor/data-excel
Generate data untuk ekspor Excel (JSON format).

**Query Parameters:**
- `periode` (required): Format `YYYY-MM`
- `tipe` (required): `rekapitulasi`, `detail_semua`, `per_unit`
- `unit_id` (optional): Required jika tipe `per_unit`

---

## 14. Konfigurasi Sistem

### GET /konfigurasi
Ambil konfigurasi sistem.

**Response:**
```json
{
  "periode_aktif": "2026-10",
  "batas_pengajuan": 5,
  "mode_sistem": "normal",
  "fitur": {
    "auto_hitung_pajak": true,
    "notifikasi_otomatis": true,
    "validasi_ketat": false
  },
  "parameter_remunerasi": [...]
}
```

### PUT /konfigurasi/periode-aktif
Update periode aktif.

**Request Body:**
```json
{
  "periode": "2026-11"
}
```

### PUT /konfigurasi/batas-pengajuan
Update batas tanggal pengajuan.

**Request Body:**
```json
{
  "tanggal": 5
}
```

### PUT /konfigurasi/mode-sistem
Toggle mode sistem.

**Request Body:**
```json
{
  "mode": "maintenance",
  "alasan": "Pemeliharaan server terjadwal"
}
```

**Mode options:** `normal`, `maintenance`, `read_only`

### PUT /konfigurasi/fitur
Toggle status fitur.

**Request Body:**
```json
{
  "fitur": "auto_hitung_pajak",
  "aktif": true
}
```

### PUT /konfigurasi/parameter-batch
Update multiple parameter sekaligus.

**Request Body:**
```json
{
  "parameters": [
    {
      "id": 1,
      "nilai": 5000000
    },
    {
      "id": 2,
      "nilai": 0.15
    }
  ]
}
```

### POST /konfigurasi/backup
Backup konfigurasi saat ini.

---

## Error Responses

### 401 Unauthorized
```json
{
  "message": "Unauthenticated."
}
```

### 403 Forbidden
```json
{
  "message": "Akses ditolak: Anda tidak memiliki wewenang sebagai UPT Remunerasi."
}
```

### 404 Not Found
```json
{
  "message": "Resource not found."
}
```

### 422 Validation Error
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "periode": ["The periode field is required."]
  }
}
```

---

## Status Codes

- `200 OK` - Request berhasil
- `201 Created` - Resource berhasil dibuat
- `400 Bad Request` - Request tidak valid
- `401 Unauthorized` - Tidak terautentikasi
- `403 Forbidden` - Tidak memiliki akses
- `404 Not Found` - Resource tidak ditemukan
- `422 Unprocessable Entity` - Validation error
- `500 Internal Server Error` - Server error

---

## Notes

1. Semua tanggal menggunakan format ISO 8601
2. Semua nominal dalam format numeric (float/double)
3. Response selalu dalam format JSON
4. Timestamp menggunakan timezone Asia/Jakarta
5. Pagination menggunakan Laravel default (15 items per page)
