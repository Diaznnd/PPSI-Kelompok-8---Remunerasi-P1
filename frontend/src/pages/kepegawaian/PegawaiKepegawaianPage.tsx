import { useEffect, useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, Download, Loader2, Plus, Search, UserCheck, UserMinus, UserRoundX, Users, type LucideIcon } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar } from "@/components/kepegawaian/ui"
import { FormPegawaiDialog, NonaktifkanDialog, TugasBelajarDialog } from "@/components/kepegawaian/PegawaiDialogs"
import { PageHeading, Panel } from "@/components/pegawai/shared"
import { JENIS_PEGAWAI, STATUS_PEGAWAI, pengaliDari, type PegawaiKep } from "@/data/dummy-kepegawaian"
import { aktifkanPegawai, useKepeg } from "@/data/store-kepegawaian"
import { kepegawaianService } from "@/services/kepegawaianService"

const UKURAN = 8

export default function PegawaiKepegawaianPage() {
  const { pegawai: pegawaiDummy } = useKepeg()
  const [loading, setLoading] = useState(true)
  const [pegawai, setPegawai] = useState<any[]>([])
  const [unitKerja, setUnitKerja] = useState<string>("")
  const [q, setQ] = useState("")
  const [jenis, setJenis] = useState("semua")
  const [status, setStatus] = useState("semua")
  const [aktif, setAktif] = useState("aktif")
  const [hal, setHal] = useState(1)
  const [form, setForm] = useState<"baru" | PegawaiKep | null>(null)
  const [nonaktif, setNonaktif] = useState<PegawaiKep | null>(null)
  const [tubel, setTubel] = useState<PegawaiKep | null>(null)

  // Fetch data pegawai dari API
  const fetchPegawai = async () => {
    try {
      setLoading(true)
      const res = await kepegawaianService.getPegawaiList()
      
      // Map API response to frontend format
      const mappedData = res.data.map((p: any) => ({
        nip: p.NIP,
        nama: p.nama,
        jenis: p.jenis,
        status: p.status_kepegawaian,
        status_tugas_belajar: p.status_tugas_belajar,
        golongan: p.pangkat_golongan,
        jabatan: p.jabatan?.nama || null,
        grade: p.jabatan?.grade_nama || null,
        aktif: p.aktif,
        email: p.email || "",
        unit_id: p.unit_id,
        unit_nama: p.unit_nama,
        persen_hak_p1: p.persen_hak_p1,
        sk_tugas_belajar: p.sk_tugas_belajar,
        tgl_mulai_tubel: p.tgl_mulai_tubel,
        tgl_selesai_tubel: p.tgl_selesai_tubel,
      }))
      
      setPegawai(mappedData)
      setUnitKerja(res.unit_kerja || "")
    } catch (error) {
      console.error("Error fetching pegawai:", error)
      toast.error("Gagal memuat data pegawai. Menggunakan data dummy.")
      // Fallback to dummy data
      setPegawai(pegawaiDummy)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPegawai()
  }, [pegawaiDummy])

  const hasil = useMemo(() => pegawai
    .filter((p) => (p.nama + p.nip + p.email).toLowerCase().includes(q.toLowerCase()))
    .filter((p) => jenis === "semua" || p.jenis === jenis)
    .filter((p) => status === "semua" || p.status === status)
    .filter((p) => aktif === "semua" || (aktif === "aktif") === p.aktif), [pegawai, q, jenis, status, aktif])
  const totalHal = Math.max(1, Math.ceil(hasil.length / UKURAN))
  const halaman = Math.min(hal, totalHal)
  const mulai = (halaman - 1) * UKURAN
  const tampil = hasil.slice(mulai, mulai + UKURAN)
  const f = (set: (v: string) => void) => (v: string) => { set(v); setHal(1) }

  const kartu: [number, string, LucideIcon][] = [
    [pegawai.length, "Total pegawai terdaftar", Users],
    [pegawai.filter((p) => p.aktif).length, "Aktif ikut perhitungan P1", UserCheck],
    [pegawai.filter((p) => p.aktif && !p.jabatan).length, "Belum punya jabatan/grade", UserMinus],
    [pegawai.filter((p) => !p.aktif).length, "Nonaktif (tidak dihitung)", UserRoundX],
  ]

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <>
      <PageHeading
        title="Data Pegawai"
        desc={`Kelola identitas pegawai ${unitKerja}. Jabatan dan grade hanya berubah melalui usulan yang ditetapkan UPT Remunerasi.`}
        action={<Button onClick={() => setForm("baru")}><Plus /> Tambah Pegawai</Button>}
      />
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {kartu.map(([n, l, Icon]) => (
            <Panel key={l} className="flex items-center gap-3 p-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="size-4" /></span>
              <div><p className="text-xl font-bold leading-none">{n}</p><p className="mt-1 text-[10px] text-muted-foreground">{l}</p></div>
            </Panel>
          ))}
        </div>

        <Panel className="space-y-4 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-60 flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Cari nama, NIP, atau email" value={q} onChange={(e) => { setQ(e.target.value); setHal(1) }} /></div>
            <Select value={jenis} onValueChange={f(setJenis)}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="semua">Semua jenis</SelectItem>{JENIS_PEGAWAI.map((j) => <SelectItem key={j} value={j}>{j}</SelectItem>)}</SelectContent></Select>
            <Select value={status} onValueChange={f(setStatus)}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="semua">Semua status</SelectItem>{STATUS_PEGAWAI.map(([k]) => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent></Select>
            <Select value={aktif} onValueChange={f(setAktif)}><SelectTrigger className="w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="aktif">Aktif</SelectItem><SelectItem value="nonaktif">Nonaktif</SelectItem><SelectItem value="semua">Semua</SelectItem></SelectContent></Select>
            <Button variant="outline" onClick={() => toast.info("Ekspor belum tersambung ke backend (dummy).")}><Download /> Ekspor</Button>
          </div>

          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[56rem] text-xs">
              <thead className="bg-muted/50 text-left text-[11px] text-muted-foreground">
                <tr>{["Pegawai", "Jenis", "Status kepegawaian", "Gol.", "Jabatan/grade berlaku", "Status", "Aksi"].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
              </thead>
              <tbody>
                {tampil.length === 0 && <tr><td colSpan={7} className="py-10 text-center text-muted-foreground">Tidak ada pegawai yang cocok dengan filter ini.</td></tr>}
                {tampil.map((p) => (
                  <tr key={p.nip} className="border-t odd:bg-muted/20">
                    <td className="px-4 py-3"><div className="flex items-center gap-2.5"><Avatar nama={p.nama} /><div><p className="font-semibold">{p.nama}</p><p className="text-[10px] text-muted-foreground">{p.nip}</p></div></div></td>
                    <td className="px-4 py-3">{p.jenis}</td>
                    <td className="px-4 py-3">
                      <p>{p.status}</p>
                      {p.status_tugas_belajar === "tugas_belajar" ? (
                        <span className="inline-block mt-0.5 rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-semibold text-sky-800">
                          Tugas Belajar (60%)
                        </span>
                      ) : (
                        <p className="text-[10px] text-muted-foreground">Pengali {pengaliDari(p.status)}%</p>
                      )}
                    </td>
                    <td className="px-4 py-3">{p.golongan}</td>
                    <td className="px-4 py-3">{p.jabatan ? <><p>{p.jabatan}</p><p className="text-[10px] text-muted-foreground">Grade {p.grade}</p></> : <span className="text-muted-foreground">Belum ada</span>}</td>
                    <td className="px-4 py-3">{p.aktif ? <Badge variant="outline" className="border-emerald-200 bg-emerald-100 text-emerald-800">Aktif</Badge> : <Badge variant="secondary">Nonaktif</Badge>}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-semibold">
                      <button className="text-primary hover:underline" onClick={() => setForm(p)}>Ubah</button>
                      <button className="ml-3 text-sky-600 hover:underline" onClick={() => setTubel(p)}>Status Tubel</button>
                      {p.aktif
                        ? <button className="ml-3 text-destructive hover:underline" onClick={() => setNonaktif(p)}>Nonaktifkan</button>
                        : <button className="ml-3 text-primary hover:underline" onClick={() => { aktifkanPegawai(p.nip); toast.success(`${p.nama} diaktifkan kembali.`) }}>Aktifkan</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
            <span>Menampilkan {hasil.length === 0 ? 0 : mulai + 1}-{mulai + tampil.length} dari {hasil.length} data</span>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" disabled={halaman <= 1} onClick={() => setHal(halaman - 1)} aria-label="Sebelumnya"><ChevronLeft className="size-4" /></Button>
              {Array.from({ length: totalHal }, (_, i) => i + 1).map((n) => <Button key={n} size="icon" variant={n === halaman ? "default" : "outline"} onClick={() => setHal(n)}>{n}</Button>)}
              <Button variant="outline" size="icon" disabled={halaman >= totalHal} onClick={() => setHal(halaman + 1)} aria-label="Berikutnya"><ChevronRight className="size-4" /></Button>
            </div>
          </div>
        </Panel>
      </div>

      {form && <FormPegawaiDialog pegawai={form === "baru" ? undefined : form} onClose={() => setForm(null)} />}
      {nonaktif && <NonaktifkanDialog pegawai={nonaktif} onClose={() => setNonaktif(null)} />}
      {tubel && <TugasBelajarDialog pegawai={tubel} onClose={() => setTubel(null)} onSuccess={fetchPegawai} />}
    </>
  )
}
