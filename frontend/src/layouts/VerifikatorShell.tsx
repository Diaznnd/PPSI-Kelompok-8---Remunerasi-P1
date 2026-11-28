import { FileCheck2, FileText, Gauge, GitCompareArrows, History, LayoutGrid, ListChecks, MessageSquare } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import PortalShell from "@/layouts/PortalShell"
import { NavbarTimePhaseIndicator } from "@/components/NavbarTimePhaseIndicator"

const NAV = [
  { to: "/verifikator/dashboard", label: "Beranda", icon: Gauge },
  { to: "/verifikator/pengajuan", label: "Verifikasi Pengajuan P1", icon: FileCheck2 },
  { to: "/verifikator/jabatan", label: "Verifikasi Perubahan Jabatan/Grade", icon: GitCompareArrows },
  { to: "/verifikator/status", label: "Pantau Status Pengajuan", icon: History },
  { to: "/verifikator/audit", label: "Jejak Audit", icon: ListChecks },
]

const NAV_PORTAL_PEGAWAI = [
  { to: "/pegawai/slip", label: "Slip P1 Saya", icon: FileText },
  { to: "/pegawai/pengaduan", label: "Pengaduan Saya", icon: MessageSquare },
  { to: "/pegawai/dashboard", label: "Portal Pegawai", icon: LayoutGrid },
]

export default function VerifikatorShell() {
  const { akun } = useAuth()

  const nama = akun?.nama || akun?.username || "Tim Verifikator"
  const inisial =
    nama
      .split(" ")
      .filter((s) => s.length > 0)
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "VF"

  const unitNama = akun?.unit_nama || "UPT Remunerasi"

  return (
    <PortalShell
      home="/verifikator/dashboard"
      nav={NAV}
      secondaryNav={{
        title: "PORTAL MANDIRI PEGAWAI",
        items: NAV_PORTAL_PEGAWAI,
      }}
      user={{
        nama,
        inisial,
        peran: "Verifikator",
        unit: unitNama,
      }}
      headerLeft={<NavbarTimePhaseIndicator />}
    />
  )
}
