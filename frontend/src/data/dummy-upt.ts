

export const FEATURES = {
  koreksiSusulan: false, // Fitur usulan koreksi susulan masih usulan
}

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
  | "Diteruskan"
  | "Selesai"

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

export const uptRemunerasi = {
  nama: "Dewi Anggraini, S.Kom., M.T.",
  inisial: "DA",
  peran: "UPT Remunerasi",
  nip: "198405122008122001",
  email: "dewi.anggraini@unand.ac.id",
  unit: "UPT Remunerasi",
  jabatan: "Pengelola Remunerasi Ahli Pertama",
}

export const periodeUPT = ["Oktober 2026", "September 2026", "Agustus 2026", "Juli 2026"]

export type TipeUnit =
  | "Fakultas"
  | "Pascasarjana"
  | "Bidang Rektorat"
  | "UPT"
  | "Lembaga"
  | "SPI"

export type UnitKerjaItem = {
  id: string
  kode: string
  nama: string
  tipe: TipeUnit
  induk: string
  pimpinan: string
  aktif: number
  bendahara: string
  status: StatusEntitas
}

export const unitKerjaInitial: UnitKerjaItem[] = [
  { id: "unit-1", kode: "FTI", nama: "Fakultas Teknologi Informasi", tipe: "Fakultas", induk: "-", pimpinan: "Dr. Rina Maharani, M.T.", aktif: 245, bendahara: "Siti Rahma, S.E.", status: "aktif" },
  { id: "unit-2", kode: "FT", nama: "Fakultas Teknik", tipe: "Fakultas", induk: "-", pimpinan: "Prof. Dr. Ir. Budi Santoso, M.Eng.", aktif: 198, bendahara: "Andi Pratama, S.E.", status: "aktif" },
  { id: "unit-3", kode: "FEB", nama: "Fakultas Ekonomi dan Bisnis", tipe: "Fakultas", induk: "-", pimpinan: "Dr. Maya Putri, S.E., M.Si.", aktif: 176, bendahara: "Rina Kurnia, S.Ak.", status: "aktif" },
  { id: "unit-4", kode: "FH", nama: "Fakultas Hukum", tipe: "Fakultas", induk: "-", pimpinan: "Dr. Ferdi, S.H., M.H.", aktif: 132, bendahara: "Hendra Wijaya, S.E.", status: "aktif" },
  { id: "unit-5", kode: "FK", nama: "Fakultas Kedokteran", tipe: "Fakultas", induk: "-", pimpinan: "Dr. dr. Afriwardi, Sp.KO.", aktif: 210, bendahara: "Nurdin Hasan, S.E.", status: "aktif" },
  { id: "unit-6", kode: "FMIPA", nama: "Fakultas MIPA", tipe: "Fakultas", induk: "-", pimpinan: "Prof. Dr. Syukri Arief, M.Eng.", aktif: 165, bendahara: "Dewi Lestari, S.Ak.", status: "aktif" },
  { id: "unit-7", kode: "PASCA", nama: "Pascasarjana", tipe: "Pascasarjana", induk: "-", pimpinan: "Prof. Dr. rer. soz. Nursyirwan Effendi", aktif: 84, bendahara: "Fitri Yanti, S.E.", status: "aktif" },
  { id: "unit-8", kode: "REK-1", nama: "Rektorat - Bidang I Akademik & Perencanaan", tipe: "Bidang Rektorat", induk: "Rektorat", pimpinan: "Prof. Dr. Syukri, M.Sc.", aktif: 115, bendahara: "Ahmad Rizky, S.Ak.", status: "aktif" },
  { id: "unit-9", kode: "REK-2", nama: "Rektorat - Bidang II Keuangan & Umum", tipe: "Bidang Rektorat", induk: "Rektorat", pimpinan: "Dr. Henny Rahmi, S.E., M.M.", aktif: 142, bendahara: "Taufik Hidayat, S.E.", status: "aktif" },
  { id: "unit-10", kode: "REK-3", nama: "Rektorat - Bidang III Kemahasiswaan & Alumni", tipe: "Bidang Rektorat", induk: "Rektorat", pimpinan: "Dr. Ir. Insannul Kamil, M.Eng., Ph.D.", aktif: 98, bendahara: "Mega Utami, S.E.", status: "aktif" },
  { id: "unit-11", kode: "REK-4", nama: "Rektorat - Bidang IV Kerjasama & Pengembangan", tipe: "Bidang Rektorat", induk: "Rektorat", pimpinan: "Dr. Hefrizal Handra, M.Soc.Sc.", aktif: 76, bendahara: "Dedi Supriadi, S.Ak.", status: "aktif" },
  { id: "unit-12", kode: "LPPM", nama: "Lembaga Penelitian & Pengabdian Masyarakat", tipe: "Lembaga", induk: "-", pimpinan: "Prof. Dr. Techn. Marzuki, M.Sc.", aktif: 110, bendahara: "Zulfikar, S.E.", status: "aktif" },
  { id: "unit-13", kode: "UPT-TIK", nama: "UPT Teknologi Informasi & Komunikasi", tipe: "UPT", induk: "-", pimpinan: "Feri Candra, S.T., M.T.", aktif: 45, bendahara: "Rina Marlina, A.Md.", status: "aktif" },
  { id: "unit-14", kode: "SPI", nama: "Satuan Pengawas Internal (SPI)", tipe: "SPI", induk: "-", pimpinan: "Dr. Suhairi, S.E., M.Si., Ak.", aktif: 24, bendahara: "Fajri Pratama, S.E.", status: "aktif" },
]

export const unitKerja = unitKerjaInitial

export const PIR_DEFAULT = 3000
export const PERSENTASE_P1_DEFAULT = 0.4

export type MasterGradeItem = {
  grade: number
  kode: string
  minPoin: number
  maxPoin: number
  meanPoin: number
  nilaiJabatan: number
  p1Gross: number
  berlakuSejak: string
  dasarHukum: string
  status: StatusEntitas
  riwayat: { versi: string; tanggal: string; nilai: number; dasarHukum: string; alasan: string }[]
}

export const masterGradeTable: MasterGradeItem[] = [
  { grade: 17, kode: "G-17", minPoin: 6264, maxPoin: 7517, meanPoin: 6890, nilaiJabatan: 6890 * PIR_DEFAULT, p1Gross: Math.round(6890 * PIR_DEFAULT * PERSENTASE_P1_DEFAULT), berlakuSejak: "01 Jan 2026", dasarHukum: "Peraturan Rektor No. 2/2026", status: "aktif", riwayat: [{ versi: "v1.0", tanggal: "01 Jan 2026", nilai: 6890, dasarHukum: "Peraturan Rektor No. 2/2026", alasan: "Penetapan master awal 2026" }] },
  { grade: 16, kode: "G-16", minPoin: 5219, maxPoin: 6263, meanPoin: 5741, nilaiJabatan: 5741 * PIR_DEFAULT, p1Gross: Math.round(5741 * PIR_DEFAULT * PERSENTASE_P1_DEFAULT), berlakuSejak: "01 Jan 2026", dasarHukum: "Peraturan Rektor No. 2/2026", status: "aktif", riwayat: [{ versi: "v1.0", tanggal: "01 Jan 2026", nilai: 5741, dasarHukum: "Peraturan Rektor No. 2/2026", alasan: "Penetapan master awal 2026" }] },
  { grade: 15, kode: "G-15", minPoin: 4348, maxPoin: 5218, meanPoin: 4783, nilaiJabatan: 4783 * PIR_DEFAULT, p1Gross: Math.round(4783 * PIR_DEFAULT * PERSENTASE_P1_DEFAULT), berlakuSejak: "01 Jan 2026", dasarHukum: "Peraturan Rektor No. 2/2026", status: "aktif", riwayat: [{ versi: "v1.0", tanggal: "01 Jan 2026", nilai: 4783, dasarHukum: "Peraturan Rektor No. 2/2026", alasan: "Penetapan master awal 2026" }] },
  { grade: 14, kode: "G-14", minPoin: 3623, maxPoin: 4347, meanPoin: 3985, nilaiJabatan: 3985 * PIR_DEFAULT, p1Gross: Math.round(3985 * PIR_DEFAULT * PERSENTASE_P1_DEFAULT), berlakuSejak: "01 Jan 2026", dasarHukum: "Peraturan Rektor No. 2/2026", status: "aktif", riwayat: [{ versi: "v1.0", tanggal: "01 Jan 2026", nilai: 3985, dasarHukum: "Peraturan Rektor No. 2/2026", alasan: "Penetapan master awal 2026" }] },
  { grade: 13, kode: "G-13", minPoin: 3018, maxPoin: 3622, meanPoin: 3320, nilaiJabatan: 3320 * PIR_DEFAULT, p1Gross: Math.round(3320 * PIR_DEFAULT * PERSENTASE_P1_DEFAULT), berlakuSejak: "01 Jan 2026", dasarHukum: "Peraturan Rektor No. 2/2026", status: "aktif", riwayat: [{ versi: "v1.0", tanggal: "01 Jan 2026", nilai: 3320, dasarHukum: "Peraturan Rektor No. 2/2026", alasan: "Penetapan master awal 2026" }] },
  { grade: 12, kode: "G-12", minPoin: 2514, maxPoin: 3017, meanPoin: 2765, nilaiJabatan: 2765 * PIR_DEFAULT, p1Gross: Math.round(2765 * PIR_DEFAULT * PERSENTASE_P1_DEFAULT), berlakuSejak: "01 Jan 2026", dasarHukum: "Peraturan Rektor No. 2/2026", status: "aktif", riwayat: [{ versi: "v1.0", tanggal: "01 Jan 2026", nilai: 2765, dasarHukum: "Peraturan Rektor No. 2/2026", alasan: "Penetapan master awal 2026" }] },
  { grade: 11, kode: "G-11", minPoin: 2095, maxPoin: 2513, meanPoin: 2304, nilaiJabatan: 2304 * PIR_DEFAULT, p1Gross: Math.round(2304 * PIR_DEFAULT * PERSENTASE_P1_DEFAULT), berlakuSejak: "01 Jan 2026", dasarHukum: "Peraturan Rektor No. 2/2026", status: "aktif", riwayat: [{ versi: "v1.0", tanggal: "01 Jan 2026", nilai: 2304, dasarHukum: "Peraturan Rektor No. 2/2026", alasan: "Penetapan master awal 2026" }] },
  { grade: 10, kode: "G-10", minPoin: 1744, maxPoin: 2094, meanPoin: 1919, nilaiJabatan: 1919 * PIR_DEFAULT, p1Gross: Math.round(1919 * PIR_DEFAULT * PERSENTASE_P1_DEFAULT), berlakuSejak: "01 Jan 2026", dasarHukum: "Peraturan Rektor No. 2/2026", status: "aktif", riwayat: [{ versi: "v1.0", tanggal: "01 Jan 2026", nilai: 1919, dasarHukum: "Peraturan Rektor No. 2/2026", alasan: "Penetapan master awal 2026" }] },
  { grade: 9, kode: "G-09", minPoin: 1453, maxPoin: 1743, meanPoin: 1453, nilaiJabatan: 1453 * PIR_DEFAULT, p1Gross: Math.round(1453 * PIR_DEFAULT * PERSENTASE_P1_DEFAULT), berlakuSejak: "01 Jan 2026", dasarHukum: "Peraturan Rektor No. 2/2026", status: "aktif", riwayat: [{ versi: "v1.0", tanggal: "01 Jan 2026", nilai: 1453, dasarHukum: "Peraturan Rektor No. 2/2026", alasan: "Penetapan master awal 2026" }] },
  { grade: 8, kode: "G-08", minPoin: 1312, maxPoin: 1452, meanPoin: 1382, nilaiJabatan: 1382 * PIR_DEFAULT, p1Gross: Math.round(1382 * PIR_DEFAULT * PERSENTASE_P1_DEFAULT), berlakuSejak: "01 Jan 2026", dasarHukum: "Peraturan Rektor No. 2/2026", status: "aktif", riwayat: [{ versi: "v1.0", tanggal: "01 Jan 2026", nilai: 1382, dasarHukum: "Peraturan Rektor No. 2/2026", alasan: "Penetapan master awal 2026" }] },
  { grade: 7, kode: "G-07", minPoin: 1190, maxPoin: 1311, meanPoin: 1250, nilaiJabatan: 1250 * PIR_DEFAULT, p1Gross: Math.round(1250 * PIR_DEFAULT * PERSENTASE_P1_DEFAULT), berlakuSejak: "01 Jan 2026", dasarHukum: "Peraturan Rektor No. 2/2026", status: "aktif", riwayat: [{ versi: "v1.0", tanggal: "01 Jan 2026", nilai: 1250, dasarHukum: "Peraturan Rektor No. 2/2026", alasan: "Penetapan master awal 2026" }] },
  { grade: 6, kode: "G-06", minPoin: 997, maxPoin: 1189, meanPoin: 1093, nilaiJabatan: 1093 * PIR_DEFAULT, p1Gross: Math.round(1093 * PIR_DEFAULT * PERSENTASE_P1_DEFAULT), berlakuSejak: "01 Jan 2026", dasarHukum: "Peraturan Rektor No. 2/2026", status: "aktif", riwayat: [{ versi: "v1.0", tanggal: "01 Jan 2026", nilai: 1093, dasarHukum: "Peraturan Rektor No. 2/2026", alasan: "Penetapan master awal 2026" }] },
  { grade: 5, kode: "G-05", minPoin: 903, maxPoin: 996, meanPoin: 950, nilaiJabatan: 950 * PIR_DEFAULT, p1Gross: Math.round(950 * PIR_DEFAULT * PERSENTASE_P1_DEFAULT), berlakuSejak: "01 Jan 2026", dasarHukum: "Peraturan Rektor No. 2/2026", status: "aktif", riwayat: [{ versi: "v1.0", tanggal: "01 Jan 2026", nilai: 950, dasarHukum: "Peraturan Rektor No. 2/2026", alasan: "Penetapan master awal 2026" }] },
  { grade: 4, kode: "G-04", minPoin: 856, maxPoin: 902, meanPoin: 879, nilaiJabatan: 879 * PIR_DEFAULT, p1Gross: Math.round(879 * PIR_DEFAULT * PERSENTASE_P1_DEFAULT), berlakuSejak: "01 Jan 2026", dasarHukum: "Peraturan Rektor No. 2/2026", status: "aktif", riwayat: [{ versi: "v1.0", tanggal: "01 Jan 2026", nilai: 879, dasarHukum: "Peraturan Rektor No. 2/2026", alasan: "Penetapan master awal 2026" }] },
  { grade: 3, kode: "G-03", minPoin: 810, maxPoin: 855, meanPoin: 832, nilaiJabatan: 832 * PIR_DEFAULT, p1Gross: Math.round(832 * PIR_DEFAULT * PERSENTASE_P1_DEFAULT), berlakuSejak: "01 Jan 2026", dasarHukum: "Peraturan Rektor No. 2/2026", status: "aktif", riwayat: [{ versi: "v1.0", tanggal: "01 Jan 2026", nilai: 832, dasarHukum: "Peraturan Rektor No. 2/2026", alasan: "Penetapan master awal 2026" }] },
  { grade: 2, kode: "G-02", minPoin: 498, maxPoin: 809, meanPoin: 653, nilaiJabatan: 653 * PIR_DEFAULT, p1Gross: Math.round(653 * PIR_DEFAULT * PERSENTASE_P1_DEFAULT), berlakuSejak: "01 Jan 2026", dasarHukum: "Peraturan Rektor No. 2/2026", status: "aktif", riwayat: [{ versi: "v1.0", tanggal: "01 Jan 2026", nilai: 653, dasarHukum: "Peraturan Rektor No. 2/2026", alasan: "Penetapan master awal 2026" }] },
  { grade: 1, kode: "G-01", minPoin: 432, maxPoin: 497, meanPoin: 464, nilaiJabatan: 464 * PIR_DEFAULT, p1Gross: Math.round(464 * PIR_DEFAULT * PERSENTASE_P1_DEFAULT), berlakuSejak: "01 Jan 2026", dasarHukum: "Peraturan Rektor No. 2/2026", status: "aktif", riwayat: [{ versi: "v1.0", tanggal: "01 Jan 2026", nilai: 464, dasarHukum: "Peraturan Rektor No. 2/2026", alasan: "Penetapan master awal 2026" }] },
]

