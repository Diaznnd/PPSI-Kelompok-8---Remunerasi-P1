import { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AlertTriangle, ArrowLeft, ArrowRight, FileSpreadsheet, Search, ShieldAlert, XCircle } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { PageHeading, Panel } from "@/components/pegawai/shared"
import { PEGAWAI_AWAL, PERSEN_P1, PIR, RINGKASAN, hitung, persenStr, type PegawaiP1, type Presensi } from "@/data/dummy-bendahara"
import { rupiah } from "@/lib/format"
import { cn } from "@/lib/utils"

const TARIF_LABEL = ["TL.1", "TL.2", "TL.3", "TL.4", "TL.5", "TL.6"]
const PSW_LABEL = ["PSW.1", "PSW.2", "PSW.3", "PSW.4", "PSW.5", "PSW.6"]
const CUTI: [keyof Presensi, string][] = [
  ["sakit", "Cuti sakit"], ["bersalin12", "Cuti Bersalin Anak ke-1 dan ke-2"], ["bersalin3", "Cuti Bersalin Anak ke-3"],
  ["bersalin4", "Cuti Bersalin Anak ke-4 dan seterusnya"], ["penting", "Cuti Karena Alasan Penting"], ["besar", "Cuti besar"],
  ["alfa", "Tidak Hadir Tanpa Keterangan / Alfa"],
]

