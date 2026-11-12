import { useRef, useState, type DragEvent } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { HelpCircle, Send, UploadCloud, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { IconBox, PageHeading, Panel } from "@/components/pegawai/shared"
import { DAFTAR_PERIODE, KATEGORI_PENGADUAN, PERIODE_AKTIF } from "@/data/dummy-pegawai"
import { cn } from "@/lib/utils"

const MAKS_BYTE = 5 * 1024 * 1024
const TIPE = ["application/pdf", "image/jpeg", "image/png"]
const MIN_URAIAN = 30

export default function PengaduanBaruPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const inputFile = useRef<HTMLInputElement>(null)

  const [kategori, setKategori] = useState(KATEGORI_PENGADUAN[0])
  const [periode, setPeriode] = useState(params.get("periode") ?? PERIODE_AKTIF)
  const [judul, setJudul] = useState("")
  const [uraian, setUraian] = useState("")
  const [berkas, setBerkas] = useState<File | null>(null)
  const [drag, setDrag] = useState(false)

  function pilih(f?: File) {
    if (!f) return
    if (!TIPE.includes(f.type)) return void toast.error("Format berkas harus PDF, JPG, atau PNG.")
    if (f.size > MAKS_BYTE) return void toast.error("Ukuran berkas maksimal 5 MB.")
    setBerkas(f)
  }

  function onDrop(e: DragEvent) {
    e.preventDefault()
    setDrag(false)
    pilih(e.dataTransfer.files[0])
  }

  const valid = judul.trim().length > 0 && uraian.trim().length >= MIN_URAIAN

  function kirim() {
    if (!valid) return
    toast.success("Pengaduan terkirim (data dummy).")
    navigate("/pegawai/pengaduan")
  }

  return (
    <>
      <PageHeading title="Buat Pengaduan Baru" desc="Sampaikan kendala terkait slip atau perhitungan P1 Anda." />

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_18rem]">
        <Panel className="space-y-5">
          <div className="space-y-2">
            <Label>Kategori <span className="text-destructive">*</span></Label>
            <Select value={kategori} onValueChange={setKategori}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>{KATEGORI_PENGADUAN.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Periode terkait <span className="text-destructive">*</span></Label>
            <Select value={periode} onValueChange={setPeriode}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>{DAFTAR_PERIODE.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="judul">Judul singkat <span className="text-destructive">*</span></Label>
              <span className="text-[11px] text-muted-foreground">{judul.length}/100</span>
            </div>
            <Input id="judul" maxLength={100} value={judul} onChange={(e) => setJudul(e.target.value)} placeholder="Contoh: Grade pada slip belum diperbarui" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="uraian">Uraian <span className="text-destructive">*</span></Label>
            <textarea
              id="uraian"
              rows={4}
              value={uraian}
              onChange={(e) => setUraian(e.target.value)}
              placeholder="Jelaskan kondisi yang Anda alami, data yang seharusnya, dan informasi pendukung lainnya."
              className="w-full resize-none rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
            <p className="text-right text-[11px] text-muted-foreground">{uraian.length} karakter (minimal {MIN_URAIAN})</p>
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
            onDragLeave={() => setDrag(false)}
            onDrop={onDrop}
            onClick={() => inputFile.current?.click()}
            className={cn("flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed bg-primary/5 px-4 py-8 text-center transition-colors", drag && "border-primary bg-primary/10")}
          >
            <input ref={inputFile} type="file" accept=".pdf,.jpg,.jpeg,.png" hidden onChange={(e) => pilih(e.target.files?.[0])} />
            <UploadCloud className="size-6 text-primary" />
            {berkas ? (
              <span className="flex items-center gap-2 text-xs font-semibold">
                {berkas.name}
                <button type="button" aria-label="Hapus berkas" onClick={(e) => { e.stopPropagation(); setBerkas(null) }}>
                  <X className="size-4" />
                </button>
              </span>
            ) : (
              <>
                <p className="text-xs font-semibold">Seret berkas atau klik untuk memilih</p>
                <p className="text-[11px] text-muted-foreground">SK, SPMT, atau tangkapan layar • PDF, JPG, PNG • Maks. 5 MB</p>
              </>
            )}
          </div>

          <div className="flex justify-end gap-2 border-t pt-5">
            <Button asChild variant="outline"><Link to="/pegawai/pengaduan">Batal</Link></Button>
            <Button onClick={kirim} disabled={!valid}><Send /> Kirim Pengaduan</Button>
          </div>
        </Panel>

        <Panel className="space-y-2">
          <IconBox icon={HelpCircle} />
          <h2 className="pt-2 font-semibold">Petunjuk Pengaduan</h2>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Sertakan uraian dan bukti yang membantu petugas memeriksa perhitungan P1 Anda. Pastikan periode yang dipilih sesuai. Gunakan bahasa yang jelas dan faktual. Lampiran mempercepat proses pemeriksaan.
          </p>
        </Panel>
      </div>
    </>
  )
}
