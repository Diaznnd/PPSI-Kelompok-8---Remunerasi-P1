import { useState, useMemo } from "react"
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
import {
  pengajuanUPT,
  pegawaiHitungSample,
  rupiah,
  type PegawaiHitungP1Item,
} from "@/data/dummy-upt"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

type SlipPegawaiStatus = "terbit" | "belum_terbit" | "gagal"

type SlipPegawaiRow = PegawaiHitungP1Item & {
  statusSlip: SlipPegawaiStatus
  rekeningMasked: string
  nilaiJabatan: number
  remunerasiPerJabatan: number
  pajakTer: number
  tabPajak: number
}

export default function SlipDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const decodedId = decodeURIComponent(id ?? "")
  const item = pengajuanUPT.find((row) => row.id === decodedId) ?? pengajuanUPT[0]

  const isNettoDitetapkan =
    item.status === "netto_ditetapkan" || item.status === "amprah_tersedia"

  const initialRows: SlipPegawaiRow[] = useMemo(() => {
    return pegawaiHitungSample.map((p, idx) => {
      let statusSlip: SlipPegawaiStatus = "belum_terbit"
      if (isNettoDitetapkan) {
        statusSlip = item.unit.includes("Penelitian") && idx === 2 ? "gagal" : "terbit"
      }
      const nilaiJabatan = Math.round(p.p1Gross / (3000 * 0.4))
      return {
        ...p,
        statusSlip,
        rekeningMasked: `Bank Nagari •••• ${4821 + idx}`,
        nilaiJabatan,
        remunerasiPerJabatan: Math.round(p.p1Gross / 0.4),
        pajakTer: p.pajak,
        tabPajak: 0,
      }
    })
  }, [isNettoDitetapkan, item.unit])

  const [rows, setRows] = useState<SlipPegawaiRow[]>(initialRows)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [selectedSlip, setSelectedSlip] = useState<SlipPegawaiRow | null>(null)
  const [isSlipModalOpen, setIsSlipModalOpen] = useState(false)
  const [isPrintOpen, setIsPrintOpen] = useState(false)

  const gagalCount = rows.filter((r) => r.statusSlip === "gagal").length
  const terbitCount = rows.filter((r) => r.statusSlip === "terbit").length

  const handleTerbitkanAtauUlang = () => {
    if (!isNettoDitetapkan) {
      const msg = "Netto belum ditetapkan - slip tidak dapat terbit"
      setErrorMsg(msg)
      toast.error(msg)
      return
    }
    setErrorMsg(null)
    setRows((prev) => prev.map((r) => ({ ...r, statusSlip: "terbit" })))
    toast.success(
      gagalCount > 0
        ? `${gagalCount} slip yang gagal berhasil diterbitkan ulang.`
        : "Seluruh slip P1 unit berhasil diterbitkan."
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
        <p className="text-muted-foreground">SLIP PEMBAYARAN REMUNERASI P1 — PERIODE {item.periode.toUpperCase()}</p>
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
          <p className="font-medium">{item.unit}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Jabatan / Grade</p>
          <p className="font-medium">{selectedSlip.jabatan} (Grade {selectedSlip.grade})</p>
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
          <span className="text-muted-foreground">Pengali Status ({selectedSlip.statusKepegawaian})</span>
          <span className="font-medium">{selectedSlip.pengaliStatus}%</span>
        </div>
        <div className="flex justify-between font-semibold border-t pt-1">
          <span>Remunerasi P1</span>
          <span>{rupiah(Math.round((selectedSlip.p1Gross * selectedSlip.pengaliStatus) / 100))}</span>
        </div>
      </div>

      <div className="rounded-lg border p-3 space-y-1.5">
        <p className="font-semibold text-foreground border-b pb-1">Pengurangan Kehadiran & Hukuman Disiplin</p>
        {selectedSlip.rincianKehadiran.length > 0 ? (
          selectedSlip.rincianKehadiran.map((rk, i) => (
            <div key={i} className="flex justify-between text-rose-700">
              <span>• {rk.jenis} ({rk.jumlah}, {rk.persenPotongan}%)</span>
              <span>- {rupiah(rk.nominal)}</span>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground italic">• Tidak ada pengurangan kehadiran</p>
        )}
        <div className="flex justify-between text-rose-700">
          <span>• {selectedSlip.rincianHukdis}</span>
          <span>- {rupiah(selectedSlip.potonganHukdis)}</span>
        </div>
      </div>

      <div className="rounded-lg border bg-emerald-50/40 border-emerald-200 p-3 space-y-1.5">
        <p className="font-semibold text-emerald-950 border-b border-emerald-200 pb-1">Ringkasan Pembayaran</p>
        <div className="flex justify-between">
          <span>Jumlah Bruto (Setelah Potongan)</span>
          <span className="font-medium">{rupiah(selectedSlip.p1SetelahPotongan)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Pajak (PPh 21)</span>
          <span>{rupiah(selectedSlip.pajak)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Pajak TER ({selectedSlip.tarifPajakPersen}%)</span>
          <span>{rupiah(selectedSlip.pajakTer)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Tabungan Pajak</span>
          <span>{rupiah(selectedSlip.tabPajak)}</span>
        </div>
        <div className="flex justify-between text-sm font-bold text-emerald-800 border-t border-emerald-200 pt-1.5">
          <span>Jumlah Netto Diterima</span>
          <span>{rupiah(selectedSlip.netto)}</span>
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
            <span>Slip P1 {item.unit}</span>
            <StatusBadge status={item.status} />
          </div>
        }
        subtitle={`${item.id} • Periode ${item.periode} • Terbit ${terbitCount} dari ${rows.length} sampel pegawai`}
        actions={
          <Button
            size="sm"
            className={`gap-2 ${!isNettoDitetapkan ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={handleTerbitkanAtauUlang}
          >
            {gagalCount > 0 ? (
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
          <p className="mt-1 text-lg font-bold">{item.pegawai} orang</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total P1 Netto Unit</p>
          <p className="mt-1 text-lg font-bold text-primary">{rupiah(item.netto)}</p>
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
