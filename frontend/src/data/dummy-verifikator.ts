// Semua data di file ini DUMMY. Nanti ganti dengan panggilan api dari "@/lib/api".

export const verifikator = { nama: "Rizki Maulana", inisial: "RI" }

export const PERIODE_VERIFIKATOR = ["Oktober 2026", "September 2026", "Agustus 2026", "Juli 2026"]
export const PERIODE_AKTIF_VERIFIKATOR = "Oktober 2026"

export type StatusVerif = "Diajukan" | "Dikembalikan" | "Diverifikasi" | "Disetujui" | "Diteruskan"

// ---------- Pengajuan P1 ----------

export type PenandaPegawai = "Jabatan berubah" | "Tidak layak bayar" | "Hukdis aktif"
export type KategoriValidasi = "kehadiran" | "hukdis" | "jabatan" | "syarat" | "tidakWajar"

export type PotonganRincian = { label: string; nominal: number }
export type PegawaiPengajuan = {
  nip: string
  nama: string
  jabatan: string
  grade: number
  status: string
  hariKerja: number
  tidakHadir: number
  potKehadiran: string
  potHukdis: string
  gross: number
  setelahPotongan: number
  penanda?: PenandaPegawai
  kategori: KategoriValidasi[]
  // rincian perhitungan (panel samping)
  nilaiJabatan: number
  pir: number
  porsi: number
  pengali: number
  potongan: PotonganRincian[]
  riwayatJabatan?: { judul: string; ket: string }
  catatanBendahara?: string
}

export type RiwayatKejadian = { ke: number; judul: string; waktu: string; oleh: string; catatan?: string; selesai?: boolean }

export type PengajuanP1 = {
  id: string
  unit: string
  periode: string
  jumlahPegawai: number
  totalGross: number
  totalPotongan: number
  totalSetelah: number
  tanggalDiajukan: string
  waktuDiajukan: string
  bendahara: string
  status: StatusVerif
  ke: number // pengajuan ke-
  tertahanHari?: number
  diperbarui: string
  riwayat: RiwayatKejadian[]
}

export const PEGAWAI_FTI: PegawaiPengajuan[] = [
  {
    nip: "198803122015042001", nama: "Dr. Rina Maharani, M.T.", jabatan: "Lektor Kepala", grade: 11, status: "PNS",
    hariKerja: 22, tidakHadir: 1, potKehadiran: "1,5%", potHukdis: "0%", gross: 5100000, setelahPotongan: 5023500,
    penanda: "Jabatan berubah", kategori: ["jabatan"],
    nilaiJabatan: 1275, pir: 10000, porsi: 40, pengali: 100,
    potongan: [{ label: "Cuti sakit • 1 hari × 1%", nominal: 51000 }, { label: "Keterlambatan • 35 menit × 0,5%", nominal: 25500 }],
    riwayatJabatan: { judul: "Lektor Kepala • Grade 11", ket: "Berlaku sejak 1 September 2026 berdasarkan SPMT Nomor 184/UN16/KP/2026." },
    catatanBendahara: "Penyesuaian jabatan telah diterapkan berdasarkan dokumen terbaru dari Bidang Kepegawaian.",
  },
  {
    nip: "198712302012011001", nama: "Andi Pratama, S.Kom.", jabatan: "Pranata Komputer", grade: 8, status: "PNS",
    hariKerja: 22, tidakHadir: 0, potKehadiran: "0%", potHukdis: "0%", gross: 3850000, setelahPotongan: 3850000,
    kategori: [],
    nilaiJabatan: 770, pir: 10000, porsi: 50, pengali: 100, potongan: [],
  },
  {
    nip: "198606202013052004", nama: "Siti Rahman, M.Kom.", jabatan: "Lektor", grade: 10, status: "PNS",
    hariKerja: 22, tidakHadir: 13, potKehadiran: "59%", potHukdis: "0%", gross: 4500000, setelahPotongan: 0,
    penanda: "Tidak layak bayar", kategori: ["kehadiran", "syarat"],
    nilaiJabatan: 1125, pir: 10000, porsi: 40, pengali: 100,
    potongan: [{ label: "Tidak hadir tanpa keterangan • 13 hari", nominal: 2655000 }, { label: "Penyesuaian kehadiran < 50% (tidak layak bayar)", nominal: 1845000 }],
    catatanBendahara: "Kehadiran di bawah 50%, P1 ditetapkan Rp 0 sesuai ketentuan.",
  },
  {
    nip: "198909152019031001", nama: "Budi Santoso, M.T.", jabatan: "Lektor Kepala", grade: 11, status: "PNS",
    hariKerja: 22, tidakHadir: 2, potKehadiran: "2,5%", potHukdis: "25%", gross: 5100000, setelahPotongan: 3697500,
    penanda: "Hukdis aktif", kategori: ["hukdis"],
    nilaiJabatan: 1275, pir: 10000, porsi: 40, pengali: 100,
    potongan: [{ label: "Kehadiran • 2,5%", nominal: 127500 }, { label: "Hukuman disiplin sedang • 25%", nominal: 1275000 }],
  },
]

