export type JenisPegawai = "Dosen" | "Tenaga Kependidikan"
export type StatusPegawai = "PNS" | "CPNS" | "CPT-PTNBH"
export const JENIS_PEGAWAI: JenisPegawai[] = ["Dosen", "Tenaga Kependidikan"]
export const STATUS_PEGAWAI: [StatusPegawai, number][] = [
  ["PNS", 100],
  ["CPNS", 80],
  ["CPT-PTNBH", 100],
]
export const pengaliDari = (s: StatusPegawai) =>
  STATUS_PEGAWAI.find(([k]) => k === s)?.[1] ?? 100
export const GOLONGAN = [
  "I/a", "I/b", "I/c", "I/d",
  "II/a", "II/b", "II/c", "II/d",
  "III/a", "III/b", "III/c", "III/d",
  "IV/a", "IV/b", "IV/c", "IV/d", "IV/e",
]
export const JABATAN_MASTER = [
  "Asisten Ahli",
  "Lektor",
  "Lektor Kepala",
  "Guru Besar",
  "Pranata Komputer",
  "Pengelola Data dan Informasi",
  "Analis Kepegawaian Ahli Muda",
  "Teknisi Laboratorium",
]
export const JENIS_USULAN = ["Promosi", "Kenaikan grade", "Mutasi jabatan"] as const
export const KATEGORI_ADU = [
  "Hasil perhitungan",
  "Presensi",
  "Pajak dan potongan",
  "Jabatan/grade",
  "Lainnya",
]
export const TINGKAT_HUKUMAN = { Ringan: 0, Sedang: 25, Berat: 100 } as const
export type TingkatHukuman = keyof typeof TINGKAT_HUKUMAN
export const JENIS_HUKUMAN = [
  "Teguran lisan",
  "Teguran tertulis",
  "Pernyataan tidak puas secara tertulis",
  "Pemotongan tunjangan kinerja 25% selama 6 bulan",
  "Penundaan kenaikan pangkat",
]

export const inisial = (nama: string) =>
  nama
    .split(" ")
    .filter((w) => !w.includes("."))
    .map((w) => w.replace(/,/g, ""))
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()

