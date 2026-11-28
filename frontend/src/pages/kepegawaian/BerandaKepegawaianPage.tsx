import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, Building2, CalendarCheck, Gavel, Loader2, MessageSquare, TriangleAlert, Users, type LucideIcon } from "lucide-react"
import { toast } from "sonner"
import { PageHeading, Panel } from "@/components/pegawai/shared"
import { usePeriodeKepeg } from "@/layouts/KepegawaianShell"
import { kepegawaianService } from "@/services/kepegawaianService"

export default function BerandaKepegawaianPage() {
  const { periode } = usePeriodeKepeg()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [presensi, setPresensi] = useState<any>(null)
  const [unitKerja, setUnitKerja] = useState<string>("")

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true)
        const res = await kepegawaianService.getDashboard()
        setStats(res.statistik)
        setPresensi(res.presensi)
        setUnitKerja(res.unit_kerja)
      } catch (error) {
        console.error("Error fetching dashboard:", error)
        toast.error("Gagal memuat dashboard dari database.")
        setStats({
          pegawai_total: 0,
          pegawai_aktif: 0,
          usulan_menunggu: 0,
          usulan_dikembalikan: 0,
          pengaduan_menunggu: 0,
          hukuman_aktif: 0,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  const aktif = stats?.pegawai_aktif || 0
  const usulanTunggu = stats?.usulan_menunggu || 0
  const dikembalikan = stats?.usulan_dikembalikan || 0
  const aduan = stats?.pengaduan_menunggu || 0
  const hukuman = stats?.hukuman_aktif || 0

  const kartu: [string, number, string, LucideIcon][] = [
    ["Pegawai aktif", aktif, "Ikut perhitungan P1", Users],
    ["Usulan menunggu Verifikator", usulanTunggu, "Jabatan/grade", Building2],
    ["Pengaduan perlu ditanggapi", aduan, "Layanan pegawai", MessageSquare],
    ["Hukuman disiplin aktif", hukuman, "Memengaruhi P1", Gavel],
  ]
  
  const presensiDitolak = presensi?.status_approval === "ditolak"
  const presensiMenunggu = presensi?.status_approval === "menunggu_approval"

  const tindakan = [
    ...(presensiDitolak ? [{ t: `Rekap absensi ditolak PJ Unit: ${presensi?.alasan_penolakan || "Perlu perbaikan data"}`, to: "/kepegawaian/presensi", aksi: "Unggah Ulang" }] : []),
    ...(presensiMenunggu ? [{ t: `Rekap absensi ${presensi?.periode || periode} sedang menunggu approval PJ Unit`, to: "/kepegawaian/presensi", aksi: "Lihat Status" }] : []),
    ...(dikembalikan > 0 ? [{ t: `${dikembalikan} usulan dikembalikan Verifikator`, to: "/kepegawaian/usulan", aksi: "Lihat Usulan" }] : []),
    ...(aduan > 0 ? [{ t: `${aduan} pengaduan pegawai menunggu diagnosis`, to: "/kepegawaian/pengaduan", aksi: "Tanggapi" }] : []),
  ]
  
  const pintasan: [string, string, LucideIcon][] = [
    ["Data Pegawai", "/kepegawaian/pegawai", Users], ["Usulan Jabatan/Grade", "/kepegawaian/usulan", Building2],
    ["Presensi & Cuti/Izin", "/kepegawaian/presensi", CalendarCheck], ["Hukuman Disiplin", "/kepegawaian/hukuman", Gavel],
  ]

  return (
    <>
      <PageHeading
        title="Beranda Kepegawaian"
        desc={`Ringkasan pengelolaan data sumber P1 ${unitKerja} periode ${periode}.`}
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