export const masterGrade = masterGradeTable.map((item) => ({
  kode: item.kode,
  jabatan: `Grade ${item.grade}`,
  nilai: item.nilaiJabatan,
  p1: "40%",
}))

export type KategoriJabatan =
  | "Pejabat Pengelola Dosen"
  | "Pejabat Pengelola Tendik"
  | "Dosen Fungsional"
  | "Dokter"
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

export const masterJabatanList: JabatanMasterItem[] = [
  { id: "JAB-001", nama: "Rektor", kategori: "Pejabat Pengelola Dosen", grade: 17, nilaiJabatan: 6890 * 3000, p1Gross: Math.round(6890 * 3000 * 0.4), status: "aktif", digunakan: 1 },
  { id: "JAB-002", nama: "Wakil Rektor", kategori: "Pejabat Pengelola Dosen", grade: 16, nilaiJabatan: 5741 * 3000, p1Gross: Math.round(5741 * 3000 * 0.4), status: "aktif", digunakan: 4 },
  { id: "JAB-003", nama: "Dekan Fakultas", kategori: "Pejabat Pengelola Dosen", grade: 15, nilaiJabatan: 4783 * 3000, p1Gross: Math.round(4783 * 3000 * 0.4), status: "aktif", digunakan: 15 },
  { id: "JAB-004", nama: "Wakil Dekan / Direktur Pascasarjana", kategori: "Pejabat Pengelola Dosen", grade: 14, nilaiJabatan: 3985 * 3000, p1Gross: Math.round(3985 * 3000 * 0.4), status: "aktif", digunakan: 45 },
  { id: "JAB-005", nama: "Ketua Lembaga (LPPM / LP3M)", kategori: "Pejabat Pengelola Dosen", grade: 13, nilaiJabatan: 3320 * 3000, p1Gross: Math.round(3320 * 3000 * 0.4), status: "aktif", digunakan: 2 },
  { id: "JAB-006", nama: "Ketua Departemen / Program Studi", kategori: "Pejabat Pengelola Dosen", grade: 13, nilaiJabatan: 3320 * 3000, p1Gross: Math.round(3320 * 3000 * 0.4), status: "aktif", digunakan: 52 },
  { id: "JAB-007", nama: "Guru Besar (Profesor)", kategori: "Dosen Fungsional", grade: 12, nilaiJabatan: 2765 * 3000, p1Gross: Math.round(2765 * 3000 * 0.4), status: "aktif", digunakan: 180 },
  { id: "JAB-008", nama: "Lektor Kepala", kategori: "Dosen Fungsional", grade: 11, nilaiJabatan: 2304 * 3000, p1Gross: Math.round(2304 * 3000 * 0.4), status: "aktif", digunakan: 420 },
  { id: "JAB-009", nama: "Lektor", kategori: "Dosen Fungsional", grade: 10, nilaiJabatan: 1919 * 3000, p1Gross: Math.round(1919 * 3000 * 0.4), status: "aktif", digunakan: 560 },
  { id: "JAB-010", nama: "Asisten Ahli", kategori: "Dosen Fungsional", grade: 9, nilaiJabatan: 1453 * 3000, p1Gross: Math.round(1453 * 3000 * 0.4), status: "aktif", digunakan: 310 },
  { id: "JAB-011", nama: "Dokter Pendidik Klinis Utama", kategori: "Dokter", grade: 12, nilaiJabatan: 2765 * 3000, p1Gross: Math.round(2765 * 3000 * 0.4), status: "aktif", digunakan: 12 },
  { id: "JAB-012", nama: "Dokter Pendidik Klinis Madya", kategori: "Dokter", grade: 11, nilaiJabatan: 2304 * 3000, p1Gross: Math.round(2304 * 3000 * 0.4), status: "aktif", digunakan: 28 },
  { id: "JAB-013", nama: "Dokter Pendidik Klinis Muda", kategori: "Dokter", grade: 10, nilaiJabatan: 1919 * 3000, p1Gross: Math.round(1919 * 3000 * 0.4), status: "aktif", digunakan: 40 },
  { id: "JAB-014", nama: "Dokter Pendidik Klinis Pertama", kategori: "Dokter", grade: 9, nilaiJabatan: 1453 * 3000, p1Gross: Math.round(1453 * 3000 * 0.4), status: "aktif", digunakan: 18 },
  { id: "JAB-015", nama: "Kepala Biro", kategori: "Pejabat Pengelola Tendik", grade: 14, nilaiJabatan: 3985 * 3000, p1Gross: Math.round(3985 * 3000 * 0.4), status: "aktif", digunakan: 3 },
  { id: "JAB-016", nama: "Kepala Bagian / Koordinator", kategori: "Pejabat Pengelola Tendik", grade: 12, nilaiJabatan: 2765 * 3000, p1Gross: Math.round(2765 * 3000 * 0.4), status: "aktif", digunakan: 14 },
  { id: "JAB-017", nama: "Pranata Komputer Ahli Madya", kategori: "Tendik Fungsional", grade: 11, nilaiJabatan: 2304 * 3000, p1Gross: Math.round(2304 * 3000 * 0.4), status: "aktif", digunakan: 6 },
  { id: "JAB-018", nama: "Pranata Komputer Ahli Muda", kategori: "Tendik Fungsional", grade: 9, nilaiJabatan: 1453 * 3000, p1Gross: Math.round(1453 * 3000 * 0.4), status: "aktif", digunakan: 15 },
  { id: "JAB-019", nama: "Pranata Komputer Ahli Pertama", kategori: "Tendik Fungsional", grade: 8, nilaiJabatan: 1382 * 3000, p1Gross: Math.round(1382 * 3000 * 0.4), status: "aktif", digunakan: 22 },
  { id: "JAB-020", nama: "Arsiparis Ahli Pertama", kategori: "Tendik Fungsional", grade: 8, nilaiJabatan: 1382 * 3000, p1Gross: Math.round(1382 * 3000 * 0.4), status: "aktif", digunakan: 14 },
  { id: "JAB-021", nama: "Pranata Laboratorium Pendidikan Terampil", kategori: "Tendik Fungsional", grade: 6, nilaiJabatan: 1093 * 3000, p1Gross: Math.round(1093 * 3000 * 0.4), status: "aktif", digunakan: 42 },
  { id: "JAB-022", nama: "Pengadministrasi Umum Senior (Tk. 5)", kategori: "Tendik Pelaksana", grade: 5, nilaiJabatan: 950 * 3000, p1Gross: Math.round(950 * 3000 * 0.4), status: "aktif", digunakan: 110 },
  { id: "JAB-023", nama: "Pengadministrasi Muda (Tk. 4)", kategori: "Tendik Pelaksana", grade: 4, nilaiJabatan: 879 * 3000, p1Gross: Math.round(879 * 3000 * 0.4), status: "aktif", digunakan: 95 },
  { id: "JAB-024", nama: "Petugas Layanan Umum (Tk. 3)", kategori: "Tendik Pelaksana", grade: 3, nilaiJabatan: 832 * 3000, p1Gross: Math.round(832 * 3000 * 0.4), status: "aktif", digunakan: 80 },
  { id: "JAB-025", nama: "Pengemudi / Pramubakti (Tk. 2)", kategori: "Tendik Pelaksana", grade: 2, nilaiJabatan: 653 * 3000, p1Gross: Math.round(653 * 3000 * 0.4), status: "aktif", digunakan: 65 },
  { id: "JAB-026", nama: "Petugas Kebersihan / Keamanan (Tk. 1)", kategori: "Tendik Pelaksana", grade: 1, nilaiJabatan: 464 * 3000, p1Gross: Math.round(464 * 3000 * 0.4), status: "aktif", digunakan: 120 },
  { id: "JAB-027", nama: "Staf Khusus Ad-Hoc (Tidak Terpakai)", kategori: "Tendik Pelaksana", grade: 6, nilaiJabatan: 1093 * 3000, p1Gross: Math.round(1093 * 3000 * 0.4), status: "nonaktif", digunakan: 0 },
]

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
  riwayat: { versi: string; tanggal: string; nilai: string; dasarHukum: string; alasan: string }[]
}

