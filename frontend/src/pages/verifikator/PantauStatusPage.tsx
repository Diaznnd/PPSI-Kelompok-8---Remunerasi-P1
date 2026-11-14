import { useMemo, useState } from "react"
import { Check, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { PageHeading, Panel } from "@/components/pegawai/shared"
import { FilterSelect, StatusVerifBadge, Tag, TH } from "@/components/verifikator/shared"
import type { RiwayatKejadian, StatusVerif } from "@/data/dummy-verifikator"
import { usePengajuan, useUsulan } from "@/data/store-verifikator"
import { cn } from "@/lib/utils"

type Baris = { id: string; unit: string; periode: string; status: StatusVerif; diperbarui: string; tertahan?: number; riwayat: RiwayatKejadian[]; sub: string }
const unik = (a: string[]) => [...new Set(a)]
// Pengajuan yang sudah diteruskan tampil sebagai "Diteruskan" di halaman pantau
const tampilStatus = (s: StatusVerif): StatusVerif => (s === "Diverifikasi" ? "Diteruskan" : s)

export default function PantauStatusPage() {
  const [tab, setTab] = useState<"p1" | "jbg">("p1")
  const pengajuan = usePengajuan()
  const usulan = useUsulan()
  const [periode, setPeriode] = useState("September 2026")
  const [unit, setUnit] = useState("semua")
  const [status, setStatus] = useState("semua")
  const [pilih, setPilih] = useState<Baris | null>(null)

  const semua: Baris[] = useMemo(
    () => tab === "p1"
      ? pengajuan.map((p) => ({ id: p.id, unit: p.unit, periode: p.periode, status: tampilStatus(p.status), diperbarui: p.diperbarui, tertahan: p.tertahanHari, riwayat: p.riwayat, sub: p.ke > 1 ? `Pengajuan Ulang ke-${p.ke}` : "Pengajuan ke-1" }))
      : usulan.map((u) => ({ id: u.id, unit: u.unit, periode: "Oktober 2026", status: tampilStatus(u.status), diperbarui: u.diperbarui, riwayat: u.riwayat, sub: u.nama })),
    [tab, pengajuan, usulan]
  )
  const rows = semua.filter((r) => (periode === "semua" || r.periode === periode) && (unit === "semua" || r.unit === unit) && (status === "semua" || r.status === status))

  const ganti = (t: "p1" | "jbg") => { setTab(t); setPeriode(t === "p1" ? "September 2026" : "semua"); setUnit("semua"); setStatus("semua") }
  const ke = pilih ? [...new Set(pilih.riwayat.map((r) => r.ke))] : []

  return (
    <>
      <PageHeading title="Pantau Status Pengajuan" desc="Pantau perkembangan pengajuan tanpa mengubah data." />
      <div className="mb-4 flex gap-6 border-b text-sm">
        {([["p1", "Pengajuan P1"], ["jbg", "Perubahan Jabatan/Grade"]] as const).map(([k, l]) => (
          <button key={k} onClick={() => ganti(k)} className={cn("-mb-px border-b-2 px-1 pb-2 font-medium", tab === k ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>{l}</button>
        ))}
      </div>

      <Panel className="space-y-4 p-4">
        <div className="flex flex-wrap items-end gap-4">
          <FilterSelect label="Periode" value={periode} onChange={setPeriode} semua="Semua periode" opsi={unik(semua.map((r) => r.periode))} lebar="w-44" />
          <FilterSelect label="Unit" value={unit} onChange={setUnit} semua="Semua unit" opsi={unik(semua.map((r) => r.unit))} lebar="w-60" />
          <FilterSelect label="Status" value={status} onChange={setStatus} semua="Semua status" opsi={["Diajukan", "Dikembalikan", "Diteruskan", "Disetujui"]} lebar="w-44" />
        </div>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[48rem] text-xs">
            <thead className="bg-muted/50 text-left text-[11px] text-muted-foreground"><tr><TH>Unit</TH><TH>Periode</TH><TH>Jenis</TH><TH>Status</TH><TH>Terakhir Diperbarui</TH><TH>Aksi</TH></tr></thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-muted-foreground">Tidak ada data yang cocok dengan filter ini.</td></tr>}
              {rows.map((r) => (
                <tr key={r.id} className="border-t odd:bg-muted/20">
                  <td className="px-4 py-4"><p className="font-bold">{r.unit}</p>{r.tertahan && <div className="mt-1"><Tag warna="red">Tertahan {r.tertahan} hari</Tag></div>}</td>
                  <td className="px-4 py-4">{r.periode}</td>
                  <td className="px-4 py-4">{tab === "p1" ? "Pengajuan P1" : "Perubahan Jabatan"}</td>
                  <td className="px-4 py-4"><StatusVerifBadge status={r.status} /></td>
                  <td className="px-4 py-4">{r.diperbarui}</td>
                  <td className="px-4 py-4"><button onClick={() => setPilih(r)} className="font-semibold text-primary hover:underline">Lihat Riwayat</button></td>
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
                <p className="text-[10px] font-semibold tracking-wide text-primary">RIWAYAT PENGAJUAN</p>
                <SheetTitle className="text-lg">{pilih.id}</SheetTitle>
                <SheetDescription>{pilih.sub}</SheetDescription>
              </SheetHeader>
              <div className="space-y-6 px-4">
                {ke.map((k) => (
                  <div key={k}>
                    <Tag warna="purple">Pengajuan ke-{k}</Tag>
                    <ol className="mt-3 space-y-5 border-l-2 border-border pl-0">
                      {pilih.riwayat.filter((r) => r.ke === k).map((r, i) => (
                        <li key={i} className="relative flex gap-3 pl-5">
                          <span className="absolute -left-3.5 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">{r.selesai ? <Check className="size-3.5" /> : <RotateCcw className="size-3" />}</span>
                          <div className="text-xs">
                            <p className="font-semibold">{r.judul}</p>
                            <p className="text-[11px] text-muted-foreground">{r.waktu}</p>
                            <p className="text-[11px] text-muted-foreground">{r.oleh}</p>
                            {r.catatan && <p className="mt-1 text-[11px] text-muted-foreground">Catatan: {r.catatan}</p>}
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
              <SheetFooter className="flex-row justify-end border-t"><Button variant="outline" className="border-primary text-primary" onClick={() => setPilih(null)}>Tutup</Button></SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
