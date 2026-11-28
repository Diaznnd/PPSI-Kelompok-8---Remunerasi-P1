import { api } from "@/lib/api"

export const verifikatorService = {
  /**
   * Ringkasan Dashboard & Antrean Verifikator
   */
  async getDashboard() {
    const res = await api.get("/verifikator/dashboard")
    return res.data
  },

  /**
   * FR-23: Mengambil daftar pengajuan P1 untuk diperiksa
   */
  async getPengajuanList(params?: { periode?: string; unit?: string; status?: string }) {
    const res = await api.get("/verifikator/pengajuan", { params })
    return res.data
  },

  /**
   * FR-23: Mengambil detail pengajuan P1, ringkasan validasi, dan rincian per-pegawai
   */
  async getPengajuanDetail(id: string | number) {
    const res = await api.get(`/verifikator/pengajuan/${id}`)
    return res.data.data
  },

  /**
   * FR-23: Menyetujui pengajuan P1 dan meneruskannya ke UPT Remunerasi
   */
  async setujuiPengajuan(id: string | number, payload?: { catatan?: string }) {
    const res = await api.post(`/verifikator/pengajuan/${id}/setujui`, payload ?? {})
    return res.data
  },

  /**
   * FR-23: Mengembalikan pengajuan P1 kepada Bendahara dengan catatan alasan wajib
   */
  async kembalikanPengajuan(id: string | number, payload: { alasan: string }) {
    const res = await api.post(`/verifikator/pengajuan/${id}/kembalikan`, payload)
    return res.data
  },

  /**
   * FR-24: Mengambil daftar usulan perubahan jabatan/grade
   */
  async getUsulanList(params?: { unit?: string; jenis?: string; status?: string }) {
    const res = await api.get("/verifikator/jabatan", { params })
    return res.data
  },

  /**
   * FR-24: Mengambil detail usulan perubahan jabatan/grade dan dokumen pendukung
   */
  async getUsulanDetail(id: string | number) {
    const res = await api.get(`/verifikator/jabatan/${id}`)
    return res.data.data
  },

  /**
   * FR-24: Menyetujui usulan perubahan jabatan dan meneruskannya ke UPT Remunerasi
   */
  async setujuiUsulan(id: string | number, payload?: { catatan?: string }) {
    const res = await api.post(`/verifikator/jabatan/${id}/setujui`, payload ?? {})
    return res.data
  },

  /**
   * FR-24: Mengembalikan usulan perubahan jabatan kepada Kepegawaian dengan catatan alasan wajib
   */
  async kembalikanUsulan(id: string | number, payload: { alasan: string }) {
    const res = await api.post(`/verifikator/jabatan/${id}/kembalikan`, payload)
    return res.data
  },

  /**
   * Mengambil data pemantauan status dan linimasa pengajuan
   */
  async getPantauStatus() {
    const res = await api.get("/verifikator/pantau-status")
    return res.data
  },

  /**
   * Mengambil log audit verifikasi
   */
  async getAuditLog(params?: { cari?: string; periode?: string }) {
    const res = await api.get("/verifikator/audit", { params })
    return res.data
  },
}
