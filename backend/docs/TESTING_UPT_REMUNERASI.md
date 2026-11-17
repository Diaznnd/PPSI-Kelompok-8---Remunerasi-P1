# Testing Guide - UPT Remunerasi API

Panduan testing endpoint API untuk role UPT Remunerasi menggunakan cURL, Postman, atau Thunder Client.

---

## Prerequisites

1. Server Laravel running: `php artisan serve`
2. Database seeded dengan data test
3. Token autentikasi untuk user dengan role `upt_remunerasi`

### Get Authentication Token

```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "NIP": "199001012020011001",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "token": "1|abc123xyz...",
  "user": {
    "NIP": "199001012020011001",
    "peran": "upt_remunerasi"
  }
}
```

Simpan token tersebut untuk digunakan di semua request berikutnya.

---

## 1. Dashboard

### Get Dashboard Data

```bash
curl -X GET "http://localhost:8000/api/upt-remunerasi/dashboard?periode=2026-10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

---

## 2. Penetapan Jabatan

### List Usulan Jabatan

```bash
curl -X GET "http://localhost:8000/api/upt-remunerasi/penetapan-jabatan?status=menunggu" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

### Detail Usulan

```bash
curl -X GET "http://localhost:8000/api/upt-remunerasi/penetapan-jabatan/1" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

### Tetapkan Usulan

```bash
curl -X POST "http://localhost:8000/api/upt-remunerasi/penetapan-jabatan/1/tetapkan" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "sk_penetapan": "SK/UPT/2026/123",
    "catatan": "Ditetapkan sesuai SK Rektor"
  }'
```

---

## 3. Hitung Pajak

### List Pengajuan Siap Hitung Pajak

```bash
curl -X GET "http://localhost:8000/api/upt-remunerasi/hitung-pajak?periode=2026-10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

### Detail Perhitungan Pajak

```bash
curl -X GET "http://localhost:8000/api/upt-remunerasi/hitung-pajak/1" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

### Tetapkan Netto

```bash
curl -X POST "http://localhost:8000/api/upt-remunerasi/hitung-pajak/1/tetapkan-netto" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "catatan": "Perhitungan pajak telah diverifikasi"
  }'
```

---

## 4. Penerbitan Slip

### List Pengajuan Siap Terbit

```bash
curl -X GET "http://localhost:8000/api/upt-remunerasi/penerbitan-slip?periode=2026-10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

### Terbitkan Slip

```bash
curl -X POST "http://localhost:8000/api/upt-remunerasi/penerbitan-slip/1/terbitkan" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json"
```

---

## 5. Amprah Universitas

### List Amprah

```bash
curl -X GET "http://localhost:8000/api/upt-remunerasi/amprah?periode=2026-10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

### Generate Amprah

```bash
curl -X POST "http://localhost:8000/api/upt-remunerasi/amprah/generate" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "periode": "2026-10"
  }'
```

### Detail Amprah

```bash
curl -X GET "http://localhost:8000/api/upt-remunerasi/amprah/1" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

---

## 6. Master Data

### List Unit Kerja

```bash
curl -X GET "http://localhost:8000/api/upt-remunerasi/master/unit" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

### Create Unit Kerja

```bash
curl -X POST "http://localhost:8000/api/upt-remunerasi/master/unit" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "nama": "Fakultas Baru",
    "jenis": "Fakultas",
    "aktif": true
  }'
```

### Update Grade

```bash
curl -X PUT "http://localhost:8000/api/upt-remunerasi/master/grade/1" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "nilai": 5500000
  }'
```

### Update Parameter

```bash
curl -X PUT "http://localhost:8000/api/upt-remunerasi/master/parameter/1" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "nilai": 54000000
  }'
```

---

## 7. Manajemen Akun

### List Akun

```bash
curl -X GET "http://localhost:8000/api/upt-remunerasi/akun?peran=bendahara" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

### Create Akun

```bash
curl -X POST "http://localhost:8000/api/upt-remunerasi/akun" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "NIP": "199101012020011002",
    "peran": "bendahara",
    "unit_id": 2,
    "password": "password123"
  }'
```

### Reset Password

```bash
curl -X POST "http://localhost:8000/api/upt-remunerasi/akun/1/reset-password" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "password_baru": "newpassword123"
  }'
```

---

## 8. Monitoring

### Status Pengajuan

```bash
curl -X GET "http://localhost:8000/api/upt-remunerasi/monitoring/status?periode=2026-10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

### Timeline Pengajuan

```bash
curl -X GET "http://localhost:8000/api/upt-remunerasi/monitoring/timeline/1" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

### Kinerja Bendahara

```bash
curl -X GET "http://localhost:8000/api/upt-remunerasi/monitoring/kinerja-bendahara?periode=2026-10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

### Alerts

```bash
curl -X GET "http://localhost:8000/api/upt-remunerasi/monitoring/alerts?periode=2026-10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

---

## 9. Laporan

### Rekapitulasi Universitas

