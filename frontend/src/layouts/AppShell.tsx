import { useState } from "react"
import { NavLink, Outlet } from "react-router-dom"
import {
  LayoutGrid, FileText, MessageCircle, LogOut,
  Bell, ChevronDown, Landmark, CalendarDays,
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { menuByRole } from "./menu-by-role"
import { labelPeran } from "@/lib/peran"
import { Button } from "@/components/ui/button"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { dummyPeriode, dummyPeriodeAktif, dummyHariTersisa } from "@/lib/dummy"

// Map label menu ke ikon Lucide
const menuIcon: Record<string, React.ReactNode> = {
  "Dashboard": <LayoutGrid size={16} />,
  "Beranda":   <LayoutGrid size={16} />,
  "Slip P1":   <FileText size={16} />,
  "Pengaduan": <MessageCircle size={16} />,
}

export default function AppShell() {
  const { akun, logout } = useAuth()
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [periode, setPeriode] = useState(dummyPeriodeAktif)
  if (!akun) return null

  const initials = akun.username
    .split(".")
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("")

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ===== SIDEBAR ===== */}
      <aside className="flex w-60 flex-shrink-0 flex-col bg-sidebar text-sidebar-foreground">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
            <Landmark size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight text-white">SIREMUN-P1</p>
            <p className="text-[10px] text-sidebar-foreground/60 leading-tight">Universitas Andalas</p>
          </div>
        </div>

        <div className="mx-4 border-t border-sidebar-border" />

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
            Menu Utama
          </p>
          <ul className="space-y-0.5">
            {menuByRole[akun.peran].map((m) => (
              <li key={m.to}>
                <NavLink
                  to={m.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
                      isActive
                        ? "bg-sidebar-accent text-white font-medium"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-white"
                    }`
                  }
                >
                  <span className="opacity-80">
                    {menuIcon[m.label] ?? <LayoutGrid size={16} />}
                  </span>
                  {m.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <p className="mb-2 mt-6 px-2 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
            Akun
          </p>
          <button
            onClick={() => setLogoutOpen(true)}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/50 hover:text-white"
          >
            <LogOut size={16} className="opacity-80" />
            Keluar
          </button>
        </nav>

        {/* Periode aktif */}
        <div className="border-t border-sidebar-border px-5 py-4">
          <p className="text-[10px] text-sidebar-foreground/40">Periode aktif</p>
          <p className="mt-0.5 text-sm font-semibold text-white">{dummyPeriodeAktif}</p>
          <p className="text-[10px] text-sidebar-foreground/50">{dummyHariTersisa} hari tersisa</p>
        </div>
      </aside>

      {/* ===== MAIN AREA ===== */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-14 flex-shrink-0 items-center justify-between border-b bg-white px-6">
          <div className="flex items-center gap-2">
            <CalendarDays size={15} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Periode:</span>
            <Select value={periode} onValueChange={setPeriode}>
              <SelectTrigger className="h-8 w-auto gap-1 border-0 bg-transparent p-0 text-sm font-semibold shadow-none focus:ring-0">
                <SelectValue />
                <ChevronDown size={14} />
              </SelectTrigger>
              <SelectContent>
                {dummyPeriode.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative rounded-full p-1.5 hover:bg-muted">
              <Bell size={18} className="text-muted-foreground" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                {initials || "RM"}
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold leading-tight">
                  {akun.username.split("@")[0].split(".").map(
                    (s) => s.charAt(0).toUpperCase() + s.slice(1)
                  ).join(" ")}
                </p>
                <p className="text-xs text-muted-foreground leading-tight">{labelPeran[akun.peran]}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-background p-6">
          <Outlet />
        </main>
      </div>

      {/* Logout Dialog */}
      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent className="max-w-sm text-center">
          <DialogHeader className="items-center">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <LogOut size={22} className="text-primary" />
            </div>
            <DialogTitle>Apakah Anda yakin ingin keluar?</DialogTitle>
            <DialogDescription>
              Anda perlu masuk kembali untuk mengakses SIREMUN-P1.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2 flex-row justify-center gap-3 sm:justify-center">
            <Button variant="outline" onClick={() => setLogoutOpen(false)}>Batal</Button>
            <Button onClick={logout}>Keluar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
