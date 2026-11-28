import { api } from "@/lib/api"

export interface PegawaiTubelPayload {
  status_tugas_belajar: "aktif" | "tugas_belajar"
  sk_tugas_belajar?: string
  tgl_mulai_tubel?: string
  tgl_selesai_tubel?: string
}

export interface PegawaiCreateUpdatePayload {
  NIP?: string
  nip?: string
  nama: string
  email?: string
  jenis: "Dosen" | "Tenaga Kependidikan" | "Tendik"
  status_kepegawaian?: string
  status?: string
  pangkat_golongan?: string
  golongan?: string
  tmt?: string
  npwp?: string
  no_rekening?: string
}

export interface HukumanDisiplinPayload {
  NIP?: string
  nip?: string
  tingkat: "Ringan" | "Sedang" | "Berat" | string
  jenis?: string
  nomor_sk?: string
  sk?: string
  tanggal_mulai?: string
  mulai?: string
  tanggal_berakhir?: string
  berakhir?: string
  uraian?: string
}

export interface UsulanJabatanPayload {
  NIP: string
  jabatan_id?: number
  jabatan_baru?: string
  grade_baru?: number | string
  unit_baru_id?: number | string
  jenis_perubahan: string
  tanggal_berlaku: string
  alasan?: string
  dokumen_sk?: File
  dokumen_spmt?: File
  sk?: string
  spmt?: string
}