export const parameterListInitial: ParameterItem[] = [
  {
    id: "PAR-01",
    kode: "PIR",
    kelompok: "Umum",
    nama: "Point Index Rate (PIR)",
    nilai: "3000",
    satuan: "Rupiah",
    berlakuMulai: "2026-01-01",
    status: "Berlaku",
    dasarHukum: "Peraturan Rektor No. 2/2026",
    keterangan: "Nilai nominal per satu poin jabatan dalam perhitungan remunerasi.",
    riwayat: [{ versi: "v1.0", tanggal: "2026-01-01", nilai: "3000", dasarHukum: "Peraturan Rektor No. 2/2026", alasan: "Penetapan tarif PIR tahun 2026" }],
  },
  {
    id: "PAR-02",
    kode: "P1_PERCENT",
    kelompok: "Umum",
    nama: "Persentase Remunerasi P1",
    nilai: "40",
    satuan: "%",
    berlakuMulai: "2026-01-01",
    status: "Berlaku",
    dasarHukum: "Peraturan Rektor No. 2/2026 Pasal 9",
    keterangan: "Porsi insentif kerja P1 dihitung sebesar 40% dari total remunerasi jabatan.",
    riwayat: [{ versi: "v1.0", tanggal: "2026-01-01", nilai: "40", dasarHukum: "Peraturan Rektor No. 2/2026", alasan: "SOP Pembagian P1 dan P2" }],
  },
  {
    id: "PAR-03",
    kode: "MULT_PNS",
    kelompok: "Status Kepegawaian & Pengali",
    nama: "Pegawai Negeri Sipil (PNS)",
    nilai: "100",
    satuan: "%",
    berlakuMulai: "2026-01-01",
    status: "Berlaku",
    dasarHukum: "Peraturan Rektor No. 2/2026",
    berhakP1: true,
    pengaliPersen: 100,
    keterangan: "PNS aktif berhak atas 100% P1.",
    riwayat: [{ versi: "v1.0", tanggal: "2026-01-01", nilai: "100", dasarHukum: "Peraturan Rektor No. 2/2026", alasan: "Standar PNS" }],
  },
  {
    id: "PAR-04",
    kode: "MULT_CPNS",
    kelompok: "Status Kepegawaian & Pengali",
    nama: "Calon Pegawai Negeri Sipil (CPNS)",
    nilai: "80",
    satuan: "%",
    berlakuMulai: "2026-01-01",
    status: "Berlaku",
    dasarHukum: "Peraturan Rektor No. 2/2026",
    berhakP1: true,
    pengaliPersen: 80,
    keterangan: "CPNS dibayarkan 80% dari total nominal P1 hak jabatannya.",
    riwayat: [{ versi: "v1.0", tanggal: "2026-01-01", nilai: "80", dasarHukum: "Peraturan Rektor No. 2/2026", alasan: "Standar CPNS 80%" }],
  },
  {
    id: "PAR-05",
    kode: "MULT_CPT_PTNBH",
    kelompok: "Status Kepegawaian & Pengali",
    nama: "Pegawai Tetap Non-PNS (CPT-PTNBH)",
    nilai: "80",
    satuan: "%",
    berlakuMulai: "2026-01-01",
    status: "Berlaku",
    dasarHukum: "Peraturan Rektor No. 2/2026",
    berhakP1: true,
    pengaliPersen: 80,
    keterangan: "Pegawai CPT-PTNBH dibayarkan 80% dari total P1.",
    riwayat: [{ versi: "v1.0", tanggal: "2026-01-01", nilai: "80", dasarHukum: "Peraturan Rektor No. 2/2026", alasan: "Standar CPT-PTNBH" }],
  },
  {
    id: "PAR-06",
    kode: "MULT_TUBEL",
    kelompok: "Status Kepegawaian & Pengali",
    nama: "Pegawai Tugas Belajar",
    nilai: "60",
    satuan: "%",
    berlakuMulai: "2026-01-01",
    status: "Berlaku",
    dasarHukum: "Peraturan Rektor No. 2/2026",
    berhakP1: true,
    pengaliPersen: 60,
    keterangan: "Dosen/Tendik Tugas Belajar menerima 60% P1 (maksimal 6 bulan pertama).",
    riwayat: [{ versi: "v1.0", tanggal: "2026-01-01", nilai: "60", dasarHukum: "Peraturan Rektor No. 2/2026", alasan: "Standar Tubel" }],
  },
  {
    id: "PAR-07",
    kode: "POT_CUTI_TAHUNAN",
    kelompok: "Ketidakhadiran",
    nama: "Cuti Tahunan",
    nilai: "0",
    satuan: "% / hari",
    berlakuMulai: "2026-01-01",
    status: "Berlaku",
    dasarHukum: "Peraturan Rektor No. 2/2026",
    dihitungAmbang: false,
    keterangan: "Tidak mengurangi P1 dan tidak dihitung ke ambang 50%.",
    riwayat: [{ versi: "v1.0", tanggal: "2026-01-01", nilai: "0", dasarHukum: "Peraturan Rektor No. 2/2026", alasan: "Hak tahunan pegawai" }],
  },
  {
    id: "PAR-08",
    kode: "POT_CUTI_SAKIT",
    kelompok: "Ketidakhadiran",
    nama: "Cuti Sakit",
    nilai: "1.0",
    satuan: "% / hari",
    berlakuMulai: "2026-01-01",
    status: "Berlaku",
    dasarHukum: "Peraturan Rektor No. 2/2026",
    dihitungAmbang: true,
    keterangan: "Potongan 1% per hari kerja sakit dengan surat keterangan dokter.",
    riwayat: [{ versi: "v1.0", tanggal: "2026-01-01", nilai: "1.0", dasarHukum: "Peraturan Rektor No. 2/2026", alasan: "Ketentuan presensi" }],
  },
  {
    id: "PAR-09",
    kode: "POT_CUTI_BERSALIN_1_2",
    kelompok: "Ketidakhadiran",
    nama: "Cuti Bersalin (Anak ke-1 dan ke-2)",
    nilai: "1.0",
    satuan: "% / hari",
    berlakuMulai: "2026-01-01",
    status: "Berlaku",
    dasarHukum: "Peraturan Rektor No. 2/2026",
    dihitungAmbang: true,
    keterangan: "Potongan 1% per hari kerja selama masa persalinan anak ke-1 dan 2.",
    riwayat: [{ versi: "v1.0", tanggal: "2026-01-01", nilai: "1.0", dasarHukum: "Peraturan Rektor No. 2/2026", alasan: "Ketentuan bersalin" }],
  },
  {
    id: "PAR-10",
    kode: "POT_CUTI_BERSALIN_3",
    kelompok: "Ketidakhadiran",
    nama: "Cuti Bersalin (Anak ke-3)",
    nilai: "2.0",
    satuan: "% / hari",
    berlakuMulai: "2026-01-01",
    status: "Berlaku",
    dasarHukum: "Peraturan Rektor No. 2/2026",
    dihitungAmbang: true,
    keterangan: "Potongan 2% per hari kerja untuk kelahiran anak ke-3.",
    riwayat: [{ versi: "v1.0", tanggal: "2026-01-01", nilai: "2.0", dasarHukum: "Peraturan Rektor No. 2/2026", alasan: "Ketentuan bersalin" }],
  },
  {
    id: "PAR-11",
    kode: "POT_CUTI_BERSALIN_4_DST",
    kelompok: "Ketidakhadiran",
    nama: "Cuti Bersalin (Anak ke-4 dst)",
    nilai: "3.0",
    satuan: "% / hari",
    berlakuMulai: "2026-01-01",
    status: "Berlaku",
    dasarHukum: "Peraturan Rektor No. 2/2026",
    dihitungAmbang: true,
    keterangan: "Potongan 3% per hari kerja untuk anak ke-4 dan seterusnya.",
    riwayat: [{ versi: "v1.0", tanggal: "2026-01-01", nilai: "3.0", dasarHukum: "Peraturan Rektor No. 2/2026", alasan: "Ketentuan bersalin" }],
  },
  {
    id: "PAR-12",
    kode: "POT_CUTI_ALASAN_PENTING",
    kelompok: "Ketidakhadiran",
    nama: "Cuti Alasan Penting",
    nilai: "3.0",
    satuan: "% / hari",
    berlakuMulai: "2026-01-01",
    status: "Berlaku",
    dasarHukum: "Peraturan Rektor No. 2/2026",
    dihitungAmbang: true,
    keterangan: "Potongan 3% per hari kerja.",
    riwayat: [{ versi: "v1.0", tanggal: "2026-01-01", nilai: "3.0", dasarHukum: "Peraturan Rektor No. 2/2026", alasan: "Ketentuan cuti penting" }],
  },
  {
    id: "PAR-13",
    kode: "POT_CUTI_BESAR",
    kelompok: "Ketidakhadiran",
    nama: "Cuti Besar",
    nilai: "1.5",
    satuan: "% / hari",
    berlakuMulai: "2026-01-01",
    status: "Berlaku",
    dasarHukum: "Peraturan Rektor No. 2/2026",
    dihitungAmbang: true,
    keterangan: "Potongan 1.5% per hari kerja selama masa cuti besar.",
    riwayat: [{ versi: "v1.0", tanggal: "2026-01-01", nilai: "1.5", dasarHukum: "Peraturan Rektor No. 2/2026", alasan: "Ketentuan cuti besar" }],
  },
  {
    id: "PAR-14",
    kode: "POT_ALPA",
    kelompok: "Ketidakhadiran",
    nama: "Tanpa Keterangan (Alpa)",
    nilai: "5.0",
    satuan: "% / hari",
    berlakuMulai: "2026-01-01",
    status: "Berlaku",
    dasarHukum: "Peraturan Rektor No. 2/2026",
    dihitungAmbang: true,
    keterangan: "Potongan 5% per hari alpa dan diperhitungkan dalam ambang 50%.",
    riwayat: [{ versi: "v1.0", tanggal: "2026-01-01", nilai: "5.0", dasarHukum: "Peraturan Rektor No. 2/2026", alasan: "Kedisiplinan kehadiran" }],
  },
  {
    id: "PAR-15",
    kode: "POT_DINAS_LUAR",
    kelompok: "Ketidakhadiran",
    nama: "Tugas Dinas Luar Kantor",
    nilai: "0",
    satuan: "% / hari",
    berlakuMulai: "2026-01-01",
    status: "Berlaku",
    dasarHukum: "Peraturan Rektor No. 2/2026",
    dihitungAmbang: false,
    keterangan: "Tugas dinas resmi dengan surat tugas tidak mengurangi P1 dan tidak dihitung ke ambang.",
    riwayat: [{ versi: "v1.0", tanggal: "2026-01-01", nilai: "0", dasarHukum: "Peraturan Rektor No. 2/2026", alasan: "Dinas kedinasan resmi" }],
  },
  {
    id: "PAR-16",
    kode: "TL_PSW_1",
    kelompok: "Keterlambatan & Pulang Cepat",
    nama: "Rentang 1: 0 - 60 Menit",
    nilai: "0.25",
    satuan: "% / hari",
    berlakuMulai: "2026-01-01",
    status: "Berlaku",
    dasarHukum: "Peraturan Rektor No. 2/2026 Tabel 2.2",
    catatanKhusus: "0% bila kekurangan jam kerja diganti pada hari yang sama.",
    keterangan: "Keterlambatan/pulang cepat 1 s.d. 60 menit.",
    riwayat: [{ versi: "v1.0", tanggal: "2026-01-01", nilai: "0.25", dasarHukum: "Peraturan Rektor No. 2/2026", alasan: "Tabel 2.2" }],
  },
  {
    id: "PAR-17",
    kode: "TL_PSW_2",
    kelompok: "Keterlambatan & Pulang Cepat",
    nama: "Rentang 2: 61 - 75 Menit",
    nilai: "0.50",
    satuan: "% / hari",
    berlakuMulai: "2026-01-01",
    status: "Berlaku",
    dasarHukum: "Peraturan Rektor No. 2/2026 Tabel 2.2",
    keterangan: "Keterlambatan/pulang cepat 61 s.d. 75 menit.",
    riwayat: [{ versi: "v1.0", tanggal: "2026-01-01", nilai: "0.50", dasarHukum: "Peraturan Rektor No. 2/2026", alasan: "Tabel 2.2" }],
  },
  {
    id: "PAR-18",
    kode: "TL_PSW_3",
    kelompok: "Keterlambatan & Pulang Cepat",
    nama: "Rentang 3: 76 - 90 Menit",
    nilai: "1.00",
    satuan: "% / hari",
    berlakuMulai: "2026-01-01",
    status: "Berlaku",
    dasarHukum: "Peraturan Rektor No. 2/2026 Tabel 2.2",
    keterangan: "Keterlambatan/pulang cepat 76 s.d. 90 menit.",
    riwayat: [{ versi: "v1.0", tanggal: "2026-01-01", nilai: "1.00", dasarHukum: "Peraturan Rektor No. 2/2026", alasan: "Tabel 2.2" }],
  },
  {
    id: "PAR-19",
    kode: "TL_PSW_4",
    kelompok: "Keterlambatan & Pulang Cepat",
    nama: "Rentang 4: 91 - 105 Menit",
    nilai: "1.50",
    satuan: "% / hari",
    berlakuMulai: "2026-01-01",
    status: "Berlaku",
    dasarHukum: "Peraturan Rektor No. 2/2026 Tabel 2.2",
    keterangan: "Keterlambatan/pulang cepat 91 s.d. 105 menit.",
    riwayat: [{ versi: "v1.0", tanggal: "2026-01-01", nilai: "1.50", dasarHukum: "Peraturan Rektor No. 2/2026", alasan: "Tabel 2.2" }],
  },
  {
    id: "PAR-20",
    kode: "TL_PSW_5",
    kelompok: "Keterlambatan & Pulang Cepat",
    nama: "Rentang 5: 106 - 120 Menit",
    nilai: "2.00",
    satuan: "% / hari",
    berlakuMulai: "2026-01-01",
    status: "Berlaku",
    dasarHukum: "Peraturan Rektor No. 2/2026 Tabel 2.2",
    keterangan: "Keterlambatan/pulang cepat 106 s.d. 120 menit.",
    riwayat: [{ versi: "v1.0", tanggal: "2026-01-01", nilai: "2.00", dasarHukum: "Peraturan Rektor No. 2/2026", alasan: "Tabel 2.2" }],
  },
  {
    id: "PAR-21",
    kode: "TL_PSW_6",
    kelompok: "Keterlambatan & Pulang Cepat",
    nama: "Rentang 6: 121 - 240 Menit",
    nilai: "2.50",
    satuan: "% / hari",
    berlakuMulai: "2026-01-01",
    status: "Berlaku",
    dasarHukum: "Peraturan Rektor No. 2/2026 Tabel 2.2",
    keterangan: "Keterlambatan/pulang cepat 121 s.d. 240 menit.",
    riwayat: [{ versi: "v1.0", tanggal: "2026-01-01", nilai: "2.50", dasarHukum: "Peraturan Rektor No. 2/2026", alasan: "Tabel 2.2" }],
  },
  {
    id: "PAR-22",
    kode: "DISIPLIN_RINGAN",
    kelompok: "Hukuman Disiplin",
    nama: "Teguran Lisan / Tertulis (Ringan)",
    nilai: "0",
    satuan: "% potongan",
    berlakuMulai: "2026-01-01",
    status: "Berlaku",
    dasarHukum: "Peraturan Rektor No. 2/2026",
    keterangan: "Hukuman disiplin tingkat ringan tidak memotong nominal P1.",
    riwayat: [{ versi: "v1.0", tanggal: "2026-01-01", nilai: "0", dasarHukum: "Peraturan Rektor No. 2/2026", alasan: "Kebijakan disiplin ringan" }],
  },
  {
    id: "PAR-23",
    kode: "DISIPLIN_SEDANG",
    kelompok: "Hukuman Disiplin",
    nama: "Penundaan Kenaikan / Penurunan Pangkat (Sedang)",
    nilai: "25",
    satuan: "% potongan",
    berlakuMulai: "2026-01-01",
    status: "Berlaku",
    dasarHukum: "Peraturan Rektor No. 2/2026",
    keterangan: "Pemotongan 25% P1 selama masa sanksi (6 / 9 / 12 bulan).",
    riwayat: [{ versi: "v1.0", tanggal: "2026-01-01", nilai: "25", dasarHukum: "Peraturan Rektor No. 2/2026", alasan: "Kebijakan disiplin sedang" }],
  },
  {
    id: "PAR-24",
    kode: "DISIPLIN_BERAT",
    kelompok: "Hukuman Disiplin",
    nama: "Pembebasan Jabatan / Pemberhentian (Berat)",
    nilai: "100",
    satuan: "% potongan",
    berlakuMulai: "2026-01-01",
    status: "Berlaku",
    dasarHukum: "Peraturan Rektor No. 2/2026",
    keterangan: "P1 sama sekali tidak dibayarkan (potongan 100%).",
    riwayat: [{ versi: "v1.0", tanggal: "2026-01-01", nilai: "100", dasarHukum: "Peraturan Rektor No. 2/2026", alasan: "Kebijakan disiplin berat" }],
  },
  {
    id: "PAR-25",
    kode: "AMBANG_KETIDAKHADIRAN",
    kelompok: "Ambang & Syarat Bayar",
    nama: "Ambang Batas Ketidakhadiran Maksimal",
    nilai: "50",
    satuan: "% hari kerja",
    berlakuMulai: "2026-01-01",
    status: "Berlaku",
    dasarHukum: "Peraturan Rektor No. 2/2026",
    keterangan: "Jika akumulasi ketidakhadiran > 50% hari kerja dalam 1 periode, P1 = Rp 0.",
    riwayat: [{ versi: "v1.0", tanggal: "2026-01-01", nilai: "50", dasarHukum: "Peraturan Rektor No. 2/2026", alasan: "Ambang batas P1 hangus" }],
  },
  {
    id: "PAR-26",
    kode: "BATAS_WAKTU_TUBEL",
    kelompok: "Ambang & Syarat Bayar",
    nama: "Batas Maksimal Bayar Tugas Belajar",
    nilai: "6",
    satuan: "Bulan",
    berlakuMulai: "2026-01-01",
    status: "Berlaku",
    dasarHukum: "Peraturan Rektor No. 2/2026",
    keterangan: "P1 status Tugas Belajar hanya dibayarkan untuk 6 bulan pertama studi.",
    riwayat: [{ versi: "v1.0", tanggal: "2026-01-01", nilai: "6", dasarHukum: "Peraturan Rektor No. 2/2026", alasan: "Kebijakan masa tubel" }],
  },
  {
    id: "PAR-27",
    kode: "CUTOFF_TANGGAL_JABATAN",
    kelompok: "Aturan Perubahan Jabatan",
    nama: "Batas Tanggal Perubahan Jabatan",
    nilai: "15",
    satuan: "Tanggal",
    berlakuMulai: "2026-01-01",
    status: "Berlaku",
    dasarHukum: "Buku Pedoman Remunerasi 2026",
    keterangan: "SK Rektor terbit s.d. tanggal 15 berlaku di periode berjalan. Setelah tanggal 15 berlaku di periode berikutnya.",
    riwayat: [{ versi: "v1.0", tanggal: "2026-01-01", nilai: "15", dasarHukum: "Pedoman 2026", alasan: "Cutoff tanggal 15" }],
  },
  {
    id: "PAR-28",
    kode: "PAJAK_METODE",
    kelompok: "Pajak",
    nama: "Metode Perhitungan Pajak Penghasilan (PPh)",
    nilai: "TER PP 58/2023",
    satuan: "Metode",
    berlakuMulai: "2026-01-01",
    status: "Berlaku",
    dasarHukum: "PP No. 58/2023 & PMK 168/2023",
    catatanKhusus: "Aturan pajak menunggu konfirmasi UPT",
    keterangan: "Penerapan Tarif Efektif Rata-Rata (TER) PPh 21 bulanan. Menunggu kepastian UPT.",
    riwayat: [{ versi: "v1.0", tanggal: "2026-01-01", nilai: "TER PP 58/2023", dasarHukum: "PMK 168", alasan: "Usulan skema TER nasional" }],
  },
  {
    id: "PAR-29",
    kode: "JADWAL_REKAP_ABSENSI",
    kelompok: "Jadwal Bulanan",
    nama: "Tahap 1: Rekap Absensi & Draf Usulan",
    nilai: "1 - 5",
    satuan: "Tanggal bulan berikutnya",
    berlakuMulai: "2026-01-01",
    status: "Berlaku",
    dasarHukum: "Buku Pedoman Tabel 5.1",
    keterangan: "Kepegawaian unit dan Bendahara merekap absensi dan menyusun pengajuan.",
    riwayat: [{ versi: "v1.0", tanggal: "2026-01-01", nilai: "1 - 5", dasarHukum: "Tabel 5.1", alasan: "SOP Bulanan" }],
  },
  {
    id: "PAR-30",
    kode: "JADWAL_SK_PENETAPAN",
    kelompok: "Jadwal Bulanan",
    nama: "Tahap 2: SK Penetapan P1 Rektor",
    nilai: "6 - 8",
    satuan: "Tanggal bulan berikutnya",
    berlakuMulai: "2026-01-01",
    status: "Berlaku",
    dasarHukum: "Buku Pedoman Tabel 5.1",
    keterangan: "Verifikasi pengajuan unit dan penerbitan SK penetapan nominal P1.",
    riwayat: [{ versi: "v1.0", tanggal: "2026-01-01", nilai: "6 - 8", dasarHukum: "Tabel 5.1", alasan: "SOP Bulanan" }],
  },
  {
    id: "PAR-31",
    kode: "JADWAL_PENCAIRAN",
    kelompok: "Jadwal Bulanan",
    nama: "Tahap 3: Penyusunan Amprah & Pencairan P1",
    nilai: "9 - 13",
    satuan: "Tanggal bulan berikutnya",
    berlakuMulai: "2026-01-01",
    status: "Berlaku",
    dasarHukum: "Buku Pedoman Tabel 5.1",
    keterangan: "UPT menetapkan netto dan amprah. Bendahara mencairkan melalui SAKU.",
    riwayat: [{ versi: "v1.0", tanggal: "2026-01-01", nilai: "9 - 13", dasarHukum: "Tabel 5.1", alasan: "SOP Bulanan" }],
  },
]