export const PENGAJUAN_AWAL: PengajuanP1[] = [
  {
    id: "P1-2026-09-FTI-018", unit: "Fakultas Teknologi Informasi", periode: "September 2026", jumlahPegawai: 84,
    totalGross: 388200000, totalPotongan: 5750000, totalSetelah: 382450000,
    tanggalDiajukan: "6 Oktober 2026", waktuDiajukan: "6 Oktober 2026, 09.12 WIB", bendahara: "Maya Sari, S.E.",
    status: "Diajukan", ke: 2, diperbarui: "6 Oktober 2026, 09.12 WIB",
    riwayat: [
      { ke: 1, judul: "Diajukan Bendahara", waktu: "3 Oktober 2026, 09.10 WIB", oleh: "Maya Sari • Bendahara", selesai: true },
      { ke: 1, judul: "Dikembalikan Verifikator", waktu: "4 Oktober 2026, 13.22 WIB", oleh: "Rizki Maulana • Verifikator", catatan: "Periksa kembali data presensi tiga pegawai." },
      { ke: 2, judul: "Diajukan Ulang", waktu: "6 Oktober 2026, 09.12 WIB", oleh: "Maya Sari • Bendahara", selesai: true },
    ],
  },
  {
    id: "P1-2026-09-FEB-014", unit: "Fakultas Ekonomi dan Bisnis", periode: "September 2026", jumlahPegawai: 126,
    totalGross: 548900000, totalPotongan: 7625000, totalSetelah: 541275000,
    tanggalDiajukan: "5 Oktober 2026", waktuDiajukan: "5 Oktober 2026, 10.30 WIB", bendahara: "Hendra Gunawan, S.E.",
    status: "Dikembalikan", ke: 2, tertahanHari: 2, diperbarui: "7 Oktober 2026, 14.20 WIB",
    riwayat: [
      { ke: 1, judul: "Diajukan Bendahara", waktu: "2 Oktober 2026, 11.00 WIB", oleh: "Hendra Gunawan • Bendahara", selesai: true },
      { ke: 1, judul: "Dikembalikan Verifikator", waktu: "3 Oktober 2026, 15.45 WIB", oleh: "Rizki Maulana • Verifikator", catatan: "Total potongan tidak sesuai dengan rekap presensi." },
      { ke: 2, judul: "Diajukan Ulang", waktu: "5 Oktober 2026, 10.30 WIB", oleh: "Hendra Gunawan • Bendahara", selesai: true },
      { ke: 2, judul: "Dikembalikan Verifikator", waktu: "7 Oktober 2026, 14.20 WIB", oleh: "Rizki Maulana • Verifikator", catatan: "Dua pegawai belum memiliki bukti cuti." },
    ],
  },
  {
    id: "P1-2026-09-FK-011", unit: "Fakultas Kedokteran", periode: "September 2026", jumlahPegawai: 218,
    totalGross: 901500000, totalPotongan: 7370000, totalSetelah: 894130000,
    tanggalDiajukan: "4 Oktober 2026", waktuDiajukan: "4 Oktober 2026, 08.50 WIB", bendahara: "Ratna Dewi, S.E.",
    status: "Diverifikasi", ke: 1, diperbarui: "6 Oktober 2026, 14.20 WIB",
    riwayat: [
      { ke: 1, judul: "Diajukan Bendahara", waktu: "4 Oktober 2026, 08.50 WIB", oleh: "Ratna Dewi • Bendahara", selesai: true },
      { ke: 1, judul: "Disetujui dan Diteruskan", waktu: "6 Oktober 2026, 14.20 WIB", oleh: "Rizki Maulana • Verifikator", selesai: true },
    ],
  },
]

export const RINGKASAN_VALIDASI: { key: KategoriValidasi; label: string; jumlah: number }[] = [
  { key: "kehadiran", label: "Kehadiran < 50%", jumlah: 1 },
  { key: "hukdis", label: "Hukuman disiplin aktif", jumlah: 1 },
  { key: "jabatan", label: "Jabatan/grade berubah", jumlah: 1 },
  { key: "syarat", label: "Tidak memenuhi syarat", jumlah: 1 },
  { key: "tidakWajar", label: "Baris tidak wajar", jumlah: 0 },
]

