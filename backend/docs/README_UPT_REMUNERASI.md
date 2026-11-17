# 📚 Dokumentasi Backend UPT Remunerasi

Selamat datang di dokumentasi lengkap Backend API untuk role **UPT Remunerasi** pada Sistem Informasi Remunerasi (SIREMUN) UNSRI.

---

## 📖 Daftar Isi

### 1. [Fitur & Overview](./FITUR_UPT_REMUNERASI.md)
Dokumentasi lengkap tentang semua fitur yang tersedia, controller, dan flow data.

**Isi:**
- Daftar 14 Controller lengkap
- Penjelasan setiap fitur
- Security features
- Performance optimization
- TODO & Future enhancements

---

### 2. [API Documentation](./API_UPT_REMUNERASI.md)
Dokumentasi teknis semua endpoint API dengan contoh request/response.

**Isi:**
- 79 Endpoint lengkap
- Request parameters
- Response format
- Error handling
- Status codes
- Query examples

---

### 3. [Testing Guide](./TESTING_UPT_REMUNERASI.md)
Panduan testing menggunakan cURL dan Postman.

**Isi:**
- cURL examples untuk semua endpoint
- Postman collection template
- Authentication guide
- Testing workflow
- Common issues & solutions

---

## 🚀 Quick Start

### 1. Setup Laravel Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

### 2. Get Auth Token

```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "NIP": "199001012020011001",
    "password": "password123"
  }'
```

### 3. Test Endpoint

```bash
curl -X GET "http://localhost:8000/api/upt-remunerasi/dashboard" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

---

## 📊 Struktur Fitur

```
UPT Remunerasi Backend
│
├── Dashboard & Monitoring
│   ├── Dashboard Eksekutif
│   ├── Monitoring Status Pengajuan
│   ├── Timeline Pengajuan
│   ├── Kinerja Bendahara
│   └── Alerts & Warnings
│
├── Workflow Approval
│   ├── Penetapan Jabatan/Grade
│   ├── Perhitungan Pajak PPh21
│   └── Penerbitan Slip Gaji
│
├── Master Data Management
│   ├── Unit Kerja (CRUD)
│   ├── Grade & Jabatan
│   └── Parameter Remunerasi
│
├── User Management
│   ├── Manajemen Akun
│   ├── RBAC (Role-Based Access Control)
│   └── Reset Password
│
├── Reporting & Analytics
│   ├── Rekapitulasi Universitas
│   ├── Distribusi Grade
│   ├── Tren Remunerasi
│   ├── Laporan Pajak
│   └── Laporan Keterlambatan
│
├── Communication
│   ├── Notifikasi System
│   ├── Broadcast Messages
│   └── Pengaduan Eskalasi
│
├── Data Export
│   ├── CSV Export
│   └── Excel Data (JSON)
│
└── System Configuration
    ├── Periode Aktif
    ├── Batas Pengajuan
    ├── Mode Sistem
    ├── Feature Flags
    └── Backup/Restore
```

---

## 🎯 Fitur Unggulan

### ⭐ Monitoring Realtime
- Status pengajuan seluruh unit
- Timeline detail perjalanan pengajuan
- Evaluasi kinerja bendahara
- Alert system untuk bottleneck

### 📊 Comprehensive Reporting
- Rekapitulasi universitas
- Analisis tren multi-periode
- Distribusi grade pegawai
- Laporan pajak PPh21
- Tracking keterlambatan

### 🔔 Notification System
- Push notification
- Broadcast messaging
- Target spesifik (bendahara, pegawai, all)
- Mark as read/unread

### 📤 Data Export
- CSV export (ready download)
- Excel data (JSON format)
- Multiple export types

### ⚙️ System Configuration
- Dynamic configuration
- Feature flags
- Mode management (normal/maintenance)
- Backup/restore capability

---

## 🔐 Security

Semua endpoint dilindungi dengan:

✅ **Authentication** - Laravel Sanctum Bearer Token  
✅ **Authorization** - Role-based access control  
✅ **Validation** - Input validation di setiap request  
✅ **Audit Logging** - Tracking semua aktivitas penting  
✅ **Before/After Values** - Tracking perubahan data  

---

## 📦 Technology Stack

- **Framework:** Laravel 11
- **Database:** MySQL / PostgreSQL
- **Authentication:** Laravel Sanctum
- **Caching:** Redis / File Cache
- **API Format:** RESTful JSON
- **Documentation:** Markdown

---

## 🌐 Base URL

```
Development: http://localhost:8000/api
Production: https://siremun.unsri.ac.id/api
```

---

## 📱 API Endpoint Groups

### Core Operations (30 endpoints)
- Dashboard (1)
- Penetapan Jabatan (3)
- Hitung Pajak (3)
- Penerbitan Slip (2)
- Amprah (3)
- Master Data (9)
- Manajemen Akun (5)
- Pengaduan (3)
- Audit Log (1)

### Advanced Features (29 endpoints)
- Monitoring (4)
- Laporan (5)
- Notifikasi (5)
- Ekspor (4)
- Konfigurasi (7)

---

## 👥 Roles & Permissions

### UPT Remunerasi
Role ini memiliki akses penuh ke semua endpoint UPT Remunerasi:

✅ View dashboard universitas  
✅ Approve penetapan jabatan/grade  
✅ Hitung dan tetapkan pajak PPh21  
✅ Terbitkan slip gaji massal  
✅ Generate amprah universitas  
✅ CRUD master data  
✅ Manage user accounts  
✅ View & respond pengaduan  
✅ Monitor seluruh pengajuan  
✅ Generate berbagai laporan  
✅ Send broadcast notifications  
✅ Export data  
✅ Configure system settings  

---

## 🔄 Typical Workflow

```
1. Unit mengajukan remunerasi (Bendahara)
   ↓
