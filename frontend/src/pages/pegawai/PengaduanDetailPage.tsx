import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { ArrowLeft, Check, CheckCircle2, Clock, ExternalLink, Paperclip, Send } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { PageHeading, Panel, StatusBadge } from "@/components/pegawai/shared"
import { DAFTAR_PENGADUAN, LANGKAH_PENGADUAN, PESAN_AWAL, pegawai, type Pesan } from "@/data/dummy-pegawai"
import { cn } from "@/lib/utils"

const inisial = (n: string) => (n === "Anda" ? pegawai.inisial : n.split(" ").map((x) => x[0]).slice(0, 2).join("").toUpperCase())

export default function PengaduanDetailPage() {
  const { id } = useParams()
  const p = DAFTAR_PENGADUAN.find((x) => x.nomor === id)
  const [pesan, setPesan] = useState<Pesan[]>(PESAN_AWAL)
  const [teks, setTeks] = useState("")

  if (!p) {
    return (
      <Panel>
        <p className="text-sm">Pengaduan tidak ditemukan.</p>
        <Button asChild variant="outline" className="mt-4"><Link to="/pegawai/pengaduan">Kembali</Link></Button>
      </Panel>
    )
  }

  const selesai = p.status === "Selesai"

  function kirim() {
    if (!teks.trim()) return
    setPesan((m) => [...m, { dari: "Anda", waktu: new Date().toLocaleString("id-ID"), teks: teks.trim() }])
    setTeks("")
    toast.success("Keterangan terkirim.")
  }

  return (
    <>
      <Link to="/pegawai/pengaduan" className="mb-3 inline-flex items-center gap-1 text-xs text-primary hover:underline">
        <ArrowLeft className="size-3" /> Kembali
      </Link>
      <PageHeading title="Detail Pengaduan" desc="Riwayat dan tindak lanjut pengaduan Anda." />

      <div className="space-y-6">
        <Panel>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Nomor Pengaduan</p>
              <p className="mt-1 text-2xl font-semibold">{p.nomor}</p>
            </div>
            <StatusBadge status={p.status} />
          </div>
          <div className="mt-5 grid gap-4 border-t pt-5 sm:grid-cols-3">
            <div><p className="text-xs text-muted-foreground">Kategori</p><p className="text-sm font-semibold">{p.kategori}</p></div>
            <div><p className="text-xs text-muted-foreground">Periode</p><p className="text-sm font-semibold">{p.periode}</p></div>
            <div><p className="text-xs text-muted-foreground">Tanggal diajukan</p><p className="text-sm font-semibold">{p.tanggal}</p></div>
          </div>
        </Panel>

        <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
          {/* Linimasa */}
          <Panel>
            <h2 className="font-semibold">Linimasa Pengaduan</h2>
            <ol className="mt-5">
              {LANGKAH_PENGADUAN.map((l, i) => {
                const done = i < p.langkahSelesai
                const current = i === p.langkahSelesai
                return (
                  <li key={l.label} className="relative flex gap-3 pb-7 last:pb-0">
                    {i < LANGKAH_PENGADUAN.length - 1 && <span className="absolute left-[13px] top-8 h-[calc(100%-2rem)] w-px bg-border" />}
                    <span
                      className={cn(
                        "z-10 flex size-7 shrink-0 items-center justify-center rounded-full border-2",
                        done && "border-primary bg-primary text-primary-foreground",
                        current && "border-primary bg-card text-primary",
                        !done && !current && "border-border bg-card"
                      )}
                    >
                      {done ? <Check className="size-4" /> : current ? <Clock className="size-3.5" /> : null}
                    </span>
                    <div className={cn(!done && !current && "opacity-60")}>
                      <p className="text-sm font-semibold leading-tight">{l.label}</p>
                      {(done || current) && (
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {l.waktu}<br />{l.oleh}
                        </p>
                      )}
                    </div>
                  </li>
                )
              })}
            </ol>
          </Panel>

          {/* Percakapan */}
          <div className="space-y-4">
            {pesan.map((m, i) => {
              const saya = m.dari === "Anda"
              return (
                <div key={i} className={cn("flex gap-3", saya && "flex-row-reverse")}>
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">{inisial(m.dari)}</span>
                  <div className={cn("w-full rounded-xl border p-4 text-sm", saya ? "bg-primary/10" : "bg-card")}>
                    <div className="flex justify-between gap-2 text-[11px]">
                      <span className="font-semibold">{m.dari}</span>
                      <span className="text-muted-foreground">{m.waktu}</span>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed">{m.teks}</p>
                    {m.lampiran && (
                      <div className="mt-3 flex justify-center">
                        <span className="inline-flex items-center gap-2 rounded-md border bg-card px-3 py-1.5 text-[11px] text-primary">
                          <Paperclip className="size-3" /> {m.lampiran} <ExternalLink className="size-3" />
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {selesai ? (
              <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
                <CheckCircle2 className="mt-0.5 size-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-primary">Pengaduan Selesai</p>
                  <p className="text-xs text-muted-foreground">Selesai sesuai ketentuan: penyesuaian berlaku mulai periode berikutnya.</p>
                </div>
              </div>
            ) : (
              <Panel>
                <h3 className="font-semibold">Tambah Keterangan</h3>
                <textarea
                  value={teks}
                  onChange={(e) => setTeks(e.target.value)}
                  placeholder="Tambahkan informasi yang relevan..."
                  rows={3}
                  className="mt-3 w-full resize-none rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                />
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">{teks.length} karakter</span>
                  <Button onClick={kirim} disabled={!teks.trim()}><Send /> Kirim Keterangan</Button>
                </div>
              </Panel>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
