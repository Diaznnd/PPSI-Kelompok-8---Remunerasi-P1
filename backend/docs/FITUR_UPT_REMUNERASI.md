# Fitur Backend UPT Remunerasi

Dokumentasi lengkap fitur backend yang telah diimplementasikan untuk role **UPT Remunerasi**.

---

## 📋 Daftar Controller yang Tersedia

### 1. **DashboardController**
Dashboard eksekutif tingkat universitas dengan:
- Statistik ringkasan remunerasi se-universitas
- Status pengajuan per unit kerja
- Monitoring progress workflow
- 5 Jejak audit terbaru
- Indikator KPI remunerasi

**Endpoint:** `GET /api/upt-remunerasi/dashboard`

---

### 2. **PenetapanJabatanController**
Manajemen penetapan jabatan dan grade pegawai:
- Daftar usulan jabatan/grade dari seluruh unit
- Filter berdasarkan status (menunggu, ditetapkan, ditolak)
- Detail usulan lengkap dengan dokumen pendukung
- Penetapan resmi usulan jabatan
- Update nilai jabatan di hasil perhitungan
- Audit trail semua aktivitas penetapan

**Endpoint:**
- `GET /api/upt-remunerasi/penetapan-jabatan`
- `GET /api/upt-remunerasi/penetapan-jabatan/{id}`
- `POST /api/upt-remunerasi/penetapan-jabatan/{id}/tetapkan`

---

### 3. **HitungPajakController**
Perhitungan dan penetapan pajak PPh21:
- Daftar pengajuan yang siap hitung pajak
- Perhitungan otomatis PPh21 per pegawai
- PTKP berdasarkan status kawin dan tanggungan
- Penetapan nilai netto resmi
- Preview sebelum penetapan
- Audit log perhitungan pajak

**Endpoint:**
- `GET /api/upt-remunerasi/hitung-pajak`
- `GET /api/upt-remunerasi/hitung-pajak/{id}`
- `POST /api/upt-remunerasi/hitung-pajak/{id}/tetapkan-netto`

---

### 4. **PenerbitanSlipController**
Penerbitan slip gaji P1:
- Daftar pengajuan yang siap diterbitkan
- Penerbitan massal slip untuk seluruh pegawai
- Update status pengajuan ke "selesai"
- Notifikasi otomatis ke pegawai
- Tracking status penerbitan

**Endpoint:**
- `GET /api/upt-remunerasi/penerbitan-slip`
- `POST /api/upt-remunerasi/penerbitan-slip/{pengajuanId}/terbitkan`

---

### 5. **AmprahUniversitasController**
Manajemen amprah remunerasi universitas:
- Generate amprah per periode
- Rekap total remunerasi per unit
- Breakdown detail amprah
- Status amprah (draft, disetujui, dicairkan)
- Export data amprah

**Endpoint:**
- `GET /api/upt-remunerasi/amprah`
- `POST /api/upt-remunerasi/amprah/generate`
- `GET /api/upt-remunerasi/amprah/{id}`

---

### 6. **MasterDataController**
Manajemen master data sistem:

#### Unit Kerja
- CRUD unit kerja
- Toggle status aktif/nonaktif
- Counter jumlah pengajuan per unit

#### Grade & Jabatan
- List grade dengan daftar jabatan
- Update nilai grade
- Audit log perubahan nilai

#### Parameter Remunerasi
- List parameter sistem
- Update nilai parameter
- Tracking perubahan parameter

**Endpoint:**
- Unit: `GET|POST|PUT|PATCH /api/upt-remunerasi/master/unit`
- Grade: `GET|PUT /api/upt-remunerasi/master/grade`
- Parameter: `GET|PUT /api/upt-remunerasi/master/parameter`

---

### 7. **ManajemenAkunController**
Manajemen akun pengguna dan RBAC:
- CRUD akun pengguna
- Assignment role dan unit
- Toggle status aktif/nonaktif
- Reset password
- Search dan filter akun
- Audit log aktivitas akun

**Endpoint:**
- `GET /api/upt-remunerasi/akun`
- `POST /api/upt-remunerasi/akun`
- `PUT /api/upt-remunerasi/akun/{id}`
- `PATCH /api/upt-remunerasi/akun/{id}/status`
- `POST /api/upt-remunerasi/akun/{id}/reset-password`

