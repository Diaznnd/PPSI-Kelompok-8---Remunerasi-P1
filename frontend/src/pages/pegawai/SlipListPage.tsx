import { Link } from "react-router-dom"
import { useEffect, useMemo, useState } from "react"
import { ArrowRight, CalendarCheck, Download, FileText, TrendingUp, Wallet } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeading, Panel } from "@/components/pegawai/shared"
import { rupiah } from "@/lib/format"
import { pegawaiService } from "@/services/pegawaiService"

export default function SlipListPage() {
  const [slips, setSlips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchSlips = async () => {
      try {
        setLoading(true)
        const result = await pegawaiService.getSlips()
        setSlips(result)
      } catch (error) {
        console.error("Failed to load slips:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchSlips()
  }, [])

  const ringkasan = useMemo(() => {
    const terbaru = slips[0]
    const totalNetto = slips.reduce((sum, s) => sum + Number(s.JumlahNetto || 0), 0)
    const rataNetto = slips.length > 0 ? Math.round(totalNetto / slips.length) : 0
    const avgKehadiran =
      slips.length > 0
        ? (
            slips.reduce((sum, s) => sum + Number(s.absensi?.persen_kehadiran ?? 100), 0) /
            slips.length
          ).toFixed(1)
        : "0.0"

    return { terbaru, totalNetto, rataNetto, avgKehadiran }
  }, [slips])

  const unduhPdf = async (idSlip: string, nomorSlip: string) => {
    try {
      setDownloadingId(idSlip)
      const data = await pegawaiService.downloadSlipPdf(idSlip)
      const blob = data instanceof Blob ? data : new Blob([data], { type: "application/pdf" })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `slip-p1-${String(nomorSlip).replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success("Slip P1 PDF resmi berhasil diunduh.")
    } catch {
      toast.error("Gagal mengunduh PDF slip.")
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <>
      <PageHeading
        title="Slip Remunerasi P1"
        desc="Riwayat pembayaran P1, analisis komponen penghasilan, dan laporan absensi resmi Anda."
      />

      {/* KPI Ringkasan Nilai Bisnis */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Panel className="border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>P1 Netto Terbaru</span>
            <Wallet className="size-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-xl font-bold text-foreground">
            {ringkasan.terbaru ? rupiah(ringkasan.terbaru.JumlahNetto) : "Rp 0"}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {ringkasan.terbaru ? `Periode ${ringkasan.terbaru.Periode}` : "Belum ada periode terbit"}
          </p>
        </Panel>

        <Panel className="border-l-4 border-l-primary">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Akumulasi P1 Netto</span>
            <TrendingUp className="size-4 text-primary" />
          </div>
          <p className="mt-2 text-xl font-bold text-foreground">{rupiah(ringkasan.totalNetto)}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Dari {slips.length} periode tercatat</p>
        </Panel>

        <Panel className="border-l-4 border-l-sky-500">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Rata-rata per Periode</span>
            <FileText className="size-4 text-sky-600" />
          </div>
          <p className="mt-2 text-xl font-bold text-foreground">{rupiah(ringkasan.rataNetto)}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Estimasi penerimaan bulanan</p>
        </Panel>

        <Panel className="border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Rata-rata Kehadiran</span>
            <CalendarCheck className="size-4 text-amber-600" />
          </div>
          <p className="mt-2 text-xl font-bold text-foreground">{ringkasan.avgKehadiran}%</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Dasar indeks kinerja P1</p>
        </Panel>
      </div>

      <Panel className="p-0">
        <div className="border-b px-6 py-4">
          <h2 className="text-sm font-semibold">Daftar Slip P1 per Periode</h2>
          <p className="text-xs text-muted-foreground">
            Klik Lihat Detail untuk melihat rincian potongan, grafik komposisi, dan laporan absensi resmi.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">Memuat data slip P1...</p>
          </div>
        ) : slips.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="mb-2 size-8 text-muted-foreground/50" />
            <p className="text-sm font-medium text-foreground">Belum ada slip P1 tersedia</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Slip akan muncul setelah perhitungan P1 unit Anda disahkan dan diterbitkan oleh UPT Remunerasi.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Periode</TableHead>
                <TableHead>Nomor Slip</TableHead>
                <TableHead>Kehadiran</TableHead>
                <TableHead>Bruto P1</TableHead>
                <TableHead>Pajak &amp; Potongan</TableHead>
                <TableHead>Jumlah Netto</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-6 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slips.map((s) => (
                <TableRow key={s.IDSlip} className="hover:bg-muted/30">
                  <TableCell className="pl-6 font-semibold">{s.Periode}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{s.NomorSlip}</TableCell>
                  <TableCell className="text-xs">
                    <span className="font-medium text-emerald-700 dark:text-emerald-400">
                      {s.absensi?.hadir ?? 22}/{s.absensi?.hari_kerja ?? 22} hari
                    </span>{" "}
                    <span className="text-muted-foreground">({s.absensi?.persen_kehadiran ?? 100}%)</span>
                  </TableCell>
                  <TableCell className="text-xs">{rupiah(s.JumlahBruto)}</TableCell>
                  <TableCell className="text-xs text-rose-600">
                    - {rupiah(Number(s.PenguranganKehadiran || 0) + Number(s.PajakPPh21 || 0))}
                  </TableCell>
                  <TableCell className="font-bold text-primary">{rupiah(s.JumlahNetto)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                      {s.StatusSlip}
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <div className="inline-flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2.5 text-xs"
                        disabled={downloadingId === s.IDSlip}
                        onClick={() => unduhPdf(s.IDSlip, s.NomorSlip)}
                      >
                        <Download className="mr-1 size-3" />
                        PDF
                      </Button>
                      <Button asChild size="sm" className="h-7 px-2.5 text-xs">
                        <Link to={`/pegawai/slip/${s.IDSlip}`}>
                          Detail <ArrowRight className="ml-1 size-3" />
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Panel>
    </>
  )
}
