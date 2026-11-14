import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { AlertTriangle, ArrowLeft, CheckCircle2, Download, Info, RotateCcw, TrendingUp, ZoomIn, ZoomOut } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Field, PageHeading, Panel } from "@/components/pegawai/shared"
import { BilahAksi, StatusVerifBadge } from "@/components/verifikator/shared"
import { KembalikanDialog, SetujuiDialog } from "@/components/verifikator/KeputusanDialog"
import { putuskan, useUsulan } from "@/data/store-verifikator"
import { rupiah } from "@/lib/format"
import { cn } from "@/lib/utils"

const Nomor = ({ n, judul, desk }: { n: string; judul: string; desk: string }) => (
  <div className="flex items-center gap-3 border-b pb-4">
    <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{n}</span>
    <div><h2 className="font-semibold leading-tight">{judul}</h2><p className="text-xs text-muted-foreground">{desk}</p></div>
  </div>
)

export default function DetailUsulanJabatanPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const u = useUsulan().find((x) => x.id === id)
  const [zoom, setZoom] = useState(100)
  const [dlgSetuju, setDlgSetuju] = useState(false)
  const [dlgKembali, setDlgKembali] = useState(false)

  if (!u) return <Panel>Usulan tidak ditemukan. <Link to="/verifikator/jabatan" className="text-primary hover:underline">Kembali ke daftar</Link></Panel>

  const sudahDiputuskan = u.status !== "Diajukan"
  const baris: [string, string | number, string | number][] = [
    ["Jabatan", u.jabatanLama, u.jabatanBaru],
    ["Grade", u.gradeLama, u.gradeBaru],
    ["Nilai Jabatan", u.nilaiLama.toLocaleString("id-ID"), u.nilaiBaru.toLocaleString("id-ID")],
    ["Berlaku sejak", u.berlakuLama, u.berlakuBaru],
  ]

  return (
    <>
      <Link to="/verifikator/jabatan" className="mb-3 inline-flex items-center gap-1 text-xs text-primary hover:underline"><ArrowLeft className="size-3" /> Kembali Detail Usulan Perubahan Jabatan/Grade</Link>
      <PageHeading title="Detail Usulan Perubahan Jabatan/Grade" desc={u.id} action={<StatusVerifBadge status={u.status} />} />

      <div className="space-y-6">
        <Panel className="space-y-4">
          <Nomor n="01" judul="Identitas Pegawai" desk="Data pegawai yang diusulkan." />
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Nama" value={u.nama} />
            <Field label="NIP" value={u.nip} />
            <Field label="Unit kerja" value={u.unit} />
            <Field label="Status kepegawaian" value={u.statusKepegawaian} />
            <Field label="Jenis perubahan" value={u.jenis} />
            <Field label="Diajukan oleh" value={u.diajukanOleh} />
          </div>
        </Panel>

        <Panel className="space-y-4">
          <Nomor n="02" judul="Perbandingan Data" desk="Baris hijau menunjukkan nilai yang berubah." />
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 text-left text-[11px] text-muted-foreground"><tr><th className="px-4 py-3 font-medium">Komponen</th><th className="px-4 py-3 font-medium">Lama</th><th className="px-4 py-3 font-medium">Baru</th></tr></thead>
              <tbody>
                {baris.map(([k, lama, baru]) => (
                  <tr key={k} className={cn("border-t", String(lama) !== String(baru) && "bg-primary/5")}>
                    <td className="px-4 py-3 text-muted-foreground">{k}</td><td className="px-4 py-3 font-bold">{lama}</td><td className="px-4 py-3 font-bold">{baru}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-start gap-2 rounded-lg bg-primary/5 p-3 text-xs">
            <Info className="mt-0.5 size-4 shrink-0 text-primary" />
            <div><p className="font-semibold text-primary">Dasar ketentuan</p><p className="text-muted-foreground">“{u.dasar}”</p></div>
          </div>
        </Panel>

        <Panel className="space-y-4">
          <Nomor n="03" judul="Dokumen Pendukung" desk={u.dokumen.judul} />
          <div className="overflow-hidden rounded-lg border">
            <div className="flex items-center justify-between bg-slate-700 px-3 py-2 text-xs text-white">
              <div className="flex items-center gap-2">
                <button aria-label="Perkecil" onClick={() => setZoom((z) => Math.max(50, z - 25))}><ZoomOut className="size-4" /></button>
                <span className="w-10 text-center">{zoom}%</span>
                <button aria-label="Perbesar" onClick={() => setZoom((z) => Math.min(200, z + 25))}><ZoomIn className="size-4" /></button>
              </div>
              <span>Halaman 1 dari 2</span>
              <button className="flex items-center gap-1" onClick={() => toast.info("Unduh dokumen tersedia setelah backend terhubung.")}><Download className="size-4" /> Unduh</button>
            </div>
            <div className="flex h-72 justify-center overflow-auto bg-slate-200 p-6">
              <div className="h-fit origin-top bg-white p-6 text-[10px] shadow" style={{ width: `${zoom * 2.2}px`, maxWidth: "none" }}>
                <p className="text-center text-sm font-bold">UNIVERSITAS ANDALAS</p>
                <p className="mt-3 text-center text-xs">SURAT PERNYATAAN MELAKSANAKAN TUGAS</p>
                <p className="mt-3 border-b pb-1">{u.dokumen.ket}</p>
                {u.dokumen.isi.map((l) => <p key={l} className="mt-1">{l}</p>)}
              </div>
            </div>
          </div>
        </Panel>

        <div className="grid gap-6 lg:grid-cols-3">
          <Panel className="lg:col-span-2">
            <h2 className="mb-3 font-semibold">Penanda Otomatis</h2>
            <ul className="divide-y">
              {u.penanda.map((x) => (
                <li key={x.judul} className="flex gap-3 py-3 text-xs">
                  {x.tipe === "ok" ? <CheckCircle2 className="size-4 shrink-0 text-primary" /> : <AlertTriangle className="size-4 shrink-0 text-orange-600" />}
                  <div><p className="font-semibold">{x.judul}</p><p className="text-[11px] text-muted-foreground">{x.ket}</p></div>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel>
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary"><TrendingUp className="size-4" /></span>
            <p className="mt-3 text-[11px] text-muted-foreground">Estimasi Dampak</p>
            <p className="text-2xl font-bold">+ {rupiah(u.dampak)}</p>
            <p className="mt-1 text-[10px] text-muted-foreground">Perkiraan selisih P1 Gross per bulan. Informasi saja, bukan nilai penetapan.</p>
          </Panel>
        </div>

        {sudahDiputuskan && (
          <Panel className="flex items-center gap-3 p-4">
            <CheckCircle2 className="size-6 text-primary" />
            <div><p className="text-xs font-semibold text-primary">{u.status === "Dikembalikan" ? "Usulan telah dikembalikan" : "Usulan telah diverifikasi"}</p><p className="text-[11px] text-muted-foreground">Keputusan tercatat dan tidak dapat diubah.</p></div>
          </Panel>
        )}
      </div>

      {!sudahDiputuskan && (
        <BilahAksi>
          <Button variant="ghost" onClick={() => navigate("/verifikator/jabatan")}><ArrowLeft /> Kembali ke Daftar</Button>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10" onClick={() => setDlgKembali(true)}><RotateCcw /> Kembalikan ke Kepegawaian</Button>
            <Button onClick={() => setDlgSetuju(true)}>Setujui dan Teruskan ke UPT Remunerasi</Button>
          </div>
        </BilahAksi>
      )}

      <SetujuiDialog
        open={dlgSetuju}
        onOpenChange={setDlgSetuju}
        deskripsi={`Usulan perubahan jabatan ${u.nama} (${u.jabatanLama} → ${u.jabatanBaru}) akan diteruskan ke UPT Remunerasi.`}
        onKonfirmasi={() => { putuskan({ jenis: "usulan", id: u.id, status: "Diverifikasi" }); toast.success("Usulan diverifikasi dan diteruskan ke UPT Remunerasi.") }}
      />
      <KembalikanDialog
        open={dlgKembali}
        onOpenChange={setDlgKembali}
        deskripsi="Usulan akan dikembalikan kepada Bidang Kepegawaian untuk diperbaiki."
        onKembalikan={(alasan) => { putuskan({ jenis: "usulan", id: u.id, status: "Dikembalikan", alasan }); toast.success("Usulan berhasil dikembalikan ke Kepegawaian.") }}
      />
    </>
  )
}
