import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowUpRight, CheckCircle2, Inbox, Search, type LucideIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, TabBar } from "@/components/kepegawaian/ui"
import { PageHeading, Panel } from "@/components/pegawai/shared"
import { warnaAduan } from "@/components/kepegawaian/warna"
import { KATEGORI_ADU, type AduanKep, type StatusAduan } from "@/types/kepegawaian"
import { useKepeg } from "@/data/store-kepegawaian"
import { kepegawaianService } from "@/services/kepegawaianService"
import { cn } from "@/lib/utils"

type Tab = "perlu" | "teruskan" | "selesai" | "semua"
const cocok: Record<Tab, (s: StatusAduan) => boolean> = { perlu: (s) => s === "Diajukan", teruskan: (s) => s === "Diteruskan", selesai: (s) => s === "Selesai", semua: () => true }

export default function PengaduanKepegawaianPage() {
  const { pengaduan: defaultPengaduan } = useKepeg()
  const [pengaduan, setPengaduan] = useState<AduanKep[]>(defaultPengaduan)
  const [tab, setTab] = useState<Tab>("perlu")
  const [q, setQ] = useState("")
  const [kategori, setKategori] = useState("semua")

  useEffect(() => {
    kepegawaianService.getPengaduanList().then((res) => {
      if (res?.data?.length) setPengaduan(res.data)
    }).catch(() => {})
  }, [])
  const n = (t: Tab) => pengaduan.filter((a) => cocok[t](a.status)).length
  const rows = useMemo(() => pengaduan.filter((a) => cocok[tab](a.status)).filter((a) => (a.id + a.nama + a.isi).toLowerCase().includes(q.toLowerCase())).filter((a) => kategori === "semua" || a.kategori === kategori), [pengaduan, tab, q, kategori])
  const kartu: [Tab, string, LucideIcon, string][] = [["perlu", "Perlu ditanggapi", Inbox, "bg-sky-100 text-sky-700"], ["teruskan", "Diteruskan ke UPT", ArrowUpRight, "bg-orange-100 text-orange-700"], ["selesai", "Selesai", CheckCircle2, "bg-emerald-100 text-emerald-700"]]

  return (
    <>
      <PageHeading title="Pengaduan Pegawai" desc="Diagnosis pengaduan pegawai unit Anda. Selesaikan bila akar masalah ada pada data sumber unit, atau teruskan ke UPT Remunerasi bila menyangkut verifikasi, penetapan, parameter, pajak, atau P1 Netto." />
      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-3">
          {kartu.map(([k, l, Icon, w]) => (
            <button key={k} onClick={() => setTab(k)} className={cn("flex items-center gap-3 rounded-xl border bg-card p-4 text-left", tab === k && "border-primary ring-1 ring-primary")}>
              <span className={cn("flex size-10 items-center justify-center rounded-lg", w)}><Icon className="size-5" /></span>
              <span><span className="block text-2xl font-bold leading-none">{n(k)}</span><span className="text-xs text-muted-foreground">{l}</span></span>
            </button>
          ))}
        </div>
        <TabBar<Tab> aktif={tab} onChange={setTab} tabs={[["perlu", `Perlu ditanggapi (${n("perlu")})`], ["teruskan", `Diteruskan ke UPT (${n("teruskan")})`], ["selesai", `Selesai (${n("selesai")})`], ["semua", `Semua (${n("semua")})`]]} />
        <Panel className="space-y-4 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-60 max-w-sm flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Cari nomor, pegawai, atau isi pengaduan" value={q} onChange={(e) => setQ(e.target.value)} /></div>
            <Select value={kategori} onValueChange={setKategori}><SelectTrigger className="w-44"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="semua">Semua kategori</SelectItem>{KATEGORI_ADU.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent></Select>
          </div>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[52rem] text-xs">
              <thead className="bg-muted/50 text-left text-[11px] text-muted-foreground"><tr>{["No", "Pegawai", "Kategori", "Tanggal masuk", "Penanganan", "Status", "Aksi"].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
              <tbody>
                {rows.length === 0 && <tr><td colSpan={7} className="py-10 text-center text-muted-foreground">Tidak ada pengaduan pada tampilan ini.</td></tr>}
                {rows.map((a) => (
                  <tr key={a.id} className="border-t odd:bg-muted/20">
                    <td className="px-4 py-3 font-semibold">{a.id}</td>
                    <td className="px-4 py-3"><div className="flex items-center gap-2.5"><Avatar nama={a.nama} /><div><p className="font-semibold">{a.nama}</p><p className="text-[10px] text-muted-foreground">{a.nip}</p></div></div></td>
                    <td className="px-4 py-3">{a.kategori}</td><td className="px-4 py-3">{a.masuk}</td><td className="px-4 py-3 text-muted-foreground">{a.penanganan}</td>
                    <td className="px-4 py-3"><Badge variant="outline" className={warnaAduan[a.status]}>{a.status}</Badge></td>
                    <td className="px-4 py-3 font-semibold text-primary"><Link to={`/kepegawaian/pengaduan/${a.id}`} className="hover:underline">{a.status === "Diajukan" ? "Tanggapi" : "Lihat"}</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-muted-foreground">Menampilkan {rows.length} dari {n("semua")} data</p>
        </Panel>
      </div>
    </>
  )
}
