// Semua data di file ini DUMMY. Nanti ganti dengan panggilan api dari "@/lib/api".

export const pegawai = {
  nama: "Dr. Rina Maharani, M.T.",
  inisial: "RM",
  nip: "198803122015042001",
  jenis: "Dosen",
  unit: "Fakultas Teknologi Informasi",
  jabatan: "Lektor Kepala",
  grade: 11,
  pangkat: "Penata Tk. I III/d",
  npwp: "09.876.543.2-201.000",
  npwpSamar: "12.345.•••.•-201.000",
  status: "PNS",
  rekening: "BNI ••••5678",
}

export const PERIODE_AKTIF = "Oktober 2026"
export const DAFTAR_PERIODE = ["Oktober 2026", "September 2026", "Agustus 2026", "Juli 2026"]

/* ---------------- Slip P1 ---------------- */
const tarifTL = ["0,25%", "0,5%", "1%", "1,5%", "2%", "2,5%"]
const KOMPONEN = [
  ...tarifTL.map((t, i) => ({ nama: `TL.${i + 1}`, hari: 0, tarif: t, persen: "0%" })),
  ...tarifTL.map((t, i) => ({ nama: `PSW.${i + 1}`, hari: 0, tarif: t, persen: "0%" })),
  { nama: "Cuti Sakit", hari: 1, tarif: "1%", persen: "1%" },
  { nama: "Cuti Bersalin ke-1 dan ke-2", hari: 0, tarif: "1%", persen: "0%" },
  { nama: "Cuti Bersalin ke-3", hari: 0, tarif: "2%", persen: "0%" },
  { nama: "Cuti Bersalin ke-4 dan seterusnya", hari: 0, tarif: "3%", persen: "0%" },
  { nama: "Cuti Karena Alasan Penting", hari: 0, tarif: "3%", persen: "0%" },
  { nama: "Cuti Besar", hari: 0, tarif: "1,5%", persen: "0%" },
  { nama: "Tidak Hadir Tanpa Keterangan", hari: 0, tarif: "5%", persen: "0%" },
]

export type Slip = {
  id: string
  periode: string
  nomor: string
  status: "Terbit"
  remunerasiGrade: number
  persenP1: number
  pengali: number
  remunerasiP1: number
  totalPersen: string
  pengurangan: number
  bruto: number
  pph21: number
  pphTer: number
  tabPajak: number
  netto: number
  komponen: typeof KOMPONEN
}

const BULAN: [string, string, string][] = [
  ["Oktober 2026", "2026-10", "10"],
  ["September 2026", "2026-09", "09"],
  ["Agustus 2026", "2026-08", "08"],
  ["Juli 2026", "2026-07", "07"],
]

export const DAFTAR_SLIP: Slip[] = BULAN.map(([periode, id, bb], i) => ({
  id,
  periode,
  nomor: `SLP-P1/2026/${bb}/00${4281 - i}`,
  status: "Terbit",
  remunerasiGrade: 6285000,
  persenP1: 40,
  pengali: 100,
  remunerasiP1: 2514000,
  totalPersen: "1%",
  pengurangan: 25140,
  bruto: 2488860,
  pph21: 150000,
  pphTer: 0,
  tabPajak: 0,
  netto: 2338860,
  komponen: KOMPONEN,
}))

/* ---------------- Pengaduan ---------------- */
export type StatusPengaduan = "Diajukan" | "Ditindaklanjuti" | "Diteruskan" | "Selesai"

export type Pengaduan = {
  nomor: string
  tanggal: string
  kategori: string
  periode: string
  status: StatusPengaduan
  langkahSelesai: number // jumlah langkah linimasa yang sudah selesai (0-4)
}

export const KATEGORI_PENGADUAN = [
  "Hasil perhitungan P1",
  "Perubahan jabatan atau grade belum sesuai",
  "Data presensi atau kehadiran",
  "Pajak dan potongan",
  "Lainnya",
]

export const DAFTAR_PENGADUAN: Pengaduan[] = [
  { nomor: "UA-FTI-2026-0012", tanggal: "22 Oktober 2026", kategori: "Perubahan jabatan atau grade belum sesuai", periode: "September 2026", status: "Ditindaklanjuti", langkahSelesai: 2 },
  { nomor: "UA-FTI-2026-0013", tanggal: "18 September 2026", kategori: "Data presensi atau kehadiran", periode: "Agustus 2026", status: "Diteruskan", langkahSelesai: 3 },
  { nomor: "UA-FTI-2026-0014", tanggal: "4 Agustus 2026", kategori: "Hasil perhitungan P1", periode: "Juli 2026", status: "Selesai", langkahSelesai: 4 },
]

export const LANGKAH_PENGADUAN = [
  { label: "Diajukan", waktu: "22 Oktober 2026, 09.14 WIB", oleh: "Dr. Rina Maharani, M.T." },
  { label: "Ditindaklanjuti Bidang Kepegawaian", waktu: "22 Oktober 2026, 14.35 WIB", oleh: "Verifikator Fakultas Teknologi Informasi" },
  { label: "Diteruskan ke UPT Remunerasi", waktu: "23 Oktober 2026, 10.20 WIB", oleh: "Petugas UPT Remunerasi" },
  { label: "Selesai", waktu: "24 Oktober 2026, 15.40 WIB", oleh: "UPT Remunerasi" },
]

export type Pesan = {
  dari: "Anda" | string
  waktu: string
  teks: string
  lampiran?: string
}

export const PESAN_AWAL: Pesan[] = [
  {
    dari: "Verifikator Kepegawaian",
    waktu: "22 Oktober 2026, 14.35 WIB",
    teks: "Dokumen SPMT telah kami periksa. Perubahan jabatan telah diteruskan ke UPT Remunerasi untuk penetapan.",
    lampiran: "SPMT-Lektor-Kepala.pdf",
  },
  {
    dari: "Anda",
    waktu: "22 Oktober 2026, 16.02 WIB",
    teks: "Terima kasih. SK dan SPMT terbaru sudah saya lampirkan pada pengaduan.",
  },
]