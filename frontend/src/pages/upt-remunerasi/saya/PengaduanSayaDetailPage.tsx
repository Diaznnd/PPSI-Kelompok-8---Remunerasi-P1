import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import {
  ArrowLeft,
  Check,
  Download,
  Lock,
  Paperclip,
  Send,
} from "lucide-react"
import { toast } from "sonner"
import { Field, Panel } from "@/components/pegawai/shared"
import { Badge } from "@/components/ui/badge"
import { PageHeader, Button, WarningBanner } from "../components"
import {
  addPesanPengaduanSaya,
  getPengaduanSayaList,
  profilSaya,
  type PengaduanSayaPesan,
  type StatusPengaduanSaya,
} from "@/data/dummy-upt-saya"
import { SayaChip } from "./SayaChip"

const STATUS_STYLE: Record<StatusPengaduanSaya, string> = {
  Diajukan: "border-amber-200 bg-amber-100 text-amber-800",
  Ditindaklanjuti: "border-amber-200 bg-amber-100 text-amber-800",
  Diteruskan: "border-sky-200 bg-sky-100 text-sky-800",
  Selesai: "border-emerald-200 bg-emerald-100 text-emerald-800",
}

export default function PengaduanSayaDetailPage() {
  const { id } = useParams()
  const item = getPengaduanSayaList().find((p) => p.nomor === id)

  const [pesanList, setPesanList] = useState<PengaduanSayaPesan[]>(item?.pesan ?? [])
  const [keteranganBaru, setKeteranganBaru] = useState("")
  const [lampiranBaru, setLampiranBaru] = useState("")

  if (!item) {
    return (
      <Panel>
        <p className="text-sm text-foreground">Pengaduan tidak ditemukan.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/upt-remunerasi/pengaduan-saya">Kembali ke Daftar</Link>
        </Button>
      </Panel>
    )
  }

  const isSelesai = item.status === "Selesai"

  const handleKirimKeterangan = (e: React.FormEvent) => {
    e.preventDefault()
    if (!keteranganBaru.trim()) {
      toast.error("Keterangan tambahan tidak boleh kosong.")
      return
    }
    const pesanBaru: PengaduanSayaPesan = {
      id: `psn-${Date.now()}`,
      pengirim: profilSaya.nama,
      peran: "Pegawai Pengaju",
      waktu: "15 Nov 2026, 21.20 WIB",
      isi: keteranganBaru.trim(),
      lampiran: lampiranBaru || undefined,
    }
    addPesanPengaduanSaya(item.nomor, pesanBaru)
    setPesanList((prev) => [...prev, pesanBaru])
    setKeteranganBaru("")
    setLampiranBaru("")
    toast.success("Keterangan tambahan berhasil dikirim.")
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
          title={
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono">{item.nomor}</span>
              <Badge variant="outline" className={STATUS_STYLE[item.status]}>
                {item.status}
              </Badge>
            </div>
          }
          subtitle={
            <div>
              <p>{item.judul}</p>
              <SayaChip />
            </div>
          }
        />
      </div>

      <Panel>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Kategori" value={item.kategori} />
          <Field label="Periode" value={item.periode} />
          <Field label="Tanggal Diajukan" value={item.tanggal} />
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel className="space-y-4">
            <h2 className="text-base font-semibold text-foreground">Isi Pengaduan</h2>
            <div className="space-y-2 border-t pt-4">
              <p className="text-sm font-semibold text-foreground">{item.judul}</p>
              <p className="text-sm leading-relaxed text-muted-foreground">{item.uraian}</p>
            </div>

            {item.lampiran.length > 0 && (
              <div className="space-y-2 border-t pt-4">
                <p className="text-xs font-medium text-muted-foreground">Lampiran</p>
                <div className="space-y-2">
                  {item.lampiran.map((file, idx) => (
                    <div
                      key={`${file.nama}-${idx}`}
                      className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Paperclip className="size-3.5 shrink-0 text-muted-foreground" />
                        <span className="truncate font-medium text-foreground">{file.nama}</span>
                        <span className="shrink-0 text-muted-foreground">({file.ukuran})</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-primary"
                        onClick={() => toast.success(`Mengunduh ${file.nama}`)}
                      >
                        <Download className="mr-1 size-3.5" />
                        Unduh
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Panel>

          <Panel className="space-y-4">
            <h2 className="text-base font-semibold text-foreground">Tanggapan dan Keterangan</h2>
            <div className="space-y-3 border-t pt-4">
              {pesanList.map((psn) => {
                const isSelf = psn.pengirim === profilSaya.nama
                return (
                  <div
                    key={psn.id}
                    className={`rounded-xl border p-4 space-y-1.5 ${
                      isSelf ? "border-primary/20 bg-primary/5" : "bg-muted/30"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-sm font-semibold text-foreground">{psn.pengirim}</span>
                        <span className="ml-2 text-xs text-muted-foreground">({psn.peran})</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{psn.waktu}</span>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground">{psn.isi}</p>
                    {psn.lampiran && (
                      <p className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                        <Paperclip className="size-3" />
                        {psn.lampiran}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>

            {isSelesai ? (
              <WarningBanner variant="info" title="Pengaduan Selesai">
                <div className="flex items-center gap-2">
                  <Lock className="size-4 shrink-0" />
                  <span>Pengaduan sudah selesai dan tidak dapat diubah.</span>
                </div>
              </WarningBanner>
            ) : (
              <form onSubmit={handleKirimKeterangan} className="space-y-3 border-t pt-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">Tambah Keterangan</label>
                  <span className="text-xs text-muted-foreground">{keteranganBaru.length} karakter</span>
                </div>
                <textarea
                  rows={3}
                  value={keteranganBaru}
                  onChange={(e) => setKeteranganBaru(e.target.value)}
                  placeholder="Tulis keterangan tambahan atau klarifikasi untuk petugas..."
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted">
                    <Paperclip className="size-3.5" />
                    <span>{lampiranBaru ? lampiranBaru : "Lampirkan berkas (opsional)"}</span>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) setLampiranBaru(file.name)
                      }}
                    />
                  </label>
                  <Button type="submit" size="sm">
                    <Send className="mr-1.5 size-3.5" />
                    Kirim
                  </Button>
                </div>
              </form>
            )}
          </Panel>
        </div>

        <div>
          <Panel className="space-y-4">
            <h2 className="text-base font-semibold text-foreground">Linimasa Pengaduan</h2>
            <div className="border-t pt-4">
              {item.linimasa.map((step, idx) => {
                const isLast = idx === item.linimasa.length - 1
                const prevDone = idx === 0 ? true : item.linimasa[idx - 1].selesai
                const isCurrent = !step.selesai && prevDone

                return (
                  <div key={step.tahap} className="relative flex gap-3">
                    <div className="flex flex-col items-center">
                      {step.selesai ? (
                        <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-white">
                          <Check className="size-3.5 stroke-[2.5]" />
                        </div>
                      ) : isCurrent ? (
                        <div className="flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-emerald-700 bg-emerald-50">
                          <span className="size-2 rounded-full bg-emerald-700" />
                        </div>
                      ) : (
                        <div className="flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-slate-300 bg-background" />
                      )}
                      {!isLast && (
                        <div className={`my-1 w-px flex-1 ${step.selesai ? "bg-emerald-300" : "bg-border"}`} />
                      )}
                    </div>
                    <div className={`min-w-0 flex-1 ${isLast ? "pb-0" : "pb-5"}`}>
                      <p
                        className={`text-sm font-semibold ${
                          step.selesai || isCurrent ? "text-foreground" : "text-slate-500"
                        }`}
                      >
                        {step.tahap}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{step.waktu}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">Pelaku: {step.pelaku}</p>
                      <p className="mt-1 text-xs italic text-slate-600">{step.catatan}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
