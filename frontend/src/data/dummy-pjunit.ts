// Semua data di file ini DUMMY. Nanti ganti dengan panggilan api dari "@/lib/api".

export const pjUnit = { nama: "Dr. Andri Saputra", inisial: "Dr", unit: "Fakultas Teknologi Informasi" }

export type PegawaiUnit = { no: number; nip: string; nama: string; pangkat: string; jabatan: string; grade: number; status: string; sejak: string; aktif: boolean }

const SEJAK = ["1 Oktober 2023", "1 Januari 2024", "1 Oktober 2025", "1 Januari 2026"]
const nipDummy = (i: number) =>
  `${1980 + (i % 20)}${String((i % 12) + 1).padStart(2, "0")}${String((i % 27) + 1).padStart(2, "0")}${2015 + (i % 9)}${String((i % 12) + 1).padStart(2, "0")}${1 + (i % 2)}${String(i + 1).padStart(3, "0")}`

// [nama, jabatan, grade, status kepegawaian, pangkat?, nip?]
const RAW: [string, string, number, string, string?, string?][] = [
  ["Dr. Rina Maharani, M.T.", "Lektor Kepala", 11, "PNS", undefined, "198803122015042001"],
  ["Andi Prasetyo, A.Md", "Teknisi Laboratorium FTI", 5, "PNS", "Pengatur II/c", "199001012020011001"],
  ["Sari Maharani, S.Kom", "Pengolah Data dan Informasi", 6, "CPT-PTNBH", "Pengatur Muda II/a", "198404042020042004"],
  ["Budi Santoso, A.Md", "Teknisi Laboratorium", 5, "CPNS", "Pengatur II/c", "199103032021031003"],
  ["Citra Lestari, S.Kom", "Pengolah Data dan Informasi", 6, "PNS", undefined, "199202022021022002"],
  ["Dimas Kurnia, S.Kom", "Pranata Komputer", 7, "Tugas Belajar", undefined, "199005052023051005"],
  ["Nadia Permata, A.Md", "Teknisi Laboratorium", 6, "PNS", undefined, "199606062019061006"],
  ["Dewi Lestari, M.Kom", "Lektor", 10, "Tugas Belajar"],
  ["Yusuf Maulana, S.T.", "Pranata Komputer Ahli Muda", 11, "CPNS"],
  ["Fitri Handayani, M.T.", "Asisten Ahli", 12, "PNS"],
  ["Riko Saputra, S.Kom", "Lektor", 13, "PNS"],
  ["Maya Puspita, M.Kom", "Lektor", 14, "PNS"],
  ["Dedi Irawan, S.T.", "Pranata Komputer Ahli Muda", 3, "CPT-PTNBH"],
  ["Dr. Laila Rahmi, M.Eng.", "Lektor", 4, "PNS"],
  ["Arif Nugroho, S.Kom.", "Lektor", 5, "Tugas Belajar"],
  ["Dina Oktaviani, M.T.", "Asisten Ahli", 6, "PNS"],
  ["Fajar Ramadhan, S.T.", "Pranata Komputer Ahli Muda", 7, "CPNS"],
  ["Nurul Aini, S.Kom.", "Lektor", 8, "PNS"],
  ["Hendra Wijaya, M.Kom.", "Asisten Ahli", 9, "CPT-PTNBH"],
  ["Rani Amelia, S.T.", "Lektor", 10, "PNS"],
  ["Taufik Akbar, M.T.", "Pranata Komputer Ahli Muda", 11, "PNS"],
  ["Vina Yolanda, S.Kom.", "Asisten Ahli", 12, "Tugas Belajar"],
  ["Agus Salim, S.T.", "Lektor", 13, "PNS"],
  ["Putri Ananda, M.Kom.", "Lektor", 14, "PNS"],
  ["Eko Setiawan, S.Kom.", "Pranata Komputer Ahli Muda", 3, "CPNS"],
  ["Laras Widyaningrum, S.T.", "Lektor", 4, "PNS"],
  ["Gilang Purnama, A.Md", "Lektor", 5, "PNS"],
]

export const PEGAWAI_UNIT: PegawaiUnit[] = RAW.map(([nama, jabatan, grade, status, pangkat, nip], i) => ({
  no: i + 1,
  nip: nip ?? nipDummy(i),
  nama,
  pangkat: pangkat ?? "Penata Tk. I III/d",
  jabatan,
  grade,
  status,
  sejak: SEJAK[i % 4],
  aktif: i !== 19, // pegawai ke-20 tidak aktif
}))

export type RiwayatUnit = { periode: string; status: "Diverifikasi" | "Disetujui"; diajukan: string; keputusan: string; kembali: number; catatan: string; terkini: string }
export const RIWAYAT_UNIT: RiwayatUnit[] = [
  { periode: "Oktober 2026", status: "Diverifikasi", diajukan: "6 Oktober 2026", keputusan: "8 Oktober 2026", kembali: 0, catatan: "", terkini: "Diverifikasi • 8 Oktober 2026, 14.20 WIB" },
  { periode: "Agustus 2026", status: "Disetujui", diajukan: "5 September 2026", keputusan: "7 September 2026", kembali: 0, catatan: "", terkini: "Disetujui • 7 September 2026, 10.05 WIB" },
  { periode: "Juli 2026", status: "Disetujui", diajukan: "5 Agustus 2026", keputusan: "6 Agustus 2026", kembali: 1, catatan: "Presensi satu pegawai belum sesuai dengan rekap Bidang Kepegawaian. Bendahara memperbaiki dan mengajukan ulang.", terkini: "Disetujui • 6 Agustus 2026, 16.40 WIB" },
]
