import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Info, Send } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AreaTeks, Bidang, Dropzone } from "@/components/kepegawaian/ui"
import { PageHeading, Panel } from "@/components/pegawai/shared"
import { GRADE_PARAM, PERSEN_P1 } from "@/types/bendahara"
import { JABATAN_MASTER, JENIS_USULAN } from "@/types/kepegawaian"
import { tambahUsulan, useKepeg } from "@/data/store-kepegawaian"
import { kepegawaianService } from "@/services/kepegawaianService"
import { rupiah } from "@/lib/format"

const GRADE = GRADE_PARAM.map(([l, v]) => ({ grade: Number(l.replace("Grade ", "")), rem: v }))
const p1Dasar = (grade: number) => { const g = GRADE.find((x) => x.grade === grade); return g ? Math.round((g.rem * PERSEN_P1) / 100) : 0 }
const cekPdf = (f: File) => (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf") ? "Berkas harus berformat PDF." : f.size > 5 * 1024 * 1024 ? "Ukuran berkas maksimal 5 MB." : null)

export default function BuatUsulanPage() {
  const navigate = useNavigate()
  const { pegawai: defaultPegawai } = useKepeg()
  const [pegawai, setPegawai] = useState<any[]>(defaultPegawai)
  const [nip, setNip] = useState("")
  const [jenis, setJenis] = useState<string>(JENIS_USULAN[0])
  const [mulai, setMulai] = useState("")
  const [jabatan, setJabatan] = useState("")
  const [grade, setGrade] = useState("")
  const [alasan, setAlasan] = useState("")
  const [sk, setSk] = useState<string | null>(null)
  const [spmt, setSpmt] = useState<string | null>(null)
  const [skFile, setSkFile] = useState<File | undefined>(undefined)
  const [spmtFile, setSpmtFile] = useState<File | undefined>(undefined)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    kepegawaianService.getPegawaiList().then((res) => {
      if (res?.data) {
        setPegawai(res.data.map((p: any) => ({
          nip: p.NIP || p.nip,
          nama: p.nama,
          jabatan: p.jabatan?.nama || p.jabatan_nama || "",
          grade: p.jabatan?.grade_nama || p.grade || 0,
          aktif: p.aktif,
        })))
      }
    }).catch(() => {})
  }, [])

  const p = pegawai.find((x) => x.nip === nip)
  const lamaTeks = p ? (p.jabatan ? `${p.jabatan} • Grade ${p.grade}` : "Belum ada jabatan/grade") : "-"
  const valid = !!p && !!mulai && !!jabatan && !!grade && alasan.trim().length >= 10 && !!sk && !!spmt

  async function kirim() {
    if (!valid || !sk || !spmt) return
    setSaving(true)
    try {
      const res = await kepegawaianService.createUsulan({
        NIP: nip,
        jabatan_baru: jabatan,
        grade_baru: Number(grade),
        jenis_perubahan: jenis,
        tanggal_berlaku: mulai,
        alasan: alasan.trim(),
        dokumen_sk: skFile,
        dokumen_spmt: spmtFile,
        sk,
        spmt,
      })
      tambahUsulan({ nip, jenis, mulaiIso: mulai, jabatanBaru: jabatan, gradeBaru: Number(grade), alasan: alasan.trim(), sk, spmt })
      toast.success(res?.message || `Usulan ${res?.usulan?.kode_usulan || ""} diajukan ke Verifikator.`)
      navigate("/kepegawaian/usulan")
    } catch (err: any) {
      const msg = err?.response?.data?.message
      if (msg) {
        toast.error(msg)
      } else {
        const id = tambahUsulan({ nip, jenis, mulaiIso: mulai, jabatanBaru: jabatan, gradeBaru: Number(grade), alasan: alasan.trim(), sk, spmt })
        toast.success(`Usulan ${id} diajukan ke Verifikator (mode lokal).`)
        navigate("/kepegawaian/usulan")
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Link to="/kepegawaian/usulan" className="mb-3 inline-flex items-center gap-1 text-xs text-primary hover:underline"><ArrowLeft className="size-3" /> Kembali <span className="text-muted-foreground">Usulan Jabatan/Grade</span></Link>
      <PageHeading title="Buat Usulan Jabatan/Grade" desc="Jabatan dan grade hanya dapat dipilih dari master data yang dikelola UPT Remunerasi." />

      <div className="grid items-start gap-6 pb-20 lg:grid-cols-[1fr_17rem]">
        <div className="space-y-5">
          <Panel className="space-y-4">
            <h2 className="text-sm font-semibold">1. Pegawai</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Bidang label="Pegawai">
                <Select value={nip} onValueChange={(v) => { setNip(v); setJabatan(""); setGrade("") }}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Pilih pegawai aktif" /></SelectTrigger>
                  <SelectContent>{pegawai.filter((x) => x.aktif).map((x) => <SelectItem key={x.nip} value={x.nip}>{x.nama}</SelectItem>)}</SelectContent>
                </Select>
              </Bidang>
              <Bidang label="Jabatan/grade berlaku"><Input disabled value={lamaTeks} /></Bidang>
            </div>
          </Panel>

          <Panel className="space-y-4">
            <h2 className="text-sm font-semibold">2. Perubahan yang diusulkan</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Bidang label="Jenis perubahan">
                <Select value={jenis} onValueChange={setJenis}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{JENIS_USULAN.map((j) => <SelectItem key={j} value={j}>{j}</SelectItem>)}</SelectContent></Select>
              </Bidang>
              <Bidang label="Tanggal mulai berlaku" hint="Harus sesuai tanggal pada SPMT"><Input type="date" value={mulai} onChange={(e) => setMulai(e.target.value)} /></Bidang>
              <Bidang label="Jabatan baru (master UPT)">
                <Select value={jabatan} onValueChange={setJabatan} disabled={!p}>
                  <SelectTrigger className="w-full"><SelectValue placeholder={p ? "Pilih jabatan" : "Pilih pegawai terlebih dahulu"} /></SelectTrigger>
                  <SelectContent>{JABATAN_MASTER.map((j) => <SelectItem key={j} value={j}>{j}</SelectItem>)}</SelectContent>
                </Select>
              </Bidang>
              <Bidang label="Grade baru">
                <Select value={grade} onValueChange={setGrade} disabled={!p}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Pilih grade" /></SelectTrigger>
                  <SelectContent>{GRADE.map((g) => <SelectItem key={g.grade} value={String(g.grade)}>Grade {g.grade}</SelectItem>)}</SelectContent>
                </Select>
              </Bidang>
            </div>
            <Bidang label="Alasan perubahan" hint={`${alasan.length} karakter (minimal 10)`}>
              <AreaTeks rows={3} value={alasan} onChange={(e) => setAlasan(e.target.value)} placeholder="Contoh: Kenaikan jabatan fungsional berdasarkan SK Rektor Nomor .../UN16.R/KP/2026" />
            </Bidang>
          </Panel>

          <Panel className="space-y-4">
            <div><h2 className="text-sm font-semibold">3. Dokumen pendukung</h2><p className="text-[11px] text-muted-foreground">Wajib PDF, maksimal 5 MB per berkas. Berkas lain akan ditolak.</p></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Bidang label="SK jabatan/grade"><Dropzone nama={sk} onFile={(f) => { setSk(f.name); setSkFile(f) }} onHapus={() => { setSk(null); setSkFile(undefined) }} accept=".pdf" cek={cekPdf} petunjuk="PDF • maks. 5 MB" contoh={() => setSk("SK_contoh.pdf")} /></Bidang>
              <Bidang label="SPMT (Surat Pernyataan Melaksanakan Tugas)"><Dropzone nama={spmt} onFile={(f) => { setSpmt(f.name); setSpmtFile(f) }} onHapus={() => { setSpmt(null); setSpmtFile(undefined) }} accept=".pdf" cek={cekPdf} petunjuk="PDF • maks. 5 MB" contoh={() => setSpmt("SPMT_contoh.pdf")} /></Bidang>
            </div>
          </Panel>
        </div>

        <Panel className="space-y-3 lg:sticky lg:top-24">
          <h2 className="text-sm font-semibold">Ringkasan usulan</h2>
          <div className="rounded-lg bg-muted/60 p-3 text-xs"><p className="text-[10px] text-muted-foreground">Saat ini</p><p className="font-semibold">{p?.jabatan ? `${p.jabatan} • G${p.grade}` : "-"}</p><p className="text-[10px] text-muted-foreground">P1 dasar {rupiah(p ? p1Dasar(p.grade) : 0)}</p></div>
          <p className="text-center text-muted-foreground">↓</p>
          <div className="rounded-lg bg-primary/10 p-3 text-xs"><p className="text-[10px] text-muted-foreground">Diusulkan</p><p className="font-semibold">{jabatan && grade ? `${jabatan} • G${grade}` : "-"}</p><p className="text-[10px] text-muted-foreground">P1 dasar {grade ? rupiah(p1Dasar(Number(grade))) : "-"}</p></div>
          <p className="flex gap-1.5 text-[10px] text-muted-foreground"><Info className="mt-0.5 size-3 shrink-0" /> Estimasi informatif memakai PIR aktif. Perhitungan final, pajak, dan P1 Netto dilakukan UPT Remunerasi.</p>
        </Panel>
      </div>

      <div className="sticky bottom-0 -mx-4 flex justify-between border-t bg-card px-4 py-3 md:-mx-8 md:px-8">
        <Button asChild variant="outline"><Link to="/kepegawaian/usulan">Batal</Link></Button>
        <Button onClick={kirim} disabled={!valid || saving}><Send /> {saving ? "Mengajukan..." : "Ajukan ke Verifikator"}</Button>
      </div>
    </>
  )
}
