import { useState } from "react"
import { Link, NavLink, Outlet, useOutletContext } from "react-router-dom"
import { Bell, ChevronDown, FileText, Gauge, GraduationCap, LogOut, MessageSquare } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DAFTAR_PERIODE, PERIODE_AKTIF, pegawai } from "@/data/dummy-pegawai"

const NAV = [
  { to: "/pegawai/dashboard", label: "Beranda", icon: Gauge, end: true },
  { to: "/pegawai/slip", label: "Slip P1", icon: FileText, end: false },
  { to: "/pegawai/pengaduan", label: "Pengaduan", icon: MessageSquare, end: false },
]

export function usePeriode() {
  return useOutletContext<{ periode: string }>()
}

export default function PegawaiShell() {
  const { logout } = useAuth()
  const [periode, setPeriode] = useState(PERIODE_AKTIF)
  const [konfirmasi, setKonfirmasi] = useState(false)

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r bg-card md:flex">
        <Link to="/pegawai/dashboard" className="flex h-16 items-center gap-3 border-b px-4">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="size-5" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold">SIREMUN-P1</p>
            <p className="text-[11px] text-muted-foreground">Universitas Andalas</p>
          </div>
        </Link>

        <nav className="flex-1 space-y-6 px-3 py-4">
          <div className="space-y-1">
            <p className="px-3 pb-1 text-[11px] font-medium tracking-wide text-muted-foreground">MENU UTAMA</p>
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    "relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-primary/10 font-medium text-primary before:absolute before:-left-3 before:bottom-1 before:top-1 before:w-0.5 before:bg-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )
                }
              >
                <Icon className="size-4" />
                {label}
              </NavLink>
            ))}
          </div>
          <div className="space-y-1">
            <p className="px-3 pb-1 text-[11px] font-medium tracking-wide text-muted-foreground">AKUN</p>
            <button
              onClick={() => setKonfirmasi(true)}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
            >
              <LogOut className="size-4" />
              Keluar
            </button>
          </div>
        </nav>

        <div className="m-3 rounded-lg bg-primary/5 p-3">
          <p className="text-[11px] text-muted-foreground">Periode aktif</p>
          <p className="text-sm font-bold">{PERIODE_AKTIF}</p>
          <p className="text-[11px] text-muted-foreground">31 hari kalender</p>
        </div>
      </aside>

      {/* Konten */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-card px-4 md:px-8">
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-muted-foreground sm:inline">Periode:</span>
            <Select value={periode} onValueChange={setPeriode}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DAFTAR_PERIODE.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" aria-label="Notifikasi">
              <Bell className="size-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-md px-1 py-1 outline-none hover:bg-muted">
                  <span className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {pegawai.inisial}
                  </span>
                  <span className="hidden text-left leading-tight sm:block">
                    <span className="block text-sm font-semibold">{pegawai.nama}</span>
                    <span className="block text-[11px] text-muted-foreground">Pegawai</span>
                  </span>
                  <ChevronDown className="size-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem variant="destructive" onSelect={() => setKonfirmasi(true)}>
                  <LogOut /> Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 p-4 md:p-8">
          <Outlet context={{ periode }} />
        </main>
      </div>

      {/* Dialog konfirmasi logout */}
      <Dialog open={konfirmasi} onOpenChange={setKonfirmasi}>
        <DialogContent showCloseButton={false} className="sm:max-w-sm">
          <DialogHeader className="items-center text-center">
            <div className="mb-1 flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <LogOut className="size-5" />
            </div>
            <DialogTitle>Apakah Anda yakin ingin keluar?</DialogTitle>
            <DialogDescription>Anda perlu masuk kembali untuk mengakses SIREMUN-P1.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button variant="outline" onClick={() => setKonfirmasi(false)}>
              Batal
            </Button>
            <Button onClick={() => logout()}>Keluar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
