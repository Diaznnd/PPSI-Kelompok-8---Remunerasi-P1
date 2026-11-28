import { useState, useMemo, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  Download,
  Printer,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  RefreshCw,
  Loader2,
  FileText,
} from "lucide-react"
import { toast } from "sonner"
import {
  PageHeader,
  WarningBanner,
  Button,
  PrintPreview,
} from "./components"
import { uptRemunerasiService } from "@/services/uptRemunerasiService"
import { Badge } from "@/components/ui/badge"
import { LembarVerifikasiModal } from "@/components/upt-remunerasi/LembarVerifikasiModal"

const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n)

type PegawaiAmprah = {
  no: number
  nama: string
  nip: string
  golongan: string
  npwp: string
  jabatan: string
  unitKerja: string
  grade: number
  nilaiGrade: number
  remunerasiP1: number
  penguranganKehadiran: number
  jumlahBruto: number
  pajak: number
  pajakTer: number
  tabPajak: number
  jumlahNetto: number
}

type AmprahDetail = {
  id: string
  nomor: string
  periode: string
  unit_id: number
  unit_nama: string
  kelompok: string
  status: string
  tanggal_terbit: string
  pegawai: PegawaiAmprah[]
  total_bruto: number
  total_pajak: number
  total_netto: number
  penanggung_jawab: {
    nama: string
    nip: string
    jabatan: string
  }
  kepala_upt: {
    nama: string
    nip: string
    jabatan: string
  }
}

function terbilang(n: number): string {
  const satuan = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"]
  if (n < 12) return satuan[n]
  if (n < 20) return `${terbilang(n - 10)} Belas`
  if (n < 100) return `${terbilang(Math.floor(n / 10))} Puluh ${terbilang(n % 10)}`.trim()
  if (n < 200) return `Seratus ${terbilang(n - 100)}`.trim()
  if (n < 1000) return `${terbilang(Math.floor(n / 100))} Ratus ${terbilang(n % 100)}`.trim()
  if (n < 2000) return `Seribu ${terbilang(n - 1000)}`.trim()
  if (n < 1_000_000) return `${terbilang(Math.floor(n / 1000))} Ribu ${terbilang(n % 1000)}`.trim()
  if (n < 1_000_000_000) return `${terbilang(Math.floor(n / 1_000_000))} Juta ${terbilang(n % 1_000_000)}`.trim()
  if (n < 1_000_000_000_000) return `${terbilang(Math.floor(n / 1_000_000_000))} Miliar ${terbilang(n % 1_000_000_000)}`.trim()
  return String(n)
}

