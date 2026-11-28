export type PegawaiUnit = {
  no?: number
  nip: string
  nama: string
  pangkat: string
  jabatan: string
  grade: string | number
  status: string
  sejak?: string
  aktif?: boolean
  gajiPokok?: number
  potongan?: number
  netto?: number
}

export type RiwayatUnit = {
  periode: string
  status: "Diverifikasi" | "Disetujui" | "Diajukan" | "Dikembalikan"
  diajukan: string
  keputusan: string
  kembali: number
  catatan: string
  terkini: string
}

export type StatusPengajuanUnit = {
  periode: string
  status: "Draft" | "Diajukan" | "Diverifikasi" | "Disetujui" | "Dikembalikan"
  totalPegawai: number
  totalBruto: number
  totalNetto: number
  tanggalPengajuan?: string
  catatan?: string
}
