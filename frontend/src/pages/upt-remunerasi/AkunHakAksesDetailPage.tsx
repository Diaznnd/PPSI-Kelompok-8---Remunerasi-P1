import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, User, Shield, Building2, Key, Loader2, Ban, CheckCircle2, XCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { uptRemunerasiService } from "@/services/uptRemunerasiService"

type RoleUnit = {
  peran: string
  unit_id: number | null
  unit_nama?: string
}

type AkunDetail = {
  id: number
  username: string
  NIP?: string
  peran: string
  unit_id?: number | null
  unit_nama?: string
  aktif: boolean
  roles: RoleUnit[]
  created_at: string
  updated_at: string
  last_login?: string
}

export default function AkunHakAksesDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [akun, setAkun] = useState<AkunDetail | null>(null)
  
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [newPassword, setNewPassword] = useState("")

  useEffect(() => {
    if (id) {
      loadAkunDetail()
    }
  }, [id])

  const loadAkunDetail = async () => {
    if (!id) return

    try {
      setLoading(true)
      // Get from list and find by ID
      const res = await uptRemunerasiService.getAkunList()
      const akunData = res.data.find((a: any) => a.id.toString() === id)
      
      if (akunData) {
        setAkun({
          id: akunData.id,
          username: akunData.username,
          NIP: akunData.NIP,
          peran: akunData.peran,
          unit_id: akunData.unit_id,
          unit_nama: akunData.unit_nama,
          aktif: akunData.aktif,
          roles: akunData.daftar_peran || [],
          created_at: akunData.created_at || new Date().toISOString(),
          updated_at: akunData.updated_at || new Date().toISOString(),
          last_login: akunData.last_login,
        })
      } else {
        toast.error("Akun tidak ditemukan")
        navigate("/upt-remunerasi/akun")
      }
    } catch (error) {
      console.error("Error loading akun detail:", error)
      toast.error("Gagal memuat detail akun")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async () => {
    if (!akun) return

    try {
      setSubmitting(true)
      await uptRemunerasiService.toggleAkunStatus(akun.id)
      
      setAkun({ ...akun, aktif: !akun.aktif })
      toast.success(`Akun berhasil ${!akun.aktif ? "diaktifkan" : "dinonaktifkan"}`)
    } catch (error) {
      console.error("Error toggling status:", error)
      toast.error("Gagal mengubah status akun")
    } finally {
      setSubmitting(false)
    }
  }

  const handleResetPassword = async () => {
    if (!akun) return

    if (newPassword && newPassword.length < 6) {
      toast.error("Password minimal 6 karakter")
      return
    }

    try {
      setSubmitting(true)
      await uptRemunerasiService.resetPasswordAkun(akun.id, newPassword || undefined)
      
      toast.success("Password berhasil direset")
      setShowResetDialog(false)
      setNewPassword("")
    } catch (error) {
      console.error("Error resetting password:", error)
      toast.error("Gagal mereset password")
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const peranLabel = (peran: string) => {
    const labels: Record<string, string> = {
      upt_remunerasi: "UPT Remunerasi",
      pegawai: "Pegawai",
      kepegawaian: "Kepegawaian",
      bendahara: "Bendahara",
      verifikator: "Verifikator",
      penanggung_jawab: "PJ Unit",
    }
    return labels[peran] || peran
  }

  const peranColor = (peran: string) => {
    const colors: Record<string, string> = {
      upt_remunerasi: "bg-purple-100 text-purple-800",
      pegawai: "bg-blue-100 text-blue-800",
      kepegawaian: "bg-green-100 text-green-800",
      bendahara: "bg-yellow-100 text-yellow-800",
      verifikator: "bg-orange-100 text-orange-800",
      penanggung_jawab: "bg-pink-100 text-pink-800",
    }
    return colors[peran] || "bg-gray-100 text-gray-800"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!akun) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Akun tidak ditemukan</p>
        <Button onClick={() => navigate("/upt-remunerasi/akun")} className="mt-4">
          Kembali ke Daftar Akun
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="px-0 text-xs gap-1.5 mb-4"
          onClick={() => navigate("/upt-remunerasi/akun")}
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Akun
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Detail Akun</h2>
            <p className="text-sm text-muted-foreground">Informasi lengkap dan pengaturan akun pengguna</p>
          </div>
          <Badge variant={akun.aktif ? "default" : "secondary"} className="px-3 py-1">
            {akun.aktif ? (
              <>
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Aktif
              </>
            ) : (
              <>
                <XCircle className="w-3 h-3 mr-1" />
                Nonaktif
              </>
            )}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <User className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-lg">{akun.username}</CardTitle>
            <CardDescription>
              <Badge className={peranColor(akun.peran)}>{peranLabel(akun.peran)}</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowResetDialog(true)}
              disabled={submitting}
            >
              <Key className="w-4 h-4 mr-2" />
              Reset Password
            </Button>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <p className="text-sm font-medium">Status Akun</p>
                <p className="text-xs text-muted-foreground">{akun.aktif ? "Aktif" : "Nonaktif"}</p>
              </div>
              <Switch checked={akun.aktif} onCheckedChange={handleToggleStatus} disabled={submitting} />
            </div>
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informasi Akun</CardTitle>
            <CardDescription>Detail identitas dan hak akses pengguna</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Username</Label>
                <p className="text-sm font-medium">{akun.username}</p>
              </div>
              {akun.NIP && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">NIP</Label>
                  <p className="text-sm font-medium font-mono">{akun.NIP}</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Primary Role */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Peran Utama
              </Label>
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
                <Badge className={peranColor(akun.peran)}>{peranLabel(akun.peran)}</Badge>
                {akun.unit_nama && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Building2 className="w-3 h-3" />
                      {akun.unit_nama}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Multi-Role */}
            {akun.roles.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Daftar Peran ({akun.roles.length})
                </Label>
                <div className="space-y-2">
                  {akun.roles.map((role, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg border bg-background">
                      <div className="flex items-center gap-3">
                        <Badge className={peranColor(role.peran)} variant="outline">
                          {peranLabel(role.peran)}
                        </Badge>
                        {role.unit_nama && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Building2 className="w-3 h-3" />
                            {role.unit_nama}
                          </div>
                        )}
                      </div>
                      {role.peran === akun.peran && (
                        <Badge variant="secondary" className="text-xs">
                          Primary
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <Label className="text-muted-foreground">Dibuat</Label>
                <p className="font-medium">{formatDate(akun.created_at)}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Diperbarui</Label>
                <p className="font-medium">{formatDate(akun.updated_at)}</p>
              </div>
              {akun.last_login && (
                <div className="space-y-1 col-span-2">
                  <Label className="text-muted-foreground">Login Terakhir</Label>
                  <p className="font-medium">{formatDate(akun.last_login)}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Card */}
      <Card>
        <CardHeader>
          <CardTitle>Aksi</CardTitle>
          <CardDescription>Tindakan yang dapat dilakukan pada akun ini</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate(`/upt-remunerasi/akun?edit=${akun.id}`)}>
              <Shield className="w-4 h-4 mr-2" />
              Edit Peran & Unit
            </Button>
            <Button
              variant="outline"
              onClick={handleToggleStatus}
              disabled={submitting}
              className={akun.aktif ? "" : "border-green-500 text-green-700 hover:bg-green-50"}
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : akun.aktif ? (
                <Ban className="w-4 h-4 mr-2" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              )}
              {akun.aktif ? "Nonaktifkan" : "Aktifkan"} Akun
            </Button>
            <Button variant="outline" onClick={() => setShowResetDialog(true)}>
              <Key className="w-4 h-4 mr-2" />
              Reset Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reset Password Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>Reset password untuk akun: {akun.username}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new_password">Password Baru (Opsional)</Label>
              <Input
                id="new_password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Kosongkan untuk password default"
                disabled={submitting}
              />
              <p className="text-xs text-muted-foreground">
                {newPassword ? "Password custom akan digunakan" : "Jika kosong, password akan direset ke default (12345678)"}
              </p>
            </div>

            {newPassword && newPassword.length < 6 && (
              <p className="text-xs text-red-600">Password minimal 6 karakter</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetDialog(false)} disabled={submitting}>
              Batal
            </Button>
            <Button onClick={handleResetPassword} disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Reset Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
