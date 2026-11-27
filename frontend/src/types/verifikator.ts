export type StatusVerif =
  | "Diajukan"
  | "Dikembalikan"
  | "Diverifikasi"
  | "Disetujui"
  | "Diteruskan"

export type PenandaPegawai =
  | "Jabatan berubah"
  | "Tidak layak bayar"
  | "Hukdis aktif"
export type KategoriValidasi =
  | "kehadiran"
  | "hukdis"
  | "jabatan"
  | "syarat"
  | "tidakWajar"

export type PotonganRincian = { label: string; nominal: number }

export type PegawaiPengajuan = {
  nip: string
  nama: string
  jabatan: string
  grade: number | string
  status: string
  hariKerja: number
  tidakHadir: number
  potKehadiran: string
  potHukdis: string
  gross: number
  setelahPotongan: number
  penanda?: PenandaPegawai
  kategori: KategoriValidasi[]
  nilaiJabatan: number
  pir: number
  porsi: number
  pengali: number
  potongan: PotonganRincian[]
  riwayatJabatan?: { judul: string; ket: string }
  catatanBendahara?: string
}

export type RiwayatKejadian = {
  ke: number
  judul: string
  waktu: string
  oleh: string
  catatan?: string
  selesai?: boolean
}

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
  ke: number
  tertahanHari?: number
  diperbarui: string
  riwayat: RiwayatKejadian[]
  pegawai?: PegawaiPengajuan[]
}

export type UsulanJabatan = {
  id: string
  nip: string
  nama: string
  unit: string
  statusKepegawaian?: string
  jenis: string
  jabatanLama: string
  gradeLama: number | string
  nilaiLama?: number
  jabatanBaru: string
  gradeBaru: number | string
  nilaiBaru?: number
  tmt?: string
  berlakuLama?: string
  berlakuBaru?: string
  alasan: string
  dokumen?: any
  status: "Diajukan" | "Disetujui" | "Dikembalikan" | "Diverifikasi" | string
  catatan?: string
  diajukanPada?: string
  diajukan?: string
  diajukanOleh?: string
  dasar?: string
  penanda?: string
  dampak?: any
  diperbarui?: string
  riwayat?: any[]
  mulai?: string
}

export type Audit = {
  id: string
  tanggal?: string
  waktu: string
  pelaku?: string
  aktor?: string
  peran: string
  aksi?: string
  tindakan?: string
  objek: string
  judul?: string
  sebelum?: { judul: string; ket: string }
  sesudah?: { judul: string; ket: string }
  alasan?: string
  detail?: string
  status?: "Berhasil" | "Peringatan" | "Gagal"
}

export const RINGKASAN_VALIDASI: { key: KategoriValidasi; label: string; jumlah: number }[] = [
  { key: "kehadiran", label: "Kehadiran < 50%", jumlah: 0 },
  { key: "hukdis", label: "Hukuman disiplin aktif", jumlah: 0 },
  { key: "jabatan", label: "Jabatan/grade berubah", jumlah: 0 },
  { key: "syarat", label: "Tidak memenuhi syarat", jumlah: 0 },
  { key: "tidakWajar", label: "Baris tidak wajar", jumlah: 0 },
]

export const DAFTAR_PERIKSA = [
  { id: "presensi", label: "Presensi lengkap", awal: true },
  { id: "jabatan", label: "Jabatan dan grade sesuai riwayat resmi", awal: true },
  { id: "status", label: "Status dan pengali sesuai", awal: true },
  { id: "potongan", label: "Potongan sesuai tabel pedoman", awal: false },
  { id: "nol", label: "Pegawai tidak layak bayar bernilai Rp 0", awal: true },
]
