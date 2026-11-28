import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, Building2, CheckCircle2, Clock, RotateCcw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { PageHeading, Panel } from "@/components/pegawai/shared"
import { FilterSelect, StatusVerifBadge, TH } from "@/components/verifikator/shared"
import { useUsulan } from "@/data/store-verifikator"

const unik = (a: string[]) => [...new Set(a)]

export default function PerubahanJabatanListPage() {
  const usulan = useUsulan()
  const [unit, setUnit] = useState("semua")
  const [jenis, setJenis] = useState("semua")
  const [status, setStatus] = useState("semua")

  const rows = useMemo(
    () =>
      usulan.filter(
        (u) =>
          (unit === "semua" || u.unit === unit) &&
          (jenis === "semua" || u.jenis === jenis) &&
          (status === "semua" || u.status === status)
      ),
    [usulan, unit, jenis, status]
  )

  const groupedByUnit = useMemo(() => {
    const groups: Record<string, typeof rows> = {}
    rows.forEach((u) => {
      const key = u.unit || "Unit Kerja Lainnya"
      if (!groups[key]) groups[key] = []
      groups[key].push(u)
    })
    return Object.entries(groups)
  }, [rows])

  const summary = useMemo(
    () => ({
      total: rows.length,
      diajukan: rows.filter((r) => r.status === "Diajukan").length,
      dikembalikan: rows.filter((r) => r.status === "Dikembalikan").length,
      diverifikasi: rows.filter((r) => r.status === "Diverifikasi").length,
    }),
    [rows]
  )

  return (
    <>
      <PageHeading
        title="Verifikasi Perubahan Jabatan/Grade"
        desc="Periksa usulan perubahan jabatan dan mutasi unit dari Bidang Kepegawaian, dikelompokkan per unit kerja."
      />

      <div className="space-y-6 pb-10">
        {/* KPI Ringkasan */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Panel className="border-l-4 border-l-primary p-4">
            <p className="text-xs text-muted-foreground">Total Usulan</p>
            <p className="mt-1 text-2xl font-bold">{summary.total}</p>
            <p className="text-[11px] text-muted-foreground">Dari {groupedByUnit.length} unit kerja</p>
          </Panel>
          <Panel className="border-l-4 border-l-blue-500 p-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Menunggu Verifikasi</span>
              <Clock className="size-4 text-blue-600" />
            </div>
            <p className="mt-1 text-2xl font-bold text-blue-700 dark:text-blue-400">{summary.diajukan}</p>
          </Panel>
          <Panel className="border-l-4 border-l-amber-500 p-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Dikembalikan</span>
              <RotateCcw className="size-4 text-amber-600" />
            </div>
            <p className="mt-1 text-2xl font-bold text-amber-700 dark:text-amber-400">{summary.dikembalikan}</p>
          </Panel>
          <Panel className="border-l-4 border-l-emerald-500 p-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Sudah Diverifikasi</span>
              <CheckCircle2 className="size-4 text-emerald-600" />
            </div>
            <p className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-400">{summary.diverifikasi}</p>
          </Panel>
        </div>

        <Panel className="p-4">
          <div className="flex flex-wrap items-end gap-4">
            <FilterSelect
              label="Unit Kerja"
              value={unit}
              onChange={setUnit}
              semua="Semua unit"
              opsi={unik(usulan.map((u) => u.unit))}
              lebar="w-60"
            />
            <FilterSelect
              label="Jenis Perubahan"
              value={jenis}
              onChange={setJenis}
              semua="Semua jenis"
              opsi={unik(usulan.map((u) => u.jenis))}
              lebar="w-56"
            />
            <FilterSelect
              label="Status"
              value={status}
              onChange={setStatus}
              semua="Semua status"
              opsi={["Diajukan", "Dikembalikan", "Diverifikasi"]}
              lebar="w-44"
            />
          </div>
        </Panel>

        {groupedByUnit.length === 0 ? (
          <Panel className="py-12 text-center text-sm text-muted-foreground">
            Tidak ada usulan perubahan jabatan/grade yang cocok dengan filter ini.
          </Panel>
        ) : (
          groupedByUnit.map(([unitNama, items]) => {
            const jmlDiajukan = items.filter((i) => i.status === "Diajukan").length
            const jmlVerif = items.filter((i) => i.status === "Diverifikasi").length
            return (
              <Panel key={unitNama} className="overflow-hidden p-0">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-muted/30 px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Building2 className="size-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold">{unitNama}</h2>
                      <p className="text-[11px] text-muted-foreground">{items.length} usulan tercatat</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {jmlDiajukan > 0 && (
                      <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-800">
                        {jmlDiajukan} Menunggu
                      </Badge>
                    )}
                    {jmlVerif > 0 && (
                      <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-800">
                        {jmlVerif} Diverifikasi
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[56rem] text-xs">
                    <thead className="bg-muted/30 text-left text-[11px] text-muted-foreground">
                      <tr>
                        <TH>Nomor Usulan</TH>
                        <TH>Nama / NIP</TH>
                        <TH>Jabatan Lama</TH>
                        <TH>Jabatan Baru</TH>
                        <TH>Mulai Berlaku</TH>
                        <TH>Tanggal Diajukan</TH>
                        <TH>Status</TH>
                        <TH>Aksi</TH>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((u) => (
                        <tr key={u.id} className="border-t odd:bg-muted/10 hover:bg-muted/30">
                          <td className="px-4 py-3.5 font-mono font-bold text-primary">{u.id}</td>
                          <td className="px-4 py-3.5">
                            <p className="font-bold">{u.nama}</p>
                            <p className="font-mono text-[10px] text-muted-foreground">{u.nip}</p>
                          </td>
                          <td className="px-4 py-3.5 text-muted-foreground">{u.jabatanLama}</td>
                          <td className="px-4 py-3.5 font-medium">{u.jabatanBaru}</td>
                          <td className="px-4 py-3.5">{u.mulai}</td>
                          <td className="px-4 py-3.5">{u.diajukan}</td>
                          <td className="px-4 py-3.5">
                            <StatusVerifBadge status={u.status} />
                          </td>
                          <td className="px-4 py-3.5">
                            <Link
                              to={`/verifikator/jabatan/${u.id}`}
                              className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                            >
                              Periksa <ArrowRight className="size-3" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
            )
          })
        )}
      </div>
    </>
  )
}
