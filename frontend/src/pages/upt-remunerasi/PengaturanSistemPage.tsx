import { useState, useEffect } from "react"
import { uptRemunerasiService } from "@/services/uptRemunerasiService"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Settings, Calendar, Power, AlertTriangle, Loader2, Shield, Clock, Database } from "lucide-react"

type KonfigurasiSistem = {
  periode_aktif: string
  batas_pengajuan: number
  mode_sistem: "normal" | "maintenance" | "readonly"
  alasan_mode?: string
  fitur: {
    pengajuan_bendahara: boolean
    penetapan_jabatan: boolean
    penerbitan_slip: boolean
    pengaduan: boolean
    notifikasi: boolean
  }
}

export default function PengaturanSistemPage() {
  const [loading, setLoading] = useState(true)
  const [config, setConfig] = useState<KonfigurasiSistem | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [showModeDialog, setShowModeDialog] = useState(false)
  const [modeForm, setModeForm] = useState({
    mode: "normal" as "normal" | "maintenance" | "readonly",
    alasan: "",
  })

  useEffect(() => {
    loadKonfigurasi()
  }, [])

  const loadKonfigurasi = async () => {
    try {
      setLoading(true)
      const res = await uptRemunerasiService.getKonfigurasi()
      setConfig(res.data)
    } catch (error) {
      console.error("Error loading konfigurasi:", error)
      toast.error("Gagal memuat konfigurasi sistem")
      // Fallback data
      setConfig({
        periode_aktif: "2026-11",
        batas_pengajuan: 5,
        mode_sistem: "normal",
        fitur: {
          pengajuan_bendahara: true,
          penetapan_jabatan: true,
          penerbitan_slip: true,
          pengaduan: true,
          notifikasi: true,
        },
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePeriode = async (periode: string) => {
    if (!config) return

    try {
      setSubmitting(true)
      await uptRemunerasiService.updatePeriodeAktif(periode)
      toast.success("Periode aktif berhasil diubah")
      setConfig({ ...config, periode_aktif: periode })
    } catch (error) {
      console.error("Error updating periode:", error)
      toast.error("Gagal mengubah periode aktif")
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateMode = async () => {
    if (!config) return

    if (modeForm.mode !== "normal" && !modeForm.alasan.trim()) {
      toast.error("Alasan wajib diisi untuk mode maintenance/readonly")
      return
    }

    try {
      setSubmitting(true)
      await uptRemunerasiService.toggleModeSistem(modeForm.mode, modeForm.alasan)
      toast.success(`Mode sistem diubah ke ${modeLabel(modeForm.mode)}`)
      setConfig({ ...config, mode_sistem: modeForm.mode, alasan_mode: modeForm.alasan })
      setShowModeDialog(false)
      setModeForm({ mode: "normal", alasan: "" })
    } catch (error) {
      console.error("Error updating mode:", error)
      toast.error("Gagal mengubah mode sistem")
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleFitur = async (fitur: string, aktif: boolean) => {
    if (!config) return

    try {
      await uptRemunerasiService.toggleFitur(fitur, aktif)
      toast.success(`Fitur ${fiturLabel(fitur)} ${aktif ? "diaktifkan" : "dinonaktifkan"}`)
      setConfig({
        ...config,
        fitur: { ...config.fitur, [fitur]: aktif },
      })
    } catch (error) {
      console.error("Error toggling fitur:", error)
      toast.error("Gagal mengubah status fitur")
    }
  }

  const handleBackup = async () => {
    try {
      setSubmitting(true)
      await uptRemunerasiService.backupKonfigurasi()
      toast.success("Backup konfigurasi berhasil dibuat")
    } catch (error) {
      console.error("Error creating backup:", error)
      toast.error("Gagal membuat backup konfigurasi")
    } finally {
      setSubmitting(false)
    }
  }

  const modeLabel = (mode: string) => {
    const labels: Record<string, string> = {
      normal: "Normal",
      maintenance: "Maintenance",
      readonly: "Read-Only",
    }
    return labels[mode] || mode
  }

  const fiturLabel = (fitur: string) => {
    const labels: Record<string, string> = {
      pengajuan_bendahara: "Pengajuan Bendahara",
      penetapan_jabatan: "Penetapan Jabatan",
      penerbitan_slip: "Penerbitan Slip",
      pengaduan: "Pengaduan",
      notifikasi: "Notifikasi",
    }
    return labels[fitur] || fitur
  }

  const generatePeriodeOptions = () => {
    const options = []
    const now = new Date()
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const periode = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      const label = d.toLocaleDateString("id-ID", { year: "numeric", month: "long" })
      options.push({ value: periode, label })
    }
    return options
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!config) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Gagal memuat konfigurasi sistem</p>
        <Button onClick={loadKonfigurasi} className="mt-4">
          Coba Lagi
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Pengaturan Sistem</h2>
        <p className="text-sm text-muted-foreground">Kelola konfigurasi dan pengaturan sistem remunerasi</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Periode Aktif */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <CardTitle>Periode Aktif</CardTitle>
                <CardDescription>Tentukan periode pembayaran yang sedang berjalan</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Periode Pembayaran</Label>
              <Select value={config.periode_aktif} onValueChange={handleUpdatePeriode} disabled={submitting}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {generatePeriodeOptions().map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Batas Tanggal Pengajuan</Label>
              <Select
                value={String(config.batas_pengajuan)}
                onValueChange={(v) => {
                  const tanggal = parseInt(v)
                  uptRemunerasiService
                    .updateBatasPengajuan(tanggal)
                    .then(() => {
                      toast.success("Batas pengajuan berhasil diubah")
                      setConfig({ ...config, batas_pengajuan: tanggal })
                    })
                    .catch(() => toast.error("Gagal mengubah batas pengajuan"))
                }}
                disabled={submitting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                    <SelectItem key={d} value={String(d)}>
                      Tanggal {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Bendahara harus mengajukan sebelum tanggal ini setiap bulan</p>
            </div>
          </CardContent>
        </Card>

        {/* Mode Sistem */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Power className="w-5 h-5 text-primary" />
              <div>
                <CardTitle>Mode Sistem</CardTitle>
                <CardDescription>Kontrol status operasional sistem</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <p className="font-medium">{modeLabel(config.mode_sistem)}</p>
                <p className="text-sm text-muted-foreground">
                  {config.mode_sistem === "normal" && "Sistem berjalan normal"}
                  {config.mode_sistem === "maintenance" && "Sistem dalam maintenance"}
                  {config.mode_sistem === "readonly" && "Sistem hanya baca"}
                </p>
                {config.alasan_mode && <p className="text-xs text-muted-foreground mt-1">Alasan: {config.alasan_mode}</p>}
              </div>
              <div
                className={`w-3 h-3 rounded-full ${
                  config.mode_sistem === "normal" ? "bg-green-500" : config.mode_sistem === "maintenance" ? "bg-red-500" : "bg-yellow-500"
                }`}
              />
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setModeForm({ mode: config.mode_sistem, alasan: config.alasan_mode || "" })
                setShowModeDialog(true)
              }}
            >
              <Settings className="w-4 h-4 mr-2" />
              Ubah Mode Sistem
            </Button>

            {config.mode_sistem !== "normal" && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <p className="text-xs text-yellow-700">Sistem tidak dalam mode normal. Beberapa fitur mungkin tidak tersedia.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fitur Sistem */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <div>
                <CardTitle>Kontrol Fitur</CardTitle>
                <CardDescription>Aktifkan atau nonaktifkan fitur sistem secara individual</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(config.fitur).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <Label className="cursor-pointer">{fiturLabel(key)}</Label>
                      <p className="text-xs text-muted-foreground">
                        Status: {value ? "Aktif" : "Nonaktif"}
                      </p>
                    </div>
                  </div>
                  <Switch checked={value} onCheckedChange={(checked) => handleToggleFitur(key, checked)} disabled={submitting} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Backup & Recovery */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              <div>
                <CardTitle>Backup & Recovery</CardTitle>
                <CardDescription>Kelola backup konfigurasi sistem</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Backup Konfigurasi</p>
                <p className="text-xs text-muted-foreground">Simpan snapshot konfigurasi saat ini</p>
              </div>
              <Button onClick={handleBackup} disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Database className="w-4 h-4 mr-2" />}
                Buat Backup
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mode Dialog */}
      <Dialog open={showModeDialog} onOpenChange={setShowModeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ubah Mode Sistem</DialogTitle>
            <DialogDescription>Pilih mode operasional sistem dan berikan alasan jika diperlukan</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Mode Sistem</Label>
              <Select value={modeForm.mode} onValueChange={(v: any) => setModeForm({ ...modeForm, mode: v })} disabled={submitting}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal - Semua fitur aktif</SelectItem>
                  <SelectItem value="readonly">Read-Only - Hanya baca data</SelectItem>
                  <SelectItem value="maintenance">Maintenance - Sistem dinonaktifkan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {modeForm.mode !== "normal" && (
              <div className="space-y-2">
                <Label htmlFor="alasan">Alasan</Label>
                <Textarea
                  id="alasan"
                  value={modeForm.alasan}
                  onChange={(e) => setModeForm({ ...modeForm, alasan: e.target.value })}
                  placeholder="Jelaskan alasan perubahan mode sistem..."
                  rows={3}
                  disabled={submitting}
                />
                <p className="text-xs text-muted-foreground">Alasan akan ditampilkan kepada pengguna</p>
              </div>
            )}

            {modeForm.mode !== "normal" && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-yellow-700">
                  Mode {modeLabel(modeForm.mode)} akan membatasi akses pengguna. Pastikan Anda memahami dampaknya sebelum melanjutkan.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModeDialog(false)} disabled={submitting}>
              Batal
            </Button>
            <Button onClick={handleUpdateMode} disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Ubah Mode
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
