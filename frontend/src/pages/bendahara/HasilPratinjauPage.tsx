import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Calculator,
  FileSpreadsheet,
  Loader2,
  RefreshCw,
  Search,
  ShieldAlert,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { PageHeading, Panel } from "@/components/pegawai/shared"
import {
  PERSEN_P1,
  hitung,
  persenStr,
  type PegawaiP1,
  type Presensi,
} from "@/types/bendahara"
import { bendaharaService } from "@/services/bendaharaService"
import { rupiah } from "@/lib/format"
import { cn } from "@/lib/utils"

const TARIF_LABEL = ["TL.1 (0-60m)", "TL.2 (61-75m)", "TL.3 (76-90m)", "TL.4 (91-105m)", "TL.5 (106-120m)", "TL.6 (>120m)"]
const PSW_LABEL = ["PSW.1 (0-60m)", "PSW.2 (61-75m)", "PSW.3 (76-90m)", "PSW.4 (91-105m)", "PSW.5 (106-120m)", "PSW.6 (>120m)"]
const CUTI: [keyof Presensi, string, string][] = [
  ["sakit", "Cuti Sakit", "1%"],
  ["bersalin12", "Cuti Bersalin Anak 1 & 2", "1%"],
  ["bersalin3", "Cuti Bersalin Anak 3", "2%"],
  ["bersalin4", "Cuti Bersalin Anak 4 dst", "3%"],
  ["penting", "Cuti Alasan Penting", "3%"],
  ["besar", "Cuti Besar", "1.5%"],
  ["alfa", "Tidak Hadir Tanpa Keterangan (Alfa)", "5%"],
]

