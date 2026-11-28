export const FEATURES = {
  koreksiSusulan: false,
}

export const PIR_DEFAULT = 3000
export const PERSENTASE_P1_DEFAULT = 40 // atau 0.4

// REMOVED: periodeUPT array - Use dynamic generation instead
// Helper to generate periode list dynamically:
// const periods = Array.from({ length: 12 }, (_, i) => {
//   const d = new Date(); d.setMonth(d.getMonth() - i);
//   return d.toLocaleDateString('id-ID', { year: 'numeric', month: 'long' });
// });

export type UPTStatus =
  | "draft"
  | "diajukan"
  | "dikembalikan"
  | "terverifikasi"
  | "netto_ditetapkan"
  | "amprah_tersedia"
  | "Menunggu"
  | "Diproses"
  | "Selesai"
  | "Dikembalikan"

export type UsulanJabatanStatus =
  | "diajukan"
  | "dikembalikan"
  | "terverifikasi"
  | "ditetapkan"
  | "ditolak"
  | "Disetujui Verifikator"
  | "Ditetapkan"

export type AmprahStatus = "belum_disusun" | "tersedia"
export type SlipStatus = "belum_terbit" | "terbit" | "gagal"
export type PengaduanStatus =
  | "diajukan"
  | "ditindaklanjuti"
  | "diteruskan"
  | "selesai"
  | "Diajukan"
  | "Diproses"
  | "Ditindaklanjuti"
  | "Diteruskan"
  | "Selesai"
  | "Ditolak"

export type PeriodeStatus = "belum_dibuka" | "terbuka" | "terkunci"
export type StatusEntitas = "aktif" | "nonaktif"

export type UPTPengajuan = {
  id: string
  unit: string
  periode: string
  bendahara: string
  pegawai: number
  total: number
  netto: number
  status: UPTStatus
  catatan?: string
  diajukanPada?: string
  diverifikasiOleh?: string
  ditetapkanOleh?: string
}

export type TipeUnit =
  | "Fakultas"
  | "Pascasarjana"
  | "Bidang Rektorat"
  | "UPT"
  | "Lembaga"
  | "SPI"

export type UnitKerjaItem = {
  id: string | number
  kode?: string
  nama: string
  tipe?: TipeUnit
  jenis?: string
  induk?: string
  pimpinan?: string
  aktif?: number | boolean
  jumlahPegawai?: number
  bendahara?: string
  status?: StatusEntitas
}

export type MasterGradeItem = {
  id?: number
  grade?: number
  kode?: string
  kode_grade?: string
  minPoin?: number
  maxPoin?: number
  meanPoin?: number
  nilaiJabatan?: number
  nilai?: number
  p1Gross?: number
  berlakuSejak?: string
  dasarHukum?: string
  status?: StatusEntitas
  keterangan?: string
  riwayat?: { versi: string; tanggal: string; nilai: number; dasarHukum: string; alasan: string }[]
}

export type KategoriJabatan =
  | "Pejabat Pengelola Dosen"
  | "Dosen Fungsional"
  | "Dokter"
  | "Pejabat Pengelola Tendik"
  | "Tendik Fungsional"
  | "Tendik Pelaksana"

export type JabatanMasterItem = {
  id: string
  nama: string
  kategori: KategoriJabatan
  grade: number
  nilaiJabatan: number
  p1Gross: number
  status: StatusEntitas
  digunakan: number
}

export type StatusParameter = "Berlaku" | "Terjadwal" | "Berakhir"

export type ParameterItem = {
  id: string
  kode: string
  kelompok:
    | "Umum"
    | "Status Kepegawaian & Pengali"
    | "Ketidakhadiran"
    | "Keterlambatan & Pulang Cepat"
    | "Hukuman Disiplin"
    | "Ambang & Syarat Bayar"
    | "Aturan Perubahan Jabatan"
    | "Pajak"
    | "Jadwal Bulanan"
  nama: string
  nilai: string
  satuan: string
  berlakuMulai: string
  status: StatusParameter
  dasarHukum: string
  keterangan: string
  dihitungAmbang?: boolean
  berhakP1?: boolean
  pengaliPersen?: number
  catatanKhusus?: string
  riwayat?: { versi: string; tanggal: string; nilai: string; dasarHukum: string; alasan: string }[]
}

export type ParameterRemunItem = {
  id?: number
  kode: string
  kategori: string
  nilai: number
  keterangan?: string
  berlaku_mulai?: string
}

