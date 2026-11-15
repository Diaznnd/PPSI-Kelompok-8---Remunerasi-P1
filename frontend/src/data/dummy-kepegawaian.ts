// Semua data di file ini DUMMY. Nanti ganti dengan panggilan api dari "@/lib/api".

export const kepeg = { nama: "Nurul Hidayati, S.Sos.", inisial: "NH", peran: "Bidang Kepegawaian • FTI", unit: "Fakultas Teknologi Informasi" }

export type JenisPegawai = "Dosen" | "Tenaga Kependidikan"
export type StatusPegawai = "PNS" | "CPNS" | "CPT-PTNBH"
export const JENIS_PEGAWAI: JenisPegawai[] = ["Dosen", "Tenaga Kependidikan"]
export const STATUS_PEGAWAI: [StatusPegawai, number][] = [["PNS", 100], ["CPNS", 80], ["CPT-PTNBH", 100]]
export const pengaliDari = (s: StatusPegawai) => STATUS_PEGAWAI.find(([k]) => k === s)?.[1] ?? 100
export const GOLONGAN = ["III/a", "III/b", "III/c", "III/d", "IV/a", "IV/b", "IV/c"]
export const JABATAN_MASTER = ["Asisten Ahli", "Lektor", "Lektor Kepala", "Guru Besar", "Pranata Komputer", "Pengelola Data dan Informasi", "Analis Kepegawaian Ahli Muda", "Teknisi Laboratorium"]
export const JENIS_USULAN = ["Promosi", "Kenaikan grade", "Mutasi jabatan"] as const
export const KATEGORI_ADU = ["Hasil perhitungan", "Presensi", "Pajak dan potongan", "Jabatan/grade", "Lainnya"]
export const TINGKAT_HUKUMAN = { Ringan: 0, Sedang: 25, Berat: 100 } as const
export type TingkatHukuman = keyof typeof TINGKAT_HUKUMAN
export const JENIS_HUKUMAN = ["Teguran lisan", "Teguran tertulis", "Pernyataan tidak puas secara tertulis", "Pemotongan tunjangan kinerja 25% selama 6 bulan", "Penundaan kenaikan pangkat"]

export const inisial = (nama: string) =>
  nama.split(" ").filter((w) => !w.includes(".")).map((w) => w.replace(/,/g, "")).slice(0, 2).map((w) => w[0]).join("").toUpperCase()

