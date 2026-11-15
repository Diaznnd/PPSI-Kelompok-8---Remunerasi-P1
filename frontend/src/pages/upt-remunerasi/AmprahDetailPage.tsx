import { useState, useMemo } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  Download,
  Printer,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  RefreshCw,
  Save,
} from "lucide-react"
import { toast } from "sonner"
import {
  PageHeader,
  WarningBanner,
  Button,
  PrintPreview,
} from "./components"
import {
  pengajuanUPT,
  pegawaiHitungSample,
  dokumenConfigInitial,
  rupiah,
} from "@/data/dummy-upt"
import { Badge } from "@/components/ui/badge"

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
  const decodedId = decodeURIComponent(id ?? "")
  const item = pengajuanUPT.find((row) => row.id === decodedId) ?? pengajuanUPT[0]

  const [jenisAmprah, setJenisAmprah] = useState<"Reguler" | "Insentif Bulan ke-13" | "THR Kinerja">("Reguler")
  const [isTersedia, setIsTersedia] = useState(item.status === "amprah_tersedia")
  const [isPrintOpen, setIsPrintOpen] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)

  const nomorAmprah = `AMP/P1/2026/10/${item.id.split("/")[1] ?? "UNIT"}/001`
  const tanggalTerbit = "24 Oktober 2026"

  const rows = useMemo(() => {
    return pegawaiHitungSample.map((p, idx) => ({
      no: idx + 1,
      nama: p.nama,
      nip: p.nip,
      golongan: ["III/d", "III/c", "III/b", "III/b", "III/a"][idx] ?? "III/a",
      npwp: `09.254.${110 + idx}.2-201.000`,
      jabatan: p.jabatan,
      unitKerja: item.unit,
      grade: p.grade,
      nilaiGrade: Math.round(p.p1Gross / (3000 * 0.4)),
      remunerasiP1: p.p1Gross,
      penguranganKehadiran: p.totalPotongan,
      jumlahBruto: p.p1SetelahPotongan,
      pajak: p.pajak,
      pajakTer: p.pajak,
      tabPajak: 0,
      jumlahNetto: p.netto,
    }))
  }, [item.unit])

  const totals = useMemo(() => {
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
  }, [rows])

  const sumNettoPegawai = rows.reduce((s, r) => s + r.jumlahNetto, 0)
  const isTotalMatch = totals.jumlahNetto === sumNettoPegawai

  const handleDownload = (format: "PDF" | "Excel") => {
    setFileError(null)
    toast.success(`Mengunduh berkas Amprah ${nomorAmprah} dalam format ${format}.`)
  }

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
            <Badge className="bg-primary text-primary-foreground text-[11px]">{jenisAmprah}</Badge>
          </div>
          <p><span className="text-slate-500">Nomor:</span> <strong className="font-mono">{nomorAmprah}</strong></p>
          <p><span className="text-slate-500">Unit Kerja:</span> <strong>{item.unit}</strong></p>
          <p><span className="text-slate-500">Periode:</span> <strong>{item.periode}</strong></p>
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
            <p className="font-semibold">{dokumenConfigInitial.penanggungJawab.jabatan}</p>
          </div>
          <div>
            <p className="font-bold underline">{dokumenConfigInitial.penanggungJawab.nama}</p>
            <p className="font-mono text-slate-600">NIP. {dokumenConfigInitial.penanggungJawab.nip}</p>
          </div>
        </div>

        <div className="space-y-12 sm:text-left">
          <div>
            <p className="text-slate-600">{dokumenConfigInitial.kotaTandaTangan}, {tanggalTerbit}</p>
            <p className="font-semibold">{dokumenConfigInitial.kepalaUpt.jabatan}</p>
          </div>
          <div>
            <p className="font-bold underline">{dokumenConfigInitial.kepalaUpt.nama}</p>
            <p className="font-mono text-slate-600">NIP. {dokumenConfigInitial.kepalaUpt.nip}</p>
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
        title={`Dokumen Amprah ${item.unit}`}
        subtitle={`${nomorAmprah} • Periode ${item.periode}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={jenisAmprah}
              onChange={(e) =>
                setJenisAmprah(e.target.value as "Reguler" | "Insentif Bulan ke-13" | "THR Kinerja")
              }
              className="h-9 rounded-md border border-input bg-background px-3 text-xs"
              aria-label="Jenis Amprah"
            >
              <option value="Reguler">Jenis: Reguler</option>
              <option value="Insentif Bulan ke-13">Jenis: Insentif Bulan ke-13</option>
              <option value="THR Kinerja">Jenis: THR Kinerja</option>
            </select>

            {!isTersedia && (
              <Button
                size="sm"
                className="gap-1.5"
                onClick={() => {
                  setIsTersedia(true)
                  toast.success("Amprah berhasil disusun dan berstatus Tersedia untuk diunduh Bendahara.")
                }}
              >
                <Save className="size-4" /> Susun Amprah
              </Button>
            )}

            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setIsPrintOpen(true)}>
              <Printer className="size-4" /> Cetak
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => handleDownload("Excel")}>
              <FileSpreadsheet className="size-4" /> Unduh Excel
            </Button>
            <Button size="sm" className="gap-1.5" onClick={() => handleDownload("PDF")}>
              <Download className="size-4" /> Unduh PDF
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
    </div>
  )
}
