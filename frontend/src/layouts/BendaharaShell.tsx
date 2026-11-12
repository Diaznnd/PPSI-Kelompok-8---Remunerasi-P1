import { Archive, BarChart3, FileText, Gauge, History } from "lucide-react"
import PortalShell from "@/layouts/PortalShell"
import { bendahara } from "@/data/dummy-bendahara"

const NAV = [
  { to: "/bendahara/dashboard", label: "Beranda", icon: Gauge },
  { to: "/bendahara/perhitungan", label: "Perhitungan P1", icon: BarChart3 },
  { to: "/bendahara/status", label: "Status Pengajuan", icon: History },
  { to: "/bendahara/amprah", label: "Amprah", icon: FileText },
  { to: "/bendahara/rekapitulasi", label: "Rekapitulasi P1", icon: Archive },
]

export default function BendaharaShell() {
  return <PortalShell home="/bendahara/dashboard" nav={NAV} user={{ nama: bendahara.nama, inisial: bendahara.inisial, peran: "Bendahara" }} />
}
