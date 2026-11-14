import { Link } from "react-router-dom"
import { CalendarDays, CheckCircle2, ChevronRight, FileCheck2, GitCompareArrows, History, ListChecks, RotateCcw, type LucideIcon } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PageHeading, Panel, PanelTitle } from "@/components/pegawai/shared"
import { Tag } from "@/components/verifikator/shared"
import { resetDemo, usePengajuan, useStatistik, useUsulan } from "@/data/store-verifikator"
import { cn } from "@/lib/utils"

const PINTASAN: [string, string, LucideIcon][] = [
  ["Verifikasi Pengajuan P1", "/verifikator/pengajuan", FileCheck2],
  ["Perubahan Jabatan/Grade", "/verifikator/jabatan", GitCompareArrows],
  ["Pantau Status", "/verifikator/status", History],
  ["Jejak Audit", "/verifikator/audit", ListChecks],
]

export default function BerandaVerifikatorPage() {
  const pengajuan = usePengajuan()
  const usulan = useUsulan()
  const st = useStatistik()

  // Kartu ringkasan: angka dasar dikurangi/ditambah keputusan yang sudah diambil
  const KARTU: [string, string, LucideIcon][] = [
    ["Pengajuan P1 Menunggu", String(12 - st.pengajuan), FileCheck2],
    ["Usulan Perubahan Jabatan Menunggu", String(7 - st.usulan), GitCompareArrows],
    ["Dikembalikan", String(4 + st.dikembalikan), RotateCcw],
    ["Disetujui Bulan Ini", String(28 + st.disetujui), CheckCircle2],
  ]

  // Antrean: yang masih menunggu keputusan verifikator
  const ANTREAN = [
    ...pengajuan.filter((p) => p.status === "Diajukan").map((p) => ({ key: p.id, jenis: "Pengajuan P1", unit: p.unit, masuk: p.tanggalDiajukan, hari: 3, to: `/verifikator/pengajuan/${p.id}` })),
    ...usulan.filter((u) => u.status === "Diajukan").map((u) => ({ key: u.id, jenis: "Perubahan Jabatan", unit: u.unit, masuk: u.diajukan, hari: 2, to: `/verifikator/jabatan/${u.id}` })),
  ]

  return (
    <>
      <PageHeading title="Beranda Verifikator" desc="Ringkasan antrean verifikasi periode Oktober 2026."
        action={<Button variant="ghost" size="sm" onClick={() => { resetDemo(); toast.success("Data demo dikembalikan ke awal.") }}>Reset data demo</Button>}
      />
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {KARTU.map(([l, v, Icon]) => (
            <Panel key={l} className="p-5">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[11px] text-muted-foreground">{l}</p>
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="size-4" /></span>
              </div>
              <p className="mt-2 text-2xl font-bold">{v}</p>
              <p className="mt-1 text-[10px] text-muted-foreground">Per Oktober 2026</p>
            </Panel>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Panel className="p-0 lg:col-span-2">
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h2 className="font-semibold leading-tight">Antrean Terbaru</h2>
                <p className="text-xs text-muted-foreground">Urutan berdasarkan waktu masuk.</p>
              </div>
              <Link to="/verifikator/pengajuan" className="inline-flex items-center text-xs font-semibold text-primary hover:underline">Lihat Semua <ChevronRight className="size-4" /></Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[34rem] text-xs">
                <thead className="bg-muted/50 text-left text-[11px] text-muted-foreground">
                  <tr>{["Jenis", "Unit", "Periode", "Tanggal Masuk", "Lama Menunggu", "Aksi"].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {ANTREAN.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-muted-foreground">Tidak ada antrean. Semua pengajuan sudah diperiksa.</td></tr>}
                  {ANTREAN.map((a) => (
                    <tr key={a.key} className="border-t odd:bg-muted/20">
                      <td className="px-4 py-4"><Tag warna={a.jenis === "Pengajuan P1" ? "sky" : "purple"}>{a.jenis}</Tag></td>
                      <td className="px-4 py-4 font-semibold">{a.unit}</td>
                      <td className="px-4 py-4">Oktober 2026</td>
                      <td className="px-4 py-4">{a.masuk}</td>
                      <td className={cn("px-4 py-4", a.hari >= 3 && "font-semibold text-destructive")}>{a.hari} hari</td>
                      <td className="px-4 py-4"><Link to={a.to} className="font-semibold text-primary hover:underline">Periksa</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel className="p-0">
            <div className="border-b p-5"><PanelTitle icon={CalendarDays} title="Jadwal Tahapan Bulan Ini" desc="Oktober 2026" /></div>
            <ul className="divide-y">
              {[
                ["1–5", "Rekap absensi", "Terlambat", "border-orange-200 bg-orange-100 text-orange-800"],
                ["6–8", "Penyusunan SK Penetapan Pembayaran P1", "Berjalan", "border-amber-200 bg-amber-100 text-amber-800"],
                ["9–13", "Pencairan", "Akan datang", "bg-muted text-muted-foreground"],
              ].map(([tgl, desk, st, warna]) => (
                <li key={tgl} className="flex gap-3 p-4">
                  <span className="flex size-10 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 text-xs font-bold leading-tight text-primary">{tgl}<span className="text-[9px] font-normal">Okt</span></span>
                  <div className="space-y-1.5"><p className="text-xs font-semibold">{desk}</p><Badge variant="outline" className={cn("text-[10px]", warna)}>{st}</Badge></div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <Panel className="p-5">
          <h2 className="font-semibold leading-tight">Pintasan</h2>
          <p className="mb-4 text-xs text-muted-foreground">Akses cepat ke tugas utama Anda.</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PINTASAN.map(([label, to, Icon]) => (
              <Link key={to} to={to} className="flex items-center justify-between gap-2 rounded-lg border px-4 py-3 text-xs font-semibold transition-colors hover:bg-primary/5">
                <span className="flex items-center gap-2"><Icon className="size-4 text-primary" />{label}</span>
                <ChevronRight className="size-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </Panel>
      </div>
    </>
  )
}
