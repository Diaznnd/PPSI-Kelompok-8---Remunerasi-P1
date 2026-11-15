import { useState, useMemo } from "react"
import { Download, Printer, BarChart3, PieChart } from "lucide-react"
import {
  PageHeader,
  StatusBadge,
  Button,
  DetailDrawer,
  DrawerSection,
  DrawerSummaryCard,
  ExportDialog,
  PrintPreview,
  RupiahText,
  usePeriode,
} from "./components"
import {
  pengajuanUPT,
  pegawaiHitungSample,
  dokumenConfigInitial,
  rupiah,
  type UPTPengajuan,
} from "@/data/dummy-upt"
import { Badge } from "@/components/ui/badge"

const TREN_BULANAN = [
  { bulan: "Mei 2026", netto: 4_120_000_000 },
  { bulan: "Jun 2026", netto: 4_185_500_000 },
  { bulan: "Jul 2026", netto: 4_210_300_000 },
  { bulan: "Agu 2026", netto: 4_290_800_000 },
  { bulan: "Sep 2026", netto: 4_345_100_000 },
  { bulan: "Okt 2026", netto: 4_026_380_500 },
]

export default function RekapitulasiUPTPage() {
  const { periode } = usePeriode()
  const [activeTab, setActiveTab] = useState<"periode" | "tahunan">("periode")
  const [selectedUnit, setSelectedUnit] = useState<UPTPengajuan | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [isPrintOpen, setIsPrintOpen] = useState(false)

  const summary = useMemo(() => {
    const totalPegawai = pengajuanUPT.reduce((s, p) => s + p.pegawai, 0)
    const totalGross = pengajuanUPT.reduce((s, p) => s + p.total, 0)
    const totalPengurangan = pengajuanUPT.reduce((s, p) => s + Math.round(p.total * 0.025), 0)
    const totalBruto = totalGross - totalPengurangan
    const totalPajak = pengajuanUPT.reduce((s, p) => s + (p.total - p.netto - Math.round(p.total * 0.025)), 0)
    const totalNetto = pengajuanUPT.reduce((s, p) => s + p.netto, 0)
    return { totalPegawai, totalGross, totalPengurangan, totalBruto, totalPajak, totalNetto }
  }, [])

  const maxTrenNetto = Math.max(...TREN_BULANAN.map((t) => t.netto))

  const printArea = (
    <div className="space-y-6 text-xs text-slate-900">
      <div className="border-b-2 border-slate-800 pb-3 text-center">
        <p className="font-bold text-sm uppercase">UNIVERSITAS ANDALAS — UPT REMUNERASI</p>
        <p className="font-semibold text-base mt-0.5">REKAPITULASI REMUNERASI P1 PER UNIT KERJA</p>
        <p className="text-slate-600">Periode: {periode}</p>
      </div>

      <table className="w-full border-collapse border border-slate-300 text-[11px]">
        <thead className="bg-slate-100">
          <tr>
            <th className="border border-slate-300 p-2 text-left">Unit Kerja</th>
            <th className="border border-slate-300 p-2 text-right">Pegawai</th>
            <th className="border border-slate-300 p-2 text-right">P1 Gross</th>
            <th className="border border-slate-300 p-2 text-right">Potongan</th>
            <th className="border border-slate-300 p-2 text-right">Pajak</th>
            <th className="border border-slate-300 p-2 text-right">Netto</th>
            <th className="border border-slate-300 p-2 text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          {pengajuanUPT.map((item) => {
            const pot = Math.round(item.total * 0.025)
            const pajak = item.total - item.netto - pot
            return (
              <tr key={item.id}>
                <td className="border border-slate-300 p-2 font-medium">{item.unit}</td>
                <td className="border border-slate-300 p-2 text-right">{item.pegawai}</td>
                <td className="border border-slate-300 p-2 text-right">{rupiah(item.total)}</td>
                <td className="border border-slate-300 p-2 text-right">{rupiah(pot)}</td>
                <td className="border border-slate-300 p-2 text-right">{rupiah(pajak)}</td>
                <td className="border border-slate-300 p-2 text-right font-semibold">{rupiah(item.netto)}</td>
                <td className="border border-slate-300 p-2 text-center">{item.status}</td>
              </tr>
            )
          })}
        </tbody>
        <tfoot className="bg-slate-100 font-bold">
          <tr>
            <td className="border border-slate-300 p-2">TOTAL</td>
            <td className="border border-slate-300 p-2 text-right">{summary.totalPegawai}</td>
            <td className="border border-slate-300 p-2 text-right">{rupiah(summary.totalGross)}</td>
            <td className="border border-slate-300 p-2 text-right">{rupiah(summary.totalPengurangan)}</td>
            <td className="border border-slate-300 p-2 text-right">{rupiah(summary.totalPajak)}</td>
            <td className="border border-slate-300 p-2 text-right">{rupiah(summary.totalNetto)}</td>
            <td className="border border-slate-300 p-2" />
          </tr>
        </tfoot>
      </table>

      <div className="grid grid-cols-2 gap-8 pt-6">
        <div className="space-y-12">
          <div>
            <p>Menyetujui,</p>
            <p className="font-semibold">{dokumenConfigInitial.penanggungJawab.jabatan}</p>
          </div>
          <div>
            <p className="font-bold underline">{dokumenConfigInitial.penanggungJawab.nama}</p>
            <p className="font-mono">NIP. {dokumenConfigInitial.penanggungJawab.nip}</p>
          </div>
        </div>
        <div className="space-y-12">
          <div>
            <p>{dokumenConfigInitial.kotaTandaTangan}, 24 Oktober 2026</p>
            <p className="font-semibold">{dokumenConfigInitial.kepalaUpt.jabatan}</p>
          </div>
          <div>
            <p className="font-bold underline">{dokumenConfigInitial.kepalaUpt.nama}</p>
            <p className="font-mono">NIP. {dokumenConfigInitial.kepalaUpt.nip}</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rekapitulasi P1"
        subtitle={`Laporan rekapitulasi remunerasi P1 seluruh unit kerja • Periode ${periode}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setIsPrintOpen(true)}>
              <Printer className="size-4" /> Cetak
            </Button>
            <Button size="sm" className="gap-1.5" onClick={() => setIsExportOpen(true)}>
              <Download className="size-4" /> Ekspor
            </Button>
          </div>
        }
      />

      <div className="flex border-b">
        <button
          onClick={() => setActiveTab("periode")}
          className={`border-b-2 px-6 py-3 text-sm font-semibold transition-colors ${
            activeTab === "periode"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Per Periode ({periode})
        </button>
        <button
          onClick={() => setActiveTab("tahunan")}
          className={`border-b-2 px-6 py-3 text-sm font-semibold transition-colors ${
            activeTab === "tahunan"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Per Bulan Setahun (2026)
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-xl border bg-card p-3.5">
          <p className="text-[11px] text-muted-foreground">Total Pegawai</p>
          <p className="mt-1 text-base font-bold">{summary.totalPegawai} orang</p>
        </div>
        <div className="rounded-xl border bg-card p-3.5">
          <p className="text-[11px] text-muted-foreground">Total Remunerasi P1</p>
          <p className="mt-1 text-sm font-bold">{rupiah(summary.totalGross)}</p>
        </div>
        <div className="rounded-xl border bg-card p-3.5">
          <p className="text-[11px] text-muted-foreground">Total Pengurangan</p>
          <p className="mt-1 text-sm font-bold text-rose-700">{rupiah(summary.totalPengurangan)}</p>
        </div>
        <div className="rounded-xl border bg-card p-3.5">
          <p className="text-[11px] text-muted-foreground">Total Bruto</p>
          <p className="mt-1 text-sm font-bold">{rupiah(summary.totalBruto)}</p>
        </div>
        <div className="rounded-xl border bg-card p-3.5">
          <p className="text-[11px] text-muted-foreground">Total Pajak</p>
          <p className="mt-1 text-sm font-bold text-amber-700">{rupiah(summary.totalPajak)}</p>
        </div>
        <div className="rounded-xl border bg-emerald-50/50 border-emerald-200 p-3.5">
          <p className="text-[11px] text-emerald-800 font-medium">Total Netto</p>
          <p className="mt-1 text-sm font-bold text-emerald-700">{rupiah(summary.totalNetto)}</p>
        </div>
      </div>

      {activeTab === "periode" ? (
        <>
          <div className="overflow-x-auto rounded-xl border bg-card">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Unit Kerja</th>
                  <th className="px-4 py-3 font-medium text-right">Pegawai</th>
                  <th className="px-4 py-3 font-medium text-right">P1 Gross</th>
                  <th className="px-4 py-3 font-medium text-right">Potongan</th>
                  <th className="px-4 py-3 font-medium text-right">Pajak</th>
                  <th className="px-4 py-3 font-medium text-right">Netto</th>
                  <th className="px-4 py-3 font-medium">Status Pengajuan</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pengajuanUPT.map((item) => {
                  const pot = Math.round(item.total * 0.025)
                  const pajak = item.total - item.netto - pot
                  const belumMengajukan = item.status === "draft"
                  return (
                    <tr
                      key={item.id}
                      onClick={() => {
                        setSelectedUnit(item)
                        setIsDrawerOpen(true)
                      }}
                      className="cursor-pointer hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{item.unit}</span>
                          {belumMengajukan && (
                            <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800 text-[10px]">
                              Belum Mengajukan
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-xs">{item.pegawai}</td>
                      <td className="px-4 py-3 text-right text-xs"><RupiahText value={item.total} /></td>
                      <td className="px-4 py-3 text-right text-xs text-rose-700"><RupiahText value={pot} /></td>
                      <td className="px-4 py-3 text-right text-xs text-amber-700"><RupiahText value={pajak} /></td>
                      <td className="px-4 py-3 text-right text-xs font-bold text-emerald-700"><RupiahText value={item.netto} /></td>
                      <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot className="border-t-2 bg-muted/50 font-bold text-xs">
                <tr>
                  <td className="px-4 py-3">TOTAL KESELURUHAN</td>
                  <td className="px-4 py-3 text-right">{summary.totalPegawai}</td>
                  <td className="px-4 py-3 text-right">{rupiah(summary.totalGross)}</td>
                  <td className="px-4 py-3 text-right text-rose-700">{rupiah(summary.totalPengurangan)}</td>
                  <td className="px-4 py-3 text-right text-amber-700">{rupiah(summary.totalPajak)}</td>
                  <td className="px-4 py-3 text-right text-emerald-700">{rupiah(summary.totalNetto)}</td>
                  <td className="px-4 py-3" />
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="rounded-xl border bg-card p-5 space-y-4">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <PieChart className="size-4 text-primary" /> Komposisi Pengurangan & Potongan P1
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {[
                { label: "Terlambat & Pulang Cepat (TL/PSW)", pct: 52, nominal: Math.round(summary.totalPengurangan * 0.52), color: "bg-amber-500" },
                { label: "Ketidakhadiran (Alpa / Izin / Sakit)", pct: 36, nominal: Math.round(summary.totalPengurangan * 0.36), color: "bg-rose-500" },
                { label: "Hukuman Disiplin Aktif", pct: 12, nominal: Math.round(summary.totalPengurangan * 0.12), color: "bg-purple-600" },
              ].map((bar) => (
                <div key={bar.label} className="rounded-lg border p-3 space-y-2">
                  <div className="flex justify-between font-medium">
                    <span>{bar.label}</span>
                    <span>{bar.pct}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div className={`h-full ${bar.color}`} style={{ width: `${bar.pct}%` }} />
                  </div>
                  <p className="text-[11px] text-muted-foreground">{rupiah(bar.nominal)}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <BarChart3 className="size-4 text-primary" /> Tren Realisasi P1 Netto Bulanan (2026)
            </div>
            <div className="space-y-3">
              {TREN_BULANAN.map((row) => {
                const widthPct = Math.round((row.netto / maxTrenNetto) * 100)
                return (
                  <div key={row.bulan} className="grid grid-cols-[6rem_1fr_10rem] items-center gap-3 text-xs">
                    <span className="font-medium text-muted-foreground">{row.bulan}</span>
                    <div className="h-3 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${widthPct}%` }} />
                    </div>
                    <span className="text-right font-semibold">{rupiah(row.netto)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <DetailDrawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={`Rincian Pegawai — ${selectedUnit?.unit ?? ""}`}
        subtitle={selectedUnit ? `${selectedUnit.id} • ${selectedUnit.periode} • ${selectedUnit.pegawai} pegawai` : undefined}
        size="lg"
        footer={
          <Button variant="outline" onClick={() => setIsDrawerOpen(false)}>
            Tutup
          </Button>
        }
      >
        {selectedUnit && (
          <>
            <DrawerSummaryCard
              items={[
                { label: "Nomor Pengajuan", value: selectedUnit.id, mono: true },
                { label: "Unit Kerja", value: selectedUnit.unit },
                { label: "Periode", value: selectedUnit.periode },
                { label: "Jumlah Pegawai", value: `${selectedUnit.pegawai} orang` },
              ]}
              totalLabel="Total P1 Netto Unit"
              totalValue={rupiah(selectedUnit.total)}
            />

            <DrawerSection title="Daftar Penerima P1">
              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 text-muted-foreground font-semibold">
                    <tr>
                      <th className="p-3">Nama / NIP</th>
                      <th className="p-3 text-right">Bruto</th>
                      <th className="p-3 text-right">Pajak</th>
                      <th className="p-3 text-right">Netto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {pegawaiHitungSample.map((p) => (
                      <tr key={p.id}>
                        <td className="p-3">
                          <p className="font-semibold text-foreground">{p.nama}</p>
                          <p className="font-mono text-[11px] text-muted-foreground">{p.nip}</p>
                        </td>
                        <td className="p-3 text-right tabular-nums whitespace-nowrap">{rupiah(p.p1SetelahPotongan)}</td>
                        <td className="p-3 text-right tabular-nums whitespace-nowrap">{rupiah(p.pajak)}</td>
                        <td className="p-3 text-right font-semibold tabular-nums whitespace-nowrap text-emerald-700">{rupiah(p.netto)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </DrawerSection>
          </>
        )}
      </DetailDrawer>

      <ExportDialog
        open={isExportOpen}
        onOpenChange={setIsExportOpen}
        title="Ekspor Rekapitulasi P1"
        columns={["Unit Kerja", "Jumlah Pegawai", "P1 Gross", "Potongan", "Pajak", "Netto", "Status Pengajuan"]}
      />

      <PrintPreview
        open={isPrintOpen}
        onOpenChange={setIsPrintOpen}
        title={`Cetak Rekapitulasi P1 — ${periode}`}
      >
        {printArea}
      </PrintPreview>
    </div>
  )
}
