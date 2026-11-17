import { useAuth } from "@/context/AuthContext"
import { useRBAC } from "@/hooks/useRBAC"
import type { Ability } from "@/lib/rbac"
import type { Peran } from "@/lib/peran"
import { Navigate, useLocation } from "react-router-dom"
import type { ReactNode } from "react"

type ProtectedRouteProps = {
  /** Children yang akan di-render jika authorized */
  children: ReactNode
  /** Required ability untuk akses route */
  ability?: Ability
  /** Multiple abilities (OR logic) */
  anyOf?: Ability[]
  /** Multiple abilities (AND logic) */
  allOf?: Ability[]
  /** Required role untuk akses route */
  role?: Peran
  /** Multiple roles (OR logic) */
  anyRole?: Peran[]
  /** Redirect path jika tidak authorized (default: /unauthorized) */
  redirectTo?: string
}

/**
 * Protected route component dengan RBAC
 * 
 * @example
 * <ProtectedRoute ability="pengajuan:create">
 *   <BuatPengajuanPage />
 * </ProtectedRoute>
 * 
 * @example
 * <ProtectedRoute anyOf={["pengajuan:approve", "pengajuan:approve-unit"]}>
 *   <ApprovePage />
 * </ProtectedRoute>
 * 
 * @example
 * <ProtectedRoute role="bendahara">
 *   <BendaharaPage />
 * </ProtectedRoute>
 */
export function ProtectedRoute({
  children,
  ability,
  anyOf,
  allOf,
  role,
  anyRole,
  redirectTo = "/unauthorized",
}: ProtectedRouteProps) {
  const { akun, loading } = useAuth()
  const { can, canAny, canAll, hasRole } = useRBAC()
  const location = useLocation()

  // Tunggu loading selesai
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  // Cek login (preserve location so login page can redirect back)
  if (!akun) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Cek role-based access
  if (role && !hasRole(role)) {
    return <Navigate to={redirectTo} replace />
  }

  if (anyRole && !anyRole.includes(akun.peran)) {
    return <Navigate to={redirectTo} replace />
  }

  // Cek ability-based access
  if (ability && !can(ability)) {
    return <Navigate to={redirectTo} replace />
  }

  if (anyOf && !canAny(anyOf)) {
    return <Navigate to={redirectTo} replace />
  }

  if (allOf && !canAll(allOf)) {
    return <Navigate to={redirectTo} replace />
  }

  return <>{children}</>
}
