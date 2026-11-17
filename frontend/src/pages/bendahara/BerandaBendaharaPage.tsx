import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { CalendarDays, CheckCircle2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageHeading, Panel, PanelTitle } from "@/components/pegawai/shared"
import { Stepper } from "@/components/bendahara/Stepper"
import { bendaharaService } from "@/services/bendaharaService"
import { cn } from "@/lib/utils"

export default function BerandaBendaharaPage() {
  const { akun } = useAuth()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [jadwal] = useState([
    { tgl: "1–5", judul: "Rekap absensi", status: "Selesai", warna: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    { tgl: "6–8", judul: "Penyusunan SK", status: "Berjalan", warna: "bg-amber-100 text-amber-800 border-amber-200" },
    { tgl: "9–13", judul: "Pencairan", status: "Akan datang", warna: "bg-muted text-muted-foreground" },
  ])

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true)
        const res = await bendaharaService.getDashboard("2026-10")
        setData(res)
      } catch (error) {
        console.error("Error fetching dashboard:", error)
        toast.error("Gagal memuat dashboard")
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  const unitNama = data?.unit?.nama || akun?.unit_nama || "Fakultas Teknologi Informasi"
  const alur = data?.alur_bulan_ini ?? {
    status: "draft",
    done_step: 1,
    dikembalikan: false,
    catatan_pengembalian: null,
  }
  const stat = data?.statistik ?? {
    pegawai_aktif: 245,
    presensi_lengkap: 243,
    perubahan_jabatan: 7,
    hukuman_disiplin: 2,
  }

  const statItems = [
    [String(stat.pegawai_aktif), "Pegawai aktif"],
    [String(stat.presensi_lengkap), "Presensi lengkap"],
    [String(stat.perubahan_jabatan), "Perubahan jabatan"],
    [String(stat.hukuman_disiplin), "Hukuman disiplin"],
  ]

  return (
    <>
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-primary" />
          <span className="ml-3 text-sm text-muted-foreground">Memuat dashboard...</span>
        </div>
      )}

      {!loading && (
        <>
      <PageHeading
        title="Beranda Bendahara"
        desc={`Kelola proses perhitungan P1 ${unitNama}.`}
      />

      <div className="space-y-6">
        <Panel className="p-0">
          <div className="flex items-start justify-between p-6 pb-4">
            <div>
              <h2 className="font-semibold">Alur Bulan Ini</h2>
              <p className="text-xs text-muted-foreground">Periode Oktober 2026</p>
            </div>
            {alur.dikembalikan ? (
              <Badge variant="outline" className="border-orange-200 bg-orange-100 text-orange-800">
                Dikembalikan
              </Badge>
            ) : (
              <Badge variant="outline" className="border-emerald-200 bg-emerald-100 text-emerald-800 uppercase">
                {alur.status || "Draft"}
              </Badge>
            )}
          </div>
          <div className="border-t px-6 py-6">
            <Stepper
              steps={["Data Presensi Siap", "Perhitungan", "Pengajuan", "Verifikasi", "Amprah"]}
              done={alur.done_step ?? 1}
            />
          </div>
          <div className="flex flex-wrap items-center justify-end gap-4 rounded-b-xl bg-primary/5 px-6 py-3">
            <p className="text-xs text-muted-foreground">
              {alur.catatan_pengembalian ??
                (alur.done_step >= 3
                  ? "Pengajuan P1 sedang diproses oleh Tim Verifikator."
                  : "Periksa kelengkapan data dan jalankan perhitungan P1.")}
            </p>
            <Button asChild>
              <Link to="/bendahara/perhitungan">
                {alur.dikembalikan ? "Perbaiki Pengajuan" : "Mulai Perhitungan"}
              </Link>
            </Button>
          </div>
        </Panel>

        <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
          <Panel>
            <PanelTitle icon={CheckCircle2} title="Kesiapan Data Periode" desc="Data sumber dari Bidang Kepegawaian." />
            <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs">
              <p className="font-semibold text-emerald-800">
                {data?.kesiapan?.presensi_siap ? "Rekap presensi sudah tersedia" : "Menunggu unggahan presensi"}
              </p>
              <p className="text-emerald-700">
                {data?.kesiapan?.waktu_unggah
                  ? `Diunggah Bidang Kepegawaian pada ${data.kesiapan.waktu_unggah}.`
                  : "Presensi diproses oleh Bidang Kepegawaian."}
              </p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {statItems.map(([n, l]) => (
                <div key={l} className="rounded-lg bg-primary/5 p-3">
                  <p className="text-xl font-bold">{loading ? "..." : n}</p>
                  <p className="text-[11px] text-muted-foreground">{l}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel>
            <PanelTitle icon={CalendarDays} title="Jadwal Tahapan" desc="Oktober 2026" />
            <ul className="mt-4 divide-y">
              {jadwal.map((j) => (
                <li key={j.judul} className="flex items-center gap-3 py-3">
                  <div className="w-12 rounded-md bg-primary/5 py-1 text-center">
                    <p className="text-xs font-bold">{j.tgl}</p>
                    <p className="text-[10px] text-muted-foreground">Okt</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold">{j.judul}</p>
                    <Badge variant="outline" className={cn("mt-1 text-[10px]", j.warna)}>
                      {j.status}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
        </>
      )}
    </>
  )
}
