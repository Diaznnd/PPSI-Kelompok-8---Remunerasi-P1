import { Archive, BarChart3, FileText, Gauge, History, LayoutGrid, MessageSquare } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import PortalShell from "@/layouts/PortalShell"
import { bendahara } from "@/data/dummy-bendahara"

const NAV_BENDAHARA = [
  { to: "/bendahara/dashboard", label: "Beranda", icon: Gauge },
  { to: "/bendahara/perhitungan", label: "Perhitungan P1", icon: BarChart3 },
  { to: "/bendahara/status", label: "Status Pengajuan", icon: History },
  { to: "/bendahara/amprah", label: "Amprah", icon: FileText },
  { to: "/bendahara/rekapitulasi", label: "Rekapitulasi P1", icon: Archive },
]

const NAV_PORTAL_PEGAWAI = [
  { to: "/pegawai/slip", label: "Slip P1 Saya", icon: FileText },
  { to: "/pegawai/pengaduan", label: "Pengaduan Saya", icon: MessageSquare },
  { to: "/pegawai/dashboard", label: "Portal Pegawai", icon: LayoutGrid },
]

export default function BendaharaShell() {
  const { akun } = useAuth()

  const nama = akun?.nama || bendahara.nama
  const inisial = nama
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "BD"

  const unitNama = akun?.unit_nama || "Fakultas Teknologi Informasi"

  return (
    <PortalShell
      home="/bendahara/dashboard"
      nav={NAV_BENDAHARA}
      secondaryNav={{
        title: "PORTAL MANDIRI PEGAWAI",
        items: NAV_PORTAL_PEGAWAI,
      }}
      user={{
        nama,
        inisial,
        peran: "Bendahara",
        unit: unitNama,
      }}
    />
  )
}

