import { useState, useMemo, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  FileText,
  Settings2,
  ShieldAlert,
  Users,
  Calendar,
  RefreshCw,
  ArrowRight,
  Receipt,
  BriefcaseBusiness,
} from "lucide-react"
import {
  PageHeader,
  StatusBadge,
  Button,
  usePeriode,
  Card,
  CardContent,
} from "./components"
import { Badge } from "@/components/ui/badge"
import { uptRemunerasiService } from "@/services/uptRemunerasiService"
import { useToast } from "@/hooks/use-toast"
import { rupiah } from "@/lib/format"

function MiniStepper({ status }: { status: string }) {
  const step =
    status === "amprah_tersedia"
      ? 4
      : status === "netto_ditetapkan"
      ? 3
      : status === "terverifikasi"
      ? 2
      : status === "diajukan" || status === "dikembalikan"
      ? 1
      : 0

  return (
    <div className="flex items-center gap-1" title={`Tahap ${step} dari 4`}>
      {[1, 2, 3, 4].map((s) => (
        <div
          key={s}
          className={`h-1.5 w-6 rounded-full ${
            s <= step ? "bg-primary" : "bg-muted"
          }`}
        />
      ))}
    </div>
  )
}

export default function BerandaUptRemunerasiPage() {
  const navigate = useNavigate()
  const { periode } = usePeriode()
  const [statusFilter, setStatusFilter] = useState("semua")
  const [loading, setLoading] = useState(true)
  const [dashboard, setDashboard] = useState<any>(null)
  const [alerts, setAlerts] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadDashboard()
  }, [periode])

  const loadDashboard = async () => {
    setLoading(true)
    try {
      const [dashboardData, alertsData] = await Promise.all([
        uptRemunerasiService.getDashboard(periode),
        uptRemunerasiService.getAlerts(periode),
      ])
      setDashboard(dashboardData)
      setAlerts(alertsData)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal Memuat Dashboard",
        description: error.response?.data?.message || "Terjadi kesalahan saat memuat data dashboard",
      })
    } finally {
      setLoading(false)
    }
  }

  const waitingHitungCount = useMemo(
    () => dashboard?.statistik?.menunggu_hitung_pajak || 0,
    [dashboard]
  )
  const readyAmprahCount = useMemo(
    () => (dashboard?.pengajuan_unit || []).filter((p: any) => p.status === "netto_ditetapkan").length,
    [dashboard]
  )
  const slipBelumTerbitCount = useMemo(
    () => (dashboard?.pengajuan_unit || []).filter((p: any) => !["selesai", "amprah_tersedia"].includes(p.status)).reduce((acc: number, p: any) => acc + p.pegawai, 0),
    [dashboard]
  )
  const eskalasiCount = useMemo(
    () => dashboard?.statistik?.pengaduan_eskalasi || 0,
    [dashboard]
  )
  const usulanMenungguCount = useMemo(
    () => dashboard?.statistik?.menunggu_penetapan_jabatan || 0,
    [dashboard]
  )

  const statCards = [
    {
      label: "Menunggu Pajak / Netto",
      value: waitingHitungCount,
      sub: "Pengajuan Terverifikasi",
      icon: Settings2,
      to: "/upt-remunerasi/hitung",
    },
    {
      label: "Amprah Siap Disusun",
      value: readyAmprahCount,
      sub: "Netto Ditetapkan",
      icon: FileText,
      to: "/upt-remunerasi/amprah",
    },
    {
      label: "Slip Belum Terbit",
      value: slipBelumTerbitCount,
      sub: "Pegawai menunggu Netto",
      icon: Receipt,
      to: "/upt-remunerasi/slip",
    },
    {
      label: "Pengaduan Eskalasi",
      value: eskalasiCount,
      sub: "Diteruskan ke UPT",
      icon: AlertCircle,
      to: "/upt-remunerasi/pengaduan",
    },
    {
      label: "Usulan Jabatan Menunggu",
      value: usulanMenungguCount,
      sub: "Siap ditetapkan SK",
      icon: BriefcaseBusiness,
      to: "/upt-remunerasi/penetapan",
    },
  ]

  const filteredUnits = useMemo(() => {
    if (!dashboard?.pengajuan_unit) return []
    return dashboard.pengajuan_unit.filter(
      (p: any) => statusFilter === "semua" || p.status === statusFilter
    )
  }, [statusFilter, dashboard])

  const perluTindakan = useMemo(() => {
    if (!dashboard?.pengajuan_unit) return []
    const items: { id: string; unit: string; tugas: string; tanggal: string; status: string; to: string }[] = []

    dashboard.pengajuan_unit
      .filter((p: any) => p.status === "terverifikasi" || p.status === "netto_ditetapkan")
      .forEach((p: any) => {
        items.push({
          id: p.id,
          unit: p.unit,
          tugas: p.status === "terverifikasi" ? "Hitung Pajak & P1 Netto" : "Susun Amprah Pembayaran",
          tanggal: p.diajukan_pada || "-",
          status: p.status,
          to:
            p.status === "terverifikasi"
              ? `/upt-remunerasi/hitung/${encodeURIComponent(p.id)}`
              : `/upt-remunerasi/amprah/${encodeURIComponent(p.id)}`,
        })
      })

    return items.sort((a, b) => a.tanggal.localeCompare(b.tanggal))
  }, [dashboard])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!dashboard) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-10 text-center space-y-3">
        <AlertCircle className="mx-auto size-10 text-rose-600" />
        <h3 className="text-base font-semibold text-rose-900">Gagal Memuat Ringkasan Beranda</h3>
        <p className="text-xs text-rose-700">Terjadi gangguan koneksi sementara saat mengambil data periode.</p>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-rose-300"
          onClick={loadDashboard}
        >
          <RefreshCw className="size-4" /> Muat Ulang
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Selamat datang, Dewi Anggraini"
        subtitle={`Ringkasan operasional dan tugas UPT Remunerasi untuk periode ${periode}.`}
      />

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <Calendar className="size-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">
              Periode Aktif: {periode} • <span className="text-primary">Hari ini: 15 Nov 2026</span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Pantau jadwal tahapan siklus pembayaran bulanan (Pedoman Tabel 5.1).
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-lg border bg-card px-3 py-1.5 text-muted-foreground">
            1–5: Rekap Absensi
          </span>
          <span className="rounded-lg border border-primary bg-primary text-primary-foreground px-3 py-1.5 font-semibold shadow-xs">
            6–8: SK Penetapan (Berjalan)
          </span>
          <span className="rounded-lg border bg-card px-3 py-1.5 text-muted-foreground">
            9–13: Pencairan SAKU
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <button
              key={card.label}
              type="button"
              onClick={() => navigate(card.to)}
              className="rounded-xl border bg-card p-5 text-left transition-all hover:border-primary/50 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <div className="flex items-start justify-between">
                <p className="text-xs font-medium text-muted-foreground">{card.label}</p>
                <span className="rounded-lg bg-primary/10 p-2 text-primary">
                  <Icon className="size-4" />
                </span>
              </div>
              <p className="mt-3 text-2xl font-bold text-foreground">{card.value}</p>
              <p className="mt-1 text-[11px] text-muted-foreground flex items-center justify-between">
                <span>{card.sub}</span>
                <ArrowRight className="size-3 text-primary" />
              </p>
            </button>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <BarChart3 className="size-4 text-primary" /> Total P1 Netto per Unit
                </h3>
                <p className="text-xs text-muted-foreground">Periode {periode}</p>
              </div>
            </div>
            <div className="mt-6 flex h-56 items-end gap-4 sm:gap-6 border-b px-2 overflow-x-auto">
              {(dashboard?.pengajuan_unit || []).slice(0, 7).map((unit: any) => {
                const value = unit.netto || 0
                const heightPct = Math.max(12, Math.round((value / 600_000_000) * 100))
                return (
                  <div key={unit.unit_id} className="flex flex-1 min-w-[54px] flex-col items-center justify-end gap-2">
                    <span className="text-[10px] font-semibold text-muted-foreground whitespace-nowrap">
                      {Math.round(value / 1_000_000)} jt
                    </span>
                    <div
                      className="w-full max-w-[36px] rounded-t-md bg-primary transition-all hover:bg-primary/80"
                      style={{ height: `${heightPct}%` }}
                      title={`${unit.unit}: ${rupiah(value)}`}
                    />
                    <span className="text-[11px] font-medium text-muted-foreground truncate max-w-[54px]">{unit.unit}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <CheckCircle2 className="size-4 text-primary" /> Aktivitas Terbaru (Audit)
              </h3>
              <Link to="/upt-remunerasi/audit" className="text-xs font-medium text-primary hover:underline">
                Lihat Semua
              </Link>
            </div>
            <ul className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {(dashboard?.audit_terbaru || []).slice(0, 10).map((item: any) => (
                <li key={item.id} className="flex gap-2.5 text-xs border-b pb-2 last:border-0">
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate">
                      <span className="font-semibold">{item.aktor}</span> — {item.aksi}{" "}
                      <span className="font-mono text-primary">{item.objek}</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground">{item.waktu}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-sm">Progres Unit Bulan Ini</h3>
                <p className="text-xs text-muted-foreground">Status penyusunan dan penetapan P1 seluruh unit</p>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-8 rounded-md border border-input bg-background px-2.5 text-xs"
              >
                <option value="semua">Semua Status</option>
                <option value="draft">Draft (Belum Mengajukan)</option>
                <option value="diajukan">Menunggu Verifikasi</option>
                <option value="dikembalikan">Dikembalikan</option>
                <option value="terverifikasi">Terverifikasi</option>
                <option value="netto_ditetapkan">Netto Ditetapkan</option>
                <option value="amprah_tersedia">Amprah Tersedia</option>
              </select>
            </div>

            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-xs">
                <thead className="bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="p-2.5 text-left font-medium">Unit Kerja</th>
                    <th className="p-2.5 text-left font-medium">Status</th>
                    <th className="p-2.5 text-left font-medium">Progres</th>
                    <th className="p-2.5 text-left font-medium">Diperbarui</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredUnits.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-muted-foreground">
                        Tidak ada unit pada status ini.
                      </td>
                    </tr>
                  ) : (
                    filteredUnits.map((u) => (
                      <tr key={u.id} className="hover:bg-muted/20">
                        <td className="p-2.5 font-medium">
                          <div className="flex items-center gap-2">
                            <span>{u.unit}</span>
                            {u.status === "draft" && (
                              <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800 text-[10px]">
                                Belum Mengajukan
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-2.5"><StatusBadge status={u.status} /></td>
                        <td className="p-2.5"><MiniStepper status={u.status} /></td>
                        <td className="p-2.5 text-muted-foreground">{u.diajukanPada || "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-amber-200 bg-amber-50/30">
            <CardContent className="p-5 space-y-3">
              <h3 className="font-semibold text-sm text-amber-950 flex items-center gap-2">
                <ShieldAlert className="size-4 text-amber-600" /> Peringatan & Alert
              </h3>
              {alerts && alerts.total_alerts > 0 ? (
                <ul className="space-y-2 text-xs text-amber-900">
                  {alerts.alerts.slice(0, 4).map((alert: any, idx: number) => (
                    <li key={idx} className="flex items-center justify-between rounded-lg border border-amber-200/80 bg-white/80 p-2.5">
                      <div className="flex-1 pr-2">
                        <p className="font-semibold">{alert.judul}</p>
                        <p className="text-[11px] text-muted-foreground">{alert.pesan}</p>
                      </div>
                      <Badge variant={alert.prioritas === "kritis" ? "destructive" : "default"} className="text-[10px]">
                        {alert.prioritas}
                      </Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-amber-900 italic py-4 text-center">
                  Tidak ada alert saat ini
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Users className="size-4 text-primary" /> Perlu Tindakan (Terlama)
                </h3>
              </div>
              {perluTindakan.length === 0 ? (
                <p className="text-xs text-muted-foreground italic py-4 text-center">
                  Seluruh tugas periode ini telah diselesaikan.
                </p>
              ) : (
                <div className="space-y-2">
                  {perluTindakan.slice(0, 4).map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between rounded-lg border p-2.5 text-xs hover:bg-muted/30"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-semibold truncate">{t.unit}</p>
                        <p className="text-[11px] text-muted-foreground">{t.tugas} • {t.tanggal}</p>
                      </div>
                      <Button asChild size="sm" variant="outline" className="h-7 text-xs shrink-0">
                        <Link to={t.to}>Proses</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
