import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ChevronRight, GitCompareArrows, ShieldCheck, Users, Wallet, CalendarDays, type LucideIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { PageHeading, Panel, PanelTitle } from "@/components/pegawai/shared"
import { Stepper } from "@/components/bendahara/Stepper"
import { pjUnit } from "@/data/dummy-pjunit"
import { rupiah } from "@/lib/format"
import { pjUnitService } from "@/services/pjUnitService"
import { cn } from "@/lib/utils"

const Tahap = ({ desk, status, warna }: { desk: string; status: string; warna: string }) => (
  <>
    <span className="max-w-40 text-[11px] text-muted-foreground">{desk}</span>
    <Badge variant="outline" className={cn("text-[10px]", warna)}>{status}</Badge>
  </>
)

export default function BerandaPjUnitPage() {
  const [dash, setDash] = useState<any | null>(null)

  useEffect(() => {
    pjUnitService.getDashboard().then((res) => setDash(res)).catch(() => {})
  }, [])

  const unitNama = dash?.unit || pjUnit.unit
  const periodeTerkini = dash?.pengajuan_terkini?.periode || "Oktober 2026"
  const statusTerkini = dash?.pengajuan_terkini?.status || "Diverifikasi"
  const waktuTerkini = dash?.pengajuan_terkini?.diajukan_at || "8 Oktober 2026, 14.20 WIB"

  const KARTU: [string, string, string, LucideIcon][] = [
    ["Jumlah Pegawai Aktif", String(dash?.statistik?.pegawai_aktif ?? 245), `Periode ${periodeTerkini}`, Users],
    ["Dalam Proses Perubahan Jabatan", String(dash?.statistik?.usulan_proses ?? 7), `Periode ${periodeTerkini}`, GitCompareArrows],
    ["Berstatus Hukuman Disiplin", String(dash?.statistik?.hukuman_aktif ?? 2), `Periode ${periodeTerkini}`, ShieldCheck],
    ["Total P1 Setelah Potongan", dash?.statistik?.total_bruto ? rupiah(dash.statistik.total_bruto) : "Rp 1.128.450.000", `Periode ${periodeTerkini}`, Wallet],
  ]

  return (
    <>
      <PageHeading title="Beranda" desc={`Pemantauan remunerasi ${unitNama} periode ${periodeTerkini}.`} />

      <div className="space-y-6">
        <Panel className="border-primary/60 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold tracking-wide text-primary">STATUS PENGAJUAN BULAN BERJALAN</p>
              <p className="mt-1 text-lg font-semibold">Pengajuan P1 {periodeTerkini}</p>
              <p className="text-[11px] text-muted-foreground">Terakhir diperbarui {waktuTerkini}.</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="border-purple-200 bg-purple-100 text-purple-800">{statusTerkini}</Badge>
              <Link to="/pj-unit/status" className="inline-flex items-center text-xs font-semibold text-primary hover:underline">Lihat status <ChevronRight className="size-4" /></Link>
            </div>
          </div>
        </Panel>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {KARTU.map(([l, v, s, Icon]) => (
            <Panel key={l} className="p-5">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[11px] text-muted-foreground">{l}</p>
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="size-4" /></span>
              </div>
              <p className="mt-2 text-2xl font-bold">{v}</p>
              <p className="mt-1 text-[10px] text-muted-foreground">{s}</p>
            </Panel>
          ))}
        </div>

        <Panel className="p-0">
          <div className="flex items-center justify-between p-5">
            <PanelTitle icon={CalendarDays} title="Jadwal Tahapan Bulan Ini" desc="Tahapan pembayaran P1 Oktober 2026" />
          </div>
          <div className="border-t px-6 py-8">
            <Stepper
              steps={["1–5 Oktober", "6–8 Oktober", "9–13 Oktober"]}
              done={1}
              notes={{
                0: <Tahap desk="Rekap Absensi" status="Selesai" warna="border-emerald-200 bg-emerald-100 text-emerald-800" />,
                1: <Tahap desk="Penyusunan SK Penetapan Pembayaran P1" status="Berjalan" warna="border-amber-200 bg-amber-100 text-amber-800" />,
                2: <Tahap desk="Pencairan" status="Akan datang" warna="bg-muted text-muted-foreground" />,
              }}
            />
          </div>
        </Panel>
      </div>
    </>
  )
}
