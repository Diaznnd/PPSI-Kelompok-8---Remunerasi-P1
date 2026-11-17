import { useMemo, useState } from "react"
import { Download, Plus, Printer, Search } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AreaTeks, Bidang, Dropzone, TabBar } from "@/components/kepegawaian/ui"
import { PageHeading, Panel } from "@/components/pegawai/shared"
import { usePeriodeKepeg } from "@/layouts/KepegawaianShell"
import { REKAP_CUTI, hitungPresensi, statusHukuman, type BarisPresensi } from "@/data/dummy-kepegawaian"
import { persenStr } from "@/data/dummy-bendahara"
import { imporPresensi, koreksiPresensi, useKepeg } from "@/data/store-kepegawaian"
import { cn } from "@/lib/utils"

const DAFTAR_PERIODE = [
  "Oktober 2026",
  "September 2026",
  "Agustus 2026",
  "Juli 2026",
  "Juni 2026",
  "Mei 2026"
]

const warnaStatus: Record<string, string> = {
  Valid: "border-emerald-200 bg-emerald-100 text-emerald-800",
  "Tidak Layak Bayar": "border-red-200 bg-red-100 text-red-800",
  "Hukuman Aktif": "border-amber-200 bg-amber-100 text-amber-800",
}
const angka = (v: string) => Math.max(0, Math.floor(Number(v) || 0))

