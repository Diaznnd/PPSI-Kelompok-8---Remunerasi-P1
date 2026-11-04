import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { api } from "@/lib/api"
import type { Peran } from "@/lib/peran"

type Akun = { id: number; username: string; peran: Peran }

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
  const [loading, setLoading] = useState(() => !!localStorage.getItem("token"))

  useEffect(() => {
    if (!localStorage.getItem("token")) return
    api.get("/me")
      .then((r) => setAkun(r.data))
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setLoading(false))
  }, [])

  const login = async (username: string, password: string) => {
    const { data } = await api.post("/login", { username, password })
    localStorage.setItem("token", data.token)
    setAkun(data.akun)
    return data.akun as Akun
  }

  const logout = () => {
    api.post("/logout").finally(() => {
      localStorage.removeItem("token")
      setAkun(null)
      window.location.href = "/login"
    })
  }

  return <Ctx.Provider value={{ akun, loading, login, logout }}>{children}</Ctx.Provider>
}