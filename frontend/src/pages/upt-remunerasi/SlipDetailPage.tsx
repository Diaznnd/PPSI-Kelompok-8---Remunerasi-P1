import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  FileText,
  RefreshCw,
  Printer,
  Download,
  Eye,
  AlertCircle,
  Users,
  CheckCircle2,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import {
  PageHeader,
  StatusBadge,
  WarningBanner,
  Button,
  DataTable,
  PrintPreview,
  RupiahText,
  type ColumnDef,
} from "./components"
import { rupiah } from "@/lib/format"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { uptRemunerasiService } from "@/services/uptRemunerasiService"

type SlipPegawaiStatus = "terbit" | "belum_terbit" | "gagal"

type SlipPegawaiRow = {
  nip: string
  nama: string
  grade: number
  jabatan?: string
  statusKepegawaian?: string
  pengaliStatus?: number
  p1Gross: number
  pajak: number
  p1Netto: number
  netto: number
  p1SetelahPotongan?: number
  statusSlip: SlipPegawaiStatus
  rekeningMasked: string
  nilaiJabatan: number
  remunerasiPerJabatan: number
  pajakTer: number
  tabPajak: number
  tarifPajakPersen?: number
  rincianKehadiran?: any[]
  rincianHukdis?: string
  potonganHukdis?: number
}