function KoreksiDialog({ baris, onClose }: { baris: BarisPresensi; onClose: () => void }) {
  const [hk, setHk] = useState(String(baris.hariKerja))
  const [hadir, setHadir] = useState(String(baris.hadir))
  const [tidak, setTidak] = useState(String(baris.tidakHadir))
  const [cuti, setCuti] = useState(String(baris.cuti))
  const [alasan, setAlasan] = useState("")
  const [galat, setGalat] = useState("")
  const simpan = () => {
    if (angka(hadir) + angka(tidak) + angka(cuti) !== angka(hk)) return setGalat("Hadir + Tidak Hadir + Cuti/Izin harus sama dengan Hari Kerja.")
    if (alasan.trim().length < 5) return setGalat("Alasan koreksi wajib diisi.")
    koreksiPresensi(baris.nip, { hariKerja: angka(hk), hadir: angka(hadir), tidakHadir: angka(tidak), cuti: angka(cuti) })
    toast.success("Koreksi presensi disimpan.")
    onClose()
  }
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-xl!">
        <DialogHeader><DialogTitle>Koreksi Data Presensi</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <Bidang label="Pegawai"><Input value={baris.nama} disabled /></Bidang>
          <div className="grid gap-4 sm:grid-cols-2">
            <Bidang label="Hari Kerja (bulan ini)"><Input type="number" min={0} value={hk} onChange={(e) => setHk(e.target.value)} /></Bidang>
            <Bidang label="Hari Hadir"><Input type="number" min={0} value={hadir} onChange={(e) => setHadir(e.target.value)} /></Bidang>
            <Bidang label="Tidak Hadir"><Input type="number" min={0} value={tidak} onChange={(e) => setTidak(e.target.value)} /></Bidang>
            <Bidang label="Cuti/Izin Resmi"><Input type="number" min={0} value={cuti} onChange={(e) => setCuti(e.target.value)} /></Bidang>
          </div>
          <Bidang label="Alasan Koreksi"><AreaTeks rows={3} value={alasan} onChange={(e) => setAlasan(e.target.value)} placeholder="Tuliskan alasan koreksi secara rinci ..." /></Bidang>
          {galat && <p className="text-xs text-destructive">{galat}</p>}
        </div>
        <DialogFooter><Button variant="outline" onClick={onClose}>Batal</Button><Button onClick={simpan}>Simpan Koreksi</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ImporDialog({ onClose, onSelesai }: { onClose: () => void; onSelesai: () => void }) {
  const [periode, setPeriode] = useState("")
  const [berkas, setBerkas] = useState<string | null>(null)
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-xl!">
        <DialogHeader><DialogTitle>Import Rekap Presensi & Cuti/Izin</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <Bidang label="Periode *">
            <Select value={periode} onValueChange={setPeriode}><SelectTrigger className="w-full"><SelectValue placeholder="Pilih periode" /></SelectTrigger>
              <SelectContent>{DAFTAR_PERIODE.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select>
          </Bidang>
          <p className="rounded-md bg-sky-50 px-3 py-2 text-center text-xs font-semibold text-sky-700">Pastikan format file sesuai template. Kolom wajib: NIP, Nama, Hadir, Tidak Hadir, Cuti, Izin.</p>
          <Bidang label="File Excel (.xlsx) *">
            <Dropzone
              nama={berkas} onFile={(f) => setBerkas(f.name)} onHapus={() => setBerkas(null)} accept=".xlsx" petunjuk="Format: .xlsx · Maks. 10 MB" className="py-8"
              cek={(f) => (!f.name.toLowerCase().endsWith(".xlsx") ? "Berkas harus berformat .xlsx." : f.size > 10 * 1024 * 1024 ? "Ukuran berkas maksimal 10 MB." : null)}
              contoh={() => setBerkas("presensi_contoh.xlsx")}
            />
          </Bidang>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button disabled={!periode || !berkas} onClick={() => { imporPresensi(periode, berkas!); toast.success("Import berhasil: 84 pegawai, 0 baris error."); onSelesai() }}>Mulai Import</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function PresensiCutiPage() {
  const s = useKepeg()
  const { periode } = usePeriodeKepeg()
  const [tab, setTab] = useState<"data" | "cuti" | "impor">("data")
  const [q, setQ] = useState("")
  const [status, setStatus] = useState("semua")
  const [koreksi, setKoreksi] = useState<BarisPresensi | null>(null)
  const [impor, setImpor] = useState(false)

  const aktifHukuman = useMemo(() => new Set(s.hukuman.filter((h) => statusHukuman(h) === "Aktif").map((h) => h.nip)), [s.hukuman])
  const rows = useMemo(
    () => s.presensi.map((r) => ({ r, ...hitungPresensi(r, aktifHukuman) })).filter((x) => (x.r.nama + x.r.nip).toLowerCase().includes(q.toLowerCase())).filter((x) => status === "semua" || x.status === status),
    [s.presensi, aktifHukuman, q, status]
  )
  const th = (h: string) => <th key={h} className="px-4 py-3 text-center font-medium first:text-left">{h}</th>

  return (
    <>
      <PageHeading
        title="Presensi & Cuti / Izin"
        desc="Import rekap presensi dan cuti/izin bulanan sebagai dasar perhitungan P1"
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => toast.info("Ekspor belum tersambung ke backend (dummy).")}><Download /> Export CSV</Button>
            <Button variant="outline" onClick={() => window.print()}><Printer /> Cetak</Button>
            <Button onClick={() => setImpor(true)}><Plus /> Import presensi</Button>
          </div>
        }
      />
      <div className="space-y-5">
        <Panel className="space-y-2 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-primary">Presensi {s.statusImpor.periode} berhasil diimport</p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs"><span>{s.statusImpor.pegawai} pegawai · {s.statusImpor.error} baris error · Siap untuk perhitungan</span><span className="text-muted-foreground">{s.statusImpor.waktu}</span></div>
          <div className="h-1.5 rounded-full bg-primary" />
          <p className="text-xs text-muted-foreground">Data telah diteruskan ke Bendahara untuk kalkulasi.</p>
        </Panel>

        <TabBar<"data" | "cuti" | "impor"> segmen aktif={tab} onChange={setTab} tabs={[["data", "Data Presensi"], ["cuti", "Rekap Cuti/Izin"], ["impor", "Riwayat Import"]]} />

        <Panel className="space-y-4 p-4">
          {tab === "data" && (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-60 flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Cari Nama/NIP" value={q} onChange={(e) => setQ(e.target.value)} /></div>
                <Input className="w-36 text-center" disabled value={periode} aria-label="Periode" />
                <Select value={status} onValueChange={setStatus}><SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="semua">Semua Status</SelectItem>{Object.keys(warnaStatus).map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent></Select>
              </div>
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full min-w-[48rem] text-xs">
                  <thead className="bg-muted/50 text-[11px] text-muted-foreground"><tr>{["NIP / Nama", "Hari Kerja", "Hadir", "Tidak hadir", "Cuti/izin", "Pot. Kehadiran", "Status Validasi", "Aksi"].map(th)}</tr></thead>
                  <tbody>
                    {rows.length === 0 && <tr><td colSpan={8} className="py-10 text-center text-muted-foreground">Tidak ada data yang cocok.</td></tr>}
                    {rows.map(({ r, pot, status: st }) => (
                      <tr key={r.nip} className="border-t text-center odd:bg-muted/20">
                        <td className="px-4 py-3 text-left"><p className="font-semibold">{r.nama}</p><p className="text-[10px] text-muted-foreground">{r.nip}</p></td>
                        <td className="px-4 py-3">{r.hariKerja}</td><td className="px-4 py-3">{r.hadir}</td><td className="px-4 py-3">{r.tidakHadir}</td><td className="px-4 py-3">{r.cuti}</td>
                        <td className="px-4 py-3">{persenStr(pot)}</td>
                        <td className="px-4 py-3"><Badge variant="outline" className={cn(warnaStatus[st])}>{st}</Badge></td>
                        <td className="px-4 py-3"><Button variant="outline" size="sm" onClick={() => setKoreksi(r)}>Edit</Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-between text-[11px] text-muted-foreground"><span>{rows.length} data ditampilkan · sesuai pencarian dan filter</span><span>Halaman 1 dari 1</span></div>
            </>
          )}

          {tab === "cuti" && (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full min-w-[40rem] text-xs">
                <thead className="bg-muted/50 text-[11px] text-muted-foreground"><tr>{["NIP / Nama", "Jenis", "Tanggal Mulai", "Tanggal Selesai", "Durasi", "Status Validasi"].map(th)}</tr></thead>
                <tbody>
                  {REKAP_CUTI.map((c) => (
                    <tr key={c.nip} className="border-t text-center odd:bg-muted/20">
                      <td className="px-4 py-3 text-left"><p className="font-semibold">{c.nama}</p><p className="text-[10px] text-muted-foreground">{c.nip}</p></td>
                      <td className="px-4 py-3">{c.jenis}</td><td className="px-4 py-3">{c.mulai}</td><td className="px-4 py-3">{c.selesai}</td><td className="px-4 py-3">{c.durasi}</td>
                      <td className="px-4 py-3"><Badge variant="outline" className="border-emerald-200 bg-emerald-100 text-emerald-800">Disetujui</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === "impor" && (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full min-w-[40rem] text-xs">
                <thead className="bg-muted/50 text-[11px] text-muted-foreground"><tr>{["Periode", "File", "Jml Pegawai", "Error", "Diimport Oleh", "Durasi", "Status Validasi"].map(th)}</tr></thead>
                <tbody>
                  {s.riwayatImpor.map((i, n) => (
                    <tr key={n} className="border-t text-center odd:bg-muted/20">
                      <td className="px-4 py-3 text-left">{i.periode}</td><td className="px-4 py-3">{i.file}</td><td className="px-4 py-3">{i.pegawai}</td><td className="px-4 py-3">{i.error}</td><td className="px-4 py-3">{i.oleh}</td><td className="px-4 py-3">{i.durasi}</td>
                      <td className="px-4 py-3"><Badge variant="outline" className="border-emerald-200 bg-emerald-100 text-emerald-800">{i.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>

      {koreksi && <KoreksiDialog baris={koreksi} onClose={() => setKoreksi(null)} />}
      {impor && <ImporDialog onClose={() => setImpor(false)} onSelesai={() => { setImpor(false); setTab("impor") }} />}
    </>
  )
}
