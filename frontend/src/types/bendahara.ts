export const PIR = 3000
export const PERSEN_P1 = 40
export const TARIF = [0.25, 0.5, 1, 1.5, 2, 2.5]

export const GRADE_PARAM: [string, number][] = [
  ["Grade 17", 21540000],
  ["Grade 16 WR1", 16134000],
  ["Grade 16 WR2", 16254000],
  ["Grade 16 WR3, WR4", 16065000],
  ["Grade 15", 13455000],
  ["Grade 14", 10869000],
  ["Grade 13", 9054000],
  ["Grade 12 CG", 7542000],
  ["Grade 12", 7245000],
  ["Grade 11 Dosen", 6285000],
  ["Grade 11", 6282000],
  ["Grade 10", 5232000],
  ["Grade 9 CG", 4575000],
  ["Grade 9", 4359000],
  ["Grade 8 / 8-S (Kasubbag)", 3936000],
  ["Grade 7", 3570000],
  ["Grade 6", 2991000],
  ["Grade 5", 2709000],
  ["Grade 3", 2430000],
]

export const TL_TIER = [
  ["TL.1", "0–60", "0,25%"],
  ["TL.2", "61–75", "0,5%"],
  ["TL.3", "76–90", "1%"],
  ["TL.4", "91–105", "1,5%"],
  ["TL.5", "106–120", "2%"],
  ["TL.6", "121–240", "2,5%"],
]

export const CUTI_TARIF: [string, string][] = [
  ["Cuti Sakit", "1% per hari"],
  ["Cuti Bersalin anak ke-1 dan ke-2", "1% per hari"],
  ["Cuti Bersalin anak ke-3", "2% per hari"],
  ["Cuti Bersalin anak ke-4 dan seterusnya", "3% per hari"],
  ["Cuti Karena Alasan Penting", "3% per hari"],
  ["Cuti Besar", "1,5% per hari"],
  ["Tidak Hadir Tanpa Keterangan (Alfa)", "5% per hari"],
  ["Cuti Tahunan", "0% per hari"],
]

export type Presensi = {
  hariKerja: number
  tl: number[]
  psw: number[]
  sakit: number
  bersalin12: number
  bersalin3: number
  bersalin4: number
  penting: number
  besar: number
  alfa: number
}

export type PegawaiP1 = {
  nip: string
  nama: string
  pangkat: string
  jabatan: string
  grade: string | number
  isKasubbag?: boolean
  nilaiJabatan: number
  pengali: number
  pengali_status?: string
  hukdis: number
  pajak: number
  tarifPajakPersen?: number
  npwp: string
  presensi: Presensi
  remGrade?: number
  p1?: number
  remP1?: number
  totalPersen?: number
  persenPotongHadir?: number
  penguranganHadirRp?: number
  isCpns?: boolean
  cpnsPersen?: number
  cpnsRp?: number
  isTubel?: boolean
  tubelPersen?: number
  tubelRp?: number
  skpNilai?: number
  skpCapaian?: number
  skpPenguranganRp?: number
  pengurangan?: number
  potongDisiplin?: number
  bruto?: number
  netto?: number
  remNol?: boolean
  alasan_nol?: string | null
  rincianPotongan?: any
}

export type Riwayat = {
  ke: number
  diajukan: string
  keputusan: "Dikembalikan" | "Disetujui"
  tglKeputusan: string
  catatan: string
}

export type Amprah = {
  id: string
  periode: string
  nomor: string
  kelompok: string
  jumlah: number
  netto: number
  terbit: string
  tersedia: boolean
}

export const persenStr = (n: number) =>
  (Math.round(n * 100) / 100).toString().replace(".", ",") + "%"

