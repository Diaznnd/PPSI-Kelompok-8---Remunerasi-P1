import { useEffect, useMemo, useState } from "react"
import { CheckCircle2, Clock, Download, Plus, Printer, RefreshCw, Search, TriangleAlert, XCircle } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AreaTeks, Bidang, Dropzone, TabBar } from "@/components/kepegawaian/ui"
import { PageHeading, Panel } from "@/components/pegawai/shared"
import { usePeriodeKepeg } from "@/layouts/KepegawaianShell"
import { REKAP_CUTI, hitungPresensi, statusHukuman, type BarisPresensi } from "@/types/kepegawaian"
import { persenStr } from "@/types/bendahara"
import { imporPresensi, koreksiPresensi, useKepeg } from "@/data/store-kepegawaian"
import { kepegawaianService } from "@/services/kepegawaianService"
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

function KoreksiDialog({ baris, periode, reportId, isBarisGagal, onClose, onSuccess }: { baris: any; periode?: string; reportId?: number; isBarisGagal?: boolean; onClose: () => void; onSuccess?: () => void }) {
  const [nip, setNip] = useState(String(baris.nip || ""))
  const [hk, setHk] = useState(String(baris.hariKerja ?? 22))
  const [hadir, setHadir] = useState(String(baris.hadir ?? 0))
  const [tidak, setTidak] = useState(String(baris.tidakHadir ?? 0))
  const [cuti, setCuti] = useState(String(baris.cuti ?? 0))
  const [alasan, setAlasan] = useState("")
  const [galat, setGalat] = useState("")
  const [saving, setSaving] = useState(false)

  const simpan = async () => {
    if (angka(hadir) + angka(tidak) + angka(cuti) !== angka(hk)) return setGalat("Hadir + Tidak Hadir + Cuti/Izin harus sama dengan Hari Kerja.")
    if (alasan.trim().length < 5) return setGalat("Alasan koreksi wajib diisi (minimal 5 karakter).")
    setSaving(true)
    setGalat("")
    try {
      if (isBarisGagal && reportId !== undefined) {
        await kepegawaianService.koreksiBarisGagal(reportId, baris.index ?? 0, {
          NIP: nip.trim(),
          hari_kerja: angka(hk),
          hadir: angka(hadir),
          tidak_hadir: angka(tidak),
          cuti: angka(cuti),
          alasan: alasan.trim(),
        })
        toast.success("Baris presensi gagal berhasil dikoreksi dan masuk ke rekap valid.")
      } else {
        await kepegawaianService.koreksiPresensi(baris.nip, {
          periode,
          hariKerja: angka(hk),
          hadir: angka(hadir),
          tidakHadir: angka(tidak),
          cuti: angka(cuti),
          alasan: alasan.trim(),
        })
        koreksiPresensi(baris.nip, { hariKerja: angka(hk), hadir: angka(hadir), tidakHadir: angka(tidak), cuti: angka(cuti) })
        toast.success("Koreksi presensi disimpan.")
      }
      onSuccess?.()
      onClose()
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.errors?.NIP?.[0] || err?.response?.data?.errors?.hadir?.[0]
      if (msg) {
        setGalat(msg)
        toast.error(msg)
      } else {
        koreksiPresensi(baris.nip, { hariKerja: angka(hk), hadir: angka(hadir), tidakHadir: angka(tidak), cuti: angka(cuti) })
        toast.success("Koreksi presensi disimpan (mode lokal).")
        onSuccess?.()
        onClose()
      }
    } finally {
      setSaving(false)
    }
  }
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-xl!">
        <DialogHeader><DialogTitle>{isBarisGagal ? "Koreksi Baris Presensi Gagal" : "Koreksi Data Presensi"}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          {isBarisGagal ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Bidang label="NIP Pegawai (koreksi jika salah)"><Input value={nip} onChange={(e) => setNip(e.target.value)} /></Bidang>
              <Bidang label="Nama pada baris impor"><Input value={baris.nama} disabled /></Bidang>
            </div>
          ) : (
            <Bidang label="Pegawai"><Input value={baris.nama} disabled /></Bidang>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Bidang label="Hari Kerja (bulan ini)"><Input type="number" min={0} value={hk} onChange={(e) => setHk(e.target.value)} /></Bidang>
            <Bidang label="Hari Hadir"><Input type="number" min={0} value={hadir} onChange={(e) => setHadir(e.target.value)} /></Bidang>
            <Bidang label="Tidak Hadir"><Input type="number" min={0} value={tidak} onChange={(e) => setTidak(e.target.value)} /></Bidang>
            <Bidang label="Cuti/Izin Resmi"><Input type="number" min={0} value={cuti} onChange={(e) => setCuti(e.target.value)} /></Bidang>
          </div>
          <Bidang label="Alasan Koreksi"><AreaTeks rows={3} value={alasan} onChange={(e) => setAlasan(e.target.value)} placeholder="Tuliskan alasan koreksi secara rinci ..." /></Bidang>
          {galat && <p className="text-xs text-destructive">{galat}</p>}
        </div>
        <DialogFooter><Button variant="outline" onClick={onClose} disabled={saving}>Batal</Button><Button onClick={simpan} disabled={saving}>{saving ? "Menyimpan..." : "Simpan Koreksi"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ImporDialog({ onClose, onSelesai }: { onClose: () => void; onSelesai: () => void }) {
  const [periode, setPeriode] = useState("")
  const [berkas, setBerkas] = useState<string | null>(null)
  const [fileObj, setFileObj] = useState<File | undefined>(undefined)
  const [saving, setSaving] = useState(false)

  async function prosesImpor() {
    if (!periode || !berkas) return
    setSaving(true)
    try {
      const res = await kepegawaianService.importPresensi({
        periode,
        file: fileObj,
        nama_file: berkas,
      })
      imporPresensi(periode, berkas)
      toast.success(res?.message || "Import presensi berhasil.")
      onSelesai()
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.errors?.file?.[0]
      if (msg) {
        toast.error(msg)
      } else {
        imporPresensi(periode, berkas)
        toast.success("Import berhasil (mode lokal).")
        onSelesai()
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-xl!">
        <DialogHeader><DialogTitle>Import Rekap Presensi & Cuti/Izin</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <Bidang label="Periode *">
            <Select value={periode} onValueChange={setPeriode}><SelectTrigger className="w-full"><SelectValue placeholder="Pilih periode" /></SelectTrigger>
              <SelectContent>{DAFTAR_PERIODE.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select>
          </Bidang>
          <p className="rounded-md bg-sky-50 px-3 py-2 text-center text-xs font-semibold text-sky-700">Pastikan format file sesuai template (.csv / .xlsx). Kolom wajib: NIP, Nama, Hari Kerja, Hadir, Tidak Hadir, Cuti, Izin.</p>
          <Bidang label="File CSV / Excel (.csv, .xlsx) *">
            <Dropzone
              nama={berkas} onFile={(f) => { setBerkas(f.name); setFileObj(f) }} onHapus={() => { setBerkas(null); setFileObj(undefined) }} accept=".csv,.xlsx,.xls" petunjuk="Format: .csv atau .xlsx · Maks. 10 MB" className="py-8"
              cek={(f) => (!/\.(csv|xlsx|xls)$/i.test(f.name) ? "Berkas harus berformat .csv atau .xlsx (NFR-11)." : f.size > 10 * 1024 * 1024 ? "Ukuran berkas maksimal 10 MB." : null)}
              contoh={() => { setBerkas("presensi_contoh.xlsx"); setFileObj(undefined) }}
            />
          </Bidang>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Batal</Button>
          <Button disabled={!periode || !berkas || saving} onClick={prosesImpor}>{saving ? "Mengimpor..." : "Mulai Import"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function PresensiCutiPage() {
  const s = useKepeg()
  const { periode: periodeDefault } = usePeriodeKepeg()
  const [periode, setPeriode] = useState(periodeDefault || "Oktober 2026")
  const [tab, setTab] = useState<"data" | "cuti" | "impor">("data")
  const [q, setQ] = useState("")
  const [status, setStatus] = useState("semua")
  const [koreksi, setKoreksi] = useState<{ baris: any; isGagal?: boolean } | null>(null)
  const [impor, setImpor] = useState(false)
  const [apiData, setApiData] = useState<any | null>(null)

  const fetchPresensi = async () => {
    try {
      const res = await kepegawaianService.getPresensi({ periode })
      setApiData(res)
    } catch {
      setApiData(null)
    }
  }

  useEffect(() => {
    fetchPresensi()
  }, [periode])

  const aktifHukuman = useMemo(() => new Set(s.hukuman.filter((h) => statusHukuman(h) === "Aktif").map((h) => h.nip)), [s.hukuman])
  const daftarPresensi: BarisPresensi[] = apiData?.data || s.presensi
  const daftarCuti = apiData?.rekap_cuti?.length ? apiData.rekap_cuti : REKAP_CUTI
  const daftarRiwayatImpor = apiData?.riwayat_impor?.length ? apiData.riwayat_impor : s.riwayatImpor
  const statusImporAktif = apiData?.status_impor || s.statusImpor
  const barisGagalList: any[] = apiData?.baris_gagal || []
  const reportIdAktif: number | undefined = apiData?.report_id
  const approvalData = apiData?.approval
  const statusApproval: string = approvalData?.status || "draft"

  const rows = useMemo(
    () => daftarPresensi.map((r: any) => ({ r, ...(r.status && r.pot !== undefined ? { pot: r.pot, status: r.status } : hitungPresensi(r, aktifHukuman)) }))
      .filter((x) => (x.r.nama + x.r.nip).toLowerCase().includes(q.toLowerCase()))
      .filter((x) => status === "semua" || x.status === status),
    [daftarPresensi, aktifHukuman, q, status]
  )
  const th = (h: string) => <th key={h} className="px-4 py-3 text-center font-medium first:text-left">{h}</th>

  return (
    <>
      <PageHeading
        title={`Presensi & Cuti / Izin — Periode ${periode}`}
        desc={`Rekap presensi & cuti/izin bulanan yang digunakan sebagai dasar perhitungan P1 periode ${periode}. Data ini akan divalidasi oleh Penanggung Jawab Unit sebelum perhitungan dimulai.`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Select value={periode} onValueChange={setPeriode}>
              <SelectTrigger className="w-44 text-xs">
                <SelectValue placeholder="Pilih periode P1" />
              </SelectTrigger>
              <SelectContent>
                {DAFTAR_PERIODE.map((p) => (
                  <SelectItem key={p} value={p}>
                    P1: {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => toast.info("Fitur ekspor akan segera tersedia.")}><Download /> Export CSV</Button>
            <Button variant="outline" onClick={() => window.print()}><Printer /> Cetak</Button>
            <Button onClick={() => setImpor(true)}><Plus /> Import presensi</Button>
          </div>
        }
      />
      <div className="space-y-5">
        {/* Banner Status Approval PJ Unit */}
        {statusApproval === "ditolak" && (
          <div className="rounded-xl border border-red-300 bg-red-50/80 p-4 shadow-xs dark:border-red-900/60 dark:bg-red-950/30">
            <div className="flex items-start gap-3">
              <XCircle className="mt-0.5 size-5 shrink-0 text-red-600 dark:text-red-400" />
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-semibold text-sm text-red-900 dark:text-red-200">
                    Rekap Presensi Ditolak oleh Penanggung Jawab Unit
                  </h4>
                  <Badge variant="outline" className="border-red-300 bg-red-100 text-red-800 font-semibold">
                    Status: Ditolak
                  </Badge>
                </div>
                <div className="rounded-lg border border-red-200 bg-white/80 p-3 text-xs text-red-900 dark:border-red-900/40 dark:bg-red-950/50 dark:text-red-200">
                  <p className="font-semibold text-[11px] uppercase tracking-wider text-red-700 dark:text-red-300">
                    Catatan Alasan Penolakan:
                  </p>
                  <p className="mt-1">
                    {approvalData?.alasan_penolakan || "Terdapat ketidaksesuaian data presensi. Mohon lakukan perbaikan dan unggah ulang berkas rekap presensi."}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-red-800 dark:text-red-300">
                  <span>Perhitungan P1 oleh Bendahara diblokir hingga berkas diperbaiki dan disetujui ulang.</span>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="gap-2"
                    onClick={() => setImpor(true)}
                  >
                    <RefreshCw className="size-3.5" />
                    Unggah Ulang Perbaikan Presensi
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {statusApproval === "menunggu_approval" && (
          <div className="rounded-xl border border-amber-300 bg-amber-50/80 p-4 shadow-xs dark:border-amber-900/60 dark:bg-amber-950/30">
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-semibold text-sm text-amber-900 dark:text-amber-200">
                    Menunggu Persetujuan Penanggung Jawab Unit
                  </h4>
                  <Badge variant="outline" className="border-amber-300 bg-amber-100 text-amber-800 font-semibold">
                    Menunggu Approval
                  </Badge>
                </div>
                <p className="text-xs text-amber-800 dark:text-amber-300">
                  Data rekap presensi periode <strong>{periode}</strong> telah berhasil divalidasi. Perhitungan P1 oleh Bendahara saat ini <strong>terkunci</strong> hingga disetujui oleh Penanggung Jawab Unit.
                </p>
              </div>
            </div>
          </div>
        )}

        {statusApproval === "disetujui" && (
          <div className="rounded-xl border border-emerald-300 bg-emerald-50/80 p-4 shadow-xs dark:border-emerald-900/60 dark:bg-emerald-950/30">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-semibold text-sm text-emerald-900 dark:text-emerald-200">
                    Rekap Presensi Telah Disetujui PJ Unit
                  </h4>
                  <Badge variant="outline" className="border-emerald-300 bg-emerald-100 text-emerald-800 font-semibold">
                    Disetujui & Siap Hitung
                  </Badge>
                </div>
                <p className="text-xs text-emerald-800 dark:text-emerald-300">
                  Disetujui {approvalData?.approved_by ? `oleh ${approvalData.approved_by}` : ""} {approvalData?.approved_at ? `pada ${approvalData.approved_at}` : ""}. Bendahara unit kini telah diizinkan memproses kalkulasi P1.
                </p>
                {approvalData?.catatan_approval && (
                  <p className="text-[11px] italic text-emerald-700 dark:text-emerald-400">
                    Catatan PJ Unit: &ldquo;{approvalData.catatan_approval}&rdquo;
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <Panel className="space-y-2 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-primary">Presensi {statusImporAktif.periode} {statusImporAktif.pegawai > 0 ? "Tersimpan" : "Belum Diimpor"}</p>
            <Badge variant="outline" className={cn(
              statusApproval === "disetujui" ? "border-emerald-300 bg-emerald-100 text-emerald-800" :
              statusApproval === "ditolak" ? "border-red-300 bg-red-100 text-red-800" :
              statusApproval === "menunggu_approval" ? "border-amber-300 bg-amber-100 text-amber-800" :
              "border-slate-300 bg-slate-100 text-slate-800"
            )}>
              {statusApproval === "disetujui" ? "Persetujuan: Disetujui" :
               statusApproval === "ditolak" ? "Persetujuan: Ditolak" :
               statusApproval === "menunggu_approval" ? "Persetujuan: Menunggu Review" :
               "Persetujuan: Belum Diajukan"}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span>{statusImporAktif.pegawai} pegawai · {statusImporAktif.error} baris error</span>
            <span className="text-muted-foreground">{statusImporAktif.waktu}</span>
          </div>
          <div className="h-1.5 rounded-full bg-primary/20 overflow-hidden">
            <div className={cn(
              "h-full rounded-full transition-all",
              statusApproval === "disetujui" ? "bg-emerald-600 w-full" :
              statusApproval === "ditolak" ? "bg-red-600 w-1/3" :
              statusApproval === "menunggu_approval" ? "bg-amber-500 w-2/3" :
              "bg-primary w-1/4"
            )} />
          </div>
          <p className="text-xs text-muted-foreground">
            {statusApproval === "disetujui"
              ? "Data presensi telah disetujui. Bendahara dapat melakukan kalkulasi P1."
              : statusApproval === "ditolak"
              ? "Data presensi ditolak oleh Penanggung Jawab Unit. Perhitungan diblokir."
              : "Status approval presensi mengontrol izin kalkulasi P1 di Bendahara."}
          </p>
        </Panel>

        {barisGagalList.length > 0 && (
          <Panel className="space-y-3 border-amber-300 bg-amber-50/60 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-900">
              <TriangleAlert className="size-4 text-amber-600" />
              <span>{barisGagalList.length} Baris Presensi Gagal Validasi pada Periode {periode} (Perlu Koreksi Sebelum Perhitungan P1)</span>
            </div>
            <div className="overflow-x-auto rounded-lg border bg-card">
              <table className="w-full text-xs">
                <thead className="bg-muted/50 text-left text-[11px] text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">Baris</th>
                    <th className="px-3 py-2">NIP / Nama</th>
                    <th className="px-3 py-2">Hari Kerja / Hadir / Tidak Hadir / Cuti</th>
                    <th className="px-3 py-2">Alasan Gagal</th>
                    <th className="px-3 py-2">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {barisGagalList.map((bg, i) => (
                    <tr key={i} className="border-t">
                      <td className="px-3 py-2">#{bg.baris}</td>
                      <td className="px-3 py-2"><p className="font-semibold">{bg.nama}</p><p className="text-[10px] text-muted-foreground">{bg.nip || "(NIP kosong)"}</p></td>
                      <td className="px-3 py-2">{bg.hariKerja} HK · {bg.hadir} H · {bg.tidakHadir} TH · {bg.cuti} C</td>
                      <td className="px-3 py-2 text-destructive">{bg.alasan}</td>
                      <td className="px-3 py-2">
                        <Button size="sm" variant="outline" onClick={() => setKoreksi({ baris: bg, isGagal: true })}>Koreksi Baris</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        )}

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
                        <td className="px-4 py-3"><Button variant="outline" size="sm" onClick={() => setKoreksi({ baris: r, isGagal: false })}>Edit</Button></td>
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
                  {daftarCuti.map((c: any, idx: number) => (
                    <tr key={c.nip + idx} className="border-t text-center odd:bg-muted/20">
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
              <table className="w-full min-w-[48rem] text-xs">
                <thead className="bg-muted/50 text-[11px] text-muted-foreground">
                  <tr>{["Periode", "File", "Jml Pegawai", "Error", "Diimport Oleh", "Durasi", "Status Validasi", "Approval PJ Unit"].map(th)}</tr>
                </thead>
                <tbody>
                  {daftarRiwayatImpor.map((i: any, n: number) => {
                    const stApp = i.status_approval || "draft"
                    return (
                      <tr key={n} className="border-t text-center odd:bg-muted/20">
                        <td className="px-4 py-3 text-left font-medium">{i.periode}</td>
                        <td className="px-4 py-3">{i.file}</td>
                        <td className="px-4 py-3">{i.pegawai}</td>
                        <td className="px-4 py-3">{i.error}</td>
                        <td className="px-4 py-3">{i.oleh}</td>
                        <td className="px-4 py-3">{i.durasi}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={i.error > 0 ? "border-amber-200 bg-amber-100 text-amber-800" : "border-emerald-200 bg-emerald-100 text-emerald-800"}>
                            {i.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={cn(
                            stApp === "disetujui" ? "border-emerald-300 bg-emerald-100 text-emerald-800" :
                            stApp === "ditolak" ? "border-red-300 bg-red-100 text-red-800" :
                            stApp === "menunggu_approval" ? "border-amber-300 bg-amber-100 text-amber-800" :
                            "border-slate-300 bg-slate-100 text-slate-800"
                          )}>
                            {stApp === "disetujui" ? "Disetujui" :
                             stApp === "ditolak" ? "Ditolak" :
                             stApp === "menunggu_approval" ? "Menunggu" :
                             "Draft"}
                          </Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>

      {koreksi && <KoreksiDialog baris={koreksi.baris} periode={periode} reportId={reportIdAktif} isBarisGagal={koreksi.isGagal} onClose={() => setKoreksi(null)} onSuccess={fetchPresensi} />}
      {impor && <ImporDialog onClose={() => setImpor(false)} onSelesai={() => { setImpor(false); setTab("impor"); fetchPresensi() }} />}
    </>
  )
}