export const DAFTAR_PERIKSA = [
  { id: "presensi", label: "Presensi lengkap", awal: true },
  { id: "jabatan", label: "Jabatan dan grade sesuai riwayat resmi", awal: true },
  { id: "status", label: "Status dan pengali sesuai", awal: true },
  { id: "potongan", label: "Potongan sesuai tabel pedoman", awal: false },
  { id: "nol", label: "Pegawai tidak layak bayar bernilai Rp 0", awal: true },
]

// ---------- Usulan perubahan jabatan/grade ----------

export type UsulanJabatan = {
  id: string
  nama: string
  nip: string
  unit: string
  statusKepegawaian: string
  jenis: string
  jabatanLama: string
  jabatanBaru: string
  gradeLama: number
  gradeBaru: number
  nilaiLama: number
  nilaiBaru: number
  berlakuLama: string
  berlakuBaru: string
  mulai: string
  diajukan: string
  diajukanOleh: string
  status: StatusVerif
  dasar: string
  dokumen: { judul: string; ket: string; isi: string[] }
  penanda: { tipe: "ok" | "warn"; judul: string; ket: string }[]
  dampak: number
  diperbarui: string
  riwayat: RiwayatKejadian[]
}

export const USULAN_AWAL: UsulanJabatan[] = [
  {
    id: "JBG-2026-10-0021", nama: "Dr. Rina Maharani, M.T.", nip: "198803122015042001", unit: "Fakultas Teknologi Informasi",
    statusKepegawaian: "PNS", jenis: "Promosi jabatan fungsional", jabatanLama: "Lektor", jabatanBaru: "Lektor Kepala",
    gradeLama: 10, gradeBaru: 11, nilaiLama: 1125, nilaiBaru: 1275, berlakuLama: "1 Januari 2024", berlakuBaru: "1 September 2026",
    mulai: "1 September 2026", diajukan: "3 Oktober 2026", diajukanOleh: "Bidang Kepegawaian FTI", status: "Diajukan",
    dasar: "Penyesuaian P1 didasarkan pada surat pernyataan melaksanakan tugas.",
    dokumen: {
      judul: "SPMT • Nomor 184/UN16/KP/2026 • 28 Agustus 2026", ket: "Nomor: 184/UN16/KP/2026",
      isi: ["Dengan ini menyatakan bahwa Dr. Rina Maharani, M.T. telah melaksanakan tugas sebagai Lektor Kepala terhitung mulai 1 September 2026.", "Padang, 28 Agustus 2026"],
    },
    penanda: [
      { tipe: "ok", judul: "Tanggal SPMT memenuhi batas", ket: "Berlaku pada 1 September, dalam 15 hari kalender awal bulan." },
      { tipe: "ok", judul: "Jabatan terdaftar", ket: "Lektor Kepala ditemukan pada master data jabatan." },
      { tipe: "warn", judul: "Periksa periode Agustus", ket: "Terdapat riwayat data yang berdekatan, namun tidak bertumpang tindih." },
    ],
    dampak: 600000, diperbarui: "3 Oktober 2026, 10.00 WIB",
    riwayat: [{ ke: 1, judul: "Diajukan Kepegawaian", waktu: "3 Oktober 2026, 10.00 WIB", oleh: "Dewi Anggraini • Bidang Kepegawaian", selesai: true }],
  },
  {
    id: "JBG-2026-10-0017", nama: "Dr. Fadil Ramadhan, M.Si.", nip: "198511112012041003", unit: "Fakultas Ekonomi dan Bisnis",
    statusKepegawaian: "PNS", jenis: "Promosi jabatan fungsional", jabatanLama: "Lektor Kepala", jabatanBaru: "Guru Besar",
    gradeLama: 11, gradeBaru: 13, nilaiLama: 1275, nilaiBaru: 1700, berlakuLama: "1 Januari 2022", berlakuBaru: "1 Oktober 2026",
    mulai: "1 Oktober 2026", diajukan: "2 Oktober 2026", diajukanOleh: "Bidang Kepegawaian FEB", status: "Diajukan",
    dasar: "Penyesuaian P1 didasarkan pada SK pengangkatan Guru Besar.",
    dokumen: {
      judul: "SK Guru Besar • Nomor 77/UN16/KP/2026 • 25 September 2026", ket: "Nomor: 77/UN16/KP/2026",
      isi: ["Menetapkan Dr. Fadil Ramadhan, M.Si. sebagai Guru Besar terhitung mulai 1 Oktober 2026.", "Padang, 25 September 2026"],
    },
    penanda: [
      { tipe: "ok", judul: "Tanggal SK memenuhi batas", ket: "Berlaku pada 1 Oktober, dalam 15 hari kalender awal bulan." },
      { tipe: "ok", judul: "Jabatan terdaftar", ket: "Guru Besar ditemukan pada master data jabatan." },
    ],
    dampak: 1700000, diperbarui: "2 Oktober 2026, 14.10 WIB",
    riwayat: [{ ke: 1, judul: "Diajukan Kepegawaian", waktu: "2 Oktober 2026, 14.10 WIB", oleh: "Dewi Anggraini • Bidang Kepegawaian", selesai: true }],
  },
  {
    id: "JBG-2026-09-0098", nama: "Nina Oktaviani, S.E.", nip: "199104202018032002", unit: "Fakultas Pertanian",
    statusKepegawaian: "PNS", jenis: "Perubahan jabatan", jabatanLama: "Analis Keuangan", jabatanBaru: "Analis Keuangan Ahli Muda",
    gradeLama: 7, gradeBaru: 9, nilaiLama: 840, nilaiBaru: 990, berlakuLama: "1 Januari 2023", berlakuBaru: "15 September 2026",
    mulai: "15 September 2026", diajukan: "20 September 2026", diajukanOleh: "Bidang Kepegawaian", status: "Diverifikasi",
    dasar: "Penyesuaian P1 didasarkan pada SK perubahan jabatan.",
    dokumen: {
      judul: "SK Jabatan • Nomor 52/UN16/KP/2026 • 12 September 2026", ket: "Nomor: 52/UN16/KP/2026",
      isi: ["Menetapkan Nina Oktaviani, S.E. sebagai Analis Keuangan Ahli Muda terhitung mulai 15 September 2026.", "Padang, 12 September 2026"],
    },
    penanda: [{ tipe: "ok", judul: "Jabatan terdaftar", ket: "Analis Keuangan Ahli Muda ditemukan pada master data jabatan." }],
    dampak: 600000, diperbarui: "22 September 2026, 09.30 WIB",
    riwayat: [
      { ke: 1, judul: "Diajukan Kepegawaian", waktu: "20 September 2026, 11.00 WIB", oleh: "Dewi Anggraini • Bidang Kepegawaian", selesai: true },
      { ke: 1, judul: "Disetujui dan Diteruskan", waktu: "22 September 2026, 09.30 WIB", oleh: "Rizki Maulana • Verifikator", selesai: true },
    ],
  },
]