const iso = (y: number, m: number, d: number) => new Date(y, m - 1, d)
export const tglID = (isoStr: string) => {
  if (!isoStr) return "-"
  const [y, m, d] = isoStr.split("-").map(Number)
  if (!y || !m || !d) return isoStr
  return iso(y, m, d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export const hariInklusif = (a: string, b: string) => {
  if (!a || !b) return 0
  const [y1, m1, d1] = a.split("-").map(Number)
  const [y2, m2, d2] = b.split("-").map(Number)
  return (
    Math.round((iso(y2, m2, d2).getTime() - iso(y1, m1, d1).getTime()) / 86400000) + 1
  )
}

export type PegawaiKep = {
  id?: number
  nip: string
  nama: string
  email: string
  jenis: JenisPegawai
  status: StatusPegawai
  golongan: string
  jabatan: string
  grade: number | string
  tmt: string
  aktif: boolean
  alasanNonaktif?: string
  status_tugas_belajar?: "aktif" | "tugas_belajar"
  sk_tugas_belajar?: string
  tgl_mulai_tubel?: string
  tgl_selesai_tubel?: string
}

export type StatusUsulan =
  | "Diajukan"
  | "Dikembalikan"
  | "Disetujui Verifikator"
  | "Ditetapkan"
export type JejakUsulan = {
  label: string
  waktu: string
  oleh: string
  catatan?: string
}

export type UsulanKep = {
  id: string
  nip: string
  nama: string
  lama: { jabatan: string; grade: number | string }
  baru: { jabatan: string; grade: number | string }
  jenis: string
  mulai: string
  alasan: string
  status: StatusUsulan
  sk?: string
  spmt?: string
  jejak: JejakUsulan[]
  catatanKembali?: string
}

export type BarisPresensi = {
  nip: string
  nama: string
  hariKerja: number
  hadir: number
  tidakHadir: number
  cuti: number
  persenPotongan?: number
}

export type StatusHukuman = "Aktif" | "Akan berlaku" | "Berakhir" | "Selesai"
export type Hukuman = {
  id: string
  nip: string
  nama: string
  jenis: string
  tingkat: TingkatHukuman
  sk?: string
  nomor_sk?: string
  nomorSK?: string
  tglSK?: string
  mulai?: string
  berakhir?: string
  tglMulai?: string
  tglSelesai?: string
  alasan?: string
  uraian?: string
  potongan?: number
  status?: StatusHukuman
}

export const statusHukuman = (hOrMulai: any, tglSelesai?: string): StatusHukuman => {
  const mulai = typeof hOrMulai === "string" ? hOrMulai : (hOrMulai?.mulai || hOrMulai?.tglMulai || "")
  const berakhir = typeof hOrMulai === "string" ? (tglSelesai || "") : (hOrMulai?.berakhir || hOrMulai?.tglSelesai || "")
  const now = new Date().toISOString().split("T")[0]
  if (!mulai || !berakhir) return "Berakhir"
  if (now < mulai) return "Akan berlaku"
  if (now > berakhir) return "Berakhir"
  return "Aktif"
}

export const progresHukuman = (hOrMulai: any, tglSelesai?: string) => {
  const mulai = typeof hOrMulai === "string" ? hOrMulai : (hOrMulai?.mulai || hOrMulai?.tglMulai || "")
  const berakhir = typeof hOrMulai === "string" ? (tglSelesai || "") : (hOrMulai?.berakhir || hOrMulai?.tglSelesai || "")
  if (!mulai || !berakhir) return 0
  const total = hariInklusif(mulai, berakhir)
  const now = new Date().toISOString().split("T")[0]
  if (now < mulai) return 0
  if (now > berakhir) return 1
  const berlalu = hariInklusif(mulai, now)
  return Math.min(1, Math.max(0, berlalu / (total || 1)))
}

export type StatusAduan = "Menunggu" | "Ditanggapi" | "Selesai" | "Diajukan" | "Diteruskan"
export type AduanKep = {
  id: string
  raw_id?: number
  nip: string
  nama: string
  kategori: string
  deskripsi?: string
  isi?: string
  masuk?: string
  periode?: string
  pengajuan?: string
  tglDiajukan?: string
  status: StatusAduan
  tingkat?: string
  penanganan?: string
  tanggapan?: string
  tglTanggapan?: string
  oleh?: string
}

export type RiwayatImpor = {
  periode: string
  file: string
  pegawai: number
  error: number
  oleh: string
  durasi: string
  status: string
}

export type StatusImpor = {
  periode: string
  pegawai: number
  error: number
  waktu: string
}

export const REKAP_CUTI: {
  nip: string
  nama: string
  jenis: string
  mulai: string
  selesai: string
  durasi: string
}[] = []

export const hitungPresensi = (
  rOrHadir: BarisPresensi | any | number,
  hukumanOrTidakHadir?: Set<string> | number,
  hariKerjaArg?: number
) => {
  let hadir = 0
  let tidakHadir = 0
  let hariKerja = 22
  let nip = ""

  if (typeof rOrHadir === "object" && rOrHadir !== null) {
    hadir = Number(rOrHadir.hadir || 0)
    tidakHadir = Number(rOrHadir.tidakHadir || 0)
    hariKerja = Number(rOrHadir.hariKerja || 22)
    nip = rOrHadir.nip || ""
  } else {
    hadir = Number(rOrHadir || 0)
    tidakHadir = Number(hukumanOrTidakHadir || 0)
    hariKerja = Number(hariKerjaArg || 22)
  }

  const isHukdisAktif =
    hukumanOrTidakHadir instanceof Set ? hukumanOrTidakHadir.has(nip) : false

  const persenFisik = hariKerja > 0 ? (tidakHadir / hariKerja) * 100 : 0
  const remNol = persenFisik > 50
  const pot = remNol ? 100 : (rOrHadir as any)?.persenPotongan ?? (rOrHadir as any)?.pot ?? tidakHadir * 1.5
  const persenPotongan = pot

  let status = "Valid"
  if (remNol) status = "Kehadiran < 50%"
  else if (isHukdisAktif) status = "Hukdis Aktif"
  else if (pot > 0) status = "Ada Potongan"

  return {
    pot,
    status,
    persenFisik,
    remNol,
    persenPotongan,
    r: typeof rOrHadir === "object" ? rOrHadir : { hadir, tidakHadir, hariKerja, nip },
  }
}
