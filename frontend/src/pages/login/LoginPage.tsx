import { useState, useEffect, type FormEvent } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import {
  BarChart3,
  Eye,
  EyeOff,
  FileText,
  Lock,
  Shield,
  User,
  Workflow,
  Sparkles,
  ArrowRight,
  Zap,
} from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"
import { labelPeran, prefixPeran, type Peran } from "@/lib/peran"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Shortcut login untuk development (FTI & FT)
const LOGIN_SHORTCUTS: Record<"fti" | "ft", { role: string; username: string; color: string }[]> = {
  fti: [
    { role: "Penanggung Jawab", username: "penanggungjawab1_teknologiinformasi", color: "bg-purple-500" },
    { role: "Bendahara", username: "bendahara3_teknologiinformasi", color: "bg-blue-500" },
    { role: "Kepegawaian", username: "kepegawaian5_teknologiinformasi", color: "bg-green-500" },
    { role: "Verifikator", username: "verifikator1001_teknologiinformasi", color: "bg-orange-500" },
    { role: "UPT Remunerasi", username: "uptremunerasi1002_teknologiinformasi", color: "bg-red-500" },
    { role: "Pegawai", username: "pegawai45_teknologiinformasi", color: "bg-gray-500" },
  ],
  ft: [
    { role: "Penanggung Jawab", username: "penanggungjawab51_teknik", color: "bg-purple-500" },
    { role: "Bendahara", username: "bendahara53_teknik", color: "bg-blue-500" },
    { role: "Kepegawaian", username: "kepegawaian55_teknik", color: "bg-green-500" },
    { role: "Verifikator", username: "verifikator1001_teknologiinformasi", color: "bg-orange-500" },
    { role: "UPT Remunerasi", username: "uptremunerasi1002_teknologiinformasi", color: "bg-red-500" },
    { role: "Pegawai", username: "pegawai56_teknik", color: "bg-gray-500" },
  ],
}

const FITUR = [
  {
    icon: Shield,
    judul: "Otorisasi Berbasis Peran (RBAC)",
    desk: "6 tingkat peran dengan batasan wewenang dan permissions granular.",
  },
  {
    icon: BarChart3,
    judul: "Perhitungan transparan",
    desk: "Rincian remunerasi tercatat secara akurat dan akuntabel.",
  },
  {
    icon: Workflow,
    judul: "Alur verifikasi terdokumentasi",
    desk: "Setiap tahapan pengajuan diproses sesuai wewenang peran terkait.",
  },
  {
    icon: FileText,
    judul: "Slip P1 dapat diakses mandiri",
    desk: "Dokumen tersedia aman untuk setiap periode remunerasi.",
  },
]

