// Semua data di file ini DUMMY. Nanti ganti dengan panggilan api dari "@/lib/api".

export const bendahara = { nama: "Maya Sari, S.E.", inisial: "Ma", unit: "Fakultas Teknologi Informasi" }

export const PIR = 3000
export const PERSEN_P1 = 40
export const TARIF = [0.25, 0.5, 1, 1.5, 2, 2.5]

export const PERIODE_STATUS = ["September 2026", "Agustus 2026"]
export const PERIODE_REKAP = ["Oktober 2026", "September 2026", "Agustus 2026"]

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
  grade: number
  nilaiJabatan: number
  pengali: number // %
  hukdis: number // % pemotongan hukuman disiplin
  pajak: number
  npwp: string
  presensi: Presensi
}

const nol = (): Presensi => ({ hariKerja: 22, tl: [0, 0, 0, 0, 0, 0], psw: [0, 0, 0, 0, 0, 0], sakit: 0, bersalin12: 0, bersalin3: 0, bersalin4: 0, penting: 0, besar: 0, alfa: 0 })

const mk = (nip: string, nama: string, pangkat: string, jabatan: string, grade: number, nilaiJabatan: number, pengali: number, hukdis: number, pajak: number, npwp: string, ubah: Partial<Presensi> = {}): PegawaiP1 => ({
  nip, nama, pangkat, jabatan, grade, nilaiJabatan, pengali, hukdis, pajak, npwp, presensi: { ...nol(), ...ubah },
})

export const PEGAWAI_AWAL: PegawaiP1[] = [
  mk("198803122015042001", "Dr. Rina Maharani, M.T.", "Penata Tk. I III/d", "Lektor Kepala", 11, 2095, 100, 0, 150000, "09.876.543.2-201.000", { sakit: 1 }),
  mk("199001012020011001", "Andi Prasetyo, A.Md", "Pengatur II/c", "Teknisi Laboratorium FTI", 5, 903, 100, 0, 0, "12.345.678.9-201.000", { tl: [0, 1, 0, 0, 0, 0] }),
  mk("199202022021022002", "Citra Lestari, S.Kom", "Penata Tk. I III/d", "Pengolah Data dan Informasi", 6, 997, 100, 0, 0, "23.456.789.0-201.000", { alfa: 10, sakit: 2 }),
  mk("199103032022031003", "Budi Santoso, A.Md", "Pengatur II/c", "Teknisi Laboratorium", 5, 903, 80, 0, 0, "34.567.890.1-201.000", { tl: [0, 0, 0, 0, 1, 0] }),
  mk("198404042020042004", "Sari Maharani, S.Kom", "Pengatur Muda II/a", "Pengolah Data dan Informasi", 6, 997, 80, 0, 47475, "45.678.901.2-201.000"),
  mk("199005052023051005", "Dimas Kurnia, S.Kom", "Penata Tk. I III/d", "Pranata Komputer", 7, 1190, 60, 0, 0, "56.789.012.3-201.000"),
  mk("199606062019061006", "Nadia Permata, A.Md", "Penata Tk. I III/d", "Teknisi Laboratorium", 6, 997, 100, 25, 0, "67.890.123.4-201.000"),
]

export function hitung(p: PegawaiP1) {
  const pr = p.presensi
  const remGrade = p.nilaiJabatan * PIR
  const p1 = (remGrade * PERSEN_P1) / 100
  const base = Math.round((p1 * p.pengali) / 100)
  const fisik = pr.sakit + pr.bersalin12 + pr.bersalin3 + pr.bersalin4 + pr.penting + pr.besar + pr.alfa
  const persenFisik = (fisik / pr.hariKerja) * 100
  const remNol = persenFisik > 50
  const persen =
    pr.tl.reduce((s, n, i) => s + n * TARIF[i], 0) +
    pr.psw.reduce((s, n, i) => s + n * TARIF[i], 0) +
    pr.sakit + pr.bersalin12 + pr.bersalin3 * 2 + pr.bersalin4 * 3 + pr.penting * 3 + pr.besar * 1.5 + pr.alfa * 5
  const remP1 = remNol ? 0 : base
  const pengurangan = remNol ? 0 : Math.round((base * persen) / 100)
  const potongDisiplin = remNol ? 0 : Math.round((base * p.hukdis) / 100)
  const bruto = remP1 - pengurangan - potongDisiplin
  return { remGrade, p1, remP1, totalPersen: remNol ? persenFisik : persen, pengurangan, potongDisiplin, bruto, netto: bruto - p.pajak, remNol }
}

export const persenStr = (n: number) => (Math.round(n * 100) / 100).toString().replace(".", ",") + "%"

