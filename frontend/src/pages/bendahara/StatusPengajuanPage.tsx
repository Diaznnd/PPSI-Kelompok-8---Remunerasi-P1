import { useState } from "react"
import { Link } from "react-router-dom"
import { TriangleAlert } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageHeading, Panel } from "@/components/pegawai/shared"
import { Stepper } from "@/components/bendahara/Stepper"
import { PERIODE_STATUS, STATUS_PERIODE } from "@/data/dummy-bendahara"
import { cn } from "@/lib/utils"

export default function StatusPengajuanPage() {
  const [periode, setPeriode] = useState(PERIODE_STATUS[0])
  const [catatan, setCatatan] = useState<string | null>(null)
  const s = STATUS_PERIODE[periode]

  return (
    <>
      <PageHeading title="Status Pengajuan" desc="Pantau proses verifikasi pengajuan P1 unit." />
      <div className="space-y-6">
        <Panel>
          <p className="mb-1.5 text-xs text-muted-foreground">Periode</p>
          <Select value={periode} onValueChange={setPeriode}>
            <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
            <SelectContent>{PERIODE_STATUS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
          </Select>
        </Panel>

        <Panel className="p-0">
          <div className="border-b p-5">
            <h2 className="font-semibold">Progres Pengajuan</h2>
            {s.dikembalikan && <p className="text-xs text-muted-foreground">Pengajuan ke-1 dikembalikan untuk perbaikan.</p>}
          </div>
          <div className="px-6 py-8">
            <Stepper
              steps={["Draft", "Diajukan", "Diverifikasi", "Disetujui"]}
              done={s.done}
              notes={s.dikembalikan ? { 1: <span className="flex items-center gap-1 text-[10px] text-orange-700"><TriangleAlert className="size-3" /> Perlu dikembalikan</span> } : undefined}
            />
          </div>
          {s.dikembalikan && (
            <div className="m-4 mt-0 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-orange-50 px-4 py-3">
              <p className="flex items-center gap-2 text-xs text-orange-800"><TriangleAlert className="size-4" /> Perbaikan diperlukan berdasarkan catatan Verifikator.</p>
              <Button asChild><Link to="/bendahara/perhitungan">Perbaiki Pengajuan</Link></Button>
            </div>
          )}
        </Panel>

        <Panel className="p-0">
          <div className="border-b p-5">
            <h2 className="font-semibold">Riwayat Pengajuan</h2>
            <p className="text-xs text-muted-foreground">Setiap putaran pengajuan tersimpan permanen.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] text-xs">
              <thead className="bg-muted/50 text-left text-[11px] text-muted-foreground">
                <tr>{["Pengajuan ke-", "Tanggal Diajukan", "Keputusan Verifikator", "Tanggal Keputusan", "Catatan"].map((h) => <th key={h} className="px-5 py-2 font-medium">{h}</th>)}</tr>
              </thead>
              <tbody>
                {s.riwayat.map((r) => (
                  <tr key={r.ke} className="border-t odd:bg-muted/20">
                    <td className="px-5 py-4 font-semibold">Pengajuan ke-{r.ke}</td>
                    <td className="px-5 py-4">{r.diajukan}</td>
                    <td className="px-5 py-4">
                      <Badge variant="outline" className={cn(r.keputusan === "Disetujui" ? "border-emerald-200 bg-emerald-100 text-emerald-800" : "border-orange-200 bg-orange-100 text-orange-800")}>{r.keputusan}</Badge>
                    </td>
                    <td className="px-5 py-4">{r.tglKeputusan}</td>
                    <td className="px-5 py-4">
                      {r.keputusan === "Dikembalikan" ? <button className="font-semibold text-primary hover:underline" onClick={() => setCatatan(r.catatan)}>Lihat Catatan Pengembalian</button> : r.catatan}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      <Dialog open={!!catatan} onOpenChange={(o) => !o && setCatatan(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Catatan Pengembalian</DialogTitle>
            <DialogDescription>{catatan}</DialogDescription>
          </DialogHeader>
          <DialogFooter><Button variant="outline" onClick={() => setCatatan(null)}>Tutup</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
