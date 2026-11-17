import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Loader2, Plus, Search, XCircle } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, TabBar } from "@/components/kepegawaian/ui"
import { Stepper } from "@/components/bendahara/Stepper"
import { PageHeading, Panel } from "@/components/pegawai/shared"
import { warnaUsulan } from "@/components/kepegawaian/warna"
import type { StatusUsulan } from "@/data/dummy-kepegawaian"
import { useKepeg } from "@/data/store-kepegawaian"
import { cn } from "@/lib/utils"
import { kepegawaianService } from "@/services/kepegawaianService"

const Sub = ({ t }: { t: string }) => <span className="text-[10px] text-muted-foreground">{t}</span>

// Mapping status backend ke frontend
const statusMap: Record<string, StatusUsulan> = {
  "diajukan": "Diajukan",
  "dikembalikan": "Dikembalikan",
  "disetujui_verifikator": "Disetujui Verifikator",
  "ditetapkan": "Ditetapkan",
}

export default function UsulanJabatanListPage() {
  const { usulan: usulanDummy } = useKepeg()
  const [loading, setLoading] = useState(true)
  const [usulan, setUsulan] = useState<any[]>([])
  const [tab, setTab] = useState<"semua" | StatusUsulan>("semua")
  const [q, setQ] = useState("")

  useEffect(() => {
    const fetchUsulan = async () => {
      try {
        setLoading(true)
        const res = await kepegawaianService.getUsulanList()
        
        // Map API response to frontend format
        const mappedData = res.data.map((u: any) => ({
          id: u.nomor_urutan || u.id,
          nama: u.nama_pegawai,
          lama: {
            jabatan: u.jabatan_lama.nama,
            grade: u.jabatan_lama.grade,
          },
          baru: {
            jabatan: u.jabatan_baru.nama,
            grade: u.jabatan_baru.grade,
          },
          jenis: u.jenis_perubahan === "promosi" ? "Promosi" : 
                 u.jenis_perubahan === "mutasi" ? "Mutasi" :
                 u.jenis_perubahan === "kenaikan_grade" ? "Kenaikan Grade" : "Penyesuaian",
          mulai: u.tanggal_berlaku,
          status: statusMap[u.status] || u.status,
          catatanKembali: u.catatan_verifikator || "",
          diajukan_at: u.diajukan_at,
          rawId: u.id, // Keep original ID for navigation
        }))
        
        setUsulan(mappedData)
      } catch (error) {
        console.error("Error fetching usulan:", error)
        toast.error("Gagal memuat usulan. Menggunakan data dummy.")
        // Fallback to dummy data
        setUsulan(usulanDummy)
      } finally {
        setLoading(false)
      }
    }

    fetchUsulan()
  }, [usulanDummy])

  const hitung = (s: StatusUsulan) => usulan.filter((u) => u.status === s).length
  const kembali = usulan.filter((u) => u.status === "Dikembalikan")
  const rows = useMemo(() => usulan.filter((u) => tab === "semua" || u.status === tab).filter((u) => (u.nama + u.id).toLowerCase().includes(q.toLowerCase())), [usulan, tab, q])

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <>
      <PageHeading
        title="Usulan Jabatan/Grade"
        desc="Ajukan perubahan jabatan dan grade berdasarkan master data UPT Remunerasi dan pantau statusnya hingga ditetapkan."
        action={<Button asChild><Link to="/kepegawaian/usulan/baru"><Plus /> Buat Usulan</Link></Button>}
      />
      <div className="space-y-5">
        <Panel>
          <h2 className="font-semibold">Alur usulan</h2>
          <p className="mb-5 text-xs text-muted-foreground">Bidang Kepegawaian mengajukan dan memantau. Penetapan ke riwayat resmi hanya dilakukan UPT Remunerasi.</p>
          <Stepper
            steps={["Diajukan", "Diperiksa Verifikator", "Penetapan UPT", "Riwayat resmi"]} done={1}
            notes={{ 0: <Sub t="Bidang Kepegawaian" />, 1: <Sub t="Pemeriksaan dokumen" />, 2: <Sub t="UPT Remunerasi" />, 3: <Sub t="Dipakai perhitungan P1" /> }}
          />
        </Panel>

        {kembali.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex gap-2 text-xs text-red-800">
              <XCircle className="mt-0.5 size-4 shrink-0" />
              <div>
                <p className="font-semibold">{kembali.length} usulan dikembalikan Verifikator</p>
                <p>{kembali[0].nama}: {kembali[0].catatanKembali}</p>
              </div>
            </div>
            <Button asChild variant="outline" size="sm" className="border-red-300 text-red-700"><Link to={`/kepegawaian/usulan/${kembali[0].rawId}`}>Perbaiki Sekarang</Link></Button>
          </div>
        )}

        <TabBar<"semua" | StatusUsulan>
          aktif={tab} onChange={setTab}
          tabs={[["semua", `Semua (${usulan.length})`], ["Diajukan", `Diajukan (${hitung("Diajukan")})`], ["Dikembalikan", `Dikembalikan (${hitung("Dikembalikan")})`], ["Disetujui Verifikator", `Disetujui Verifikator (${hitung("Disetujui Verifikator")})`], ["Ditetapkan", `Ditetapkan (${hitung("Ditetapkan")})`]]}
        />

        <Panel className="space-y-4 p-4">
          <div className="relative max-w-xs"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Cari pegawai atau nomor usulan" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[56rem] text-xs">
              <thead className="bg-muted/50 text-left text-[11px] text-muted-foreground">
                <tr>{["Pegawai", "Perubahan", "Jenis", "Mulai berlaku", "Dokumen", "Status", "Aksi"].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
              </thead>
              <tbody>
                {rows.length === 0 && <tr><td colSpan={7} className="py-10 text-center text-muted-foreground">Tidak ada usulan pada tampilan ini.</td></tr>}
                {rows.map((u) => (
                  <tr key={u.rawId || u.id} className="border-t odd:bg-muted/20">
                    <td className="px-4 py-3"><div className="flex items-center gap-2.5"><Avatar nama={u.nama} /><div><p className="font-semibold">{u.nama}</p><p className="text-[10px] text-muted-foreground">#{u.id}</p></div></div></td>
                    <td className="px-4 py-3 text-muted-foreground">{u.lama.jabatan} {u.lama.grade} <span className="mx-1">→</span> <b className="text-foreground">{u.baru.jabatan} {u.baru.grade}</b></td>
                    <td className="px-4 py-3">{u.jenis}</td>
                    <td className="px-4 py-3">{u.mulai}</td>
                    <td className="px-4 py-3 text-muted-foreground">SK • SPMT</td>
                    <td className="px-4 py-3"><Badge variant="outline" className={cn(warnaUsulan[u.status])}>{u.status}</Badge></td>
                    <td className="px-4 py-3 font-semibold text-primary"><Link to={`/kepegawaian/usulan/${u.rawId || u.id}`} className="hover:underline">{u.status === "Dikembalikan" ? "Perbaiki" : "Lihat"}</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </>
  )
}
