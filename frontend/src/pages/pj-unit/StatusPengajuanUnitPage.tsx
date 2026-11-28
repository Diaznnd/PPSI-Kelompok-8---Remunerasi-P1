import { useEffect, useState } from "react"
import { Calendar, CheckCircle2, Clock, FileCheck2, RotateCcw, TriangleAlert } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageHeading, Panel } from "@/components/pegawai/shared"
import { Stepper } from "@/components/bendahara/Stepper"
import type { RiwayatUnit } from "@/types/pjunit"
import { pjUnitService } from "@/services/pjUnitService"
import { cn } from "@/lib/utils"

const warna = (s: string) => {
  if (s === "Disetujui") return "border-emerald-200 bg-emerald-100 text-emerald-800"
  if (s === "Dikembalikan") return "border-red-200 bg-red-100 text-red-800"
  if (s === "Diajukan") return "border-blue-200 bg-blue-100 text-blue-800"
  return "border-purple-200 bg-purple-100 text-purple-800"
}

export default function StatusPengajuanUnitPage() {
  const [riwayatList, setRiwayatList] = useState<RiwayatUnit[]>([])
  const [periode, setPeriode] = useState("Oktober 2026")
  const [info, setInfo] = useState<RiwayatUnit | null>(null)

  useEffect(() => {
    pjUnitService
      .getStatusPengajuan()
      .then((res) => {
        if (res?.data?.length) {
          setRiwayatList(res.data)
          setPeriode(res.data[0].periode)
        }
      })
      .catch(() => {})
  }, [])

  const r = riwayatList.find((x) => x.periode === periode) ??
    riwayatList[0] ?? {
      periode: "Oktober 2026",
      status: "Draft" as const,
      diajukan: "-",
      keputusan: "-",
      kembali: 0,
      catatan: "",
      terkini: "Belum diajukan",
    }

  const doneStep = (r as any).done_step || (r.status === "Disetujui" ? 4 : r.status === "Diajukan" ? 2 : 1)

  return (
    <>
      <PageHeading
        title="Status & Timeline Pengajuan P1 Unit"
        desc="Pantau progres verifikasi real-time, riwayat evaluasi, dan prediksi jadwal pencairan P1 unit Anda (Mode Pemantauan)."
      />
      <div className="space-y-6 pb-10">
        {/* Hero Status Card */}
        <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 p-6 text-white shadow-lg">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm text-emerald-200">
                  <Calendar className="size-4" />
                  Periode: {periode || "Belum ada pengajuan"}
                </div>
                <h2 className="mt-2 text-2xl font-bold">
                  {r.status === "Dikembalikan" ? "⚠️ Pengajuan Memerlukan Perbaikan" : r.status}
                </h2>
                <p className="mt-1 text-sm text-emerald-100/90">
                  {r.status === "Dikembalikan"
                    ? "Verifikator telah mengembalikan pengajuan dengan catatan perbaikan"
                    : r.status === "Disetujui"
                    ? "Pengajuan telah disetujui dan slip P1 sudah terbit ke pegawai"
                    : "Progres pengajuan sedang berjalan sesuai alur verifikasi"}
                </p>
              </div>
              <div className="hidden sm:block">
                {r.status === "Dikembalikan" ? (
                  <div className="flex size-20 items-center justify-center rounded-full bg-amber-500/20 text-amber-300 border-2 border-amber-500/40">
                    <TriangleAlert className="size-10" />
                  </div>
                ) : r.status === "Disetujui" ? (
                  <div className="flex size-20 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 border-2 border-emerald-500/40">
                    <CheckCircle2 className="size-10" />
                  </div>
                ) : (
                  <div className="flex size-20 items-center justify-center rounded-full bg-sky-500/20 text-sky-300 border-2 border-sky-500/40">
                    <Clock className="size-10" />
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge className="bg-white/20 text-white hover:bg-white/25 border-white/30">
                Tahap {doneStep} dari 4
              </Badge>
              {r.kembali > 0 && (
                <Badge className="bg-white/20 text-white hover:bg-white/25 border-white/30">
                  {r.kembali} Kali Dikembalikan
                </Badge>
              )}
              {r.diajukan && (
                <Badge className="bg-white/20 text-white hover:bg-white/25 border-white/30">
                  Diajukan: {r.diajukan}
                </Badge>
              )}
            </div>
          </div>
          <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-white/10 to-transparent"></div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Panel className="flex flex-col justify-between">
            <p className="text-xs font-medium text-muted-foreground">Periode Dipantau</p>
            {riwayatList.length > 0 ? (
              <Select value={periode} onValueChange={setPeriode}>
                <SelectTrigger className="mt-2 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {riwayatList.map((x) => (
                    <SelectItem key={x.periode} value={x.periode}>
                      {x.periode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="mt-2 text-sm font-semibold text-muted-foreground">Belum ada pengajuan</p>
            )}
          </Panel>

          <Panel className="border-l-4 border-l-primary">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Status Terkini</span>
              <Clock className="size-4 text-primary" />
            </div>
            <p className="mt-2 text-base font-bold">{r.status}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{r.terkini || `Tahap ${doneStep} dari 4`}</p>
          </Panel>

          <Panel className="border-l-4 border-l-sky-500">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Tanggal Pengajuan</span>
              <Calendar className="size-4 text-sky-600" />
            </div>
            <p className="mt-2 text-base font-bold">{r.diajukan || "-"}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Keputusan: {r.keputusan || "-"}</p>
          </Panel>

          <Panel className="border-l-4 border-l-amber-500">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Frekuensi Pengembalian</span>
              {r.kembali > 0 ? (
                <TriangleAlert className="size-4 text-amber-600" />
              ) : (
                <RotateCcw className="size-4 text-emerald-600" />
              )}
            </div>
            <p className="mt-2 text-base font-bold">{r.kembali === 0 ? "0 Kali" : `${r.kembali} Kali`}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {r.kembali === 0 ? "Belum ada catatan revisi" : "Klik baris tabel untuk detail"}
            </p>
          </Panel>
        </div>

        <Panel className="p-0">
          <div className="flex items-start justify-between gap-3 border-b p-5">
            <div>
              <h2 className="font-semibold">Progres Pengajuan {r.periode}</h2>
              <p className="text-xs text-muted-foreground">Status terkini: {r.terkini}</p>
            </div>
            <Badge variant="outline" className={warna(r.status)}>
              {r.status === "Disetujui" && <CheckCircle2 className="mr-1 size-3" />}
              {r.status}
            </Badge>
          </div>
          <div className="px-6 py-8">
            <Stepper steps={["Draft", "Diajukan", "Diverifikasi", "Disetujui"]} done={doneStep} />
          </div>
        </Panel>

        <Panel className="p-0">
          <div className="flex items-center justify-between border-b p-5">
            <div>
              <h2 className="font-semibold">Riwayat Pengajuan Unit</h2>
              <p className="text-xs text-muted-foreground">Klik baris untuk melihat informasi pengembalian.</p>
            </div>
            <FileCheck2 className="size-4 text-muted-foreground" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] text-xs">
              <thead className="bg-muted/50 text-left text-[11px] text-muted-foreground">
                <tr>
                  {["Periode", "Status", "Tanggal Diajukan", "Keputusan Verifikator", "Jumlah Pengembalian"].map((h) => (
                    <th key={h} className="px-5 py-3 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {riwayatList.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      Belum ada pengajuan P1 yang tercatat untuk unit kerja Anda.
                    </td>
                  </tr>
                )}
                {riwayatList.map((x) => (
                  <tr
                    key={x.periode}
                    onClick={() => setInfo(x)}
                    className={cn(
                      "cursor-pointer border-t odd:bg-muted/20 hover:bg-primary/5",
                      x.periode === periode && "bg-primary/5"
                    )}
                  >
                    <td className="px-5 py-4 font-bold">{x.periode}</td>
                    <td className="px-5 py-4">
                      <Badge variant="outline" className={warna(x.status)}>
                        {x.status}
                      </Badge>
                    </td>
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
            <DialogDescription>
              {info && (info.kembali === 0 ? "Tidak ada pengembalian pada periode ini." : info.catatan)}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInfo(null)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