export type PeriodeDetailItem = {
  kode: string
  nama: string
  tahun: number
  bulan: number
  hariKalender: number
  hariKerja: number
  status: PeriodeStatus
  unitSelesai: number
  unitTotal: number
  tahapan: {
    nama: string
    jadwalDefault: string
    tanggalMulai: string
    tanggalSelesai: string
    status: "selesai" | "berjalan" | "menunggu"
    penanggungJawab: string
  }[]
  unitStatusList: {
    unit: string
    statusPengajuan: UPTStatus
    amprahTersedia: boolean
    nominalNetto: number
  }[]
}

export type PenandatanganConfig = {
  kepalaUpt: {
    nama: string
    nip: string
    jabatan: string
    pangkatGolongan: string
    nomorSk: string
    berlakuMulai: string
  }
  penanggungJawab: {
    nama: string
    nip: string
    jabatan: string
    pangkatGolongan: string
    nomorSk: string
    berlakuMulai: string
  }
  formatNomorAmprah: string
  formatNomorRekap: string
  kotaTandaTangan: string
}

export type JejakAuditAksi =
  | "Verifikasi Pengajuan"
  | "Penetapan Jabatan"
  | "Penetapan Netto & Pajak"
  | "Penerbitan Slip P1"
  | "Penerbitan Amprah"
  | "Koreksi Pajak Manual"
  | "Perubahan Parameter"
  | "Perubahan Master Grade"
  | "Pengelolaan Akun"
  | "Penugasan Unit"
  | "Penanganan Pengaduan"
  | "Buat"
  | "Ubah"
  | "Ajukan"
  | "Kembalikan"
  | "Verifikasi"
  | "Tetapkan"
  | "Login"
  | "Reset Sandi"
  | "Ubah Peran"
  | "Penugasan"
  | string

export type JejakAuditItem = {
  id: string
  waktu: string
  tanggal: string
  pelaku: string
  peran: string
  unit: string
  aksi: JejakAuditAksi
  objek: string
  detail: string
  hasil: "Berhasil" | "Gagal"
  alasan?: string
  perubahan?: { field: string; sebelum: string; sesudah: string }[]
}

export type PeranTambahan =
  | "UPT Remunerasi"
  | "Verifikator"
  | "Penanggung Jawab Remunerasi Unit"
  | "Penanggung Jawab Unit"
  | "Bendahara Unit"
  | "Bidang Kepegawaian Unit"
  | "Kepegawaian Unit"

export type AkunUserItem = {
  id: string
  pegawaiId: string
  nama: string
  nip: string
  email: string
  peranDasar: "Pegawai"
  peranTambahan?: PeranTambahan
  unit?: string
  status: StatusEntitas
  terakhirMasuk: string
  pegawaiStatusAktif: StatusEntitas
  tanggalDibuat: string
}

export type PenugasanPejabat = {
  nama: string
  nip: string
  sejak: string
  nomorSk: string
}

export type PenugasanUnitDetail = {
  id: string
  unitKode: string
  unitNama: string
  bendahara: PenugasanPejabat | null
  kepegawaian: PenugasanPejabat | null
  penanggungJawab: PenugasanPejabat | null
  riwayat: {
    peran: string
    namaLama: string
    namaBaru: string
    tanggalMulai: string
    tanggalSelesai: string
    nomorSk: string
    catatan: string
  }[]
}

export type PersonilNonUnit = {
  id: string
  nama: string
  nip: string
  peran: "Verifikator"
  nomorSk: string
  sejak: string
  status: StatusEntitas
  lingkup: string
}

export type MatriksHakAksesRow = {
  modul: string
  pegawai: { lihat: boolean; ubah: boolean }
  kepegawaian: { lihat: boolean; ubah: boolean }
  bendahara: { lihat: boolean; ubah: boolean }
  penanggungJawab: { lihat: boolean; ubah: boolean }
  verifikator: { lihat: boolean; ubah: boolean }
  upt: { lihat: boolean; ubah: boolean }
  cakupanData: string
}

export type StatusAnggotaUPT = "aktif" | "peran_dicabut"

export type RiwayatPeranUPT = {
  aksi: "Beri Peran UPT" | "Cabut Peran UPT" | "Beri Peran Kembali"
  tanggal: string
  pelaku: string
  alasan: string
  nomorSk?: string
}

export type AnggotaUPTItem = {
  id: string
  akunId: string
  nama: string
  nip: string
  email: string
  unitAsal: string
  anggotaSejak: string
  status: StatusAnggotaUPT
  alasanCabut?: string
  riwayat: RiwayatPeranUPT[]
}

