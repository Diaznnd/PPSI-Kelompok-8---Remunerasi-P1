import { useRBAC } from "@/hooks/useRBAC"
import type { Ability } from "@/lib/rbac"
import type { ReactNode } from "react"

type CanProps = {
  /** Ability yang diperlukan */
  ability?: Ability
  /** Multiple abilities (OR logic) - render jika punya salah satu */
  anyOf?: Ability[]
  /** Multiple abilities (AND logic) - render jika punya semua */
  allOf?: Ability[]
  /** Children yang akan di-render jika pass check */
  children: ReactNode
  /** Fallback yang akan di-render jika tidak pass check */
  fallback?: ReactNode
}

/**
 * Component untuk conditional rendering berdasarkan abilities
 * 
 * @example
 * <Can ability="pengajuan:create">
 *   <Button>Buat Pengajuan</Button>
 * </Can>
 * 
 * @example
 * <Can anyOf={["pengajuan:approve", "pengajuan:approve-unit"]}>
 *   <Button>Approve</Button>
 * </Can>
 * 
 * @example
 * <Can ability="pengajuan:verify" fallback={<div>Akses ditolak</div>}>
 *   <VerifyForm />
 * </Can>
 */
export function Can({ ability, anyOf, allOf, children, fallback = null }: CanProps) {
  const { can, canAny, canAll } = useRBAC()

  let hasPermission = false

  if (ability) {
    hasPermission = can(ability)
  } else if (anyOf) {
    hasPermission = canAny(anyOf)
  } else if (allOf) {
    hasPermission = canAll(allOf)
  }

  return hasPermission ? <>{children}</> : <>{fallback}</>
}