2. UPT verify & hitung pajak
   ↓
3. UPT tetapkan netto
   ↓
4. UPT terbitkan slip
   ↓
5. UPT generate amprah
   ↓
6. Monitoring & reporting
```

---

## 📈 Performance Considerations

### Optimization Implemented
- Eager loading untuk relasi
- Query optimization dengan indexing
- Caching untuk config & parameters
- Pagination untuk large datasets
- Lean JSON responses

### Scalability
- Stateless API design
- Horizontal scaling ready
- Cache layer support
- Queue support untuk background jobs

---

## 🧪 Testing

### Manual Testing
Gunakan cURL, Postman, atau Thunder Client dengan panduan di [Testing Guide](./TESTING_UPT_REMUNERASI.md).

### Automated Testing
```bash
php artisan test --filter UptRemunerasiTest
```

### API Testing Tools
- **Postman** - Import collection dari testing guide
- **Thunder Client** - VS Code extension
- **Insomnia** - REST client alternative
- **cURL** - Command line testing

---

## 🐛 Troubleshooting

### Common Issues

#### 401 Unauthorized
- Token expired atau tidak valid
- **Solution:** Login ulang untuk mendapatkan token baru

#### 403 Forbidden
- User tidak memiliki role `upt_remunerasi`
- **Solution:** Verify role assignment di database

#### 404 Not Found
- Endpoint atau resource tidak ditemukan
- **Solution:** Check API documentation untuk endpoint yang benar

#### 422 Validation Error
- Input tidak sesuai dengan validation rules
- **Solution:** Check error messages di response

---

## 📞 Support & Contact

Untuk pertanyaan atau issue:

- **Developer:** Backend Team SIREMUN
- **Documentation:** Check files di folder `docs/`
- **API Issues:** Lihat response error messages
- **Feature Request:** Submit ke project backlog

---

## 🔗 Related Files

### Source Code
```
backend/app/Http/Controllers/UptRemunerasi/
├── DashboardController.php
├── PenetapanJabatanController.php
├── HitungPajakController.php
├── PenerbitanSlipController.php
├── AmprahUniversitasController.php
├── MasterDataController.php
├── ManajemenAkunController.php
├── PengaduanEskalasiController.php
├── AuditLogController.php
├── MonitoringController.php
├── LaporanController.php
├── NotifikasiController.php
├── EksporController.php
└── KonfigurasiController.php
```

### Routes
```
backend/routes/api.php
```

### Models
```
backend/app/Models/
├── Akun.php
├── Amprah.php
├── AuditLog.php
├── Grade.php
├── HasilPerhitungan.php
├── Jabatan.php
├── Notifikasi.php
├── ParameterRemunerasi.php
├── Pegawai.php
├── Pengaduan.php
├── PengajuanP1.php
├── RiwayatStatus.php
├── UnitKerja.php
└── UsulanJabatan.php
```

---

## 🎓 Learning Resources

### Laravel Documentation
- [Laravel 11 Docs](https://laravel.com/docs/11.x)
- [Laravel Sanctum](https://laravel.com/docs/11.x/sanctum)
- [Eloquent ORM](https://laravel.com/docs/11.x/eloquent)

### API Best Practices
- [RESTful API Design](https://restfulapi.net/)
- [HTTP Status Codes](https://httpstatuses.com/)
- [API Security](https://owasp.org/www-project-api-security/)

---

## 📝 Changelog

### Version 1.0.0 (Current)
- ✅ 14 Controllers implemented
- ✅ 79 API endpoints
- ✅ Complete CRUD operations
- ✅ Advanced monitoring & reporting
- ✅ Export capabilities
- ✅ System configuration management
- ✅ Comprehensive documentation

---

## 🚀 Next Steps

1. **Test API Endpoints** - Gunakan testing guide
2. **Integrate Frontend** - Connect React/Vue frontend
3. **Deploy** - Setup production environment
4. **Monitor** - Setup logging & monitoring
5. **Optimize** - Performance tuning
6. **Scale** - Horizontal scaling if needed

---

## 📄 License

Internal project - UNSRI (Universitas Sriwijaya)

---

**Happy Coding! 🎉**

**Backend UPT Remunerasi ready for production!** 🚀
