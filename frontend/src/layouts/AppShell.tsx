import { NavLink, Outlet } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { menuByRole } from "./menu-by-role"
import { labelPeran } from "@/lib/peran"
import { Button } from "@/components/ui/button"

export default function AppShell() {
  const { akun, logout } = useAuth()
  if (!akun) return null

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 border-r p-4">
        <h1 className="mb-1 text-lg font-bold">SIREMUN P1</h1>
        <p className="mb-6 text-xs text-muted-foreground">{labelPeran[akun.peran]}</p>
        <nav className="flex flex-col gap-1">
          {menuByRole[akun.peran].map((m) => (
            <NavLink
              key={m.to}
              to={m.to}
              className={({ isActive }) =>
                `rounded px-3 py-2 text-sm ${
                  isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`
              }
            >
              {m.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex-1">
        <header className="flex items-center justify-between border-b px-6 py-3">
          <span className="text-sm">{akun.username}</span>
          <Button variant="outline" size="sm" onClick={logout}>Keluar</Button>
        </header>
        <main className="p-6"><Outlet /></main>
      </div>
    </div>
  )
}