export default function SlipDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const decodedId = decodeURIComponent(id ?? "")
  
  const [loading, setLoading] = useState(true)
  const [pengajuan, setPengajuan] = useState<any>(null)
  const [rows, setRows] = useState<SlipPegawaiRow[]>([])
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [selectedSlip, setSelectedSlip] = useState<SlipPegawaiRow | null>(null)
  const [isSlipModalOpen, setIsSlipModalOpen] = useState(false)
  const [isPrintOpen, setIsPrintOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (decodedId) {
      fetchSlipDetail()
    }
  }, [decodedId])

  const fetchSlipDetail = async () => {
    try {
      setLoading(true)
      // Extract periode from ID or use current month
      const currentPeriode = new Date().toISOString().slice(0, 7)
      const res = await uptRemunerasiService.getPenerbitanSlipList(currentPeriode)
      
      const found = res.data.find((p: any) => p.id === decodedId || p.pengajuan_id === decodedId)
      
      if (found) {
        setPengajuan(found)
        
        // Map pegawai list to rows
        const mappedRows: SlipPegawaiRow[] = (found.pegawai_list || []).map((p: any) => ({
          nip: p.NIP || p.nip,
          nama: p.nama,
          grade: p.grade || 1,
          jabatan: p.jabatan || '',
          statusKepegawaian: p.status_kepegawaian || 'Aktif',
          pengaliStatus: p.pengali_status || 100,
          p1Gross: p.p1_bruto || 0,
          pajak: p.pajak || 0,
          p1Netto: p.p1_netto || 0,
          netto: p.p1_netto || 0,
          p1SetelahPotongan: p.p1_setelah_potongan || p.p1_bruto || 0,
          statusSlip: p.slip_terbit ? "terbit" : p.slip_gagal ? "gagal" : "belum_terbit",
          rekeningMasked: p.rekening_masked || "Bank Nagari •••• ****",
          nilaiJabatan: p.nilai_jabatan || 0,
          remunerasiPerJabatan: p.remun_per_jabatan || 0,
          pajakTer: p.pajak_ter || p.pajak || 0,
          tabPajak: p.tab_pajak || 0,
          tarifPajakPersen: p.tarif_pajak_persen || 5,
          rincianKehadiran: p.rincian_kehadiran || [],
          rincianHukdis: p.rincian_hukdis || 'Tidak ada hukuman disiplin',
          potonganHukdis: p.potongan_hukdis || 0,
        }))
        
        setRows(mappedRows)
      } else {
        setPengajuan(null)
        setRows([])
      }
    } catch (error) {
      console.error("Error fetching slip detail:", error)
      toast.error("Gagal memuat detail slip dari database.")
      setPengajuan(null)
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  const isNettoDitetapkan = pengajuan?.status === "netto_ditetapkan" || pengajuan?.status === "amprah_tersedia"
  const gagalCount = rows.filter((r) => r.statusSlip === "gagal").length
  const terbitCount = rows.filter((r) => r.statusSlip === "terbit").length

  const handleTerbitkanAtauUlang = async () => {
    if (!isNettoDitetapkan) {
      const msg = "Netto belum ditetapkan - slip tidak dapat terbit"
      setErrorMsg(msg)
      toast.error(msg)
      return
    }
    
    setErrorMsg(null)
    setSubmitting(true)
    
    try {
      await uptRemunerasiService.terbitkanSlip(decodedId)
      
      toast.success(
        gagalCount > 0
          ? `${gagalCount} slip yang gagal berhasil diterbitkan ulang.`
          : "Seluruh slip P1 unit berhasil diterbitkan."
      )
      
      // Refresh data
      await fetchSlipDetail()
    } catch (error: any) {
      console.error("Error terbitkan slip:", error)
      toast.error(error.response?.data?.message || "Gagal menerbitkan slip")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!pengajuan) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">Pengajuan tidak ditemukan</p>
      </div>
    )
  }

  const columns: ColumnDef<SlipPegawaiRow>[] = [
    {
      header: "Nama / NIP",
      cell: (r) => (
        <div>
          <p className="font-semibold text-xs text-foreground">{r.nama}</p>
          <p className="text-[11px] font-mono text-muted-foreground">{r.nip}</p>
        </div>
      ),
    },
    {
      header: "Grade",
      cell: (r) => <Badge variant="outline" className="font-mono text-[11px]">G{r.grade}</Badge>,
      className: "w-20",
    },
    {
      header: "P1 Netto",
      cell: (r) => <RupiahText value={r.netto} className="text-xs font-semibold" />,
    },
    {
      header: "Status Slip",
      cell: (r) =>
        r.statusSlip === "terbit" ? (
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[11px]">
            Terbit
          </Badge>
        ) : r.statusSlip === "gagal" ? (
          <Badge className="bg-rose-100 text-rose-800 border-rose-200 text-[11px]">
            Gagal Terbit
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200 text-[11px]">
            Belum Terbit
          </Badge>
        ),
      className: "w-32",
    },
    {
      header: "Aksi",
      cell: (r) => (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs text-primary gap-1.5"
          onClick={() => {
            setSelectedSlip(r)
            setIsSlipModalOpen(true)
          }}
        >
          <Eye className="size-3.5" /> Lihat Slip
        </Button>
      ),
      className: "w-28",
    },
  ]

  const slipDocumentContent = selectedSlip && (
    <div className="space-y-4 text-xs">
      <div className="border-b pb-3 text-center">
        <p className="font-bold text-sm uppercase tracking-wide">UNIVERSITAS ANDALAS</p>
        <p className="text-muted-foreground">SLIP PEMBAYARAN REMUNERASI P1 — PERIODE {pengajuan.periode.toUpperCase()}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-lg border bg-muted/20 p-3">
        <div>
          <p className="text-muted-foreground">Nama Pegawai</p>
          <p className="font-semibold">{selectedSlip.nama}</p>
        </div>
        <div>
          <p className="text-muted-foreground">NIP</p>
          <p className="font-mono">{selectedSlip.nip}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Unit Kerja</p>
          <p className="font-medium">{pengajuan.unit}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Jabatan / Grade</p>
          <p className="font-medium">{selectedSlip.jabatan || 'N/A'} (Grade {selectedSlip.grade})</p>
        </div>
      </div>

      <div className="rounded-lg border p-3 space-y-1.5">
        <p className="font-semibold text-foreground border-b pb-1">Dasar Perhitungan</p>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Remunerasi per Grade Jabatan (PIR × {selectedSlip.nilaiJabatan})</span>
          <span className="font-medium">{rupiah(selectedSlip.remunerasiPerJabatan)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Komponen P1 (40%)</span>
          <span className="font-medium">{rupiah(selectedSlip.p1Gross)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Pengali Status ({selectedSlip.statusKepegawaian || 'N/A'})</span>
          <span className="font-medium">{selectedSlip.pengaliStatus || 100}%</span>
        </div>
        <div className="flex justify-between font-semibold border-t pt-1">
          <span>Remunerasi P1</span>
          <span>{rupiah(Math.round((selectedSlip.p1Gross * (selectedSlip.pengaliStatus || 100)) / 100))}</span>
        </div>
      </div>

      <div className="rounded-lg border p-3 space-y-1.5">
        <p className="font-semibold text-foreground border-b pb-1">Pengurangan Kehadiran & Hukuman Disiplin</p>
        {selectedSlip.rincianKehadiran && selectedSlip.rincianKehadiran.length > 0 ? (
          selectedSlip.rincianKehadiran.map((rk: any, i: number) => (
            <div key={i} className="flex justify-between text-rose-700">
              <span>• {rk.jenis} ({rk.jumlah}, {rk.persenPotongan}%)</span>
              <span>- {rupiah(rk.nominal)}</span>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground italic">• Tidak ada pengurangan kehadiran</p>
        )}
        <div className="flex justify-between text-rose-700">
          <span>• {selectedSlip.rincianHukdis || 'Tidak ada hukuman disiplin'}</span>
          <span>- {rupiah(selectedSlip.potonganHukdis || 0)}</span>
        </div>
      </div>

      <div className="rounded-lg border bg-emerald-50/40 border-emerald-200 p-3 space-y-1.5">
        <p className="font-semibold text-emerald-950 border-b border-emerald-200 pb-1">Ringkasan Pembayaran</p>
        <div className="flex justify-between">
          <span>Jumlah Bruto (Setelah Potongan)</span>
          <span className="font-medium">{rupiah(selectedSlip.p1SetelahPotongan || selectedSlip.p1Gross)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Potongan Pajak PPh 21 ({selectedSlip.tarifPajakPersen || 5}%)</span>
          <span className="text-rose-700 font-medium">- {rupiah(selectedSlip.pajak)}</span>
        </div>
        <div className="flex justify-between text-sm font-bold text-emerald-800 border-t border-emerald-200 pt-1.5">
          <span>Jumlah Netto Diterima</span>
          <span>{rupiah(selectedSlip.p1Netto)}</span>
        </div>
        <div className="flex justify-between text-[11px] text-muted-foreground pt-1">
          <span>Rekening Tujuan</span>
          <span className="font-mono">{selectedSlip.rekeningMasked}</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="px-0 text-xs gap-1.5"
          onClick={() => navigate("/upt-remunerasi/slip")}
        >
          <ArrowLeft className="size-4" /> Kembali ke Daftar Slip P1
        </Button>
      </div>

      <PageHeader
        title={
          <div className="flex flex-wrap items-center gap-3">
            <span>Slip P1 {pengajuan.unit}</span>
            <StatusBadge status={pengajuan.status} />
          </div>
        }
        subtitle={`${pengajuan.id} • Periode ${pengajuan.periode} • Terbit ${terbitCount} dari ${rows.length} sampel pegawai`}
        actions={
          <Button
            size="sm"
            className={`gap-2 ${!isNettoDitetapkan || submitting ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={handleTerbitkanAtauUlang}
            disabled={!isNettoDitetapkan || submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Menerbitkan...
              </>
            ) : gagalCount > 0 ? (
              <>
                <RefreshCw className="size-4" /> Ulangi yang Gagal ({gagalCount})
              </>
            ) : (
              <>
                <FileText className="size-4" /> Terbitkan Slip
              </>
            )}
          </Button>
        }
      />

      {errorMsg && (
        <WarningBanner variant="error" title="Penerbitan Slip Ditolak">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        </WarningBanner>
      )}

      <WarningBanner variant="info" title="Mekanisme Penerbitan Slip Otomatis">
        Penerbitan slip P1 berlangsung otomatis saat UPT Remunerasi menetapkan <strong>P1 Netto</strong>. Halaman ini
        digunakan untuk memantau status penerbitan per pegawai serta menerbitkan ulang slip yang mengalami kegagalan.
      </WarningBanner>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Users className="size-3.5" /> Total Pegawai Unit
          </p>
          <p className="mt-1 text-lg font-bold">{pengajuan.pegawai} orang</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total P1 Netto Unit</p>
          <p className="mt-1 text-lg font-bold text-primary">{rupiah(pengajuan.netto)}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 text-emerald-600" /> Slip Terbit (Sampel)
          </p>
          <p className="mt-1 text-lg font-bold text-emerald-700">{terbitCount} / {rows.length}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Gagal Terbit</p>
          <p className="mt-1 text-lg font-bold text-rose-600">{gagalCount}</p>
        </div>
      </div>

      <DataTable columns={columns} data={rows} />

      <Dialog open={isSlipModalOpen} onOpenChange={setIsSlipModalOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pratinjau Slip P1 Pegawai</DialogTitle>
            <DialogDescription>
              Tampilan slip resmi sesuai rincian perhitungan yang diterima pegawai.
            </DialogDescription>
          </DialogHeader>
          {slipDocumentContent}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => toast.success(`Mengunduh Slip_P1_${selectedSlip?.nip}.pdf`)}
            >
              <Download className="size-4" /> Unduh PDF
            </Button>
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => {
                setIsSlipModalOpen(false)
                setIsPrintOpen(true)
              }}
            >
              <Printer className="size-4" /> Cetak
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PrintPreview
        open={isPrintOpen}
        onOpenChange={setIsPrintOpen}
        title={`Cetak Slip P1 — ${selectedSlip?.nama ?? ""}`}
      >
        {slipDocumentContent}
      </PrintPreview>
    </div>
  )
}
