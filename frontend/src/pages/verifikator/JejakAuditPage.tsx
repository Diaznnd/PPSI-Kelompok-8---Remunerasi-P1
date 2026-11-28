import { useMemo, useState } from "react"
import { ArrowRight, Building2, Lock, Search, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Field, PageHeading, Panel } from "@/components/pegawai/shared"
import { FilterSelect, TH } from "@/components/verifikator/shared"
import type { Audit } from "@/types/verifikator"
import { useAudit } from "@/data/store-verifikator"

const unik = (a: string[]) => [...new Set(a)]
const Permanen = () => (
  <Badge variant="outline" className="gap-1 border-emerald-200 bg-emerald-50 text-emerald-800">
    <ShieldCheck className="size-3.5" /> Catatan permanen &amp; diawasi UPT
  </Badge>
)

export default function JejakAuditPage() {
  const audit = useAudit() as (Audit & { unit?: string; perlu_persetujuan_upt?: boolean; status_persetujuan_upt?: string })[]
  const [dari, setDari] = useState("")
  const [sampai, setSampai] = useState("")
  const [unit, setUnit] = useState("semua")
  const [aksi, setAksi] = useState("semua")
  const [peran, setPeran] = useState("semua")
  const [q, setQ] = useState("")
  const [pilih, setPilih] = useState<(typeof audit)[number] | null>(null)
  const [izinUptDiminta, setIzinUptDiminta] = useState(false)

  const rows = useMemo(
    () =>
      audit.filter(
        (a) =>
          (!dari || a.tanggal >= dari) &&
          (!sampai || a.tanggal <= sampai) &&
          (unit === "semua" || (a.unit || "Universitas / Lintas Unit") === unit) &&
          (aksi === "semua" || a.aksi === aksi) &&
          (peran === "semua" || a.peran === peran) &&
          (a.objek + a.pelaku + (a.unit || "")).toLowerCase().includes(q.toLowerCase())
      ),
    [audit, dari, sampai, unit, aksi, peran, q]
  )

  const groupedByUnit = useMemo(() => {
    const groups: Record<string, typeof rows> = {}
    rows.forEach((a) => {
      const key = a.unit || "Universitas / Lintas Unit"
      if (!groups[key]) groups[key] = []
      groups[key].push(a)
    })
    return Object.entries(groups)
  }, [rows])

  return (
    <>
      <PageHeading
        title="Jejak Audit Sistem"
        desc="Seluruh log aktivitas sistem per unit kerja. Akses log sensitif memerlukan persetujuan UPT Remunerasi."
        action={<Permanen />}
      />

      <div className="space-y-5 pb-10">
        {/* Banner Persetujuan UPT Remunerasi */}
        <Panel className="border-l-4 border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <Lock className="mt-0.5 size-4 shrink-0 text-amber-600" />
              <div className="text-xs">
                <p className="font-semibold text-amber-900 dark:text-amber-200">
                  Tata Kelola Akses Log Aktivitas (Persetujuan UPT Remunerasi)
                </p>
                <p className="mt-0.5 text-amber-800/90 dark:text-amber-300">
                  Verifikator dapat meninjau seluruh log aktivitas per unit. Perubahan/log sensitif ditandai dengan status persetujuan UPT Remunerasi.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant={izinUptDiminta ? "secondary" : "outline"}
              onClick={() => {
                setIzinUptDiminta(true)
                toast.success("Permohonan izin akses audit lengkap telah dicatat untuk persetujuan UPT Remunerasi.")
              }}
            >
              {izinUptDiminta ? "Izin Akses UPT Tercatat" : "Ajukan Persetujuan Akses UPT"}
            </Button>
          </div>
        </Panel>

        <Panel className="space-y-4 p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <p className="text-[11px] text-muted-foreground">Rentang tanggal</p>
              <div className="flex items-center gap-2">
                <Input type="date" className="w-40" aria-label="Dari tanggal" value={dari} max={sampai || undefined} onChange={(e) => setDari(e.target.value)} />
                <span className="text-xs text-muted-foreground">s/d</span>
                <Input type="date" className="w-40" aria-label="Sampai tanggal" value={sampai} min={dari || undefined} onChange={(e) => setSampai(e.target.value)} />
              </div>
            </div>
            <FilterSelect
              label="Unit Kerja"
              value={unit}
              onChange={setUnit}
              semua="Semua unit"
              opsi={unik(audit.map((a) => a.unit || "Universitas / Lintas Unit"))}
              lebar="w-56"
            />
            <FilterSelect label="Jenis aksi" value={aksi} onChange={setAksi} semua="Semua aksi" opsi={unik(audit.map((a) => a.aksi))} lebar="w-48" />
            <FilterSelect label="Pelaku" value={peran} onChange={setPeran} semua="Semua peran" opsi={unik(audit.map((a) => a.peran))} lebar="w-44" />
            <div className="min-w-56 flex-1 space-y-1.5">
              <p className="text-[11px] text-muted-foreground">Pencarian</p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-9" placeholder="Cari objek, pelaku, atau unit..." value={q} onChange={(e) => setQ(e.target.value)} />
              </div>
            </div>
          </div>
        </Panel>

        {groupedByUnit.length === 0 ? (
          <Panel className="py-10 text-center text-xs text-muted-foreground">
            Tidak ada catatan aktivitas yang cocok dengan filter saat ini.
          </Panel>
        ) : (
          groupedByUnit.map(([unitNama, items]) => (
            <Panel key={unitNama} className="overflow-hidden p-0">
              <div className="flex items-center justify-between border-b bg-muted/30 px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <Building2 className="size-4 text-primary" />
                  <h2 className="text-sm font-bold">{unitNama}</h2>
                </div>
                <Badge variant="outline" className="text-xs">
                  {items.length} Aktivitas
                </Badge>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[48rem] text-xs">
                  <thead className="bg-muted/20 text-left text-[11px] text-muted-foreground">
                    <tr>
                      <TH>Waktu</TH>
                      <TH>Pelaku</TH>
                      <TH>Aksi</TH>
                      <TH>Objek</TH>
                      <TH>Persetujuan UPT</TH>
                      <TH>Detail</TH>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((a) => (
                      <tr key={a.id} className="border-t odd:bg-muted/10 hover:bg-muted/30">
                        <td className="px-4 py-3.5">{a.waktu}</td>
                        <td className="px-4 py-3.5">
                          <p className="font-bold">{a.pelaku}</p>
                          <p className="text-[10px] text-muted-foreground">{a.peran}</p>
                        </td>
                        <td className="px-4 py-3.5">{a.aksi}</td>
                        <td className="px-4 py-3.5 font-bold">{a.objek}</td>
                        <td className="px-4 py-3.5">
                          <Badge
                            variant="outline"
                            className={
                              a.perlu_persetujuan_upt
                                ? "border-amber-200 bg-amber-50 text-amber-800"
                                : "border-emerald-200 bg-emerald-50 text-emerald-800"
                            }
                          >
                            {a.status_persetujuan_upt || (a.perlu_persetujuan_upt ? "Perlu Izin UPT" : "Akses Standar")}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5">
                          <button onClick={() => setPilih(a)} className="font-semibold text-primary hover:underline">
                            Lihat Perubahan
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          ))
        )}
      </div>

      <Sheet open={!!pilih} onOpenChange={(o) => !o && setPilih(null)}>
        <SheetContent className="overflow-y-auto sm:max-w-md!">
          {pilih && (
            <>
              <SheetHeader className="border-b">
                <p className="text-[10px] font-semibold tracking-wide text-primary">DETAIL PERUBAHAN</p>
                <SheetTitle className="text-lg">{pilih.judul}</SheetTitle>
                <SheetDescription>
                  {pilih.waktu} WIB • {pilih.unit || "Universitas"}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-5 px-4">
                <Permanen />
                <div className="grid grid-cols-3 gap-3 border-b pb-4">
                  <Field label="Pelaku" value={pilih.pelaku} />
                  <Field label="Peran" value={pilih.peran} />
                  <Field label="Objek" value={pilih.objek} />
                </div>
                {pilih.sebelum && pilih.sesudah && (
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex-1 rounded-lg border bg-muted/30 p-3">
                      <p className="text-[10px] text-muted-foreground">Nilai Sebelum</p>
                      <p className="font-bold">{pilih.sebelum.judul}</p>
                      <p className="text-[10px] text-muted-foreground">{pilih.sebelum.ket}</p>
                    </div>
                    <ArrowRight className="size-4 shrink-0" />
                    <div className="flex-1 rounded-lg border bg-primary/5 p-3">
                      <p className="text-[10px] text-muted-foreground">Nilai Sesudah</p>
                      <p className="font-bold">{pilih.sesudah.judul}</p>
                      <p className="text-[10px] text-muted-foreground">{pilih.sesudah.ket}</p>
                    </div>
                  </div>
                )}
                <div className="rounded-lg border-l-4 border-primary bg-primary/5 p-3 text-xs">
                  <p className="font-semibold">Alasan perubahan</p>
                  <p className="text-muted-foreground">{pilih.alasan}</p>
                </div>
              </div>
              <SheetFooter className="flex-row justify-end border-t">
                <Button variant="outline" className="border-primary text-primary" onClick={() => setPilih(null)}>
                  Tutup
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
