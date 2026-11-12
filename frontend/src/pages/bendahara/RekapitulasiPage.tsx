import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageHeading, Panel } from "@/components/pegawai/shared"
import { BULAN_BRUTO, KOMPOSISI, PEGAWAI_AWAL, PERIODE_REKAP, RINGKASAN, hitung } from "@/data/dummy-bendahara"
import { rupiah } from "@/lib/format"
import { cn } from "@/lib/utils"

export default function RekapitulasiPage() {
  const [periode, setPeriode] = useState(PERIODE_REKAP[0])
  const [tab, setTab] = useState<"periode" | "bulan">("periode")
  const dummy = () => toast.info("Ekspor belum tersambung ke backend (dummy).")
  const rows = PEGAWAI_AWAL.map((p) => ({ p, h: hitung(p) }))
  const maks = Math.max(...BULAN_BRUTO.map(([, v]) => v))
  const min = 900

  let akum = 0
  const konik = KOMPOSISI.map((k) => { const dari = akum; akum += k.persen; return `${k.warna} ${dari}% ${akum}%` }).join(", ")
  const kartu = [
    ["Total Pegawai", String(RINGKASAN.pegawai)], ["Remunerasi P1", rupiah(RINGKASAN.remP1)], ["Total Pengurangan Kehadiran", rupiah(RINGKASAN.pengurangan)],
    ["Jumlah Bruto", rupiah(RINGKASAN.bruto)], ["Pajak", rupiah(RINGKASAN.pajak)], ["Jumlah Netto", rupiah(RINGKASAN.netto)],
  ]

  return (
    <>
      <PageHeading
        title="Rekapitulasi P1"
        desc="Analisis rekap P1 Fakultas Teknologi Informasi."
        action={<div className="flex gap-2"><Button variant="outline" onClick={dummy}>Ekspor Rekap Format Excel</Button><Button variant="outline" onClick={dummy}>Ekspor CSV</Button><Button onClick={dummy}>Ekspor Excel</Button></div>}
      />

      <div className="space-y-6">
        <Panel>
          <p className="mb-1.5 text-xs text-muted-foreground">Periode</p>
          <Select value={periode} onValueChange={setPeriode}>
            <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
            <SelectContent>{PERIODE_REKAP.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
          </Select>
        </Panel>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {kartu.map(([l, v]) => (
            <Panel key={l} className="p-4">
              <p className="text-[11px] text-muted-foreground">{l}</p>
              <p className="mt-1 text-base font-bold">{v}</p>
              <p className="mt-1 text-[10px] text-muted-foreground">{periode} • dibayarkan November 2026</p>
            </Panel>
          ))}
        </div>

        <div>
          <div className="flex gap-6 border-b text-sm">
            {([["periode", "Per Periode"], ["bulan", "Per Bulan Setahun"]] as const).map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)} className={cn("-mb-px border-b-2 px-1 pb-2", tab === k ? "border-primary font-semibold text-primary" : "border-transparent text-muted-foreground")}>{l}</button>
            ))}
          </div>

          <Panel className="mt-4 overflow-x-auto p-0">
            {tab === "periode" ? (
              <table className="w-full min-w-[64rem] text-xs">
                <thead className="bg-muted/50 text-left text-[11px] text-muted-foreground">
                  <tr>{["NIP / Nama", "Jabatan", "Grade", "Remunerasi per Grade Jabatan", "Remunerasi P1", "Pengurangan Kehadiran", "Jumlah Bruto", "Pajak", "Pajak TER", "Tab. Pajak", "Jumlah Netto"].map((h) => <th key={h} className="px-3 py-3 font-medium">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {rows.map(({ p, h }) => (
                    <tr key={p.nip} className="border-t odd:bg-muted/20">
                      <td className="px-3 py-3"><p className="font-semibold">{p.nama}</p><p className="text-[10px] text-muted-foreground">{p.nip}</p></td>
                      <td className="px-3 py-3">{p.jabatan}</td><td className="px-3 py-3">{p.grade}</td>
                      <td className="px-3 py-3">{rupiah(h.remGrade)}</td><td className="px-3 py-3">{rupiah(h.remP1)}</td><td className="px-3 py-3">{rupiah(h.pengurangan)}</td>
                      <td className="px-3 py-3">{rupiah(h.bruto)}</td><td className="px-3 py-3">{rupiah(p.pajak)}</td><td className="px-3 py-3">Rp 0</td><td className="px-3 py-3">Rp 0</td>
                      <td className="px-3 py-3 font-bold">{rupiah(h.netto)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-xs">
                <thead className="bg-muted/50 text-left text-[11px] text-muted-foreground"><tr><th className="px-4 py-3 font-medium">Bulan (2026)</th><th className="px-4 py-3 font-medium">Total Jumlah Bruto</th></tr></thead>
                <tbody>
                  {BULAN_BRUTO.map(([b, v]) => <tr key={b} className="border-t odd:bg-muted/20"><td className="px-4 py-3 font-semibold">{b}</td><td className="px-4 py-3">{rupiah(Math.round(v * 1_000_000))}</td></tr>)}
                </tbody>
              </table>
            )}
          </Panel>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
          <Panel>
            <h2 className="font-semibold">Tren Total Jumlah Bruto</h2>
            <p className="text-xs text-muted-foreground">Januari–Desember 2026</p>
            <div className="mt-4 flex h-44 items-end gap-3 border-t pt-4">
              {BULAN_BRUTO.map(([b, v]) => (
                <div key={b} className="flex flex-1 flex-col items-center gap-1" title={`${b}: Rp ${v.toLocaleString("id-ID")} juta`}>
                  <div className="w-full rounded-t bg-gradient-to-b from-primary/80 to-primary" style={{ height: `${Math.max(8, ((v - min) / (maks - min)) * 100)}%` }} />
                  <span className="text-[10px] text-muted-foreground">{b}</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel>
            <h2 className="font-semibold">Komposisi Pengurangan</h2>
            <p className="text-xs text-muted-foreground">{periode}</p>
            <div className="mt-4 flex items-center gap-5">
              <div className="relative size-28 shrink-0 rounded-full" style={{ background: `conic-gradient(${konik})` }}>
                <div className="absolute inset-4 flex flex-col items-center justify-center rounded-full bg-card text-center">
                  <span className="text-xs font-bold">Rp 36,35 Jt</span>
                  <span className="text-[8px] text-muted-foreground">Pengurangan Kehadiran</span>
                </div>
              </div>
              <ul className="space-y-2 text-[11px]">
                {KOMPOSISI.map((k) => (
                  <li key={k.label} className="flex items-center gap-2"><span className="size-2 rounded-sm" style={{ background: k.warna }} />{k.label}<b className="ml-auto pl-3">{k.persen}%</b></li>
                ))}
              </ul>
            </div>
          </Panel>
        </div>
      </div>
    </>
  )
}
