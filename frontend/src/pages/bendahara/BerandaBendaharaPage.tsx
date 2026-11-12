import { Link } from "react-router-dom"
import { CalendarDays, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageHeading, Panel, PanelTitle } from "@/components/pegawai/shared"
import { Stepper } from "@/components/bendahara/Stepper"
import { cn } from "@/lib/utils"

const JADWAL = [
  { tgl: "1–5", judul: "Rekap absensi", status: "Selesai", warna: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  { tgl: "6–8", judul: "Penyusunan SK", status: "Berjalan", warna: "bg-amber-100 text-amber-800 border-amber-200" },
  { tgl: "9–13", judul: "Pencairan", status: "Akan datang", warna: "bg-muted text-muted-foreground" },
]
const STAT = [["245", "Pegawai aktif"], ["243", "Presensi lengkap"], ["7", "Perubahan jabatan"], ["2", "Hukuman disiplin"]]

export default function BerandaBendaharaPage() {
  return (
    <>
      <PageHeading title="Beranda Bendahara" desc="Kelola proses perhitungan P1 Fakultas Teknologi Informasi." />

      <div className="space-y-6">
        <Panel className="p-0">
          <div className="flex items-start justify-between p-6 pb-4">
            <div>
              <h2 className="font-semibold">Alur Bulan Ini</h2>
              <p className="text-xs text-muted-foreground">Periode September 2026</p>
            </div>
            <Badge variant="outline" className="border-orange-200 bg-orange-100 text-orange-800">Dikembalikan</Badge>
          </div>
          <div className="border-t px-6 py-6">
            <Stepper steps={["Data Presensi Siap", "Perhitungan", "Pengajuan", "Verifikasi", "Amprah"]} done={1} />
          </div>
          <div className="flex flex-wrap items-center justify-end gap-4 rounded-b-xl bg-primary/5 px-6 py-3">
            <p className="text-xs text-muted-foreground">Perhitungan perlu diperbaiki sesuai catatan Verifikator.</p>
            <Button asChild><Link to="/bendahara/perhitungan">Perbaiki Pengajuan</Link></Button>
          </div>
        </Panel>

        <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
          <Panel>
            <PanelTitle icon={CheckCircle2} title="Kesiapan Data Periode" desc="Data sumber dari Bidang Kepegawaian." />
            <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs">
              <p className="font-semibold text-emerald-800">Rekap presensi sudah tersedia</p>
              <p className="text-emerald-700">Diunggah Bidang Kepegawaian pada 3 Oktober 2026, 08.45 WIB.</p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {STAT.map(([n, l]) => (
                <div key={l} className="rounded-lg bg-primary/5 p-3">
                  <p className="text-xl font-bold">{n}</p>
                  <p className="text-[11px] text-muted-foreground">{l}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel>
            <PanelTitle icon={CalendarDays} title="Jadwal Tahapan" desc="Oktober 2026" />
            <ul className="mt-4 divide-y">
              {JADWAL.map((j) => (
                <li key={j.judul} className="flex items-center gap-3 py-3">
                  <div className="w-12 rounded-md bg-primary/5 py-1 text-center">
                    <p className="text-xs font-bold">{j.tgl}</p>
                    <p className="text-[10px] text-muted-foreground">Okt</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold">{j.judul}</p>
                    <Badge variant="outline" className={cn("mt-1 text-[10px]", j.warna)}>{j.status}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </>
  )
}
