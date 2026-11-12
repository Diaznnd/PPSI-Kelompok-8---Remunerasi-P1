import { Link } from "react-router-dom"
import { FileText, Info, MessageSquare, User } from "lucide-react"
import { usePeriode } from "@/layouts/PegawaiShell"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Field, PageHeading, Panel, PanelTitle } from "@/components/pegawai/shared"
import { DAFTAR_PENGADUAN, DAFTAR_SLIP, pegawai } from "@/data/dummy-pegawai"
import { rupiah } from "@/lib/format"

export default function BerandaPage() {
  const { periode } = usePeriode()
  const slip = DAFTAR_SLIP.find((s) => s.periode === periode) ?? DAFTAR_SLIP[0]
  const aktif = DAFTAR_PENGADUAN.filter((p) => p.status !== "Selesai").length

  return (
    <>
      <PageHeading title="Beranda" desc={`Ringkasan remunerasi Anda untuk periode ${periode}.`} />

      <div className="space-y-6">
        <Panel>
          <PanelTitle icon={User} title="Identitas Pegawai" desc="Data kepegawaian yang digunakan dalam perhitungan P1." right={<Badge variant="secondary" className="bg-primary/10 text-primary">{pegawai.status}</Badge>} />
          <div className="mt-5 grid gap-5 border-t pt-5 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Nama lengkap" value={pegawai.nama} />
            <Field label="NIP" value={pegawai.nip} />
            <Field label="Jenis pegawai" value={pegawai.jenis} />
            <Field label="Unit kerja" value={pegawai.unit} />
            <Field label="Jabatan" value={pegawai.jabatan} />
            <Field label="Grade" value={pegawai.grade} />
            <Field label="Pangkat/Golongan" value={pegawai.pangkat} />
            <Field label="NPWP fiktif" value={pegawai.npwp} />
          </div>
        </Panel>

        <div className="grid gap-6 md:grid-cols-5">
          <Panel className="md:col-span-3">
            <PanelTitle icon={FileText} title="Slip P1 Terbaru" desc={slip.periode} right={<Badge variant="secondary" className="bg-primary/10 text-primary">{slip.status}</Badge>} />
            <p className="mt-5 text-xs text-muted-foreground">Jumlah Netto</p>
            <p className="text-3xl font-bold text-primary">{rupiah(slip.netto)}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Dibayarkan ke {pegawai.rekening}</p>
            <Button asChild className="mt-4">
              <Link to={`/pegawai/slip/${slip.id}`}>Lihat Slip</Link>
            </Button>
          </Panel>

          <Panel className="md:col-span-2">
            <PanelTitle icon={MessageSquare} title="Pengaduan Saya" desc="Pengaduan yang masih dalam proses." />
            <p className="mt-5 flex items-baseline gap-2">
              <span className="text-3xl font-bold">{aktif}</span>
              <span className="text-xs text-muted-foreground">pengaduan aktif</span>
            </p>
            <Button asChild variant="outline" className="mt-4 w-full">
              <Link to="/pegawai/pengaduan">Lihat Semua</Link>
            </Button>
          </Panel>
        </div>

        <div className="flex gap-3 rounded-lg border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
          <Info className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-semibold">Informasi pembayaran P1</p>
            <p className="mt-1 text-xs">P1 periode Oktober 2026 dibayarkan pada November 2026.</p>
            <p className="text-xs">Perubahan jabatan atau grade berlaku mengikuti ketentuan Surat Pernyataan Melaksanakan Tugas.</p>
          </div>
        </div>
      </div>
    </>
  )
}
