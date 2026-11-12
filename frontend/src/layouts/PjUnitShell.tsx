import { BarChart3, Eye, Gauge, History, Users } from "lucide-react"
import PortalShell from "@/layouts/PortalShell"
import { Badge } from "@/components/ui/badge"
import { pjUnit } from "@/data/dummy-pjunit"

const NAV = [
  { to: "/pj-unit/dashboard", label: "Beranda", icon: Gauge },
  { to: "/pj-unit/pegawai", label: "Data Pegawai dan Jabatan", icon: Users },
  { to: "/pj-unit/status", label: "Status Pengajuan P1", icon: History },
  { to: "/pj-unit/rekapitulasi", label: "Rekapitulasi P1", icon: BarChart3 },
]

export default function PjUnitShell() {
  return (
    <PortalShell
      home="/pj-unit/dashboard"
      nav={NAV}
      user={{ nama: pjUnit.nama, inisial: pjUnit.inisial, peran: "Penanggung Jawab" }}
      headerLeft={<Badge variant="secondary" className="gap-1.5 px-3 py-1 font-normal"><Eye className="size-3.5" /> Mode Pemantauan: Hanya Baca</Badge>}
    />
  )
}
