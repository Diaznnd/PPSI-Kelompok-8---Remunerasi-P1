import type { ReactNode } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Download, MessageSquare, Printer, AlertTriangle } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Field, PageHeading, Panel } from "@/components/pegawai/shared"
import { rupiah } from "@/lib/format"
import { cn } from "@/lib/utils"
import { pegawaiService } from "@/services/pegawaiService"

function Seksi({ no, judul, desk, children }: { no: string; judul: string; desk: string; children: ReactNode }) {
  return (
    <Panel>
      <div className="flex items-center gap-3 border-b pb-4">
        <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{no}</span>
        <div>
          <h2 className="font-semibold leading-tight">{judul}</h2>
          <p className="text-xs text-muted-foreground">{desk}</p>
        </div>
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

  useEffect(() => {
    const fetchSlip = async () => {
      if (!id) return
      try {
        setLoading(true)
        const result = await pegawaiService.getSlipDetail(id)
        setSlip(result)
      } catch (error) {
        console.error('Failed to load slip detail:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchSlip()
  }, [id])

  if (loading) {
    return (
      <Panel>
        <p className="text-sm">Memuat data slip...</p>
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
  const cetak = () => window.print()
  const unduh = async () => {
    if (!id || downloading) return
    try {
      setDownloading(true)
      const data = await pegawaiService.downloadSlipPdf(id)
      const blob = data instanceof Blob ? data : new Blob([data], { type: "application/pdf" })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      const nomorBersih = String(slip?.NomorSlip || slip?.nomor || id).replace(/[^a-zA-Z0-9_-]/g, "_")
      link.setAttribute("download", `slip-p1-${nomorBersih}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success("Slip PDF berhasil diunduh.")
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Gagal mengunduh file PDF.")
    } finally {
      setDownloading(false)
    }
  }
  const ajukan = () => navigate(`/pegawai/pengaduan/baru?periode=${encodeURIComponent(slip.Periode)}`)

  return (
    <>
      <Link to="/pegawai/slip" className="mb-3 inline-flex items-center gap-1 text-xs text-primary hover:underline">
        <ArrowLeft className="size-3" /> Kembali
      </Link>
      <PageHeading
        title="Detail Slip P1"
        desc={`Rincian transparan perhitungan P1 periode ${slip.Periode}.`}
        action={
          <div className="flex gap-2 print:hidden">
            <Button variant="outline" onClick={cetak}><Printer /> Cetak</Button>
            <Button onClick={unduh} disabled={downloading}><Download /> Unduh PDF</Button>
          </div>
        }
      />

      <div className="space-y-6">
        <Seksi no="01" judul="Identitas dan Periode" desk="Informasi pemilik slip dan periode pembayaran.">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Nama" value={pegawai.Nama || '-'} />
            <Field label="NIP" value={pegawai.NIP || '-'} />
            <Field label="NPWP" value={pegawai.NPWP || '-'} />
            <Field label="Pangkat/Golongan" value={pegawai.Pangkat || '-'} />
            <Field label="Nama jabatan" value={pegawai.NamaJabatan || '-'} />
            <Field label="Unit kerja" value={pegawai.NamaUnit || '-'} />
            <Field label="Grade" value={pegawai.KodeGrade || '-'} />
            <Field label="Status kepegawaian" value={pegawai.StatusPegawai || '-'} />
            <Field label="Periode" value={slip.Periode || '-'} />
            <Field label="Nomor slip" value={slip.NomorSlip || '-'} />
          </div>
        </Seksi>

        <Seksi no="02" judul="Dasar Perhitungan" desk="Komponen pembentuk nilai Remunerasi P1.">
          <div className="grid overflow-hidden rounded-lg border sm:grid-cols-4">
            {[
              ["Remunerasi per Grade Jabatan", rupiah(slip.RemunerasiGrade || 0)],
              [`P1 ${slip.PersenP1 || 40}%`, rupiah((slip.RemunerasiGrade || 0) * (slip.PersenP1 || 40) / 100)],
              ["Pengali Status", `${slip.PengaliStatus || 100}%`],
              ["Remunerasi P1", rupiah(slip.RemunerasiP1 || 0)],
            ].map(([l, v], i) => (
              <div key={l} className={cn("border-b p-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0", i === 3 && "bg-primary/10")}>
                <p className="text-[11px] text-muted-foreground">{l}</p>
                <p className="mt-1 font-bold">{v}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 rounded-md bg-muted/50 p-3 text-xs">
            <span className="text-muted-foreground">Rumus </span>
            <span className="font-semibold">
              Remunerasi P1 = Remunerasi per Grade Jabatan × 40% × Pengali Status. Jumlah Bruto = Remunerasi P1 − Pengurangan Kehadiran. Jumlah Netto = Jumlah Bruto − Pajak.
            </span>
          </p>
        </Seksi>

        <Seksi no="03" judul="Rincian Pengurangan Kehadiran" desk="Rekapitulasi kehadiran pada periode terkait.">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[32rem] text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Komponen</th>
                  <th className="px-3 py-2 font-medium">Jumlah Hari</th>
                  <th className="px-3 py-2 font-medium">Tarif per Hari</th>
                  <th className="px-3 py-2 font-medium">Pengurangan (%)</th>
                </tr>
              </thead>
              <tbody>
                {(slip.komponen || []).map((k: any) => (
                  <tr key={k.Nama} className="odd:bg-muted/40">
                    <td className="px-3 py-3 font-semibold">{k.Nama}</td>
                    <td className="px-3 py-3">{k.JumlahHari} hari</td>
                    <td className="px-3 py-3">{k.TarifPerHari}</td>
                    <td className="px-3 py-3">{k.PersenPengurangan}%</td>
                  </tr>
                ))}
                <tr className="bg-primary/5 font-semibold">
                  <td className="px-3 py-3" colSpan={3}>Total Persentase Pengurangan</td>
                  <td className="px-3 py-3">{slip.TotalPersenPengurangan || 0}%</td>
                </tr>
                <tr className="bg-primary/5 font-semibold">
                  <td className="px-3 py-3" colSpan={3}>Pengurangan Kehadiran</td>
                  <td className="px-3 py-3">{rupiah(slip.PenguranganKehadiran || 0)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Seksi>

        {/* Rincian Tambahan: CPNS, Tubel, SKP, Hukdis */}
        {slip.rincianTambahan && slip.rincianTambahan.length > 0 && (
          <Seksi no="04" judul="Potongan Tambahan" desk="Potongan khusus berdasarkan status kepegawaian, SKP, atau hukuman disiplin.">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[28rem] text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground">
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

        <Panel className="md:ml-auto md:w-[26rem]">
          <h2 className="font-semibold">Ringkasan Pembayaran</h2>
          <dl className="mt-4 space-y-2 text-xs">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Jumlah Bruto</dt>
              <dd className="font-semibold">{rupiah(slip.JumlahBruto || 0)}</dd>
            </div>
            <div className="flex justify-between text-rose-700">
              <dt className="text-muted-foreground">Potongan Pajak PPh 21</dt>
              <dd className="font-semibold">- {rupiah(slip.PajakPPh21 || 0)}</dd>
            </div>
            {(slip.PajakTER || 0) > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <dt>Pajak TER</dt>
                <dd className="font-semibold">{rupiah(slip.PajakTER || 0)}</dd>
              </div>
            )}
            {(slip.TabPajak || 0) > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <dt>Tabungan Pajak</dt>
                <dd className="font-semibold">{rupiah(slip.TabPajak || 0)}</dd>
              </div>
            )}
          </dl>
          <div className="mt-4 flex items-center justify-between rounded-lg bg-primary/10 p-4">
            <span className="text-[11px] font-semibold">JUMLAH NETTO YANG DITERIMA</span>
            <span className="text-xl font-bold text-primary">{rupiah(slip.JumlahNetto || 0)}</span>
          </div>
          <p className="mt-2 text-right text-[10px] text-muted-foreground">
            Rekening tujuan {pegawai.NamaBank ? `${pegawai.NamaBank} ${pegawai.NoRekening}` : pegawai.NoRekening || '-'}
          </p>
        </Panel>

        <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Button asChild variant="ghost">
            <Link to="/pegawai/slip"><ArrowLeft /> Kembali ke Daftar</Link>
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={cetak}><Printer /> Cetak</Button>
            <Button onClick={ajukan}><MessageSquare /> Ajukan Pengaduan atas Slip Ini</Button>
          </div>
        </div>
      </div>
    </>
  )
}
