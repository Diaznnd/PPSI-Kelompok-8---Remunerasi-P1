import { useEffect, useState } from "react"
import { verifikatorService } from "@/services/verifikatorService"
import type { Audit, PengajuanP1, UsulanJabatan } from "@/types/verifikator"

export function putuskan(a: {
  jenis: "pengajuan" | "usulan"
  id: string
  status: "Diverifikasi" | "Dikembalikan"
  alasan?: string
}) {
  const setuju = a.status === "Diverifikasi"
  if (a.jenis === "pengajuan") {
    if (setuju) {
      return verifikatorService.setujuiPengajuan(a.id, { catatan: a.alasan || "Disetujui verifikator." })
    } else {
      return verifikatorService.kembalikanPengajuan(a.id, { alasan: a.alasan ?? "Pengajuan dikembalikan untuk perbaikan." })
    }
  } else if (a.jenis === "usulan") {
    if (setuju) {
      return verifikatorService.setujuiUsulan(a.id, { catatan: a.alasan || "Usulan jabatan disetujui." })
    } else {
      return verifikatorService.kembalikanUsulan(a.id, { alasan: a.alasan ?? "Usulan jabatan dikembalikan untuk perbaikan." })
    }
  }
}

export function resetDemo() {
  // No-op for real backend
}

export function usePengajuan(): PengajuanP1[] {
  const [data, setData] = useState<PengajuanP1[]>([])
  useEffect(() => {
    verifikatorService
      .getPengajuanList()
      .then((res) => {
        if (res?.data) setData(res.data)
        else if (Array.isArray(res)) setData(res)
      })
      .catch(() => setData([]))
  }, [])
  return data
}

export function useUsulan(): UsulanJabatan[] {
  const [data, setData] = useState<UsulanJabatan[]>([])
  useEffect(() => {
    verifikatorService
      .getUsulanList()
      .then((res) => {
        if (res?.data) setData(res.data)
        else if (Array.isArray(res)) setData(res)
      })
      .catch(() => setData([]))
  }, [])
  return data
}

export function useAudit(): Audit[] {
  const [data, setData] = useState<Audit[]>([])
  useEffect(() => {
    verifikatorService
      .getAuditLog()
      .then((res) => {
        if (res?.data) setData(res.data)
        else if (Array.isArray(res)) setData(res)
      })
      .catch(() => setData([]))
  }, [])
  return data
}

export function useStatistik() {
  const [stats, setStats] = useState({
    pengajuan: 0,
    usulan: 0,
    dikembalikan: 0,
    disetujui: 0,
  })

  useEffect(() => {
    verifikatorService
      .getDashboard()
      .then((res) => {
        if (res?.statistik) {
          setStats({
            pengajuan: res.statistik.antrean_pengajuan ?? 0,
            usulan: res.statistik.antrean_usulan ?? 0,
            dikembalikan: res.statistik.total_dikembalikan ?? 0,
            disetujui: res.statistik.total_disetujui ?? 0,
          })
        }
      })
      .catch(() => {})
  }, [])

  return stats
}
