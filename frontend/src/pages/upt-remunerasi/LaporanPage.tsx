import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { uptRemunerasiService } from "@/services/uptRemunerasiService"
import { Download, FileText, TrendingUp, PieChart, DollarSign, Clock, Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"

const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n)

// Helper function untuk format tanggal
const formatDate = (date: Date, format: string) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  
  if (format === "yyyy-MM") return `${year}-${month}`
  if (format === "yyyy-MM-dd") return `${year}-${month}-${day}`
  return `${year}-${month}-${day}`
}

export default function LaporanPage() {
  const [periode, setPeriode] = useState(formatDate(new Date(), "yyyy-MM"))
  const [periodeAwal, setPeriodeAwal] = useState("2026-01")
  const [periodeAkhir, setPeriodeAkhir] = useState(formatDate(new Date(), "yyyy-MM"))
  const [batasTanggal, setBatasTanggal] = useState(formatDate(new Date(), "yyyy-MM") + "-05")
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [reportData, setReportData] = useState<any>(null)
  const [activeReport, setActiveReport] = useState<string | null>(null)

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

  const handleDownloadCSV = async (type: string) => {
    const key = `download-${type}`
    setLoading({ ...loading, [key]: true })
    try {
      let blob: Blob

      if (type === "rekapitulasi") {
        blob = await uptRemunerasiService.eksporRekapitulasiCSV(periode)
      } else if (type === "usulan-jabatan") {
        blob = await uptRemunerasiService.eksporUsulanJabatanCSV()
      } else {
        throw new Error("Unknown export type")
      }

      // Download file
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${type}_${periode}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success("File CSV berhasil diunduh")
    } catch (error: any) {
      console.error(`Error downloading ${type}:`, error)
      toast.error(error.response?.data?.message || "Gagal mengunduh file CSV")
    } finally {
      setLoading({ ...loading, [key]: false })
    }
  }

  const handleViewReport = async (type: string) => {
    setLoading({ ...loading, [type]: true })
    setActiveReport(type)
    try {
      let data: any

      switch (type) {
        case "rekapitulasi":
          data = await uptRemunerasiService.getLaporanRekapitulasi(periode, "json")
          break
        case "distribusi-grade":
          data = await uptRemunerasiService.getLaporanDistribusiGrade()
          break
        case "tren":
          data = await uptRemunerasiService.getLaporanTren(periodeAwal, periodeAkhir)
          break
        case "pajak":
          data = await uptRemunerasiService.getLaporanPajak(periode)
          break
        case "keterlambatan":
          data = await uptRemunerasiService.getLaporanKeterlambatan(periode, batasTanggal)
          break
      }

      setReportData(data.data || data)
      toast.success("Laporan berhasil dibuat")
    } catch (error: any) {
      console.error(`Error loading ${type} report:`, error)
      toast.error(error.response?.data?.message || "Gagal membuat laporan")
      setReportData(null)
    } finally {
      setLoading({ ...loading, [type]: false })
    }
  }

  const renderReportPreview = () => {
    if (!reportData || !activeReport) return null

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Preview Laporan</CardTitle>
          <CardDescription>Data laporan yang berhasil di-generate</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border bg-muted/50 p-4 max-h-96 overflow-auto">
            <pre className="text-xs">{JSON.stringify(reportData, null, 2)}</pre>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            <AlertCircle className="inline w-3 h-3 mr-1" />
            Data preview. Gunakan tombol Download untuk ekspor lengkap.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Laporan & Rekapitulasi</h1>
        <p className="text-muted-foreground mt-1">Generate berbagai jenis laporan dan rekapitulasi remunerasi</p>
      </div>

      <Tabs defaultValue="rekapitulasi" className="space-y-6">
        <TabsList>
          <TabsTrigger value="rekapitulasi">
            <FileText className="h-4 w-4 mr-2" />
            Rekapitulasi
          </TabsTrigger>
          <TabsTrigger value="distribusi">
            <PieChart className="h-4 w-4 mr-2" />
            Distribusi Grade
          </TabsTrigger>
          <TabsTrigger value="tren">
            <TrendingUp className="h-4 w-4 mr-2" />
            Tren Remunerasi
          </TabsTrigger>
          <TabsTrigger value="pajak">
            <DollarSign className="h-4 w-4 mr-2" />
            Laporan Pajak
          </TabsTrigger>
          <TabsTrigger value="keterlambatan">
            <Clock className="h-4 w-4 mr-2" />
            Keterlambatan
          </TabsTrigger>
        </TabsList>

        {/* Rekapitulasi Universitas */}
        <TabsContent value="rekapitulasi">
          <Card>
            <CardHeader>
              <CardTitle>Rekapitulasi Remunerasi Universitas</CardTitle>
              <CardDescription>Ringkasan total remunerasi se-universitas dengan breakdown per unit kerja</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Periode</Label>
                  <Select value={periode} onValueChange={setPeriode}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2026-10">Oktober 2026</SelectItem>
                      <SelectItem value="2026-11">November 2026</SelectItem>
                      <SelectItem value="2026-12">Desember 2026</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => handleViewReport("rekapitulasi")} disabled={loading["rekapitulasi"]}>
                  {loading["rekapitulasi"] && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {!loading["rekapitulasi"] && <FileText className="h-4 w-4 mr-2" />}
                  Lihat Laporan
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDownloadCSV("rekapitulasi")}
                  disabled={loading["download-rekapitulasi"]}
                >
                  {loading["download-rekapitulasi"] && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {!loading["download-rekapitulasi"] && <Download className="h-4 w-4 mr-2" />}
                  Download CSV
                </Button>
              </div>

              {activeReport === "rekapitulasi" && renderReportPreview()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Distribusi Grade */}
        <TabsContent value="distribusi">
          <Card>
            <CardHeader>
              <CardTitle>Distribusi Grade & Jabatan</CardTitle>
              <CardDescription>Analisis distribusi pegawai berdasarkan grade dan jabatan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={() => handleViewReport("distribusi-grade")} disabled={loading["distribusi-grade"]}>
                {loading["distribusi-grade"] && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {!loading["distribusi-grade"] && <PieChart className="h-4 w-4 mr-2" />}
                Lihat Distribusi
              </Button>

              {activeReport === "distribusi-grade" && renderReportPreview()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tren Remunerasi */}
        <TabsContent value="tren">
          <Card>
            <CardHeader>
              <CardTitle>Tren Remunerasi Multi-Periode</CardTitle>
              <CardDescription>Analisis perbandingan remunerasi antar periode</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Periode Awal</Label>
                  <Input type="month" value={periodeAwal} onChange={(e) => setPeriodeAwal(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Periode Akhir</Label>
                  <Input type="month" value={periodeAkhir} onChange={(e) => setPeriodeAkhir(e.target.value)} />
                </div>
              </div>

              <Button onClick={() => handleViewReport("tren")} disabled={loading["tren"]}>
                {loading["tren"] && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {!loading["tren"] && <TrendingUp className="h-4 w-4 mr-2" />}
                Analisis Tren
              </Button>

              {activeReport === "tren" && renderReportPreview()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Laporan Pajak */}
        <TabsContent value="pajak">
          <Card>
            <CardHeader>
              <CardTitle>Laporan Pajak PPh21</CardTitle>
              <CardDescription>Rekapitulasi pajak PPh21 per unit kerja</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Periode</Label>
                  <Select value={periode} onValueChange={setPeriode}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2026-10">Oktober 2026</SelectItem>
                      <SelectItem value="2026-11">November 2026</SelectItem>
                      <SelectItem value="2026-12">Desember 2026</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={() => handleViewReport("pajak")} disabled={loading["pajak"]}>
                {loading["pajak"] && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {!loading["pajak"] && <DollarSign className="h-4 w-4 mr-2" />}
                Lihat Laporan Pajak
              </Button>

              {activeReport === "pajak" && renderReportPreview()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Laporan Keterlambatan */}
        <TabsContent value="keterlambatan">
          <Card>
            <CardHeader>
              <CardTitle>Laporan Keterlambatan Pengajuan</CardTitle>
              <CardDescription>Tracking unit yang tepat waktu vs terlambat dalam mengajukan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Periode</Label>
                  <Select value={periode} onValueChange={setPeriode}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2026-10">Oktober 2026</SelectItem>
                      <SelectItem value="2026-11">November 2026</SelectItem>
                      <SelectItem value="2026-12">Desember 2026</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Batas Tanggal</Label>
                  <Input type="date" value={batasTanggal} onChange={(e) => setBatasTanggal(e.target.value)} />
                </div>
              </div>

              <Button onClick={() => handleViewReport("keterlambatan")} disabled={loading["keterlambatan"]}>
                {loading["keterlambatan"] && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {!loading["keterlambatan"] && <Clock className="h-4 w-4 mr-2" />}
                Lihat Laporan
              </Button>

              {activeReport === "keterlambatan" && renderReportPreview()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Export Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ekspor Data Cepat</CardTitle>
          <CardDescription>Download data dalam format CSV untuk analisis lebih lanjut</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => handleDownloadCSV("rekapitulasi")}
              disabled={loading["download-rekapitulasi"]}
            >
              {loading["download-rekapitulasi"] && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {!loading["download-rekapitulasi"] && <Download className="h-4 w-4 mr-2" />}
              Rekapitulasi CSV
            </Button>
            <Button
              variant="outline"
              onClick={() => handleDownloadCSV("usulan-jabatan")}
              disabled={loading["download-usulan-jabatan"]}
            >
              {loading["download-usulan-jabatan"] && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {!loading["download-usulan-jabatan"] && <Download className="h-4 w-4 mr-2" />}
              Usulan Jabatan CSV
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
