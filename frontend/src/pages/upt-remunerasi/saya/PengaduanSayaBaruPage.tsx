import { useState, useMemo } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { ArrowLeft, CheckCircle2, Info, Paperclip, Send, Trash2, Upload } from "lucide-react"
import { toast } from "sonner"
import { Panel } from "@/components/pegawai/shared"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  PageHeader,
  Button,
  Input,
  ConfirmDialog,
  WarningBanner,
} from "../components"
import {
  KATEGORI_PENGADUAN_SAYA,
  type KategoriPengaduanSaya,
} from "@/types/pegawai"
import { pegawaiService } from "@/services/pegawaiService"
import { SayaChip } from "./SayaChip"
import { generatePeriodeList } from "@/lib/format"

interface LampiranDraft {
  nama: string
  ukuran: string
}

export default function PengaduanSayaBaruPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const navState = (location.state as { periode?: string; kategori?: KategoriPengaduanSaya } | null) ?? null
  
  // Generate period list dynamically
  const periodeUPT = useMemo(() => generatePeriodeList(12), [])

  const [kategori, setKategori] = useState<KategoriPengaduanSaya>(
    navState?.kategori ?? "Data presensi atau kehadiran"
  )
  const [periode, setPeriode] = useState<string>(navState?.periode ?? periodeUPT[0] ?? "Oktober 2026")
  const [judul, setJudul] = useState("")
  const [uraian, setUraian] = useState("")
  const [lampiran, setLampiran] = useState<LampiranDraft[]>([])
  const [errorMsg, setErrorMsg] = useState("")

  const [confirmKirimOpen, setConfirmKirimOpen] = useState(false)
  const [confirmBatalOpen, setConfirmBatalOpen] = useState(false)
  const [submittedNomor, setSubmittedNomor] = useState<string | null>(null)

  const bantuanAktif =
    KATEGORI_PENGADUAN_SAYA.find((k) => k.value === kategori)?.bantuan ?? ""

  const isDirty = Boolean(judul.trim() || uraian.trim() || lampiran.length > 0)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ""
    if (files.length === 0) return

    const allowedExt = ["pdf", "jpg", "jpeg", "png"]
    const nextList: LampiranDraft[] = [...lampiran]

    for (const file of files) {
      if (nextList.length >= 3) {
        toast.error("Maksimal 3 berkas lampiran.")
        break
      }
      const ext = file.name.split(".").pop()?.toLowerCase() ?? ""
      if (!allowedExt.includes(ext)) {
        toast.error(`Format berkas ${file.name} harus PDF, JPG, atau PNG.`)
        continue
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`Ukuran berkas ${file.name} melebihi batas 5 MB.`)
        continue
      }
      const kb = Math.max(1, Math.round(file.size / 1024))
      const ukuranLabel = kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`
      nextList.push({ nama: file.name, ukuran: ukuranLabel })
    }

    setLampiran(nextList)
  }

  const handleValidateAndOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault()
    if (!judul.trim()) {
      setErrorMsg("Judul singkat pengaduan wajib diisi.")
      return
    }
    if (uraian.trim().length < 20) {
      setErrorMsg("Uraian pengaduan wajib diisi minimal 20 karakter.")
      return
    }
    setErrorMsg("")
    setConfirmKirimOpen(true)
  }

  const handleConfirmKirim = async () => {
    const nomorBaru = `ADU-${Date.now().toString().slice(-6)}`

    try {
      await pegawaiService.kirimPengaduan({
        kategori,
        judul: judul.trim(),
        deskripsi: uraian.trim(),
      })
      setConfirmKirimOpen(false)
      setSubmittedNomor(nomorBaru)
      toast.success(`Pengaduan ${nomorBaru} berhasil dikirim.`)
    } catch (err) {
      console.error(err)
      toast.error("Gagal mengirim pengaduan.")
    }
  }

  const handleBatalClick = () => {
    if (isDirty) {
      setConfirmBatalOpen(true)
    } else {
      navigate("/upt-remunerasi/pengaduan-saya")
    }
  }

  if (submittedNomor) {
    return (
      <div className="mx-auto max-w-xl py-8">
        <Panel className="space-y-4 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="size-6" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-foreground">Pengaduan Berhasil Dikirim</h1>
            <p className="text-sm text-muted-foreground">
              Pengaduan Anda telah tercatat dan diteruskan untuk ditindaklanjuti.
            </p>
          </div>
          <div className="rounded-xl border bg-muted/30 p-4">
            <p className="text-xs text-muted-foreground">Nomor Pengaduan</p>
            <p className="mt-1 font-mono text-lg font-bold text-primary">{submittedNomor}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            <Button variant="outline" onClick={() => navigate("/upt-remunerasi/pengaduan-saya")}>
              Kembali ke Daftar
            </Button>
            <Button onClick={() => navigate(`/upt-remunerasi/pengaduan-saya/${submittedNomor}`)}>
              Lihat Pengaduan
            </Button>
          </div>
        </Panel>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2 text-muted-foreground">
          <Link to="/upt-remunerasi/pengaduan-saya">
            <ArrowLeft className="mr-1.5 size-4" />
            Kembali ke Daftar Pengaduan
          </Link>
        </Button>
        <PageHeader
          title="Buat Pengaduan Baru"
          subtitle={
            <div>
              <p>Sampaikan pertanyaan atau pengaduan terkait remunerasi P1 Anda.</p>
              <SayaChip />
            </div>
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <form onSubmit={handleValidateAndOpenConfirm} className="space-y-5">
            {errorMsg && (
              <WarningBanner variant="error" title="Validasi Formulir">
                {errorMsg}
              </WarningBanner>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-foreground">Kategori Pengaduan</label>
                <Select
                  value={kategori}
                  onValueChange={(val) => setKategori(val as KategoriPengaduanSaya)}
                >
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {KATEGORI_PENGADUAN_SAYA.map((k) => (
                      <SelectItem key={k.value} value={k.value}>
                        {k.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-foreground">Periode Terkait</label>
                <Select value={periode} onValueChange={setPeriode}>
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {periodeUPT.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-foreground">Judul Singkat</label>
              <Input
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                placeholder="Contoh: Konfirmasi potongan TL.2 tanggal 12 Oktober 2026"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-foreground">
                  Uraian Pengaduan <span className="text-rose-600">*</span>
                </label>
                <span
                  className={`text-xs ${
                    uraian.trim().length < 20 ? "text-muted-foreground" : "text-emerald-700 font-medium"
                  }`}
                >
                  {uraian.trim().length} / min. 20 karakter
                </span>
              </div>
              <textarea
                rows={5}
                value={uraian}
                onChange={(e) => setUraian(e.target.value)}
                placeholder="Jelaskan kronologi, tanggal kejadian, dan rincian yang perlu diperiksa..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-foreground">
                  Lampiran Pendukung (Opsional)
                </label>
                <span className="text-xs text-muted-foreground">
                  PDF/JPG/PNG · Maks. 5 MB/berkas · Maks. 3 berkas
                </span>
              </div>

              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground transition-colors hover:bg-muted/40">
                <Upload className="size-4" />
                <span>Pilih berkas lampiran ({lampiran.length}/3)</span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {lampiran.length > 0 && (
                <div className="space-y-2 pt-1">
                  {lampiran.map((file, idx) => (
                    <div
                      key={`${file.nama}-${idx}`}
                      className="flex items-center justify-between rounded-lg border bg-card px-3 py-2 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Paperclip className="size-3.5 shrink-0 text-muted-foreground" />
                        <span className="truncate font-medium">{file.nama}</span>
                        <span className="shrink-0 text-muted-foreground">({file.ukuran})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setLampiran((prev) => prev.filter((_, i) => i !== idx))}
                        className="text-rose-600 hover:text-rose-800"
                        aria-label={`Hapus ${file.nama}`}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-wrap justify-end gap-2 border-t pt-4">
              <Button type="button" variant="outline" onClick={handleBatalClick}>
                Batal
              </Button>
              <Button type="submit">
                <Send className="mr-1.5 size-4" />
                Kirim Pengaduan
              </Button>
            </div>
          </form>
        </Panel>

        <div className="space-y-4">
          <Panel className="bg-primary/5 border-primary/20">
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 size-5 shrink-0 text-primary" />
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-foreground">Panduan Kategori</h3>
                <p className="text-xs font-medium text-primary">{kategori}</p>
                <p className="text-xs leading-relaxed text-muted-foreground">{bantuanAktif}</p>
              </div>
            </div>
          </Panel>
        </div>
      </div>

      <ConfirmDialog
        open={confirmKirimOpen}
        onOpenChange={setConfirmKirimOpen}
        title="Kirim Pengaduan?"
        description="Pastikan kategori, periode, dan uraian pengaduan sudah benar sebelum dikirim."
        confirmText="Ya, Kirim Pengaduan"
        onConfirm={handleConfirmKirim}
      />

      <ConfirmDialog
        open={confirmBatalOpen}
        onOpenChange={setConfirmBatalOpen}
        title="Data Belum Tersimpan"
        description="Isian formulir pengaduan belum disimpan dan akan hilang jika Anda keluar dari halaman ini."
        confirmText="Ya, Tinggalkan Halaman"
        cancelText="Lanjutkan Mengisi"
        danger
        onConfirm={() => navigate("/upt-remunerasi/pengaduan-saya")}
      />
    </div>
  )
}
