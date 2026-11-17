import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { api } from "@/lib/api"
import type { Peran } from "@/lib/peran"
import { getAbilities, type Ability } from "@/lib/rbac"

export type PeranUnit = {
  peran: string
  unit_id: number | null
  unit_nama: string | null
}

export type Akun = {
  id: number
  username: string
  email?: string
  peran: Peran
  pegawai_id?: number
  NIP?: string
  nama?: string
  unit_nama?: string
  daftar_peran?: PeranUnit[]
  abilities?: Ability[]
}

type AuthCtx = {
  akun: Akun | null
  loading: boolean
  login: (username: string, password: string) => Promise<Akun>
  logout: () => void
}

const Ctx = createContext<AuthCtx>(null!)
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(Ctx)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [akun, setAkun] = useState<Akun | null>(null)
  const [loading, setLoading] = useState<boolean>(() => !!localStorage.getItem("token"))

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      setLoading(false)
      return
    }

    // Ambil data identitas dan abilities dari API Backend (/api/me)
    api.get("/me")
      .then((r) => {
        const data = r.data
        setAkun({
          id: data.id,
          username: data.username,
          email: data.email,
          peran: data.peran,
          nama: data.nama,
          unit_nama: data.unit_nama,
          pegawai_id: data.pegawai_id,
          NIP: data.NIP,
          daftar_peran: data.daftar_peran,
          abilities: data.abilities && data.abilities.length > 0 ? data.abilities : getAbilities(data.peran),
        })
      })
      .catch(() => {
        localStorage.removeItem("token")
        setAkun(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (username: string, password: string): Promise<Akun> => {
    // Autentikasi langsung ke database melalui POST /api/login
    const { data } = await api.post("/login", { username, password })
    localStorage.setItem("token", data.token)

    const user: Akun = {
      id: data.akun.id,
      username: data.akun.username,
      email: data.akun.email,
      peran: data.akun.peran,
      nama: data.akun.nama,
      unit_nama: data.akun.unit_nama,
      pegawai_id: data.akun.pegawai_id,
      NIP: data.akun.NIP,
      daftar_peran: data.akun.daftar_peran,
      abilities: data.abilities && data.abilities.length > 0 ? data.abilities : getAbilities(data.akun.peran),
    }

    setAkun(user)
    return user
  }

  const logout = () => {
    // Logout dengan menghapus token di backend dan local storage
    api.post("/logout")
      .catch(() => {})
      .finally(() => {
        localStorage.removeItem("token")
        setAkun(null)
        window.location.href = "/login"
      })
  }

  return <Ctx.Provider value={{ akun, loading, login, logout }}>{children}</Ctx.Provider>
}
