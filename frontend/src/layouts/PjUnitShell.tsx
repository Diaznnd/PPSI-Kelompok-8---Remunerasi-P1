import { BarChart3, Eye, FileText, Gauge, History, LayoutGrid, MessageSquare, Users } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import PortalShell from "@/layouts/PortalShell"
import { Badge } from "@/components/ui/badge"
import { pjUnit } from "@/data/dummy-pjunit"

const NAV_PJUNIT = [
  { to: "/pj-unit/dashboard", label: "Beranda", icon: Gauge },
  { to: "/pj-unit/pegawai", label: "Data Pegawai dan Jabatan", icon: Users },
  { to: "/pj-unit/status", label: "Status Pengajuan P1", icon: History },
  { to: "/pj-unit/rekapitulasi", label: "Rekapitulasi P1", icon: BarChart3 },
]

const NAV_PORTAL_PEGAWAI = [
  { to: "/pegawai/slip", label: "Slip P1 Saya", icon: FileText },
  { to: "/pegawai/pengaduan", label: "Pengaduan Saya", icon: MessageSquare },
  { to: "/pegawai/dashboard", label: "Portal Pegawai", icon: LayoutGrid },
]

export default function PjUnitShell() {
  const { akun } = useAuth()
  const nama = akun?.nama || pjUnit.nama
  const inisial = nama
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "PJ"

  const unitNama = akun?.unit_nama || "Fakultas Teknologi Informasi"

  return (
    <PortalShell
      home="/pj-unit/dashboard"
      nav={NAV_PJUNIT}
      secondaryNav={{
        title: "PORTAL MANDIRI PEGAWAI",
        items: NAV_PORTAL_PEGAWAI,
      }}
      user={{
        nama,
        inisial,
        peran: "Penanggung Jawab",
        unit: unitNama,
      }}
      headerLeft={<Badge variant="secondary" className="gap-1.5 px-3 py-1 font-normal"><Eye className="size-3.5" /> Mode Pemantauan: Hanya Baca</Badge>}
    />
  )
}

