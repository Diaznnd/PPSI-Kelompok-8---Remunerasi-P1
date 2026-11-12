import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageHeading, Panel } from "@/components/pegawai/shared"
import { Stepper } from "@/components/bendahara/Stepper"
import { RIWAYAT_UNIT, type RiwayatUnit } from "@/data/dummy-pjunit"
import { cn } from "@/lib/utils"

const warna = (s: string) => (s === "Disetujui" ? "border-emerald-200 bg-emerald-100 text-emerald-800" : "border-purple-200 bg-purple-100 text-purple-800")

export default function StatusPengajuanUnitPage() {
  const [periode, setPeriode] = useState(RIWAYAT_UNIT[0].periode)
  const [info, setInfo] = useState<RiwayatUnit | null>(null)
  const r = RIWAYAT_UNIT.find((x) => x.periode === periode) ?? RIWAYAT_UNIT[0]

  return (
    <>
      <PageHeading title="Status Pengajuan P1" desc="Pantau tahapan pengajuan P1 pegawai." />
      <div className="space-y-6">
        <Panel>
          <p className="mb-1.5 text-xs text-muted-foreground">Periode</p>
          <Select value={periode} onValueChange={setPeriode}>
            <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
            <SelectContent>{RIWAYAT_UNIT.map((x) => <SelectItem key={x.periode} value={x.periode}>{x.periode}</SelectItem>)}</SelectContent>
          </Select>
        </Panel>

        <Panel className="p-0">
          <div className="flex items-start justify-between gap-3 border-b p-5">
            <div>
              <h2 className="font-semibold">Progres Pengajuan {r.periode}</h2>
              <p className="text-xs text-muted-foreground">Status terkini: {r.terkini}</p>
            </div>
            <Badge variant="outline" className={warna(r.status)}>{r.status}</Badge>
          </div>
          <div className="px-6 py-8"><Stepper steps={["Draft", "Diajukan", "Diverifikasi", "Disetujui"]} done={r.status === "Disetujui" ? 4 : 3} /></div>
        </Panel>

        <Panel className="p-0">
          <div className="border-b p-5">
            <h2 className="font-semibold">Riwayat Pengajuan Unit</h2>
            <p className="text-xs text-muted-foreground">Klik baris untuk melihat informasi pengembalian.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] text-xs">
              <thead className="bg-muted/50 text-left text-[11px] text-muted-foreground">
                <tr>{["Periode", "Status", "Tanggal Diajukan", "Keputusan Verifikator", "Jumlah Pengembalian"].map((h) => <th key={h} className="px-5 py-3 font-medium">{h}</th>)}</tr>
              </thead>
              <tbody>
                {RIWAYAT_UNIT.map((x) => (
                  <tr key={x.periode} onClick={() => setInfo(x)} className={cn("cursor-pointer border-t odd:bg-muted/20 hover:bg-primary/5", x.periode === periode && "bg-primary/5")}>
                    <td className="px-5 py-4 font-bold">{x.periode}</td>
                    <td className="px-5 py-4"><Badge variant="outline" className={warna(x.status)}>{x.status}</Badge></td>
                    <td className="px-5 py-4">{x.diajukan}</td>
                    <td className="px-5 py-4">{x.keputusan}</td>
                    <td className="px-5 py-4">{x.kembali === 0 ? "0" : `${x.kembali} kali`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      <Dialog open={!!info} onOpenChange={(o) => !o && setInfo(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Informasi Pengembalian — {info?.periode}</DialogTitle>
            <DialogDescription>{info && (info.kembali === 0 ? "Tidak ada pengembalian pada periode ini." : info.catatan)}</DialogDescription>
          </DialogHeader>
          <DialogFooter><Button variant="outline" onClick={() => setInfo(null)}>Tutup</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
