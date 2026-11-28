import { useOutletContext } from "react-router-dom"
import { Building2, CalendarCheck, FileText, Gavel, House, LayoutGrid, MessageSquare, Users } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import PortalShell, { type NavItem } from "@/layouts/PortalShell"
import { NavbarTimePhaseIndicator } from "@/components/NavbarTimePhaseIndicator"

const PERIODE_AKTIF = "Oktober 2026"

const NAV: NavItem[] = [
  { to: "/kepegawaian/dashboard", label: "Beranda", icon: House },
  { to: "/kepegawaian/pegawai", label: "Data Pegawai", icon: Users },
  { to: "/kepegawaian/usulan", label: "Usulan Jabatan/Grade", icon: Building2 },
  { to: "/kepegawaian/presensi", label: "Presensi & Cuti/Izin", icon: CalendarCheck, grup: "SUMBER DATA P1" },
  { to: "/kepegawaian/hukuman", label: "Hukuman Disiplin", icon: Gavel, grup: "SUMBER DATA P1" },
  { to: "/kepegawaian/pengaduan", label: "Pengaduan Pegawai", icon: MessageSquare, grup: "LAYANAN PEGAWAI" },
]

const NAV_PORTAL_PEGAWAI = [
  { to: "/pegawai/slip", label: "Slip P1 Saya", icon: FileText },
  { to: "/pegawai/pengaduan", label: "Pengaduan Saya", icon: MessageSquare },
  { to: "/pegawai/dashboard", label: "Portal Pegawai", icon: LayoutGrid },
]

// eslint-disable-next-line react-refresh/only-export-components
export const usePeriodeKepeg = () => useOutletContext<{ periode: string }>()

export default function KepegawaianShell() {
  const { akun } = useAuth()
  const periode = PERIODE_AKTIF

  const nama = akun?.nama || akun?.username || "Bidang Kepegawaian"
  const inisial =
    nama
      .split(" ")
      .filter((s) => s.length > 0)
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "KP"

  const unitNama = akun?.unit_nama || "Unit Kerja"

  return (
    <PortalShell
      home="/kepegawaian/dashboard"
      nav={NAV}
      secondaryNav={{
        title: "PORTAL MANDIRI PEGAWAI",
        items: NAV_PORTAL_PEGAWAI,
      }}
      outletContext={{ periode }}
      headerLeft={<NavbarTimePhaseIndicator />}
      user={{
        nama,
        inisial,
        peran: "Bidang Kepegawaian",
        unit: unitNama,
      }}
    />
  )
}