export type AnggotaUpt = {
  id: string | number
  nama: string
  nip: string
  email: string
  jabatan: string
  peran: string
  status: "Aktif" | "Nonaktif"
}

export type NotifikasiKategori = "pengajuan" | "usulan_jabatan" | "pengaduan" | "slip" | "parameter"

export type NotifikasiItem = {
  id: string
  judul: string
  deskripsi?: string
  pesan?: string
  waktu: string
  kategori?: NotifikasiKategori
  tipe?: "info" | "warning" | "success" | "error"
  jenis?: "info" | "sukses" | "peringatan" | "error"
  dibaca: boolean
  tautan?: string
  link?: string
}

export type JenisPerubahanJabatan =
  | "Promosi Jabatan Struktural"
  | "Kenaikan Jenjang Fungsional"
  | "Rotasi / Mutasi Internal"
  | "Penetapan Awal Pegawai Baru"

export type RiwayatJabatanResmiItem = {
  jabatan: string
  grade: number
  nilaiJabatan: number
  mulai: string
  selesai: string
  sk: string
  status: "Berlaku" | "Berakhir"
}

export type UsulanJabatanDetailItem = {
  id: string
  rawId?: number | string
  nip: string
  pegawai: string
  unit: string
  lama?: string
  baru?: string
  jabatanLama: string
  gradeLama: number
  nilaiJabatanLama: number
  remunerasiLama: number
  p1Lama: number
  jabatanBaru: string
  gradeBaru: number
  nilaiJabatanBaru: number
  remunerasiBaru: number
  p1Baru: number
  jenisPerubahan: JenisPerubahanJabatan
  tanggalSpmt: string
  mulai: string
  bulanEfektifP1: string
  periodeEfektifSudahDiproses: boolean
  status: UsulanJabatanStatus
  diajukanOleh: string
  tanggalPengajuan: string
  sk: string
  tanggalSK: string
  catatanVerifikator?: string
  catatan?: string
  pemeriksaanOtomatis: {
    batas15: boolean
    terdaftarMaster: boolean
    tidakTumpangTindih: boolean
  }
  riwayatJabatanResmi: RiwayatJabatanResmiItem[]
}

export type PegawaiHitungP1Item = {
  id: string
  nama: string
  nip: string
  grade: number
  jabatan: string
  statusKepegawaian: "PNS" | "CPNS" | "CPT-PTNBH"
  p1Gross: number
  pengaliStatus: number
  potonganKehadiran: number
  rincianKehadiran: { jenis: string; jumlah: string; persenPotongan: number; nominal: number }[]
  potonganHukdis: number
  rincianHukdis: string
  totalPotongan: number
  persenKetidakhadiran: number
  melebihiAmbang50: boolean
  p1SetelahPotongan: number
  tarifPajakPersen: number
  pajak: number
  netto: number
  flags: {
    ketidakhadiranLebih50: boolean
    hukumanDisiplinAktif: boolean
    jabatanBerubah: boolean
    tidakMemenuhiSyaratBayar: boolean
    dikoreksiBendahara: boolean
  }
  catatan: string
  riwayatKoreksiPajak: {
    waktu: string
    oleh: string
    nominalLama: number
    nominalBaru: number
    alasan: string
  }[]
}