export const parameterRemunerasi = parameterListInitial

export const tarifPajakMock = [
  { kategori: "TER Kategori A (TK/0, TK/1, K/0)", brutoMin: 0, brutoMax: 5400000, tarif: "0%" },
  { kategori: "TER Kategori A (TK/0, TK/1, K/0)", brutoMin: 5400001, brutoMax: 5650000, tarif: "0.25%" },
  { kategori: "TER Kategori A (TK/0, TK/1, K/0)", brutoMin: 5650001, brutoMax: 5950000, tarif: "0.50%" },
  { kategori: "TER Kategori A (TK/0, TK/1, K/0)", brutoMin: 5950001, brutoMax: 6300000, tarif: "0.75%" },
  { kategori: "TER Kategori A (TK/0, TK/1, K/0)", brutoMin: 6300001, brutoMax: 6750000, tarif: "1.00%" },
  { kategori: "TER Kategori B (TK/2, TK/3, K/1, K/2)", brutoMin: 0, brutoMax: 6200000, tarif: "0%" },
  { kategori: "TER Kategori B (TK/2, TK/3, K/1, K/2)", brutoMin: 6200001, brutoMax: 6500000, tarif: "0.25%" },
  { kategori: "TER Kategori B (TK/2, TK/3, K/1, K/2)", brutoMin: 6500001, brutoMax: 6850000, tarif: "0.50%" },
  { kategori: "TER Kategori C (K/3)", brutoMin: 0, brutoMax: 6600000, tarif: "0%" },
  { kategori: "TER Kategori C (K/3)", brutoMin: 6600001, brutoMax: 6950000, tarif: "0.25%" },
]

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

export const daftarPeriodeData: PeriodeDetailItem[] = [
  {
    kode: "2026-10",
    nama: "Oktober 2026",
    tahun: 2026,
    bulan: 10,
    hariKalender: 31,
    hariKerja: 22,
    status: "terbuka",
    unitSelesai: 4,
    unitTotal: 12,
    tahapan: [
      { nama: "Tahap 1: Rekap Absensi & Pengajuan Unit", jadwalDefault: "1 - 5 Nov 2026", tanggalMulai: "2026-11-01", tanggalSelesai: "2026-11-05", status: "selesai", penanggungJawab: "Bendahara & Kepegawaian Unit" },
      { nama: "Tahap 2: Verifikasi & SK Penetapan Rektor", jadwalDefault: "6 - 8 Nov 2026", tanggalMulai: "2026-11-06", tanggalSelesai: "2026-11-08", status: "berjalan", penanggungJawab: "Verifikator & Rektorat" },
      { nama: "Tahap 3: Penetapan Netto, Amprah, & Pencairan", jadwalDefault: "9 - 13 Nov 2026", tanggalMulai: "2026-11-09", tanggalSelesai: "2026-11-13", status: "menunggu", penanggungJawab: "UPT Remunerasi & Bendahara (SAKU)" },
    ],
    unitStatusList: [
      { unit: "Fakultas Teknologi Informasi", statusPengajuan: "netto_ditetapkan", amprahTersedia: true, nominalNetto: 577930500 },
      { unit: "Fakultas Teknik", statusPengajuan: "terverifikasi", amprahTersedia: false, nominalNetto: 470300000 },
      { unit: "Fakultas Ekonomi dan Bisnis", statusPengajuan: "amprah_tersedia", amprahTersedia: true, nominalNetto: 398250000 },
      { unit: "Fakultas Hukum", statusPengajuan: "diajukan", amprahTersedia: false, nominalNetto: 326590000 },
      { unit: "Fakultas Kedokteran", statusPengajuan: "dikembalikan", amprahTersedia: false, nominalNetto: 511050000 },
      { unit: "Fakultas MIPA", statusPengajuan: "draft", amprahTersedia: false, nominalNetto: 387920000 },
      { unit: "Pascasarjana", statusPengajuan: "terverifikasi", amprahTersedia: false, nominalNetto: 203450000 },
      { unit: "Rektorat - Bidang I", statusPengajuan: "netto_ditetapkan", amprahTersedia: true, nominalNetto: 293140000 },
      { unit: "Rektorat - Bidang II", statusPengajuan: "amprah_tersedia", amprahTersedia: true, nominalNetto: 359480000 },
      { unit: "Rektorat - Bidang III", statusPengajuan: "diajukan", amprahTersedia: false, nominalNetto: 245790000 },
      { unit: "Rektorat - Bidang IV", statusPengajuan: "terverifikasi", amprahTersedia: false, nominalNetto: 187480000 },
      { unit: "LPPM", statusPengajuan: "netto_ditetapkan", amprahTersedia: true, nominalNetto: 269320000 },
    ],
  },
  {
    kode: "2026-09",
    nama: "September 2026",
    tahun: 2026,
    bulan: 9,
    hariKalender: 30,
    hariKerja: 21,
    status: "terkunci",
    unitSelesai: 12,
    unitTotal: 12,
    tahapan: [
      { nama: "Tahap 1: Rekap Absensi & Pengajuan Unit", jadwalDefault: "1 - 5 Okt 2026", tanggalMulai: "2026-10-01", tanggalSelesai: "2026-10-05", status: "selesai", penanggungJawab: "Bendahara & Kepegawaian Unit" },
      { nama: "Tahap 2: Verifikasi & SK Penetapan Rektor", jadwalDefault: "6 - 8 Okt 2026", tanggalMulai: "2026-10-06", tanggalSelesai: "2026-10-08", status: "selesai", penanggungJawab: "Verifikator & Rektorat" },
      { nama: "Tahap 3: Penetapan Netto, Amprah, & Pencairan", jadwalDefault: "9 - 13 Okt 2026", tanggalMulai: "2026-10-09", tanggalSelesai: "2026-10-13", status: "selesai", penanggungJawab: "UPT Remunerasi & Bendahara (SAKU)" },
    ],
    unitStatusList: [
      { unit: "Fakultas Teknologi Informasi", statusPengajuan: "amprah_tersedia", amprahTersedia: true, nominalNetto: 564220000 },
      { unit: "Fakultas Teknik", statusPengajuan: "amprah_tersedia", amprahTersedia: true, nominalNetto: 464700000 },
      { unit: "Fakultas Ekonomi dan Bisnis", statusPengajuan: "amprah_tersedia", amprahTersedia: true, nominalNetto: 394700000 },
    ],
  },
  {
    kode: "2026-08",
    nama: "Agustus 2026",
    tahun: 2026,
    bulan: 8,
    hariKalender: 31,
    hariKerja: 20,
    status: "terkunci",
    unitSelesai: 12,
    unitTotal: 12,
    tahapan: [
      { nama: "Tahap 1: Rekap Absensi & Pengajuan Unit", jadwalDefault: "1 - 5 Sep 2026", tanggalMulai: "2026-09-01", tanggalSelesai: "2026-09-05", status: "selesai", penanggungJawab: "Bendahara & Kepegawaian Unit" },
      { nama: "Tahap 2: Verifikasi & SK Penetapan Rektor", jadwalDefault: "6 - 8 Sep 2026", tanggalMulai: "2026-09-06", tanggalSelesai: "2026-09-08", status: "selesai", penanggungJawab: "Verifikator & Rektorat" },
      { nama: "Tahap 3: Penetapan Netto, Amprah, & Pencairan", jadwalDefault: "9 - 13 Sep 2026", tanggalMulai: "2026-09-09", tanggalSelesai: "2026-09-13", status: "selesai", penanggungJawab: "UPT Remunerasi & Bendahara (SAKU)" },
    ],
    unitStatusList: [],
  },
  {
    kode: "2026-11",
    nama: "November 2026",
    tahun: 2026,
    bulan: 11,
    hariKalender: 30,
    hariKerja: 21,
    status: "belum_dibuka",
    unitSelesai: 0,
    unitTotal: 12,
    tahapan: [
      { nama: "Tahap 1: Rekap Absensi & Pengajuan Unit", jadwalDefault: "1 - 5 Des 2026", tanggalMulai: "2026-12-01", tanggalSelesai: "2026-12-05", status: "menunggu", penanggungJawab: "Bendahara & Kepegawaian Unit" },
      { nama: "Tahap 2: Verifikasi & SK Penetapan Rektor", jadwalDefault: "6 - 8 Des 2026", tanggalMulai: "2026-12-06", tanggalSelesai: "2026-12-08", status: "menunggu", penanggungJawab: "Verifikator & Rektorat" },
      { nama: "Tahap 3: Penetapan Netto, Amprah, & Pencairan", jadwalDefault: "9 - 13 Des 2026", tanggalMulai: "2026-12-09", tanggalSelesai: "2026-12-13", status: "menunggu", penanggungJawab: "UPT Remunerasi & Bendahara (SAKU)" },
    ],
    unitStatusList: [],
  },
]

export const daftarPeriode = daftarPeriodeData.map((d) => ({
  kode: d.kode,
  nama: d.nama,
  hariKalender: d.hariKalender,
  hariKerja: d.hariKerja,
  tanggalMulai: `${d.kode}-01`,
  tanggalSelesai: `${d.kode}-${d.hariKalender}`,
  status: d.status,
  jadwalRekapAbsensi: d.tahapan[0]?.jadwalDefault || "-",
  jadwalSKPenetapan: d.tahapan[1]?.jadwalDefault || "-",
  jadwalPencairan: d.tahapan[2]?.jadwalDefault || "-",
  totalPengajuan: d.unitTotal,
  terverifikasi: d.unitSelesai,
  nettoDitetapkan: d.unitSelesai,
}))

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

export const dokumenTemplate = [
  { id: "DOC-01", nama: "Format Amprah Pembayaran P1 (Excel)", kode: "TPL-AMP-01", revisi: "v2.1", tanggal: "10 Jan 2026", tipe: "XLSX", ukuran: "142 KB" },
  { id: "DOC-02", nama: "Template SK Rektor Penetapan Remunerasi P1", kode: "TPL-SK-01", revisi: "v1.4", tanggal: "05 Feb 2026", tipe: "DOCX", ukuran: "88 KB" },
  { id: "DOC-03", nama: "Buku Pedoman Perhitungan Remunerasi P1 2026", kode: "PEDOMAN-P1", revisi: "v1.0", tanggal: "01 Jan 2026", tipe: "PDF", ukuran: "2.4 MB" },
  { id: "DOC-04", nama: "Peraturan Rektor No. 2 Tahun 2026", kode: "PERREK-02-2026", revisi: "v1.0", tanggal: "01 Jan 2026", tipe: "PDF", ukuran: "1.8 MB" },
]

