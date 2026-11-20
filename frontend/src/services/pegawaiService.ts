import { api } from "@/lib/api"
import {
  pegawai as dummyPegawai,
  DAFTAR_SLIP,
  DAFTAR_PENGADUAN,
  LANGKAH_PENGADUAN,
  PESAN_AWAL,
  PERIODE_AKTIF,
  DAFTAR_PERIODE,
  type Slip,
  type Pengaduan,
} from "@/data/dummy-pegawai"

export const pegawaiService = {
  /**
   * Mengambil identitas & profil lengkap pegawai dari database
   */
  async getProfil() {
    try {
      const res = await api.get("/pegawai/profil")
      return res.data.pegawai
    } catch {
      return dummyPegawai
    }
  },

  /**
   * Mengambil data ringkasan beranda pegawai dari database
   */
  async getBeranda() {
    try {
      const res = await api.get("/pegawai/beranda")
      return res.data
    } catch {
      return {
        pegawai: dummyPegawai,
        slip_terbaru: DAFTAR_SLIP[0],
        pengaduan_aktif: DAFTAR_PENGADUAN.filter((p) => p.status !== "Selesai").length,
        periode_aktif: PERIODE_AKTIF,
        daftar_periode: DAFTAR_PERIODE,
      }
    }
  },

  /**
   * Mengambil daftar seluruh slip P1 milik pegawai dari database
   */
  async getSlips(): Promise<Slip[]> {
    try {
      const res = await api.get("/pegawai/slip")
      return res.data.data
    } catch {
      return DAFTAR_SLIP
    }
  },

  /**
   * Mengambil detail satu slip P1 dari database
   */
  async getSlipDetail(id: string): Promise<Slip | undefined> {
    try {
      const res = await api.get(`/pegawai/slip/${id}`)
      return res.data.data
    } catch {
      return DAFTAR_SLIP.find((s) => s.id === id) ?? DAFTAR_SLIP[0]
    }
  },

  /**
   * Mengambil daftar riwayat pengaduan pegawai dari database
   */
  async getPengaduanList(): Promise<Pengaduan[]> {
    try {
      const res = await api.get("/pegawai/pengaduan")
      return res.data.data
    } catch {
      return DAFTAR_PENGADUAN
    }
  },

  /**
   * Mengambil detail pengaduan, linimasa progres, dan riwayat pesan dari database
   */
  async getPengaduanDetail(id: string) {
    try {
      const res = await api.get(`/pegawai/pengaduan/${id}`)
      return res.data.data
    } catch {
      const item = DAFTAR_PENGADUAN[0]
      return {
        ...item,
        linimasa: LANGKAH_PENGADUAN,
        percakapan: PESAN_AWAL,
      }
    }
  },

  /**
   * Mengirimkan pengaduan baru ke database
   */
  async kirimPengaduan(payload: {
    kategori: string
    periode: string
    judul: string
    uraian: string
    berkas?: File | null
  }) {
    const formData = new FormData()
    formData.append("kategori", payload.kategori)
    formData.append("periode", payload.periode)
    formData.append("judul", payload.judul)
    formData.append("uraian", payload.uraian)
    if (payload.berkas) {
      formData.append("berkas", payload.berkas)
    }

    const res = await api.post("/pegawai/pengaduan", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return res.data
  },

  /**
   * Mengirim pesan tanggapan pada tiket pengaduan ke database
   */
  async kirimTanggapan(pengaduanId: string | number, teks: string, berkas?: File | null) {
    const formData = new FormData()
    formData.append("teks", teks)
    formData.append("pesan", teks)
    if (berkas) {
      formData.append("berkas", berkas)
    }

    const res = await api.post(`/pegawai/pengaduan/${pengaduanId}/tanggapan`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return res.data.data
  },

  /**
   * Mengirim pesan balasan pada tiket pengaduan (/api/pegawai/pengaduan/{id}/pesan)
   */
  async kirimPesanPengaduan(pengaduanId: string | number, pesan: string, berkas?: File | null) {
    const formData = new FormData()
    formData.append("pesan", pesan)
    formData.append("teks", pesan)
    if (berkas) {
      formData.append("berkas", berkas)
    }

    const res = await api.post(`/pegawai/pengaduan/${pengaduanId}/pesan`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return res.data.data
  },

  /**
   * Mengunduh file PDF slip P1 langsung dari backend (/api/pegawai/slip/{id}/pdf)
   */
  async downloadSlipPdf(id: string | number): Promise<Blob> {
    const res = await api.get(`/pegawai/slip/${id}/pdf`, {
      headers: { Accept: "application/pdf" },
      responseType: "blob",
    })
    return res.data
  },
}