export const kepegawaianService = {
  /**
   * Mengambil dashboard stats untuk beranda kepegawaian
   */
  async getDashboard() {
    const res = await api.get("/kepegawaian/dashboard")
    return res.data
  },

  /**
   * L0: Mengambil tabel acuan hitung manual 10 pegawai sampel uji engine P1
   */
  async getAcuanUjiP1() {
    const res = await api.get("/kepegawaian/acuan-uji-p1")
    return res.data
  },

  /**
   * L1 (FR-03): Mengambil daftar pegawai di unit kerja kepegawaian yang bersangkutan (Isolasi Unit Kerja)
   */
  async getPegawaiList(params?: { q?: string; jenis?: string; status?: string; aktif?: string; status_tugas_belajar?: string }) {
    const res = await api.get("/kepegawaian/pegawai", { params })
    return res.data
  },

  /**
   * L1 (FR-03): Menambah pegawai baru (tolak NIP ganda & tolak set jabatan/grade langsung)
   */
  async createPegawai(payload: PegawaiCreateUpdatePayload) {
    const res = await api.post("/kepegawaian/pegawai", payload)
    return res.data
  },

  /**
   * L1 (FR-03): Mengubah identitas pegawai (tolak ubah jabatan/grade langsung)
   */
  async updatePegawai(nip: string, payload: Partial<PegawaiCreateUpdatePayload>) {
    const res = await api.put(`/kepegawaian/pegawai/${nip}`, payload)
    return res.data
  },

  /**
   * L1 (FR-03): Menonaktifkan pegawai (pegawai nonaktif tidak ikut dihitung pada P1)
   */
  async nonaktifkanPegawai(nip: string, payload: { alasan: string; keterangan?: string }) {
    const res = await api.patch(`/kepegawaian/pegawai/${nip}/nonaktifkan`, payload)
    return res.data
  },

  /**
   * L1 (FR-03): Mengaktifkan kembali pegawai
   */
  async aktifkanPegawai(nip: string) {
    const res = await api.patch(`/kepegawaian/pegawai/${nip}/aktifkan`)
    return res.data
  },

  /**
   * Mengubah status tugas belajar pegawai (Aktif / Tugas Belajar dengan hak P1 60%)
   */
  async updateStatusTugasBelajar(nip: string, payload: PegawaiTubelPayload) {
    const res = await api.put(`/kepegawaian/pegawai/${nip}/tugas-belajar`, payload)
    return res.data
  },

  /**
   * L2 (FR-06): Mengambil daftar catatan hukuman disiplin
   */
  async getHukumanList(params?: { q?: string; status?: string; tingkat?: string }) {
    const res = await api.get("/kepegawaian/hukuman", { params })
    return res.data
  },

  /**
   * L2 (FR-06): Mencatat hukuman disiplin baru (dengan validasi rentang tanggal)
   */
  async createHukuman(payload: HukumanDisiplinPayload) {
    const res = await api.post("/kepegawaian/hukuman", payload)
    return res.data
  },

  /**
   * L2 (FR-06): Mengubah catatan hukuman disiplin (dengan validasi rentang tanggal)
   */
  async updateHukuman(id: string | number, payload: Partial<HukumanDisiplinPayload>) {
    const res = await api.put(`/kepegawaian/hukuman/${id}`, payload)
    return res.data
  },

  /**
   * L3 & L4 (FR-07): Mengambil data presensi bulanan, rekap cuti/izin, riwayat impor, dan baris gagal
   */
  async getPresensi(params?: { periode?: string; q?: string; status?: string }) {
    const res = await api.get("/kepegawaian/presensi", { params })
    return res.data
  },

  async getPresensiList(params?: { periode?: string; q?: string; status?: string }) {
    return this.getPresensi(params)
  },

  async tambahHukuman(payload: any) {
    return this.createHukuman(payload)
  },

  async buatUsulan(payload: any) {
    if (payload instanceof FormData) {
      const res = await api.post("/kepegawaian/usulan", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      return res.data
    }
    return this.createUsulan(payload)
  },

  async ajukanUlangUsulan(id: string | number, payload: any) {
    if (payload instanceof FormData) {
      const res = await api.post(`/kepegawaian/usulan/${id}`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      return res.data
    }
    return this.updateUsulan(id, payload)
  },

  /**
   * L3 (FR-07, NFR-11): Mengimpor berkas rekap presensi dan cuti/izin (.csv / .xlsx / .xls)
   */
  async importPresensi(payload: { periode: string; file?: File; nama_file?: string; rows?: any[] }) {
    const formData = new FormData()
    formData.append("periode", payload.periode)
    if (payload.file) {
      formData.append("file", payload.file)
    }
    if (payload.nama_file) {
      formData.append("nama_file", payload.nama_file)
    }
    if (payload.rows) {
      return (await api.post("/kepegawaian/presensi/import", payload)).data
    }

    const res = await api.post("/kepegawaian/presensi/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return res.data
  },

  /**
   * L4 (FR-07): Mengoreksi baris presensi gagal hasil impor
   */
  async koreksiBarisGagal(
    reportId: number,
    barisIndex: number,
    payload: { NIP: string; hari_kerja: number; hadir: number; tidak_hadir: number; cuti: number; alasan?: string }
  ) {
    const res = await api.put(`/kepegawaian/presensi/baris-gagal/${reportId}/${barisIndex}`, payload)
    return res.data
  },

  /**
   * L4 (FR-07): Mengoreksi data presensi bulanan pegawai
   */
  async koreksiPresensi(
    nip: string,
    payload: { periode?: string; hariKerja: number; hadir: number; tidakHadir: number; cuti: number; alasan: string }
  ) {
    const res = await api.put(`/kepegawaian/presensi/${nip}`, payload)
    return res.data
  },

  /**
   * L5 (FR-04): Mengambil daftar usulan jabatan (dengan filter)
   */
  async getUsulanList(params?: { status?: string; q?: string; jenis?: string }) {
    const res = await api.get("/kepegawaian/usulan", { params })
    return res.data
  },

  /**
   * L5 (FR-04): Mengambil detail usulan jabatan
   */
  async getUsulanDetail(id: number | string) {
    const res = await api.get(`/kepegawaian/usulan/${id}`)
    return res.data
  },

  /**
   * L5 & L6 (FR-04, FR-05, NFR-11): Membuat usulan jabatan baru beserta unggah SK & SPMT PDF maks 5 MB
   */
  async createUsulan(payload: UsulanJabatanPayload) {
    const formData = new FormData()
    formData.append("NIP", payload.NIP)
    if (payload.jabatan_id) {
      formData.append("jabatan_id", payload.jabatan_id.toString())
    }
    if (payload.jabatan_baru) {
      formData.append("jabatan_baru", payload.jabatan_baru)
    }
    if (payload.grade_baru !== undefined) {
      formData.append("grade_baru", String(payload.grade_baru))
    }
    if (payload.unit_baru_id) {
      formData.append("unit_baru_id", String(payload.unit_baru_id))
    }
    formData.append("jenis_perubahan", payload.jenis_perubahan)
    formData.append("tanggal_berlaku", payload.tanggal_berlaku)
    if (payload.alasan) {
      formData.append("alasan", payload.alasan)
    }
    if (payload.dokumen_sk) {
      formData.append("dokumen_sk", payload.dokumen_sk)
    } else if (payload.sk) {
      formData.append("sk", payload.sk)
    }
    if (payload.dokumen_spmt) {
      formData.append("dokumen_spmt", payload.dokumen_spmt)
    } else if (payload.spmt) {
      formData.append("spmt", payload.spmt)
    }

    const res = await api.post("/kepegawaian/usulan", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return res.data
  },

  /**
   * L5 & L6 (FR-04, FR-05): Update / ajukan ulang usulan jabatan (jika status masih diajukan atau dikembalikan)
   */
  async updateUsulan(id: number | string, payload: Partial<UsulanJabatanPayload> & { catatan?: string }) {
    const formData = new FormData()

    if (payload.jabatan_id) {
      formData.append("jabatan_id", payload.jabatan_id.toString())
    }
    if (payload.jenis_perubahan) {
      formData.append("jenis_perubahan", payload.jenis_perubahan)
    }
    if (payload.tanggal_berlaku) {
      formData.append("tanggal_berlaku", payload.tanggal_berlaku)
    }
    if (payload.alasan) {
      formData.append("alasan", payload.alasan)
    }
    if (payload.catatan) {
      formData.append("catatan", payload.catatan)
    }
    if (payload.dokumen_sk) {
      formData.append("dokumen_sk", payload.dokumen_sk)
    }
    if (payload.dokumen_spmt) {
      formData.append("dokumen_spmt", payload.dokumen_spmt)
    }

    const res = await api.post(`/kepegawaian/usulan/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return res.data
  },

  /**
   * L6 (FR-05, NFR-11): Unggah dokumen pendukung SK/SPMT PDF maks 5 MB pada usulan
   */
  async uploadDokumenUsulan(id: number | string, file: File, jenis: "SK" | "SPMT" = "SK") {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("jenis", jenis)
    const res = await api.post(`/kepegawaian/usulan/${id}/dokumen`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return res.data
  },

  /**
   * Hapus usulan jabatan (jika status masih diajukan atau dikembalikan)
   */
  async deleteUsulan(id: number | string) {
    const res = await api.delete(`/kepegawaian/usulan/${id}`)
    return res.data
  },

  /**
   * Mengambil daftar master jabatan dan grade untuk dropdown (FR-04 & FR-30)
   */
  async getJabatanList() {
    const res = await api.get("/kepegawaian/jabatan/list")
    return res.data
  },

  /**
   * FR-08: Mengambil daftar pengaduan pegawai di unit kerja
   */
  async getPengaduanList(params?: { status?: string; kategori?: string; q?: string }) {
    const res = await api.get("/kepegawaian/pengaduan", { params })
    return res.data
  },

  /**
   * FR-08: Mengambil detail pengaduan beserta data diagnosis
   */
  async getPengaduanDetail(id: string | number) {
    const res = await api.get(`/kepegawaian/pengaduan/${id}`)
    return res.data
  },

  /**
   * FR-08: Menanggapi pengaduan (selesaikan di unit atau teruskan ke UPT Remunerasi)
   */
  async tanggapiPengaduan(id: string | number, payload: { tindakan: "selesai" | "teruskan"; tanggapan: string }) {
    const res = await api.post(`/kepegawaian/pengaduan/${id}/tanggapi`, payload)
    return res.data
  },
}
