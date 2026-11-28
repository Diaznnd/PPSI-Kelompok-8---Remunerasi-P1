import { useEffect, useMemo, useState } from "react"
import { CalendarClock, CalendarX2, Gavel, Info, Plus, Search } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AreaTeks, Avatar, Bidang } from "@/components/kepegawaian/ui"
import { PageHeading, Panel } from "@/components/pegawai/shared"
import { JENIS_HUKUMAN, TINGKAT_HUKUMAN, hariInklusif, progresHukuman, statusHukuman, tglID, type Hukuman, type StatusHukuman, type TingkatHukuman } from "@/types/kepegawaian"
import { catatHukuman, ubahHukuman, useKepeg } from "@/data/store-kepegawaian"
import { kepegawaianService } from "@/services/kepegawaianService"
import { cn } from "@/lib/utils"

const TINGKAT = Object.keys(TINGKAT_HUKUMAN) as TingkatHukuman[]
const warnaTingkat: Record<TingkatHukuman, string> = { Ringan: "border-slate-200 bg-slate-100 text-slate-700", Sedang: "border-amber-200 bg-amber-100 text-amber-800", Berat: "border-red-200 bg-red-100 text-red-800" }

function FormHukuman({ hukuman, daftarPegawai, onClose, onSuccess }: { hukuman?: Hukuman; daftarPegawai: any[]; onClose: () => void; onSuccess?: () => void }) {
  const ubah = !!hukuman
  const [nip, setNip] = useState(hukuman?.nip ?? "")
  const [tingkat, setTingkat] = useState<TingkatHukuman>(hukuman?.tingkat ?? "Ringan")
  const [jenis, setJenis] = useState(hukuman?.jenis ?? JENIS_HUKUMAN[0])
  const [sk, setSk] = useState(hukuman?.sk ?? "")
  const [mulai, setMulai] = useState(hukuman?.mulai ?? "")
  const [akhir, setAkhir] = useState(hukuman?.berakhir ?? "")
  const [uraian, setUraian] = useState(hukuman?.uraian ?? "")
  const [galat, setGalat] = useState("")
  const [saving, setSaving] = useState(false)
  const durasi = mulai && akhir && akhir > mulai ? hariInklusif(mulai, akhir) : null

  async function simpan() {
    const p = daftarPegawai.find((x) => x.nip === nip)
    if (!p) return setGalat("Pilih pegawai terlebih dahulu.")
    if (!sk.trim()) return setGalat("Nomor SK hukuman wajib diisi.")
    if (!mulai || !akhir) return setGalat("Tanggal mulai dan berakhir wajib diisi.")
    if (akhir <= mulai) return setGalat("Rentang tanggal tidak logis: Tanggal berakhir harus setelah tanggal mulai (tidak boleh di tanggal yang sama atau sebelumnya).")
    if (uraian.trim().length < 10) return setGalat("Uraian pelanggaran minimal 10 karakter.")
    const isi = { tingkat, jenis, sk: sk.trim(), mulai, berakhir: akhir, uraian: uraian.trim() }
    setSaving(true)
    try {
      if (hukuman) {
        await kepegawaianService.updateHukuman((hukuman as any).raw_id || hukuman.id, isi)
        ubahHukuman(hukuman.id, isi)
        toast.success("Perubahan hukuman disimpan.")
      } else {
        await kepegawaianService.createHukuman({ NIP: p.nip, ...isi })
        catatHukuman({ nip: p.nip, nama: p.nama, ...isi })
        toast.success("Hukuman disiplin dicatat.")
      }
      onSuccess?.()
      onClose()
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.errors?.tanggal_berakhir?.[0]
      if (msg) {
        setGalat(msg)
        toast.error(msg)
        return
      } else {
        if (hukuman) { ubahHukuman(hukuman.id, isi); toast.success("Perubahan hukuman disimpan (mode lokal).") }
        else { catatHukuman({ nip: p.nip, nama: p.nama, ...isi }); toast.success("Hukuman disiplin dicatat (mode lokal).") }
        onSuccess?.()
        onClose()
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-xl!">
        <DialogHeader><DialogTitle>{ubah ? `Ubah Hukuman Disiplin ${hukuman.id}` : "Catat Hukuman Disiplin"}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <Bidang label="Pegawai">
            <Select value={nip} onValueChange={setNip} disabled={ubah}><SelectTrigger className="w-full"><SelectValue placeholder="Pilih pegawai aktif" /></SelectTrigger>
              <SelectContent>{daftarPegawai.filter((p) => p.aktif || p.nip === nip).map((p) => <SelectItem key={p.nip} value={p.nip}>{p.nama} • {p.nip}</SelectItem>)}</SelectContent></Select>
          </Bidang>
          <Bidang label="Tingkat hukuman">
            <div className="grid grid-cols-3 gap-2">
              {TINGKAT.map((t) => (
                <button key={t} type="button" role="radio" aria-checked={tingkat === t} onClick={() => setTingkat(t)} className={cn("rounded-lg border p-3 text-left", tingkat === t ? "border-primary bg-primary/10" : "hover:bg-muted")}>
                  <p className="text-xs font-semibold">{t}</p><p className="text-[10px] text-muted-foreground">Potongan P1 {TINGKAT_HUKUMAN[t]}%</p>
                </button>
              ))}
            </div>
          </Bidang>
          <div className="grid gap-4 sm:grid-cols-2">
            <Bidang label="Jenis hukuman"><Select value={jenis} onValueChange={setJenis}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{JENIS_HUKUMAN.map((j) => <SelectItem key={j} value={j}>{j}</SelectItem>)}</SelectContent></Select></Bidang>
            <Bidang label="Nomor SK hukuman"><Input value={sk} onChange={(e) => setSk(e.target.value)} placeholder="0731/UN16.R/KP/2026" /></Bidang>
            <Bidang label="Tanggal mulai"><Input type="date" value={mulai} onChange={(e) => setMulai(e.target.value)} /></Bidang>
            <Bidang label="Tanggal berakhir" hint={durasi ? `Durasi ${durasi} hari` : undefined}><Input type="date" value={akhir} min={mulai || undefined} onChange={(e) => setAkhir(e.target.value)} /></Bidang>
          </div>
          <Bidang label="Uraian pelanggaran"><AreaTeks rows={3} value={uraian} onChange={(e) => setUraian(e.target.value)} placeholder="Contoh: Tidak masuk kerja tanpa alasan sah secara kumulatif 12 hari dalam satu tahun." /></Bidang>
          <div className="flex gap-2 rounded-lg border border-sky-200 bg-sky-50 p-3 text-xs text-sky-900"><Info className="mt-0.5 size-4 shrink-0" />Persentase potongan ditentukan parameter aktif UPT Remunerasi. Bidang Kepegawaian hanya mencatat data sumber; potongan dihitung otomatis pada periode yang beririsan dengan masa hukuman.</div>
          {galat && <p className="text-xs text-destructive">{galat}</p>}
        </div>
        <DialogFooter><Button variant="outline" onClick={onClose} disabled={saving}>Batal</Button><Button onClick={simpan} disabled={saving}>{saving ? "Menyimpan..." : ubah ? "Simpan Perubahan" : "Simpan"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function HukumanDisiplinPage() {
  const { hukuman: defaultHukuman, pegawai: defaultPegawai } = useKepeg()
  const [hukuman, setHukuman] = useState<Hukuman[]>(defaultHukuman)
  const [daftarPegawai, setDaftarPegawai] = useState<any[]>(defaultPegawai)
  const [q, setQ] = useState("")
  const [status, setStatus] = useState("semua")
  const [tingkat, setTingkat] = useState("semua")
  const [form, setForm] = useState<"baru" | Hukuman | null>(null)

  const fetchData = async () => {
    try {
      const [resHukuman, resPegawai] = await Promise.all([
        kepegawaianService.getHukumanList(),
        kepegawaianService.getPegawaiList(),
      ])
      if (resHukuman?.data) setHukuman(resHukuman.data)
      if (resPegawai?.data) {
        setDaftarPegawai(resPegawai.data.map((p: any) => ({
          nip: p.NIP || p.nip,
          nama: p.nama,
          aktif: p.aktif,
        })))
      }
    } catch {
      setHukuman([])
      setDaftarPegawai([])
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const rows = useMemo(() => hukuman.filter((h) => (h.nama + h.nip + h.sk).toLowerCase().includes(q.toLowerCase())).filter((h) => status === "semua" || statusHukuman(h) === status).filter((h) => tingkat === "semua" || h.tingkat === tingkat), [hukuman, q, status, tingkat])
  const hitung = (s: StatusHukuman) => hukuman.filter((h) => statusHukuman(h) === s).length
  const kartu = [[hitung("Aktif"), "Aktif memengaruhi P1", Gavel], [hitung("Akan berlaku"), "Akan berlaku", CalendarClock], [hitung("Berakhir"), "Sudah berakhir", CalendarX2]] as const

  return (
    <>
      <PageHeading title="Hukuman Disiplin" desc="Catat hukuman disiplin pegawai beserta masa berlakunya. Hukuman aktif menjadi sumber potongan P1 sesuai parameter UPT Remunerasi." action={<Button onClick={() => setForm("baru")}><Plus /> Catat Hukuman</Button>} />
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          {kartu.map(([n, l, Icon]) => (
            <Panel key={l} className="flex items-center gap-3 p-4"><span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="size-4" /></span><div><p className="text-xl font-bold leading-none">{n}</p><p className="mt-1 text-[10px] text-muted-foreground">{l}</p></div></Panel>
          ))}
        </div>
        <Panel className="space-y-4 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-60 flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Cari pegawai, NIP, atau nomor SK" value={q} onChange={(e) => setQ(e.target.value)} /></div>
            <Select value={status} onValueChange={setStatus}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="semua">Semua status</SelectItem><SelectItem value="Aktif">Aktif</SelectItem><SelectItem value="Akan berlaku">Akan berlaku</SelectItem><SelectItem value="Berakhir">Berakhir</SelectItem></SelectContent></Select>
            <Select value={tingkat} onValueChange={setTingkat}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="semua">Semua tingkat</SelectItem>{TINGKAT.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
          </div>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[56rem] text-xs">
              <thead className="bg-muted/50 text-left text-[11px] text-muted-foreground"><tr>{["Pegawai", "Tingkat", "Jenis hukuman", "Masa berlaku", "Status", "Aksi"].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
              <tbody>
                {rows.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-muted-foreground">Tidak ada data hukuman yang cocok.</td></tr>}
                {rows.map((h) => {
                  const st = statusHukuman(h)
                  return (
                    <tr key={h.id} className="border-t odd:bg-muted/20">
                      <td className="px-4 py-3"><div className="flex items-center gap-2.5"><Avatar nama={h.nama} /><div><p className="font-semibold">{h.nama}</p><p className="text-[10px] text-muted-foreground">{h.nip}</p></div></div></td>
                      <td className="px-4 py-3"><Badge variant="outline" className={warnaTingkat[h.tingkat]}>{h.tingkat}</Badge><p className="mt-1 text-[10px] text-muted-foreground">Potongan P1 {TINGKAT_HUKUMAN[h.tingkat]}%</p></td>
                      <td className="max-w-64 px-4 py-3"><p>{h.jenis}</p><p className="text-[10px] text-muted-foreground">SK {h.sk}</p></td>
                      <td className="px-4 py-3"><p>{tglID(h.mulai)} – {tglID(h.berakhir)}</p><div className="mt-1.5 h-1 w-40 rounded-full bg-muted"><div className={cn("h-1 rounded-full", st === "Aktif" ? "bg-red-500" : "bg-slate-400")} style={{ width: `${Math.round(progresHukuman(h) * 100)}%` }} /></div></td>
                      <td className="px-4 py-3"><Badge variant={st === "Aktif" ? "outline" : "secondary"} className={st === "Aktif" ? "border-red-200 bg-red-100 text-red-800" : undefined}>{st === "Berakhir" ? "Berakhir" : st}</Badge></td>
                      <td className="px-4 py-3"><button className="font-semibold text-primary hover:underline" onClick={() => setForm(h)}>Ubah</button></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-muted-foreground">Menampilkan {rows.length} dari {hukuman.length} data</p>
        </Panel>
      </div>
      {form && <FormHukuman hukuman={form === "baru" ? undefined : form} daftarPegawai={daftarPegawai} onClose={() => setForm(null)} onSuccess={fetchData} />}
    </>
  )
}