export function hitung(p: PegawaiP1) {
  const pr = p.presensi
  const isKasubbag =
    p.isKasubbag ||
    p.grade === "8-S" ||
    p.jabatan.toLowerCase().includes("subbagian") ||
    p.jabatan.toLowerCase().includes("kasubbag")
  const remGrade = isKasubbag
    ? 3936000
    : p.nilaiJabatan >= 50000
    ? p.nilaiJabatan
    : p.nilaiJabatan * PIR
  const p1 = Math.round((remGrade * PERSEN_P1) / 100)

  const fisik =
    pr.sakit +
    pr.bersalin12 +
    pr.bersalin3 +
    pr.bersalin4 +
    pr.penting +
    pr.besar +
    pr.alfa
  const persenFisik = pr.hariKerja > 0 ? (fisik / pr.hariKerja) * 100 : 0
  const remNol = persenFisik > 50

  const persenTL = pr.tl.reduce((s, n, i) => s + n * TARIF[i], 0)
  const persenPSW = pr.psw.reduce((s, n, i) => s + n * TARIF[i], 0)
  const persenCuti =
    pr.sakit * 1.0 +
    pr.bersalin12 * 1.0 +
    pr.bersalin3 * 2.0 +
    pr.bersalin4 * 3.0 +
    pr.penting * 3.0 +
    pr.besar * 1.5 +
    pr.alfa * 5.0
  const persenHadir = persenTL + persenPSW + persenCuti

  const isCpns = p.isCpns || p.pengali === 80
  const cpnsPersen = isCpns ? 20 : 0
  const cpnsRp = Math.round((p1 * cpnsPersen) / 100)

  const isTubel =
    p.isTubel ||
    p.pengali === 75 ||
    p.jabatan.toLowerCase().includes("tugas belajar")
  const tubelPersen = isTubel ? 25 : 0
  const tubelRp = Math.round((p1 * tubelPersen) / 100)

  const skpNilai = p.skpNilai ?? 100
  let skpCapaian = 100
  if (skpNilai >= 90) skpCapaian = 100
  else if (skpNilai >= 85) skpCapaian = 95
  else if (skpNilai >= 80) skpCapaian = 90
  else if (skpNilai >= 75) skpCapaian = 85
  else if (skpNilai >= 70) skpCapaian = 80
  else if (skpNilai >= 65) skpCapaian = 75
  else if (skpNilai >= 60) skpCapaian = 70
  else if (skpNilai >= 55) skpCapaian = 65
  else if (skpNilai >= 50) skpCapaian = 50
  else skpCapaian = 0

  const skpPenguranganRp = Math.round((p1 * (100 - skpCapaian)) / 100)
  const penguranganHadirRp = remNol ? p1 : Math.round((p1 * persenHadir) / 100)
  const potongDisiplin = remNol ? 0 : Math.round((p1 * p.hukdis) / 100)

  const totalPengurangan = remNol
    ? p1
    : penguranganHadirRp + cpnsRp + tubelRp + potongDisiplin + skpPenguranganRp
  const bruto = Math.max(0, p1 - totalPengurangan)

  let tarifPajakPersen = p.tarifPajakPersen ?? 5
  if (p.pangkat.includes("IV/") || p.pangkat.includes("Pembina")) {
    tarifPajakPersen = 15
  } else if (p.pangkat.includes("III/") || p.pangkat.includes("Penata")) {
    tarifPajakPersen = 5
  } else if (p.pangkat.includes("II/") || p.pangkat.includes("Pengatur")) {
    tarifPajakPersen = 5
  } else if (p.pangkat.includes("I/") || p.pangkat.includes("Juru")) {
    tarifPajakPersen = 0
  }
  const pajak = Math.round((bruto * tarifPajakPersen) / 100)
  const netto = Math.max(0, bruto - pajak)

  return {
    remGrade,
    p1,
    remP1: p1,
    totalPersen: remNol
      ? persenFisik
      : persenHadir + cpnsPersen + tubelPersen + p.hukdis + (100 - skpCapaian),
    persenPotongHadir: persenHadir,
    penguranganHadirRp,
    isCpns,
    cpnsPersen,
    cpnsRp,
    isTubel,
    tubelPersen,
    tubelRp,
    skpNilai,
    skpCapaian,
    skpPenguranganRp,
    pengurangan: totalPengurangan,
    potongDisiplin,
    bruto,
    tarifPajakPersen,
    pajak,
    netto,
    remNol,
    alasanNol: remNol
      ? `Ketidakhadiran fisik di atas 50% hari kerja (${Math.round(persenFisik)}%)`
      : null,
  }
}