export const daftarPegawai = [
  { id: "PEG-001", nip: "198405122008122001", nama: "Dewi Anggraini, S.Kom., M.T.", unit: "UPT Remunerasi", jabatan: "Pengelola Remunerasi Ahli Pertama", grade: 9, statusPegawai: "PNS", statusAktif: "aktif" as StatusEntitas, p1Gross: 1743600, pph: 87180, p1Netto: 1656420 },
  { id: "PEG-002", nip: "197803152003121002", nama: "Prof. Dr. Ir. Budi Santoso, M.Eng.", unit: "Fakultas Teknik", jabatan: "Guru Besar (Profesor)", grade: 12, statusPegawai: "PNS", statusAktif: "aktif" as StatusEntitas, p1Gross: 3318000, pph: 497700, p1Netto: 2820300 },
  { id: "PEG-003", nip: "198207182006042003", nama: "Dr. Rina Maharani, M.T.", unit: "Fakultas Teknologi Informasi", jabatan: "Lektor Kepala", grade: 11, statusPegawai: "PNS", statusAktif: "aktif" as StatusEntitas, p1Gross: 2764800, pph: 138240, p1Netto: 2626560 },
  { id: "PEG-004", nip: "198611252010121004", nama: "Dimas Saputra, S.T., M.Kom.", unit: "Fakultas Teknologi Informasi", jabatan: "Asisten Ahli", grade: 9, statusPegawai: "PNS", statusAktif: "aktif" as StatusEntitas, p1Gross: 1743600, pph: 87180, p1Netto: 1656420 },
  { id: "PEG-005", nip: "198904122014042005", nama: "Nadia Permata, S.T., M.Eng.", unit: "Fakultas Teknik", jabatan: "Lektor", grade: 10, statusPegawai: "PNS", statusAktif: "aktif" as StatusEntitas, p1Gross: 2302800, pph: 115140, p1Netto: 2187660 },
  { id: "PEG-006", nip: "199102142018031006", nama: "Fajar Nugraha, S.Kom.", unit: "Fakultas Teknologi Informasi", jabatan: "Pranata Komputer Ahli Pertama", grade: 8, statusPegawai: "CPT-PTNBH", statusAktif: "aktif" as StatusEntitas, p1Gross: 1326720, pph: 66336, p1Netto: 1260384 },
  { id: "PEG-007", nip: "199308192020122007", nama: "Siti Rahma, S.E.", unit: "Fakultas Teknologi Informasi", jabatan: "Bendahara Pengeluaran Pembantu", grade: 8, statusPegawai: "PNS", statusAktif: "aktif" as StatusEntitas, p1Gross: 1658400, pph: 82920, p1Netto: 1575480 },
  { id: "PEG-008", nip: "198509102008011008", nama: "Andi Pratama, S.E.", unit: "Fakultas Teknik", jabatan: "Pengelola Keuangan", grade: 8, statusPegawai: "PNS", statusAktif: "aktif" as StatusEntitas, p1Gross: 1658400, pph: 82920, p1Netto: 1575480 },
  { id: "PEG-009", nip: "197501011999031009", nama: "Dr. dr. Afriwardi, Sp.KO.", unit: "Fakultas Kedokteran", jabatan: "Dokter Pendidik Klinis Madya", grade: 11, statusPegawai: "PNS", statusAktif: "aktif" as StatusEntitas, p1Gross: 2764800, pph: 414720, p1Netto: 2350080 },
  { id: "PEG-010", nip: "198006202005012010", nama: "Dr. Maya Putri, S.E., M.Si.", unit: "Fakultas Ekonomi dan Bisnis", jabatan: "Lektor Kepala", grade: 11, statusPegawai: "PNS", statusAktif: "aktif" as StatusEntitas, p1Gross: 2764800, pph: 138240, p1Netto: 2626560 },
  { id: "PEG-011", nip: "198705052012122011", nama: "Rina Kurnia, S.Ak.", unit: "Fakultas Ekonomi dan Bisnis", jabatan: "Bendahara Pengeluaran Pembantu", grade: 8, statusPegawai: "PNS", statusAktif: "aktif" as StatusEntitas, p1Gross: 1658400, pph: 82920, p1Netto: 1575480 },
  { id: "PEG-012", nip: "197204101998021012", nama: "Dr. Ferdi, S.H., M.H.", unit: "Fakultas Hukum", jabatan: "Lektor Kepala", grade: 11, statusPegawai: "PNS", statusAktif: "aktif" as StatusEntitas, p1Gross: 2764800, pph: 138240, p1Netto: 2626560 },
  { id: "PEG-013", nip: "198809152015041013", nama: "Hendra Wijaya, S.E.", unit: "Fakultas Hukum", jabatan: "Arsiparis Ahli Pertama", grade: 8, statusPegawai: "PNS", statusAktif: "aktif" as StatusEntitas, p1Gross: 1658400, pph: 82920, p1Netto: 1575480 },
  { id: "PEG-014", nip: "197003081995031014", nama: "Prof. Dr. Syukri Arief, M.Eng.", unit: "Fakultas MIPA", jabatan: "Guru Besar (Profesor)", grade: 12, statusPegawai: "PNS", statusAktif: "aktif" as StatusEntitas, p1Gross: 3318000, pph: 497700, p1Netto: 2820300 },
  { id: "PEG-015", nip: "199011122019032015", nama: "Dewi Lestari, S.Ak.", unit: "Fakultas MIPA", jabatan: "Pengadministrasi Umum Senior (Tk. 5)", grade: 8, statusPegawai: "CPNS", statusAktif: "aktif" as StatusEntitas, p1Gross: 1326720, pph: 66336, p1Netto: 1260384 },
  { id: "PEG-016", nip: "196812241994031016", nama: "Prof. Dr. rer. soz. Nursyirwan Effendi", unit: "Pascasarjana", jabatan: "Guru Besar (Profesor)", grade: 12, statusPegawai: "PNS", statusAktif: "aktif" as StatusEntitas, p1Gross: 3318000, pph: 497700, p1Netto: 2820300 },
  { id: "PEG-017", nip: "198302192008122017", nama: "Fitri Yanti, S.E.", unit: "Pascasarjana", jabatan: "Arsiparis Ahli Pertama", grade: 8, statusPegawai: "PNS", statusAktif: "aktif" as StatusEntitas, p1Gross: 1658400, pph: 82920, p1Netto: 1575480 },
  { id: "PEG-018", nip: "197109151997021018", nama: "Prof. Dr. Syukri, M.Sc.", unit: "Rektorat - Bidang I Akademik & Perencanaan", jabatan: "Wakil Rektor", grade: 16, statusPegawai: "PNS", statusAktif: "aktif" as StatusEntitas, p1Gross: 6889200, pph: 1033380, p1Netto: 5855820 },
  { id: "PEG-019", nip: "198401032009121019", nama: "Ahmad Rizky, S.Ak.", unit: "Rektorat - Bidang I Akademik & Perencanaan", jabatan: "Pranata Komputer Ahli Pertama", grade: 8, statusPegawai: "PNS", statusAktif: "aktif" as StatusEntitas, p1Gross: 1658400, pph: 82920, p1Netto: 1575480 },
  { id: "PEG-020", nip: "197305141999032020", nama: "Dr. Henny Rahmi, S.E., M.M.", unit: "Rektorat - Bidang II Keuangan & Umum", jabatan: "Wakil Rektor", grade: 16, statusPegawai: "PNS", statusAktif: "aktif" as StatusEntitas, p1Gross: 6889200, pph: 1033380, p1Netto: 5855820 },
  { id: "PEG-021", nip: "198112102007011021", nama: "Taufik Hidayat, S.E.", unit: "Rektorat - Bidang II Keuangan & Umum", jabatan: "Kepala Bagian / Koordinator", grade: 12, statusPegawai: "PNS", statusAktif: "aktif" as StatusEntitas, p1Gross: 3318000, pph: 165900, p1Netto: 3152100 },
  { id: "PEG-022", nip: "196908081995121022", nama: "Dr. Ir. Insannul Kamil, M.Eng., Ph.D.", unit: "Rektorat - Bidang III Kemahasiswaan & Alumni", jabatan: "Wakil Rektor", grade: 16, statusPegawai: "PNS", statusAktif: "aktif" as StatusEntitas, p1Gross: 6889200, pph: 1033380, p1Netto: 5855820 },
  { id: "PEG-023", nip: "198907222015042023", nama: "Mega Utami, S.E.", unit: "Rektorat - Bidang III Kemahasiswaan & Alumni", jabatan: "Arsiparis Ahli Pertama", grade: 8, statusPegawai: "PNS", statusAktif: "aktif" as StatusEntitas, p1Gross: 1658400, pph: 82920, p1Netto: 1575480 },
  { id: "PEG-024", nip: "197402122000031024", nama: "Dr. Hefrizal Handra, M.Soc.Sc.", unit: "Rektorat - Bidang IV Kerjasama & Pengembangan", jabatan: "Wakil Rektor", grade: 16, statusPegawai: "PNS", statusAktif: "aktif" as StatusEntitas, p1Gross: 6889200, pph: 1033380, p1Netto: 5855820 },
  { id: "PEG-025", nip: "198703112010121025", nama: "Dedi Supriadi, S.Ak.", unit: "Rektorat - Bidang IV Kerjasama & Pengembangan", jabatan: "Pranata Komputer Ahli Muda", grade: 9, statusPegawai: "PNS", statusAktif: "aktif" as StatusEntitas, p1Gross: 1743600, pph: 87180, p1Netto: 1656420 },
  { id: "PEG-026", nip: "197110191997021026", nama: "Prof. Dr. Techn. Marzuki, M.Sc.", unit: "Lembaga Penelitian & Pengabdian Masyarakat", jabatan: "Ketua Lembaga (LPPM / LP3M)", grade: 13, statusPegawai: "PNS", statusAktif: "aktif" as StatusEntitas, p1Gross: 3984000, pph: 597600, p1Netto: 3386400 },
  { id: "PEG-027", nip: "198205162009021027", nama: "Zulfikar, S.E.", unit: "Lembaga Penelitian & Pengabdian Masyarakat", jabatan: "Arsiparis Ahli Pertama", grade: 8, statusPegawai: "PNS", statusAktif: "aktif" as StatusEntitas, p1Gross: 1658400, pph: 82920, p1Netto: 1575480 },
  { id: "PEG-028", nip: "199401202022031028", nama: "Rizky Ramadhan, S.Kom.", unit: "Fakultas Teknologi Informasi", jabatan: "Pranata Laboratorium Pendidikan Terampil", grade: 6, statusPegawai: "CPT-PTNBH", statusAktif: "aktif" as StatusEntitas, p1Gross: 1049280, pph: 52464, p1Netto: 996816 },
  { id: "PEG-029", nip: "199506142023012029", nama: "Annisa Rahmadani, S.Pd.", unit: "Fakultas Kedokteran", jabatan: "Pengadministrasi Umum Senior (Tk. 5)", grade: 5, statusPegawai: "CPNS", statusAktif: "aktif" as StatusEntitas, p1Gross: 912000, pph: 45600, p1Netto: 866400 },
  { id: "PEG-030", nip: "199203182019031030", nama: "Bambang Irawan, A.Md.", unit: "Fakultas Teknik", jabatan: "Pranata Laboratorium Pendidikan Terampil", grade: 6, statusPegawai: "PNS", statusAktif: "aktif" as StatusEntitas, p1Gross: 1311600, pph: 65580, p1Netto: 1246020 },
  { id: "PEG-031", nip: "198811052014022031", nama: "Ratna Sari Dewi, S.Sos.", unit: "Rektorat - Bidang II Keuangan & Umum", jabatan: "Arsiparis Ahli Pertama", grade: 8, statusPegawai: "PNS", statusAktif: "aktif" as StatusEntitas, p1Gross: 1658400, pph: 82920, p1Netto: 1575480 },
  { id: "PEG-032", nip: "199612012024041032", nama: "Farhan Maulana, S.T.", unit: "Fakultas Teknologi Informasi", jabatan: "Asisten Ahli", grade: 9, statusPegawai: "PNS", statusAktif: "aktif" as StatusEntitas, p1Gross: 1046160, pph: 52308, p1Netto: 993852 },
  { id: "PEG-033", nip: "197708232002121033", nama: "Dr. Ir. Mulyadi, M.S.", unit: "Fakultas Teknik", jabatan: "Lektor", grade: 10, statusPegawai: "PNS", statusAktif: "aktif" as StatusEntitas, p1Gross: 2302800, pph: 115140, p1Netto: 2187660 },
  { id: "PEG-034", nip: "198602142010012034", nama: "dr. Sri Wahyuni, Sp.A.", unit: "Fakultas Kedokteran", jabatan: "Dokter Pendidik Klinis Muda", grade: 10, statusPegawai: "PNS", statusAktif: "aktif" as StatusEntitas, p1Gross: 2302800, pph: 345420, p1Netto: 1957380 },
  { id: "PEG-035", nip: "199307072020121035", nama: "Ilham Habibie, S.E.", unit: "Fakultas Ekonomi dan Bisnis", jabatan: "Pengadministrasi Umum Senior (Tk. 5)", grade: 5, statusPegawai: "CPT-PTNBH", statusAktif: "aktif" as StatusEntitas, p1Gross: 912000, pph: 45600, p1Netto: 866400 },
  { id: "PEG-036", nip: "198104192006041036", nama: "Yulius Akbar, S.H., M.H.", unit: "Fakultas Hukum", jabatan: "Lektor", grade: 10, statusPegawai: "PNS", statusAktif: "aktif" as StatusEntitas, p1Gross: 2302800, pph: 115140, p1Netto: 2187660 },
  { id: "PEG-037", nip: "199009092018012037", nama: "Dr. Linda Wati, M.Si.", unit: "Fakultas MIPA", jabatan: "Lektor", grade: 10, statusPegawai: "PNS", statusAktif: "aktif" as StatusEntitas, p1Gross: 2302800, pph: 115140, p1Netto: 2187660 },
  { id: "PEG-038", nip: "197903212005011038", nama: "Nasrul Efendi, S.Sos.", unit: "Pascasarjana", jabatan: "Pengadministrasi Umum Senior (Tk. 5)", grade: 5, statusPegawai: "PNS", statusAktif: "aktif" as StatusEntitas, p1Gross: 1140000, pph: 57000, p1Netto: 1083000 },
  { id: "PEG-039", nip: "199705152024011039", nama: "Eko Prasetyo", unit: "Rektorat - Bidang II Keuangan & Umum", jabatan: "Petugas Kebersihan / Keamanan (Tk. 1)", grade: 1, statusPegawai: "CPT-PTNBH", statusAktif: "aktif" as StatusEntitas, p1Gross: 445440, pph: 0, p1Netto: 445440 },
  { id: "PEG-040", nip: "198512122010122040", nama: "Nurhasanah, A.Md.", unit: "Lembaga Penelitian & Pengabdian Masyarakat", jabatan: "Pengadministrasi Muda (Tk. 4)", grade: 4, statusPegawai: "PNS", statusAktif: "nonaktif" as StatusEntitas, p1Gross: 0, pph: 0, p1Netto: 0 },
]

export const pengajuanUPT: UPTPengajuan[] = [
  { id: "P1/FTI/10/2026", unit: "Fakultas Teknologi Informasi", periode: "Oktober 2026", bendahara: "Siti Rahma, S.E.", pegawai: 245, total: 612_450_000, netto: 577_930_500, status: "netto_ditetapkan", diajukanPada: "20 Okt 2026", diverifikasiOleh: "Verifikator Tim 1", ditetapkanOleh: "Dewi Anggraini" },
  { id: "P1/FT/10/2026", unit: "Fakultas Teknik", periode: "Oktober 2026", bendahara: "Andi Pratama, S.E.", pegawai: 198, total: 498_200_000, netto: 470_300_000, status: "terverifikasi", diajukanPada: "21 Okt 2026", diverifikasiOleh: "Verifikator Tim 1" },
  { id: "P1/FEB/10/2026", unit: "Fakultas Ekonomi dan Bisnis", periode: "Oktober 2026", bendahara: "Rina Kurnia, S.Ak.", pegawai: 176, total: 421_700_000, netto: 398_250_000, status: "amprah_tersedia", diajukanPada: "19 Okt 2026", diverifikasiOleh: "Verifikator Tim 2", ditetapkanOleh: "Dewi Anggraini" },
  { id: "P1/FH/10/2026", unit: "Fakultas Hukum", periode: "Oktober 2026", bendahara: "Hendra Wijaya, S.E.", pegawai: 132, total: 345_600_000, netto: 326_590_000, status: "diajukan", diajukanPada: "22 Okt 2026" },
  { id: "P1/FK/10/2026", unit: "Fakultas Kedokteran", periode: "Oktober 2026", bendahara: "Nurdin Hasan, S.E.", pegawai: 210, total: 540_800_000, netto: 511_050_000, status: "dikembalikan", catatan: "Terdapat ketidaksesuaian persentase absensi 4 dokter spesialis", diajukanPada: "18 Okt 2026", diverifikasiOleh: "Verifikator Tim 2" },
  { id: "P1/FMIPA/10/2026", unit: "Fakultas MIPA", periode: "Oktober 2026", bendahara: "Dewi Lestari, S.Ak.", pegawai: 165, total: 410_500_000, netto: 387_920_000, status: "draft" },
  { id: "P1/PASCA/10/2026", unit: "Pascasarjana", periode: "Oktober 2026", bendahara: "Fitri Yanti, S.E.", pegawai: 84, total: 215_300_000, netto: 203_450_000, status: "terverifikasi", diajukanPada: "21 Okt 2026", diverifikasiOleh: "Verifikator Tim 1" },
  { id: "P1/REK-1/10/2026", unit: "Rektorat - Bidang I Akademik & Perencanaan", periode: "Oktober 2026", bendahara: "Ahmad Rizky, S.Ak.", pegawai: 115, total: 310_200_000, netto: 293_140_000, status: "netto_ditetapkan", diajukanPada: "19 Okt 2026", diverifikasiOleh: "Verifikator Tim 1", ditetapkanOleh: "Dewi Anggraini" },
  { id: "P1/REK-2/10/2026", unit: "Rektorat - Bidang II Keuangan & Umum", periode: "Oktober 2026", bendahara: "Taufik Hidayat, S.E.", pegawai: 142, total: 380_400_000, netto: 359_480_000, status: "amprah_tersedia", diajukanPada: "18 Okt 2026", diverifikasiOleh: "Verifikator Tim 1", ditetapkanOleh: "Dewi Anggraini" },
  { id: "P1/REK-3/10/2026", unit: "Rektorat - Bidang III Kemahasiswaan & Alumni", periode: "Oktober 2026", bendahara: "Mega Utami, S.E.", pegawai: 98, total: 260_100_000, netto: 245_790_000, status: "diajukan", diajukanPada: "23 Okt 2026" },
  { id: "P1/REK-4/10/2026", unit: "Rektorat - Bidang IV Kerjasama & Pengembangan", periode: "Oktober 2026", bendahara: "Dedi Supriadi, S.Ak.", pegawai: 76, total: 198_400_000, netto: 187_480_000, status: "terverifikasi", diajukanPada: "22 Okt 2026", diverifikasiOleh: "Verifikator Tim 2" },
  { id: "P1/LPPM/10/2026", unit: "Lembaga Penelitian & Pengabdian Masyarakat", periode: "Oktober 2026", bendahara: "Zulfikar, S.E.", pegawai: 110, total: 285_000_000, netto: 269_320_000, status: "netto_ditetapkan", diajukanPada: "20 Okt 2026", diverifikasiOleh: "Verifikator Tim 2", ditetapkanOleh: "Dewi Anggraini" },
]

