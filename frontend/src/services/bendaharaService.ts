import { api } from "@/lib/api"
import {
  DAFTAR_AMPRAH,
  PEGAWAI_AWAL,
  PERIODE_STATUS,
  RINGKASAN,
  STATUS_PERIODE,
  hitung,
  type Amprah,
} from "@/data/dummy-bendahara"

export const bendaharaService = {
  /**
   * Mengambil data dashboard beranda bendahara dari database
   */
  async getDashboard(periode: string = "2026-10") {
    try {
      const res = await api.get("/bendahara/dashboard", { params: { periode } })
      return res.data
    } catch {
      return {
        unit: { nama: "Fakultas Teknologi Informasi" },
        periode,
        alur_bulan_ini: {
          status: "draft",
          done_step: 2,
          dikembalikan: true,
          catatan_pengembalian:
            "Presensi Citra Lestari, S.Kom belum sesuai dengan rekap Bidang Kepegawaian. Mohon dikoreksi lalu ajukan kembali.",
        },
        statistik: {
          pegawai_aktif: 245,
          presensi_lengkap: 243,
          perubahan_jabatan: 7,
          hukuman_disiplin: 2,
        },
        kesiapan: { presensi_siap: true, waktu_unggah: "3 Oktober 2026, 08.45 WIB" },
      }
    }
  },

  /**
   * Mengambil status kesiapan dan parameter perhitungan P1 dari database
   */
  async getKesiapan(periode: string = "2026-10") {
    try {
      const res = await api.get("/bendahara/kesiapan", { params: { periode } })
      return res.data
    } catch {
      return null
    }
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
    try {
      const res = await api.get("/bendahara/pratinjau", { params: { periode } })
      return res.data
    } catch {
      // Fallback data lokal jika backend belum berjalan
      return {
        ringkasan: RINGKASAN,
        data: PEGAWAI_AWAL.map((p) => {
          const h = hitung(p)
          return {
            ...p,
            remGrade: h.remGrade,
            p1: h.p1,
            remP1: h.remP1,
            totalPersen: h.totalPersen,
            pengurangan: h.pengurangan,
            potongDisiplin: h.potongDisiplin,
            bruto: h.bruto,
            netto: h.netto,
            remNol: h.remNol,
          }
        }),
      }
    }
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
    try {
      const res = await api.get("/bendahara/status")
      return res.data
    } catch {
      return {
        daftar_periode: PERIODE_STATUS,
        data: Object.entries(STATUS_PERIODE).map(([periode, s]) => ({
          periode,
          done: s.done,
          dikembalikan: s.dikembalikan,
          riwayat: s.riwayat,
        })),
      }
    }
  },

  /**
   * Mengambil daftar dokumen amprah untuk unit kerja bendahara
   */
  async getAmprahList() {
    try {
      const res = await api.get("/bendahara/amprah")
      return res.data.data as Amprah[]
    } catch {
      return DAFTAR_AMPRAH
    }
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
  async getRekapitulasi(periode: string = "Oktober 2026") {
    try {
      const res = await api.get("/bendahara/rekapitulasi", { params: { periode } })
      return res.data
    } catch {
      return {
        ringkasan: RINGKASAN,
        tren_bulanan: [
          ["Jan", 1020], ["Feb", 1050], ["Mar", 1075], ["Apr", 1090], ["Mei", 1115],
          ["Jun", 1100], ["Jul", 1140], ["Agu", 1150], ["Sep", 1120], ["Okt", 1128.45],
        ],
      }
    }
  },
}
