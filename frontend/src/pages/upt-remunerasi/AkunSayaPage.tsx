import { useState } from "react"
import {
  Building,
  CheckCircle2,
  Clock,
  KeyRound,
  Mail,
  Shield,
  User,
} from "lucide-react"
import { toast } from "sonner"
import { PageHeader, Button, Input, Card, CardContent } from "./components"
import { Badge } from "@/components/ui/badge"
import { profilSaya } from "@/data/dummy-upt-saya"

interface PasswordErrors {
  oldPass?: string
  newPass?: string
  confirmPass?: string
}

export default function AkunSayaPage() {
  const [oldPass, setOldPass] = useState("")
  const [newPass, setNewPass] = useState("")
  const [confirmPass, setConfirmPass] = useState("")
  const [errors, setErrors] = useState<PasswordErrors>({})

  const hasMinLength = newPass.length >= 8
  const hasUppercase = /[A-Z]/.test(newPass)
  const hasNumber = /[0-9]/.test(newPass)

  const handleUbahPassword = (e: React.FormEvent) => {
    e.preventDefault()
    const nextErrors: PasswordErrors = {}

    if (!oldPass) {
      nextErrors.oldPass = "Kata sandi lama wajib diisi."
    }
    if (!newPass) {
      nextErrors.newPass = "Kata sandi baru wajib diisi."
    } else if (!hasMinLength || !hasUppercase || !hasNumber) {
      nextErrors.newPass =
        "Kata sandi baru minimal 8 karakter serta mengandung huruf kapital dan angka."
    }
    if (!confirmPass) {
      nextErrors.confirmPass = "Konfirmasi kata sandi wajib diisi."
    } else if (newPass !== confirmPass) {
      nextErrors.confirmPass = "Konfirmasi kata sandi baru tidak cocok."
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setOldPass("")
    setNewPass("")
    setConfirmPass("")
    toast.success("Kata sandi berhasil diperbarui.")
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profil & Kata Sandi"
        subtitle="Informasi akun hanya-baca, pengaturan kata sandi, dan ringkasan sesi login."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="rounded-xl">
          <CardContent className="space-y-5 p-6">
            <div className="flex items-center gap-4 border-b pb-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                {profilSaya.inisial}
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">{profilSaya.nama}</h2>
                <p className="text-sm text-muted-foreground">{profilSaya.peranSistem}</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <User className="size-4" /> Nama Lengkap
                </span>
                <span className="font-semibold text-foreground">{profilSaya.nama}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="size-4" /> NIP
                </span>
                <span className="font-mono font-semibold text-foreground">{profilSaya.nip}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Building className="size-4" /> Unit Kerja
                </span>
                <span className="font-medium text-foreground">{profilSaya.unit}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="size-4" /> Email Institusi
                </span>
                <span className="font-medium text-foreground">{profilSaya.email}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Peran Sistem</span>
                <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                  {profilSaya.peranSistem}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center gap-2 border-b pb-3">
              <KeyRound className="size-5 text-primary" />
              <h2 className="text-base font-bold text-foreground">Ubah Kata Sandi</h2>
            </div>

            <form onSubmit={handleUbahPassword} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Kata Sandi Lama</label>
                <Input
                  type="password"
                  value={oldPass}
                  onChange={(e) => {
                    setOldPass(e.target.value)
                    setErrors((prev) => ({ ...prev, oldPass: undefined }))
                  }}
                  placeholder="Masukkan kata sandi saat ini"
                  aria-invalid={Boolean(errors.oldPass)}
                />
                {errors.oldPass && <p className="text-xs text-rose-600">{errors.oldPass}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Kata Sandi Baru</label>
                <Input
                  type="password"
                  value={newPass}
                  onChange={(e) => {
                    setNewPass(e.target.value)
                    setErrors((prev) => ({ ...prev, newPass: undefined }))
                  }}
                  placeholder="Minimal 8 karakter (huruf kapital & angka)"
                  aria-invalid={Boolean(errors.newPass)}
                />
                {errors.newPass && <p className="text-xs text-rose-600">{errors.newPass}</p>}
                <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
                  <span className={hasMinLength ? "text-emerald-700 font-medium" : "text-muted-foreground"}>
                    {hasMinLength ? "✓" : "•"} Min. 8 karakter
                  </span>
                  <span className={hasUppercase ? "text-emerald-700 font-medium" : "text-muted-foreground"}>
                    {hasUppercase ? "✓" : "•"} Huruf kapital
                  </span>
                  <span className={hasNumber ? "text-emerald-700 font-medium" : "text-muted-foreground"}>
                    {hasNumber ? "✓" : "•"} Angka
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Konfirmasi Kata Sandi Baru</label>
                <Input
                  type="password"
                  value={confirmPass}
                  onChange={(e) => {
                    setConfirmPass(e.target.value)
                    setErrors((prev) => ({ ...prev, confirmPass: undefined }))
                  }}
                  placeholder="Ulangi kata sandi baru"
                  aria-invalid={Boolean(errors.confirmPass)}
                />
                {errors.confirmPass && <p className="text-xs text-rose-600">{errors.confirmPass}</p>}
              </div>

              <Button type="submit" className="w-full">
                Simpan Kata Sandi Baru
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5 text-sm">
          <div className="flex items-center gap-3">
            <Clock className="size-5 shrink-0 text-primary" />
            <div>
              <p className="font-semibold text-foreground">Keamanan Sesi Aktif</p>
              <p className="text-xs text-muted-foreground">
                Sesi akan berakhir otomatis setelah tidak aktif selama 30 menit (timeout 30 menit).
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="size-4 text-emerald-600" />
            <span>Login terakhir: 15 Nov 2026, 08:15 WIB</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
