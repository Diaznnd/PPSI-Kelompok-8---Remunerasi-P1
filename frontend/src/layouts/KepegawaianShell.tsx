import { useState } from "react"
import { useOutletContext } from "react-router-dom"
import { Building2, CalendarCheck, FileText, Gavel, House, LayoutGrid, MessageSquare, Users } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import PortalShell, { type NavItem } from "@/layouts/PortalShell"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { kepeg } from "@/data/dummy-kepegawaian"

// Constants
const DAFTAR_PERIODE = [
  "Oktober 2026",
  "September 2026",
  "Agustus 2026",
  "Juli 2026",
  "Juni 2026",
  "Mei 2026"
]
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
  const [periode, setPeriode] = useState(PERIODE_AKTIF)

  const nama = akun?.nama || kepeg.nama
  const inisial =
    nama
      .split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "KP"

  const unitNama = akun?.unit_nama || "Fakultas Teknologi Informasi"

  return (
    <PortalShell
      home="/kepegawaian/dashboard"
      nav={NAV}
      secondaryNav={{
        title: "PORTAL MANDIRI PEGAWAI",
        items: NAV_PORTAL_PEGAWAI,
      }}
      user={{
        nama,
        inisial,
        peran: "Kepegawaian",
        unit: unitNama,
      }}
      outletContext={{ periode }}
      headerLeft={
        <>
          <span className="hidden text-sm text-muted-foreground sm:inline">Periode:</span>
          <Select value={periode} onValueChange={setPeriode}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>{DAFTAR_PERIODE.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
          </Select>
        </>
      }
    />
  )
}
