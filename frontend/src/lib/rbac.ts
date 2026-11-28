import type { Peran } from "./peran"

/**
 * Ability format: resource:action
 * Contoh: pengajuan:create, pengajuan:read-all, dokumen:upload
 */
export type Ability = string

/**
 * Definisi abilities untuk setiap role
 * Harus sync dengan backend (AuthController::getAbilitiesForRole)
 */
export const roleAbilities: Record<Peran, Ability[]> = {
  pegawai: [
    "pengajuan:create",
    "pengajuan:read-own",
    "pengajuan:update-own",
    "dokumen:upload-own",
    "profil:read-own",
    "profil:update-own",
  ],
  kepegawaian: [
    "pengajuan:read-all",
    "pengajuan:verify",
    "pengajuan:reject",
    "pegawai:read-all",
    "pegawai:create",
    "pegawai:update",
    "akun:create",
    "akun:update",
    "dokumen:read-all",
  ],
  bendahara: [
    "pengajuan:read-verified",
    "pengajuan:approve",
    "pengajuan:reject",
    "pembayaran:create",
    "pembayaran:read-all",
    "laporan:generate",
    "dokumen:read-all",
  ],
  verifikator: [
    "pengajuan:read-all",
    "pengajuan:verify",
    "pengajuan:reject",
    "pengajuan:request-revision",
    "dokumen:read-all",
    "dokumen:verify",
  ],
  penanggung_jawab: [
    "pengajuan:read-unit",
    "pengajuan:approve-unit",
    "pengajuan:reject-unit",
    "pegawai:read-unit",
    "laporan:read-unit",
    "dokumen:read-unit",
  ],
  upt_remunerasi: [
    "pengajuan:read-all",
    "pengajuan:approve-final",
    "pengajuan:reject",
    "pembayaran:read-all",
    "pembayaran:process",
    "laporan:read-all",
    "laporan:generate",
    "dokumen:read-all",
    "pengaturan:manage",
  ],
}

/**
 * Cek apakah role memiliki ability tertentu
 */
export function hasAbility(peran: Peran, ability: Ability): boolean {
  return roleAbilities[peran]?.includes(ability) ?? false
}

/**
 * Cek apakah role memiliki salah satu dari abilities yang diminta
 */
export function hasAnyAbility(peran: Peran, abilities: Ability[]): boolean {
  return abilities.some((ability) => hasAbility(peran, ability))
}

/**
 * Cek apakah role memiliki semua abilities yang diminta
 */
export function hasAllAbilities(peran: Peran, abilities: Ability[]): boolean {
  return abilities.every((ability) => hasAbility(peran, ability))
}

/**
 * Get semua abilities untuk role
 */
export function getAbilities(peran: Peran): Ability[] {
  return roleAbilities[peran] ?? []
}

/**
 * Group abilities by resource
 * Contoh: { pengajuan: ['create', 'read-own'], dokumen: ['upload-own'] }
 */
export function groupAbilitiesByResource(peran: Peran): Record<string, string[]> {
  const abilities = getAbilities(peran)
  const grouped: Record<string, string[]> = {}

  for (const ability of abilities) {
    const [resource, action] = ability.split(":")
    if (!grouped[resource]) grouped[resource] = []
    grouped[resource].push(action)
  }

  return grouped
}
