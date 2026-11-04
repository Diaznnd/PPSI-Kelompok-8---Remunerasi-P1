import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { prefixPeran, type Peran } from "@/lib/peran"

export function RoleGuard({ allow }: { allow: Peran[] }) {
  const { akun, loading } = useAuth()
  if (loading) return <div className="p-8">Memuat...</div>
  if (!akun) return <Navigate to="/login" replace />
  if (!allow.includes(akun.peran))
    return <Navigate to={`${prefixPeran[akun.peran]}/dashboard`} replace />
  return <Outlet />
}