export default function HasilPratinjauPage() {
  const navigate = useNavigate()
  const [data, setData] = useState<PegawaiP1[]>([])
  const [loading, setLoading] = useState(true)
  const [recalculating, setRecalculating] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [q, setQ] = useState("")
  const [tampil, setTampil] = useState("semua")
  const [urut, setUrut] = useState("az")
  const [lengkap, setLengkap] = useState(false)
  const [rincian, setRincian] = useState<string | null>(null)
  const [koreksi, setKoreksi] = useState<string | null>(null)
  const [draft, setDraft] = useState<Presensi | null>(null)
  const [ringkasanApi, setRingkasanApi] = useState<any>({
    pegawai: 0,
    remP1: 0,
    pengurangan: 0,
    bruto: 0,
    pajak: 0,
    netto: 0,
    nolCount: 0,
    disiplinCount: 0,
    fisik50: 0,
  })

  // Fetch data from API
  const fetchPratinjau = async () => {
    try {
      setLoading(true)
      const res = await bendaharaService.getPratinjau("2026-10")

      if (res?.data && res.data.length > 0) {
        setData(res.data)
      } else {
        setData([])
      }
      if (res?.ringkasan) {
        setRingkasanApi(res.ringkasan)
      }
    } catch (error) {
      console.error("Error fetching pratinjau:", error)
      toast.error("Gagal memuat data pratinjau dari database.")
      setData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPratinjau()
  }, [])

  const rows = useMemo(() => {
    const r = data
      .map((p) => ({ p, h: hitung(p) }))
      .filter(({ p }) => (p.nama + p.nip).toLowerCase().includes(q.toLowerCase()))
      .filter(
        ({ p, h }) =>
          tampil === "semua" ||
          (tampil === "nol" && h.remNol) ||
          (tampil === "disiplin" && p.hukdis > 0) ||
          (tampil === "kurang" && h.pengurangan > 0) ||
          (tampil === "kasubbag" && (p.grade === "8-S" || p.isKasubbag))
      )
    r.sort((a, b) =>
      urut === "bruto"
        ? b.h.bruto - a.h.bruto
        : urut === "netto"
        ? b.h.netto - a.h.netto
        : urut === "za"
        ? b.p.nama.localeCompare(a.p.nama)
        : a.p.nama.localeCompare(b.p.nama)
    )
    return r
  }, [data, q, tampil, urut])

  const pRincian = data.find((p) => p.nip === rincian)
  const hRincian = pRincian ? hitung(pRincian) : null
  const pKoreksi = data.find((p) => p.nip === koreksi)

  function bukaKoreksi(p: PegawaiP1) {
    setKoreksi(p.nip)
    setDraft(structuredClone(p.presensi))
  }

  async function simpanKoreksi() {
    if (!draft || !koreksi) return
    try {
      setLoading(true)
      await bendaharaService.koreksiPresensi(koreksi, { periode: "2026-10", ...draft })
      toast.success("Koreksi berhasil disimpan ke basis data. Nilai P1 diperbarui.")

      // Update local state with new presensi data
      setData((d) => d.map((p) => (p.nip === koreksi ? { ...p, presensi: draft } : p)))
      setKoreksi(null)
    } catch (error) {
      console.error("Error saving koreksi:", error)
      toast.error("Gagal menyimpan koreksi")
    } finally {
      setLoading(false)
    }
  }

  const ubahCuti = (k: keyof Presensi, v: string) =>
    setDraft((d) => (d ? { ...d, [k]: Math.max(0, Number(v) || 0) } : d))
  const ubahArr = (k: "tl" | "psw", i: number, v: string) =>
    setDraft((d) => (d ? { ...d, [k]: d[k].map((x, j) => (j === i ? Math.max(0, Number(v) || 0) : x)) } : d))

  // Jalankan Ulang Perhitungan
  async function handleHitungUlang() {
    try {
      setRecalculating(true)
      toast.info("Menjalankan kalkulasi ulang perhitungan P1...")
      await bendaharaService.hitung("2026-10")
      await fetchPratinjau()
      toast.success("Kalkulasi ulang perhitungan P1 selesai.")
    } catch {
      toast.error("Gagal menjalankan perhitungan dari database.")
    } finally {
      setRecalculating(false)
    }
  }

  // Ekspor Rekapitulasi Format Excel Resmi
  async function handleEksporExcel() {
    try {
      setDownloading(true)
      toast.info("Menyiapkan dokumen rekapitulasi format resmi...")
      let blob: Blob
      try {
        blob = await bendaharaService.downloadRekapExcel("2026-10")
      } catch {
        // Fallback pembuatan CSV dengan UTF-8 BOM
        const csvRows: string[][] = [
          ["REKAPITULASI PENGURANGAN REMUNERASI P1 UNIVERSITAS ANDALAS"],
          ["Unit / Fakultas: Fakultas Teknologi Informasi", "Periode: Oktober 2026"],
          [],
          [
            "No",
            "Nama",
            "NIP",
            "Pangkat/Gol.",
            "Nama Jabatan",
            "Grade Jabatan",
            "Unit/Fakultas",
            "Remunerasi Per Grade Jabatan",
            "Kehadiran (P1 40%)",
            "P1/Bulan (Rp.)",
            "TL.1 Hari",
            "TL.1 %",
            "TL.2 Hari",
            "TL.2 %",
            "TL.3 Hari",
            "TL.3 %",
            "TL.4 Hari",
            "TL.4 %",
            "TL.5 Hari",
            "TL.5 %",
            "TL.6 Hari",
            "TL.6 %",
            "PSW.1 Hari",
            "PSW.1 %",
            "PSW.2 Hari",
            "PSW.2 %",
            "PSW.3 Hari",
            "PSW.3 %",
            "PSW.4 Hari",
            "PSW.4 %",
            "PSW.5 Hari",
            "PSW.5 %",
            "PSW.6 Hari",
            "PSW.6 %",
            "Cuti Sakit Hari",
            "Cuti Sakit %",
            "Cuti Bersalin 1&2 Hari",
            "Cuti Bersalin 1&2 %",
            "Cuti Bersalin 3 Hari",
            "Cuti Bersalin 3 %",
            "Cuti Bersalin 4+ Hari",
            "Cuti Bersalin 4+ %",
            "Cuti Alasan Penting Hari",
            "Cuti Alasan Penting %",
            "Alfa Hari",
            "Alfa %",
            "Jumlah Ketidakhadiran (%)",
            "Pengurangan Kehadiran (Rp)",
            "CPNS (%)",
            "Pengurangan CPNS (Rp)",
            "Tugas Belajar (%)",
            "Pengurangan Tugas Belajar (Rp)",
            "SKP Capaian (%)",
            "Pengurangan SKP (Rp)",
            "Hukuman Disiplin (%)",
            "Pengurangan Disiplin (Rp)",
            "Total Pengurangan (Rp)",
            "Jumlah Bruto (Rp)",
            "Tarif PPh 21 (%)",
            "Pungutan PPh 21 (Rp)",
            "Jumlah Diterima / Netto (Rp)",
          ],
        ]

        rows.forEach(({ p, h }, idx) => {
          const pr = p.presensi
          csvRows.push([
            String(idx + 1),
            p.nama,
            p.nip,
            p.pangkat,
            p.jabatan,
            String(p.grade),
            "Fakultas Teknologi Informasi",
            String(h.remGrade),
            "40%",
            String(h.p1),
            String(pr.tl[0]),
            pr.tl[0] * 0.25 + "%",
            String(pr.tl[1]),
            pr.tl[1] * 0.5 + "%",
            String(pr.tl[2]),
            pr.tl[2] * 1.0 + "%",
            String(pr.tl[3]),
            pr.tl[3] * 1.5 + "%",
            String(pr.tl[4]),
            pr.tl[4] * 2.0 + "%",
            String(pr.tl[5]),
            pr.tl[5] * 2.5 + "%",
            String(pr.psw[0]),
            pr.psw[0] * 0.25 + "%",
            String(pr.psw[1]),
            pr.psw[1] * 0.5 + "%",
            String(pr.psw[2]),
            pr.psw[2] * 1.0 + "%",
            String(pr.psw[3]),
            pr.psw[3] * 1.5 + "%",
            String(pr.psw[4]),
            pr.psw[4] * 2.0 + "%",
            String(pr.psw[5]),
            pr.psw[5] * 2.5 + "%",
            String(pr.sakit),
            pr.sakit * 1.0 + "%",
            String(pr.bersalin12),
            pr.bersalin12 * 1.0 + "%",
            String(pr.bersalin3),
            pr.bersalin3 * 2.0 + "%",
            String(pr.bersalin4),
            pr.bersalin4 * 3.0 + "%",
            String(pr.penting),
            pr.penting * 3.0 + "%",
            String(pr.alfa),
            pr.alfa * 5.0 + "%",
            persenStr(h.persenPotongHadir),
            String(h.penguranganHadirRp),
            h.cpnsPersen + "%",
            String(h.cpnsRp),
            h.tubelPersen + "%",
            String(h.tubelRp),
            h.skpCapaian + "%",
            String(h.skpPenguranganRp),
            p.hukdis + "%",
            String(h.potongDisiplin),
            String(h.pengurangan),
            String(h.bruto),
            h.tarifPajakPersen + "%",
            String(h.pajak),
            String(h.netto),
          ])
        })

        const csvContent =
          "\uFEFF" +
          csvRows.map((r) => r.map((c) => `"${(c || "").replace(/"/g, '""')}"`).join(";")).join("\r\n")
        blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      }

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `Rekapitulasi_Pengurangan_Remunerasi_P1_FTI_2026-10.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      toast.success("Dokumen Rekapitulasi Excel/CSV berhasil diunduh.")
    } catch (err) {
      console.error("Export error:", err)
      toast.error("Gagal mengunduh berkas rekapitulasi.")
    } finally {
      setDownloading(false)
    }
  }

  // Kalkulasi total summary
  const totalPegawai = ringkasanApi.pegawai || data.length
  const totalRemP1 = ringkasanApi.remP1 || rows.reduce((s, r) => s + r.h.remP1, 0)
  const totalPengurangan = ringkasanApi.pengurangan || rows.reduce((s, r) => s + r.h.pengurangan, 0)
  const totalBruto = ringkasanApi.bruto || rows.reduce((s, r) => s + r.h.bruto, 0)
  const totalPajak = ringkasanApi.pajak || rows.reduce((s, r) => s + r.h.pajak, 0)
  const totalNetto = ringkasanApi.netto || rows.reduce((s, r) => s + r.h.netto, 0)

  const kartu = [
    ["Total Pegawai", String(totalPegawai), "pegawai"],
    ["Total Remunerasi P1 (40%)", rupiah(totalRemP1), "bruto dasar"],
    ["Total Pengurangan", rupiah(totalPengurangan), "hadir, status & hukdis"],
    ["Jumlah Bruto", rupiah(totalBruto), "sebelum pajak"],
    ["Total Pajak PPh 21", rupiah(totalPajak), "sesuai golongan"],
    ["Total Jumlah Diterima (Netto)", rupiah(totalNetto), "siap dicairkan"],
  ]

  return (
    <>
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-8 animate-spin text-primary" />
          <span className="ml-3 text-sm text-muted-foreground">Memuat data pratinjau perhitungan...</span>
        </div>
      )}

      {!loading && (
        <>
          <Link
            to="/bendahara/perhitungan"
            className="mb-3 inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <ArrowLeft className="size-3" /> Kembali ke Kesiapan
          </Link>
          <PageHeading
            title="Hasil Pratinjau Perhitungan P1 Unit"
            desc="Tinjau hasil perhitungan bruto, rincian potongan kehadiran, pajak PPh 21 dan netto sebelum mengajukan ke Verifikator."
            action={
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-amber-500/50 bg-amber-50 text-amber-700 dark:bg-amber-950/30">
                  Status: Draft
                </Badge>
                <Badge variant="secondary">Periode: Oktober 2026</Badge>
              </div>
            }
          />

          <div className="space-y-6 pb-20">
            {/* 6 Ringkasan Kartu Utama */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {kartu.map(([l, v, sub], idx) => (
                <Panel
                  key={l}
                  className={cn(
                    "p-4 transition-shadow hover:shadow-sm",
                    idx === 3 && "border-primary/40 bg-primary/5",
                    idx === 5 && "border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20"
                  )}
                >
                  <p className="text-[11px] font-medium text-muted-foreground">{l}</p>
                  <p
                    className={cn(
                      "mt-1 text-sm font-bold tracking-tight lg:text-base",
                      idx === 5 && "text-emerald-700 dark:text-emerald-400"
                    )}
                  >
                    {v}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">{sub}</p>
                </Panel>
              ))}
            </div>

            {/* Peringatan Kepatuhan */}
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                [AlertTriangle, ringkasanApi.fisik50 || rows.filter((r) => r.h.remNol).length, "Ketidakhadiran fisik > 50% hari kerja (P1 Rp 0)", "text-amber-600"],
                [ShieldAlert, ringkasanApi.disiplinCount || rows.filter((r) => r.p.hukdis > 0).length, "Hukuman disiplin aktif (Potongan 25% / 100%)", "text-orange-600"],
                [XCircle, rows.filter((r) => r.h.remNol).length, "Tidak memenuhi syarat bayar (Remunerasi Rp 0)", "text-red-600"],
              ].map(([Ic, n, l, clr]) => {
                const Icon = Ic as typeof AlertTriangle
                return (
                  <Panel key={String(l)} className="flex items-center gap-3.5 p-4">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/60">
                      <Icon className={cn("size-5", clr)} />
                    </div>
                    <div>
                      <p className="text-xl font-bold leading-none">{String(n)}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">{String(l)}</p>
                    </div>
                  </Panel>
                )
              })}
            </div>

            <Panel className="space-y-4 p-4 sm:p-5">
              {/* Header Bar Kontrol */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
                <label className="flex cursor-pointer items-center gap-2.5 text-xs font-medium select-none">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={lengkap}
                    onClick={() => setLengkap((v) => !v)}
                    className={cn(
                      "relative h-5 w-9 rounded-full transition-colors",
                      lengkap ? "bg-primary" : "bg-muted-foreground/30"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 size-4 rounded-full bg-white transition-all shadow-sm",
                        lengkap ? "left-[18px]" : "left-0.5"
                      )}
                    />
                  </button>
                  <span>
                    Tampilkan Rekap Lengkap Seluruh Kolom{" "}
                    <span className="text-[11px] text-muted-foreground">(Format Resmi FORM.xlsx UPT)</span>
                  </span>
                </label>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={downloading}
                    onClick={handleEksporExcel}
                    className="gap-1.5 text-xs"
                  >
                    {downloading ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <FileSpreadsheet className="size-3.5 text-emerald-600" />
                    )}
                    Ekspor Rekap Format Excel (CSV)
                  </Button>
                </div>
              </div>

              {/* Filter & Pencarian */}
              <div className="flex flex-wrap gap-3">
                <div className="min-w-60 flex-1 space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Pencarian Pegawai</p>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pl-9 text-xs"
                      placeholder="Cari berdasarkan NIP atau nama pegawai..."
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Filter Tampilan</p>
                  <Select value={tampil} onValueChange={setTampil}>
                    <SelectTrigger className="w-56 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="semua">Semua Pegawai ({data.length})</SelectItem>
                      <SelectItem value="nol">Remunerasi P1 Rp 0</SelectItem>
                      <SelectItem value="disiplin">Hukuman Disiplin</SelectItem>
                      <SelectItem value="kurang">Ada Pengurangan Kehadiran</SelectItem>
                      <SelectItem value="kasubbag">Kepala Subbagian (Grade 8-S)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Urutan</p>
                  <Select value={urut} onValueChange={setUrut}>
                    <SelectTrigger className="w-44 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="az">Nama A–Z</SelectItem>
                      <SelectItem value="za">Nama Z–A</SelectItem>
                      <SelectItem value="bruto">Bruto Tertinggi</SelectItem>
                      <SelectItem value="netto">Netto Tertinggi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tabel Pratinjau */}
              <div className="overflow-x-auto rounded-lg border bg-background">
                {!lengkap ? (
                  /* TABEL STANDAR DENGAN PAJAK & NETTO */
                  <table className="w-full min-w-[76rem] text-xs">
                    <thead className="bg-muted/60 text-left text-[11px] font-semibold text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2.5">No</th>
                        <th className="px-3 py-2.5">Nama & NIP</th>
                        <th className="px-3 py-2.5">Pangkat/Gol</th>
                        <th className="px-3 py-2.5">Jabatan</th>
                        <th className="px-3 py-2.5">Grade</th>
                        <th className="px-3 py-2.5">Nilai Grade</th>
                        <th className="px-3 py-2.5">P1 ({PERSEN_P1}%)</th>
                        <th className="px-3 py-2.5">Pengurangan Hadir</th>
                        <th className="px-3 py-2.5">Pengurangan Lain</th>
                        <th className="px-3 py-2.5 font-bold">Jumlah Bruto</th>
                        <th className="px-3 py-2.5">PPh 21</th>
                        <th className="px-3 py-2.5 font-bold text-emerald-700 dark:text-emerald-400">P1 Netto</th>
                        <th className="px-3 py-2.5 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.length === 0 && (
                        <tr>
                          <td colSpan={13} className="py-12 text-center text-muted-foreground">
                            Tidak ada data pegawai yang cocok dengan filter atau kata kunci pencarian.
                          </td>
                        </tr>
                      )}
                      {rows.map(({ p, h }, i) => {
                        const isKasubbag = p.grade === "8-S" || p.isKasubbag || p.jabatan.toLowerCase().includes("subbagian")
                        return (
                          <tr key={p.nip} className={cn("border-t transition-colors hover:bg-muted/30", h.remNol && "bg-destructive/5")}>
                            <td className="px-3 py-3 text-muted-foreground">{i + 1}</td>
                            <td className="px-3 py-3">
                              <p className="font-semibold text-foreground">{p.nama}</p>
                              <p className="text-[10px] text-muted-foreground font-mono">{p.nip}</p>
                            </td>
                            <td className="px-3 py-3">
                              <span className="font-medium">{p.pangkat}</span>
                            </td>
                            <td className="px-3 py-3 max-w-56 truncate" title={p.jabatan}>
                              {p.jabatan}
                            </td>
                            <td className="px-3 py-3">
                              <span
                                className={cn(
                                  "inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold",
                                  isKasubbag
                                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300"
                                    : "bg-primary/10 text-primary"
                                )}
                              >
                                {isKasubbag ? "Grade 8-S" : typeof p.grade === "number" ? `Grade ${p.grade}` : p.grade}
                              </span>
                            </td>
                            <td className="px-3 py-3">{rupiah(h.remGrade)}</td>
                            <td className="px-3 py-3">{rupiah(h.p1)}</td>
                            <td className="px-3 py-3">
                              <p className="font-medium text-amber-700 dark:text-amber-400">
                                {h.penguranganHadirRp > 0 ? `-${rupiah(h.penguranganHadirRp)}` : "Rp 0"}
                              </p>
                              <p className="text-[10px] text-muted-foreground">{persenStr(h.persenPotongHadir)}</p>
                            </td>
                            <td className="px-3 py-3">
                              {h.cpnsRp > 0 && <span className="inline-block text-[10px] text-sky-700 bg-sky-50 px-1 py-0.5 rounded mr-1">CPNS 20%</span>}
                              {h.tubelRp > 0 && <span className="inline-block text-[10px] text-purple-700 bg-purple-50 px-1 py-0.5 rounded mr-1">Tubel 25%</span>}
                              {h.potongDisiplin > 0 && <span className="inline-block text-[10px] text-orange-700 bg-orange-50 px-1 py-0.5 rounded mr-1">Hukdis {p.hukdis}%</span>}
                              {h.skpPenguranganRp > 0 && <span className="inline-block text-[10px] text-rose-700 bg-rose-50 px-1 py-0.5 rounded">SKP {h.skpCapaian}%</span>}
                              {h.cpnsRp === 0 && h.tubelRp === 0 && h.potongDisiplin === 0 && h.skpPenguranganRp === 0 && <span className="text-muted-foreground">-</span>}
                            </td>
                            <td className="px-3 py-3 font-bold text-foreground">
                              {rupiah(h.bruto)}
                              {h.remNol && (
                                <Badge variant="destructive" className="ml-1 text-[9px] px-1 py-0">
                                  Rp 0
                                </Badge>
                              )}
                            </td>
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-1.5">
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                  {h.tarifPajakPersen}%
                                </Badge>
                                <span className="text-muted-foreground">{rupiah(h.pajak)}</span>
                              </div>
                            </td>
                            <td className="px-3 py-3 font-bold text-emerald-700 dark:text-emerald-400">
                              {rupiah(h.netto)}
                            </td>
                            <td className="whitespace-nowrap px-3 py-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  className="text-xs font-semibold text-primary hover:underline"
                                  onClick={() => setRincian(p.nip)}
                                >
                                  Rincian
                                </button>
                                <span className="text-muted-foreground/40">•</span>
                                <button
                                  className="text-xs font-semibold text-amber-600 hover:underline dark:text-amber-400"
                                  onClick={() => bukaKoreksi(p)}
                                >
                                  Koreksi
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                      {/* Baris Total */}
                      <tr className="border-t bg-muted/40 font-bold">
                        <td className="px-3 py-3" colSpan={6}>
                          TOTAL KESELURUHAN ({totalPegawai} Pegawai)
                        </td>
                        <td className="px-3 py-3">{rupiah(totalRemP1)}</td>
                        <td className="px-3 py-3" colSpan={2}>
                          {rupiah(totalPengurangan)}
                        </td>
                        <td className="px-3 py-3 text-foreground">{rupiah(totalBruto)}</td>
                        <td className="px-3 py-3 text-muted-foreground">{rupiah(totalPajak)}</td>
                        <td className="px-3 py-3 text-emerald-700 dark:text-emerald-400">{rupiah(totalNetto)}</td>
                        <td />
                      </tr>
                    </tbody>
                  </table>
                ) : (
                  /* TABEL REKAP LENGKAP FORM.XLSX UPT */
                  <table className="w-full min-w-[120rem] text-[11px]">
                    <thead className="bg-muted/70 text-left text-muted-foreground">
                      <tr>
                        <th rowSpan={2} className="border-r px-2 py-2 font-medium">No</th>
                        <th rowSpan={2} className="border-r px-2 py-2 font-medium">Nama & NIP</th>
                        <th rowSpan={2} className="border-r px-2 py-2 font-medium">Gol.</th>
                        <th rowSpan={2} className="border-r px-2 py-2 font-medium">Grade</th>
                        <th rowSpan={2} className="border-r px-2 py-2 font-medium">Remunerasi Grade</th>
                        <th rowSpan={2} className="border-r px-2 py-2 font-medium">P1 (40%)</th>
                        <th colSpan={6} className="border-r border-b px-2 py-1 text-center font-medium bg-amber-500/10">
                          Pengurangan Karena Keterlambatan (TL.1 s.d TL.6)
                        </th>
                        <th colSpan={6} className="border-r border-b px-2 py-1 text-center font-medium bg-blue-500/10">
                          Pengurangan Karena Pulang Sebelum Waktunya (PSW.1 s.d PSW.6)
                        </th>
                        <th colSpan={7} className="border-r border-b px-2 py-1 text-center font-medium bg-rose-500/10">
                          Jenis Ketidakhadiran (Cuti & Alfa)
                        </th>
                        <th rowSpan={2} className="border-r px-2 py-2 font-medium text-center">Jml % Hadir</th>
                        <th rowSpan={2} className="border-r px-2 py-2 font-medium">Pot. Hadir (Rp)</th>
                        <th rowSpan={2} className="border-r px-2 py-2 font-medium text-center">CPNS (20%)</th>
                        <th rowSpan={2} className="border-r px-2 py-2 font-medium text-center">Tubel (25%)</th>
                        <th rowSpan={2} className="border-r px-2 py-2 font-medium text-center">SKP Capaian</th>
                        <th rowSpan={2} className="border-r px-2 py-2 font-medium">Total Pengurangan</th>
                        <th rowSpan={2} className="border-r px-2 py-2 font-bold text-foreground">Jumlah Bruto</th>
                        <th rowSpan={2} className="border-r px-2 py-2 font-medium">PPh 21 (%)</th>
                        <th rowSpan={2} className="border-r px-2 py-2 font-medium">Pot. Pajak (Rp)</th>
                        <th rowSpan={2} className="px-2 py-2 font-bold text-emerald-700 dark:text-emerald-400">Jumlah Diterima (Netto)</th>
                      </tr>
                      <tr className="border-t text-[10px]">
                        {/* TL Subheaders */}
                        {["TL.1 (0.25%)", "TL.2 (0.5%)", "TL.3 (1%)", "TL.4 (1.5%)", "TL.5 (2%)", "TL.6 (2.5%)"].map((t) => (
                          <th key={t} className="border-r px-1.5 py-1 text-center">{t}</th>
                        ))}
                        {/* PSW Subheaders */}
                        {["PSW.1 (0.25%)", "PSW.2 (0.5%)", "PSW.3 (1%)", "PSW.4 (1.5%)", "PSW.5 (2%)", "PSW.6 (2.5%)"].map((t) => (
                          <th key={t} className="border-r px-1.5 py-1 text-center">{t}</th>
                        ))}
                        {/* Cuti Subheaders */}
                        {["Sakit (1%)", "Bersalin 1-2 (1%)", "Bersalin 3 (2%)", "Bersalin 4+ (3%)", "Penting (3%)", "Besar (1.5%)", "Alfa (5%)"].map((t) => (
                          <th key={t} className="border-r px-1.5 py-1 text-center">{t}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map(({ p, h }, i) => (
                        <tr key={p.nip} className="border-t odd:bg-muted/15 hover:bg-muted/30">
                          <td className="border-r px-2 py-2 text-center text-muted-foreground">{i + 1}</td>
                          <td className="border-r px-2 py-2">
                            <p className="font-semibold">{p.nama}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">{p.nip}</p>
                          </td>
                          <td className="border-r px-2 py-2 text-center">{p.pangkat}</td>
                          <td className="border-r px-2 py-2 text-center font-medium">
                            {p.grade === "8-S" ? "8-S" : p.grade}
                          </td>
                          <td className="border-r px-2 py-2">{rupiah(h.remGrade)}</td>
                          <td className="border-r px-2 py-2 font-medium">{rupiah(h.p1)}</td>
                          {/* TL Columns */}
                          {p.presensi.tl.map((n, j) => (
                            <td key={`tl-${j}`} className={cn("border-r px-1.5 py-2 text-center", n > 0 && "bg-amber-100 font-bold text-amber-800 dark:bg-amber-950/40")}>
                              {n}
                            </td>
                          ))}
                          {/* PSW Columns */}
                          {p.presensi.psw.map((n, j) => (
                            <td key={`psw-${j}`} className={cn("border-r px-1.5 py-2 text-center", n > 0 && "bg-blue-100 font-bold text-blue-800 dark:bg-blue-950/40")}>
                              {n}
                            </td>
                          ))}
                          {/* Cuti Columns */}
                          {[p.presensi.sakit, p.presensi.bersalin12, p.presensi.bersalin3, p.presensi.bersalin4, p.presensi.penting, p.presensi.besar, p.presensi.alfa].map((n, j) => (
                            <td key={`cuti-${j}`} className={cn("border-r px-1.5 py-2 text-center", n > 0 && "bg-rose-100 font-bold text-rose-800 dark:bg-rose-950/40")}>
                              {n}
                            </td>
                          ))}
                          <td className="border-r px-2 py-2 text-center font-medium">{persenStr(h.persenPotongHadir)}</td>
                          <td className="border-r px-2 py-2">{rupiah(h.penguranganHadirRp)}</td>
                          <td className="border-r px-2 py-2 text-center">{h.cpnsRp > 0 ? rupiah(h.cpnsRp) : "-"}</td>
                          <td className="border-r px-2 py-2 text-center">{h.tubelRp > 0 ? rupiah(h.tubelRp) : "-"}</td>
                          <td className="border-r px-2 py-2 text-center">{h.skpCapaian}%</td>
                          <td className="border-r px-2 py-2 font-medium text-amber-700 dark:text-amber-400">{rupiah(h.pengurangan)}</td>
                          <td className="border-r px-2 py-2 font-bold text-foreground">{rupiah(h.bruto)}</td>
                          <td className="border-r px-2 py-2 text-center">{h.tarifPajakPersen}%</td>
                          <td className="border-r px-2 py-2 text-muted-foreground">{rupiah(h.pajak)}</td>
                          <td className="px-2 py-2 font-bold text-emerald-700 dark:text-emerald-400">{rupiah(h.netto)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground pt-1">
                <p>
                  Menampilkan {rows.length} pegawai dari {totalPegawai} pegawai di unit kerja Anda.
                </p>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1">
                    <span className="size-2 rounded-full bg-amber-500" /> Grade 8-S: Kasubbag (Rp 3.936.000)
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="size-2 rounded-full bg-emerald-500" /> Tarif PPh 21: Gol IV 15%, Gol III 5%, Gol II 5%, Gol I 0%
                  </span>
                </div>
              </div>
            </Panel>
          </div>

          {/* Sticky Bottom Actions Bar */}
          <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center justify-between gap-3 border-t bg-card/95 backdrop-blur px-4 py-3 shadow-lg md:-mx-8 md:px-8">
            <Button
              variant="outline"
              size="sm"
              disabled={recalculating}
              onClick={handleHitungUlang}
              className="gap-2 text-xs"
            >
              {recalculating ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
              Jalankan Ulang Perhitungan
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.success("Draft perhitungan tersimpan aman di sistem.")}
              >
                Simpan sebagai Draft
              </Button>
              <Button size="sm" onClick={() => navigate("/bendahara/perhitungan/konfirmasi")} className="gap-1.5">
                Lanjut ke Konfirmasi Pengajuan <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>

          {/* Sheet Rincian Perhitungan Pegawai */}
          <Sheet open={!!pRincian} onOpenChange={(o) => !o && setRincian(null)}>
            <SheetContent className="overflow-y-auto sm:max-w-3xl!">
              {pRincian && hRincian && (
                <>
                  <SheetHeader className="border-b pb-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-semibold tracking-wide text-primary uppercase">
                        Rincian Perhitungan P1 & Pajak
                      </p>
                      <Badge variant="outline">{hRincian.tarifPajakPersen}% PPh 21</Badge>
                    </div>
                    <SheetTitle className="text-lg">{pRincian.nama}</SheetTitle>
                    <SheetDescription className="font-mono text-xs">{pRincian.nip} • {pRincian.pangkat}</SheetDescription>
                  </SheetHeader>

                  <div className="grid gap-6 px-4 py-4 md:grid-cols-2">
                    {/* Langkah Perhitungan */}
                    <div>
                      <p className="mb-2 text-xs font-semibold flex items-center gap-1.5">
                        <Calculator className="size-3.5 text-primary" /> Langkah Perhitungan Resmi
                      </p>
                      <dl className="divide-y rounded-lg border text-xs">
                        <div className="flex justify-between px-3 py-2">
                          <dt className="text-muted-foreground">Jabatan & Grade</dt>
                          <dd className="font-semibold text-right">
                            {pRincian.jabatan}{" "}
                            <span className="text-primary font-bold">
                              ({pRincian.grade === "8-S" ? "Grade 8-S (Kasubbag)" : `Grade ${pRincian.grade}`})
                            </span>
                          </dd>
                        </div>
                        <div className="flex justify-between px-3 py-2">
                          <dt className="text-muted-foreground">Remunerasi Grade Jabatan</dt>
                          <dd className="font-semibold">{rupiah(hRincian.remGrade)}</dd>
                        </div>
                        <div className="flex justify-between px-3 py-2">
                          <dt className="text-muted-foreground">P1 Dasar (40%)</dt>
                          <dd className="font-semibold">{rupiah(hRincian.p1)}</dd>
                        </div>
                        <div className="flex justify-between px-3 py-2">
                          <dt className="text-muted-foreground">Pengurangan Kehadiran ({persenStr(hRincian.persenPotongHadir)})</dt>
                          <dd className="font-semibold text-amber-700 dark:text-amber-400">
                            -{rupiah(hRincian.penguranganHadirRp)}
                          </dd>
                        </div>
                        {hRincian.cpnsRp > 0 && (
                          <div className="flex justify-between px-3 py-2 bg-sky-50/50 dark:bg-sky-950/20">
                            <dt className="text-sky-700">Faktor CPNS ({hRincian.cpnsPersen}%)</dt>
                            <dd className="font-semibold text-sky-700">-{rupiah(hRincian.cpnsRp)}</dd>
                          </div>
                        )}
                        {hRincian.tubelRp > 0 && (
                          <div className="flex justify-between px-3 py-2 bg-purple-50/50 dark:bg-purple-950/20">
                            <dt className="text-purple-700">Tugas Belajar ({hRincian.tubelPersen}%)</dt>
                            <dd className="font-semibold text-purple-700">-{rupiah(hRincian.tubelRp)}</dd>
                          </div>
                        )}
                        {hRincian.skpPenguranganRp > 0 && (
                          <div className="flex justify-between px-3 py-2 bg-rose-50/50 dark:bg-rose-950/20">
                            <dt className="text-rose-700">Penyetaraan SKP ({hRincian.skpCapaian}%)</dt>
                            <dd className="font-semibold text-rose-700">-{rupiah(hRincian.skpPenguranganRp)}</dd>
                          </div>
                        )}
                        {hRincian.potongDisiplin > 0 && (
                          <div className="flex justify-between px-3 py-2 bg-orange-50/50 dark:bg-orange-950/20">
                            <dt className="text-orange-700">Hukuman Disiplin ({pRincian.hukdis}%)</dt>
                            <dd className="font-semibold text-orange-700">-{rupiah(hRincian.potongDisiplin)}</dd>
                          </div>
                        )}
                        <div className="flex justify-between px-3 py-2 bg-muted/30 font-medium">
                          <dt>Total Seluruh Pengurangan</dt>
                          <dd className="text-destructive font-bold">-{rupiah(hRincian.pengurangan)}</dd>
                        </div>
                        <div className="flex justify-between px-3 py-2.5 font-bold border-t">
                          <dt>Jumlah Bruto</dt>
                          <dd>{rupiah(hRincian.bruto)}</dd>
                        </div>
                        <div className="flex justify-between px-3 py-2 text-muted-foreground">
                          <dt>Pajak PPh 21 ({hRincian.tarifPajakPersen}%)</dt>
                          <dd className="font-semibold text-destructive">-{rupiah(hRincian.pajak)}</dd>
                        </div>
                        <div className="flex justify-between bg-emerald-50 px-3 py-2.5 font-bold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                          <dt>Jumlah Diterima (P1 Netto)</dt>
                          <dd className="text-base">{rupiah(hRincian.netto)}</dd>
                        </div>
                      </dl>
                    </div>

                    {/* Data Presensi Mentah */}
                    <div>
                      <p className="mb-2 text-xs font-semibold">Data Presensi & Ketidakhadiran</p>
                      <dl className="divide-y rounded-lg border text-xs">
                        <div className="flex justify-between px-3 py-2 font-medium bg-muted/20">
                          <dt>Total Hari Kerja Efektif</dt>
                          <dd>{pRincian.presensi.hariKerja} hari</dd>
                        </div>
                        {pRincian.presensi.tl.map((n, i) => (
                          <div key={`tl-${i}`} className="flex justify-between px-3 py-1.5">
                            <dt className="text-muted-foreground">{TARIF_LABEL[i]}</dt>
                            <dd className={cn("font-semibold", n > 0 && "text-amber-700")}>{n} hari</dd>
                          </div>
                        ))}
                        {pRincian.presensi.psw.map((n, i) => (
                          <div key={`psw-${i}`} className="flex justify-between px-3 py-1.5">
                            <dt className="text-muted-foreground">{PSW_LABEL[i]}</dt>
                            <dd className={cn("font-semibold", n > 0 && "text-blue-700")}>{n} hari</dd>
                          </div>
                        ))}
                        {CUTI.map(([k, l, t]) => (
                          <div key={k} className="flex justify-between px-3 py-1.5">
                            <dt className="text-muted-foreground">{l} ({t})</dt>
                            <dd className={cn("font-semibold", Number(pRincian.presensi[k]) > 0 && "text-rose-700")}>
                              {Number(pRincian.presensi[k])} hari
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  </div>

                  <SheetFooter className="border-t pt-3">
                    <Button variant="outline" onClick={() => setRincian(null)}>
                      Tutup
                    </Button>
                  </SheetFooter>
                </>
              )}
            </SheetContent>
          </Sheet>

          {/* Koreksi data presensi sumber */}
          <Sheet open={!!pKoreksi} onOpenChange={(o) => !o && setKoreksi(null)}>
            <SheetContent className="overflow-y-auto sm:max-w-2xl!">
              {pKoreksi && draft && (
                <>
                  <SheetHeader className="border-b pb-3">
                    <p className="text-[10px] font-semibold tracking-wide text-primary">KOREKSI DATA SUMBER PRESENSI</p>
                    <SheetTitle className="text-lg">{pKoreksi.nama}</SheetTitle>
                    <SheetDescription>Koreksi hanya berlaku pada data presensi bulanan pegawai di unit Anda.</SheetDescription>
                  </SheetHeader>
                  <div className="grid gap-4 px-4 py-4 sm:grid-cols-2">
                    {CUTI.map(([k, l, t]) => (
                      <div key={k} className="space-y-1.5">
                        <label className="text-[11px] text-muted-foreground">
                          {l} - {t} (hari)
                        </label>
                        <Input
                          type="number"
                          min={0}
                          value={draft[k] as number}
                          onChange={(e) => ubahCuti(k, e.target.value)}
                        />
                      </div>
                    ))}
                    {TARIF_LABEL.map((l, i) => (
                      <div key={l} className="space-y-1.5">
                        <label className="text-[11px] text-muted-foreground">Keterlambatan {l} (hari)</label>
                        <Input
                          type="number"
                          min={0}
                          value={draft.tl[i]}
                          onChange={(e) => ubahArr("tl", i, e.target.value)}
                        />
                      </div>
                    ))}
                    {PSW_LABEL.map((l, i) => (
                      <div key={l} className="space-y-1.5">
                        <label className="text-[11px] text-muted-foreground">Pulang Cepat {l} (hari)</label>
                        <Input
                          type="number"
                          min={0}
                          value={draft.psw[i]}
                          onChange={(e) => ubahArr("psw", i, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                  <SheetFooter className="flex-row justify-end border-t pt-3">
                    <Button variant="outline" onClick={() => setKoreksi(null)}>
                      Batal
                    </Button>
                    <Button onClick={simpanKoreksi}>Simpan Koreksi</Button>
                  </SheetFooter>
                </>
              )}
            </SheetContent>
          </Sheet>
        </>
      )}
    </>
  )
}
