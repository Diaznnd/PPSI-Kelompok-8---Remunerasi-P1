

export const profilSaya = {
  nama: "Dewi Anggraini, S.Kom., M.T.",
  inisial: "DA",
  nip: "198405122008122001",
  email: "dewi.anggraini@unand.ac.id",
  unit: "UPT Remunerasi",
  jabatan: "Kelompok Pelaksana Tk. 9",
  grade: 9,
  nilaiJabatan: 1453,
  pir: 3000,
  pangkat: "Penata Muda Tk. I / III/b",
  npwpMasked: "09.•••.•••.2-201.000",
  rekeningMasked: "BNI ••••5678",
  statusKepegawaian: "PNS" as const,
  pengaliStatus: 100,
  peranSistem: "UPT Remunerasi (Admin) · Pegawai",
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

function buatDaftarTL(override: Record<string, number> = {}): KomponenPenguranganItem[] {
  return [
    { kode: "TL.1", nama: "TL.1 (0–60 menit)", keterangan: "0% bila diganti hari yang sama", hari: override["TL.1"] ?? 0, tarifPersen: 0.25 },
    { kode: "TL.2", nama: "TL.2 (61–75 menit)", hari: override["TL.2"] ?? 0, tarifPersen: 0.5 },
    { kode: "TL.3", nama: "TL.3 (76–90 menit)", hari: override["TL.3"] ?? 0, tarifPersen: 1 },
    { kode: "TL.4", nama: "TL.4 (91–105 menit)", hari: override["TL.4"] ?? 0, tarifPersen: 1.5 },
    { kode: "TL.5", nama: "TL.5 (106–120 menit)", hari: override["TL.5"] ?? 0, tarifPersen: 2 },
    { kode: "TL.6", nama: "TL.6 (121–240 menit)", hari: override["TL.6"] ?? 0, tarifPersen: 2.5 },
  ]
}

function buatDaftarPSW(override: Record<string, number> = {}): KomponenPenguranganItem[] {
  return [
    { kode: "PSW.1", nama: "PSW.1 (0–60 menit)", keterangan: "0% bila diganti hari yang sama", hari: override["PSW.1"] ?? 0, tarifPersen: 0.25 },
    { kode: "PSW.2", nama: "PSW.2 (61–75 menit)", hari: override["PSW.2"] ?? 0, tarifPersen: 0.5 },
    { kode: "PSW.3", nama: "PSW.3 (76–90 menit)", hari: override["PSW.3"] ?? 0, tarifPersen: 1 },
    { kode: "PSW.4", nama: "PSW.4 (91–105 menit)", hari: override["PSW.4"] ?? 0, tarifPersen: 1.5 },
    { kode: "PSW.5", nama: "PSW.5 (106–120 menit)", hari: override["PSW.5"] ?? 0, tarifPersen: 2 },
    { kode: "PSW.6", nama: "PSW.6 (121–240 menit)", hari: override["PSW.6"] ?? 0, tarifPersen: 2.5 },
  ]
}

function buatDaftarKetidakhadiran(override: Record<string, number> = {}): KomponenPenguranganItem[] {
  return [
    { kode: "CT", nama: "Cuti Tahunan", keterangan: "Tidak dihitung ke ambang", hari: override["CT"] ?? 0, tarifPersen: 0 },
    { kode: "CS", nama: "Cuti Sakit", hari: override["CS"] ?? 0, tarifPersen: 1 },
    { kode: "CB12", nama: "Cuti Bersalin (ke-1 & ke-2)", hari: override["CB12"] ?? 0, tarifPersen: 1 },
    { kode: "CB3", nama: "Cuti Bersalin (ke-3)", hari: override["CB3"] ?? 0, tarifPersen: 2 },
    { kode: "CB4", nama: "Cuti Bersalin (ke-4 dst)", hari: override["CB4"] ?? 0, tarifPersen: 3 },
    { kode: "CAP", nama: "Cuti Karena Alasan Penting", hari: override["CAP"] ?? 0, tarifPersen: 3 },
    { kode: "CB", nama: "Cuti Besar", hari: override["CB"] ?? 0, tarifPersen: 1.5 },
    { kode: "TK", nama: "Tidak Hadir Tanpa Keterangan", hari: override["TK"] ?? 0, tarifPersen: 5 },
  ]
}

export const daftarSlipSaya: SlipSayaItem[] = [
  {
    id: "SLP-DA-202611",
    tahun: "2026",
    periode: "November 2026",
    nomorSlip: "-",
    status: "belum_terbit",
    remunerasiJabatan: 4359000,
    p140: 1743600,
    pengaliStatus: 100,
    remunerasiP1: 1743600,
    tl: buatDaftarTL(),
    psw: buatDaftarPSW(),
    ketidakhadiran: buatDaftarKetidakhadiran(),
    totalPersenPengurangan: 0,
    penguranganKehadiranRp: 0,
    jumlahBruto: 0,
    pajak: 0,
    pajakTer: 0,
    tabPajak: 0,
    jumlahNetto: 0,
    rekeningMasked: profilSaya.rekeningMasked,
  },
  {
    id: "SLP-DA-202610",
    tahun: "2026",
    periode: "Oktober 2026",
    nomorSlip: "SLP-P1/2026/10/001421",
    status: "terbit",
    remunerasiJabatan: 4359000,
    p140: 1743600,
    pengaliStatus: 100,
    remunerasiP1: 1743600,
    tl: buatDaftarTL({ "TL.2": 1 }),
    psw: buatDaftarPSW(),
    ketidakhadiran: buatDaftarKetidakhadiran(),
    totalPersenPengurangan: 0.5,
    penguranganKehadiranRp: 8718, // 0,5% * 1.743.600
    jumlahBruto: 1734882,
    pajak: 86700, // nilai pajak contoh; aturan pajak menunggu konfirmasi UPT
    pajakTer: 86700,
    tabPajak: 0,
    jumlahNetto: 1648182,
    rekeningMasked: profilSaya.rekeningMasked,
  },
  {
    id: "SLP-DA-202609",
    tahun: "2026",
    periode: "September 2026",
    nomorSlip: "SLP-P1/2026/09/001389",
    status: "terbit",
    remunerasiJabatan: 4359000,
    p140: 1743600,
    pengaliStatus: 100,
    remunerasiP1: 1743600,
    tl: buatDaftarTL(),
    psw: buatDaftarPSW(),
    ketidakhadiran: buatDaftarKetidakhadiran({ CT: 1 }),
    totalPersenPengurangan: 0,
    penguranganKehadiranRp: 0,
    jumlahBruto: 1743600,
    pajak: 87180, // nilai pajak contoh; aturan pajak menunggu konfirmasi UPT
    pajakTer: 87180,
    tabPajak: 0,
    jumlahNetto: 1656420,
    rekeningMasked: profilSaya.rekeningMasked,
  },
  {
    id: "SLP-DA-202608",
    tahun: "2026",
    periode: "Agustus 2026",
    nomorSlip: "SLP-P1/2026/08/001312",
    status: "terbit",
    remunerasiJabatan: 4359000,
    p140: 1743600,
    pengaliStatus: 100,
    remunerasiP1: 1743600,
    tl: buatDaftarTL({ "TL.1": 2 }),
    psw: buatDaftarPSW(),
    ketidakhadiran: buatDaftarKetidakhadiran({ CS: 1 }),
    totalPersenPengurangan: 1.5, // 2*0,25% + 1*1%
    penguranganKehadiranRp: 26154, // 1,5% * 1.743.600
    jumlahBruto: 1717446,
    pajak: 85872, // nilai pajak contoh; aturan pajak menunggu konfirmasi UPT
    pajakTer: 85872,
    tabPajak: 0,
    jumlahNetto: 1631574,
    rekeningMasked: profilSaya.rekeningMasked,
  },
  {
    id: "SLP-DA-202607",
    tahun: "2026",
    periode: "Juli 2026",
    nomorSlip: "SLP-P1/2026/07/001245",
    status: "terbit",
    remunerasiJabatan: 4359000,
    p140: 1743600,
    pengaliStatus: 100,
    remunerasiP1: 1743600,
    tl: buatDaftarTL(),
    psw: buatDaftarPSW({ "PSW.3": 1 }),
    ketidakhadiran: buatDaftarKetidakhadiran(),
    totalPersenPengurangan: 1,
    penguranganKehadiranRp: 17436, // 1% * 1.743.600
    jumlahBruto: 1726164,
    pajak: 86308, // nilai pajak contoh; aturan pajak menunggu konfirmasi UPT
    pajakTer: 86308,
    tabPajak: 0,
    jumlahNetto: 1639856,
    rekeningMasked: profilSaya.rekeningMasked,
  },
]

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

export const daftarPengaduanSayaInitial: PengaduanSayaItem[] = [
  {
    nomor: "UA-UPT-2026-0041",
    tanggal: "14 Nov 2026",
    kategori: "Slip P1",
    periode: "Oktober 2026",
    judul: "Konfirmasi komponen TL.2 tanggal 12 Oktober 2026",
    uraian:
      "Pada tanggal 12 Oktober 2026 saya hadir mengikuti rapat koordinasi pagi bersama tim keuangan, mohon pengecekan ulang catatan TL.2 1 hari pada slip Oktober 2026.",
    lampiran: [{ nama: "surat-tugas-rapat-12okt.pdf", ukuran: "412 KB" }],
    status: "Diajukan",
    dieskalasi: false,
    linimasa: [
      {
        tahap: "Diajukan",
        selesai: true,
        pelaku: "Dewi Anggraini",
        waktu: "14 Nov 2026, 09.15 WIB",
        catatan: "Pengaduan dikirim beserta surat tugas rapat koordinasi.",
      },
      {
        tahap: "Ditindaklanjuti",
        selesai: false,
        pelaku: "Bidang Kepegawaian UPT Remunerasi",
        waktu: "-",
        catatan: "Menunggu verifikasi catatan kehadiran.",
      },
      {
        tahap: "Selesai",
        selesai: false,
        pelaku: "Bidang Kepegawaian UPT Remunerasi",
        waktu: "-",
        catatan: "Menunggu penyelesaian.",
      },
    ],
    pesan: [
      {
        id: "psn-41-1",
        pengirim: "Dewi Anggraini",
        peran: "Pegawai Pengaju",
        waktu: "14 Nov 2026, 09.15 WIB",
        isi: "Mohon dicek kembali presensi tanggal 12 Oktober 2026, berikut saya lampirkan surat tugas rapat pagi.",
        lampiran: "surat-tugas-rapat-12okt.pdf",
      },
    ],
  },
  {
    nomor: "UA-UPT-2026-0038",
    tanggal: "05 Nov 2026",
    kategori: "Data presensi atau kehadiran",
    periode: "Oktober 2026",
    judul: "Sinkronisasi jam pulang finger print tanggal 23 Oktober",
    uraian:
      "Mesin presensi gedung rektorat sempat gangguan pada sore tanggal 23 Oktober sehingga jam pulang tercatat lebih awal. Bukti log manual sudah ditandatangani atasan.",
    lampiran: [{ nama: "log-presensi-manual-23okt.jpg", ukuran: "820 KB" }],
    status: "Ditindaklanjuti",
    dieskalasi: false,
    linimasa: [
      {
        tahap: "Diajukan",
        selesai: true,
        pelaku: "Dewi Anggraini",
        waktu: "05 Nov 2026, 10.20 WIB",
        catatan: "Pengaduan dan bukti log manual diunggah.",
      },
      {
        tahap: "Ditindaklanjuti",
        selesai: true,
        pelaku: "Bidang Kepegawaian UPT Remunerasi",
        waktu: "06 Nov 2026, 13.40 WIB",
        catatan: "Sedang mencocokkan log manual dengan rekap mesin presensi.",
      },
      {
        tahap: "Selesai",
        selesai: false,
        pelaku: "Bidang Kepegawaian UPT Remunerasi",
        waktu: "-",
        catatan: "Menunggu konfirmasi akhir.",
      },
    ],
    pesan: [
      {
        id: "psn-38-1",
        pengirim: "Dewi Anggraini",
        peran: "Pegawai Pengaju",
        waktu: "05 Nov 2026, 10.20 WIB",
        isi: "Lampiran log presensi manual tanggal 23 Oktober terlampir untuk penyesuaian.",
        lampiran: "log-presensi-manual-23okt.jpg",
      },
      {
        id: "psn-38-2",
        pengirim: "Bidang Kepegawaian UPT Remunerasi",
        peran: "Kepegawaian Unit",
        waktu: "06 Nov 2026, 13.40 WIB",
        isi: "Terima kasih, berkas sudah kami terima dan sedang dicocokkan dengan log server mesin presensi.",
      },
    ],
  },
  {
    nomor: "UA-UPT-2026-0034",
    tanggal: "18 Okt 2026",
    kategori: "Hasil perhitungan P1",
    periode: "September 2026",
    judul: "Penyesuaian pajak TER pada periode September 2026",
    uraian:
      "Mohon penjelasan terkait perbedaan nilai Pajak TER sebesar Rp 480 antara periode September dan Agustus meskipun komponen bruto hanya berselisih tipis.",
    lampiran: [],
    status: "Diteruskan",
    dieskalasi: true,
    linimasa: [
      {
        tahap: "Diajukan",
        selesai: true,
        pelaku: "Dewi Anggraini",
        waktu: "18 Okt 2026, 08.50 WIB",
        catatan: "Permintaan klarifikasi komponen Pajak TER.",
      },
      {
        tahap: "Ditindaklanjuti",
        selesai: true,
        pelaku: "Bidang Kepegawaian UPT Remunerasi",
        waktu: "19 Okt 2026, 11.10 WIB",
        catatan: "Data kehadiran dan grade sudah sesuai; pertanyaan menyangkut perhitungan pajak.",
      },
      {
        tahap: "Diteruskan ke UPT Remunerasi",
        selesai: true,
        pelaku: "Bidang Kepegawaian UPT Remunerasi",
        waktu: "19 Okt 2026, 14.30 WIB",
        catatan: "Dieskalasi ke UPT Remunerasi untuk pengecekan tarif TER.",
      },
      {
        tahap: "Selesai",
        selesai: false,
        pelaku: "UPT Remunerasi",
        waktu: "-",
        catatan: "Menunggu jawaban final UPT Remunerasi.",
      },
    ],
    pesan: [
      {
        id: "psn-34-1",
        pengirim: "Dewi Anggraini",
        peran: "Pegawai Pengaju",
        waktu: "18 Okt 2026, 08.50 WIB",
        isi: "Mohon klarifikasi perhitungan Pajak TER pada slip September 2026.",
      },
      {
        id: "psn-34-2",
        pengirim: "Bidang Kepegawaian UPT Remunerasi",
        peran: "Kepegawaian Unit",
        waktu: "19 Okt 2026, 14.30 WIB",
        isi: "Karena menyangkut komponen pajak TER, pengaduan kami teruskan ke tim UPT Remunerasi.",
      },
    ],
  },
  {
    nomor: "UA-UPT-2026-0029",
    tanggal: "10 Sep 2026",
    kategori: "Perubahan jabatan atau grade belum sesuai",
    periode: "Agustus 2026",
    judul: "Verifikasi kesesuaian Grade 9 pasca penetapan SK",
    uraian:
      "Memastikan pembaruan SK penempatan Kelompok Pelaksana Tk. 9 (Grade 9) sudah aktif pada perhitungan P1 mulai Agustus 2026.",
    lampiran: [{ nama: "SK-Penempatan-Grade9.pdf", ukuran: "1.1 MB" }],
    status: "Selesai",
    dieskalasi: false,
    linimasa: [
      {
        tahap: "Diajukan",
        selesai: true,
        pelaku: "Dewi Anggraini",
        waktu: "10 Sep 2026, 09.00 WIB",
        catatan: "Melampirkan SK penempatan Grade 9.",
      },
      {
        tahap: "Ditindaklanjuti",
        selesai: true,
        pelaku: "Bidang Kepegawaian UPT Remunerasi",
        waktu: "11 Sep 2026, 10.15 WIB",
        catatan: "SK dan SPMT terverifikasi terhitung sebelum tanggal 15.",
      },
      {
        tahap: "Selesai",
        selesai: true,
        pelaku: "Bidang Kepegawaian UPT Remunerasi",
        waktu: "11 Sep 2026, 15.05 WIB",
        catatan: "Grade 9 sudah aktif dan tercatat pada slip Agustus 2026.",
      },
    ],
    pesan: [
      {
        id: "psn-29-1",
        pengirim: "Dewi Anggraini",
        peran: "Pegawai Pengaju",
        waktu: "10 Sep 2026, 09.00 WIB",
        isi: "Mohon konfirmasi aktivasi Grade 9 sesuai SK terlampir.",
        lampiran: "SK-Penempatan-Grade9.pdf",
      },
      {
        id: "psn-29-2",
        pengirim: "Bidang Kepegawaian UPT Remunerasi",
        peran: "Kepegawaian Unit",
        waktu: "11 Sep 2026, 15.05 WIB",
        isi: "Sudah sesuai. Grade 9 (nilai jabatan 1.453) sudah aktif pada perhitungan P1 Anda.",
      },
    ],
  },
]

let pengaduanSayaMemory: PengaduanSayaItem[] = [...daftarPengaduanSayaInitial]

export function getPengaduanSayaList(): PengaduanSayaItem[] {
  return pengaduanSayaMemory
}

export function addPengaduanSaya(item: PengaduanSayaItem) {
  pengaduanSayaMemory = [item, ...pengaduanSayaMemory]
}

export function addPesanPengaduanSaya(nomor: string, pesanBaru: PengaduanSayaPesan) {
  pengaduanSayaMemory = pengaduanSayaMemory.map((item) =>
    item.nomor === nomor
      ? { ...item, pesan: [...item.pesan, pesanBaru] }
      : item
  )
}