---

### 8. **PengaduanEskalasiController**
Handle pengaduan eskalasi tingkat universitas:
- Daftar pengaduan eskalasi
- Detail pengaduan dengan history tanggapan
- Tanggapi pengaduan
- Update status pengaduan
- Notifikasi ke pengadu

**Endpoint:**
- `GET /api/upt-remunerasi/pengaduan`
- `GET /api/upt-remunerasi/pengaduan/{id}`
- `POST /api/upt-remunerasi/pengaduan/{id}/tanggapi`

---

### 9. **AuditLogController**
Jejak audit semua aktivitas sistem:
- List audit log dengan filter
- Filter berdasarkan aktor, aksi, tanggal
- Detail perubahan (before/after)
- Export audit log
- Retention policy

**Endpoint:**
- `GET /api/upt-remunerasi/audit-log`

---

### 10. **MonitoringController** ⭐ NEW
Monitoring realtime dan tracking:

#### Status Pengajuan
- Monitor status seluruh unit secara realtime
- Progress bar untuk setiap pengajuan
- Identifikasi bottleneck
- Ringkasan per kategori status

#### Timeline Pengajuan
- Detail perjalanan satu pengajuan
- History perubahan status
- Informasi aktor dan waktu

#### Kinerja Bendahara
- Evaluasi kinerja bendahara per unit
- Metrik tepat waktu vs terlambat
- Tingkat penyelesaian
- Ranking bendahara

#### Alerts & Warnings
- Unit belum mengajukan
- Pengajuan tertahan > 7 hari
- Usulan jabatan menunggu > 14 hari
- Pengaduan belum ditangani
- Prioritas alert (kritis, tinggi, sedang)

**Endpoint:**
- `GET /api/upt-remunerasi/monitoring/status`
- `GET /api/upt-remunerasi/monitoring/timeline/{pengajuanId}`
- `GET /api/upt-remunerasi/monitoring/kinerja-bendahara`
- `GET /api/upt-remunerasi/monitoring/alerts`

---

### 11. **LaporanController** ⭐ NEW
Generate berbagai jenis laporan:

#### Rekapitulasi Universitas
- Total remunerasi se-universitas
- Breakdown per unit kerja
- Summary statistik

#### Distribusi Grade
- Jumlah pegawai per grade
- Unit terkait per grade
- Visualisasi distribusi

#### Tren Remunerasi
- Analisis tren antar periode
- Perbandingan periode ke periode
- Growth rate

#### Laporan Pajak
- Total pajak PPh21 per unit
- Jumlah wajib pajak
- Persentase pajak

#### Laporan Keterlambatan
- Unit tepat waktu vs terlambat
- Unit belum mengajukan
- Hari keterlambatan

**Endpoint:**
- `GET /api/upt-remunerasi/laporan/rekapitulasi`
- `GET /api/upt-remunerasi/laporan/distribusi-grade`
- `GET /api/upt-remunerasi/laporan/tren`
- `GET /api/upt-remunerasi/laporan/pajak`
- `GET /api/upt-remunerasi/laporan/keterlambatan`

---

### 12. **NotifikasiController** ⭐ NEW
Sistem notifikasi push:

#### Manajemen Notifikasi
- List notifikasi dengan filter
- Mark as read (single/all)
- Delete notifikasi
- Counter unread

#### Broadcast Notifikasi
- Kirim notifikasi ke semua user
- Target spesifik (bendahara, pegawai, semua)
- Kategori notifikasi (info, peringatan, penting, pengumuman)

**Endpoint:**
- `GET /api/upt-remunerasi/notifikasi`
- `PATCH /api/upt-remunerasi/notifikasi/{id}/baca`
- `PATCH /api/upt-remunerasi/notifikasi/baca-semua`
- `DELETE /api/upt-remunerasi/notifikasi/{id}`
- `POST /api/upt-remunerasi/notifikasi/broadcast`

---

### 13. **EksporController** ⭐ NEW
Ekspor data ke berbagai format:

#### CSV Export
- Rekapitulasi universitas
- Detail per pegawai
- Usulan jabatan
- Direct download