// ---------- Jejak audit ----------

export type Audit = {
  id: string
  tanggal: string // ISO yyyy-mm-dd, dipakai filter rentang tanggal
  waktu: string
  pelaku: string
  peran: string
  aksi: string
  objek: string
  judul: string
  sebelum?: { judul: string; ket: string }
  sesudah?: { judul: string; ket: string }
  alasan: string
}

export const AUDIT_AWAL: Audit[] = [
  {
    id: "a1", tanggal: "2026-10-09", waktu: "9 Oktober 2026, 14.25", pelaku: "Rizki Maulana", peran: "Verifikator", aksi: "Menyetujui pengajuan", objek: "P1-2026-09-FTI-018",
    judul: "Persetujuan Pengajuan P1", sebelum: { judul: "Status: Diajukan", ket: "Pengajuan ke-2" }, sesudah: { judul: "Status: Diverifikasi", ket: "Diteruskan ke UPT Remunerasi" },
    alasan: "Seluruh validasi otomatis telah diperiksa dan sesuai.",
  },
  {
    id: "a2", tanggal: "2026-10-09", waktu: "9 Oktober 2026, 10.11", pelaku: "Dewi Anggraini", peran: "Bidang Kepegawaian", aksi: "Mengubah data jabatan", objek: "Dr. Rina Maharani",
    judul: "Perubahan Data Jabatan", sebelum: { judul: "Jabatan: Lektor", ket: "Grade 10 • Nilai Jabatan 1.125" }, sesudah: { judul: "Jabatan: Lektor Kepala", ket: "Grade 11 • Nilai Jabatan 1.275" },
    alasan: "Promosi jabatan fungsional berdasarkan SK Rektor dan SPMT Nomor 184/UN16/KP/2026.",
  },
  {
    id: "a3", tanggal: "2026-10-08", waktu: "8 Oktober 2026, 16.40", pelaku: "Maya Sari", peran: "Bendahara", aksi: "Mengajukan ulang", objek: "P1-2026-09-FEB-014",
    judul: "Pengajuan Ulang P1", sebelum: { judul: "Status: Dikembalikan", ket: "Pengajuan ke-1" }, sesudah: { judul: "Status: Diajukan", ket: "Pengajuan ke-2" },
    alasan: "Perbaikan data presensi sesuai catatan Verifikator.",
  },
]