export const matrixHakAksesDetail: MatriksHakAksesRow[] = [
  {
    modul: "Dashboard / Beranda Eksekutif",
    pegawai: { lihat: true, ubah: false },
    kepegawaian: { lihat: true, ubah: false },
    bendahara: { lihat: true, ubah: false },
    penanggungJawab: { lihat: true, ubah: false },
    verifikator: { lihat: true, ubah: false },
    upt: { lihat: true, ubah: false },
    cakupanData: "Pegawai/Unit: Unit Sendiri; Verif & UPT: Semua Unit",
  },
  {
    modul: "Penyusunan Perhitungan P1 Unit",
    pegawai: { lihat: false, ubah: false },
    kepegawaian: { lihat: true, ubah: false },
    bendahara: { lihat: true, ubah: true },
    penanggungJawab: { lihat: true, ubah: false },
    verifikator: { lihat: true, ubah: false },
    upt: { lihat: true, ubah: true },
    cakupanData: "Bendahara & PJ: Unit Sendiri; UPT: Semua Unit",
  },
  {
    modul: "Verifikasi Pengajuan Remunerasi",
    pegawai: { lihat: false, ubah: false },
    kepegawaian: { lihat: false, ubah: false },
    bendahara: { lihat: true, ubah: false },
    penanggungJawab: { lihat: true, ubah: false },
    verifikator: { lihat: true, ubah: true },
    upt: { lihat: true, ubah: true },
    cakupanData: "Verifikator & UPT: Semua Unit Universitas",
  },
  {
    modul: "Penetapan Pajak, P1 Netto & Amprah",
    pegawai: { lihat: false, ubah: false },
    kepegawaian: { lihat: false, ubah: false },
    bendahara: { lihat: true, ubah: false },
    penanggungJawab: { lihat: true, ubah: false },
    verifikator: { lihat: true, ubah: false },
    upt: { lihat: true, ubah: true },
    cakupanData: "UPT: Tulis/Koreksi Penuh; Bendahara: Unduh Amprah Unit",
  },
  {
    modul: "Penerbitan & Unduh Slip P1",
    pegawai: { lihat: true, ubah: false },
    kepegawaian: { lihat: false, ubah: false },
    bendahara: { lihat: true, ubah: false },
    penanggungJawab: { lihat: false, ubah: false },
    verifikator: { lihat: false, ubah: false },
    upt: { lihat: true, ubah: true },
    cakupanData: "Pegawai: Slip Pribadi; Bendahara: Unit; UPT: Terbitkan Massal",
  },
  {
    modul: "Usulan Perubahan Jabatan & Grade",
    pegawai: { lihat: true, ubah: false },
    kepegawaian: { lihat: true, ubah: true },
    bendahara: { lihat: false, ubah: false },
    penanggungJawab: { lihat: true, ubah: false },
    verifikator: { lihat: true, ubah: true },
    upt: { lihat: true, ubah: true },
    cakupanData: "Kepegawaian: Usulkan; Verifikator: Periksa; UPT: Tetapkan",
  },
  {
    modul: "Master Grade & Parameter Perhitungan",
    pegawai: { lihat: false, ubah: false },
    kepegawaian: { lihat: false, ubah: false },
    bendahara: { lihat: false, ubah: false },
    penanggungJawab: { lihat: false, ubah: false },
    verifikator: { lihat: false, ubah: false },
    upt: { lihat: true, ubah: true },
    cakupanData: "UPT Remunerasi Khusus (Tingkat Universitas)",
  },
  {
    modul: "Layanan Pengaduan Pegawai",
    pegawai: { lihat: true, ubah: true },
    kepegawaian: { lihat: true, ubah: true },
    bendahara: { lihat: true, ubah: true },
    penanggungJawab: { lihat: true, ubah: false },
    verifikator: { lihat: false, ubah: false },
    upt: { lihat: true, ubah: true },
    cakupanData: "Pegawai: Mandiri; Bendahara/Kepeg: Unit; UPT: Eskalasi Akhir",
  },
]

// tarifPajakMock removed - fetch from parameterService.getTarifPajak() API
// dokumenTemplate removed - fetch from appropriate API endpoint

export const dokumenConfigInitial: PenandatanganConfig = {
  kepalaUpt: {
    nama: "Dewi Anggraini, S.Kom., M.T.",
    nip: "198405122008122001",
    jabatan: "Kepala UPT Remunerasi",
    pangkatGolongan: "Pembina / IV.a",
    nomorSk: "SK/R/082/2025",
    berlakuMulai: "2025-01-01",
  },
  penanggungJawab: {
    nama: "Dr. Henny Rahmi, S.E., M.M.",
    nip: "197305141999032020",
    jabatan: "Wakil Rektor II (Bidang Keuangan & Umum)",
    pangkatGolongan: "Pembina Utama Madya / IV.d",
    nomorSk: "SK/R/012/2024",
    berlakuMulai: "2024-02-01",
  },
  formatNomorAmprah: "AMP/P1/{TAHUN}/{BULAN}/{UNIT}/{URUT}",
  formatNomorRekap: "REKAP/P1/{TAHUN}/{BULAN}/{URUT}",
  kotaTandaTangan: "Padang",
}


// penugasanUnitListInitial, personilNonUnitList, and anggotaUptInitial removed
// Fetch from appropriate API endpoints instead

// ========================================
// FALLBACK EXPORTS (for legacy/static imports until API migration completes)
// ========================================
export const auditUPT: AuditUPTItem[] = []
export const akunPenggunaInitial: AkunUserItem[] = []
export const daftarPegawai: any[] = []
export const unitKerja: any[] = []
export const dokumenTemplate: any[] = []
export const penugasanUnitListInitial: PenugasanUnitDetail[] = []
export const personilNonUnitList: PersonilNonUnit[] = []
export const anggotaUptInitial: AnggotaUPTItem[] = []
