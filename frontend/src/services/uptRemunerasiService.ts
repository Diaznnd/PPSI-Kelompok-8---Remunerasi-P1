import { api } from "@/lib/api"

export const uptRemunerasiService = {
  // ==========================================
  // 1. DASHBOARD EKSEKUTIF
  // ==========================================
  async getDashboard(periode: string = "2026-10") {
    const res = await api.get("/upt-remunerasi/dashboard", { params: { periode } })
    return res.data
  },

  // ==========================================
  // 2. PENETAPAN JABATAN & GRADE
  // ==========================================
  async getPenetapanJabatanList(params?: { status?: string; unit_id?: string; q?: string }) {
    const res = await api.get("/upt-remunerasi/penetapan-jabatan", { params })
    return res.data
  },

  async getPenetapanJabatanDetail(id: string) {
    const res = await api.get(`/upt-remunerasi/penetapan-jabatan/${id}`)
    return res.data
  },

  async tetapkanJabatan(id: string, payload: { sk_penetapan?: string; catatan?: string }) {
    const res = await api.post(`/upt-remunerasi/penetapan-jabatan/${id}/tetapkan`, payload)
    return res.data
  },

  // ==========================================
  // 3. HITUNG PAJAK & PENETAPAN NETTO
  // ==========================================
  async getHitungPajakList(periode: string = "2026-10") {
    const res = await api.get("/upt-remunerasi/hitung-pajak", { params: { periode } })
    return res.data
  },

  async getHitungPajakDetail(id: string) {
    const res = await api.get(`/upt-remunerasi/hitung-pajak/${id}`)
    return res.data
  },

  async tetapkanNetto(id: string, payload?: { catatan?: string }) {
    const res = await api.post(`/upt-remunerasi/hitung-pajak/${id}/tetapkan-netto`, payload || {})
    return res.data
  },

  // ==========================================
  // 4. PENERBITAN SLIP P1
  // ==========================================
  async getPenerbitanSlipList(periode: string = "2026-10") {
    const res = await api.get("/upt-remunerasi/penerbitan-slip", { params: { periode } })
    return res.data
  },

  async terbitkanSlip(pengajuanId: string) {
    const res = await api.post(`/upt-remunerasi/penerbitan-slip/${pengajuanId}/terbitkan`)
    return res.data
  },

  // ==========================================
  // 5. AMPRAH UNIVERSITAS
  // ==========================================
  async getAmprahList(periode: string = "2026-10") {
    const res = await api.get("/upt-remunerasi/amprah", { params: { periode } })
    return res.data
  },

  async generateAmprah(payload: { periode: string; kelompok: string }) {
    const res = await api.post("/upt-remunerasi/amprah/generate", payload)
    return res.data
  },

  async getAmprahDetail(id: string) {
    const res = await api.get(`/upt-remunerasi/amprah/${id}`)
    return res.data
  },

  // ==========================================
  // 6. MASTER DATA
  // ==========================================
  async getMasterUnits() {
    const res = await api.get("/upt-remunerasi/master/unit")
    return res.data
  },

  async storeUnit(payload: { nama: string; jenis: string; aktif?: boolean }) {
    const res = await api.post("/upt-remunerasi/master/unit", payload)
    return res.data
  },

  async updateUnit(id: string | number, payload: { nama: string; jenis: string; aktif?: boolean }) {
    const res = await api.put(`/upt-remunerasi/master/unit/${id}`, payload)
    return res.data
  },

  async toggleUnitStatus(id: string | number) {
    const res = await api.patch(`/upt-remunerasi/master/unit/${id}/status`)
    return res.data
  },

  async getMasterGrades() {
    const res = await api.get("/upt-remunerasi/master/grade")
    return res.data
  },

  async updateGrade(id: string | number, nilai: number) {
    const res = await api.put(`/upt-remunerasi/master/grade/${id}`, { nilai })
    return res.data
  },

  async getMasterParameters() {
    const res = await api.get("/upt-remunerasi/master/parameter")
    return res.data
  },

  async updateParameter(id: string | number, nilai: number) {
    const res = await api.put(`/upt-remunerasi/master/parameter/${id}`, { nilai })
    return res.data
  },

  // ==========================================
  // 7. MANAJEMEN AKUN & RBAC (MULTI-ROLE)
  // ==========================================
  async getAkunList(q?: string) {
    const res = await api.get("/upt-remunerasi/akun", { params: { q } })
    return res.data
  },

  async storeAkun(payload: {
    username: string
    NIP?: string
    password?: string
    peran: string
    unit_id?: number | null
    roles?: { peran: string; unit_id: number | null }[]
  }) {
    const res = await api.post("/upt-remunerasi/akun", payload)
    return res.data
  },

  async updateAkun(
    id: string | number,
    payload: {
      peran?: string
      unit_id?: number | null
      roles?: { peran: string; unit_id: number | null }[]
    }
  ) {
    const res = await api.put(`/upt-remunerasi/akun/${id}`, payload)
    return res.data
  },

  async toggleAkunStatus(id: string | number) {
    const res = await api.patch(`/upt-remunerasi/akun/${id}/status`)
    return res.data
  },

  async resetPasswordAkun(id: string | number, password?: string) {
    const res = await api.post(`/upt-remunerasi/akun/${id}/reset-password`, { password })
    return res.data
  },

  // ==========================================
  // 8. PENGADUAN ESKALASI
  // ==========================================
  async getPengaduanEskalasiList(params?: { status?: string }) {
    const res = await api.get("/upt-remunerasi/pengaduan", { params })
    return res.data
  },

  async getPengaduanEskalasiDetail(id: string | number) {
    const res = await api.get(`/upt-remunerasi/pengaduan/${id}`)
    return res.data
  },

  async tanggapiPengaduan(id: string | number, payload: { isi: string; status?: "ditindaklanjuti" | "selesai" }) {
    const res = await api.post(`/upt-remunerasi/pengaduan/${id}/tanggapi`, payload)
    return res.data
  },

  // ==========================================
  // 9. JEJAK AUDIT
  // ==========================================
  async getAuditLogs(params?: { aksi?: string; q?: string; page?: number }) {
    const res = await api.get("/upt-remunerasi/audit-log", { params })
    return res.data
  },

  // ==========================================
  // 10. MONITORING & TRACKING
  // ==========================================
  async getMonitoringStatus(periode: string = "2026-10") {
    const res = await api.get("/upt-remunerasi/monitoring/status", { params: { periode } })
    return res.data
  },

  async getMonitoringTimeline(pengajuanId: string) {
    const res = await api.get(`/upt-remunerasi/monitoring/timeline/${pengajuanId}`)
    return res.data
  },

  async getKinerjaBendahara(periode: string = "2026-10") {
    const res = await api.get("/upt-remunerasi/monitoring/kinerja-bendahara", { params: { periode } })
    return res.data
  },

  async getAlerts(periode: string = "2026-10") {
    const res = await api.get("/upt-remunerasi/monitoring/alerts", { params: { periode } })
    return res.data
  },

  // ==========================================
  // 11. LAPORAN & REKAPITULASI
  // ==========================================
  async getLaporanRekapitulasi(periode: string, format: string = "json") {
    const res = await api.get("/upt-remunerasi/laporan/rekapitulasi", { params: { periode, format } })
    return res.data
  },

  async getLaporanDistribusiGrade() {
    const res = await api.get("/upt-remunerasi/laporan/distribusi-grade")
    return res.data
  },

  async getLaporanTren(periode_awal: string, periode_akhir: string) {
    const res = await api.get("/upt-remunerasi/laporan/tren", { params: { periode_awal, periode_akhir } })
    return res.data
  },

  async getLaporanPajak(periode: string) {
    const res = await api.get("/upt-remunerasi/laporan/pajak", { params: { periode } })
    return res.data
  },

  async getLaporanKeterlambatan(periode: string, batas_tanggal: string) {
    const res = await api.get("/upt-remunerasi/laporan/keterlambatan", { params: { periode, batas_tanggal } })
    return res.data
  },

  // ==========================================
  // 12. NOTIFIKASI
  // ==========================================
  async getNotifikasi(params?: { status?: string; kategori?: string }) {
    const res = await api.get("/upt-remunerasi/notifikasi", { params })
    return res.data
  },

  async markNotifikasiAsRead(id: string | number) {
    const res = await api.patch(`/upt-remunerasi/notifikasi/${id}/baca`)
    return res.data
  },

  async markAllNotifikasiAsRead() {
    const res = await api.patch("/upt-remunerasi/notifikasi/baca-semua")
    return res.data
  },

  async deleteNotifikasi(id: string | number) {
    const res = await api.delete(`/upt-remunerasi/notifikasi/${id}`)
    return res.data
  },

  async broadcastNotifikasi(payload: { judul: string; isi: string; kategori: string; target: string }) {
    const res = await api.post("/upt-remunerasi/notifikasi/broadcast", payload)
    return res.data
  },

  // ==========================================
  // 13. EKSPOR DATA
  // ==========================================
  async eksporRekapitulasiCSV(periode: string) {
    const res = await api.get("/upt-remunerasi/ekspor/rekapitulasi-csv", {
      params: { periode },
      responseType: "blob",
    })
    return res.data
  },

  async eksporDetailPegawaiCSV(pengajuan_id: string) {
    const res = await api.get("/upt-remunerasi/ekspor/detail-pegawai-csv", {
      params: { pengajuan_id },
      responseType: "blob",
    })
    return res.data
  },

  async eksporUsulanJabatanCSV(status?: string) {
    const res = await api.get("/upt-remunerasi/ekspor/usulan-jabatan-csv", {
      params: { status },
      responseType: "blob",
    })
    return res.data
  },

  async getDataEksporExcel(params: { periode: string; tipe: string; unit_id?: number }) {
    const res = await api.get("/upt-remunerasi/ekspor/data-excel", { params })
    return res.data
  },

  // ==========================================
  // 14. KONFIGURASI SISTEM
  // ==========================================
  async getKonfigurasi() {
    const res = await api.get("/upt-remunerasi/konfigurasi")
    return res.data
  },

  async updatePeriodeAktif(periode: string) {
    const res = await api.put("/upt-remunerasi/konfigurasi/periode-aktif", { periode })
    return res.data
  },

  async updateBatasPengajuan(tanggal: number) {
    const res = await api.put("/upt-remunerasi/konfigurasi/batas-pengajuan", { tanggal })
    return res.data
  },

  async toggleModeSistem(mode: string, alasan?: string) {
    const res = await api.put("/upt-remunerasi/konfigurasi/mode-sistem", { mode, alasan })
    return res.data
  },

  async toggleFitur(fitur: string, aktif: boolean) {
    const res = await api.put("/upt-remunerasi/konfigurasi/fitur", { fitur, aktif })
    return res.data
  },

  async updateParameterBatch(parameters: { id: number; nilai: number }[]) {
    const res = await api.put("/upt-remunerasi/konfigurasi/parameter-batch", { parameters })
    return res.data
  },

  async backupKonfigurasi() {
    const res = await api.post("/upt-remunerasi/konfigurasi/backup")
    return res.data
  },

  // ==========================================
  // 15. PROFIL & PASSWORD
  // ==========================================
  async updatePassword(payload: { current_password: string; new_password: string; new_password_confirmation: string }) {
    const res = await api.put("/update-password", payload)
    return res.data
  },
}
