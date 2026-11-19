import { api } from "@/lib/api"

export const pjUnitService = {
  /**
   * Beranda Penanggung Jawab Unit (Hanya Baca)
   */
  async getDashboard() {
    const res = await api.get("/pj-unit/dashboard")
    return res.data
  },

  /**
   * L7 (FR-20): Daftar Pegawai dan Jabatan pada Unit (Hanya Baca)
   */
  async getPegawaiList(params?: { q?: string; status?: string; jabatan?: string; grade?: string; aktif?: string }) {
    const res = await api.get("/pj-unit/pegawai", { params })
    return res.data
  },

  /**
   * L8 (FR-18): Status Pengajuan P1 Unit secara Terpusat (Hanya Baca)
   */
  async getStatusPengajuan() {
    const res = await api.get("/pj-unit/status")
    return res.data
  },

  /**
   * L9 (FR-19): Rekapitulasi P1 Unit per Periode (Hanya Baca)
   */
  async getRekapitulasi(periode: string = "Oktober 2026") {
    const res = await api.get("/pj-unit/rekapitulasi", { params: { periode } })
    return res.data
  },

  /**
   * L11: Uji Silang Engine D8 vs Sampel Manual L0 & Verifikasi Total Amprah = Jumlah Netto
   */
  async getUjiSilangP1(periode: string = "2026-10") {
    const res = await api.get("/pj-unit/uji-silang-p1", { params: { periode } })
    return res.data
  },
}
