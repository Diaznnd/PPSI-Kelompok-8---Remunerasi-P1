import { api } from "@/lib/api"

export interface PegawaiTubelPayload {
  status_tugas_belajar: "aktif" | "tugas_belajar"
  sk_tugas_belajar?: string
  tgl_mulai_tubel?: string
  tgl_selesai_tubel?: string
}

export interface UsulanJabatanPayload {
  NIP: string
  jabatan_id: number
  jenis_perubahan: "promosi" | "mutasi" | "kenaikan_grade" | "penyesuaian"
  tanggal_berlaku: string
  dokumen_sk?: File
  dokumen_spmt?: File
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
   * Mengambil daftar pegawai di unit kerja kepegawaian yang bersangkutan (Isolasi Unit Kerja)
   */
  async getPegawaiList(params?: { q?: string; status_tugas_belajar?: string }) {
    const res = await api.get("/kepegawaian/pegawai", { params })
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
   * Mengambil daftar usulan jabatan (dengan filter)
   */
  async getUsulanList(params?: { status?: string; q?: string; jenis?: string }) {
    const res = await api.get("/kepegawaian/usulan", { params })
    return res.data
  },

  /**
   * Mengambil detail usulan jabatan
   */
  async getUsulanDetail(id: number) {
    const res = await api.get(`/kepegawaian/usulan/${id}`)
    return res.data
  },

  /**
   * Membuat usulan jabatan baru
   */
  async createUsulan(payload: UsulanJabatanPayload) {
    const formData = new FormData()
    formData.append("NIP", payload.NIP)
    formData.append("jabatan_id", payload.jabatan_id.toString())
    formData.append("jenis_perubahan", payload.jenis_perubahan)
    formData.append("tanggal_berlaku", payload.tanggal_berlaku)
    
    if (payload.dokumen_sk) {
      formData.append("dokumen_sk", payload.dokumen_sk)
    }
    if (payload.dokumen_spmt) {
      formData.append("dokumen_spmt", payload.dokumen_spmt)
    }

    const res = await api.post("/kepegawaian/usulan", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return res.data
  },

  /**
   * Update usulan jabatan (jika status masih diajukan atau dikembalikan)
   */
  async updateUsulan(id: number, payload: Partial<UsulanJabatanPayload>) {
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
    if (payload.dokumen_sk) {
      formData.append("dokumen_sk", payload.dokumen_sk)
    }

    const res = await api.post(`/kepegawaian/usulan/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      params: { _method: "PUT" }, // Laravel method spoofing for multipart
    })
    return res.data
  },

  /**
   * Hapus usulan jabatan (jika status masih diajukan atau dikembalikan)
   */
  async deleteUsulan(id: number) {
    const res = await api.delete(`/kepegawaian/usulan/${id}`)
    return res.data
  },

  /**
   * Mengambil daftar jabatan untuk dropdown
   */
  async getJabatanList() {
    const res = await api.get("/kepegawaian/jabatan/list")
    return res.data
  },
}
