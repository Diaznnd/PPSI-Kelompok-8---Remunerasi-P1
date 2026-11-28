import { useEffect, useMemo, useState } from "react"
import { BarChart3, Calendar, Download, Loader2, Search, TrendingUp, Users, Wallet } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  const [periodeList] = useState(["Oktober 2026", "September 2026", "Agustus 2026", "Juli 2026", "Juni 2026", "Mei 2026"])
  const [tab, setTab] = useState<"periode" | "tahunan">("periode")
  const [cari, setCari] = useState("")
  const [ringkasan, setRingkasan] = useState<any>({
    pegawai: 0,
    remP1: 0,
    pengurangan: 0,
    bruto: 0,
    pajak: 0,
    netto: 0,
  })
  const [trenBulanan, setTrenBulanan] = useState<[string, number][]>([
    ["Jan", 0], ["Feb", 0], ["Mar", 0], ["Apr", 0], ["Mei", 0],
    ["Jun", 0], ["Jul", 0], ["Agu", 0], ["Sep", 0], ["Okt", 0],
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
    return komposisi
      .map((k) => {
        const dari = akum
        akum += k.persen
        return `${k.warna} ${dari}% ${akum}%`
      })
      .join(", ")
  })()

  useEffect(() => {
    const fetchRekapitulasi = async () => {
      try {
        setLoading(true)
        const res =
          akun?.peran === "penanggung_jawab"
            ? await pjUnitService.getRekapitulasi(periode)
            : await bendaharaService.getRekapitulasi(periode)
        if (res?.ringkasan) setRingkasan(res.ringkasan)
        if (res?.tren_bulanan) setTrenBulanan(res.tren_bulanan)
        if (res?.komposisi_potongan) setKomposisi(res.komposisi_potongan)
        if (res?.data) setRows(res.data)
      } catch (error) {
        console.error("Error fetching rekapitulasi:", error)
        toast.error("Gagal memuat rekapitulasi P1")
      } finally {
        setLoading(false)
      }
    }
    fetchRekapitulasi()
  }, [periode, akun?.peran])

  const filteredRows = useMemo(() => {
    const q = cari.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(
      (item: any) =>
        String(item.nama || "").toLowerCase().includes(q) ||
        String(item.nip || "").toLowerCase().includes(q) ||
        String(item.jabatan || "").toLowerCase().includes(q)
    )
  }, [rows, cari])

  const ringkasanTahunan = useMemo(() => {
    const totalBrutoTahun = trenBulanan.reduce((sum, [, v]) => sum + Math.round(v * 1_000_000), 0)
    const bulanAktif = trenBulanan.filter(([, v]) => v > 0).length
    const rataBulan = bulanAktif > 0 ? Math.round(totalBrutoTahun / bulanAktif) : 0
    const puncak = trenBulanan.reduce(
      (best, cur) => (cur[1] > best[1] ? cur : best),
      trenBulanan[0] || ["-", 0]
    )
    return { totalBrutoTahun, bulanAktif, rataBulan, puncak }
  }, [trenBulanan])

  const exportCsv = () => {
    if (rows.length === 0) {
      toast.error("Tidak ada data rekapitulasi P1 untuk diekspor.")
      return
    }
    const headers = [
      "NIP",
      "Nama Pegawai",
      "Jabatan",
      "Grade",
      "Remunerasi P1",
      "Pengurangan Kehadiran",
      "Jumlah Bruto P1",
      "Pajak PPh 21",
      "Jumlah Netto P1",
    ]
    const csvRows = [
      headers.join(","),
      ...rows.map((item: any) =>
        [
          `"${item.nip || ""}"`,
          `"${item.nama || ""}"`,
          `"${item.jabatan || ""}"`,
          `"${item.grade || ""}"`,
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
    toast.success(`Rekapitulasi P1 ${periode} berhasil diekspor ke CSV.`)
  }

  const nilaiTren = trenBulanan.map(([, v]) => v)
  const maks = Math.max(...nilaiTren, 1)
  const min = Math.max(0, Math.min(...nilaiTren, 0) * 0.8)
  const rentang = Math.max(0.01, maks - min)
  const unitNama = akun?.unit_nama || "Unit Kerja"

  return (
    <>
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-primary" />
          <span className="ml-3 text-sm text-muted-foreground">Memuat rekapitulasi P1...</span>
        </div>
      )}

      {!loading && (
        <>
          <PageHeading
            title={`Rekapitulasi & Analisis P1 — ${unitNama}`}
            desc={
              akun?.peran === "penanggung_jawab"
                ? `Analisis rekapitulasi Remunerasi P1 ${unitNama} (Mode Pemantauan).`
                : `Analisis rekapitulasi dan tren Remunerasi P1 ${unitNama} periode ${periode}.`
            }
            action={
              <Button variant="outline" onClick={exportCsv}>
                <Download className="mr-1.5 size-4" /> Ekspor CSV
              </Button>
            }
          />

          <div className="space-y-6 pb-10">
            {/* Hero Stats Card */}
            <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 p-6 text-white shadow-lg">
              <div className="relative z-10">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-emerald-200">
                      <BarChart3 className="size-4" />
                      Rekapitulasi Periode P1
                    </div>
                    <h2 className="text-3xl font-extrabold tracking-tight">{rupiah(ringkasan.netto || 0)}</h2>
                    <p className="text-sm text-emerald-100">
                      Total P1 Netto • {ringkasan.pegawai} Pegawai • Periode {periode}
                    </p>
                  </div>
                  <div className="hidden rounded-xl bg-white/10 p-4 backdrop-blur-sm sm:block">
                    <div className="flex size-16 items-center justify-center rounded-full bg-white/20 text-white">
                      <Wallet className="size-8" />
                    </div>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-lg bg-white/10 px-3 py-2 backdrop-blur-sm">
                    <p className="text-[10px] text-purple-200">P1 Awal</p>
                    <p className="mt-0.5 text-sm font-bold">{rupiah(ringkasan.remP1)}</p>
                  </div>
                  <div className="rounded-lg bg-white/10 px-3 py-2 backdrop-blur-sm">
                    <p className="text-[10px] text-purple-200">Potongan</p>
                    <p className="mt-0.5 text-sm font-bold">- {rupiah(ringkasan.pengurangan)}</p>
                  </div>
                  <div className="rounded-lg bg-white/10 px-3 py-2 backdrop-blur-sm">
                    <p className="text-[10px] text-purple-200">Bruto</p>
                    <p className="mt-0.5 text-sm font-bold">{rupiah(ringkasan.bruto)}</p>
                  </div>
                  <div className="rounded-lg bg-white/10 px-3 py-2 backdrop-blur-sm">
                    <p className="text-[10px] text-purple-200">Pajak</p>
                    <p className="mt-0.5 text-sm font-bold">- {rupiah(ringkasan.pajak)}</p>
                  </div>
                </div>
              </div>
              <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-white/10 to-transparent"></div>
            </div>

            {/* Navigasi Page di Atas (Per Periode & Per Bulan Setahun) + Dropdown Periode di Bawahnya */}
            <div className="rounded-xl border bg-card p-4 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center gap-2 border-b pb-3">
                {(
                  [
                    ["periode", "📊 Data Per Periode", Calendar],
                    ["tahunan", "📈 Tren Tahunan", TrendingUp],
                  ] as const
                ).map(([k, l, Icon]) => (
                  <button
                    key={k}
                    onClick={() => setTab(k)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-colors",
                      tab === k
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="size-3.5" />
                    {l}
                  </button>
                ))}
              </div>

              {tab === "periode" && (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-muted-foreground">Pilih Periode P1:</span>
                    <Select value={periode} onValueChange={setPeriode}>
                      <SelectTrigger className="w-52 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {periodeList.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="relative w-64">
                    <Search className="pointer-events-none absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                    <Input
                      value={cari}
                      onChange={(e) => setCari(e.target.value)}
                      placeholder="Cari NIP, nama, atau jabatan..."
                      className="h-8 pl-8 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Card Menyesuaikan Tab (Hanya Data P1) */}
            {tab === "periode" ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <Panel className="border-l-4 border-l-slate-500 p-4">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Total Pegawai P1</span>
                    <Users className="size-3.5" />
                  </div>
                  <p className="mt-1.5 text-lg font-bold">{ringkasan.pegawai} Orang</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">{periode}</p>
                </Panel>
                <Panel className="border-l-4 border-l-sky-500 p-4">
                  <p className="text-[11px] text-muted-foreground">Remunerasi P1 Awal</p>
                  <p className="mt-1.5 text-lg font-bold">{rupiah(ringkasan.remP1)}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">Sebelum pengurangan</p>
                </Panel>
                <Panel className="border-l-4 border-l-rose-500 p-4">
                  <p className="text-[11px] text-muted-foreground">Pengurangan Kehadiran P1</p>
                  <p className="mt-1.5 text-lg font-bold text-rose-600">- {rupiah(ringkasan.pengurangan)}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">TL, PSW, Cuti &amp; Alfa</p>
                </Panel>
                <Panel className="border-l-4 border-l-amber-500 p-4">
                  <p className="text-[11px] text-muted-foreground">Bruto &amp; Pajak P1</p>
                  <p className="mt-1.5 text-lg font-bold">{rupiah(ringkasan.bruto)}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">PPh 21: {rupiah(ringkasan.pajak)}</p>
                </Panel>
                <Panel className="border-l-4 border-l-emerald-500 bg-emerald-50/40 p-4 dark:bg-emerald-950/20">
                  <div className="flex items-center justify-between text-[11px] text-emerald-700 dark:text-emerald-300">
                    <span className="font-semibold">Total P1 Netto</span>
                    <Wallet className="size-3.5" />
                  </div>
                  <p className="mt-1.5 text-lg font-extrabold text-emerald-700 dark:text-emerald-300">
                    {rupiah(ringkasan.netto)}
                  </p>
                  <p className="mt-0.5 text-[10px] text-emerald-700/80 dark:text-emerald-400">Netto dibayarkan</p>
                </Panel>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Panel className="border-l-4 border-l-primary p-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Akumulasi P1 Bruto (2026)</span>
                    <Wallet className="size-4 text-primary" />
                  </div>
                  <p className="mt-2 text-lg font-bold">{rupiah(ringkasanTahunan.totalBrutoTahun)}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">Total realisasi P1 setahun</p>
                </Panel>
                <Panel className="border-l-4 border-l-sky-500 p-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Rata-rata P1 per Bulan</span>
                    <TrendingUp className="size-4 text-sky-600" />
                  </div>
                  <p className="mt-2 text-lg font-bold">{rupiah(ringkasanTahunan.rataBulan)}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">Dari {ringkasanTahunan.bulanAktif} bulan aktif</p>
                </Panel>
                <Panel className="border-l-4 border-l-emerald-500 p-4">
                  <p className="text-xs text-muted-foreground">Realisasi P1 Tertinggi</p>
                  <p className="mt-2 text-lg font-bold">
                    {rupiah(Math.round((ringkasanTahunan.puncak[1] || 0) * 1_000_000))}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">Bulan {ringkasanTahunan.puncak[0]} 2026</p>
                </Panel>
                <Panel className="border-l-4 border-l-amber-500 p-4">
                  <p className="text-xs text-muted-foreground">Cakupan Periode</p>
                  <p className="mt-2 text-lg font-bold">{ringkasanTahunan.bulanAktif} / 12 Bulan</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">Tahun Anggaran 2026</p>
                </Panel>
              </div>
            )}

            {/* Tabel Utama */}
            <Panel className="overflow-x-auto p-0">
              {tab === "periode" ? (
                <table className="w-full min-w-[58rem] text-xs">
                  <thead className="bg-muted/50 text-left text-[11px] text-muted-foreground">
                    <tr>
                      {[
                        "NIP / Nama",
                        "Jabatan & Grade",
                        "Remunerasi P1 Awal",
                        "Pengurangan Kehadiran",
                        "Jumlah Bruto P1",
                        "Pajak PPh 21",
                        "Jumlah Netto P1",
                      ].map((h) => (
                        <th key={h} className="px-4 py-3 font-medium">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-10 text-center text-muted-foreground">
                          Tidak ada data rekapitulasi P1 untuk periode {periode}.
                        </td>
                      </tr>
                    )}
                    {filteredRows.map((item: any) => (
                      <tr key={item.nip} className="border-t odd:bg-muted/20 hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <p className="font-semibold">{item.nama}</p>
                          <p className="font-mono text-[10px] text-muted-foreground">{item.nip}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p>{item.jabatan}</p>
                          <p className="text-[10px] text-muted-foreground">{item.grade}</p>
                        </td>
                        <td className="px-4 py-3">{rupiah(item.remP1 || 0)}</td>
                        <td className="px-4 py-3 text-rose-600">- {rupiah(item.pengurangan || 0)}</td>
                        <td className="px-4 py-3">{rupiah(item.bruto || 0)}</td>
                        <td className="px-4 py-3">{rupiah(item.pajak || 0)}</td>
                        <td className="px-4 py-3 font-bold text-primary">{rupiah(item.netto || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-xs">
                  <thead className="bg-muted/50 text-left text-[11px] text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3 font-medium">Bulan (2026)</th>
                      <th className="px-5 py-3 font-medium">Total Jumlah Bruto P1</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trenBulanan.map(([b, v]) => (
                      <tr key={b} className="border-t odd:bg-muted/20">
                        <td className="px-5 py-3 font-semibold">{b} 2026</td>
                        <td className="px-5 py-3 font-medium">{rupiah(Math.round(v * 1_000_000))}</td>
                        <td className="px-5 py-3 text-muted-foreground">
                          {v > 0 ? "Tercatat" : "Belum ada data P1"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Panel>

            {/* Grafik Tren & Komposisi */}
            <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
              <Panel>
                <h2 className="font-semibold">Tren Total Bruto P1</h2>
                <p className="text-xs text-muted-foreground">Januari–Desember 2026 (dalam Juta Rupiah)</p>
                <div className="mt-4 flex h-44 items-end gap-3 border-t pt-4">
                  {trenBulanan.map(([b, v]) => (
                    <div
                      key={b}
                      className="flex flex-1 flex-col items-center gap-1"
                      title={`${b}: Rp ${v.toLocaleString("id-ID")} juta`}
                    >
                      <div
                        className="w-full rounded-t bg-gradient-to-b from-primary/80 to-primary transition-all"
                        style={{ height: `${Math.max(8, ((v - min) / rentang) * 100)}%` }}
                      />
                      <span className="text-[10px] text-muted-foreground">{b}</span>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel>
                <h2 className="font-semibold">Komposisi Pengurangan P1</h2>
                <p className="text-xs text-muted-foreground">{periode}</p>
                <div className="mt-4 flex items-center gap-5">
                  <div className="relative size-28 shrink-0 rounded-full" style={{ background: `conic-gradient(${konik})` }}>
                    <div className="absolute inset-4 flex flex-col items-center justify-center rounded-full bg-card text-center">
                      <span className="text-[10px] font-bold leading-tight">{rupiah(ringkasan.pengurangan || 0)}</span>
                      <span className="text-[8px] text-muted-foreground">Potongan P1</span>
                    </div>
                  </div>
                  <ul className="space-y-2 text-[11px]">
                    {komposisi.map((k) => (
                      <li key={k.label} className="flex items-center gap-2">
                        <span className="size-2 rounded-sm" style={{ background: k.warna }} />
                        {k.label}
                        <b className="ml-auto pl-3">{k.persen}%</b>
                      </li>
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
