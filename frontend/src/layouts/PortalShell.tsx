import { useState, type ReactNode } from "react"
import { Link, NavLink, Outlet } from "react-router-dom"
import {
  Bell,
  ChevronDown,
  GraduationCap,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon,
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export type NavItem = { to: string; label: string; icon: LucideIcon; grup?: string; group?: string }
export type NavItem = { to: string; label: string; icon: LucideIcon; grup?: string; group?: string }

type Props = {
  home: string
  nav: NavItem[]
  user: { nama: string; inisial: string; peran: string; unit?: string }
  secondaryNav?: { title: string; items: NavItem[] }
  headerLeft?: ReactNode
  notificationSlot?: ReactNode
  outletContext?: unknown
  lebar?: string
}

export default function PortalShell({
  home,
  nav,
  user,
  secondaryNav,
  headerLeft,
  notificationSlot,
  outletContext,
  lebar = "max-w-7xl",
}: Props) {
  const { logout } = useAuth()
  const [konfirmasi, setKonfirmasi] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const toggleSidebar = () => setCollapsed((c) => !c)

  // kelompokkan menu berurutan berdasarkan `grup` / `group`
  const kelompok = nav.reduce<{ judul: string; item: NavItem[] }[]>((acc, n) => {
    const judul = n.grup ?? n.group ?? "MENU UTAMA"
    const judul = n.grup ?? n.group ?? "MENU UTAMA"
    const akhir = acc[acc.length - 1]
    if (akhir && akhir.judul === judul) akhir.item.push(n)
    else acc.push({ judul, item: [n] })
    return acc
  }, [])

  function renderNav(onClick?: () => void) {
    return (
      <>
        {/* Kelompok menu utama */}
        {kelompok.map((g, i) => (
          <div key={g.judul}>
            {/* Separator antar section (kecuali pertama) */}
            {i > 0 && <div className="my-2 border-t border-border/50" />}
            <div className="space-y-0.5">
              {!collapsed && (
                <p className="mb-1 px-3 pt-1 text-[10px] font-semibold tracking-widest text-muted-foreground/60 uppercase select-none">
                  {g.judul}
                </p>
              )}
              {g.item.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={onClick}
                  title={collapsed ? label : undefined}
                  className={({ isActive }) =>
                    cn(
                      "relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                      collapsed && "justify-center",
                      isActive
                        ? "bg-primary/10 font-medium text-primary before:absolute before:-left-3 before:bottom-1 before:top-1 before:w-0.5 before:bg-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )
                  }
                >
                  <Icon className="size-4 shrink-0" />
                  {!collapsed && label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}

        {/* Seksi tambahan: Portal Mandiri Pegawai (untuk akun multi-role) */}
        {secondaryNav && secondaryNav.items.length > 0 && (
          <div>
            <div className="my-2 border-t border-border/50" />
            <div className="space-y-0.5">
              {!collapsed && (
                <p className="mb-1 px-3 pt-1 text-[10px] font-semibold tracking-widest text-muted-foreground/60 uppercase select-none">
                  {secondaryNav.title}
                </p>
              )}
              {secondaryNav.items.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={onClick}
                  title={collapsed ? label : undefined}
                  className={({ isActive }) =>
                    cn(
                      "relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                      collapsed && "justify-center",
                      isActive
                        ? "bg-primary/10 font-medium text-primary before:absolute before:-left-3 before:bottom-1 before:top-1 before:w-0.5 before:bg-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )
                  }
                >
                  <Icon className="size-4 shrink-0" />
                  {!collapsed && label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar Desktop */}
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col overflow-x-hidden border-r bg-card transition-[width] duration-200 ease-in-out md:flex",
          collapsed ? "w-[72px]" : "w-[272px]"
        )}
      >
        {/* Logo */}
        <Link
          to={home}
          title={collapsed ? "SIREMUN-P1 — Universitas Andalas" : undefined}
          className={cn(
            "flex h-20 shrink-0 items-center border-b transition-all",
            collapsed ? "justify-center px-2" : "gap-3 px-5"
          )}
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl text-primary-foreground shadow-sm">
            <img
              src="/LOGO UNAND.svg"
              alt="Logo Universitas Andalas"
              className="h-full w-full object-contain"
            />
          </div>
          {!collapsed && (
            <div className="min-w-0 leading-tight">
              <p className="truncate text-[15px] font-bold tracking-tight">SIREMUN-P1</p>
              <p className="mt-1 truncate text-[11px] text-muted-foreground">Universitas Andalas</p>
            </div>
          )}
        </Link>

        {/* Navigasi */}
        <nav className="flex-1 space-y-0 overflow-y-auto px-3 py-4">
          {renderNav()}

          {/* Akun / Keluar */}
          <div>
            <div className="my-2 border-t border-border/50" />
            <div className="space-y-0.5">
              {!collapsed && (
                <p className="mb-1 px-3 pt-1 text-[10px] font-semibold tracking-widest text-muted-foreground/60 uppercase select-none">AKUN</p>
              )}
              <button
                onClick={() => setKonfirmasi(true)}
                title={collapsed ? "Keluar" : undefined}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10",
                  collapsed && "justify-center"
                )}
              >
                <LogOut className="size-4 shrink-0" />
                {!collapsed && "Keluar"}
              </button>
            </div>
          </div>
        </nav>

        {/* Info periode */}
        {!collapsed && (
          <div className="m-3 shrink-0 rounded-lg bg-primary/5 p-3">
            <p className="text-[11px] text-muted-foreground">Periode aktif</p>
            <p className="text-sm font-bold">Oktober 2026</p>
            <p className="text-[11px] text-muted-foreground">31 hari kalender</p>
          </div>
        )}
      </aside>

      {/* Konten Utama */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-3 border-b bg-card px-4 md:px-8">
          <div className="flex min-w-0 items-center gap-2.5">
            {/* Mobile menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden" aria-label="Buka menu navigasi">
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SheetHeader className="border-b px-5 py-5 text-left">
                  <SheetTitle className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <GraduationCap className="size-5" />
                    </span>
                    <span>
                      <span className="block text-sm font-bold">SIREMUN-P1</span>
                      <span className="block text-[11px] font-normal text-muted-foreground">Universitas Andalas</span>
                    </span>
                  </SheetTitle>
                </SheetHeader>
                <nav className="min-h-0 flex-1 space-y-6 overflow-y-auto px-3 py-5">
                  {renderNav(() => setMobileMenuOpen(false))}
                  <div className="border-t pt-4">
                    <button
                      onClick={() => { setMobileMenuOpen(false); setKonfirmasi(true) }}
                      className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10"
                    >
                      <LogOut className="size-4" />
                      Keluar
                    </button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>

            {/* Toggle sidebar desktop */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              aria-label={collapsed ? "Buka sidebar" : "Tutup sidebar"}
              title={collapsed ? "Buka sidebar" : "Tutup sidebar"}
              className="hidden size-9 shrink-0 text-muted-foreground hover:bg-muted hover:text-foreground md:inline-flex"
            >
              {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
            </Button>

            <div className="min-w-0 truncate">{headerLeft}</div>
          </div>

          {/* Kanan header */}
          <div className="flex items-center gap-3">
            {notificationSlot ?? (
              <Button variant="outline" size="icon" aria-label="Notifikasi">
                <Bell className="size-4" />
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-md px-1 py-1 outline-none hover:bg-muted">
                  <span className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {user.inisial}
                  </span>
                  <span className="hidden text-left leading-tight sm:block">
                    <span className="block text-sm font-semibold">{user.nama}</span>
                    <span className="block text-[11px] text-muted-foreground">
                      {user.peran}{user.unit ? ` • ${user.unit}` : ""}
                    </span>
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

        <main className={cn("mx-auto w-full flex-1 p-4 md:p-8", lebar)}>
          <Outlet context={outletContext} />
        </main>
      </div>

      {/* Dialog Konfirmasi Keluar */}
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
            <Button variant="outline" onClick={() => setKonfirmasi(false)}>Batal</Button>
            <Button onClick={() => logout()}>Keluar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
