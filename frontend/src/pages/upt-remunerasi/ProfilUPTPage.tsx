import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { uptRemunerasiService } from "@/services/uptRemunerasiService"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { User, Mail, Building2, Shield, Hash, Key, Loader2, Eye, EyeOff } from "lucide-react"

export default function ProfilUPTPage() {
  const { akun } = useAuth()
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  })

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const handlePasswordChange = async () => {
    // Validasi form
    if (!passwordForm.current_password || !passwordForm.new_password || !passwordForm.new_password_confirmation) {
      toast.error("Semua field wajib diisi")
      return
    }

    if (passwordForm.new_password.length < 6) {
      toast.error("Password baru minimal 6 karakter")
      return
    }

    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      toast.error("Konfirmasi password tidak cocok")
      return
    }

    try {
      setSubmitting(true)
      await uptRemunerasiService.updatePassword(passwordForm)
      
      toast.success("Password berhasil diubah")
      setShowPasswordDialog(false)
      setPasswordForm({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
      })
      setShowPasswords({ current: false, new: false, confirm: false })
    } catch (error: any) {
      console.error("Error updating password:", error)
      const errMsg = error.response?.data?.message || error.response?.data?.errors?.current_password?.[0] || "Gagal mengubah password"
      toast.error(errMsg)
    } finally {
      setSubmitting(false)
    }
  }

  const getInitials = (name?: string) => {
    if (!name) return "UN"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const peranLabel = (peran: string) => {
    const labels: Record<string, string> = {
      upt_remunerasi: "UPT Remunerasi",
      pegawai: "Pegawai",
      kepegawaian: "Kepegawaian",
      bendahara: "Bendahara",
      verifikator: "Verifikator",
      pj_unit: "PJ Unit",
    }
    return labels[peran] || peran
  }

  if (!akun) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Profil Pengguna</h2>
        <p className="text-sm text-muted-foreground">Kelola informasi akun dan keamanan</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <div className="mx-auto w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <span className="text-3xl font-semibold text-primary">{getInitials(akun.nama)}</span>
            </div>
            <CardTitle>{akun.nama || akun.username}</CardTitle>
            <CardDescription>{peranLabel(akun.peran)}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" onClick={() => setShowPasswordDialog(true)}>
              <Key className="w-4 h-4 mr-2" />
              Ubah Password
            </Button>
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informasi Akun</CardTitle>
            <CardDescription>Detail informasi pengguna dan hak akses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Username */}
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-muted">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <Label className="text-sm font-medium">Username</Label>
                <p className="text-sm text-muted-foreground mt-1">{akun.username}</p>
              </div>
            </div>

            {/* Email */}
            {akun.email && (
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-muted">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-muted-foreground mt-1">{akun.email}</p>
                </div>
              </div>
            )}

            {/* NIP */}
            {akun.NIP && (
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-muted">
                  <Hash className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <Label className="text-sm font-medium">NIP</Label>
                  <p className="text-sm text-muted-foreground mt-1">{akun.NIP}</p>
                </div>
              </div>
            )}

            {/* Unit Kerja */}
            {akun.unit_nama && (
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-muted">
                  <Building2 className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <Label className="text-sm font-medium">Unit Kerja</Label>
                  <p className="text-sm text-muted-foreground mt-1">{akun.unit_nama}</p>
                </div>
              </div>
            )}

            <Separator />

            {/* Peran Utama */}
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-muted">
                <Shield className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <Label className="text-sm font-medium">Peran Utama</Label>
                <p className="text-sm text-muted-foreground mt-1">{peranLabel(akun.peran)}</p>
              </div>
            </div>

            {/* Daftar Peran (Multi-role) */}
            {akun.daftar_peran && akun.daftar_peran.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Daftar Peran & Unit</Label>
                <div className="space-y-2">
                  {akun.daftar_peran.map((rp, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-md bg-muted/50 text-sm">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{peranLabel(rp.peran)}</span>
                      {rp.unit_nama && (
                        <>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-muted-foreground">{rp.unit_nama}</span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hak Akses */}
            {akun.abilities && akun.abilities.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Hak Akses</Label>
                <div className="flex flex-wrap gap-2">
                  {akun.abilities.slice(0, 6).map((ability, idx) => (
                    <span key={idx} className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-xs font-medium text-primary">
                      {ability}
                    </span>
                  ))}
                  {akun.abilities.length > 6 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-muted text-xs font-medium text-muted-foreground">
                      +{akun.abilities.length - 6} lainnya
                    </span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ubah Password</DialogTitle>
            <DialogDescription>Masukkan password lama dan password baru Anda</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="current_password">Password Lama</Label>
              <div className="relative">
                <Input
                  id="current_password"
                  type={showPasswords.current ? "text" : "password"}
                  value={passwordForm.current_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                  disabled={submitting}
                  placeholder="Masukkan password lama"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={submitting}
                >
                  {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="new_password">Password Baru</Label>
              <div className="relative">
                <Input
                  id="new_password"
                  type={showPasswords.new ? "text" : "password"}
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                  disabled={submitting}
                  placeholder="Minimal 6 karakter"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={submitting}
                >
                  {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="new_password_confirmation">Konfirmasi Password Baru</Label>
              <div className="relative">
                <Input
                  id="new_password_confirmation"
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwordForm.new_password_confirmation}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new_password_confirmation: e.target.value })}
                  disabled={submitting}
                  placeholder="Masukkan ulang password baru"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={submitting}
                >
                  {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)} disabled={submitting}>
              Batal
            </Button>
            <Button onClick={handlePasswordChange} disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