// Total seluruh unit (245 pegawai) — tabel hanya menampilkan 7 pegawai contoh
export const RINGKASAN = {
  pegawai: 245, remP1: 1164800000, pengurangan: 36350000, bruto: 1128450000, pajak: 101560500, netto: 1026889500,
  nolCount: 4, disiplinCount: 2, fisik50: 1,
}

export const GRADE_PARAM: [string, number][] = [
  ["Grade 3", 2430000], ["Grade 5", 2709000], ["Grade 6", 2991000], ["Grade 7", 3570000], ["Grade 8", 3936000], ["Grade 9", 4359000],
  ["Grade 10", 5232000], ["Grade 11", 6285000], ["Grade 12", 7245000], ["Grade 13", 9054000], ["Grade 14", 10869000],
]
export const TL_TIER = [
  ["TL.1", "0–60", "0,25%"], ["TL.2", "61–75", "0,5%"], ["TL.3", "76–90", "1%"],
  ["TL.4", "91–105", "1,5%"], ["TL.5", "106–120", "2%"], ["TL.6", "121–240", "2,5%"],
]
export const CUTI_TARIF: [string, string][] = [
  ["Cuti Sakit", "1% per hari"], ["Cuti Bersalin anak ke-1 dan ke-2", "1% per hari"],
  ["Cuti Bersalin anak ke-3", "2% per hari"], ["Cuti Bersalin anak ke-4 dan seterusnya", "3% per hari"],
  ["Cuti Karena Alasan Penting", "3% per hari"], ["Cuti Besar", "1,5% per hari"],
  ["Tidak Hadir Tanpa Keterangan (Alfa)", "5% per hari"], ["Cuti Tahunan", "0% per hari"],
]

export type Riwayat = { ke: number; diajukan: string; keputusan: "Dikembalikan" | "Disetujui"; tglKeputusan: string; catatan: string }
export const STATUS_PERIODE: Record<string, { done: number; dikembalikan: boolean; riwayat: Riwayat[] }> = {
  "September 2026": {
    done: 2, dikembalikan: true,
    riwayat: [{ ke: 1, diajukan: "6 Oktober 2026, 09.12", keputusan: "Dikembalikan", tglKeputusan: "7 Oktober 2026, 15.22", catatan: "Presensi Citra Lestari, S.Kom belum sesuai dengan rekap Bidang Kepegawaian. Mohon dikoreksi lalu ajukan kembali." }],
  },
  "Agustus 2026": {
    done: 4, dikembalikan: false,
    riwayat: [
      { ke: 1, diajukan: "6 Oktober 2026, 09.12", keputusan: "Dikembalikan", tglKeputusan: "7 Oktober 2026, 15.22", catatan: "Presensi Citra Lestari, S.Kom belum sesuai dengan rekap Bidang Kepegawaian. Mohon dikoreksi lalu ajukan kembali." },
      { ke: 2, diajukan: "8 Oktober 2026, 10.15", keputusan: "Disetujui", tglKeputusan: "9 Oktober 2026, 14.25", catatan: "Data telah sesuai." },
    ],
  },
}

export type Amprah = { id: string; periode: string; nomor: string; kelompok: string; jumlah: number; netto: number; terbit: string; tersedia: boolean }
export const DAFTAR_AMPRAH: Amprah[] = [
  { id: "AMP202610000123", periode: "Oktober 2026", nomor: "AMP202610000123", kelompok: "Pejabat Pengelola dan PNS", jumlah: 198, netto: 846889500, terbit: "10 November 2026", tersedia: true },
  { id: "AMP202610000124", periode: "Oktober 2026", nomor: "AMP202610000124", kelompok: "CPNS dan CPT-PTNBH", jumlah: 39, netto: 142500000, terbit: "10 November 2026", tersedia: true },
  { id: "AMP202610000125", periode: "Oktober 2026", nomor: "AMP202610000125", kelompok: "Tugas Belajar", jumlah: 8, netto: 37500000, terbit: "10 November 2026", tersedia: true },
  { id: "menunggu", periode: "Oktober 2026", nomor: "—", kelompok: "Pejabat Pengelola dan PNS", jumlah: 0, netto: 0, terbit: "—", tersedia: false },
]

export const BULAN_BRUTO: [string, number][] = [
  ["Jan", 1020], ["Feb", 1050], ["Mar", 1075], ["Apr", 1090], ["Mei", 1115],
  ["Jun", 1100], ["Jul", 1140], ["Agu", 1150], ["Sep", 1120], ["Okt", 1128.45],
]
export const KOMPOSISI = [
  { label: "Ketidakhadiran", persen: 52, warna: "#14532d" },
  { label: "Keterlambatan", persen: 21, warna: "#2e8b57" },
  { label: "Pulang Sebelum Waktunya", persen: 9, warna: "#8fc1a3" },
  { label: "Disiplin", persen: 18, warna: "#d9701c" },
]
