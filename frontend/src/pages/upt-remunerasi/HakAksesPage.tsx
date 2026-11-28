import { Lock, Building, Globe } from "lucide-react"
import { PageHeader, WarningBanner, Card, CardContent } from "./components"
import { matrixHakAksesDetail, type MatriksHakAksesRow } from "@/types/upt"
import { Badge } from "@/components/ui/badge"

function PermCell({ perm }: { perm: { lihat: boolean; ubah: boolean } }) {
  if (perm.lihat && perm.ubah) {
    return (
      <div className="flex flex-col items-center justify-center gap-0.5">
        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] font-semibold px-2 py-0.5">
          Lihat & Ubah
        </Badge>
      </div>
    )
  }
  if (perm.lihat) {
    return (
      <div className="flex flex-col items-center justify-center gap-0.5">
        <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200 text-[10px] font-medium px-2 py-0.5">
          Hanya Lihat
        </Badge>
      </div>
    )
  }
  return <span className="text-muted-foreground/40 font-mono text-center block">-</span>
}

export function MatriksHakAksesSection() {
  return (
    <div className="space-y-6">
      <WarningBanner variant="info" title="Pemeriksaan Otorisasi di Sisi Server">
        Akses diperiksa ulang di server pada setiap permintaan (<em>request-level enforcement</em>) berdasarkan penugasan
        peran aktif dan batasan unit kerja pengguna. Matriks di bawah ini merupakan referensi resmi yang dikonfigurasi
        pada gerbang keamanan sistem (RoleGuard & Policy Enforcement).
      </WarningBanner>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b bg-muted/60 text-muted-foreground text-center">
                <th className="p-3 text-left font-semibold text-foreground w-64">Modul / Fitur Alur Kerja</th>
                <th className="p-3 font-semibold text-slate-800 border-l">
                  Pegawai
                  <span className="block text-[10px] font-normal text-muted-foreground">(Peran Dasar)</span>
                </th>
                <th className="p-3 font-semibold text-sky-800 border-l">
                  Kepegawaian Unit
                  <span className="block text-[10px] font-normal text-muted-foreground">(Unit Kerja)</span>
                </th>
                <th className="p-3 font-semibold text-emerald-800 border-l">
                  Bendahara Unit
                  <span className="block text-[10px] font-normal text-muted-foreground">(Unit Kerja)</span>
                </th>
                <th className="p-3 font-semibold text-amber-800 border-l">
                  PJ Remunerasi Unit
                  <span className="block text-[10px] font-normal text-muted-foreground">(Ex-officio WD2)</span>
                </th>
                <th className="p-3 font-semibold text-indigo-800 border-l">
                  Verifikator
                  <span className="block text-[10px] font-normal text-muted-foreground">(Universitas)</span>
                </th>
                <th className="p-3 font-semibold text-purple-800 border-l">
                  UPT Remunerasi
                  <span className="block text-[10px] font-normal text-muted-foreground">(Admin Pusat)</span>
                </th>
                <th className="p-3 text-left font-semibold text-foreground border-l w-56">
                  Cakupan Data (Scope)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {matrixHakAksesDetail.map((row: MatriksHakAksesRow, idx: number) => (
                <tr key={idx} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-semibold text-foreground text-left">
                    {row.modul}
                  </td>
                  <td className="p-2 border-l">
                    <PermCell perm={row.pegawai} />
                  </td>
                  <td className="p-2 border-l">
                    <PermCell perm={row.kepegawaian} />
                  </td>
                  <td className="p-2 border-l">
                    <PermCell perm={row.bendahara} />
                  </td>
                  <td className="p-2 border-l">
                    <PermCell perm={row.penanggungJawab} />
                  </td>
                  <td className="p-2 border-l">
                    <PermCell perm={row.verifikator} />
                  </td>
                  <td className="p-2 border-l">
                    <PermCell perm={row.upt} />
                  </td>
                  <td className="p-3 border-l text-[11px] text-muted-foreground leading-snug">
                    <span className="font-medium text-foreground/80">{row.cakupanData}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <Card className="border-slate-200">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <Building className="size-4 text-emerald-600" />
              <span>Cakupan Pejabat Unit Kerja</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Bendahara, Bidang Kepegawaian, dan Penanggung Jawab Remunerasi Unit hanya dapat mengakses, mengubah, dan
              mengunduh berkas pengajuan pada unit kerjanya masing-masing.
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <Globe className="size-4 text-sky-600" />
              <span>Cakupan Verifikator & UPT</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Verifikator dan Tim UPT Remunerasi memiliki akses lintas-unit (seluruh universitas) untuk keperluan
              validasi, penyusunan amprah induk universitas, dan pengawasan sistemik.
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <Lock className="size-4 text-purple-600" />
              <span>Pemisahan Tugas (Segregation of Duties)</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Sistem secara otomatis mencegah konflik kepentingan: personil yang menjabat sebagai Bendahara Pengeluaran
              tidak dapat merangkap menjadi Verifikator, begitu pula sebaliknya.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function HakAksesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Matriks Hak Akses Peran (RBAC)"
        subtitle="Matriks izin akses dan kewenangan berbasis peran (Role-Based Access Control) pada seluruh modul sistem SIREMUN-P1."
      />
      <MatriksHakAksesSection />
    </div>
  )
}
