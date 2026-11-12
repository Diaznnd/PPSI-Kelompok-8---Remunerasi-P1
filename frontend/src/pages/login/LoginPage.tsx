import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { BarChart3, Eye, EyeOff, FileText, GraduationCap, Mail, ShieldCheck, Workflow } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"
import { prefixPeran } from "@/lib/peran"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const FITUR = [
  { icon: BarChart3, judul: "Perhitungan transparan", desk: "Rincian remunerasi tercatat secara akurat." },
  { icon: Workflow, judul: "Alur verifikasi terdokumentasi", desk: "Setiap tahapan dapat dipantau dengan mudah." },
  { icon: FileText, judul: "Slip P1 dapat diakses mandiri", desk: "Dokumen tersedia aman untuk setiap periode." },
]

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [lihat, setLihat] = useState(false)
  const [kirim, setKirim] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setKirim(true)
    try {
      const akun = await login(username, password)
      navigate(`${prefixPeran[akun.peran]}/dashboard`, { replace: true })
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Gagal masuk. Periksa email dan kata sandi Anda.")
    } finally {
      setKirim(false)
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Panel kiri */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-muted/40 p-12 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="size-5" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold">SIREMUN-P1</p>
            <p className="text-[11px] text-muted-foreground">Universitas Andalas</p>
          </div>
        </div>

        <div className="max-w-md space-y-6">
          <span className="inline-block rounded-full border bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Sistem Informasi Institusi
          </span>
          <h1 className="text-5xl font-semibold tracking-tight text-primary">SIREMUN-P1</h1>
          <p className="text-muted-foreground">Sistem Informasi Remunerasi Insentif Kerja Berdasarkan Jabatan P1</p>
          <ul className="space-y-4 pt-2">
            {FITUR.map(({ icon: Icon, judul, desk }) => (
              <li key={judul} className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-card text-primary">
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

        <p className="text-xs text-muted-foreground">© 2026 Universitas Andalas</p>
      </div>

      {/* Panel kanan */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-2 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="size-7" />
            </div>
            <h2 className="text-2xl font-semibold">Masuk ke SIREMUN-P1</h2>
            <p className="text-sm text-muted-foreground">Gunakan akun institusi Anda untuk melanjutkan.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Email Institusi</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="username" className="pl-9" placeholder="nama@unand.ac.id" value={username} onChange={(e) => setUsername(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Kata Sandi</Label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="password" type={lihat ? "text" : "password"} className="px-9" placeholder="Masukkan kata sandi" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setLihat((v) => !v)} aria-label={lihat ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {lihat ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={kirim}>
              {kirim ? "Memproses..." : "Masuk"}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            Lupa kata sandi atau akun belum aktif? <span className="font-semibold text-primary">Hubungi UPT Remunerasi.</span>
          </p>
        </div>
      </div>
    </div>
  )
}
