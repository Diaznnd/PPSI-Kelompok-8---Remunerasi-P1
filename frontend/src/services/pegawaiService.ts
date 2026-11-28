import { api } from "@/lib/api"
import type { Slip, Pengaduan, ProfilPegawai } from "@/types/pegawai"

export const pegawaiService = {
  /**
   * Mengambil identitas & profil lengkap pegawai dari database
   */
  async getProfil(): Promise<ProfilPegawai> {
    const res = await api.get("/pegawai/profil")
    return res.data.pegawai
  },

  /**
   * Mengambil data ringkasan beranda pegawai dari database
   */
  async getBeranda() {
    const res = await api.get("/pegawai/beranda")
    return res.data
  },

  /**
   * Mengambil daftar seluruh slip P1 milik pegawai dari database
   */
  async getSlips(): Promise<Slip[]> {
    const res = await api.get("/pegawai/slip")
    return res.data.data
  },

  /**
   * Mengambil detail satu slip P1 dari database
   */
  async getSlipDetail(id: string): Promise<Slip | undefined> {
    const res = await api.get(`/pegawai/slip/${id}`)
    return res.data.data
  },

  /**
   * Mengambil daftar riwayat pengaduan pegawai dari database
   */
  async getPengaduanList(): Promise<Pengaduan[]> {
    const res = await api.get("/pegawai/pengaduan")
    return res.data.data
  },

  /**
   * Mengambil detail pengaduan, linimasa progres, dan riwayat pesan dari database
   */
  async getPengaduanDetail(id: string) {
    const res = await api.get(`/pegawai/pengaduan/${id}`)
    return res.data.data
  },

  /**
   * Mengunduh slip P1 format PDF
   */
  async downloadSlipPdf(id: string) {
    const res = await api.get(`/pegawai/slip/${id}/pdf?download=1`, { responseType: "blob" })
    return res.data
  },

  /**
   * Mengunduh laporan absensi resmi format PDF
   */
  async downloadAbsensiPdf(id: string) {
    const res = await api.get(`/pegawai/slip/${id}/absensi-pdf`, { responseType: "blob" })
    return res.data
  },

  /**
   * Mengirimkan pengaduan baru ke database
   */
  async kirimPengaduan(payload: {
    kategori: string
    judul: string
    deskripsi?: string
    uraian?: string
    periode?: string
    lampiran?: File
    berkas?: File
  }) {
    const formData = new FormData()
    formData.append("kategori", payload.kategori)
    formData.append("judul", payload.judul)
    formData.append("deskripsi", payload.deskripsi || payload.uraian || "")
    if (payload.periode) {
      formData.append("periode", payload.periode)
    }
    const file = payload.lampiran || payload.berkas
    if (file) {
      formData.append("lampiran", file)
    }

    const res = await api.post("/pegawai/pengaduan", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return res.data
  },

  /**
   * Mengirimkan pesan/tanggapan lanjutan pada percakapan pengaduan
   */
  async kirimPesanPengaduan(id: string, payload: { pesan: string; lampiran?: File } | string) {
    const formData = new FormData()
    const pesan = typeof payload === "string" ? payload : payload.pesan
    formData.append("pesan", pesan)
    if (typeof payload === "object" && payload?.lampiran) {
      formData.append("lampiran", payload.lampiran)
    }

    const res = await api.post(`/pegawai/pengaduan/${id}/tanggapan`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return res.data
  },

  /**
   * Alias untuk tanggapi pengaduan
   */
  async tanggapiPengaduan(id: string, payload: { pesan: string; lampiran?: File } | string) {
    return this.kirimPesanPengaduan(id, payload)
  },
}
