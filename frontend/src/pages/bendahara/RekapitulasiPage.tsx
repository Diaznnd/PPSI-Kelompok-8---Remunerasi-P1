import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageHeading, Panel } from "@/components/pegawai/shared"
import { bendaharaService } from "@/services/bendaharaService"
import { pjUnitService } from "@/services/pjUnitService"
import { rupiah } from "@/lib/format"
import { cn } from "@/lib/utils"

export default function RekapitulasiPage() {
  const { akun } = useAuth()
  const [loading, setLoading] = useState(true)
  const [periode, setPeriode] = useState("Oktober 2026")
  const [periodeList] = useState(["Oktober 2026", "September 2026", "Agustus 2026"])
  const [tab, setTab] = useState<"periode" | "bulan">("periode")
  const [ringkasan, setRingkasan] = useState<any>({
    pegawai: 0,
    remP1: 0,
    pengurangan: 0,
    bruto: 0,
    pajak: 0,
    netto: 0,
  })
  const [trenBulanan, setTrenBulanan] = useState<[string, number][]>([
    ["Jan", 1020], ["Feb", 1050], ["Mar", 1075], ["Apr", 1090], ["Mei", 1115],
    ["Jun", 1100], ["Jul", 1140], ["Agu", 1150], ["Sep", 1120], ["Okt", 1128.45],
  ])
  const [rows, setRows] = useState<any[]>([])
  const [komposisi, setKomposisi] = useState([
    { label: "Keterlambatan", persen: 35, warna: "#ef4444" },
    { label: "PSW", persen: 28, warna: "#f59e0b" },
    { label: "Sakit", persen: 20, warna: "#3b82f6" },
    { label: "Alfa", persen: 10, warna: "#8b5cf6" },
    { label: "Lainnya", persen: 7, warna: "#6b7280" },
  ])

  const konik = (() => {
    let akum = 0
    return komposisi.map((k) => { const dari = akum; akum += k.persen; return `${k.warna} ${dari}% ${akum}%` }).join(", ")
  })()

  useEffect(() => {
    const fetchRekapitulasi = async () => {
      try {
        setLoading(true)
        const res = akun?.peran === "pj_unit"
          ? await pjUnitService.getRekapitulasi(periode)
          : await bendaharaService.getRekapitulasi(periode)
        if (res?.ringkasan) setRingkasan(res.ringkasan)
        if (res?.tren_bulanan) setTrenBulanan(res.tren_bulanan)
        if (res?.komposisi_potongan) setKomposisi(res.komposisi_potongan)
        if (res?.data) setRows(res.data)
      } catch (error) {
        console.error("Error fetching rekapitulasi:", error)
        toast.error("Gagal memuat rekapitulasi")
      } finally {
        setLoading(false)
      }
    }
    fetchRekapitulasi()
  }, [periode, akun?.peran])

  const exportCsv = () => {
    if (rows.length === 0) {
      toast.error("Tidak ada data rekapitulasi untuk diekspor.")
      return
    }
    const headers = [
      "NIP",
      "Nama Pegawai",
      "Jabatan",
      "Grade",
      "Remunerasi Grade",
      "Remunerasi P1",
      "Pengurangan Kehadiran",
      "Jumlah Bruto",
      "Pajak",
      "Jumlah Netto",
    ]
    const csvRows = [
      headers.join(","),
      ...rows.map((item: any) =>
        [
          `"${item.nip || ""}"`,
          `"${item.nama || ""}"`,
          `"${item.jabatan || ""}"`,
          `"${item.grade || ""}"`,
          item.remGrade || 0,
          item.remP1 || 0,
          item.pengurangan || 0,
          item.bruto || 0,
          item.pajak || 0,
          item.netto || 0,
        ].join(",")
      ),
    ]
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `Rekapitulasi_P1_${periode.replace(/\s+/g, "_")}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast.success(`Rekapitulasi ${periode} berhasil diekspor ke CSV.`)
  }
  const nilaiTren = trenBulanan.map(([, v]) => v)
  const maks = Math.max(...nilaiTren, 1)
  const min = Math.max(0, Math.min(...nilaiTren, 0) * 0.8)
  const rentang = Math.max(0.01, maks - min)

  const unitNama = akun?.unit_nama || "Unit Kerja"

  const kartu = [
    ["Total Pegawai", String(ringkasan.pegawai)],
    ["Remunerasi P1", rupiah(ringkasan.remP1)],
    ["Total Pengurangan Kehadiran", rupiah(ringkasan.pengurangan)],
    ["Jumlah Bruto", rupiah(ringkasan.bruto)],
    ["Pajak", rupiah(ringkasan.pajak)],
    ["Jumlah Netto", rupiah(ringkasan.netto)],
  ]

  return (
    <>
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-primary" />
          <span className="ml-3 text-sm text-muted-foreground">Memuat rekapitulasi...</span>
        </div>
      )}

      {!loading && (
        <>
      <PageHeading
        title="Rekapitulasi P1"
        desc={akun?.peran === "pj_unit" ? `Analisis rekap P1 ${unitNama} (Mode Hanya Baca).` : `Analisis rekap P1 ${unitNama}.`}
        action={<div className="flex gap-2"><Button variant="outline" onClick={exportCsv}>Ekspor CSV</Button></div>}
      />

      <div className="space-y-6">
        <Panel>
          <p className="mb-1.5 text-xs text-muted-foreground">Periode</p>
          <Select value={periode} onValueChange={setPeriode}>
            <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
            <SelectContent>{periodeList.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
          </Select>
        </Panel>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {kartu.map(([l, v]) => (
            <Panel key={l} className="p-4">
              <p className="text-[11px] text-muted-foreground">{l}</p>
              <p className="mt-1 text-base font-bold">{v}</p>
              <p className="mt-1 text-[10px] text-muted-foreground">{periode} • dibayarkan November 2026</p>
            </Panel>
          ))}
        </div>

        <div>
          <div className="flex gap-6 border-b text-sm">
            {([["periode", "Per Periode"], ["bulan", "Per Bulan Setahun"]] as const).map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)} className={cn("-mb-px border-b-2 px-1 pb-2", tab === k ? "border-primary font-semibold text-primary" : "border-transparent text-muted-foreground")}>{l}</button>
            ))}
          </div>

          <Panel className="mt-4 overflow-x-auto p-0">
            {tab === "periode" ? (
              <table className="w-full min-w-[64rem] text-xs">
                <thead className="bg-muted/50 text-left text-[11px] text-muted-foreground">
                  <tr>{["NIP / Nama", "Jabatan", "Grade", "Remunerasi per Grade Jabatan", "Remunerasi P1", "Pengurangan Kehadiran", "Jumlah Bruto", "Pajak", "Pajak TER", "Tab. Pajak", "Jumlah Netto"].map((h) => <th key={h} className="px-3 py-3 font-medium">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={11} className="py-10 text-center text-muted-foreground">
                        Tidak ada data rekapitulasi untuk periode ini.
                      </td>
                    </tr>
                  )}
                  {rows.map((item: any) => (
                    <tr key={item.nip} className="border-t odd:bg-muted/20">
                      <td className="px-3 py-3"><p className="font-semibold">{item.nama}</p><p className="text-[10px] text-muted-foreground">{item.nip}</p></td>
                      <td className="px-3 py-3">{item.jabatan}</td><td className="px-3 py-3">{item.grade}</td>
                      <td className="px-3 py-3">{rupiah(item.remGrade || 0)}</td><td className="px-3 py-3">{rupiah(item.remP1 || 0)}</td><td className="px-3 py-3">{rupiah(item.pengurangan || 0)}</td>
                      <td className="px-3 py-3">{rupiah(item.bruto || 0)}</td><td className="px-3 py-3">{rupiah(item.pajak || 0)}</td><td className="px-3 py-3">Rp 0</td><td className="px-3 py-3">Rp 0</td>
                      <td className="px-3 py-3 font-bold">{rupiah(item.netto || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-xs">
                <thead className="bg-muted/50 text-left text-[11px] text-muted-foreground"><tr><th className="px-4 py-3 font-medium">Bulan (2026)</th><th className="px-4 py-3 font-medium">Total Jumlah Bruto</th></tr></thead>
                <tbody>
                  {trenBulanan.map(([b, v]) => <tr key={b} className="border-t odd:bg-muted/20"><td className="px-4 py-3 font-semibold">{b}</td><td className="px-4 py-3">{rupiah(Math.round(v * 1_000_000))}</td></tr>)}
                </tbody>
              </table>
            )}
          </Panel>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
          <Panel>
            <h2 className="font-semibold">Tren Total Jumlah Bruto</h2>
            <p className="text-xs text-muted-foreground">Januari–Desember 2026</p>
            <div className="mt-4 flex h-44 items-end gap-3 border-t pt-4">
              {trenBulanan.map(([b, v]) => (
                <div key={b} className="flex flex-1 flex-col items-center gap-1" title={`${b}: Rp ${v.toLocaleString("id-ID")} juta`}>
                  <div className="w-full rounded-t bg-gradient-to-b from-primary/80 to-primary" style={{ height: `${Math.max(8, ((v - min) / rentang) * 100)}%` }} />
                  <span className="text-[10px] text-muted-foreground">{b}</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel>
            <h2 className="font-semibold">Komposisi Pengurangan</h2>
            <p className="text-xs text-muted-foreground">{periode}</p>
            <div className="mt-4 flex items-center gap-5">
              <div className="relative size-28 shrink-0 rounded-full" style={{ background: `conic-gradient(${konik})` }}>
                <div className="absolute inset-4 flex flex-col items-center justify-center rounded-full bg-card text-center">
                  <span className="text-[10px] font-bold leading-tight">{rupiah(ringkasan.pengurangan || 0)}</span>
                  <span className="text-[8px] text-muted-foreground">Pengurangan Kehadiran</span>
                </div>
              </div>
              <ul className="space-y-2 text-[11px]">
                {komposisi.map((k) => (
                  <li key={k.label} className="flex items-center gap-2"><span className="size-2 rounded-sm" style={{ background: k.warna }} />{k.label}<b className="ml-auto pl-3">{k.persen}%</b></li>
                ))}
              </ul>
            </div>
          </Panel>
        </div>
      </div>
        </>
      )}
    </>
  )
}
