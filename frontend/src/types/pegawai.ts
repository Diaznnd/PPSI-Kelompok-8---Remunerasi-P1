export type StatusPengaduan =
  | "Diajukan"
  | "Dibahas"
  | "Ditindaklanjuti"
  | "Selesai"

export type KategoriPengaduan =
  | "Hasil perhitungan P1"
  | "Data presensi atau kehadiran"
  | "Perubahan jabatan atau grade belum sesuai"
  | "Lainnya"

export type RincianKehadiran = {
  komponen: string
  jumlah: string
  tarif: string
  potonganP1: string
}

export type Slip = {
  id: string
  periode: string
  status: "lunas" | "belum lunas" | "proses"
  bruto: number
  potongan: number
  netto: number
  jabatan?: string
  grade?: string | number
  pangkat?: string
  nomorAmprah?: string
  rincianKehadiran?: RincianKehadiran[]
  potonganPajak?: number
  keterangan?: string
}

export type LinimasaItem = {
  tahap: string
  tanggal: string
  oleh: string
  selesai: boolean
  keterangan?: string
}

export type PesanPengaduan = {
  id: string
  pengirim: string
  peran: string
  pesan: string
  waktu: string
  lampiran?: string
}

export type Pengaduan = {
  id: string
  nomorTiket: string
  kategori: string
  judul: string
  deskripsi: string
  tanggal: string
  status: StatusPengaduan
  lampiran?: string
  linimasa?: LinimasaItem[]
  percakapan?: PesanPengaduan[]
}

export type ProfilPegawai = {
  id?: number
  nama: string
  nip: string
  jabatan: string
  jabatanFungsional?: string
  fakultas?: string
  unitKerja?: string
  grade: string | number
  pangkatGolongan: string
  npwp: string
  rekening: string
  nipAtasan?: string
  statusKepegawaian?: string
}

export interface KomponenPenguranganItem {
  kode: string
  nama: string
  keterangan?: string
  hari: number
  tarifPersen: number
}

export interface SlipSayaItem {
  id: string
  tahun: string
  periode: string
  nomorSlip: string
  status: "terbit" | "belum_terbit"
  remunerasiJabatan: number
  p140: number
  pengaliStatus: number
  remunerasiP1: number
  tl: KomponenPenguranganItem[]
  psw: KomponenPenguranganItem[]
  ketidakhadiran: KomponenPenguranganItem[]
  totalPersenPengurangan: number
  penguranganKehadiranRp: number
  hukumanDisiplin?: {
    tingkat: "Ringan" | "Sedang" | "Berat"
    persen: number
    masaBerlaku: string
    nominalRp: number
  }
  ambangLebih50Persen?: boolean
  jumlahBruto: number
  pajak: number
  pajakTer: number
  tabPajak: number
  jumlahNetto: number
  rekeningMasked: string
}

export type KategoriPengaduanSaya =
  | "Data presensi atau kehadiran"
  | "Perubahan jabatan atau grade belum sesuai"
  | "Hasil perhitungan P1"
  | "Slip P1"

export type StatusPengaduanSaya = "Diajukan" | "Ditindaklanjuti" | "Diteruskan" | "Selesai"

export interface PengaduanSayaTahap {
  tahap: "Diajukan" | "Ditindaklanjuti" | "Diteruskan ke UPT Remunerasi" | "Selesai"
  selesai: boolean
  pelaku: string
  waktu: string
  catatan: string
}

export interface PengaduanSayaPesan {
  id: string
  pengirim: string
  peran: string
  waktu: string
  isi: string
  lampiran?: string
}

export interface PengaduanSayaItem {
  nomor: string
  tanggal: string
  kategori: KategoriPengaduanSaya
  periode: string
  judul: string
  uraian: string
  lampiran: { nama: string; ukuran: string }[]
  status: StatusPengaduanSaya
  dieskalasi: boolean
  linimasa: PengaduanSayaTahap[]
  pesan: PengaduanSayaPesan[]
}

export const KATEGORI_PENGADUAN_SAYA: {
  value: KategoriPengaduanSaya
  bantuan: string
}[] = [
  {
    value: "Data presensi atau kehadiran",
    bantuan: "Sebutkan tanggal yang tidak sesuai. Ditangani Bidang Kepegawaian unit Anda.",
  },
  {
    value: "Perubahan jabatan atau grade belum sesuai",
    bantuan:
      "Lampirkan SK/SPMT dan sebutkan tanggal mulai tugas. Penyesuaian P1 mengacu pada surat pernyataan melaksanakan tugas yang terhitung dalam 15 hari kalender awal bulan terkait (Pedoman 2.3 butir 4).",
  },
  {
    value: "Hasil perhitungan P1",
    bantuan: "Bandingkan dengan slip Anda dan sebutkan komponen yang dianggap keliru.",
  },
  {
    value: "Slip P1",
    bantuan: "Sebutkan bagian slip yang dipertanyakan.",
  },
]
