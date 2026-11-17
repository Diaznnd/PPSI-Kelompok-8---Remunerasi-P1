import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { prefixPeran, type Peran } from "@/lib/peran"

export function RoleGuard({ allow }: { allow: Peran[] }) {
  const { akun, loading } = useAuth()
  const location = useLocation()

  if (loading) return <div className="p-8">Memuat...</div>
  if (!akun) return <Navigate to="/login" state={{ from: location }} replace />

  // Kumpulkan semua peran yang dimiliki pengguna
  const userRoles: string[] = [
    akun.peran,
    ...(akun.daftar_peran?.map((r) => r.peran) ?? []),
  ]
  // Setiap akun operasional yang bertugas adalah juga pegawai UNAND
  if (akun.NIP || akun.pegawai_id || akun.peran !== "upt_remunerasi") {
    userRoles.push("pegawai")
  }

  const isAllowed = allow.some((role) => userRoles.includes(role))

  if (!isAllowed)
    return <Navigate to={`${prefixPeran[akun.peran]}/dashboard`} replace />
  return <Outlet />
}
