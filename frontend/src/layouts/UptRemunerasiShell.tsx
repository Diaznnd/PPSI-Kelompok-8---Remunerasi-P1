import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import {
  Activity,
  AlertCircle,
  Bell,
  BriefcaseBusiness,
  Calculator,
  Calendar,
  CheckCheck,
  ClipboardList,
  Files,
  FileText,
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
import PortalShell from "./PortalShell"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { notifikasiSistem, periodeUPT, uptRemunerasi, type NotifikasiItem } from "@/data/dummy-upt"
import { PeriodeContext } from "@/pages/upt-remunerasi/components"

export const NAV_UPT: { to: string; label: string; icon: LucideIcon; grup: string }[] = [
  { to: "/upt-remunerasi/dashboard", label: "Beranda UPT", icon: Gauge, grup: "MENU UTAMA" },
  { to: "/upt-remunerasi/beranda-saya", label: "Beranda Saya", icon: Home, grup: "MENU UTAMA" },
  { to: "/upt-remunerasi/slip-saya", label: "Slip P1 Saya", icon: Receipt, grup: "MENU UTAMA" },
  { to: "/upt-remunerasi/pengaduan-saya", label: "Pengaduan Saya", icon: MessageSquare, grup: "MENU UTAMA" },

  { to: "/upt-remunerasi/status", label: "Pantau Status Pengajuan", icon: Activity, grup: "PEMANTAUAN" },
  { to: "/upt-remunerasi/rekapitulasi", label: "Rekapitulasi P1", icon: Table2, grup: "PEMANTAUAN" },
  { to: "/upt-remunerasi/pegawai", label: "Direktori Pegawai", icon: Users, grup: "PEMANTAUAN" },

  { to: "/upt-remunerasi/penetapan", label: "Penetapan Jabatan/Grade", icon: BriefcaseBusiness, grup: "PROSES PEMBAYARAN" },
  { to: "/upt-remunerasi/hitung", label: "Hitung Pajak & P1 Netto", icon: Calculator, grup: "PROSES PEMBAYARAN" },
  { to: "/upt-remunerasi/slip", label: "Penerbitan Slip P1", icon: Receipt, grup: "PROSES PEMBAYARAN" },
  { to: "/upt-remunerasi/amprah", label: "Amprah", icon: FileText, grup: "PROSES PEMBAYARAN" },

  { to: "/upt-remunerasi/pengaduan", label: "Pengaduan Eskalasi", icon: AlertCircle, grup: "LAYANAN" },

  { to: "/upt-remunerasi/unit", label: "Struktur Unit Kerja", icon: Landmark, grup: "MASTER & PENGATURAN" },
  { to: "/upt-remunerasi/master-grade", label: "Master Jabatan & Grade", icon: SheetIcon, grup: "MASTER & PENGATURAN" },
  { to: "/upt-remunerasi/parameter", label: "Parameter Remunerasi", icon: Settings2, grup: "MASTER & PENGATURAN" },
  { to: "/upt-remunerasi/periode", label: "Periode & Jadwal P1", icon: Calendar, grup: "MASTER & PENGATURAN" },
  { to: "/upt-remunerasi/dokumen", label: "Pengaturan Dokumen", icon: Files, grup: "MASTER & PENGATURAN" },

  { to: "/upt-remunerasi/akun", label: "Akun & Hak Akses", icon: ShieldCheck, grup: "PENGGUNA & HAK AKSES" },

  { to: "/upt-remunerasi/audit", label: "Jejak Audit", icon: ClipboardList, grup: "PENGAWASAN" },
  { to: "/upt-remunerasi/notifikasi", label: "Notifikasi Sistem", icon: Bell, grup: "PENGAWASAN" },

  { to: "/upt-remunerasi/akun-saya", label: "Profil & Kata Sandi", icon: User, grup: "AKUN" },
]

export default function UptRemunerasiShell() {
  const { akun } = useAuth()
  const navigate = useNavigate()
  const [periode, setPeriode] = useState(periodeUPT[0])
  const [notifikasi, setNotifikasi] = useState<NotifikasiItem[]>(notifikasiSistem)

  const nama = akun?.nama || uptRemunerasi.nama
  const inisial =
    nama
      .split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "UR"

  const user = {
    nama,
    inisial,
    peran: "UPT Remunerasi",
    unit: akun?.unit_nama || uptRemunerasi.unit,
  }

  const unreadCount = notifikasi.filter((n) => !n.dibaca).length

  const handleOpenNotif = (item: NotifikasiItem) => {
    setNotifikasi((prev) => prev.map((n) => (n.id === item.id ? { ...n, dibaca: true } : n)))
    navigate(item.tautan)
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
        headerLeft={
          <div className="flex items-center gap-2">
            <span className="hidden text-sm font-medium text-muted-foreground sm:inline">Periode:</span>
            <Select value={periode} onValueChange={setPeriode}>
              <SelectTrigger className="w-44 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periodeUPT.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
        notificationSlot={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Notifikasi" className="relative bg-background">
                <Bell className="size-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0">
              <DropdownMenuLabel className="flex items-center justify-between px-3 py-2.5">
                <span className="text-xs font-semibold">Notifikasi ({unreadCount} belum dibaca)</span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      handleMarkAllRead()
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                  >
                    <CheckCheck className="size-3" /> Tandai semua
                  </button>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="my-0" />
              <div className="max-h-72 divide-y overflow-y-auto">
                {notifikasi.slice(0, 5).map((item) => (
                  <DropdownMenuItem
                    key={item.id}
                    onSelect={() => handleOpenNotif(item)}
                    className={`flex cursor-pointer flex-col items-start gap-1 rounded-none px-3 py-2.5 ${
                      item.dibaca ? "opacity-75" : "bg-primary/5"
                    }`}
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-foreground">{item.judul}</span>
                      {!item.dibaca && <span className="size-2 shrink-0 rounded-full bg-primary" />}
                    </div>
                    <p className="line-clamp-2 text-[11px] text-muted-foreground">{item.deskripsi}</p>
                    <span className="text-[10px] text-muted-foreground/80">{item.waktu}</span>
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator className="my-0" />
              <DropdownMenuItem
                onSelect={() => navigate("/upt-remunerasi/notifikasi")}
                className="cursor-pointer justify-center py-2 text-xs font-semibold text-primary"
              >
                Lihat Semua Notifikasi
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />
    </PeriodeContext.Provider>
  )
}