```bash
curl -X GET "http://localhost:8000/api/upt-remunerasi/laporan/rekapitulasi?periode=2026-10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

### Distribusi Grade

```bash
curl -X GET "http://localhost:8000/api/upt-remunerasi/laporan/distribusi-grade" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

### Tren Remunerasi

```bash
curl -X GET "http://localhost:8000/api/upt-remunerasi/laporan/tren?periode_awal=2026-09&periode_akhir=2026-11" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

### Laporan Pajak

```bash
curl -X GET "http://localhost:8000/api/upt-remunerasi/laporan/pajak?periode=2026-10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

### Laporan Keterlambatan

```bash
curl -X GET "http://localhost:8000/api/upt-remunerasi/laporan/keterlambatan?periode=2026-10&batas_tanggal=2026-10-05" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

---

## 10. Notifikasi

### List Notifikasi

```bash
curl -X GET "http://localhost:8000/api/upt-remunerasi/notifikasi?status=belum_dibaca" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

### Mark as Read

```bash
curl -X PATCH "http://localhost:8000/api/upt-remunerasi/notifikasi/1/baca" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

### Broadcast Notifikasi

```bash
curl -X POST "http://localhost:8000/api/upt-remunerasi/notifikasi/broadcast" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "judul": "Pengumuman Penting",
    "isi": "Batas pengajuan remunerasi diperpanjang hingga tanggal 10",
    "kategori": "pengumuman",
    "target": "bendahara"
  }'
```

---

## 11. Ekspor Data

### Ekspor Rekapitulasi CSV

```bash
curl -X GET "http://localhost:8000/api/upt-remunerasi/ekspor/rekapitulasi-csv?periode=2026-10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: text/csv" \
  --output rekapitulasi_2026-10.csv
```

### Ekspor Detail Pegawai CSV

```bash
curl -X GET "http://localhost:8000/api/upt-remunerasi/ekspor/detail-pegawai-csv?pengajuan_id=1" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: text/csv" \
  --output detail_pegawai.csv
```

### Data Excel (JSON)

```bash
curl -X GET "http://localhost:8000/api/upt-remunerasi/ekspor/data-excel?periode=2026-10&tipe=rekapitulasi" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

---

## 12. Konfigurasi

### Get Konfigurasi

```bash
curl -X GET "http://localhost:8000/api/upt-remunerasi/konfigurasi" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

### Update Periode Aktif

```bash
curl -X PUT "http://localhost:8000/api/upt-remunerasi/konfigurasi/periode-aktif" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "periode": "2026-11"
  }'
```

### Toggle Mode Sistem

```bash
curl -X PUT "http://localhost:8000/api/upt-remunerasi/konfigurasi/mode-sistem" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "mode": "maintenance",
    "alasan": "Pemeliharaan server terjadwal"
  }'
```

### Toggle Fitur

```bash
curl -X PUT "http://localhost:8000/api/upt-remunerasi/konfigurasi/fitur" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "fitur": "auto_hitung_pajak",
    "aktif": true
  }'
```

### Update Parameter Batch

```bash
curl -X PUT "http://localhost:8000/api/upt-remunerasi/konfigurasi/parameter-batch" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "parameters": [
      {"id": 1, "nilai": 5000000},
      {"id": 2, "nilai": 0.15}
    ]
  }'
```

### Backup Konfigurasi

```bash
curl -X POST "http://localhost:8000/api/upt-remunerasi/konfigurasi/backup" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

---

## 13. Audit Log

### List Audit Log

```bash
curl -X GET "http://localhost:8000/api/upt-remunerasi/audit-log?aksi=Penetapan%20Jabatan" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

---

## Postman Collection

Import collection berikut ke Postman:

```json
{
  "info": {
    "name": "SIREMUN - UPT Remunerasi",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:8000/api"
    },
    {
      "key": "token",
      "value": "YOUR_TOKEN_HERE"
    }
  ],
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{token}}"
      }
    ]
  }
}
```

---

## Testing Tips

1. **Gunakan environment variables** untuk base URL dan token
2. **Test dalam urutan workflow** (penetapan jabatan → hitung pajak → penerbitan slip)
3. **Check response status codes** untuk memastikan success
4. **Validate JSON responses** sesuai dengan dokumentasi
5. **Test error cases** (401, 403, 404, 422)
6. **Monitor audit log** untuk tracking aktivitas

---

## Common Issues

### 401 Unauthorized
- Token expired atau tidak valid
- Refresh token dengan login ulang

### 403 Forbidden
- User tidak memiliki role `upt_remunerasi`
- Check role assignment di database

### 404 Not Found
- Resource ID tidak ditemukan
- Verify ID dengan GET endpoint terlebih dahulu

### 422 Validation Error
- Input tidak sesuai validation rules
- Check error messages di response body

---

## Next Steps

Setelah testing manual, implementasikan:
1. Automated testing dengan PHPUnit
2. Integration tests
3. API documentation dengan Swagger/OpenAPI
4. Load testing dengan Apache Bench atau JMeter