export const usulanJabatanUPT = [
  { id: "USL-014", nip: "198611252010121004", pegawai: "Dimas Saputra, S.T., M.Kom.", unit: "Fakultas Teknologi Informasi", lama: "Asisten Ahli / G9", baru: "Lektor / G10", mulai: "1 Nov 2026", status: "terverifikasi" as UsulanJabatanStatus, diajukanOleh: "Kepegawaian FTI", tanggalPengajuan: "12 Okt 2026", sk: "SK/R/142/2026", tanggalSK: "14 Okt 2026" },
  { id: "USL-012", nip: "198904122014042005", pegawai: "Nadia Permata, S.T., M.Eng.", unit: "Fakultas Teknik", lama: "Lektor / G10", baru: "Lektor Kepala / G11", mulai: "1 Okt 2026", status: "ditetapkan" as UsulanJabatanStatus, diajukanOleh: "Kepegawaian FT", tanggalPengajuan: "02 Okt 2026", sk: "SK/R/118/2026", tanggalSK: "08 Okt 2026" },
  { id: "USL-015", nip: "198811052014022031", pegawai: "Ratna Sari Dewi, S.Sos.", unit: "Rektorat - Bidang II Keuangan & Umum", lama: "Arsiparis Mahir / G6", baru: "Arsiparis Ahli Pertama / G8", mulai: "1 Nov 2026", status: "diajukan" as UsulanJabatanStatus, diajukanOleh: "Kepegawaian Rektorat", tanggalPengajuan: "20 Okt 2026", sk: "-", tanggalSK: "-" },
  { id: "USL-016", nip: "199011122019032015", pegawai: "Dewi Lestari, S.Ak.", unit: "Fakultas MIPA", lama: "Pranata Keuangan / G7", baru: "Bendahara Pengeluaran / G8", mulai: "1 Okt 2026", status: "dikembalikan" as UsulanJabatanStatus, diajukanOleh: "Kepegawaian FMIPA", tanggalPengajuan: "15 Okt 2026", catatan: "Dokumen sertifikasi bendahara belum dilampirkan" },
  { id: "USL-017", nip: "199401202022031028", pegawai: "Rizky Ramadhan, S.Kom.", unit: "Fakultas Teknologi Informasi", lama: "PLP Terampil / G5", baru: "PLP Mahir / G6", mulai: "1 Des 2026", status: "ditolak" as UsulanJabatanStatus, diajukanOleh: "Kepegawaian FTI", tanggalPengajuan: "05 Okt 2026", catatan: "Masa kerja dalam grade belum memenuhi syarat minimal 2 tahun" },
]

export const pengaduanUPT = [
  { id: "ADU-030", tiket: "TKT-202610-030", pegawai: "Dewi Anggraini, S.Kom., M.T.", nip: "198405122008122001", unit: "UPT Remunerasi", kategori: "Hasil perhitungan", judul: "Klarifikasi komponen potongan TL.2 periode Oktober 2026", status: "diteruskan" as PengaduanStatus, tanggal: "25 Okt 2026", keterangan: "Diajukan oleh akun pribadi Dewi Anggraini; wajib ditangani oleh admin UPT lain." },
  { id: "ADU-026", tiket: "TKT-202610-026", pegawai: "Dimas Saputra, S.T., M.Kom.", nip: "198611252010121004", unit: "Fakultas Teknologi Informasi", kategori: "Hasil perhitungan", judul: "Ketidaksesuaian potongan keterlambatan hari dinas", status: "diteruskan" as PengaduanStatus, tanggal: "22 Okt 2026", keterangan: "Pada tanggal 8 Oktober dinas luar SK Dekan namun dihitung potong terlambat 75 menit." },
  { id: "ADU-021", tiket: "TKT-202610-021", pegawai: "Nadia Permata, S.T., M.Eng.", nip: "198904122014042005", unit: "Fakultas Teknik", kategori: "Slip P1", judul: "Pangkat baru belum tercantum di slip", status: "selesai" as PengaduanStatus, tanggal: "18 Okt 2026", tanggapan: "Telah disesuaikan pada perhitungan Oktober 2026 sesuai SK Penetapan G11." },
  { id: "ADU-028", tiket: "TKT-202610-028", pegawai: "Fajar Nugraha, S.Kom.", nip: "199102142018031006", unit: "Fakultas Teknologi Informasi", kategori: "Pajak PPh", judul: "Tarif TER berbeda dengan status PTKP", status: "diajukan" as PengaduanStatus, tanggal: "24 Okt 2026", keterangan: "Status keluarga K/1 namun dikenakan TER tarif A (TK/0)." },
  { id: "ADU-029", tiket: "TKT-202610-029", pegawai: "Annisa Rahmadani, S.Pd.", nip: "199506142023012029", unit: "Fakultas Kedokteran", kategori: "Hasil perhitungan", judul: "Pengali CPNS tidak diterapkan di draf", status: "ditindaklanjuti" as PengaduanStatus, tanggal: "23 Okt 2026", keterangan: "Sedang dikonfirmasi ke Kepegawaian FK." },
]

export type JejakAuditAksi =
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

export const auditUPT: JejakAuditItem[] = [
  {
    id: "AUD-101",
    waktu: "24 Okt 2026, 14:15",
    tanggal: "2026-10-24",
    pelaku: "Dewi Anggraini",
    peran: "UPT Remunerasi",
    unit: "UPT Remunerasi",
    aksi: "Tetapkan",
    objek: "P1/FTI/10/2026",
    detail: "Menetapkan P1 Netto FTI Rp 577.930.500",
    hasil: "Berhasil",
    alasan: "Verifikasi dokumen dan perhitungan PPh 21 TER telah sesuai",
    perubahan: [
      { field: "Status Pengajuan", sebelum: "terverifikasi", sesudah: "netto_ditetapkan" },
      { field: "P1 Netto Total", sebelum: "Rp 0 (Belum Ditetapkan)", sesudah: "Rp 577.930.500" },
      { field: "Amprah Tersedia", sebelum: "false", sesudah: "true" },
    ],
  },
  {
    id: "AUD-102",
    waktu: "24 Okt 2026, 11:30",
    tanggal: "2026-10-24",
    pelaku: "Dewi Anggraini",
    peran: "UPT Remunerasi",
    unit: "UPT Remunerasi",
    aksi: "Ubah Peran",
    objek: "USR-004",
    detail: "Mengubah peran akun Dr. Rina Maharani menjadi Penanggung Jawab Remunerasi Unit",
    hasil: "Berhasil",
    alasan: "Penugasan ex-officio Wakil Dekan II FTI",
    perubahan: [
      { field: "Peran Tambahan", sebelum: "Pegawai (Dasar)", sesudah: "Penanggung Jawab Remunerasi Unit" },
      { field: "Unit Penugasan", sebelum: "-", sesudah: "Fakultas Teknologi Informasi" },
    ],
  },
  {
    id: "AUD-103",
    waktu: "23 Okt 2026, 16:45",
    tanggal: "2026-10-23",
    pelaku: "Ahmad Fauzi, S.E., M.M.",
    peran: "Verifikator",
    unit: "Universitas Andalas",
    aksi: "Verifikasi",
    objek: "P1/FT/10/2026",
    detail: "Verifikasi pengajuan P1 Fakultas Teknik periode Oktober 2026",
    hasil: "Berhasil",
    alasan: "Seluruh berkas absensi dan rekap pengali telah valid",
    perubahan: [
      { field: "Status Pengajuan", sebelum: "diajukan", sesudah: "terverifikasi" },
      { field: "Diverifikasi Oleh", sebelum: "-", sesudah: "Ahmad Fauzi (Tim 1)" },
    ],
  },
  {
    id: "AUD-104",
    waktu: "23 Okt 2026, 14:10",
    tanggal: "2026-10-23",
    pelaku: "Dewi Anggraini",
    peran: "UPT Remunerasi",
    unit: "UPT Remunerasi",
    aksi: "Kembalikan",
    objek: "P1/FK/10/2026",
    detail: "Pengembalian pengajuan Fakultas Kedokteran untuk perbaikan absensi klinis",
    hasil: "Berhasil",
    alasan: "Terdapat ketidaksesuaian persentase absensi 4 dokter spesialis",
    perubahan: [
      { field: "Status Pengajuan", sebelum: "diajukan", sesudah: "dikembalikan" },
      { field: "Catatan Revisi", sebelum: "-", sesudah: "Perbaiki absensi 4 dokter spesialis di RS Unand" },
    ],
  },
  {
    id: "AUD-105",
    waktu: "23 Okt 2026, 09:20",
    tanggal: "2026-10-23",
    pelaku: "Dewi Anggraini",
    peran: "UPT Remunerasi",
    unit: "UPT Remunerasi",
    aksi: "Ubah",
    objek: "PARAM-P1-PCT",
    detail: "Pembaruan parameter persentase P1",
    hasil: "Berhasil",
    alasan: "Penyesuaian SK Rektor No. 02/2026 Pasal 9",
    perubahan: [
      { field: "Nilai Parameter", sebelum: "35%", sesudah: "40%" },
      { field: "Dasar Hukum", sebelum: "SK/R/01/2025", sesudah: "SK/R/02/2026" },
    ],
  },
  {
    id: "AUD-106",
    waktu: "22 Okt 2026, 16:05",
    tanggal: "2026-10-22",
    pelaku: "Siti Rahma, S.E.",
    peran: "Bendahara Unit",
    unit: "Fakultas Teknologi Informasi",
    aksi: "Ajukan",
    objek: "P1/FTI/10/2026",
    detail: "Pengajuan perhitungan P1 periode Oktober 2026 sebanyak 245 pegawai",
    hasil: "Berhasil",
    alasan: "Draft telah disetujui PJ Unit",
    perubahan: [
      { field: "Status Pengajuan", sebelum: "draft", sesudah: "diajukan" },
      { field: "Diajukan Pada", sebelum: "-", sesudah: "22 Okt 2026, 16:05" },
    ],
  },
  {
    id: "AUD-107",
    waktu: "22 Okt 2026, 13:30",
    tanggal: "2026-10-22",
    pelaku: "Dewi Anggraini",
    peran: "UPT Remunerasi",
    unit: "UPT Remunerasi",
    aksi: "Penugasan",
    objek: "TGS-01",
    detail: "Penugasan Bendahara Pengeluaran Pembantu FTI kepada Siti Rahma, S.E.",
    hasil: "Berhasil",
    alasan: "Rotasi bendahara pengeluaran semester genap",
    perubahan: [
      { field: "Bendahara", sebelum: "Ahmad Dani, S.E.", sesudah: "Siti Rahma, S.E." },
      { field: "Nomor SK", sebelum: "SK/R/001/2024", sesudah: "SK/R/015/2025" },
    ],
  },
  {
    id: "AUD-108",
    waktu: "21 Okt 2026, 15:40",
    tanggal: "2026-10-21",
    pelaku: "Dewi Anggraini",
    peran: "UPT Remunerasi",
    unit: "UPT Remunerasi",
    aksi: "Reset Sandi",
    objek: "USR-003",
    detail: "Pengiriman tautan reset kata sandi untuk akun andi.pratama@unand.ac.id",
    hasil: "Berhasil",
    alasan: "Permintaan reset kata sandi akibat lupa kredensial",
    perubahan: [
      { field: "Token Reset", sebelum: "-", sesudah: "Terkirim ke email institusi" },
    ],
  },
  {
    id: "AUD-109",
    waktu: "21 Okt 2026, 10:15",
    tanggal: "2026-10-21",
    pelaku: "Fajar Nugraha, S.Kom.",
    peran: "Bidang Kepegawaian Unit",
    unit: "Fakultas Teknologi Informasi",
    aksi: "Buat",
    objek: "USL-014",
    detail: "Pembuatan usulan kenaikan jabatan Dimas Saputra ke Lektor G10",
    hasil: "Berhasil",
    alasan: "Penerbitan SK Jabatan Fungsional Kemendikbudristek",
    perubahan: [
      { field: "Jabatan Lama", sebelum: "-", sesudah: "Asisten Ahli / G9" },
      { field: "Jabatan Baru", sebelum: "-", sesudah: "Lektor / G10" },
    ],
  },
  {
    id: "AUD-110",
    waktu: "20 Okt 2026, 08:00",
    tanggal: "2026-10-20",
    pelaku: "Dewi Anggraini",
    peran: "UPT Remunerasi",
    unit: "UPT Remunerasi",
    aksi: "Login",
    objek: "Sesi Pengguna",
    detail: "Masuk ke portal SIREMUN-P1 melalui autentikasi SSO",
    hasil: "Berhasil",
    alasan: "Aktivitas login harian",
    perubahan: [
      { field: "IP Address", sebelum: "-", sesudah: "10.14.22.8" },
      { field: "User Agent", sebelum: "-", sesudah: "Mozilla/5.0 (Windows NT 10.0; Win64)" },
    ],
  },
]

export type PeranTambahan =
  | "Bendahara Unit"
  | "Bidang Kepegawaian Unit"
  | "Penanggung Jawab Remunerasi Unit"
  | "Verifikator"
  | "UPT Remunerasi"

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

export const akunPenggunaInitial: AkunUserItem[] = [
  {
    id: "USR-001",
    pegawaiId: "PEG-001",
    nama: "Dewi Anggraini, S.Kom., M.T.",
    nip: "198405122008122001",
    email: "dewi.anggraini@unand.ac.id",
    peranDasar: "Pegawai",
    peranTambahan: "UPT Remunerasi",
    unit: "UPT Remunerasi",
    status: "aktif",
    terakhirMasuk: "15 Nov 2026, 07.50",
    pegawaiStatusAktif: "aktif",
    tanggalDibuat: "2025-01-01",
  },
  {
    id: "USR-002",
    pegawaiId: "PEG-007",
    nama: "Siti Rahma, S.E.",
    nip: "199308192020122007",
    email: "siti.rahma@unand.ac.id",
    peranDasar: "Pegawai",
    peranTambahan: "Bendahara Unit",
    unit: "Fakultas Teknologi Informasi",
    status: "aktif",
    terakhirMasuk: "14 Nov 2026, 16.12",
    pegawaiStatusAktif: "aktif",
    tanggalDibuat: "2025-01-10",
  },
  {
    id: "USR-003",
    pegawaiId: "PEG-008",
    nama: "Andi Pratama, S.E.",
    nip: "198509102008011008",
    email: "andi.pratama@unand.ac.id",
    peranDasar: "Pegawai",
    peranTambahan: "Bendahara Unit",
    unit: "Fakultas Teknik",
    status: "aktif",
    terakhirMasuk: "14 Nov 2026, 14.30",
    pegawaiStatusAktif: "aktif",
    tanggalDibuat: "2025-01-10",
  },
  {
    id: "USR-004",
    pegawaiId: "PEG-003",
    nama: "Dr. Rina Maharani, M.T.",
    nip: "198207182006042003",
    email: "rina.maharani@unand.ac.id",
    peranDasar: "Pegawai",
    peranTambahan: "Penanggung Jawab Remunerasi Unit",
    unit: "Fakultas Teknologi Informasi",
    status: "aktif",
    terakhirMasuk: "13 Nov 2026, 11.45",
    pegawaiStatusAktif: "aktif",
    tanggalDibuat: "2025-01-15",
  },
  {
    id: "USR-005",
    pegawaiId: "PEG-002",
    nama: "Prof. Dr. Ir. Budi Santoso, M.Eng.",
    nip: "197803152003121002",
    email: "budi.santoso@unand.ac.id",
    peranDasar: "Pegawai",
    peranTambahan: "Penanggung Jawab Remunerasi Unit",
    unit: "Fakultas Teknik",
    status: "aktif",
    terakhirMasuk: "12 Nov 2026, 09.00",
    pegawaiStatusAktif: "aktif",
    tanggalDibuat: "2025-01-15",
  },
  {
    id: "USR-006",
    pegawaiId: "PEG-006",
    nama: "Fajar Nugraha, S.Kom.",
    nip: "199102142018031006",
    email: "fajar.nugraha@unand.ac.id",
    peranDasar: "Pegawai",
    peranTambahan: "Bidang Kepegawaian Unit",
    unit: "Fakultas Teknologi Informasi",
    status: "aktif",
    terakhirMasuk: "15 Nov 2026, 08.05",
    pegawaiStatusAktif: "aktif",
    tanggalDibuat: "2025-02-01",
  },
  {
    id: "USR-007",
    pegawaiId: "PEG-018",
    nama: "Ahmad Fauzi, S.E., M.M.",
    nip: "198304152009121005",
    email: "ahmad.fauzi@unand.ac.id",
    peranDasar: "Pegawai",
    peranTambahan: "Verifikator",
    unit: undefined, // Non-unit
    status: "aktif",
    terakhirMasuk: "15 Nov 2026, 08.10",
    pegawaiStatusAktif: "aktif",
    tanggalDibuat: "2025-01-05",
  },
  {
    id: "USR-008",
    pegawaiId: "PEG-040",
    nama: "Nurhasanah, A.Md.",
    nip: "198512122010122040",
    email: "nurhasanah@unand.ac.id",
    peranDasar: "Pegawai",
    unit: "Lembaga Penelitian & Pengabdian Masyarakat",
    status: "nonaktif",
    terakhirMasuk: "20 Agu 2026, 10.15",
    pegawaiStatusAktif: "nonaktif", // Peringatan: Pegawai sudah nonaktif
    tanggalDibuat: "2025-01-01",
  },
]

