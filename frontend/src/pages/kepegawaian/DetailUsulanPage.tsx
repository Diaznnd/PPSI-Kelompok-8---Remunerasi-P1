import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { ArrowLeft, Download, FileText, Info, XCircle } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { AreaTeks, Bidang } from "@/components/kepegawaian/ui"
import { Stepper } from "@/components/bendahara/Stepper"
import { PageHeading, Panel } from "@/components/pegawai/shared"
import { warnaUsulan } from "@/components/kepegawaian/warna"
import { ajukanUlang, useKepeg } from "@/data/store-kepegawaian"
import { cn } from "@/lib/utils"

type Dok = { judul: string; berkas: string; ukuran: string }

function PratinjauDokumen({ dok, nama, onClose }: { dok: Dok; nama: string; onClose: () => void }) {
  const spmt = dok.judul === "SPMT"
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-xl!">
        <DialogHeader><DialogTitle>Pratinjau Dokumen - {dok.judul === "SPMT" ? "SPMT" : "SK Lektor Kepala"} {nama.replace(/^Dr\. /, "").replace(/,.*$/, "")}</DialogTitle></DialogHeader>
        <div className="max-h-[55vh] overflow-y-auto rounded-lg bg-muted p-4">
          <div className="mx-auto bg-white p-6 text-center text-[11px] text-black shadow-sm">
            <p className="font-bold">KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI</p>
            <p className="font-bold">UNIVERSITAS ANDALAS</p>
            <p className="mt-3 font-bold underline">{spmt ? "SPMT" : "SK LEKTOR KEPALA"} {nama.replace(/^Dr\. /, "").replace(/,.*$/, "").toUpperCase()}</p>
            <p>Nomor: 1482/UN16.R/KP/2026</p>
            <p className="mt-4 text-left">Menimbang bahwa yang bersangkutan, <b>{nama}</b>, telah memenuhi persyaratan angka kredit dan masa kerja untuk dinaikkan jabatan/grade sesuai ketentuan yang berlaku.</p>
            <p className="mt-2 text-left">Menetapkan perubahan jabatan/grade terhitung mulai tanggal yang tercantum pada lampiran {spmt ? "ini" : "keputusan ini"}.</p>
            <div className="my-4 space-y-1.5">{[100, 95, 90, 70].map((w) => <div key={w} className="h-1.5 rounded bg-gray-200" style={{ width: `${w}%` }} />)}</div>
            <p className="text-right">Padang, 12 September 2026</p>
            <p className="mt-3 text-right font-bold">Rektor Universitas Andalas</p>
          </div>
        </div>
        <DialogFooter><Button variant="outline" onClick={onClose}>Tutup</Button><Button onClick={() => toast.info("Unduh belum tersambung ke backend (dummy).")}><Download /> Unduh PDF</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function AjukanUlangDialog({ id, onClose }: { id: string; onClose: () => void }) {
  const [mulai, setMulai] = useState("")
  const [catatan, setCatatan] = useState("")
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md!">
        <DialogHeader><DialogTitle>Ajukan ulang usulan {id}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <Bidang label="Tanggal mulai berlaku (sesuai SPMT)" hint="Kosongkan bila tanggal pada usulan sudah benar."><Input type="date" value={mulai} onChange={(e) => setMulai(e.target.value)} /></Bidang>
          <Bidang label="Catatan perbaikan"><AreaTeks rows={3} value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="Jelaskan perbaikan yang dilakukan..." /></Bidang>
        </div>
        <DialogFooter><Button variant="outline" onClick={onClose}>Batal</Button><Button onClick={() => { ajukanUlang(id, mulai, catatan.trim()); toast.success("Usulan diajukan ulang ke Verifikator."); onClose() }}>Ajukan Ulang</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function DetailUsulanPage() {
  const { id } = useParams()
  const { usulan, pegawai } = useKepeg()
  const u = usulan.find((x) => x.id === id)
  const [dok, setDok] = useState<Dok | null>(null)
  const [ulang, setUlang] = useState(false)

  if (!u) {
    return <Panel><p className="text-sm">Usulan tidak ditemukan.</p><Button asChild variant="outline" className="mt-4"><Link to="/kepegawaian/usulan">Kembali</Link></Button></Panel>
  }
  const done = u.status === "Diajukan" || u.status === "Dikembalikan" ? 1 : u.status === "Disetujui Verifikator" ? 2 : 4
  const jenisDok: Dok[] = [{ judul: "SK jabatan/grade", berkas: u.sk, ukuran: "PDF • 1,2 MB" }, { judul: "SPMT", berkas: u.spmt, ukuran: "PDF • 832 KB" }]
  const peg = pegawai.find((p) => p.nip === u.nip)

  return (
    <>
      <Link to="/kepegawaian/usulan" className="mb-3 inline-flex items-center gap-1 text-xs text-primary hover:underline"><ArrowLeft className="size-3" /> Kembali <span className="text-muted-foreground">Usulan Jabatan/Grade</span></Link>
      <PageHeading title={`Usulan ${u.id}`} desc={`${u.nama} • ${u.nip}`} action={<Badge variant="outline" className={warnaUsulan[u.status]}>{u.status}</Badge>} />

      <div className="space-y-5">
        <Panel>
          <Stepper
            steps={["Diajukan", "Diperiksa Verifikator", "Penetapan UPT", "Riwayat resmi"]} done={done}
            notes={{ 0: <span className="text-[10px] text-muted-foreground">Bidang Kepegawaian</span>, 1: <span className="text-[10px] text-muted-foreground">Pemeriksaan dokumen</span>, 2: <span className="text-[10px] text-muted-foreground">UPT Remunerasi</span>, 3: <span className="text-[10px] text-muted-foreground">Dipakai perhitungan P1</span> }}
          />
        </Panel>

        {u.status === "Disetujui Verifikator" && (
          <div className="flex gap-2 rounded-xl border border-sky-200 bg-sky-50 p-4 text-xs text-sky-900"><Info className="mt-0.5 size-4 shrink-0" /><div><p className="font-semibold">Menunggu penetapan UPT Remunerasi</p><p>Usulan sudah disetujui Verifikator. Bidang Kepegawaian tidak dapat menetapkan; riwayat resmi diperbarui setelah UPT Remunerasi menetapkan.</p></div></div>
        )}
        {u.status === "Diajukan" && (
          <div className="flex gap-2 rounded-xl border border-sky-200 bg-sky-50 p-4 text-xs text-sky-900"><Info className="mt-0.5 size-4 shrink-0" /><div><p className="font-semibold">Menunggu pemeriksaan Verifikator</p><p>Usulan sedang diperiksa. Anda akan melihat hasilnya di halaman ini.</p></div></div>
        )}
        {u.status === "Dikembalikan" && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex gap-2 text-xs text-red-800"><XCircle className="mt-0.5 size-4 shrink-0" /><div><p className="font-semibold">Dikembalikan Verifikator</p><p>{u.catatanKembali}</p></div></div>
            <Button size="sm" onClick={() => setUlang(true)}>Perbaiki dan Ajukan Ulang</Button>
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-2">
          <Panel>
            <h2 className="font-semibold">Perubahan</h2>
            <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <div className="rounded-lg bg-muted/60 p-3"><p className="text-[10px] text-muted-foreground">Lama</p><p className="text-sm font-semibold">{u.lama.jabatan || "Belum ada"}</p><p className="text-[11px] text-muted-foreground">{u.lama.grade ? `Grade ${u.lama.grade}` : ""}</p></div>
              <span className="text-muted-foreground">→</span>
              <div className="rounded-lg bg-primary/10 p-3"><p className="text-[10px] text-muted-foreground">Baru</p><p className="text-sm font-semibold">{u.baru.jabatan}</p><p className="text-[11px] text-muted-foreground">Grade {u.baru.grade}</p></div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 rounded-lg border p-3 text-xs"><div><p className="text-[10px] text-muted-foreground">Jenis</p><p className="font-semibold">{u.jenis}</p></div><div><p className="text-[10px] text-muted-foreground">Mulai berlaku</p><p className="font-semibold">{u.mulai}</p></div></div>
            <p className="mt-3 text-xs"><b>Alasan:</b> <span className="text-muted-foreground">{u.alasan}</span></p>
          </Panel>

          <Panel>
            <h2 className="font-semibold">Dokumen pendukung</h2>
            <div className="mt-4 space-y-3">
              {jenisDok.map((d) => (
                <div key={d.judul} className="flex items-center gap-3 rounded-lg border p-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded bg-red-50 text-red-600"><FileText className="size-4" /></span>
                  <div className="min-w-0 flex-1"><p className="text-[10px] text-muted-foreground">{d.judul}</p><p className="truncate text-xs font-semibold">{d.berkas}</p><p className="text-[10px] text-muted-foreground">{d.ukuran}</p></div>
                  <button className="text-xs font-semibold text-primary hover:underline" onClick={() => setDok(d)}>Lihat</button>
                </div>
              ))}
            </div>
          </Panel>

          <Panel>
            <h2 className="font-semibold">Riwayat status</h2>
            <ol className="mt-4 space-y-4">
              {u.jejak.map((j, i) => (
                <li key={i} className="flex gap-3 text-xs">
                  <span className={cn("mt-1 size-2 shrink-0 rounded-full", j.label.startsWith("Dikembalikan") ? "bg-red-500" : "bg-primary")} />
                  <div><p className="font-semibold">{j.label} oleh {j.oleh}</p><p className="text-[10px] text-muted-foreground">{j.waktu}</p>{j.catatan && <p className="mt-1 text-[11px] text-muted-foreground">Catatan: {j.catatan}</p>}</div>
                </li>
              ))}
            </ol>
          </Panel>

          <Panel className="p-0">
            <div className="flex items-center justify-between p-5 pb-3"><h2 className="font-semibold">Riwayat jabatan/grade pegawai</h2><Link to="/kepegawaian/pegawai" className="text-xs font-semibold text-primary hover:underline">Lihat data pegawai</Link></div>
            <table className="w-full text-xs">
              <thead className="bg-muted/50 text-left text-[11px] text-muted-foreground"><tr>{["Jabatan", "Grade", "Mulai berlaku", "Berakhir", "Keterangan"].map((h) => <th key={h} className="px-4 py-2 font-medium">{h}</th>)}</tr></thead>
              <tbody>
                <tr className="border-t"><td className="px-4 py-3">{peg?.jabatan || u.lama.jabatan}</td><td className="px-4 py-3">Grade {peg?.grade || u.lama.grade}</td><td className="px-4 py-3">1 Januari 2022</td><td className="px-4 py-3 text-muted-foreground">Sekarang</td><td className="px-4 py-3"><Badge variant="outline" className="border-emerald-200 bg-emerald-100 text-emerald-800">Berlaku</Badge></td></tr>
                <tr className="border-t"><td className="px-4 py-3">Asisten Ahli</td><td className="px-4 py-3">Grade 9</td><td className="px-4 py-3">1 Maret 2018</td><td className="px-4 py-3">31 Desember 2021</td><td className="px-4 py-3"><Badge variant="secondary">Riwayat lama</Badge></td></tr>
              </tbody>
            </table>
          </Panel>
        </div>
      </div>

      {dok && <PratinjauDokumen dok={dok} nama={u.nama} onClose={() => setDok(null)} />}
      {ulang && <AjukanUlangDialog id={u.id} onClose={() => setUlang(false)} />}
    </>
  )
}