export default function LoginPage() {
  const { akun, login, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [lihat, setLihat] = useState(false)
  const [kirim, setKirim] = useState(false)
  const [peranTerpilih, setPeranTerpilih] = useState<Peran | null>(null)
  const [shortcutUnit, setShortcutUnit] = useState<"fti" | "ft">("fti")

  // Redirect otomatis jika sudah memiliki sesi login aktif
  useEffect(() => {
    if (!loading && akun) {
      const from = (location.state as any)?.from?.pathname
      const prefix = prefixPeran[akun.peran]
      const target = from || (prefix ? `${prefix}/dashboard` : "/error-peran")
      navigate(target, { replace: true })
    }
  }, [akun, loading, navigate, location])

  async function handleLogin(u: string, p: string) {
    setKirim(true)
    try {
      const userAkun = await login(u, p)
      const from = (location.state as any)?.from?.pathname
      const prefix = prefixPeran[userAkun.peran]
      const target = from || (prefix ? `${prefix}/dashboard` : "/error-peran")

      toast.success("Berhasil masuk!", {
        description: `Selamat datang, ${userAkun.username} (${labelPeran[userAkun.peran] ?? userAkun.peran}). Mengarahkan ke dashboard...`,
      })

      navigate(target, { replace: true })
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ??
          "Gagal masuk. Periksa kembali username/email dan kata sandi Anda."
      )
    } finally {
      setKirim(false)
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!username.trim() || !password) return
    await handleLogin(username, password)
  }


  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Panel kiri: Branding & Fitur RBAC */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-muted/40 p-12 lg:flex">
        <div className="flex items-center gap-3">
          <img
            src="/LOGO UNAND.svg"
            alt="Logo Universitas Andalas"
            className="size-10 object-contain drop-shadow-sm"
          />
          <div className="leading-tight">
            <p className="text-sm font-bold">SIREMUN-P1</p>
            <p className="text-[11px] text-muted-foreground">Universitas Andalas</p>
          </div>
        </div>

        <div className="max-w-md space-y-6">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Shield className="size-3" />
              Sistem Terproteksi RBAC
            </span>
          </div>
          <h1 className="text-5xl font-semibold tracking-tight text-primary">SIREMUN-P1</h1>
          <p className="text-muted-foreground">
            Sistem Informasi Remunerasi Insentif Kerja Berdasarkan Jabatan P1 dengan kontrol akses
            bertingkat.
          </p>
          <ul className="space-y-4 pt-2">
            {FITUR.map(({ icon: Icon, judul, desk }) => (
              <li key={judul} className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-card text-primary shadow-xs">
                  <Icon className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{judul}</p>
                  <p className="text-xs text-muted-foreground">{desk}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <p>© 2026 Universitas Andalas</p>
          <Link
            to="/rbac-demo"
            className="flex items-center gap-1 text-primary hover:underline"
          >
            <Sparkles className="size-3.5" />
            RBAC Matrix Demo
          </Link>
        </div>
      </div>

      {/* Panel kanan: Form Login & Uji Coba RBAC */}
      <div className="flex flex-col justify-center px-6 py-8 sm:px-10 lg:px-14 overflow-y-auto">
        <div className="mx-auto w-full max-w-md space-y-6">
          {/* Header */}
          <div className="space-y-2 text-center">
            <div className="mx-auto flex size-35 items-center justify-center rounded-2xl border bg-card p-2 shadow-xs">
              <img
                src="/LOGO UNAND.svg"
                alt="Logo Universitas Andalas"
                className="size-40 object-contain"
              />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">Masuk ke SIREMUN-P1</h2>
            <p className="text-sm text-muted-foreground">
              Gunakan akun institusi Anda.
            </p>
          </div>

          {/* Form Login */}
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username atau Email Institusi</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="username"
                  className="pl-9"
                  placeholder="Username atau email@unand.ac.id"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value)
                    setPeranTerpilih(null)
                  }}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Kata Sandi</Label>
                {peranTerpilih && (
                  <span className="text-[11px] text-muted-foreground">
                    Peran aktif:{" "}
                    <strong className="text-primary">{labelPeran[peranTerpilih]}</strong>
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={lihat ? "text" : "password"}
                  className="px-9"
                  placeholder="Masukkan kata sandi"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setLihat((v) => !v)}
                  aria-label={lihat ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {lihat ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={kirim}>
              {kirim ? (
                "Memproses Autentikasi..."
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Masuk ke Sistem <ArrowRight className="size-4" />
                </span>
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            Lupa kata sandi atau akun belum aktif? <span className="font-semibold text-primary">Hubungi UPT Remunerasi.</span>
          </p>

          {/* Development Shortcuts */}
          {import.meta.env.DEV && (
            <div className="mt-8 space-y-3 rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-medium text-primary">
                  <Zap className="size-4" />
                  Quick Login (Development Only)
                </div>
                <div className="inline-flex rounded-md border bg-background p-0.5 text-[10px] font-semibold">
                  <button
                    type="button"
                    onClick={() => setShortcutUnit("fti")}
                    className={`rounded px-2 py-0.5 transition-colors ${shortcutUnit === "fti" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    FTI
                  </button>
                  <button
                    type="button"
                    onClick={() => setShortcutUnit("ft")}
                    className={`rounded px-2 py-0.5 transition-colors ${shortcutUnit === "ft" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    FT
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {LOGIN_SHORTCUTS[shortcutUnit].map((shortcut) => (
                  <Button
                    key={shortcut.username}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-auto flex-col items-start gap-0.5 py-2 text-left"
                    onClick={() => handleLogin(shortcut.username, "password123")}
                    disabled={kirim}
                  >
                    <span className="flex items-center gap-1.5 text-xs font-medium">
                      <span className={`size-2 rounded-full ${shortcut.color}`} />
                      {shortcut.role}
                    </span>
                    <span className="w-full truncate font-mono text-[10px] text-muted-foreground">
                      {shortcut.username}
                    </span>
                  </Button>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground">
                Password: <code className="rounded bg-muted px-1 py-0.5">password123</code>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
