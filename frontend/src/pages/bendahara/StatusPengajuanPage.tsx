import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Calendar, CheckCircle2, Clock, FileCheck2, Loader2, RotateCcw, TriangleAlert } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageHeading, Panel } from "@/components/pegawai/shared"
import { Stepper } from "@/components/bendahara/Stepper"
import { bendaharaService } from "@/services/bendaharaService"
import { cn } from "@/lib/utils"

const STAGE_LABEL: Record<number, string> = {
  1: "Draft Perhitungan",
  2: "Menunggu Verifikasi",
  3: "Menunggu Pengesahan UPT",
  4: "Disetujui & Selesai",
}

export default function StatusPengajuanPage() {
  const [loading, setLoading] = useState(true)
  const [periodeList, setPeriodeList] = useState<string[]>([])
  const [periode, setPeriode] = useState("")
  const [catatan, setCatatan] = useState<string | null>(null)
  const [statusMap, setStatusMap] = useState<any>({})

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setLoading(true)
        const res = await bendaharaService.getStatus()

        if (res?.data && res.data.length > 0) {
          const map: Record<string, any> = {}
          const list: string[] = []
          res.data.forEach((item: any) => {
            const p = item.periode || "Oktober 2026"
            list.push(p)
            map[p] = {
              done: item.done ?? 1,
              dikembalikan: item.dikembalikan ?? false,
              riwayat: item.riwayat ?? [],
            }
          })
          if (list.length > 0) {
            setPeriodeList(list)
            setPeriode(list[0])
          }
          setStatusMap(map)
        }
      } catch (error) {
        console.error("Error fetching status:", error)
        toast.error("Gagal memuat status pengajuan")
      } finally {
        setLoading(false)
      }
    }
    fetchStatus()
  }, [])

  const s = statusMap[periode] ?? { done: 1, dikembalikan: false, riwayat: [] }
  const latestHistory = s.riwayat?.[0]

  return (
    <>
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-primary" />
          <span className="ml-3 text-sm text-muted-foreground">Memuat status pengajuan...</span>
        </div>
      )}

      {!loading && (
        <>
          <PageHeading
            title="Status & Timeline Pengajuan P1"
            desc="Pantau progres verifikasi real-time, riwayat evaluasi, dan prediksi jadwal pencairan P1 unit Anda."
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
                      {s.dikembalikan ? "⚠️ Pengajuan Memerlukan Perbaikan" : STAGE_LABEL[s.done] || "Belum Diajukan"}
                    </h2>
                    <p className="mt-1 text-sm text-emerald-100/90">
                      {s.dikembalikan
                        ? "Verifikator telah mengembalikan pengajuan dengan catatan perbaikan"
                        : s.done === 4
                        ? "Pengajuan telah disetujui dan slip P1 sudah terbit ke pegawai"
                        : "Progres pengajuan sedang berjalan sesuai alur verifikasi"}
                    </p>
                  </div>
                  <div className="hidden sm:block">
                    {s.dikembalikan ? (
                      <div className="flex size-20 items-center justify-center rounded-full bg-amber-500/20 text-amber-300 border-2 border-amber-500/40">
                        <TriangleAlert className="size-10" />
                      </div>
                    ) : s.done === 4 ? (
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
                    Tahap {s.done} dari 4
                  </Badge>
                  <Badge className="bg-white/20 text-white hover:bg-white/25 border-white/30">
                    {s.riwayat.length} Putaran Evaluasi
                  </Badge>
                  {latestHistory && (
                    <Badge className="bg-white/20 text-white hover:bg-white/25 border-white/30">
                      Terakhir: {latestHistory.diajukan}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-white/10 to-transparent"></div>
            </div>

            {/* Filter & Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Panel className="flex flex-col justify-between">
                <p className="text-xs font-medium text-muted-foreground">Periode Dipantau</p>
                {periodeList.length > 0 ? (
                  <Select value={periode} onValueChange={setPeriode}>
                    <SelectTrigger className="mt-2 w-full">
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
                ) : (
                  <p className="mt-2 text-sm font-semibold text-muted-foreground">Belum ada pengajuan</p>
                )}
              </Panel>

              <Panel className="border-l-4 border-l-primary">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Tahap Saat Ini</span>
                  <Clock className="size-4 text-primary" />
                </div>
                <p className="mt-2 text-base font-bold">{s.dikembalikan ? "Perlu Perbaikan" : STAGE_LABEL[s.done] || "Draft"}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">Tahap {s.done} dari 4</p>
              </Panel>

              <Panel className="border-l-4 border-l-sky-500">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Putaran Pengajuan</span>
                  <RotateCcw className="size-4 text-sky-600" />
                </div>
                <p className="mt-2 text-base font-bold">{s.riwayat.length} Putaran</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {latestHistory ? `Terakhir: ${latestHistory.diajukan}` : "Belum diajukan"}
                </p>
              </Panel>

              <Panel className="border-l-4 border-l-emerald-500">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Keputusan Terakhir</span>
                  {s.dikembalikan ? (
                    <TriangleAlert className="size-4 text-amber-600" />
                  ) : (
                    <FileCheck2 className="size-4 text-emerald-600" />
                  )}
                </div>
                <p className="mt-2 text-base font-bold">{latestHistory?.keputusan || "Menunggu"}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {latestHistory?.tglKeputusan || "Belum ada keputusan"}
                </p>
              </Panel>
            </div>

            <Panel className="p-0">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
                <div>
                  <h2 className="font-semibold">Alur Progres Pengajuan — {periode || "Periode Aktif"}</h2>
                  <p className="text-xs text-muted-foreground">
                    {s.dikembalikan
                      ? "Pengajuan dikembalikan Verifikator untuk perbaikan data."
                      : "Pelacakan real-time dari penyusunan hingga pengesahan UPT Remunerasi."}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    s.dikembalikan
                      ? "border-amber-300 bg-amber-100 text-amber-800"
                      : s.done >= 4
                      ? "border-emerald-300 bg-emerald-100 text-emerald-800"
                      : "border-blue-300 bg-blue-100 text-blue-800"
                  )}
                >
                  {s.dikembalikan ? "Dikembalikan" : STAGE_LABEL[s.done] || "Draft"}
                </Badge>
              </div>
              <div className="px-6 py-8">
                <Stepper
                  steps={["Draft", "Diajukan", "Diverifikasi", "Disetujui"]}
                  done={s.done}
                  notes={
                    s.dikembalikan
                      ? {
                          1: (
                            <span className="flex items-center gap-1 text-[10px] text-orange-700">
                              <TriangleAlert className="size-3" /> Perlu dikoreksi
                            </span>
                          ),
                        }
                      : undefined
                  }
                />
              </div>
              {s.dikembalikan && (
                <div className="m-4 mt-0 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3">
                  <p className="flex items-center gap-2 text-xs text-orange-800">
                    <TriangleAlert className="size-4 shrink-0" /> Perbaikan diperlukan berdasarkan catatan Verifikator.
                  </p>
                  <Button asChild size="sm">
                    <Link to="/bendahara/perhitungan">Perbaiki Pengajuan</Link>
                  </Button>
                </div>
              )}
            </Panel>

            <Panel className="p-0">
              <div className="flex items-center justify-between border-b p-5">
                <div>
                  <h2 className="font-semibold">Riwayat Putaran Pengajuan</h2>
                  <p className="text-xs text-muted-foreground">Jejak audit keputusan Verifikator tersimpan permanen.</p>
                </div>
                <Calendar className="size-4 text-muted-foreground" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[40rem] text-xs">
                  <thead className="bg-muted/50 text-left text-[11px] text-muted-foreground">
                    <tr>
                      {["Putaran", "Tanggal Diajukan", "Keputusan Verifikator", "Tanggal Keputusan", "Catatan"].map((h) => (
                        <th key={h} className="px-5 py-3 font-medium">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {s.riwayat.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-muted-foreground">
                          Belum ada riwayat pengajuan untuk periode ini.
                        </td>
                      </tr>
                    )}
                    {s.riwayat.map((r: any) => (
                      <tr key={r.ke} className="border-t odd:bg-muted/20 hover:bg-muted/30">
                        <td className="px-5 py-4 font-semibold">Pengajuan ke-{r.ke}</td>
                        <td className="px-5 py-4">{r.diajukan}</td>
                        <td className="px-5 py-4">
                          <Badge
                            variant="outline"
                            className={cn(
                              r.keputusan === "Disetujui"
                                ? "border-emerald-200 bg-emerald-100 text-emerald-800"
                                : "border-orange-200 bg-orange-100 text-orange-800"
                            )}
                          >
                            {r.keputusan === "Disetujui" && <CheckCircle2 className="mr-1 size-3" />}
                            {r.keputusan}
                          </Badge>
                        </td>
                        <td className="px-5 py-4">{r.tglKeputusan}</td>
                        <td className="px-5 py-4">
                          {r.keputusan === "Dikembalikan" ? (
                            <button className="font-semibold text-primary hover:underline" onClick={() => setCatatan(r.catatan)}>
                              Lihat Catatan Pengembalian
                            </button>
                          ) : (
                            r.catatan
                          )}
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
                <DialogTitle>Catatan Pengembalian Verifikator</DialogTitle>
                <DialogDescription>Catatan evaluasi pengajuan yang harus diperbaiki.</DialogDescription>
              </DialogHeader>
              <div className="rounded-lg bg-orange-50 p-4 text-xs text-orange-950">{catatan}</div>
              <DialogFooter>
                <Button onClick={() => setCatatan(null)}>Tutup</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </>
  )
}
