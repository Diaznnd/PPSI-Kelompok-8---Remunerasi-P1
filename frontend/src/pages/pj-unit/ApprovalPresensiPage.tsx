import { useState, useEffect, useMemo } from "react"
import { CheckCircle2, XCircle, Eye, Clock, AlertTriangle, FileCheck, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { pjUnitService } from "@/services/pjUnitService"
import { generatePeriodeList } from "@/lib/format"

interface PresensiReport {
  id: number
  periode: string
  masa_file: string
  unit: {
    id: number
    kode: string
    nama: string
  }
  uploader: {
    nip: string
    nama: string
  }
  status: string
  status_approval: "draft" | "menunggu_approval" | "disetujui" | "ditolak"
  jumlah_valid: number
  jumlah_gagal: number
  dimpor_at: string
  approved_by?: {
    nip: string
    nama: string
  }
  approved_at?: string
  catatan_approval?: string
  alasan_penolakan?: string
  can_be_approved: boolean
  detail_presensi?: Array<{
    nip: string
    nama: string
    hadir: number
    sakit: number
    izin: number
    cuti: number
    alfa: number
    dinas_luar: number
    terlambat: number
    pulang_cepat: number
    lembur: number
  }>
}

export default function ApprovalPresensiPage() {
  const [loading, setLoading] = useState(true)
  const [reports, setReports] = useState<PresensiReport[]>([])
  const [selectedReport, setSelectedReport] = useState<PresensiReport | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [approveModalOpen, setApproveModalOpen] = useState(false)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  const [periodeFilter, setPeriodeFilter] = useState("semua")
  const [statusFilter, setStatusFilter] = useState<string>("menunggu_approval")
  
  const [catatan, setCatatan] = useState("")
  const [alasan, setAlasan] = useState("")
  
  const periodeList = useMemo(() => generatePeriodeList(12), [])

  useEffect(() => {
    loadReports()
  }, [periodeFilter, statusFilter])

  const loadReports = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (periodeFilter !== "semua") params.periode = periodeFilter
      if (statusFilter !== "semua") params.status_approval = statusFilter
      
      const res = await pjUnitService.getApprovalPresensiList(params)
      setReports(res.data || [])
    } catch (error: any) {
      console.error("Failed to load reports:", error)
      toast.error(error.response?.data?.message || "Gagal memuat data rekap absensi")
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetail = async (report: PresensiReport) => {
    try {
      const res = await pjUnitService.getApprovalPresensiDetail(report.id)
      setSelectedReport(res.data)
      setDetailModalOpen(true)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal memuat detail")
    }
  }

  const handleOpenApprove = (report: PresensiReport) => {
    setSelectedReport(report)
    setCatatan("")
    setApproveModalOpen(true)
  }

  const handleOpenReject = (report: PresensiReport) => {
    setSelectedReport(report)
    setAlasan("")
    setRejectModalOpen(true)
  }

  const handleApprove = async () => {
    if (!selectedReport) return
    
    try {
      setSubmitting(true)
      await pjUnitService.approvePresensi(selectedReport.id, { catatan })
      toast.success("Rekap absensi berhasil disetujui")
      setApproveModalOpen(false)
      loadReports()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal menyetujui rekap absensi")
    } finally {
      setSubmitting(false)
    }
  }

  const handleReject = async () => {
    if (!selectedReport) return
    
    if (!alasan.trim()) {
      toast.error("Alasan penolakan wajib diisi")
      return
    }
    
    try {
      setSubmitting(true)
      await pjUnitService.rejectPresensi(selectedReport.id, { alasan })
      toast.success("Rekap absensi ditolak")
      setRejectModalOpen(false)
      loadReports()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal menolak rekap absensi")
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string, icon: any }> = {
      menunggu_approval: { variant: "secondary", label: "Menunggu Approval", icon: Clock },
      disetujui: { variant: "default", label: "Disetujui", icon: CheckCircle2 },
      ditolak: { variant: "destructive", label: "Ditolak", icon: XCircle },
      draft: { variant: "outline", label: "Draft", icon: AlertTriangle },
    }
    
    const config = variants[status] || variants.draft
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="size-3" />
        {config.label}
      </Badge>
    )
  }

  const filteredReports = useMemo(() => {
    return reports
  }, [reports])

  const stats = useMemo(() => {
    const menunggu = reports.filter(r => r.status_approval === "menunggu_approval").length
    const disetujui = reports.filter(r => r.status_approval === "disetujui").length
    const ditolak = reports.filter(r => r.status_approval === "ditolak").length
    
    return { menunggu, disetujui, ditolak, total: reports.length }
  }, [reports])

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Approval Rekap Absensi</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review dan setujui rekap absensi yang diunggah oleh Kepegawaian
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Menunggu</p>
                <p className="text-2xl font-bold">{stats.menunggu}</p>
              </div>
              <Clock className="size-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Disetujui</p>
                <p className="text-2xl font-bold">{stats.disetujui}</p>
              </div>
              <CheckCircle2 className="size-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ditolak</p>
                <p className="text-2xl font-bold">{stats.ditolak}</p>
              </div>
              <XCircle className="size-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileCheck className="size-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Label className="text-xs">Periode</Label>
          <select
            value={periodeFilter}
            onChange={(e) => setPeriodeFilter(e.target.value)}
            className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="semua">Semua Periode</option>
            {periodeList.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        
        <div className="flex-1">
          <Label className="text-xs">Status</Label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="semua">Semua Status</option>
            <option value="menunggu_approval">Menunggu Approval</option>
            <option value="disetujui">Disetujui</option>
            <option value="ditolak">Ditolak</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredReports.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileCheck className="size-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Tidak ada rekap absensi untuk ditampilkan</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-semibold text-sm">Periode</th>
                    <th className="text-left p-4 font-semibold text-sm">Unit</th>
                    <th className="text-left p-4 font-semibold text-sm">Diupload Oleh</th>
                    <th className="text-center p-4 font-semibold text-sm">Valid</th>
                    <th className="text-center p-4 font-semibold text-sm">Gagal</th>
                    <th className="text-left p-4 font-semibold text-sm">Status</th>
                    <th className="text-left p-4 font-semibold text-sm">Tanggal Upload</th>
                    <th className="text-right p-4 font-semibold text-sm">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((report) => (
                    <tr key={report.id} className="border-b hover:bg-muted/50 transition">
                      <td className="p-4">
                        <div className="font-semibold">{report.masa_file}</div>
                        <div className="text-xs text-muted-foreground">{report.periode}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{report.unit.kode}</div>
                        <div className="text-xs text-muted-foreground">{report.unit.nama}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">{report.uploader.nama}</div>
                        <div className="text-xs text-muted-foreground">{report.uploader.nip}</div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="font-semibold text-green-600">{report.jumlah_valid}</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="font-semibold text-red-600">{report.jumlah_gagal}</span>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(report.status_approval)}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(report.dimpor_at).toLocaleString("id-ID")}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetail(report)}
                            className="gap-1"
                          >
                            <Eye className="size-3.5" />
                            Detail
                          </Button>
                          
                          {report.can_be_approved && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleOpenApprove(report)}
                                className="gap-1"
                              >
                                <CheckCircle2 className="size-3.5" />
                                Setuju
                              </Button>
                              
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleOpenReject(report)}
                                className="gap-1"
                              >
                                <XCircle className="size-3.5" />
                                Tolak
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Rekap Absensi</DialogTitle>
            <DialogDescription>
              {selectedReport?.masa_file} - {selectedReport?.unit.nama}
            </DialogDescription>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Status Approval</Label>
                  <div className="mt-1">{getStatusBadge(selectedReport.status_approval)}</div>
                </div>
                
                <div>
                  <Label className="text-xs text-muted-foreground">Diupload Oleh</Label>
                  <div className="mt-1 text-sm">{selectedReport.uploader.nama}</div>
                </div>
                
                {selectedReport.approved_by && (
                  <>
                    <div>
                      <Label className="text-xs text-muted-foreground">Disetujui/Ditolak Oleh</Label>
                      <div className="mt-1 text-sm">{selectedReport.approved_by.nama}</div>
                    </div>
                    
                    <div>
                      <Label className="text-xs text-muted-foreground">Tanggal</Label>
                      <div className="mt-1 text-sm">
                        {selectedReport.approved_at && new Date(selectedReport.approved_at).toLocaleString("id-ID")}
                      </div>
                    </div>
                  </>
                )}
                
                {selectedReport.catatan_approval && (
                  <div className="col-span-2">
                    <Label className="text-xs text-muted-foreground">Catatan</Label>
                    <div className="mt-1 text-sm p-3 bg-muted rounded">{selectedReport.catatan_approval}</div>
                  </div>
                )}
                
                {selectedReport.alasan_penolakan && (
                  <div className="col-span-2">
                    <Label className="text-xs text-muted-foreground">Alasan Penolakan</Label>
                    <div className="mt-1 text-sm p-3 bg-red-50 text-red-900 rounded">{selectedReport.alasan_penolakan}</div>
                  </div>
                )}
              </div>
              
              {selectedReport.detail_presensi && selectedReport.detail_presensi.length > 0 && (
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Detail Presensi Pegawai</Label>
                  <div className="border rounded max-h-96 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted sticky top-0">
                        <tr>
                          <th className="text-left p-2">NIP</th>
                          <th className="text-left p-2">Nama</th>
                          <th className="text-center p-2">Hadir</th>
                          <th className="text-center p-2">Sakit</th>
                          <th className="text-center p-2">Izin</th>
                          <th className="text-center p-2">Cuti</th>
                          <th className="text-center p-2">Alfa</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedReport.detail_presensi.map((p) => (
                          <tr key={p.nip} className="border-t">
                            <td className="p-2 font-mono text-xs">{p.nip}</td>
                            <td className="p-2">{p.nama}</td>
                            <td className="p-2 text-center">{p.hadir}</td>
                            <td className="p-2 text-center">{p.sakit}</td>
                            <td className="p-2 text-center">{p.izin}</td>
                            <td className="p-2 text-center">{p.cuti}</td>
                            <td className="p-2 text-center">{p.alfa}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailModalOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Modal */}
      <Dialog open={approveModalOpen} onOpenChange={setApproveModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Setujui Rekap Absensi</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menyetujui rekap absensi periode {selectedReport?.masa_file}?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Catatan (Opsional)</Label>
              <Textarea
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Tambahkan catatan jika diperlukan..."
                rows={3}
                className="mt-1"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveModalOpen(false)} disabled={submitting}>
              Batal
            </Button>
            <Button onClick={handleApprove} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Menyetujui...
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4 mr-2" />
                  Setujui
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Rekap Absensi</DialogTitle>
            <DialogDescription>
              Berikan alasan penolakan untuk rekap absensi periode {selectedReport?.masa_file}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Alasan Penolakan *</Label>
              <Textarea
                value={alasan}
                onChange={(e) => setAlasan(e.target.value)}
                placeholder="Jelaskan alasan penolakan..."
                rows={4}
                className="mt-1"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectModalOpen(false)} disabled={submitting}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={submitting || !alasan.trim()}>
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Menolak...
                </>
              ) : (
                <>
                  <XCircle className="size-4 mr-2" />
                  Tolak
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
