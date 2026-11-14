import { useMemo, useState } from "react"
import { ArrowRight, Search, ShieldCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Field, PageHeading, Panel } from "@/components/pegawai/shared"
import { FilterSelect, TH } from "@/components/verifikator/shared"
import type { Audit } from "@/data/dummy-verifikator"
import { useAudit } from "@/data/store-verifikator"

const unik = (a: string[]) => [...new Set(a)]
const Permanen = () => <Badge variant="outline" className="gap-1 border-emerald-200 bg-emerald-50 text-emerald-800"><ShieldCheck /> Catatan tidak dapat diubah</Badge>

export default function JejakAuditPage() {
  const audit = useAudit()
  const [dari, setDari] = useState("")
  const [sampai, setSampai] = useState("")
  const [aksi, setAksi] = useState("semua")
  const [peran, setPeran] = useState("semua")
  const [q, setQ] = useState("")
  const [pilih, setPilih] = useState<Audit | null>(null)

  const rows = useMemo(
    () => audit.filter((a) => (!dari || a.tanggal >= dari) && (!sampai || a.tanggal <= sampai) && (aksi === "semua" || a.aksi === aksi) && (peran === "semua" || a.peran === peran) && (a.objek + a.pelaku).toLowerCase().includes(q.toLowerCase())),
    [audit, dari, sampai, aksi, peran, q]
  )

  return (
    <>
      <PageHeading title="Jejak Audit" desc="Catatan aktivitas sistem yang bersifat permanen dan hanya baca." action={<Permanen />} />
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
          <FilterSelect label="Jenis aksi" value={aksi} onChange={setAksi} semua="Semua aksi" opsi={unik(audit.map((a) => a.aksi))} lebar="w-52" />
          <FilterSelect label="Pelaku" value={peran} onChange={setPeran} semua="Semua peran" opsi={unik(audit.map((a) => a.peran))} lebar="w-52" />
          <div className="min-w-60 flex-1 space-y-1.5">
            <p className="text-[11px] text-muted-foreground">Pencarian</p>
            <div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Cari objek atau pelaku..." value={q} onChange={(e) => setQ(e.target.value)} /></div>
          </div>
        </div>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[44rem] text-xs">
            <thead className="bg-muted/50 text-left text-[11px] text-muted-foreground"><tr><TH>Waktu</TH><TH>Pelaku</TH><TH>Aksi</TH><TH>Objek</TH><TH>Aksi</TH></tr></thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan={5} className="py-10 text-center text-muted-foreground">Tidak ada catatan yang cocok.</td></tr>}
              {rows.map((a) => (
                <tr key={a.id} className="border-t odd:bg-muted/20">
                  <td className="px-4 py-4">{a.waktu}</td>
                  <td className="px-4 py-4"><p className="font-bold">{a.pelaku}</p><p className="text-[10px] text-muted-foreground">{a.peran}</p></td>
                  <td className="px-4 py-4">{a.aksi}</td>
                  <td className="px-4 py-4 font-bold">{a.objek}</td>
                  <td className="px-4 py-4"><button onClick={() => setPilih(a)} className="font-semibold text-primary hover:underline">Lihat Perubahan</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Sheet open={!!pilih} onOpenChange={(o) => !o && setPilih(null)}>
        <SheetContent className="overflow-y-auto sm:max-w-md!">
          {pilih && (
            <>
              <SheetHeader className="border-b">
                <p className="text-[10px] font-semibold tracking-wide text-primary">DETAIL PERUBAHAN</p>
                <SheetTitle className="text-lg">{pilih.judul}</SheetTitle>
                <SheetDescription>{pilih.waktu} WIB</SheetDescription>
              </SheetHeader>
              <div className="space-y-5 px-4">
                <Permanen />
                <div className="grid grid-cols-3 gap-3 border-b pb-4"><Field label="Pelaku" value={pilih.pelaku} /><Field label="Peran" value={pilih.peran} /><Field label="Objek" value={pilih.objek} /></div>
                {pilih.sebelum && pilih.sesudah && (
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex-1 rounded-lg border bg-muted/30 p-3"><p className="text-[10px] text-muted-foreground">Nilai Sebelum</p><p className="font-bold">{pilih.sebelum.judul}</p><p className="text-[10px] text-muted-foreground">{pilih.sebelum.ket}</p></div>
                    <ArrowRight className="size-4 shrink-0" />
                    <div className="flex-1 rounded-lg border bg-primary/5 p-3"><p className="text-[10px] text-muted-foreground">Nilai Sesudah</p><p className="font-bold">{pilih.sesudah.judul}</p><p className="text-[10px] text-muted-foreground">{pilih.sesudah.ket}</p></div>
                  </div>
                )}
                <div className="rounded-lg border-l-4 border-primary bg-primary/5 p-3 text-xs"><p className="font-semibold">Alasan perubahan</p><p className="text-muted-foreground">{pilih.alasan}</p></div>
              </div>
              <SheetFooter className="flex-row justify-end border-t"><Button variant="outline" className="border-primary text-primary" onClick={() => setPilih(null)}>Tutup</Button></SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
