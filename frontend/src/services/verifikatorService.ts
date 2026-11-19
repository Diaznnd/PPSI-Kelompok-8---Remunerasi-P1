import { api } from "@/lib/api"
import {
  PENGAJUAN_AWAL,
  USULAN_AWAL,
  AUDIT_AWAL,
  type PengajuanP1,
  type UsulanJabatan,
  type Audit,
} from "@/data/dummy-verifikator"

export const verifikatorService = {
  /**
   * Ringkasan Dashboard & Antrean Verifikator
   */
  async getDashboard() {
    try {
      const res = await api.get("/verifikator/dashboard")
      return res.data
    } catch {
      return null
    }
  },

  /**
   * FR-23: Mengambil daftar pengajuan P1 untuk diperiksa
   */
  async getPengajuanList(params?: { periode?: string; unit?: string; status?: string }) {
    try {
      const res = await api.get("/verifikator/pengajuan", { params })
      return res.data
    } catch {
      return { total: PENGAJUAN_AWAL.length, data: PENGAJUAN_AWAL }
    }
  },

  /**
   * FR-23: Mengambil detail pengajuan P1, ringkasan validasi, dan rincian per-pegawai
   */
  async getPengajuanDetail(id: string | number) {
    try {
      const res = await api.get(`/verifikator/pengajuan/${id}`)
      return res.data.data
    } catch {
      return PENGAJUAN_AWAL.find((p) => p.id === String(id)) ?? PENGAJUAN_AWAL[0]
    }
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
    try {
      const res = await api.get("/verifikator/jabatan", { params })
      return res.data
    } catch {
      return { total: USULAN_AWAL.length, data: USULAN_AWAL }
    }
  },

  /**
   * FR-24: Mengambil detail usulan perubahan jabatan/grade dan dokumen pendukung
   */
  async getUsulanDetail(id: string | number) {
    try {
      const res = await api.get(`/verifikator/jabatan/${id}`)
      return res.data.data
    } catch {
      return USULAN_AWAL.find((u) => u.id === String(id)) ?? USULAN_AWAL[0]
    }
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
   * FR-25: Memantau status seluruh pengajuan P1 dan perubahan jabatan
   */
  async getStatusPantau(params?: { tab?: "p1" | "jbg"; periode?: string; unit?: string; status?: string }) {
    try {
      const res = await api.get("/verifikator/status", { params })
      return res.data.data
    } catch {
      return []
    }
  },

  /**
   * FR-26: Melihat log jejak audit verifikasi pengajuan (read-only)
   */
  async getAuditLogs(params?: { dari?: string; sampai?: string; aksi?: string; peran?: string; q?: string }) {
    try {
      const res = await api.get("/verifikator/audit", { params })
      return res.data.data
    } catch {
      return AUDIT_AWAL
    }
  },
}
