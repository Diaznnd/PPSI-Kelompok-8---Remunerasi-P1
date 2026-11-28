import { AlertTriangle, ArrowLeft, Home, LogIn } from "lucide-react"
import { useLocation, useNavigate, useRouteError } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import { prefixPeran } from "@/lib/peran"

export default function SystemErrorPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const routeError = useRouteError() as any
  const { akun, logout } = useAuth()

  const path = location.pathname
  const isUndefinedRoute = path.includes("undefined")
  const validPrefix = akun?.peran ? prefixPeran[akun.peran] : null
  const dashboardUrl = validPrefix ? `${validPrefix}/dashboard` : "/login"

  const judul = isUndefinedRoute
    ? "Terjadi Kendala Pengarahan Halaman"
    : routeError?.status === 404 || !routeError
    ? "Halaman Tidak Ditemukan"
    : "Terjadi Kesalahan Sistem"

  const deskripsi = isUndefinedRoute
    ? "Sistem gagal memetakan tujuan dashboard untuk sesi atau peran akun saat ini. Silakan kembali ke dashboard yang sesuai atau masuk ulang."
    : routeError?.message
    ? "Terjadi gangguan saat memuat halaman yang diminta. Silakan coba muat ulang atau kembali ke beranda."
    : "Alamat halaman yang Anda buka tidak tersedia, telah dipindahkan, atau tidak dapat diakses oleh peran akun Anda."

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <div className="w-full max-w-lg rounded-2xl border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
          <AlertTriangle className="size-8" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-foreground">{judul}</h1>
        <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{deskripsi}</p>

        <div className="mt-5 rounded-lg border bg-muted/40 px-4 py-2.5 text-xs text-muted-foreground">
          <span>Rute tujuan: </span>
          <code className="font-mono font-semibold text-foreground">{path}</code>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-1.5 size-4" />
            Kembali
          </Button>
          {validPrefix ? (
            <Button onClick={() => navigate(dashboardUrl, { replace: true })}>
              <Home className="mr-1.5 size-4" />
              Ke Dashboard Saya
            </Button>
          ) : (
            <Button
              onClick={() => {
                if (akun) {
                  logout()
                } else {
                  navigate("/login", { replace: true })
                }
              }}
            >
              <LogIn className="mr-1.5 size-4" />
              Ke Halaman Login
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
