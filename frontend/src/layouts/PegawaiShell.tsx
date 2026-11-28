import { useOutletContext } from "react-router-dom"
import { FileText, Gauge, MessageSquare } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import PortalShell from "@/layouts/PortalShell"
import { labelPeran, prefixPeran } from "@/lib/peran"
import { NavbarTimePhaseIndicator } from "@/components/NavbarTimePhaseIndicator"

const PERIODE_AKTIF = "Oktober 2026"

const NAV = [
  { to: "/pegawai/dashboard", label: "Beranda", icon: Gauge },
  { to: "/pegawai/slip", label: "Slip P1", icon: FileText },
  { to: "/pegawai/pengaduan", label: "Pengaduan", icon: MessageSquare },
]

// eslint-disable-next-line react-refresh/only-export-components
export function usePeriode() {
  return useOutletContext<{ periode: string }>()
}

export default function PegawaiShell() {
  const { akun } = useAuth()
  const periode = PERIODE_AKTIF

  // Jika akun memiliki peran operasional selain pegawai, sediakan menu tugas unit dengan URL prefix yang benar
  const secondaryNav = akun && akun.peran !== "pegawai" ? {
    title: `TUGAS ${labelPeran[akun.peran]?.toUpperCase() || akun.peran.toUpperCase()} (${akun.unit_nama || 'UNIT'})`,
    items: [
      {
        to: `${prefixPeran[akun.peran] || `/${akun.peran.replace(/_/g, "-")}`}/dashboard`,
        label: `Dashboard ${labelPeran[akun.peran] || akun.peran}`,
        icon: Gauge,
      },
    ],
  } : undefined

  return (
    <PortalShell
      home="/pegawai/dashboard"
      nav={NAV}
      secondaryNav={secondaryNav}
      user={{
        nama: akun?.nama || "Pegawai",
        inisial: (akun?.nama || "Pegawai")
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("")
          .toUpperCase() || "PG",
        peran: "Pegawai",
        unit: akun?.unit_nama || "Unit Kerja",
      }}
      lebar="max-w-7xl"
      outletContext={{ periode }}
      headerLeft={<NavbarTimePhaseIndicator />}
    />
  )
}