const iso = (y: number, m: number, d: number) => new Date(y, m - 1, d)
export const tglID = (isoStr: string) => {
  const [y, m, d] = isoStr.split("-").map(Number)
  return iso(y, m, d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
}
export const hariInklusif = (a: string, b: string) => {
  const [y1, m1, d1] = a.split("-").map(Number)
  const [y2, m2, d2] = b.split("-").map(Number)
  return Math.round((iso(y2, m2, d2).getTime() - iso(y1, m1, d1).getTime()) / 86400000) + 1
}

/* ---------------- Pegawai ---------------- */
export type PegawaiKep = {
  nip: string; nama: string; email: string; jenis: JenisPegawai; status: StatusPegawai
  golongan: string; jabatan: string; grade: number; tmt: string; aktif: boolean; alasanNonaktif?: string
}
const P = (nip: string, nama: string, email: string, jenis: JenisPegawai, status: StatusPegawai, golongan: string, jabatan: string, grade: number, aktif = true): PegawaiKep =>
  ({ nip, nama, email, jenis, status, golongan, jabatan, grade, tmt: "", aktif })
export const PEGAWAI_SEED: PegawaiKep[] = [
  P("198803122015042001", "Dr. Rina Maharani, M.T.", "rina.maharani@unand.ac.id", "Dosen", "PNS", "IV/a", "Lektor", 10),
  P("198710820160401002", "Andi Pratama, S.Kom.", "andi.pratama@unand.ac.id", "Tenaga Kependidikan", "PNS", "III/b", "Pranata Komputer", 8),
  P("198603131803022004", "Siti Rahmah, M.Kom.", "siti.rahmah@unand.ac.id", "Dosen", "PNS", "III/d", "Lektor", 10),
  P("198506202010121001", "Budi Santoso, M.T.", "budi.santoso@unand.ac.id", "Dosen", "PNS", "IV/a", "Lektor Kepala", 11),
  P("198907122015042001", "Sri Madona, S.Kom", "sri.madona@unand.ac.id", "Tenaga Kependidikan", "PNS", "III/a", "Pengelola Data dan Informasi", 6),
  P("198904062019071012", "Fikri Ananda, M.Kom.", "fikri.ananda@unand.ac.id", "Dosen", "PNS", "III/c", "Asisten Ahli", 9),
  P("199507212022032008", "Nadia Putri, S.Kom.", "nadia.putri@unand.ac.id", "Tenaga Kependidikan", "CPNS", "III/a", "Pranata Komputer", 8),
  P("198209102010011003", "Ricky Akbar, M.Kom.", "ricky.akbar@unand.ac.id", "Dosen", "CPT-PTNBH", "III/d", "Lektor", 10),
  P("199001152018022005", "Dewi Anggraini, S.Sos.", "dewi.anggraini@unand.ac.id", "Tenaga Kependidikan", "PNS", "III/c", "Analis Kepegawaian Ahli Muda", 8),
  { ...P("198412302009121004", "Hendro Wibowo, S.T.", "hendro.wibowo@unand.ac.id", "Dosen", "PNS", "III/d", "Lektor", 10, false), alasanNonaktif: "Mutasi keluar unit" },
]

/* ---------------- Usulan jabatan/grade ---------------- */
export type StatusUsulan = "Diajukan" | "Dikembalikan" | "Disetujui Verifikator" | "Ditetapkan"
export type JejakUsulan = { label: string; waktu: string; oleh: string; catatan?: string }
export type UsulanKep = {
  id: string; nip: string; nama: string
  lama: { jabatan: string; grade: number }; baru: { jabatan: string; grade: number }
  jenis: string; mulai: string; alasan: string; status: StatusUsulan
  sk: string; spmt: string; jejak: JejakUsulan[]; catatanKembali?: string
}
const NUR = "Nurul Hidayati (Bidang Kepegawaian)"
const RIZ = "Rizki Maulana (Verifikator)"
export const USULAN_SEED: UsulanKep[] = [
  { id: "USL-2026-031", nip: "198803122015042001", nama: "Dr. Rina Maharani, M.T.", lama: { jabatan: "Lektor", grade: 10 }, baru: { jabatan: "Lektor Kepala", grade: 11 },
    jenis: "Promosi", mulai: "1 September 2026", alasan: "Kenaikan jabatan fungsional berdasarkan SK Rektor Nomor 1482/UN16.R/KP/2026.", status: "Disetujui Verifikator",
    sk: "SK_Lektor_Kepala_Rina_Maharani.pdf", spmt: "SPMT_Rina_Maharani.pdf",
    jejak: [{ label: "Diajukan", waktu: "26 September 2026 pukul 08.30", oleh: NUR },
            { label: "Disetujui", waktu: "2 Oktober 2026 pukul 11.00", oleh: RIZ, catatan: "SK Kenaikan Jabatan Fungsional dan SPMT lengkap, tanggal mulai berlaku sesuai SK. Disetujui oleh Rizki Maulana pada 2 Oktober 2026." }] },
  { id: "USL-2026-036", nip: "198904062019071012", nama: "Fikri Ananda, M.Kom.", lama: { jabatan: "Asisten Ahli", grade: 9 }, baru: { jabatan: "Lektor", grade: 10 },
    jenis: "Promosi", mulai: "1 Oktober 2026", alasan: "Kenaikan jabatan fungsional dari Asisten Ahli ke Lektor.", status: "Dikembalikan",
    sk: "SK_Lektor_Fikri_Ananda.pdf", spmt: "SPMT_Fikri_Ananda.pdf",
    catatanKembali: "Tanggal mulai berlaku pada usulan (1 Oktober 2026) tidak sesuai SPMT yang terlampir (1 November 2026). Mohon sesuaikan tanggal lalu ajukan ulang.",
    jejak: [{ label: "Diajukan", waktu: "28 September 2026 pukul 10.15", oleh: NUR },
            { label: "Dikembalikan", waktu: "1 Oktober 2026 pukul 14.20", oleh: RIZ, catatan: "Tanggal mulai berlaku pada usulan (1 Oktober 2026) tidak sesuai SPMT yang terlampir (1 November 2026). Mohon sesuaikan tanggal lalu ajukan ulang." }] },
  { id: "USL-2026-039", nip: "199507212022032008", nama: "Nadia Putri, S.Kom.", lama: { jabatan: "Pranata Komputer", grade: 8 }, baru: { jabatan: "Pranata Komputer", grade: 9 },
    jenis: "Kenaikan grade", mulai: "1 November 2026", alasan: "Penyesuaian grade sesuai masa kerja dan angka kredit.", status: "Diajukan",
    sk: "SK_Grade_Nadia_Putri.pdf", spmt: "SPMT_Nadia_Putri.pdf", jejak: [{ label: "Diajukan", waktu: "10 Oktober 2026 pukul 09.45", oleh: NUR }] },
  { id: "USL-2026-034", nip: "198710820160401002", nama: "Andi Pratama, S.Kom.", lama: { jabatan: "Pranata Komputer", grade: 8 }, baru: { jabatan: "Pranata Komputer", grade: 9 },
    jenis: "Kenaikan grade", mulai: "1 September 2026", alasan: "Penyesuaian grade sesuai masa kerja dan angka kredit.", status: "Disetujui Verifikator",
    sk: "SK_Grade_Andi_Pratama.pdf", spmt: "SPMT_Andi_Pratama.pdf",
    jejak: [{ label: "Diajukan", waktu: "26 September 2026 pukul 08.50", oleh: NUR },
            { label: "Disetujui", waktu: "2 Oktober 2026 pukul 11.20", oleh: RIZ, catatan: "Dokumen lengkap dan sesuai." }] },
]

/* ---------------- Presensi ---------------- */
export type BarisPresensi = { nip: string; nama: string; hariKerja: number; hadir: number; tidakHadir: number; cuti: number }
export const PRESENSI_SEED: BarisPresensi[] = [
  { nip: "198803122015042001", nama: "Dr. Rina Maharani, M.T.", hariKerja: 22, hadir: 21, tidakHadir: 1, cuti: 0 },
  { nip: "198710820160401002", nama: "Andi Pratama, S.Kom.", hariKerja: 22, hadir: 22, tidakHadir: 0, cuti: 0 },
  { nip: "198603131803022004", nama: "Siti Rahmah, M.Kom.", hariKerja: 22, hadir: 9, tidakHadir: 13, cuti: 0 },
  { nip: "198506202010121001", nama: "Budi Santoso, M.T.", hariKerja: 22, hadir: 18, tidakHadir: 2, cuti: 2 },
  { nip: "198904062019071012", nama: "Fikri Ananda, M.Kom.", hariKerja: 22, hadir: 22, tidakHadir: 0, cuti: 0 },
  { nip: "199507212022032008", nama: "Nadia Putri, S.Kom.", hariKerja: 22, hadir: 20, tidakHadir: 0, cuti: 2 },
  { nip: "198209102010011003", nama: "Ricky Akbar, M.Kom.", hariKerja: 22, hadir: 22, tidakHadir: 0, cuti: 0 },
]
// Aturan (sesuai angka di mockup): tidak hadir > 50% hari kerja => tidak layak bayar; selain itu 1,5% per hari tidak hadir
export function hitungPresensi(r: BarisPresensi, nipHukumanAktif: Set<string>) {
  const persenTidak = (r.tidakHadir / r.hariKerja) * 100
  const nol = persenTidak > 50
  return { pot: nol ? persenTidak : r.tidakHadir * 1.5, status: nol ? "Tidak Layak Bayar" : nipHukumanAktif.has(r.nip) ? "Hukuman Aktif" : "Valid" }
}
export const REKAP_CUTI = [
  { nip: "198803122015042001", nama: "Dr. Rina Maharani, M.T.", jenis: "Cuti Tahunan", mulai: "13 Oktober 2026", selesai: "15 Oktober 2026", durasi: "2 hari" },
  { nip: "198710820160401002", nama: "Andi Pratama, S.Kom.", jenis: "Cuti Tahunan", mulai: "13 Oktober 2026", selesai: "15 Oktober 2026", durasi: "2 hari" },
  { nip: "198603131803022004", nama: "Siti Rahmah, M.Kom.", jenis: "Izin Sakit", mulai: "13 Oktober 2026", selesai: "15 Oktober 2026", durasi: "2 hari" },
  { nip: "198506202010121001", nama: "Budi Santoso, M.T.", jenis: "Izin Sakit", mulai: "13 Oktober 2026", selesai: "15 Oktober 2026", durasi: "2 hari" },
]
export type RiwayatImpor = { periode: string; file: string; pegawai: number; error: number; oleh: string; durasi: string; status: string }
export type StatusImpor = { periode: string; pegawai: number; error: number; waktu: string }
export const IMPOR_SEED: RiwayatImpor[] = [
  { periode: "Oktober 2026", file: "presensi_okt2026.xlsx", pegawai: 84, error: 0, oleh: "Rini Hartati", durasi: "2 detik", status: "Berhasil" },
  { periode: "September 2026", file: "presensi_sep2026.xlsx", pegawai: 83, error: 2, oleh: "Rini Hartati", durasi: "2 detik", status: "Berhasil" },
]
export const STATUS_IMPOR_SEED: StatusImpor = { periode: "Oktober 2026", pegawai: 84, error: 0, waktu: "20 Okt 2026, 09:14 WIB" }

/* ---------------- Hukuman disiplin ---------------- */
export type Hukuman = { id: string; nip: string; nama: string; tingkat: TingkatHukuman; jenis: string; sk: string; mulai: string; berakhir: string; uraian: string }
export const HUKUMAN_SEED: Hukuman[] = [
  { id: "HKD-2026-004", nip: "198506202010121001", nama: "Budi Santoso, M.T.", tingkat: "Sedang", jenis: "Pemotongan tunjangan kinerja 25% selama 6 bulan", sk: "0731/UN16.R/KP/2026", mulai: "2026-08-01", berakhir: "2027-01-31", uraian: "Tidak masuk kerja tanpa alasan sah secara kumulatif 12 hari dalam satu tahun." },
  { id: "HKD-2025-002", nip: "198710820160401002", nama: "Andi Pratama, S.Kom.", tingkat: "Ringan", jenis: "Teguran tertulis", sk: "1280/UN16.R/KP/2025", mulai: "2025-11-01", berakhir: "2026-04-30", uraian: "Terlambat masuk kerja berulang pada triwulan terakhir 2025." },
]
export type StatusHukuman = "Aktif" | "Akan berlaku" | "Berakhir"
const dua = (n: number) => String(n).padStart(2, "0")
export const hariIni = () => { const d = new Date(); return `${d.getFullYear()}-${dua(d.getMonth() + 1)}-${dua(d.getDate())}` }
export const statusHukuman = (h: Hukuman): StatusHukuman => { const t = hariIni(); return t < h.mulai ? "Akan berlaku" : t > h.berakhir ? "Berakhir" : "Aktif" }
export const progresHukuman = (h: Hukuman) => {
  const total = hariInklusif(h.mulai, h.berakhir), lewat = hariInklusif(h.mulai, hariIni())
  return Math.max(0, Math.min(1, lewat / total))
}

/* ---------------- Pengaduan ---------------- */
export type StatusAduan = "Diajukan" | "Diteruskan" | "Selesai"
export type AduanKep = {
  id: string; nip: string; nama: string; kategori: string; masuk: string; periode: string; pengajuan: string
  isi: string; status: StatusAduan; penanganan: string; tanggapan?: string
}
export const ADUAN_SEED: AduanKep[] = [
  { id: "ADU-2026-017", nip: "198506202010121001", nama: "Budi Santoso, M.T.", kategori: "Hasil perhitungan", masuk: "21 Oktober 2026", periode: "September 2026", pengajuan: "P1-2026-09-FTI-018", status: "Diajukan", penanganan: "Menunggu diagnosis",
    isi: "P1 September saya masih dipotong 25% karena hukuman disiplin. Seingat saya masa hukuman sudah selesai akhir Agustus 2026." },
  { id: "ADU-2026-016", nip: "198710820160401002", nama: "Andi Pratama, S.Kom.", kategori: "Presensi", masuk: "20 Oktober 2026", periode: "September 2026", pengajuan: "P1-2026-09-FTI-018", status: "Diajukan", penanganan: "Menunggu diagnosis",
    isi: "Saya tercatat tidak hadir 2 hari padahal sedang menjalankan tugas kedinasan." },
  { id: "ADU-2026-015", nip: "198904062019071012", nama: "Fikri Ananda, M.Kom.", kategori: "Pajak dan potongan", masuk: "17 Oktober 2026", periode: "September 2026", pengajuan: "P1-2026-09-FTI-018", status: "Diteruskan", penanganan: "Diteruskan ke UPT Remunerasi",
    isi: "PPh 21 pada slip terasa lebih besar dari bulan sebelumnya.", tanggapan: "Perhitungan pajak ditetapkan UPT Remunerasi; pengaduan Anda telah diteruskan." },
  { id: "ADU-2026-014", nip: "198603131803022004", nama: "Siti Rahmah, M.Kom.", kategori: "Hasil perhitungan", masuk: "15 Oktober 2026", periode: "September 2026", pengajuan: "P1-2026-09-FTI-018", status: "Diteruskan", penanganan: "Diteruskan ke UPT Remunerasi",
    isi: "P1 saya tertulis Rp 0, mohon dicek kembali.", tanggapan: "Diteruskan ke UPT Remunerasi untuk verifikasi ketentuan tidak layak bayar." },
  { id: "ADU-2026-012", nip: "199507212022032008", nama: "Nadia Putri, S.Kom.", kategori: "Presensi", masuk: "10 Oktober 2026", periode: "September 2026", pengajuan: "P1-2026-09-FTI-018", status: "Selesai", penanganan: "Diselesaikan di unit",
    isi: "Cuti tahunan 13–15 Oktober belum tercatat di rekap.", tanggapan: "Data cuti telah diperbaiki pada rekap presensi periode ini." },
]
