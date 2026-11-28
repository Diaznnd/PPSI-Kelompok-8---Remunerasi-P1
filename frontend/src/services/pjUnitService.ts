import { api } from "@/lib/api"

export const pjUnitService = {
  // ==========================================
  // APPROVAL REKAP ABSENSI
  // ==========================================
  async getApprovalPresensiList(params?: { status_approval?: string; periode?: string }) {
    const res = await api.get("/pj-unit/approval-presensi", { params })
    return res.data
  },

  async getApprovalPresensiDetail(id: number | string) {
    const res = await api.get(`/pj-unit/approval-presensi/${id}`)
    return res.data
  },

  async approvePresensi(id: number | string, data: { catatan?: string }) {
    const res = await api.post(`/pj-unit/approval-presensi/${id}/approve`, data)
    return res.data
  },

  async rejectPresensi(id: number | string, data: { alasan: string }) {
    const res = await api.post(`/pj-unit/approval-presensi/${id}/reject`, data)
    return res.data
  },

  // ==========================================
  // DASHBOARD & READ-ONLY VIEWS
  // ==========================================
  async getDashboard() {
    const res = await api.get("/pj-unit/dashboard")
    return res.data
  },

  async getPegawai(params?: { q?: string }) {
    const res = await api.get("/pj-unit/pegawai", { params })
    return res.data
  },

  async getPegawaiList(params?: { q?: string }) {
    return this.getPegawai(params)
  },

  async getStatusPengajuan(params?: { periode?: string }) {
    const res = await api.get("/pj-unit/status", { params })
    return res.data
  },

  async getRekapitulasi(params?: { periode?: string }) {
    const res = await api.get("/pj-unit/rekapitulasi", { params })
    return res.data
  },

  async exportRekapitulasi(periode: string) {
    const res = await api.get("/pj-unit/rekapitulasi/export", {
      params: { periode },
      responseType: "blob",
    })
    return res.data
  },
}
