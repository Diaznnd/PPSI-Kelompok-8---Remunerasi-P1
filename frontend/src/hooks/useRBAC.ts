import { useAuth } from "@/context/AuthContext"
import { hasAbility, hasAnyAbility, hasAllAbilities, getAbilities, type Ability } from "@/lib/rbac"

/**
 * Hook untuk cek RBAC di komponen
 * 
 * @example
 * const { can, canAny, canAll, abilities } = useRBAC()
 * 
 * if (can('pengajuan:create')) {
 *   // Show create button
 * }
 */
export function useRBAC() {
  const { akun } = useAuth()

  /**
   * Cek apakah user punya ability tertentu
   */
  const can = (ability: Ability): boolean => {
    if (!akun) return false
    if (akun.abilities && akun.abilities.length > 0) {
      return akun.abilities.includes(ability)
    }
    return hasAbility(akun.peran, ability)
  }

  /**
   * Cek apakah user punya salah satu dari abilities yang diminta
   */
  const canAny = (abilities: Ability[]): boolean => {
    if (!akun) return false
    if (akun.abilities && akun.abilities.length > 0) {
      return abilities.some((ability) => akun.abilities!.includes(ability))
    }
    return hasAnyAbility(akun.peran, abilities)
  }

  /**
   * Cek apakah user punya semua abilities yang diminta
   */
  const canAll = (abilities: Ability[]): boolean => {
    if (!akun) return false
    if (akun.abilities && akun.abilities.length > 0) {
      return abilities.every((ability) => akun.abilities!.includes(ability))
    }
    return hasAllAbilities(akun.peran, abilities)
  }

  /**
   * Get semua abilities user
   */
  const abilities = akun?.abilities && akun.abilities.length > 0
    ? akun.abilities
    : (akun ? getAbilities(akun.peran) : [])

  /**
   * Cek apakah user punya role tertentu
   */
  const hasRole = (role: string): boolean => {
    return akun?.peran === role
  }

  return {
    can,
    canAny,
    canAll,
    abilities,
    hasRole,
    peran: akun?.peran,
  }
}