export const akunPengguna = akunPenggunaInitial

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

export const penugasanUnitListInitial: PenugasanUnitDetail[] = [
  {
    id: "TGS-01",
    unitKode: "FTI",
    unitNama: "Fakultas Teknologi Informasi",
    bendahara: { nama: "Siti Rahma, S.E.", nip: "199308192020122007", sejak: "01 Jan 2025", nomorSk: "SK/R/015/2025" },
    kepegawaian: { nama: "Fajar Nugraha, S.Kom.", nip: "199102142018031006", sejak: "01 Feb 2025", nomorSk: "SK/D-FTI/04/2025" },
    penanggungJawab: { nama: "Dr. Rina Maharani, M.T.", nip: "198207182006042003", sejak: "15 Jan 2025", nomorSk: "SK/R/008/2025" },
    riwayat: [
      { peran: "Bendahara Unit", namaLama: "Ahmad Dani, S.E.", namaBaru: "Siti Rahma, S.E.", tanggalMulai: "01 Jan 2025", tanggalSelesai: "31 Des 2024", nomorSk: "SK/R/015/2025", catatan: "Rotasi bendahara pengeluaran" },
    ],
  },
  {
    id: "TGS-02",
    unitKode: "FT",
    unitNama: "Fakultas Teknik",
    bendahara: { nama: "Andi Pratama, S.E.", nip: "198509102008011008", sejak: "01 Jan 2025", nomorSk: "SK/R/016/2025" },
    kepegawaian: { nama: "Bambang Irawan, A.Md.", nip: "199203182019031030", sejak: "01 Jan 2025", nomorSk: "SK/D-FT/02/2025" },
    penanggungJawab: { nama: "Prof. Dr. Ir. Budi Santoso, M.Eng.", nip: "197803152003121002", sejak: "01 Jan 2025", nomorSk: "SK/R/009/2025" },
    riwayat: [],
  },
  {
    id: "TGS-03",
    unitKode: "FEB",
    unitNama: "Fakultas Ekonomi dan Bisnis",
    bendahara: { nama: "Rina Kurnia, S.Ak.", nip: "198705052012122011", sejak: "01 Jan 2025", nomorSk: "SK/R/017/2025" },
    kepegawaian: null, // Kosong -> "Belum ada"
    penanggungJawab: { nama: "Dr. Maya Putri, S.E., M.Si.", nip: "198006202005012010", sejak: "01 Jan 2025", nomorSk: "SK/R/010/2025" },
    riwayat: [],
  },
  {
    id: "TGS-04",
    unitKode: "FH",
    unitNama: "Fakultas Hukum",
    bendahara: { nama: "Hendra Wijaya, S.E.", nip: "198809152015041013", sejak: "01 Jan 2025", nomorSk: "SK/R/018/2025" },
    kepegawaian: null,
    penanggungJawab: { nama: "Dr. Ferdi, S.H., M.H.", nip: "197204101998021012", sejak: "01 Jan 2025", nomorSk: "SK/R/011/2025" },
    riwayat: [],
  },
  {
    id: "TGS-05",
    unitKode: "FK",
    unitNama: "Fakultas Kedokteran",
    bendahara: { nama: "Nurdin Hasan, S.E.", nip: "198501012008121014", sejak: "01 Jan 2025", nomorSk: "SK/R/019/2025" },
    kepegawaian: { nama: "Annisa Rahmadani, S.Pd.", nip: "199506142023012029", sejak: "01 Jan 2025", nomorSk: "SK/D-FK/05/2025" },
    penanggungJawab: { nama: "Dr. dr. Afriwardi, Sp.KO.", nip: "197501011999031009", sejak: "01 Jan 2025", nomorSk: "SK/R/012/2025" },
    riwayat: [],
  },
  {
    id: "TGS-06",
    unitKode: "FMIPA",
    unitNama: "Fakultas MIPA",
    bendahara: { nama: "Dewi Lestari, S.Ak.", nip: "199011122019032015", sejak: "01 Jan 2025", nomorSk: "SK/R/020/2025" },
    kepegawaian: null,
    penanggungJawab: { nama: "Prof. Dr. Syukri Arief, M.Eng.", nip: "197003081995031014", sejak: "01 Jan 2025", nomorSk: "SK/R/013/2025" },
    riwayat: [],
  },
]

export const penugasanUnit = penugasanUnitListInitial.map((t) => ({
  id: t.id,
  unit: t.unitNama,
  pjUnit: t.penanggungJawab?.nama ?? "Belum ada",
  bendahara: t.bendahara?.nama ?? "Belum ada",
  verifikator: "Verifikator Tim 1",
  pegawaiTotal: 150,
  status: "aktif" as StatusEntitas,
}))

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

export const personilNonUnitList: PersonilNonUnit[] = [
  { id: "V-01", nama: "Ahmad Fauzi, S.E., M.M.", nip: "198304152009121005", peran: "Verifikator", nomorSk: "SK/R/002/2025", sejak: "01 Jan 2025", status: "aktif", lingkup: "Tim 1: FTI, FT, FEB" },
  { id: "V-02", nama: "Sri Handayani, S.E., Ak.", nip: "198607212010122003", peran: "Verifikator", nomorSk: "SK/R/002/2025", sejak: "01 Jan 2025", status: "aktif", lingkup: "Tim 2: FH, FK, FMIPA" },
]

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
  {
    modul: "Kelola Anggota UPT Remunerasi",
    pegawai: { lihat: false, ubah: false },
    kepegawaian: { lihat: false, ubah: false },
    bendahara: { lihat: false, ubah: false },
    penanggungJawab: { lihat: false, ubah: false },
    verifikator: { lihat: false, ubah: false },
    upt: { lihat: true, ubah: true },
    cakupanData: "UPT Remunerasi Setara (Beri & Cabut Peran Admin UPT)",
  },
]

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

export const anggotaUptInitial: AnggotaUPTItem[] = [
  {
    id: "upt-1",
    akunId: "AKN-001",
    nama: "Dewi Anggraini, S.Kom., M.T.",
    nip: "198405122008122001",
    email: "dewi.anggraini@unand.ac.id",
    unitAsal: "UPT Remunerasi",
    anggotaSejak: "02 Jan 2024",
    status: "aktif",
    riwayat: [
      {
        aksi: "Beri Peran UPT",
        tanggal: "02 Jan 2024",
        pelaku: "Drs. Ahmad Zaki",
        alasan: "Penempatan tim pengelola remunerasi pusat.",
        nomorSk: "SK/REK/2024/0012",
      },
    ],
  },
  {
    id: "upt-2",
    akunId: "AKN-011",
    nama: "Dr. Hendra Kusuma, M.Kom.",
    nip: "198207182008121002",
    email: "hendra.kusuma@unand.ac.id",
    unitAsal: "UPT Remunerasi",
    anggotaSejak: "10 Mar 2024",
    status: "aktif",
    riwayat: [
      {
        aksi: "Beri Peran UPT",
        tanggal: "10 Mar 2024",
        pelaku: "Dewi Anggraini",
        alasan: "Penambahan admin verifikasi pajak dan amprah.",
        nomorSk: "SK/REK/2024/0145",
      },
    ],
  },
  {
    id: "upt-3",
    akunId: "AKN-012",
    nama: "Nisa Putri, S.E., M.Si.",
    nip: "198711032012122004",
    email: "nisa.putri@unand.ac.id",
    unitAsal: "UPT Remunerasi",
    anggotaSejak: "05 Feb 2025",
    status: "aktif",
    riwayat: [
      {
        aksi: "Beri Peran UPT",
        tanggal: "05 Feb 2025",
        pelaku: "Dewi Anggraini",
        alasan: "Penguatan tim rekonsiliasi dan pelaporan.",
        nomorSk: "SK/REK/2025/0038",
      },
    ],
  },
  {
    id: "upt-4",
    akunId: "AKN-013",
    nama: "Rizal Efendi, S.Sos., M.M.",
    nip: "198103152006041003",
    email: "rizal.efendi@unand.ac.id",
    unitAsal: "Fakultas Hukum",
    anggotaSejak: "15 Jan 2023",
    status: "peran_dicabut",
    alasanCabut: "Pindah tugas/rotasi ke bagian akademik Fakultas Hukum.",
    riwayat: [
      {
        aksi: "Cabut Peran UPT",
        tanggal: "10 Nov 2026",
        pelaku: "Dewi Anggraini",
        alasan: "Pindah tugas/rotasi ke subbagian akademik Fakultas Hukum.",
        nomorSk: "ST/REK/2026/0891",
      },
      {
        aksi: "Beri Peran UPT",
        tanggal: "15 Jan 2023",
        pelaku: "Drs. Ahmad Zaki",
        alasan: "Penugasan awal admin UPT Remunerasi.",
        nomorSk: "SK/REK/2023/0019",
      },
    ],
  },
  {
    id: "upt-5",
    akunId: "AKN-014",
    nama: "Siti Aminah, S.Ak.",
    nip: "199208212019032007",
    email: "siti.aminah@unand.ac.id",
    unitAsal: "UPT Remunerasi",
    anggotaSejak: "01 Jul 2024",
    status: "peran_dicabut",
    alasanCabut: "Selesai masa penugasan tim ad-hoc remunerasi 2026.",
    riwayat: [
      {
        aksi: "Cabut Peran UPT",
        tanggal: "05 Nov 2026",
        pelaku: "Dr. Hendra Kusuma, M.Kom.",
        alasan: "Selesai masa penugasan tim ad-hoc; kembali ke peran Pegawai.",
        nomorSk: "ST/REK/2026/0850",
      },
      {
        aksi: "Beri Peran UPT",
        tanggal: "01 Jul 2024",
        pelaku: "Dewi Anggraini",
        alasan: "Penugasan operator administrasi P1.",
        nomorSk: "SK/REK/2024/0310",
      },
    ],
  },
]

export const matrixHakAkses = matrixHakAksesDetail.map((m) => ({
  modul: m.modul,
  kepegawaian: m.kepegawaian.ubah ? "Tulis" : m.kepegawaian.lihat ? "Baca" : "-",
  bendahara: m.bendahara.ubah ? "Tulis" : m.bendahara.lihat ? "Baca" : "-",
  verifikator: m.verifikator.ubah ? "Tulis" : m.verifikator.lihat ? "Baca" : "-",
  upt: m.upt.ubah ? "Tulis (Penuh)" : "Baca",
  pjUnit: m.penanggungJawab.lihat ? "Baca" : "-",
}))

export type NotifikasiKategori = "pengajuan" | "usulan_jabatan" | "pengaduan" | "slip" | "parameter"

export type NotifikasiItem = {
  id: string
  judul: string
  deskripsi: string
  waktu: string
  kategori: NotifikasiKategori
  jenis: "info" | "sukses" | "peringatan" | "error"
  dibaca: boolean
  tautan: string
}

export const notifikasiSistem: NotifikasiItem[] = [
  {
    id: "NOTIF-01",
    judul: "Pengajuan Terverifikasi Masuk",
    deskripsi: "Pengajuan perhitungan P1 Fakultas Teknik (P1/FT/10/2026) telah diverifikasi oleh Verifikator. Siap untuk penetapan P1 Netto.",
    waktu: "15 menit yang lalu",
    kategori: "pengajuan",
    jenis: "sukses",
    dibaca: false,
    tautan: "/upt-remunerasi/hitung",
  },
  {
    id: "NOTIF-02",
    judul: "Usulan Jabatan Terverifikasi",
    deskripsi: "Verifikator menyetujui usulan kenaikan grade Nadia Permata (FT) dari G10 ke G11. Menunggu penetapan SK UPT.",
    waktu: "1 jam yang lalu",
    kategori: "usulan_jabatan",
    jenis: "info",
    dibaca: false,
    tautan: "/upt-remunerasi/penetapan",
  },
  {
    id: "NOTIF-03",
    judul: "Pengaduan Diteruskan ke UPT",
    deskripsi: "Tiket pengaduan ADU-026 terkait ketidaksesuaian potongan keterlambatan hari dinas telah dieskalasikan ke UPT Remunerasi.",
    waktu: "3 jam yang lalu",
    kategori: "pengaduan",
    jenis: "peringatan",
    dibaca: false,
    tautan: "/upt-remunerasi/pengaduan",
  },
  {
    id: "NOTIF-04",
    judul: "Slip P1 Gagal Terbit",
    deskripsi: "2 pegawai Fakultas MIPA mengalami kendala penerbitan slip otomatis karena nomor NPWP tidak valid pada sinkronisasi DJP.",
    waktu: "5 jam yang lalu",
    kategori: "slip",
    jenis: "error",
    dibaca: false,
    tautan: "/upt-remunerasi/slip",
  },
  {
    id: "NOTIF-05",
    judul: "Jadwal Tahap 2 Akan Berakhir",
    deskripsi: "Batas waktu verifikasi & penerbitan SK Penetapan periode Oktober 2026 akan berakhir dalam 2 hari kalender (08 Nov 2026).",
    waktu: "1 hari yang lalu",
    kategori: "parameter",
    jenis: "peringatan",
    dibaca: true,
    tautan: "/upt-remunerasi/periode",
  },
  {
    id: "NOTIF-06",
    judul: "Pengajuan P1 Baru Diajukan",
    deskripsi: "Fakultas Hukum telah mengirimkan draf pengajuan P1 periode Oktober 2026 untuk diperiksa tim verifikator.",
    waktu: "2 hari yang lalu",
    kategori: "pengajuan",
    jenis: "info",
    dibaca: true,
    tautan: "/upt-remunerasi/status",
  },
]

