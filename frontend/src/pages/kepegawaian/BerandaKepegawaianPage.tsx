import { Link } from "react-router-dom"
import { ArrowRight, Building2, CalendarCheck, Gavel, MessageSquare, TriangleAlert, Users, type LucideIcon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { PageHeading, Panel } from "@/components/pegawai/shared"
import { usePeriodeKepeg } from "@/layouts/KepegawaianShell"
import { statusHukuman } from "@/data/dummy-kepegawaian"
import { resetKepegawaian, useKepeg } from "@/data/store-kepegawaian"

export default function BerandaKepegawaianPage() {
  const { periode } = usePeriodeKepeg()
  const s = useKepeg()
  const aktif = s.pegawai.filter((p) => p.aktif).length
  const usulanTunggu = s.usulan.filter((u) => u.status === "Diajukan").length
  const dikembalikan = s.usulan.filter((u) => u.status === "Dikembalikan")
  const aduan = s.pengaduan.filter((a) => a.status === "Diajukan").length
  const hukuman = s.hukuman.filter((h) => statusHukuman(h) === "Aktif").length

  const kartu: [string, number, string, LucideIcon][] = [
    ["Pegawai aktif", aktif, "Ikut perhitungan P1", Users],
    ["Usulan menunggu Verifikator", usulanTunggu, "Jabatan/grade", Building2],
    ["Pengaduan perlu ditanggapi", aduan, "Layanan pegawai", MessageSquare],
    ["Hukuman disiplin aktif", hukuman, "Memengaruhi P1", Gavel],
  ]
  const tindakan = [
    ...dikembalikan.map((u) => ({ t: `Usulan ${u.id} (${u.nama}) dikembalikan Verifikator`, to: `/kepegawaian/usulan/${u.id}`, aksi: "Perbaiki" })),
    ...(aduan ? [{ t: `${aduan} pengaduan pegawai menunggu diagnosis`, to: "/kepegawaian/pengaduan", aksi: "Tanggapi" }] : []),
  ]
  const pintasan: [string, string, LucideIcon][] = [
    ["Data Pegawai", "/kepegawaian/pegawai", Users], ["Usulan Jabatan/Grade", "/kepegawaian/usulan", Building2],
    ["Presensi & Cuti/Izin", "/kepegawaian/presensi", CalendarCheck], ["Hukuman Disiplin", "/kepegawaian/hukuman", Gavel],
  ]

  return (
    <>
      <PageHeading
        title="Beranda Kepegawaian"
        desc={`Ringkasan pengelolaan data sumber P1 Fakultas Teknologi Informasi periode ${periode}.`}
        action={<Button variant="ghost" size="sm" onClick={() => { resetKepegawaian(); toast.success("Data demo dikembalikan ke awal.") }}>Reset data demo</Button>}
      />
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kartu.map(([l, v, s2, Icon]) => (
            <Panel key={l} className="p-5">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[11px] text-muted-foreground">{l}</p>
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="size-4" /></span>
              </div>
              <p className="mt-2 text-2xl font-bold">{v}</p>
              <p className="mt-1 text-[10px] text-muted-foreground">{s2}</p>
            </Panel>
          ))}
        </div>

        <Panel className="p-0">
          <div className="flex items-center gap-2 border-b p-5 text-sm font-semibold"><TriangleAlert className="size-4 text-orange-600" /> Perlu tindakan</div>
          {tindakan.length === 0 ? (
            <p className="p-5 text-xs text-muted-foreground">Tidak ada yang perlu ditindaklanjuti saat ini.</p>
          ) : tindakan.map((t) => (
            <div key={t.t} className="flex items-center justify-between gap-3 border-b px-5 py-3 text-xs last:border-b-0">
              <span>{t.t}</span>
              <Link to={t.to} className="inline-flex shrink-0 items-center gap-1 font-semibold text-primary hover:underline">{t.aksi} <ArrowRight className="size-3.5" /></Link>
            </div>
          ))}
        </Panel>

        <Panel>
          <h2 className="font-semibold">Pintasan</h2>
          <p className="text-xs text-muted-foreground">Akses cepat ke pekerjaan utama Bidang Kepegawaian.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {pintasan.map(([l, to, Icon]) => (
              <Link key={to} to={to} className="flex items-center justify-between gap-2 rounded-lg border px-4 py-3 text-xs font-semibold hover:bg-muted">
                <span className="flex items-center gap-2"><Icon className="size-4 text-primary" /> {l}</span><ArrowRight className="size-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </Panel>
      </div>
    </>
  )
}
