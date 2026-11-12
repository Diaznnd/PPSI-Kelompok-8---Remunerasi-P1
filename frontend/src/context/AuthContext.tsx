import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { api } from "@/lib/api"
import type { Peran } from "@/lib/peran"
import { AKUN_MOCK } from "@/data/akun-mock"

type Akun = { id: number; username: string; peran: Peran }

type AuthCtx = {
  akun: Akun | null
  loading: boolean
  login: (username: string, password: string) => Promise<Akun>
  logout: () => void
}

// Login palsu untuk pengembangan frontend (aktif kalau VITE_MOCK_AUTH=true di .env).
// Daftar akun ada di src/data/akun-mock.ts.
const MOCK = import.meta.env.VITE_MOCK_AUTH === "true"
const bacaAkunMock = (): Akun | null => {
  try { return JSON.parse(localStorage.getItem("mock_akun") ?? "null") } catch { return null }
}

const Ctx = createContext<AuthCtx>(null!)
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(Ctx)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [akun, setAkun] = useState<Akun | null>(() => (MOCK && localStorage.getItem("token") ? bacaAkunMock() : null))
  const [loading, setLoading] = useState(() => !MOCK && !!localStorage.getItem("token"))

  useEffect(() => {
    if (MOCK || !localStorage.getItem("token")) return
    api.get("/me")
      .then((r) => setAkun(r.data))
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setLoading(false))
  }, [])

  const login = async (username: string, password: string) => {
    if (MOCK) {
      const cocok = AKUN_MOCK.find((x) => x.username === username.trim().toLowerCase() && x.password === password)
      if (!cocok) throw { response: { data: { message: "Email atau kata sandi salah." } } }
      const a: Akun = { id: cocok.id, username: cocok.username, peran: cocok.peran }
      localStorage.setItem("token", "mock")
      localStorage.setItem("mock_akun", JSON.stringify(a))
      setAkun(a)
      return a
    }
    const { data } = await api.post("/login", { username, password })
    localStorage.setItem("token", data.token)
    setAkun(data.akun)
    return data.akun as Akun
  }

  const logout = () => {
    if (MOCK) {
      localStorage.removeItem("token")
      localStorage.removeItem("mock_akun")
      window.location.href = "/login"
      return
    }
    api.post("/logout").finally(() => {
      localStorage.removeItem("token")
      setAkun(null)
      window.location.href = "/login"
    })
  }

  return <Ctx.Provider value={{ akun, loading, login, logout }}>{children}</Ctx.Provider>
}
