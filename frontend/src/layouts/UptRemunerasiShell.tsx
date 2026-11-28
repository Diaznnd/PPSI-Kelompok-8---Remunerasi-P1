import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Activity,
  AlertCircle,
  Bell,
  BriefcaseBusiness,
  Calendar,
  CheckCheck,
  ClipboardList,
  FileText,
  Files,
  Gauge,
  Home,
  Landmark,
  MessageSquare,
  Receipt,
  Settings2,
  Sheet as SheetIcon,
  ShieldCheck,
  Table2,
  User,
  Users,
  type LucideIcon,
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import PortalShell from "@/layouts/PortalShell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NavbarTimePhaseIndicator } from "@/components/NavbarTimePhaseIndicator"
import type { NotifikasiItem } from "@/types/upt"
import { PeriodeContext } from "@/pages/upt-remunerasi/components"

const PERIODE_UPT_LIST = [
  "Oktober 2026",
  "September 2026",
  "Agustus 2026",
  "Juli 2026",
  "Juni 2026",
  "Mei 2026",
]

export const NAV_UPT: { to: string; label: string; icon: LucideIcon; grup: string }[] = [
  { to: "/upt-remunerasi/dashboard", label: "Beranda UPT", icon: Gauge, grup: "MENU UTAMA" },
  { to: "/upt-remunerasi/beranda-saya", label: "Beranda Saya", icon: Home, grup: "MENU UTAMA" },
  { to: "/upt-remunerasi/slip-saya", label: "Slip P1 Saya", icon: Receipt, grup: "MENU UTAMA" },
  { to: "/upt-remunerasi/pengaduan-saya", label: "Pengaduan Saya", icon: MessageSquare, grup: "MENU UTAMA" },

  { to: "/upt-remunerasi/hitung", label: "Persetujuan Pengajuan P1", icon: CheckCheck, grup: "APPROVAL & PENGESAHAN" },
  { to: "/upt-remunerasi/penetapan", label: "Pengesahan Usulan Jabatan", icon: BriefcaseBusiness, grup: "APPROVAL & PENGESAHAN" },
  { to: "/upt-remunerasi/status", label: "Pantau Status Pengajuan", icon: Activity, grup: "APPROVAL & PENGESAHAN" },

  { to: "/upt-remunerasi/amprah", label: "Amprah & Lembar Verifikasi", icon: FileText, grup: "OUTPUT & PENERBITAN" },
  { to: "/upt-remunerasi/slip", label: "Penerbitan Slip P1 Netto", icon: Receipt, grup: "OUTPUT & PENERBITAN" },
  { to: "/upt-remunerasi/rekapitulasi", label: "Rekapitulasi P1", icon: Table2, grup: "OUTPUT & PENERBITAN" },

  { to: "/upt-remunerasi/pengaduan", label: "Pengaduan Eskalasi", icon: AlertCircle, grup: "LAYANAN" },

  { to: "/upt-remunerasi/unit", label: "Struktur Unit Kerja", icon: Landmark, grup: "MASTER DATA (SUPER ADMIN)" },
  { to: "/upt-remunerasi/master-grade", label: "Master Jabatan & Grade", icon: SheetIcon, grup: "MASTER DATA (SUPER ADMIN)" },
  { to: "/upt-remunerasi/parameter", label: "Parameter Remunerasi", icon: Settings2, grup: "MASTER DATA (SUPER ADMIN)" },
  { to: "/upt-remunerasi/periode", label: "Periode & Jadwal P1", icon: Calendar, grup: "MASTER DATA (SUPER ADMIN)" },
  { to: "/upt-remunerasi/dokumen", label: "Pengaturan Dokumen", icon: Files, grup: "MASTER DATA (SUPER ADMIN)" },
  { to: "/upt-remunerasi/pegawai", label: "Direktori Pegawai", icon: Users, grup: "MASTER DATA (SUPER ADMIN)" },

  { to: "/upt-remunerasi/akun", label: "Akun & Hak Akses", icon: ShieldCheck, grup: "SISTEM & KEAMANAN" },
  { to: "/upt-remunerasi/audit", label: "Jejak Audit", icon: ClipboardList, grup: "SISTEM & KEAMANAN" },
  { to: "/upt-remunerasi/notifikasi", label: "Notifikasi Sistem", icon: Bell, grup: "SISTEM & KEAMANAN" },

  { to: "/upt-remunerasi/akun-saya", label: "Profil & Kata Sandi", icon: User, grup: "AKUN" },
]

export default function UptRemunerasiShell() {
  const { akun } = useAuth()
  const navigate = useNavigate()
  const [periode, setPeriode] = useState(PERIODE_UPT_LIST[0])
  const [notifikasi, setNotifikasi] = useState<NotifikasiItem[]>([])

  const nama = akun?.nama || akun?.username || "Admin UPT Remunerasi"
  const inisial =
    nama
      .split(" ")
      .filter((s) => s.length > 0)
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "UR"

  const user = {
    nama,
    inisial,
    peran: "UPT Remunerasi",
    unit: akun?.unit_nama || "UPT Remunerasi",
  }

  const unreadCount = notifikasi.filter((n) => !n.dibaca).length

  const handleOpenNotif = (item: NotifikasiItem) => {
    setNotifikasi((prev) => prev.map((n) => (n.id === item.id ? { ...n, dibaca: true } : n)))
    if (item.link) navigate(item.link)
  }

  const handleMarkAllRead = () => {
    setNotifikasi((prev) => prev.map((n) => ({ ...n, dibaca: true })))
  }

  return (
    <PeriodeContext.Provider value={{ periode, setPeriode }}>
      <PortalShell
        home="/upt-remunerasi/dashboard"
        nav={NAV_UPT}
        user={user}
        lebar="max-w-[1500px]"
        outletContext={{ periode, setPeriode }}
        headerLeft={<NavbarTimePhaseIndicator />}
        notificationSlot={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative text-primary-foreground/90 hover:bg-white/10 hover:text-white">
                <Bell className="size-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-slate-900">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between px-3 py-2">
                <DropdownMenuLabel className="p-0 text-xs font-semibold">Notifikasi Sistem</DropdownMenuLabel>
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="h-6 text-[10px] text-muted-foreground hover:text-foreground">
                    Tandai dibaca
                  </Button>
                )}
              </div>
              <DropdownMenuSeparator />
              <div className="max-h-72 overflow-y-auto">
                {notifikasi.length === 0 ? (
                  <div className="py-6 text-center text-xs text-muted-foreground">Tidak ada notifikasi baru</div>
                ) : (
                  notifikasi.slice(0, 5).map((item) => (
                    <DropdownMenuItem
                      key={item.id}
                      onClick={() => handleOpenNotif(item)}
                      className="flex cursor-pointer flex-col items-start gap-1 p-3 text-xs"
                    >
                      <div className="flex w-full items-center justify-between">
                        <span className="font-semibold text-foreground">{item.judul}</span>
                        {!item.dibaca && <Badge className="h-1.5 w-1.5 rounded-full p-0" />}
                      </div>
                      <span className="line-clamp-2 text-muted-foreground">{item.pesan}</span>
                      <span className="text-[10px] text-muted-foreground/70">{item.waktu}</span>
                    </DropdownMenuItem>
                  ))
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />
    </PeriodeContext.Provider>
  )
}
