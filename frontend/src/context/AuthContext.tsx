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

// Login palsu untuk pengembangan frontend (aktif kalau VITE_MOCK_AUTH=true di .env)
const MOCK = import.meta.env.VITE_MOCK_AUTH === "true"
const akunMock: Akun = { id: 1, username: "rina@unand.ac.id", peran: "pegawai" }

const Ctx = createContext<AuthCtx>(null!)
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(Ctx)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [akun, setAkun] = useState<Akun | null>(() =>
    MOCK && localStorage.getItem("token") ? akunMock : null
  )
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
      localStorage.setItem("token", "mock")
      setAkun(akunMock)
      return akunMock
    }
    const { data } = await api.post("/login", { username, password })
    localStorage.setItem("token", data.token)
    setAkun(data.akun)
    return data.akun as Akun
  }

  const logout = () => {
    if (MOCK) {
      localStorage.removeItem("token")
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
// import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
// import { api } from "@/lib/api"
// import type { Peran } from "@/lib/peran"

// type Akun = { id: number; username: string; peran: Peran }

// type AuthCtx = {
//   akun: Akun | null
//   loading: boolean
//   login: (username: string, password: string) => Promise<Akun>
//   logout: () => void
// }

// const Ctx = createContext<AuthCtx>(null!)
// // eslint-disable-next-line react-refresh/only-export-components
// export const useAuth = () => useContext(Ctx)

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [akun, setAkun] = useState<Akun | null>(null)
//   const [loading, setLoading] = useState(() => !!localStorage.getItem("token"))

//   useEffect(() => {
//     if (!localStorage.getItem("token")) return
//     api.get("/me")
//       .then((r) => setAkun(r.data))
//       .catch(() => localStorage.removeItem("token"))
//       .finally(() => setLoading(false))
//   }, [])

//   const login = async (username: string, password: string) => {
//     const { data } = await api.post("/login", { username, password })
//     localStorage.setItem("token", data.token)
//     setAkun(data.akun)
//     return data.akun as Akun
//   }

//   const logout = () => {
//     api.post("/logout").finally(() => {
//       localStorage.removeItem("token")
//       setAkun(null)
//       window.location.href = "/login"
//     })
//   }

//   return <Ctx.Provider value={{ akun, loading, login, logout }}>{children}</Ctx.Provider>
// }