#### Excel Data (JSON)
- Rekapitulasi per unit
- Detail semua pegawai
- Detail per unit
- Frontend handle rendering Excel

**Endpoint:**
- `GET /api/upt-remunerasi/ekspor/rekapitulasi-csv`
- `GET /api/upt-remunerasi/ekspor/detail-pegawai-csv`
- `GET /api/upt-remunerasi/ekspor/usulan-jabatan-csv`
- `GET /api/upt-remunerasi/ekspor/data-excel`

---

### 14. **KonfigurasiController** ⭐ NEW
Manajemen konfigurasi sistem:

#### Pengaturan Periode
- Set periode aktif
- Batas tanggal pengajuan
- Auto-rollover periode

#### Mode Sistem
- Normal mode
- Maintenance mode
- Read-only mode

#### Feature Flags
- Auto hitung pajak
- Notifikasi otomatis
- Validasi ketat

#### Parameter Management
- Update parameter batch
- Cache management
- Backup/restore konfigurasi

**Endpoint:**
- `GET /api/upt-remunerasi/konfigurasi`
- `PUT /api/upt-remunerasi/konfigurasi/periode-aktif`
- `PUT /api/upt-remunerasi/konfigurasi/batas-pengajuan`
- `PUT /api/upt-remunerasi/konfigurasi/mode-sistem`
- `PUT /api/upt-remunerasi/konfigurasi/fitur`
- `PUT /api/upt-remunerasi/konfigurasi/parameter-batch`
- `POST /api/upt-remunerasi/konfigurasi/backup`

---

## 🔐 Security Features

1. **Authorization Middleware**
   - Semua endpoint check role `upt_remunerasi`
   - Method `authorizeUpt()` di setiap controller

2. **Audit Logging**
   - Semua aktivitas penting dicatat
   - Before/after values
   - User tracking

3. **Input Validation**
   - Laravel validation rules
   - Type checking
   - Sanitization

4. **Data Privacy**
   - Sensitive data handling
   - Encrypted fields
   - Access control

---

## 🚀 Performance Optimization

1. **Database**
   - Eager loading relationships
   - Query optimization
   - Indexed columns

2. **Caching**
   - Configuration cache
   - Parameter cache (6 hours TTL)
   - Query result cache

3. **Response**
   - Lean JSON responses
   - Pagination
   - Selective field loading

---

## 📊 Data Flow

```
1. Dashboard → Overview semua unit
2. Penetapan Jabatan → Update grade pegawai
3. Hitung Pajak → Kalkulasi PPh21
4. Penerbitan Slip → Generate slip untuk pegawai
5. Amprah → Generate dokumen pencairan
6. Monitoring → Track progress realtime
7. Laporan → Generate insights
```

---

## 🎯 Key Features Summary

✅ Dashboard eksekutif comprehensive  
✅ Workflow penetapan jabatan & grade  
✅ Perhitungan pajak PPh21 otomatis  
✅ Penerbitan slip massal  
✅ Manajemen amprah universitas  
✅ CRUD master data (unit, grade, parameter)  
✅ Manajemen akun & RBAC  
✅ Handle pengaduan eskalasi  
✅ Audit log lengkap  
✅ **Monitoring realtime** ⭐  
✅ **Generate berbagai laporan** ⭐  
✅ **Sistem notifikasi** ⭐  
✅ **Ekspor data (CSV/Excel)** ⭐  
✅ **Konfigurasi sistem** ⭐  

---

## 📝 TODO / Future Enhancements

- [ ] Integration dengan sistem keuangan eksternal
- [ ] WhatsApp notification gateway
- [ ] Email notification service
- [ ] PDF generation untuk slip dan laporan
- [ ] Advanced analytics & visualization
- [ ] Mobile API optimization
- [ ] WebSocket untuk realtime updates
- [ ] Approval workflow builder
- [ ] Document management system
- [ ] Integration dengan SIMPEG

---

## 🔗 Related Documentation

- [API Documentation](./API_UPT_REMUNERASI.md)
- [Database Schema](../database/migrations/)
- [Models Documentation](../app/Models/)
- [Testing Guide](./TESTING.md)
