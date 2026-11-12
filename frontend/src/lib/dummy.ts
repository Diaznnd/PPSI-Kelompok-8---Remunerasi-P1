// ============================================================
// DUMMY DATA — ganti dengan real API call saat backend siap
// ============================================================

export type StatusPengaduan = "Diajukan" | "Dibahas" | "Ditindaklanjuti" | "Selesai"
export type KategoriPengaduan =
  | "Hasil perhitungan P1"
  | "Data presensi atau kehadiran"
  | "Perubahan jabatan atau grade belum sesuai"
  | "Lainnya"

// ---- AKUN & PEGAWAI ----------------------------------------

export const dummyAkun = {
  id: 1,
  username: "rina.maharani@unand.ac.id",
  peran: "pegawai" as const,
}

export const dummyPegawai = {
  namaLengkap: "Dr. Rina Maharani, M.T.",
  nip: "196803122015042001",
  jabatan: "Dosen",
  jabatanFungsional: "Lektor Kepala",
  fakultas: "Fakultas Teknologi Informasi",
  grade: 11,
  pangkatGolongan: "Penata Tk.I III/d",
  npwp: "09.876.543.2-001.000",
  rekening: "BRI •••• 5076",
  nipAtasan: "196501011990031001",
}

// ---- PERIODE -----------------------------------------------

export const dummyPeriode = ["Oktober 2026", "September 2026", "Agustus 2026", "Juli 2026"]
export const dummyPeriodeAktif = "Oktober 2026"
export const dummyHariTersisa = 12

// ---- SLIP P1 -----------------------------------------------

export type RincianKehadiran = {
  komponen: string
  jumlah: string
  tarif: string
  potonganP1: string
}

export type Slip = {
  periode: string
  status: "lunas" | "belum lunas" | "proses"
  jumlahPoin: number
  nilaiPerPoin: number
  totalHonorarium: number
  rincianKehadiran: RincianKehadiran[]
  totalPotonganKehadiran: number
  honorariumSetelahPotongan: number
  pph21Persen: number
  pph21Nominal: number
  totalPotonganLain: number
  jumlahNeto: number
  nipSlip: string
}

export const dummySlip: Record<string, Slip> = {
  "Oktober 2026": {
    periode: "Oktober 2026",
    status: "lunas",
    jumlahPoin: 1375,
    nilaiPerPoin: 18000,
    totalHonorarium: 24750000,
    rincianKehadiran: [
      { komponen: "Izin",                              jumlah: "1 hari", tarif: "2%",   potonganP1: "Rp 495.000" },
      { komponen: "Izin sakit",                        jumlah: "0 hari", tarif: "2%",   potonganP1: "Rp 0" },
      { komponen: "Hari libur/tanggal merah",          jumlah: "0 hari", tarif: "0%",   potonganP1: "Rp 0" },
      { komponen: "Dinas luar",                        jumlah: "2 hari", tarif: "0%",   potonganP1: "Rp 0" },
      { komponen: "Terlambat hadir (terlambat masuk)", jumlah: "1 kali", tarif: "0,5%", potonganP1: "Rp 123.750" },
      { komponen: "Pulang sebelum waktunya",           jumlah: "0 kali", tarif: "0,5%", potonganP1: "Rp 0" },
      { komponen: "Tidak hadir tanpa keterangan",      jumlah: "0 hari", tarif: "3%",   potonganP1: "Rp 0" },
      { komponen: "DLT (Di Luar Tugas)",               jumlah: "0 hari", tarif: "2%",   potonganP1: "Rp 0" },
      { komponen: "Penilaian kinerja SIPAn",           jumlah: "2 kali", tarif: "2%",   potonganP1: "Rp 495.000" },
      { komponen: "Capaian kinerja ≥ 80%",             jumlah: "1 kali", tarif: "0%",   potonganP1: "Rp 0" },
      { komponen: "Pelanggaran disiplin ringan",       jumlah: "0",       tarif: "5%",   potonganP1: "Rp 0" },
      { komponen: "Tanggung jawab Pemengang Jabatan",  jumlah: "11 bln",  tarif: "0%",   potonganP1: "Rp 0" },
      { komponen: "Pengurangan lain-lain",             jumlah: "—",       tarif: "—",    potonganP1: "Rp 0" },
      { komponen: "Total Potongan Penilaian Kehadiran",jumlah: "",        tarif: "",     potonganP1: "Rp 1.113.750" },
    ],
    totalPotonganKehadiran: 1113750,
    honorariumSetelahPotongan: 23636250,
    pph21Persen: 5,
    pph21Nominal: 1181813,
    totalPotonganLain: 0,
    jumlahNeto: 2338860,
    nipSlip: "SLIP-P1-FTI-20261022001",
  },
  "September 2026": {
    periode: "September 2026",
    status: "lunas",
    jumlahPoin: 1350,
    nilaiPerPoin: 18000,
    totalHonorarium: 24300000,
    rincianKehadiran: [
      { komponen: "Izin",                              jumlah: "0 hari", tarif: "2%",   potonganP1: "Rp 0" },
      { komponen: "Izin sakit",                        jumlah: "1 hari", tarif: "2%",   potonganP1: "Rp 486.000" },
      { komponen: "Hari libur/tanggal merah",          jumlah: "0 hari", tarif: "0%",   potonganP1: "Rp 0" },
      { komponen: "Dinas luar",                        jumlah: "1 hari", tarif: "0%",   potonganP1: "Rp 0" },
      { komponen: "Terlambat hadir (terlambat masuk)", jumlah: "0 kali", tarif: "0,5%", potonganP1: "Rp 0" },
      { komponen: "Pulang sebelum waktunya",           jumlah: "0 kali", tarif: "0,5%", potonganP1: "Rp 0" },
      { komponen: "Tidak hadir tanpa keterangan",      jumlah: "0 hari", tarif: "3%",   potonganP1: "Rp 0" },
      { komponen: "DLT (Di Luar Tugas)",               jumlah: "0 hari", tarif: "2%",   potonganP1: "Rp 0" },
      { komponen: "Penilaian kinerja SIPAn",           jumlah: "1 kali", tarif: "2%",   potonganP1: "Rp 243.000" },
      { komponen: "Total Potongan Penilaian Kehadiran",jumlah: "",        tarif: "",     potonganP1: "Rp 729.000" },
    ],
    totalPotonganKehadiran: 729000,
    honorariumSetelahPotongan: 23571000,
    pph21Persen: 5,
    pph21Nominal: 1178550,
    totalPotonganLain: 0,
    jumlahNeto: 4567890,
    nipSlip: "SLIP-P1-FTI-20260922001",
  },
}

