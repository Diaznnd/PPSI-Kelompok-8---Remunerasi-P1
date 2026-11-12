import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageHeading, Panel } from "@/components/pegawai/shared"
import { PEGAWAI_UNIT, pjUnit } from "@/data/dummy-pjunit"

const UKURAN = 10
const unik = <T,>(a: T[]) => [...new Set(a)]
const GRADE_KARTU = [8, 9, 10, 11]

export default function DataPegawaiPage() {
  const [q, setQ] = useState("")
  const [status, setStatus] = useState("semua")
  const [jabatan, setJabatan] = useState("semua")
  const [grade, setGrade] = useState("semua")
  const [aktif, setAktif] = useState("semua")
  const [hal, setHal] = useState(1)

  const hasil = useMemo(
    () =>
      PEGAWAI_UNIT.filter((p) => (p.nama + p.nip).toLowerCase().includes(q.toLowerCase()))
        .filter((p) => status === "semua" || p.status === status)
        .filter((p) => jabatan === "semua" || p.jabatan === jabatan)
        .filter((p) => grade === "semua" || p.grade === Number(grade))
        .filter((p) => aktif === "semua" || (aktif === "aktif") === p.aktif),
    [q, status, jabatan, grade, aktif]
  )
  const totalHal = Math.max(1, Math.ceil(hasil.length / UKURAN))
  const halaman = Math.min(hal, totalHal)
  const mulai = (halaman - 1) * UKURAN
  const tampil = hasil.slice(mulai, mulai + UKURAN)

  // setiap filter berubah, kembali ke halaman 1
  const filter = (set: (v: string) => void) => (v: string) => { set(v); setHal(1) }

  const Pilih = ({ label, nilai, ubah, semua, opsi, lebar }: { label: string; nilai: string; ubah: (v: string) => void; semua: string; opsi: [string, string][]; lebar: string }) => (
    <div className="space-y-1.5">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <Select value={nilai} onValueChange={filter(ubah)}>
        <SelectTrigger className={lebar}><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="semua">{semua}</SelectItem>
          {opsi.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  )

  return (
    <>
      <PageHeading title="Data Pegawai dan Jabatan" desc={pjUnit.unit} />

      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-4">
          {GRADE_KARTU.map((g) => (
            <Panel key={g} className="flex items-center justify-between p-4">
              <span className="text-xs text-muted-foreground">Grade {g}</span>
              <span className="text-xl font-bold text-primary">{PEGAWAI_UNIT.filter((p) => p.grade === g).length}<span className="ml-1 text-[10px] font-normal text-muted-foreground">pegawai</span></span>
            </Panel>
          ))}
        </div>

        <Panel className="space-y-4 p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="min-w-60 flex-1 space-y-1.5">
              <p className="text-[11px] text-muted-foreground">Cari NIP atau nama</p>
              <div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Ketik NIP atau nama pegawai..." value={q} onChange={(e) => { setQ(e.target.value); setHal(1) }} /></div>
            </div>
            <Pilih label="Status Kepegawaian" nilai={status} ubah={setStatus} semua="Semua status" opsi={unik(PEGAWAI_UNIT.map((p) => p.status)).map((s) => [s, s])} lebar="w-40" />
            <Pilih label="Jabatan" nilai={jabatan} ubah={setJabatan} semua="Semua jabatan" opsi={unik(PEGAWAI_UNIT.map((p) => p.jabatan)).map((s) => [s, s])} lebar="w-52" />
            <Pilih label="Grade" nilai={grade} ubah={setGrade} semua="Semua grade" opsi={unik(PEGAWAI_UNIT.map((p) => p.grade)).sort((a, b) => a - b).map((g) => [String(g), `Grade ${g}`])} lebar="w-36" />
            <Pilih label="Status P1" nilai={aktif} ubah={setAktif} semua="Semua" opsi={[["aktif", "Aktif"], ["nonaktif", "Tidak Aktif"]]} lebar="w-36" />
          </div>

          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[56rem] text-xs">
              <thead className="bg-muted/50 text-left text-[11px] text-muted-foreground">
                <tr>{["Nomor", "NIP", "Nama", "Pangkat/Gol", "Jabatan Saat Ini", "Grade", "Status Kepegawaian", "Berlaku Sejak", "Status Aktif"].map((h) => <th key={h} className="px-3 py-3 font-medium">{h}</th>)}</tr>
              </thead>
              <tbody>
                {tampil.length === 0 && <tr><td colSpan={9} className="py-10 text-center text-muted-foreground">Tidak ada pegawai yang cocok dengan filter ini.</td></tr>}
                {tampil.map((p) => (
                  <tr key={p.nip} className="border-t odd:bg-muted/20">
                    <td className="px-3 py-3">{p.no}</td>
                    <td className="px-3 py-3">{p.nip}</td>
                    <td className="px-3 py-3 font-semibold">{p.nama}</td>
                    <td className="px-3 py-3">{p.pangkat}</td>
                    <td className="px-3 py-3">{p.jabatan}</td>
                    <td className="px-3 py-3"><span className="rounded bg-primary/10 px-2 py-0.5 font-semibold text-primary">{p.grade}</span></td>
                    <td className="px-3 py-3">{p.status}</td>
                    <td className="px-3 py-3">{p.sejak}</td>
                    <td className="px-3 py-3">
                      {p.aktif ? <Badge variant="outline" className="border-emerald-200 bg-emerald-100 text-emerald-800">Aktif</Badge> : <Badge variant="secondary">Tidak Aktif</Badge>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
            <span>Menampilkan {hasil.length === 0 ? 0 : mulai + 1}–{mulai + tampil.length} dari {hasil.length} pegawai</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" disabled={halaman <= 1} onClick={() => setHal(halaman - 1)} aria-label="Halaman sebelumnya"><ChevronLeft className="size-4" /></Button>
              <span>Halaman {halaman} / {totalHal}</span>
              <Button variant="outline" size="icon" disabled={halaman >= totalHal} onClick={() => setHal(halaman + 1)} aria-label="Halaman berikutnya"><ChevronRight className="size-4" /></Button>
            </div>
          </div>
        </Panel>
      </div>
    </>
  )
}