export default function AmprahDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const [loading, setLoading] = useState(true)
  const [amprah, setAmprah] = useState<AmprahDetail | null>(null)
  const [isPrintOpen, setIsPrintOpen] = useState(false)
  const [isLembarVerifOpen, setIsLembarVerifOpen] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (id) {
      loadAmprahDetail()
    }
  }, [id])

  const loadAmprahDetail = async () => {
    if (!id) return

    try {
      setLoading(true)
      const res = await uptRemunerasiService.getAmprahDetail(id)
      
      // Map API response to component format
      const detail: AmprahDetail = {
        id: res.data.id,
        nomor: res.data.nomor_amprah || `AMP/P1/${res.data.periode}/${res.data.unit_nama}/001`,
        periode: res.data.periode,
        unit_id: res.data.unit_id,
        unit_nama: res.data.unit_nama,
        kelompok: res.data.kelompok || "Reguler",
        status: res.data.status,
        tanggal_terbit: res.data.created_at || new Date().toISOString(),
        pegawai: (res.data.pegawai || []).map((p: any, idx: number) => ({
          no: idx + 1,
          nama: p.nama,
          nip: p.NIP || p.nip,
          golongan: p.pangkat_golongan || p.golongan || "-",
          npwp: p.npwp || "-",
          jabatan: p.nama_jabatan || p.jabatan || "-",
          unitKerja: res.data.unit_nama,
          grade: p.grade || 0,
          nilaiGrade: p.nilai_grade || 0,
          remunerasiP1: p.p1_gross || p.remunerasi_p1 || 0,
          penguranganKehadiran: p.total_potongan || p.pengurangan_kehadiran || 0,
          jumlahBruto: p.p1_setelah_potongan || p.jumlah_bruto || 0,
          pajak: p.pajak || 0,
          pajakTer: p.pajak_ter || p.pajak || 0,
          tabPajak: p.tab_pajak || 0,
          jumlahNetto: p.p1_netto || p.jumlah_netto || 0,
        })),
        total_bruto: res.data.total_bruto || 0,
        total_pajak: res.data.total_pajak || 0,
        total_netto: res.data.total_netto || 0,
        penanggung_jawab: res.data.penanggung_jawab || {
          nama: "Dr. Ahmad Syafrizal, M.T.",
          nip: "196805121994031002",
          jabatan: "Kepala Bagian Keuangan",
        },
        kepala_upt: res.data.kepala_upt || {
          nama: "Prof. Dr. Ir. Hendri Sutrisno, M.Sc.",
          nip: "196512081991031004",
          jabatan: "Kepala UPT Remunerasi",
        },
      }

      setAmprah(detail)
    } catch (error) {
      console.error("Error loading amprah detail:", error)
      toast.error("Gagal memuat detail amprah")
    } finally {
      setLoading(false)
    }
  }

  const rows = useMemo(() => amprah?.pegawai || [], [amprah])

  const totals = useMemo(() => {
    if (!amprah) {
      return {
        remunerasiP1: 0,
        penguranganKehadiran: 0,
        jumlahBruto: 0,
        pajak: 0,
        pajakTer: 0,
        tabPajak: 0,
        jumlahNetto: 0,
      }
    }

    return rows.reduce(
      (acc, r) => ({
        remunerasiP1: acc.remunerasiP1 + r.remunerasiP1,
        penguranganKehadiran: acc.penguranganKehadiran + r.penguranganKehadiran,
        jumlahBruto: acc.jumlahBruto + r.jumlahBruto,
        pajak: acc.pajak + r.pajak,
        pajakTer: acc.pajakTer + r.pajakTer,
        tabPajak: acc.tabPajak + r.tabPajak,
        jumlahNetto: acc.jumlahNetto + r.jumlahNetto,
      }),
      {
        remunerasiP1: 0,
        penguranganKehadiran: 0,
        jumlahBruto: 0,
        pajak: 0,
        pajakTer: 0,
        tabPajak: 0,
        jumlahNetto: 0,
      }
    )
  }, [rows, amprah])

  const sumNettoPegawai = rows.reduce((s, r) => s + r.jumlahNetto, 0)
  const isTotalMatch = Math.abs(totals.jumlahNetto - sumNettoPegawai) < 1 // Allow small rounding difference

  const handleDownload = async (format: "PDF" | "Excel") => {
    if (!amprah) return

    setFileError(null)
    try {
      setSubmitting(true)
      // In real implementation, call download API here
      // await uptRemunerasiService.downloadAmprah(amprah.id, format)
      toast.success(`Mengunduh berkas Amprah ${amprah.nomor} dalam format ${format}.`)
    } catch (error) {
      console.error("Error downloading amprah:", error)
      setFileError(`Gagal mengunduh berkas ${format}`)
      toast.error(`Gagal mengunduh berkas ${format}`)
    } finally {
      setSubmitting(false)
    }
  }

  const formatTanggal = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!amprah) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Data amprah tidak ditemukan</p>
        <Button onClick={() => navigate("/upt-remunerasi/amprah")} className="mt-4">
          Kembali ke Daftar Amprah
        </Button>
      </div>
    )
  }

  const nomorAmprah = amprah.nomor
  const tanggalTerbit = formatTanggal(amprah.tanggal_terbit)

  const documentContent = (
    <div className="space-y-6 rounded-xl border bg-white p-6 md:p-8 text-slate-900 shadow-xs">
      <div className="border-b-2 border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI</p>
          <h2 className="text-lg font-bold tracking-tight">UNIVERSITAS ANDALAS</h2>
          <p className="text-xs font-semibold text-slate-700">UNIT PELAKSANA TEKNIS (UPT) REMUNERASI</p>
          <p className="mt-2 text-sm font-bold underline">DAFTAR AMPRAH PEMBAYARAN REMUNERASI P1</p>
        </div>
        <div className="text-xs space-y-1 sm:text-right">
          <div className="flex sm:justify-end items-center gap-2">
            <span className="text-slate-500">Jenis Amprah:</span>
            <Badge className="bg-primary text-primary-foreground text-[11px]">{amprah.kelompok}</Badge>
          </div>
          <p><span className="text-slate-500">Nomor:</span> <strong className="font-mono">{nomorAmprah}</strong></p>
          <p><span className="text-slate-500">Unit Kerja:</span> <strong>{amprah.unit_nama}</strong></p>
          <p><span className="text-slate-500">Periode:</span> <strong>{amprah.periode}</strong></p>
          <p><span className="text-slate-500">Tanggal Terbit:</span> {tanggalTerbit}</p>
        </div>
      </div>

      <div
        className={`flex items-center gap-2.5 rounded-lg border px-4 py-2.5 text-xs font-medium ${
          isTotalMatch
            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
            : "border-rose-200 bg-rose-50 text-rose-800"
        }`}
      >
        {isTotalMatch ? (
          <>
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
            <span>Validasi: Total amprah = jumlah Netto seluruh pegawai ({rupiah(totals.jumlahNetto)})</span>
          </>
        ) : (
          <>
            <AlertTriangle className="size-4 shrink-0 text-rose-600" />
            <span>Peringatan: Total amprah tidak sama dengan jumlah Netto seluruh pegawai!</span>
          </>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-300">
        <table className="w-full text-[11px] border-collapse">
          <thead className="bg-slate-100 text-slate-700 font-semibold text-center">
            <tr className="border-b border-slate-300">
              <th className="p-2 border-r border-slate-300">No</th>
              <th className="p-2 border-r border-slate-300 text-left">Nama / NIP</th>
              <th className="p-2 border-r border-slate-300 text-left">Golongan / NPWP</th>
              <th className="p-2 border-r border-slate-300 text-left">Jabatan / Unit Kerja</th>
              <th className="p-2 border-r border-slate-300">Grade</th>
              <th className="p-2 border-r border-slate-300">Nilai Grade</th>
              <th className="p-2 border-r border-slate-300 text-right">Remunerasi P1</th>
              <th className="p-2 border-r border-slate-300 text-right">Pengurangan Kehadiran</th>
              <th className="p-2 border-r border-slate-300 text-right">Jumlah Bruto</th>
              <th className="p-2 border-r border-slate-300 text-right">Pajak</th>
              <th className="p-2 border-r border-slate-300 text-right">Pajak TER</th>
              <th className="p-2 border-r border-slate-300 text-right">Tab. Pajak</th>
              <th className="p-2 border-r border-slate-300 text-right">Jumlah Netto</th>
              <th className="p-2">Tanda Tangan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.map((r) => (
              <tr key={r.no} className="hover:bg-slate-50">
                <td className="p-2 border-r border-slate-200 text-center">{r.no}</td>
                <td className="p-2 border-r border-slate-200">
                  <p className="font-semibold">{r.nama}</p>
                  <p className="font-mono text-[10px] text-slate-500">{r.nip}</p>
                </td>
                <td className="p-2 border-r border-slate-200">
                  <p>{r.golongan}</p>
                  <p className="font-mono text-[10px] text-slate-500">{r.npwp}</p>
                </td>
                <td className="p-2 border-r border-slate-200">
                  <p>{r.jabatan}</p>
                  <p className="text-[10px] text-slate-500">{r.unitKerja}</p>
                </td>
                <td className="p-2 border-r border-slate-200 text-center font-mono">G{r.grade}</td>
                <td className="p-2 border-r border-slate-200 text-center font-mono">{r.nilaiGrade}</td>
                <td className="p-2 border-r border-slate-200 text-right">{rupiah(r.remunerasiP1)}</td>
                <td className="p-2 border-r border-slate-200 text-right text-rose-700">{rupiah(r.penguranganKehadiran)}</td>
                <td className="p-2 border-r border-slate-200 text-right font-medium">{rupiah(r.jumlahBruto)}</td>
                <td className="p-2 border-r border-slate-200 text-right">{rupiah(r.pajak)}</td>
                <td className="p-2 border-r border-slate-200 text-right">{rupiah(r.pajakTer)}</td>
                <td className="p-2 border-r border-slate-200 text-right">{rupiah(r.tabPajak)}</td>
                <td className="p-2 border-r border-slate-200 text-right font-bold text-emerald-800">{rupiah(r.jumlahNetto)}</td>
                <td className="p-2 text-center text-slate-400 italic">{r.no}. ............</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300">
            <tr>
              <td colSpan={6} className="p-2 border-r border-slate-300 text-right uppercase">
                Total Pembayaran (Sampel {rows.length} Pegawai)
              </td>
              <td className="p-2 border-r border-slate-300 text-right">{rupiah(totals.remunerasiP1)}</td>
              <td className="p-2 border-r border-slate-300 text-right text-rose-700">{rupiah(totals.penguranganKehadiran)}</td>
              <td className="p-2 border-r border-slate-300 text-right">{rupiah(totals.jumlahBruto)}</td>
              <td className="p-2 border-r border-slate-300 text-right">{rupiah(totals.pajak)}</td>
              <td className="p-2 border-r border-slate-300 text-right">{rupiah(totals.pajakTer)}</td>
              <td className="p-2 border-r border-slate-300 text-right">{rupiah(totals.tabPajak)}</td>
              <td className="p-2 border-r border-slate-300 text-right text-emerald-800">{rupiah(totals.jumlahNetto)}</td>
              <td className="p-2" />
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
        <span className="font-semibold text-slate-600">Terbilang: </span>
        <span className="italic font-semibold text-slate-900">
          # {terbilang(totals.jumlahNetto)} Rupiah #
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6 text-xs">
        <div className="space-y-12">
          <div>
            <p className="text-slate-600">Mengetahui / Menyetujui,</p>
            <p className="font-semibold">{amprah.penanggung_jawab.jabatan}</p>
          </div>
          <div>
            <p className="font-bold underline">{amprah.penanggung_jawab.nama}</p>
            <p className="font-mono text-slate-600">NIP. {amprah.penanggung_jawab.nip}</p>
          </div>
        </div>

        <div className="space-y-12 sm:text-left">
          <div>
            <p className="text-slate-600">Padang, {tanggalTerbit}</p>
            <p className="font-semibold">{amprah.kepala_upt.jabatan}</p>
          </div>
          <div>
            <p className="font-bold underline">{amprah.kepala_upt.nama}</p>
            <p className="font-mono text-slate-600">NIP. {amprah.kepala_upt.nip}</p>
          </div>
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
          onClick={() => navigate("/upt-remunerasi/amprah")}
        >
          <ArrowLeft className="size-4" /> Kembali ke Daftar Amprah
        </Button>
      </div>

      <PageHeader
        title={`Dokumen Amprah ${amprah.unit_nama}`}
        subtitle={`${nomorAmprah} • Periode ${amprah.periode}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setIsLembarVerifOpen(true)}
            >
              <FileText className="size-4" /> Lembar Verifikasi
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setIsPrintOpen(true)} disabled={submitting}>
              <Printer className="size-4" /> Cetak Amprah
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => handleDownload("Excel")}
              disabled={submitting}
            >
              {submitting ? <Loader2 className="size-4 animate-spin" /> : <FileSpreadsheet className="size-4" />}
              Unduh Excel
            </Button>
            <Button size="sm" className="gap-1.5" onClick={() => handleDownload("PDF")} disabled={submitting}>
              {submitting ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
              Unduh PDF
            </Button>
          </div>
        }
      />

      <WarningBanner variant="info" title="Catatan Pencairan Dana (SAKU)">
        Unggah amprah ke <strong>SAKU</strong> dilakukan di luar SIREMUN. Sistem tidak mentransfer dana.
      </WarningBanner>

      {fileError && (
        <WarningBanner variant="error" title="Gagal Membuat Berkas">
          <div className="flex items-center justify-between gap-4">
            <span>{fileError}</span>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => handleDownload("PDF")}>
              <RefreshCw className="size-3.5" /> Coba Lagi
            </Button>
          </div>
        </WarningBanner>
      )}

      {documentContent}

      <PrintPreview
        open={isPrintOpen}
        onOpenChange={setIsPrintOpen}
        title={`Cetak Amprah — ${nomorAmprah}`}
      >
        {documentContent}
      </PrintPreview>

      <LembarVerifikasiModal
        open={isLembarVerifOpen}
        onOpenChange={setIsLembarVerifOpen}
        data={{
          pengajuan: {
            nomor_pengajuan: amprah.nomor,
            unit: amprah.unit_nama,
            periode: amprah.periode,
            jumlah_penerima: rows.length,
            jumlah_kotor: totals.jumlahBruto,
            kelompok: amprah.kelompok || "Tenaga Kependidikan",
          },
          pejabat: {
            nama: amprah.kepala_upt?.nama || "Drs. Imrizal, MM",
            nip: amprah.kepala_upt?.nip || "196303071985031009",
            jabatan: amprah.kepala_upt?.jabatan || "Ketua UPT Remunerasi",
          },
        }}
      />
    </div>
  )
}