export default function HasilPratinjauPage() {
  const navigate = useNavigate()
  const [data, setData] = useState<PegawaiP1[]>(PEGAWAI_AWAL)
  const [q, setQ] = useState("")
  const [tampil, setTampil] = useState("semua")
  const [urut, setUrut] = useState("az")
  const [lengkap, setLengkap] = useState(false)
  const [rincian, setRincian] = useState<string | null>(null)
  const [koreksi, setKoreksi] = useState<string | null>(null)
  const [draft, setDraft] = useState<Presensi | null>(null)

  const rows = useMemo(() => {
    const r = data.map((p) => ({ p, h: hitung(p) }))
      .filter(({ p }) => (p.nama + p.nip).toLowerCase().includes(q.toLowerCase()))
      .filter(({ p, h }) => tampil === "semua" || (tampil === "nol" && h.remNol) || (tampil === "disiplin" && p.hukdis > 0) || (tampil === "kurang" && h.pengurangan > 0))
    r.sort((a, b) => (urut === "bruto" ? b.h.bruto - a.h.bruto : urut === "za" ? b.p.nama.localeCompare(a.p.nama) : a.p.nama.localeCompare(b.p.nama)))
    return r
  }, [data, q, tampil, urut])

  const pRincian = data.find((p) => p.nip === rincian)
  const hRincian = pRincian ? hitung(pRincian) : null
  const pKoreksi = data.find((p) => p.nip === koreksi)

  function bukaKoreksi(p: PegawaiP1) {
    setKoreksi(p.nip)
    setDraft(structuredClone(p.presensi))
  }
  function simpanKoreksi() {
    if (!draft) return
    setData((d) => d.map((p) => (p.nip === koreksi ? { ...p, presensi: draft } : p)))
    setKoreksi(null)
    toast.success("Koreksi disimpan. Perhitungan pegawai diperbarui.")
  }
  const ubahCuti = (k: keyof Presensi, v: string) => setDraft((d) => (d ? { ...d, [k]: Math.max(0, Number(v) || 0) } : d))
  const ubahArr = (k: "tl" | "psw", i: number, v: string) =>
    setDraft((d) => (d ? { ...d, [k]: d[k].map((x, j) => (j === i ? Math.max(0, Number(v) || 0) : x)) } : d))

  const kartu = [
    ["Total Pegawai", String(RINGKASAN.pegawai)], ["Total Remunerasi P1", rupiah(RINGKASAN.remP1)],
    ["Total Pengurangan Kehadiran", rupiah(RINGKASAN.pengurangan)], ["Jumlah Bruto", rupiah(RINGKASAN.bruto)],
    ["Remunerasi P1 Rp 0", String(RINGKASAN.nolCount)], ["Baris Bermasalah", String(RINGKASAN.nolCount + RINGKASAN.disiplinCount)],
  ]

  return (
    <>
      <Link to="/bendahara/perhitungan" className="mb-3 inline-flex items-center gap-1 text-xs text-primary hover:underline"><ArrowLeft className="size-3" /> Kembali</Link>
      <PageHeading title="Hasil Pratinjau Perhitungan" desc="Tinjau hasil sebelum mengajukan ke Verifikator." action={<Badge variant="outline">Draft</Badge>} />

      <div className="space-y-6 pb-20">
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {kartu.map(([l, v]) => (
            <Panel key={l} className="p-4">
              <p className="text-[11px] text-muted-foreground">{l}</p>
              <p className="mt-1 text-sm font-bold lg:text-base">{v}</p>
            </Panel>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {[[AlertTriangle, RINGKASAN.fisik50, "Ketidakhadiran fisik di atas 50% hari kerja"], [ShieldAlert, RINGKASAN.disiplinCount, "Hukuman disiplin aktif"], [XCircle, 0, "Tidak memenuhi syarat bayar"]].map(([Ic, n, l]) => {
            const Icon = Ic as typeof AlertTriangle
            return (
              <Panel key={String(l)} className="flex items-center gap-3 p-4">
                <Icon className="size-5 text-muted-foreground" />
                <div><p className="text-xl font-bold">{String(n)}</p><p className="text-[11px] text-muted-foreground">{String(l)}</p></div>
              </Panel>
            )
          })}
        </div>

        <Panel className="space-y-4 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <button type="button" role="switch" aria-checked={lengkap} onClick={() => setLengkap((v) => !v)} className={cn("relative h-5 w-9 rounded-full transition-colors", lengkap ? "bg-primary" : "bg-border")}>
                <span className={cn("absolute top-0.5 size-4 rounded-full bg-white transition-all", lengkap ? "left-[18px]" : "left-0.5")} />
              </button>
              Tampilkan Rekap Lengkap (Format Excel UPT)
            </label>
            <Button variant="outline" onClick={() => toast.info("Ekspor belum tersambung ke backend (dummy).")}><FileSpreadsheet /> Ekspor Rekap Format Excel</Button>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="min-w-60 flex-1 space-y-1.5">
              <p className="text-xs text-muted-foreground">Pencarian</p>
              <div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Cari NIP atau nama..." value={q} onChange={(e) => setQ(e.target.value)} /></div>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">Tampilkan</p>
              <Select value={tampil} onValueChange={setTampil}>
                <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua</SelectItem><SelectItem value="nol">Remunerasi P1 Rp 0</SelectItem>
                  <SelectItem value="disiplin">Hukuman disiplin</SelectItem><SelectItem value="kurang">Ada pengurangan kehadiran</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">Urutkan</p>
              <Select value={urut} onValueChange={setUrut}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="az">Nama A-Z</SelectItem><SelectItem value="za">Nama Z-A</SelectItem><SelectItem value="bruto">Bruto tertinggi</SelectItem></SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border">
            {!lengkap ? (
              <table className="w-full min-w-[70rem] text-xs">
                <thead className="bg-muted/50 text-left text-[11px] text-muted-foreground">
                  <tr>
                    {["No", "Nama dan NIP", "Pangkat/Gol", "Nama Jabatan", "Grade", "Remunerasi per Grade Jabatan", `P1 ${PERSEN_P1}%`, "Pengali Status", "Remunerasi P1", "Total Persentase Pengurangan", "Pengurangan Kehadiran (Rp)", "Pemotongan Hukuman Disiplin Sedang", "Jumlah Bruto", "Aksi"].map((h) => <th key={h} className="px-3 py-2 font-medium">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 && <tr><td colSpan={14} className="py-10 text-center text-muted-foreground">Tidak ada data yang cocok.</td></tr>}
                  {rows.map(({ p, h }, i) => (
                    <tr key={p.nip} className="border-t odd:bg-muted/20">
                      <td className="px-3 py-3">{i + 1}</td>
                      <td className="px-3 py-3"><p className="font-semibold">{p.nama}</p><p className="text-[10px] text-muted-foreground">{p.nip}</p></td>
                      <td className="px-3 py-3">{p.pangkat}</td>
                      <td className="px-3 py-3">{p.jabatan}</td>
                      <td className="px-3 py-3"><span className="rounded bg-primary/10 px-2 py-0.5 font-semibold text-primary">{p.grade}</span></td>
                      <td className="px-3 py-3">{rupiah(h.remGrade)}</td>
                      <td className="px-3 py-3">{rupiah(h.p1)}</td>
                      <td className="px-3 py-3">{p.pengali}%</td>
                      <td className="px-3 py-3">{rupiah(h.remP1)}</td>
                      <td className="px-3 py-3">{persenStr(h.totalPersen)}</td>
                      <td className="px-3 py-3">{rupiah(h.pengurangan)}</td>
                      <td className="px-3 py-3">{p.hukdis}%</td>
                      <td className="px-3 py-3 font-bold">{rupiah(h.bruto)}</td>
                      <td className="whitespace-nowrap px-3 py-3 font-semibold text-primary">
                        <button className="hover:underline" onClick={() => setRincian(p.nip)}>Rincian</button>
                        <button className="ml-3 hover:underline" onClick={() => bukaKoreksi(p)}>Koreksi</button>
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t bg-primary/5 font-bold">
                    <td className="px-3 py-3" colSpan={8}>TOTAL ({RINGKASAN.pegawai} pegawai)</td>
                    <td className="px-3 py-3">{rupiah(RINGKASAN.remP1)}</td><td />
                    <td className="px-3 py-3">{rupiah(RINGKASAN.pengurangan)}</td><td />
                    <td className="px-3 py-3">{rupiah(RINGKASAN.bruto)}</td><td />
                  </tr>
                </tbody>
              </table>
            ) : (
              <table className="w-full min-w-[90rem] text-[11px]">
                <thead className="bg-muted/50 text-left text-muted-foreground">
                  <tr>
                    {["No", "Nama", "NIP", ...TARIF_LABEL, ...PSW_LABEL, "Sakit", "Bersalin 1–2", "Bersalin 3", "Bersalin 4+", "Alasan Penting", "Cuti Besar", "Alfa", "Total %", "Pengurangan (Rp)", "Jumlah Bruto"].map((h) => <th key={h} className="px-2 py-2 font-medium">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ p, h }, i) => (
                    <tr key={p.nip} className="border-t odd:bg-muted/20">
                      <td className="px-2 py-2">{i + 1}</td><td className="px-2 py-2 font-semibold">{p.nama}</td><td className="px-2 py-2">{p.nip}</td>
                      {[...p.presensi.tl, ...p.presensi.psw, p.presensi.sakit, p.presensi.bersalin12, p.presensi.bersalin3, p.presensi.bersalin4, p.presensi.penting, p.presensi.besar, p.presensi.alfa].map((n, j) => (
                        <td key={j} className={cn("px-2 py-2 text-center", n > 0 && "bg-primary/10 font-bold text-primary")}>{n}</td>
                      ))}
                      <td className="px-2 py-2">{persenStr(h.totalPersen)}</td><td className="px-2 py-2">{rupiah(h.pengurangan)}</td><td className="px-2 py-2 font-bold">{rupiah(h.bruto)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">Tabel menampilkan 7 pegawai contoh dari {RINGKASAN.pegawai} pegawai. Total di atas dihitung dari seluruh pegawai.</p>
        </Panel>
      </div>

      <div className="sticky bottom-0 -mx-4 flex flex-wrap justify-between gap-2 border-t bg-card px-4 py-3 md:-mx-8 md:px-8">
        <Button variant="outline" onClick={() => { setData(PEGAWAI_AWAL); toast.success("Perhitungan dijalankan ulang.") }}>Jalankan Ulang Perhitungan</Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.success("Disimpan sebagai draft (dummy).")}>Simpan sebagai Draft</Button>
          <Button onClick={() => navigate("/bendahara/perhitungan/konfirmasi")}>Lanjut ke Pengajuan <ArrowRight /></Button>
        </div>
      </div>

      {/* Rincian perhitungan */}
      <Sheet open={!!pRincian} onOpenChange={(o) => !o && setRincian(null)}>
        <SheetContent className="overflow-y-auto sm:max-w-3xl!">
          {pRincian && hRincian && (
            <>
              <SheetHeader className="border-b">
                <p className="text-[10px] font-semibold tracking-wide text-primary">RINCIAN PERHITUNGAN</p>
                <SheetTitle className="text-lg">{pRincian.nama}</SheetTitle>
                <SheetDescription>{pRincian.nip}</SheetDescription>
              </SheetHeader>
              <div className="grid gap-6 px-4 md:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs font-semibold">Langkah Perhitungan</p>
                  <dl className="divide-y rounded-lg border text-xs">
                    {[
                      ["Nilai Jabatan", pRincian.nilaiJabatan.toLocaleString("id-ID")], ["PIR", rupiah(PIR)],
                      ["Remunerasi per Grade Jabatan", rupiah(hRincian.remGrade)], [`× ${PERSEN_P1}% = P1 ${PERSEN_P1}%`, rupiah(hRincian.p1)],
                      ["Pengali Status", `${pRincian.pengali}%`], ["× Pengali Status = Remunerasi P1", rupiah(hRincian.remP1)],
                      ["Total Persentase Pengurangan", persenStr(hRincian.totalPersen)], ["Pengurangan Kehadiran", rupiah(hRincian.pengurangan)],
                      ["Pemotongan Hukuman Disiplin Sedang", rupiah(hRincian.potongDisiplin)],
                    ].map(([l, v]) => <div key={l} className="flex justify-between px-3 py-2"><dt className="text-muted-foreground">{l}</dt><dd className="font-semibold">{v}</dd></div>)}
                    <div className="flex justify-between bg-primary/10 px-3 py-2 font-bold text-primary"><dt>Jumlah Bruto</dt><dd>{rupiah(hRincian.bruto)}</dd></div>
                  </dl>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold">Data Presensi Mentah</p>
                  <dl className="divide-y rounded-lg border text-xs">
                    <div className="flex justify-between px-3 py-2"><dt className="text-muted-foreground">Hari kerja</dt><dd className="font-semibold">{pRincian.presensi.hariKerja} hari</dd></div>
                    {[...pRincian.presensi.tl.map((n, i) => [TARIF_LABEL[i], n] as const), ...pRincian.presensi.psw.map((n, i) => [PSW_LABEL[i], n] as const), ...CUTI.map(([k, l]) => [l, pRincian.presensi[k] as number] as const)].map(([l, n]) => (
                      <div key={l} className="flex justify-between px-3 py-2"><dt className="text-muted-foreground">{l}</dt><dd className="font-semibold">{n} hari</dd></div>
                    ))}
                  </dl>
                </div>
              </div>
              <SheetFooter className="border-t"><Button variant="outline" onClick={() => setRincian(null)}>Tutup</Button></SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Koreksi data sumber */}
      <Sheet open={!!pKoreksi} onOpenChange={(o) => !o && setKoreksi(null)}>
        <SheetContent className="overflow-y-auto sm:max-w-2xl!">
          {pKoreksi && draft && (
            <>
              <SheetHeader className="border-b">
                <p className="text-[10px] font-semibold tracking-wide text-primary">KOREKSI DATA SUMBER</p>
                <SheetTitle className="text-lg">{pKoreksi.nama}</SheetTitle>
                <SheetDescription>Koreksi hanya berlaku pada data presensi.</SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 px-4 sm:grid-cols-2">
                {CUTI.map(([k, l]) => (
                  <div key={k} className="space-y-1.5"><label className="text-[11px] text-muted-foreground">{l} (hari)</label><Input type="number" min={0} value={draft[k] as number} onChange={(e) => ubahCuti(k, e.target.value)} /></div>
                ))}
                {TARIF_LABEL.map((l, i) => (
                  <div key={l} className="space-y-1.5"><label className="text-[11px] text-muted-foreground">Keterlambatan {l} (hari)</label><Input type="number" min={0} value={draft.tl[i]} onChange={(e) => ubahArr("tl", i, e.target.value)} /></div>
                ))}
                {PSW_LABEL.map((l, i) => (
                  <div key={l} className="space-y-1.5"><label className="text-[11px] text-muted-foreground">Pulang Sebelum Waktunya {l} (hari)</label><Input type="number" min={0} value={draft.psw[i]} onChange={(e) => ubahArr("psw", i, e.target.value)} /></div>
                ))}
              </div>
              <SheetFooter className="flex-row justify-end border-t"><Button variant="outline" onClick={() => setKoreksi(null)}>Batal</Button><Button onClick={simpanKoreksi}>Simpan Koreksi</Button></SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