export const rupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value)

export type JenisPerubahanJabatan =
  | "penempatan awal"
  | "promosi"
  | "mutasi"
  | "perubahan jabatan fungsional"
  | "perubahan grade"
  | "pengangkatan pejabat pengelola"

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
  nip: string
  pegawai: string
  unit: string
  lama: string
  baru: string
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

export const usulanJabatanDetailList: UsulanJabatanDetailItem[] = [
  {
    id: "USL-014",
    nip: "198611252010121004",
    pegawai: "Dimas Saputra, S.T., M.Kom.",
    unit: "Fakultas Teknologi Informasi",
    lama: "Asisten Ahli / G9",
    baru: "Lektor / G10",
    jabatanLama: "Asisten Ahli",
    gradeLama: 9,
    nilaiJabatanLama: 1453,
    remunerasiLama: 4359000,
    p1Lama: 1743600,
    jabatanBaru: "Lektor",
    gradeBaru: 10,
    nilaiJabatanBaru: 1919,
    remunerasiBaru: 5757000,
    p1Baru: 2302800,
    jenisPerubahan: "perubahan jabatan fungsional",
    tanggalSpmt: "2026-10-12",
    mulai: "12 Okt 2026",
    bulanEfektifP1: "Oktober 2026",
    periodeEfektifSudahDiproses: true,
    status: "terverifikasi",
    diajukanOleh: "Kepegawaian FTI",
    tanggalPengajuan: "12 Okt 2026",
    sk: "SK/R/142/2026",
    tanggalSK: "14 Okt 2026",
    catatanVerifikator: "SK Jabatan Fungsional Lektor & SPMT tanggal 12 Okt 2026 terverifikasi sah. Karena SPMT terbit sebelum/pada tanggal 15, efektif P1 berlaku mulai Oktober 2026.",
    pemeriksaanOtomatis: {
      batas15: true,
      terdaftarMaster: true,
      tidakTumpangTindih: true,
    },
    riwayatJabatanResmi: [
      { jabatan: "Asisten Ahli", grade: 9, nilaiJabatan: 1453, mulai: "01 Mar 2022", selesai: "-", sk: "SK/R/045/2022", status: "Berlaku" },
      { jabatan: "Tenaga Pengajar", grade: 8, nilaiJabatan: 1382, mulai: "01 Jan 2019", selesai: "28 Feb 2022", sk: "SK/R/010/2019", status: "Berakhir" },
    ],
  },
  {
    id: "USL-018",
    nip: "198509102008011008",
    pegawai: "Andi Pratama, S.E.",
    unit: "Fakultas Teknik",
    lama: "Pengelola Keuangan / G8",
    baru: "Kepala Subbagian Keuangan / G10",
    jabatanLama: "Pengelola Keuangan",
    gradeLama: 8,
    nilaiJabatanLama: 1382,
    remunerasiLama: 4146000,
    p1Lama: 1658400,
    jabatanBaru: "Kepala Subbagian / Pengelola Tk. I",
    gradeBaru: 10,
    nilaiJabatanBaru: 1919,
    remunerasiBaru: 5757000,
    p1Baru: 2302800,
    jenisPerubahan: "pengangkatan pejabat pengelola",
    tanggalSpmt: "2026-10-20",
    mulai: "20 Okt 2026",
    bulanEfektifP1: "November 2026",
    periodeEfektifSudahDiproses: false,
    status: "terverifikasi",
    diajukanOleh: "Kepegawaian FT",
    tanggalPengajuan: "21 Okt 2026",
    sk: "SK/R/158/2026",
    tanggalSK: "20 Okt 2026",
    catatanVerifikator: "SPMT diterbitkan tanggal 20 Okt 2026 (melewati batas tanggal 15). Sesuai Pasal 16 ayat 4, penyesuaian P1 efektif pada bulan November 2026.",
    pemeriksaanOtomatis: {
      batas15: true,
      terdaftarMaster: true,
      tidakTumpangTindih: true,
    },
    riwayatJabatanResmi: [
      { jabatan: "Pengelola Keuangan", grade: 8, nilaiJabatan: 1382, mulai: "01 Jan 2021", selesai: "-", sk: "SK/R/019/2021", status: "Berlaku" },
    ],
  },
  {
    id: "USL-012",
    nip: "198904122014042005",
    pegawai: "Nadia Permata, S.T., M.Eng.",
    unit: "Fakultas Teknik",
    lama: "Lektor / G10",
    baru: "Lektor Kepala / G11",
    jabatanLama: "Lektor",
    gradeLama: 10,
    nilaiJabatanLama: 1919,
    remunerasiLama: 5757000,
    p1Lama: 2302800,
    jabatanBaru: "Lektor Kepala",
    gradeBaru: 11,
    nilaiJabatanBaru: 2304,
    remunerasiBaru: 6912000,
    p1Baru: 2764800,
    jenisPerubahan: "promosi",
    tanggalSpmt: "2026-10-01",
    mulai: "1 Okt 2026",
    bulanEfektifP1: "Oktober 2026",
    periodeEfektifSudahDiproses: false,
    status: "ditetapkan",
    diajukanOleh: "Kepegawaian FT",
    tanggalPengajuan: "02 Okt 2026",
    sk: "SK/R/118/2026",
    tanggalSK: "08 Okt 2026",
    catatanVerifikator: "Dokumen lengkap dan telah diverifikasi.",
    pemeriksaanOtomatis: {
      batas15: true,
      terdaftarMaster: true,
      tidakTumpangTindih: true,
    },
    riwayatJabatanResmi: [
      { jabatan: "Lektor Kepala", grade: 11, nilaiJabatan: 2304, mulai: "01 Okt 2026", selesai: "-", sk: "SK/R/118/2026", status: "Berlaku" },
      { jabatan: "Lektor", grade: 10, nilaiJabatan: 1919, mulai: "01 Apr 2021", selesai: "30 Sep 2026", sk: "SK/R/033/2021", status: "Berakhir" },
    ],
  },
  {
    id: "USL-015",
    nip: "198811052014022031",
    pegawai: "Ratna Sari Dewi, S.Sos.",
    unit: "Rektorat - Bidang II Keuangan & Umum",
    lama: "Arsiparis Mahir / G6",
    baru: "Arsiparis Ahli Pertama / G8",
    jabatanLama: "Arsiparis Mahir",
    gradeLama: 6,
    nilaiJabatanLama: 1093,
    remunerasiLama: 3279000,
    p1Lama: 1311600,
    jabatanBaru: "Arsiparis Ahli Pertama",
    gradeBaru: 8,
    nilaiJabatanBaru: 1382,
    remunerasiBaru: 4146000,
    p1Baru: 1658400,
    jenisPerubahan: "perubahan grade",
    tanggalSpmt: "2026-11-01",
    mulai: "1 Nov 2026",
    bulanEfektifP1: "November 2026",
    periodeEfektifSudahDiproses: false,
    status: "diajukan",
    diajukanOleh: "Kepegawaian Rektorat",
    tanggalPengajuan: "20 Okt 2026",
    sk: "SK/R/162/2026",
    tanggalSK: "19 Okt 2026",
    pemeriksaanOtomatis: {
      batas15: true,
      terdaftarMaster: true,
      tidakTumpangTindih: true,
    },
    riwayatJabatanResmi: [
      { jabatan: "Arsiparis Mahir", grade: 6, nilaiJabatan: 1093, mulai: "01 Feb 2022", selesai: "-", sk: "SK/R/024/2022", status: "Berlaku" },
    ],
  },
  {
    id: "USL-016",
    nip: "199011122019032015",
    pegawai: "Dewi Lestari, S.Ak.",
    unit: "Fakultas MIPA",
    lama: "Pranata Keuangan / G7",
    baru: "Bendahara Pengeluaran / G8",
    jabatanLama: "Pranata Keuangan",
    gradeLama: 7,
    nilaiJabatanLama: 1210,
    remunerasiLama: 3630000,
    p1Lama: 1452000,
    jabatanBaru: "Bendahara Pengeluaran Pembantu",
    gradeBaru: 8,
    nilaiJabatanBaru: 1382,
    remunerasiBaru: 4146000,
    p1Baru: 1658400,
    jenisPerubahan: "mutasi",
    tanggalSpmt: "2026-10-01",
    mulai: "1 Okt 2026",
    bulanEfektifP1: "Oktober 2026",
    periodeEfektifSudahDiproses: false,
    status: "dikembalikan",
    diajukanOleh: "Kepegawaian FMIPA",
    tanggalPengajuan: "15 Okt 2026",
    sk: "-",
    tanggalSK: "-",
    catatan: "Dokumen sertifikasi bendahara belum dilampirkan",
    pemeriksaanOtomatis: {
      batas15: true,
      terdaftarMaster: true,
      tidakTumpangTindih: true,
    },
    riwayatJabatanResmi: [
      { jabatan: "Pranata Keuangan", grade: 7, nilaiJabatan: 1210, mulai: "01 Jan 2023", selesai: "-", sk: "SK/R/011/2023", status: "Berlaku" },
    ],
  },
]

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

export const pegawaiHitungSample: PegawaiHitungP1Item[] = [
  {
    id: "PGH-01",
    nama: "Dr. Rina Maharani, M.T.",
    nip: "198207182006042003",
    grade: 11,
    jabatan: "Lektor Kepala",
    statusKepegawaian: "PNS",
    p1Gross: 2764800,
    pengaliStatus: 100,
    potonganKehadiran: 55296,
    rincianKehadiran: [
      { jenis: "Terlambat 31-60 menit (TL2)", jumlah: "2 hari (diganti di hari sama: Tidak)", persenPotongan: 1, nominal: 27648 },
      { jenis: "Pulang Cepat 1-30 menit (PSW1)", jumlah: "2 hari", persenPotongan: 1, nominal: 27648 },
    ],
    potonganHukdis: 0,
    rincianHukdis: "Tidak ada hukuman disiplin aktif",
    totalPotongan: 55296,
    persenKetidakhadiran: 4.5,
    melebihiAmbang50: false,
    p1SetelahPotongan: 2709504,
    tarifPajakPersen: 5,
    pajak: 135475,
    netto: 2574029,
    flags: {
      ketidakhadiranLebih50: false,
      hukumanDisiplinAktif: false,
      jabatanBerubah: false,
      tidakMemenuhiSyaratBayar: false,
      dikoreksiBendahara: false,
    },
    catatan: "Normal",
    riwayatKoreksiPajak: [],
  },
  {
    id: "PGH-02",
    nama: "Dimas Saputra, S.T., M.Kom.",
    nip: "198611252010121004",
    grade: 10,
    jabatan: "Lektor",
    statusKepegawaian: "PNS",
    p1Gross: 2302800,
    pengaliStatus: 100,
    potonganKehadiran: 115140,
    rincianKehadiran: [
      { jenis: "Terlambat >90 menit (TL4)", jumlah: "1 hari", persenPotongan: 2.5, nominal: 57570 },
      { jenis: "Izin Sakit tanpa keterangan dokter", jumlah: "1 hari", persenPotongan: 2.5, nominal: 57570 },
    ],
    potonganHukdis: 0,
    rincianHukdis: "Tidak ada hukuman disiplin aktif",
    totalPotongan: 115140,
    persenKetidakhadiran: 9.0,
    melebihiAmbang50: false,
    p1SetelahPotongan: 2187660,
    tarifPajakPersen: 5,
    pajak: 109383,
    netto: 2078277,
    flags: {
      ketidakhadiranLebih50: false,
      hukumanDisiplinAktif: false,
      jabatanBerubah: true,
      tidakMemenuhiSyaratBayar: false,
      dikoreksiBendahara: true,
    },
    catatan: "Kenaikan grade G9 -> G10 & penyesuaian absensi dinas luar oleh Bendahara",
    riwayatKoreksiPajak: [],
  },
  {
    id: "PGH-03",
    nama: "Fajar Nugraha, S.Kom.",
    nip: "199102142018031006",
    grade: 8,
    jabatan: "Pranata Komputer Ahli Pertama",
    statusKepegawaian: "CPT-PTNBH",
    p1Gross: 1658400,
    pengaliStatus: 80,
    potonganKehadiran: 0,
    rincianKehadiran: [],
    potonganHukdis: 199008,
    rincianHukdis: "Hukuman Disiplin Ringan (Teguran Tertulis - Potongan 15%)",
    totalPotongan: 199008,
    persenKetidakhadiran: 0,
    melebihiAmbang50: false,
    p1SetelahPotongan: 1127712,
    tarifPajakPersen: 5,
    pajak: 56386,
    netto: 1071326,
    flags: {
      ketidakhadiranLebih50: false,
      hukumanDisiplinAktif: true,
      jabatanBerubah: false,
      tidakMemenuhiSyaratBayar: false,
      dikoreksiBendahara: false,
    },
    catatan: "Pengali CPT-PTNBH 80% + Potongan Hukuman Disiplin 15%",
    riwayatKoreksiPajak: [],
  },
  {
    id: "PGH-04",
    nama: "Farhan Maulana, S.T.",
    nip: "199612012024041032",
    grade: 9,
    jabatan: "Asisten Ahli",
    statusKepegawaian: "PNS",
    p1Gross: 1743600,
    pengaliStatus: 100,
    potonganKehadiran: 1743600,
    rincianKehadiran: [
      { jenis: "Alpa / Tanpa Keterangan", jumlah: "13 hari (59% hari kerja)", persenPotongan: 100, nominal: 1743600 },
    ],
    potonganHukdis: 0,
    rincianHukdis: "Tidak ada hukuman disiplin aktif",
    totalPotongan: 1743600,
    persenKetidakhadiran: 59.0,
    melebihiAmbang50: true,
    p1SetelahPotongan: 0,
    tarifPajakPersen: 0,
    pajak: 0,
    netto: 0,
    flags: {
      ketidakhadiranLebih50: true,
      hukumanDisiplinAktif: false,
      jabatanBerubah: false,
      tidakMemenuhiSyaratBayar: true,
      dikoreksiBendahara: false,
    },
    catatan: "Ketidakhadiran 59% (> ambang 50%): Tidak memenuhi syarat bayar P1 bulan ini",
    riwayatKoreksiPajak: [],
  },
  {
    id: "PGH-05",
    nama: "Siti Rahma, S.E.",
    nip: "199308192020122007",
    grade: 8,
    jabatan: "Bendahara Pengeluaran Pembantu",
    statusKepegawaian: "PNS",
    p1Gross: 1658400,
    pengaliStatus: 100,
    potonganKehadiran: 0,
    rincianKehadiran: [],
    potonganHukdis: 0,
    rincianHukdis: "Tidak ada hukuman disiplin aktif",
    totalPotongan: 0,
    persenKetidakhadiran: 0,
    melebihiAmbang50: false,
    p1SetelahPotongan: 1658400,
    tarifPajakPersen: 5,
    pajak: 82920,
    netto: 1575480,
    flags: {
      ketidakhadiranLebih50: false,
      hukumanDisiplinAktif: false,
      jabatanBerubah: false,
      tidakMemenuhiSyaratBayar: false,
      dikoreksiBendahara: false,
    },
    catatan: "Hadir penuh 100%",
    riwayatKoreksiPajak: [],
  },
]