// ---- PENGADUAN ---------------------------------------------

export type LinimasaStep = {
  label: string
  subjudul?: string
  tanggal?: string
  selesai: boolean
}

export type PesanPengaduan = {
  pengirim: "anda" | "verifikator" | "sistem"
  namaPengirim: string
  inisial: string
  waktu: string
  pesan: string
  lampiran?: string
}

export type Pengaduan = {
  id: string
  tanggal: string
  kategori: KategoriPengaduan
  periode: string
  status: StatusPengaduan
  judul: string
  uraian: string
  linimasa: LinimasaStep[]
  pesan: PesanPengaduan[]
}

export const dummyPengaduan: Pengaduan[] = [
  {
    id: "UA-FTI-2026-0012",
    tanggal: "22 Oktober 2026",
    kategori: "Perubahan jabatan atau grade belum sesuai",
    periode: "September 2026",
    status: "Ditindaklanjuti",
    judul: "Grade pada slip belum diperbaharui sesuai SK terbaru",
    uraian:
      "Berdasarkan SK terbaru yang saya terima pada Agustus 2026, jabatan fungsional saya seharusnya sudah naik ke Lektor Kepala dengan grade 11. Namun pada slip P1 September 2026, grade yang tercantum masih 10. Mohon agar dapat diverifikasi dan diperbaiki.",
    linimasa: [
      { label: "Diajukan",                              subjudul: "Rina Maharani, M.T.",                      tanggal: "22 Oktober 2026, 09:11", selesai: true },
      { label: "Ditindaklanjuti di Bidang Kepegawaian", subjudul: "Verifikator Bidang Teknik Informatika",    tanggal: "22 Oktober 2026, 10:50", selesai: true },
      { label: "Diteruskan ke UPT Remunerasi",          subjudul: "Vacant UPT Remunerasi",                   tanggal: undefined,                 selesai: false },
      { label: "Selesai",                               subjudul: undefined,                                  tanggal: undefined,                 selesai: false },
    ],
    pesan: [
      {
        pengirim: "verifikator",
        namaPengirim: "Verifikator Kepegawaian",
        inisial: "VK",
        waktu: "22 Oktober 2026, 10:50",
        pesan:
          "Pengaduan jabatan telah kami periksa. Perubahan jabatan telah diteruskan ke UPT Remunerasi untuk penetapan.",
        lampiran: "SPMT Lulusan Anda??",
      },
      {
        pengirim: "anda",
        namaPengirim: "Anda",
        inisial: "RM",
        waktu: "22 Oktober 2026, 10:00",
        pesan:
          "Terima kasih, SK dan SPMT terbaru sudah saya lampirkan pada pengaduan.",
      },
    ],
  },
  {
    id: "UA-FTI-2026-0013",
    tanggal: "18 September 2026",
    kategori: "Data presensi atau kehadiran",
    periode: "Agustus 2026",
    status: "Dibahas",
    judul: "Data presensi Agustus 2026 tidak sesuai",
    uraian:
      "Pada periode Agustus 2026, terdapat 2 hari kehadiran yang tidak tercatat meskipun saya hadir secara fisik. Saya melampirkan log absensi fingerprint dan surat keterangan dari kepala tata usaha.",
    linimasa: [
      { label: "Diajukan",                              subjudul: "Rina Maharani, M.T.",                   tanggal: "18 September 2026, 08:30", selesai: true },
      { label: "Ditindaklanjuti di Bidang Kepegawaian", subjudul: "Verifikator Bidang Teknik Informatika", tanggal: "18 September 2026, 11:00", selesai: true },
      { label: "Diteruskan ke UPT Remunerasi",          subjudul: "UPT Remunerasi",                        tanggal: "19 September 2026, 09:00", selesai: false },
      { label: "Selesai",                               subjudul: undefined,                               tanggal: undefined,                   selesai: false },
    ],
    pesan: [
      {
        pengirim: "verifikator",
        namaPengirim: "Verifikator Kepegawaian",
        inisial: "VK",
        waktu: "18 September 2026, 11:00",
        pesan:
          "Data presensi sedang kami verifikasi dengan bagian kepegawaian. Mohon tunggu konfirmasi lebih lanjut.",
      },
      {
        pengirim: "anda",
        namaPengirim: "Anda",
        inisial: "RM",
        waktu: "18 September 2026, 08:30",
        pesan:
          "Terlampir log fingerprint dan surat keterangan kepala TU untuk hari yang tidak tercatat.",
        lampiran: "Log_Absensi_Agustus2026.pdf",
      },
    ],
  },
  {
    id: "UA-FTI-2026-0074",
    tanggal: "4 Agustus 2026",
    kategori: "Hasil perhitungan P1",
    periode: "Juli 2026",
    status: "Selesai",
    judul: "Hasil perhitungan P1 Juli 2026 tidak sesuai ekspektasi",
    uraian:
      "Jumlah neto P1 yang saya terima pada periode Juli 2026 lebih rendah dari biasanya. Mohon penjelasan mengenai komponen potongan yang diterapkan.",
    linimasa: [
      { label: "Diajukan",                              subjudul: "Rina Maharani, M.T.",                    tanggal: "4 Agustus 2026, 10:00",  selesai: true },
      { label: "Ditindaklanjuti di Bidang Kepegawaian", subjudul: "Verifikator Bidang Teknik Informatika",  tanggal: "4 Agustus 2026, 14:00",  selesai: true },
      { label: "Diteruskan ke UPT Remunerasi",          subjudul: "UPT Remunerasi",                         tanggal: "5 Agustus 2026, 09:00",  selesai: true },
      { label: "Selesai",                               subjudul: "UPT Remunerasi",                         tanggal: "24 Oktober 2026, 11:48", selesai: true },
    ],
    pesan: [
      {
        pengirim: "sistem",
        namaPengirim: "Pengaduan Selesai",
        inisial: "✓",
        waktu: "24 Oktober 2026, 11:48",
        pesan:
          "Sesuai aturan/ketentuan, penyesuaian berlaku mulai periode berikutnya.",
      },
      {
        pengirim: "verifikator",
        namaPengirim: "UPT Remunerasi",
        inisial: "UR",
        waktu: "5 Agustus 2026, 09:00",
        pesan:
          "Setelah ditelaah, potongan pada periode Juli 2026 sudah sesuai ketentuan karena terdapat keterlambatan masuk sebanyak 3 kali dan 1 hari izin yang mengurangi komponen kehadiran.",
      },
      {
        pengirim: "anda",
        namaPengirim: "Anda",
        inisial: "RM",
        waktu: "4 Agustus 2026, 10:00",
        pesan: "Mohon penjelasan mengenai potongan yang diterapkan pada periode Juli 2026.",
      },
    ],
  },
]

// ---- HELPER ------------------------------------------------

export function formatRupiah(angka: number) {
  return "Rp " + angka.toLocaleString("id-ID")
}

