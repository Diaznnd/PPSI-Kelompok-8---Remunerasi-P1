import { api } from "@/lib/api"
import type { Amprah } from "@/types/bendahara"

export const bendaharaService = {
  /**
   * Mengambil data dashboard beranda bendahara dari database
   */
  async getDashboard(periode: string = "2026-10") {
    const res = await api.get("/bendahara/dashboard", { params: { periode } })
    return res.data
  },

  /**
   * Mengambil status kesiapan dan parameter perhitungan P1 dari database
   */
  async getKesiapan(periode: string = "2026-10") {
    const res = await api.get("/bendahara/kesiapan", { params: { periode } })
    return res.data
  },

  /**
   * Menjalankan kalkulasi P1 di database untuk seluruh pegawai aktif di unit bendahara
   */
  async hitung(periode: string = "2026-10") {
    const res = await api.post("/bendahara/hitung", { periode })
    return res.data
  },

  /**
   * Mengambil data pratinjau hasil perhitungan P1 dari database
   */
  async getPratinjau(periode: string = "2026-10") {
    const res = await api.get("/bendahara/pratinjau", { params: { periode } })
    return res.data
  },

  /**
   * Mengunduh Rekapitulasi Pengurangan Remunerasi P1 dalam format Excel/CSV resmi
   */
  async downloadRekapExcel(periode: string = "2026-10") {
    const res = await api.get("/bendahara/ekspor-excel", {
      params: { periode },
      responseType: "blob",
    })
    return res.data
  },

  /**
   * Melakukan koreksi presensi pegawai pada fase draft
   */
  async koreksiPresensi(nip: string, payload: any) {
    const res = await api.put(`/bendahara/koreksi-presensi/${nip}`, payload)
    return res.data
  },

  /**
   * Mengajukan perhitungan P1 ke Verifikator
   */
  async ajukan(payload: { periode: string; psk_nama?: string; psk_nip?: string; catatan?: string }) {
    const res = await api.post("/bendahara/ajukan", payload)
    return res.data
  },

  /**
   * Mengambil riwayat dan progres status pengajuan dari database
   */
  async getStatus() {
    const res = await api.get("/bendahara/status")
    return res.data
  },

  /**
   * Mengambil daftar dokumen amprah untuk unit kerja bendahara
   */
  async getAmprahList() {
    const res = await api.get("/bendahara/amprah")
    return res.data.data as Amprah[]
  },

  /**
   * Mengambil detail dokumen amprah beserta daftar penerima
   */
  async getAmprahDetail(id: string) {
    const res = await api.get(`/bendahara/amprah/${id}`)
    return res.data
  },

  /**
   * Mengambil data analisis rekapitulasi P1 unit kerja
   */
  async getRekapitulasi(periode: string = "2026-10") {
    const res = await api.get("/bendahara/rekapitulasi", { params: { periode } })
    return res.data
  },
}
