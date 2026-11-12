import type { ReactNode } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Download, MessageSquare, Printer } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Field, PageHeading, Panel } from "@/components/pegawai/shared"
import { DAFTAR_SLIP, pegawai } from "@/data/dummy-pegawai"
import { rupiah } from "@/lib/format"
import { cn } from "@/lib/utils"

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
  const slip = DAFTAR_SLIP.find((s) => s.id === id)

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

  const cetak = () => window.print()
  const unduh = () => toast.info("Unduh PDF belum tersambung ke backend (dummy).")
  const ajukan = () => navigate(`/pegawai/pengaduan/baru?periode=${encodeURIComponent(slip.periode)}`)

  return (
    <>
      <Link to="/pegawai/slip" className="mb-3 inline-flex items-center gap-1 text-xs text-primary hover:underline">
        <ArrowLeft className="size-3" /> Kembali
      </Link>
      <PageHeading
        title="Detail Slip P1"
        desc={`Rincian transparan perhitungan P1 periode ${slip.periode}.`}
        action={
          <div className="flex gap-2 print:hidden">
            <Button variant="outline" onClick={cetak}><Printer /> Cetak</Button>
            <Button onClick={unduh}><Download /> Unduh PDF</Button>
          </div>
        }
      />

      <div className="space-y-6">
        <Seksi no="01" judul="Identitas dan Periode" desk="Informasi pemilik slip dan periode pembayaran.">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Nama" value={pegawai.nama} />
            <Field label="NIP" value={pegawai.nip} />
            <Field label="NPWP" value={pegawai.npwpSamar} />
            <Field label="Pangkat/Golongan" value={pegawai.pangkat} />
            <Field label="Nama jabatan" value={pegawai.jabatan} />
            <Field label="Unit kerja" value={pegawai.unit} />
            <Field label="Grade" value={pegawai.grade} />
            <Field label="Status kepegawaian" value={pegawai.status} />
            <Field label="Periode" value={slip.periode} />
            <Field label="Nomor slip" value={slip.nomor} />
          </div>
        </Seksi>

        <Seksi no="02" judul="Dasar Perhitungan" desk="Komponen pembentuk nilai Remunerasi P1.">
          <div className="grid overflow-hidden rounded-lg border sm:grid-cols-4">
            {[
              ["Remunerasi per Grade Jabatan", rupiah(slip.remunerasiGrade)],
              [`P1 ${slip.persenP1}%`, rupiah(slip.remunerasiGrade * slip.persenP1 / 100)],
              ["Pengali Status", `${slip.pengali}%`],
              ["Remunerasi P1", rupiah(slip.remunerasiP1)],
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
                {slip.komponen.map((k) => (
                  <tr key={k.nama} className="odd:bg-muted/40">
                    <td className="px-3 py-3 font-semibold">{k.nama}</td>
                    <td className="px-3 py-3">{k.hari} hari</td>
                    <td className="px-3 py-3">{k.tarif}</td>
                    <td className="px-3 py-3">{k.persen}</td>
                  </tr>
                ))}
                <tr className="bg-primary/5 font-semibold">
                  <td className="px-3 py-3" colSpan={3}>Total Persentase Pengurangan</td>
                  <td className="px-3 py-3">{slip.totalPersen}</td>
                </tr>
                <tr className="bg-primary/5 font-semibold">
                  <td className="px-3 py-3" colSpan={3}>Pengurangan Kehadiran</td>
                  <td className="px-3 py-3">{rupiah(slip.pengurangan)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Seksi>

        <Panel className="md:ml-auto md:w-[26rem]">
          <h2 className="font-semibold">Ringkasan Pembayaran</h2>
          <dl className="mt-4 space-y-2 text-xs">
            {[
              ["Jumlah Bruto", slip.bruto],
              ["Pajak PPh 21", slip.pph21],
              ["Pajak TER", slip.pphTer],
              ["Tab. Pajak", slip.tabPajak],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between">
                <dt className="text-muted-foreground">{l}</dt>
                <dd className="font-semibold">{rupiah(v as number)}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 flex items-center justify-between rounded-lg bg-primary/10 p-4">
            <span className="text-[11px] font-semibold">JUMLAH NETTO YANG DITERIMA</span>
            <span className="text-xl font-bold text-primary">{rupiah(slip.netto)}</span>
          </div>
          <p className="mt-2 text-right text-[10px] text-muted-foreground">Rekening tujuan {pegawai.rekening}</p>
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
