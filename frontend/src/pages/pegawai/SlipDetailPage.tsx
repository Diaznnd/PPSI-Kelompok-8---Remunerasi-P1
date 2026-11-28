import type { ReactNode } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CalendarCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  FileSpreadsheet,
  MessageSquare,
  ShieldCheck,
} from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Field, PageHeading, Panel } from "@/components/pegawai/shared"
import { rupiah } from "@/lib/format"
import { cn } from "@/lib/utils"
import { pegawaiService } from "@/services/pegawaiService"

function Seksi({ no, judul, desk, right, children }: { no: string; judul: string; desk: string; right?: ReactNode; children: ReactNode }) {
  return (
    <Panel>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-3">
          <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {no}
          </span>
          <div>
            <h2 className="font-semibold leading-tight">{judul}</h2>
            <p className="text-xs text-muted-foreground">{desk}</p>
          </div>
        </div>
        {right}
      </div>
      <div className="pt-5">{children}</div>
    </Panel>
  )
}

export default function SlipDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [slip, setSlip] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [downloadingAbsensi, setDownloadingAbsensi] = useState(false)
  const [showTlPswDetail, setShowTlPswDetail] = useState(false)

  useEffect(() => {
    const fetchSlip = async () => {
      if (!id) return
      try {
        setLoading(true)
        const result = await pegawaiService.getSlipDetail(id)
        setSlip(result)
      } catch (error) {
        console.error("Failed to load slip detail:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchSlip()
  }, [id])

  if (loading) {
    return (
      <Panel>
        <p className="text-sm text-muted-foreground">Memuat rincian slip P1...</p>
      </Panel>
    )
  }

  if (!slip) {
    return (
      <Panel>
        <p className="text-sm">Slip tidak ditemukan.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/pegawai/slip">Kembali ke Daftar</Link>
        </Button>
      </Panel>
    )
  }

  const pegawai = slip.pegawai || {}
  const absensi = slip.absensi || {}
  const remP1Awal = Number(slip.RemunerasiP1 || 0)
  const pengurangan = Number(slip.PenguranganKehadiran || 0)
  const pajak = Number(slip.PajakPPh21 || 0)
  const netto = Number(slip.JumlahNetto || 0)
  const baseTotal = Math.max(remP1Awal, 1)
  const pctNetto = Math.min(100, Math.round((netto / baseTotal) * 100))
  const pctPajak = Math.min(100 - pctNetto, Math.round((pajak / baseTotal) * 100))
  const pctPotongan = Math.max(0, 100 - pctNetto - pctPajak)

  const unduhSlipPdf = async () => {
    if (!id || downloading) return
    try {
      setDownloading(true)
      const data = await pegawaiService.downloadSlipPdf(id)
      const blob = data instanceof Blob ? data : new Blob([data], { type: "application/pdf" })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      const nomorBersih = String(slip?.NomorSlip || slip?.nomor || id).replace(/[^a-zA-Z0-9_-]/g, "_")
      link.setAttribute("download", `Slip-P1-Resmi-${nomorBersih}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success("Slip P1 PDF resmi (Kop Surat) berhasil diunduh.")
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Gagal mengunduh file PDF.")
    } finally {
      setDownloading(false)
    }
  }

  const unduhAbsensiPdf = async () => {
    if (!id || downloadingAbsensi) return
    try {
      setDownloadingAbsensi(true)
      const data = await pegawaiService.downloadAbsensiPdf(id)
      const blob = data instanceof Blob ? data : new Blob([data], { type: "application/pdf" })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `Laporan-Absensi-${pegawai.NIP || id}-${String(slip.Periode || "").replace(/\s+/g, "-")}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success("Laporan Absensi PDF resmi berhasil diunduh.")
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Gagal mengunduh laporan absensi PDF.")
    } finally {
      setDownloadingAbsensi(false)
    }
  }

  const ajukan = () => navigate(`/pegawai/pengaduan/baru?periode=${encodeURIComponent(slip.Periode)}`)

  return (
    <>
      <Link to="/pegawai/slip" className="mb-3 inline-flex items-center gap-1 text-xs text-primary hover:underline">
        <ArrowLeft className="size-3" /> Kembali ke Daftar Slip P1
      </Link>
      <PageHeading
        title={`Slip P1 — ${slip.Periode}`}
        desc={`Dokumen rincian remunerasi dan laporan kehadiran resmi periode ${slip.Periode}.`}
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={unduhAbsensiPdf} disabled={downloadingAbsensi}>
              <FileSpreadsheet className="mr-1.5 size-4" />
              {downloadingAbsensi ? "Menyiapkan..." : "Export Laporan Absensi (PDF)"}
            </Button>
            <Button onClick={unduhSlipPdf} disabled={downloading}>
              <Download className="mr-1.5 size-4" />
              {downloading ? "Menyiapkan..." : "Export Slip P1 Resmi (PDF)"}
            </Button>
          </div>
        }
      />

      <div className="space-y-6 pb-10">
        {/* Hero Card Ringkasan Nilai Bisnis */}
        <div className="overflow-hidden rounded-xl border bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 p-6 text-white shadow-sm">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-emerald-400/20 text-emerald-100 hover:bg-emerald-400/25 border-emerald-400/30">
                  <CheckCircle2 className="mr-1 size-3" /> {slip.StatusSlip || "Terbit"}
                </Badge>
                <span className="font-mono text-xs text-emerald-200/90">{slip.NomorSlip}</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight">{pegawai.Nama || "-"}</h2>
              <p className="text-xs text-emerald-100/80">
                NIP {pegawai.NIP || "-"} • {pegawai.NamaJabatan || "-"} ({pegawai.KodeGrade || "-"}) • {pegawai.NamaUnit || "-"}
              </p>
            </div>

            <div className="rounded-xl bg-white/10 px-5 py-4 backdrop-blur-sm md:text-right">
              <p className="text-[11px] uppercase tracking-wider text-emerald-200">Total P1 Netto Diterima</p>
              <p className="mt-1 text-3xl font-extrabold tracking-tight text-white">{rupiah(netto)}</p>
              <p className="mt-1 text-[11px] text-emerald-100/80">
                Rekening: {pegawai.NamaBank ? `${pegawai.NamaBank} ${pegawai.NoRekening}` : pegawai.NoRekening || "-"}
              </p>
            </div>
          </div>

          {/* Visual Breakdown Bar */}
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-[11px] text-emerald-100/90">
              <span>Komposisi dari P1 Awal ({rupiah(remP1Awal)})</span>
              <span>
                Netto {pctNetto}% • Pajak {pctPajak}% • Potongan Kehadiran {pctPotongan}%
              </span>
            </div>
            <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-white/15">
              <div className="bg-emerald-400" style={{ width: `${pctNetto}%` }} title={`Netto: ${rupiah(netto)}`} />
              <div className="bg-amber-400" style={{ width: `${pctPajak}%` }} title={`Pajak: ${rupiah(pajak)}`} />
              <div className="bg-rose-400" style={{ width: `${pctPotongan}%` }} title={`Potongan: ${rupiah(pengurangan)}`} />
            </div>
          </div>
        </div>

        {/* 01. Identitas */}
        <Seksi no="01" judul="Identitas dan Periode" desk="Informasi pemilik slip dan periode pembayaran.">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Nama Lengkap" value={pegawai.Nama || "-"} />
            <Field label="NIP" value={pegawai.NIP || "-"} />
            <Field label="NPWP" value={pegawai.NPWP || "-"} />
            <Field label="Pangkat/Golongan" value={pegawai.Pangkat || "-"} />
            <Field label="Nama Jabatan" value={pegawai.NamaJabatan || "-"} />
            <Field label="Unit Kerja" value={pegawai.NamaUnit || "-"} />
            <Field label="Grade" value={pegawai.KodeGrade || "-"} />
            <Field label="Status Kepegawaian" value={pegawai.StatusPegawai || "-"} />
            <Field label="Periode" value={slip.Periode || "-"} />
          </div>
        </Seksi>

        {/* 02. Dasar Perhitungan */}
        <Seksi no="02" judul="Dasar Perhitungan P1" desk="Komponen pembentuk nilai Remunerasi P1 sebelum potongan.">
          <div className="grid overflow-hidden rounded-lg border sm:grid-cols-4">
            {[
              ["Remunerasi Grade", rupiah(slip.RemunerasiGrade || 0)],
              [`Porsi P1 (${slip.PersenP1 || 40}%)`, rupiah((Number(slip.RemunerasiGrade || 0) * Number(slip.PersenP1 || 40)) / 100)],
              ["Pengali Status", `${slip.PengaliStatus || 100}%`],
              ["Remunerasi P1 Awal", rupiah(remP1Awal)],
            ].map(([l, v], i) => (
              <div
                key={String(l)}
                className={cn(
                  "border-b p-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0",
                  i === 3 && "bg-primary/10"
                )}
              >
                <p className="text-[11px] text-muted-foreground">{l}</p>
                <p className="mt-1 font-bold">{v}</p>
              </div>
            ))}
          </div>
        </Seksi>

        {/* 03. Preview Laporan Absensi Resmi (Poin 8) */}
        <Seksi
          no="03"
          judul="Preview Laporan Absensi Resmi"
          desk="Format laporan kehadiran resmi dari Bidang Kepegawaian yang mendasari perhitungan P1."
          right={
            <Button size="sm" variant="outline" onClick={unduhAbsensiPdf} disabled={downloadingAbsensi}>
              <Download className="mr-1.5 size-3.5" />
              Export Absensi PDF
            </Button>
          }
        >
          <div className="rounded-xl border bg-card p-5 shadow-xs">
            {/* Mini Kop Surat Preview */}
            <div className="flex items-center justify-between border-b-2 border-foreground/80 pb-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Building2 className="size-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Universitas Andalas
                  </p>
                  <p className="text-sm font-bold uppercase text-foreground">
                    {pegawai.NamaUnit || "Fakultas Teknologi Informasi"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Laporan Rekapitulasi Kehadiran Pegawai • Periode {slip.Periode}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-800">
                <ShieldCheck className="mr-1 size-3" /> {String(absensi.status_validasi || "VALID").toUpperCase()}
              </Badge>
            </div>

            {/* KPI Kehadiran */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 mb-4">
              <div className="rounded-lg border bg-muted/20 p-3 text-center">
                <p className="text-[10px] text-muted-foreground">Hari Kerja Efektif</p>
                <p className="mt-1 text-base font-bold">{absensi.hari_kerja ?? 22} hari</p>
              </div>
              <div className="rounded-lg border bg-emerald-50/70 dark:bg-emerald-950/20 p-3 text-center">
                <p className="text-[10px] text-emerald-700 dark:text-emerald-300">Total Hadir</p>
                <p className="mt-1 text-base font-bold text-emerald-700 dark:text-emerald-300">{absensi.hadir ?? 22} hari</p>
              </div>
              <div className="rounded-lg border bg-muted/20 p-3 text-center">
                <p className="text-[10px] text-muted-foreground">Cuti / Izin</p>
                <p className="mt-1 text-base font-bold">{absensi.cuti_izin ?? 0} hari</p>
              </div>
              <div className="rounded-lg border bg-rose-50/60 dark:bg-rose-950/20 p-3 text-center">
                <p className="text-[10px] text-rose-700 dark:text-rose-300">Alfa</p>
                <p className="mt-1 text-base font-bold text-rose-700 dark:text-rose-300">{absensi.tidak_hadir ?? 0} hari</p>
              </div>
              <div className="rounded-lg border bg-primary/5 p-3 text-center">
                <p className="text-[10px] text-primary">Tingkat Kehadiran</p>
                <p className="mt-1 text-base font-bold text-primary">{absensi.persen_kehadiran ?? 100}%</p>
              </div>
            </div>

            {/* Collapsible TL & PSW Detail */}
            <div className="rounded-lg border">
              <button
                type="button"
                onClick={() => setShowTlPswDetail((v) => !v)}
                className="flex w-full items-center justify-between px-4 py-2.5 text-xs font-medium hover:bg-muted/40"
              >
                <span className="flex items-center gap-2">
                  <CalendarCheck className="size-3.5 text-primary" />
                  Rincian Keterlambatan (TL: {absensi.tl_total ?? 0}) &amp; Pulang Sebelum Waktunya (PSW: {absensi.psw_total ?? 0})
                </span>
                {showTlPswDetail ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
              </button>
              {showTlPswDetail && (
                <div className="border-t p-3 overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-left text-muted-foreground border-b">
                        <th className="py-1.5 px-2">Komponen</th>
                        <th className="py-1.5 px-2">Jumlah</th>
                        <th className="py-1.5 px-2">Tarif</th>
                        <th className="py-1.5 px-2 text-right">Pengurangan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {(slip.komponen || []).map((k: any) => (
                        <tr key={k.Nama}>
                          <td className="py-1.5 px-2 font-medium">{k.Nama}</td>
                          <td className="py-1.5 px-2">{k.JumlahHari} hari</td>
                          <td className="py-1.5 px-2">{k.TarifPerHari}</td>
                          <td className="py-1.5 px-2 text-right">{k.PersenPengurangan}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </Seksi>

        {/* Rincian Tambahan jika ada */}
        {slip.rincianTambahan && slip.rincianTambahan.length > 0 && (
          <Seksi no="04" judul="Potongan Tambahan" desk="Potongan khusus berdasarkan status kepegawaian, SKP, atau hukuman disiplin.">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground border-b">
                    <th className="px-3 py-2 font-medium">Jenis Potongan</th>
                    <th className="px-3 py-2 font-medium">Persentase</th>
                    <th className="px-3 py-2 font-medium">Nominal</th>
                  </tr>
                </thead>
                <tbody>
                  {slip.rincianTambahan.map((r: any) => (
                    <tr key={r.label} className="odd:bg-muted/40">
                      <td className="px-3 py-3 font-semibold flex items-center gap-2">
                        <AlertTriangle className="size-4 text-amber-500" />
                        {r.label}
                      </td>
                      <td className="px-3 py-3">{r.persen}%</td>
                      <td className="px-3 py-3 text-rose-700">- {rupiah(r.nominal || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Seksi>
        )}

        {/* Ringkasan Pembayaran Akhir */}
        <Panel className="md:ml-auto md:w-[28rem]">
          <h2 className="font-semibold">Ringkasan Pembayaran P1</h2>
          <dl className="mt-4 space-y-2 text-xs">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Remunerasi P1 Awal</dt>
              <dd className="font-semibold">{rupiah(remP1Awal)}</dd>
            </div>
            <div className="flex justify-between text-rose-700">
              <dt className="text-muted-foreground">Pengurangan Kehadiran ({slip.TotalPersenPengurangan || 0}%)</dt>
              <dd className="font-semibold">- {rupiah(pengurangan)}</dd>
            </div>
            <div className="flex justify-between border-t pt-2">
              <dt className="text-muted-foreground">Jumlah Bruto</dt>
              <dd className="font-semibold">{rupiah(slip.JumlahBruto || 0)}</dd>
            </div>
            <div className="flex justify-between text-rose-700">
              <dt className="text-muted-foreground">Potongan Pajak PPh 21</dt>
              <dd className="font-semibold">- {rupiah(pajak)}</dd>
            </div>
          </dl>
          <div className="mt-4 flex items-center justify-between rounded-lg bg-primary/10 p-4">
            <span className="text-[11px] font-semibold">JUMLAH NETTO DITERIMA</span>
            <span className="text-xl font-bold text-primary">{rupiah(netto)}</span>
          </div>
        </Panel>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button asChild variant="ghost">
            <Link to="/pegawai/slip">
              <ArrowLeft className="mr-1.5 size-4" /> Kembali ke Daftar
            </Link>
          </Button>
          <Button onClick={ajukan}>
            <MessageSquare className="mr-1.5 size-4" /> Ajukan Pengaduan atas Slip Ini
          </Button>
        </div>
      </div>
    </>
  )
}
