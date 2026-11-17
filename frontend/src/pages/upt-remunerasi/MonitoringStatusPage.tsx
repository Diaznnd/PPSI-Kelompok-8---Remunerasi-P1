import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { uptRemunerasiService } from "@/services/uptRemunerasiService"
import { AlertCircle, CheckCircle2, Clock, RefreshCw, TrendingUp, Users, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Helper function untuk format tanggal
const formatDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

type MonitoringData = {
  periode: string
  ringkasan: {
    total_unit: number
    belum_mengajukan: number
    dalam_proses: number
    selesai: number
    ditolak: number
  }
  monitoring: Array<{
    unit_id: number
    unit: string
    pengajuan_id?: number
    periode: string
    status: string
    progress: number
    tahap: string
    bendahara: string
    jumlah_pegawai: number
    total_bruto: number
    terakhir_diperbarui: string
    catatan?: string
  }>
  dimuat_pada: string
}

type AlertData = {
  periode: string
  total_alerts: number
  kritis: number
  tinggi: number
  sedang: number
  alerts: Array<{
    tipe: string
    kategori: string
    judul: string
    pesan: string
    unit_terkait?: string[]
    prioritas: string
  }>
  dimuat_pada: string
}

export default function MonitoringStatusPage() {
  const [periode, setPeriode] = useState(formatDate(new Date()))
  const [monitoring, setMonitoring] = useState<MonitoringData | null>(null)
  const [alerts, setAlerts] = useState<AlertData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("semua")
  const { toast } = useToast()

  const loadData = async () => {
    setLoading(true)
    try {
      const [monitoringData, alertsData] = await Promise.all([
        uptRemunerasiService.getMonitoringStatus(periode),
        uptRemunerasiService.getAlerts(periode),
      ])
      setMonitoring(monitoringData)
      setAlerts(alertsData)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal Memuat Data",
        description: error.response?.data?.message || "Terjadi kesalahan saat memuat monitoring status",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [periode])

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      belum_mengajukan: { variant: "secondary", label: "Belum Mengajukan" },
      draft: { variant: "secondary", label: "Draft" },
      diajukan: { variant: "default", label: "Diajukan" },
      diverifikasi: { variant: "default", label: "Diverifikasi" },
      terverifikasi: { variant: "default", label: "Terverifikasi" },
      netto_ditetapkan: { variant: "default", label: "Netto Ditetapkan" },
      disetujui: { variant: "default", label: "Disetujui" },
      selesai: { variant: "default", label: "Selesai" },
      amprah_tersedia: { variant: "default", label: "Selesai" },
      ditolak: { variant: "destructive", label: "Ditolak" },
    }
    const config = variants[status] || { variant: "secondary", label: status }
    return <Badge variant={config.variant as any}>{config.label}</Badge>
  }

  const getAlertIcon = (prioritas: string) => {
    if (prioritas === "kritis") return <AlertCircle className="h-5 w-5 text-red-500" />
    if (prioritas === "tinggi") return <AlertTriangle className="h-5 w-5 text-orange-500" />
    return <Clock className="h-5 w-5 text-yellow-500" />
  }

  const filteredMonitoring =
    monitoring?.monitoring.filter((item) => {
      if (activeTab === "semua") return true
      if (activeTab === "belum_mengajukan") return item.status === "belum_mengajukan"
      if (activeTab === "dalam_proses")
        return !["belum_mengajukan", "selesai", "amprah_tersedia", "ditolak"].includes(item.status)
      if (activeTab === "selesai") return ["selesai", "amprah_tersedia"].includes(item.status)
      if (activeTab === "ditolak") return item.status === "ditolak"
      return true
    }) || []

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Monitoring Status Pengajuan</h1>
          <p className="text-muted-foreground mt-1">Tracking realtime status pengajuan seluruh unit</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={periode} onValueChange={setPeriode}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2026-10">Oktober 2026</SelectItem>
              <SelectItem value="2026-11">November 2026</SelectItem>
              <SelectItem value="2026-12">Desember 2026</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadData} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Ringkasan */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Unit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">{monitoring?.ringkasan.total_unit || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Belum Mengajukan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-500" />
              <span className="text-2xl font-bold">{monitoring?.ringkasan.belum_mengajukan || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Dalam Proses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <span className="text-2xl font-bold">{monitoring?.ringkasan.dalam_proses || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Selesai</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">{monitoring?.ringkasan.selesai || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ditolak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-2xl font-bold">{monitoring?.ringkasan.ditolak || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {alerts && alerts.total_alerts > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">
            Alerts & Peringatan ({alerts.total_alerts})
          </h2>
          {alerts.alerts.map((alert, idx) => (
            <Alert key={idx} variant={alert.prioritas === "kritis" ? "destructive" : "default"}>
              {getAlertIcon(alert.prioritas)}
              <AlertTitle>{alert.judul}</AlertTitle>
              <AlertDescription>
                {alert.pesan}
                {alert.unit_terkait && alert.unit_terkait.length > 0 && (
                  <div className="mt-2">
                    <span className="font-semibold">Unit: </span>
                    {alert.unit_terkait.join(", ")}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Monitoring Table */}
      <Card>
        <CardHeader>
          <CardTitle>Status Pengajuan per Unit</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="semua">Semua ({monitoring?.monitoring.length || 0})</TabsTrigger>
              <TabsTrigger value="belum_mengajukan">
                Belum Mengajukan ({monitoring?.ringkasan.belum_mengajukan || 0})
              </TabsTrigger>
              <TabsTrigger value="dalam_proses">Dalam Proses ({monitoring?.ringkasan.dalam_proses || 0})</TabsTrigger>
              <TabsTrigger value="selesai">Selesai ({monitoring?.ringkasan.selesai || 0})</TabsTrigger>
              <TabsTrigger value="ditolak">Ditolak ({monitoring?.ringkasan.ditolak || 0})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              <div className="space-y-4">
                {filteredMonitoring.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">Tidak ada data</div>
                ) : (
                  filteredMonitoring.map((item) => (
                    <Card key={item.unit_id} className="border-l-4" style={{ borderLeftColor: item.progress === 100 ? '#22c55e' : '#f97316' }}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg">{item.unit}</h3>
                              {getStatusBadge(item.status)}
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Bendahara: </span>
                                <span className="font-medium">{item.bendahara}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Pegawai: </span>
                                <span className="font-medium">{item.jumlah_pegawai}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Total: </span>
                                <span className="font-medium">Rp {item.total_bruto.toLocaleString("id-ID")}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right text-sm text-muted-foreground">
                            {item.terakhir_diperbarui || "Baru dibuat"}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{item.tahap}</span>
                            <span className="text-muted-foreground">{item.progress}%</span>
                          </div>
                          <Progress value={item.progress} className="h-2" />
                        </div>

                        {item.catatan && (
                          <div className="mt-3 text-sm text-muted-foreground italic">
                            Catatan: {item.catatan}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
