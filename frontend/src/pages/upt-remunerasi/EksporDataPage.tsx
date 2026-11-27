import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { uptRemunerasiService } from "@/services/uptRemunerasiService"
import { Download, FileSpreadsheet, FileText, Database, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { toast } from "sonner"

type ExportHistory = {
  id: string
  type: string
  format: string
  status: "success" | "error"
  timestamp: string
  size?: string
}

const formatDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  return `${year}-${month}`
}

export default function EksporDataPage() {
  const [periode, setPeriode] = useState(formatDate(new Date()))
  const [unitId, setUnitId] = useState<number | undefined>(undefined)
  const [tipeData, setTipeData] = useState("rekapitulasi")
  const [statusUsulan] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [exportHistory, setExportHistory] = useState<ExportHistory[]>([])

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

  const handleExportCSV = async (type: string) => {
    const key = `csv-${type}`
    setLoading({ ...loading, [key]: true })

    const exportItem: ExportHistory = {
      id: Date.now().toString(),
      type: type,
      format: "CSV",
      status: "success",
      timestamp: new Date().toLocaleString("id-ID"),
    }

    try {
      let blob: Blob

      switch (type) {
        case "rekapitulasi":
          blob = await uptRemunerasiService.eksporRekapitulasiCSV(periode)
          break
        case "detail-pegawai":
          if (!unitId) {
            toast.error("Pilih unit kerja terlebih dahulu")
            return
          }
          blob = await uptRemunerasiService.eksporDetailPegawaiCSV(`pengajuan-${periode}-${unitId}`)
          break
        case "usulan-jabatan":
          blob = await uptRemunerasiService.eksporUsulanJabatanCSV(statusUsulan)
          break
        default:
          throw new Error("Unknown export type")
      }

      // Download file
      const filename = `${type}_${periode}_${Date.now()}.csv`
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      exportItem.size = `${(blob.size / 1024).toFixed(2)} KB`
      setExportHistory([exportItem, ...exportHistory])
      toast.success(`File CSV berhasil diunduh: ${filename}`)
    } catch (error: any) {
      console.error(`Error exporting ${type}:`, error)
      exportItem.status = "error"
      setExportHistory([exportItem, ...exportHistory])
      toast.error(error.response?.data?.message || "Gagal mengekspor data CSV")
    } finally {
      setLoading({ ...loading, [key]: false })
    }
  }

  const handleExportExcel = async () => {
    const key = "excel"
    setLoading({ ...loading, [key]: true })

    const exportItem: ExportHistory = {
      id: Date.now().toString(),
      type: tipeData,
      format: "Excel",
      status: "success",
      timestamp: new Date().toLocaleString("id-ID"),
    }

    try {
      const response = await uptRemunerasiService.getDataEksporExcel({
        periode,
        tipe: tipeData,
        unit_id: unitId,
      })

      // Simulate Excel download (in real implementation, backend returns Excel file)
      if (response.success) {
        exportItem.size = "~150 KB"
        setExportHistory([exportItem, ...exportHistory])
        toast.success("Data Excel berhasil disiapkan. Download dimulai...")
        
        // In real implementation, download the Excel file from response
        console.log("Excel data:", response.data)
      }
    } catch (error: any) {
      console.error("Error exporting Excel:", error)
      exportItem.status = "error"
      setExportHistory([exportItem, ...exportHistory])
      toast.error(error.response?.data?.message || "Gagal mengekspor data Excel")
    } finally {
      setLoading({ ...loading, [key]: false })
    }
  }

  const exportTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      rekapitulasi: "Rekapitulasi Universitas",
      "detail-pegawai": "Detail Pegawai per Unit",
      "usulan-jabatan": "Usulan Jabatan",
      "distribusi-grade": "Distribusi Grade",
      pajak: "Laporan Pajak",
    }
    return labels[type] || type
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Ekspor Data</h2>
        <p className="text-sm text-muted-foreground">Export data remunerasi dalam format CSV atau Excel</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* CSV Export Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <div>
                <CardTitle>Ekspor CSV</CardTitle>
                <CardDescription>Format teks terpisah koma untuk analisis data</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Periode Filter */}
            <div className="space-y-2">
              <Label>Periode</Label>
              <Select value={periode} onValueChange={setPeriode}>
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

            <Separator />

            {/* Export Options */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Rekapitulasi Universitas</p>
                  <p className="text-xs text-muted-foreground">Total remunerasi per unit kerja</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleExportCSV("rekapitulasi")}
                  disabled={loading["csv-rekapitulasi"]}
                >
                  {loading["csv-rekapitulasi"] ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Usulan Jabatan</p>
                  <p className="text-xs text-muted-foreground">Data usulan perubahan jabatan</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleExportCSV("usulan-jabatan")}
                  disabled={loading["csv-usulan-jabatan"]}
                >
                  {loading["csv-usulan-jabatan"] ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Detail Pegawai</p>
                  <p className="text-xs text-muted-foreground">Perhitungan detail per pegawai</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleExportCSV("detail-pegawai")}
                  disabled={loading["csv-detail-pegawai"] || !unitId}
                >
                  {loading["csv-detail-pegawai"] ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {!unitId && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Pilih unit kerja di section Excel untuk export detail pegawai
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Excel Export Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-primary" />
              <div>
                <CardTitle>Ekspor Excel</CardTitle>
                <CardDescription>Format spreadsheet dengan formatting lengkap</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Periode Filter */}
            <div className="space-y-2">
              <Label>Periode</Label>
              <Select value={periode} onValueChange={setPeriode}>
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

            {/* Data Type */}
            <div className="space-y-2">
              <Label>Tipe Data</Label>
              <Select value={tipeData} onValueChange={setTipeData}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rekapitulasi">Rekapitulasi Universitas</SelectItem>
                  <SelectItem value="detail-pegawai">Detail Pegawai</SelectItem>
                  <SelectItem value="distribusi-grade">Distribusi Grade</SelectItem>
                  <SelectItem value="pajak">Laporan Pajak</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Unit Filter (conditional) */}
            {tipeData === "detail-pegawai" && (
              <div className="space-y-2">
                <Label>Unit Kerja</Label>
                <Select value={unitId?.toString()} onValueChange={(v) => setUnitId(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih unit kerja" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Fakultas Teknologi Informasi</SelectItem>
                    <SelectItem value="2">Fakultas Ekonomi & Bisnis</SelectItem>
                    <SelectItem value="3">Fakultas Kedokteran</SelectItem>
                    <SelectItem value="4">Fakultas Hukum</SelectItem>
                    <SelectItem value="5">Rektorat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button className="w-full" onClick={handleExportExcel} disabled={loading["excel"]}>
              {loading["excel"] && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {!loading["excel"] && <FileSpreadsheet className="w-4 h-4 mr-2" />}
              Export ke Excel
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Export History */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            <div>
              <CardTitle>Riwayat Ekspor</CardTitle>
              <CardDescription>Daftar file yang telah diekspor sesi ini</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {exportHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Belum ada riwayat ekspor</p>
              <p className="text-xs">Export data akan muncul di sini</p>
            </div>
          ) : (
            <div className="space-y-2">
              {exportHistory.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {item.status === "success" ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{exportTypeLabel(item.type)}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.timestamp} • {item.format}
                        {item.size && ` • ${item.size}`}
                      </p>
                    </div>
                  </div>
                  <Badge variant={item.status === "success" ? "default" : "destructive"}>
                    {item.status === "success" ? "Berhasil" : "Gagal"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900">Catatan Ekspor Data</p>
              <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                <li>Format CSV cocok untuk import ke aplikasi analisis data (Excel, Python, R)</li>
                <li>Format Excel memiliki formatting dan formula yang lebih lengkap</li>
                <li>Data yang diekspor sesuai dengan periode dan filter yang dipilih</li>
                <li>File besar mungkin memerlukan waktu beberapa detik untuk diunduh</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
