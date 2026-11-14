import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { PageHeading, Panel } from "@/components/pegawai/shared"
import { FilterSelect, StatusVerifBadge, Tag, TH } from "@/components/verifikator/shared"
import { usePengajuan } from "@/data/store-verifikator"
import { rupiah } from "@/lib/format"

const unik = (a: string[]) => [...new Set(a)]

export default function VerifikasiPengajuanListPage() {
  const pengajuan = usePengajuan()
  const [periode, setPeriode] = useState("September 2026")
  const [unit, setUnit] = useState("semua")
  const [status, setStatus] = useState("semua")

  const rows = useMemo(
    () => pengajuan.filter((p) => (periode === "semua" || p.periode === periode) && (unit === "semua" || p.unit === unit) && (status === "semua" || p.status === status)),
    [pengajuan, periode, unit, status]
  )

  return (
    <>
      <PageHeading title="Verifikasi Pengajuan P1" desc="Periksa pengajuan P1 yang disampaikan Bendahara unit." />
      <Panel className="space-y-4 p-4">
        <div className="flex flex-wrap items-end gap-4">
          <FilterSelect label="Periode" value={periode} onChange={setPeriode} semua="Semua periode" opsi={unik(pengajuan.map((p) => p.periode))} lebar="w-44" />
          <FilterSelect label="Unit" value={unit} onChange={setUnit} semua="Semua unit" opsi={unik(pengajuan.map((p) => p.unit))} lebar="w-60" />
          <FilterSelect label="Status" value={status} onChange={setStatus} semua="Semua status" opsi={["Diajukan", "Dikembalikan", "Diverifikasi"]} lebar="w-44" />
        </div>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[56rem] text-xs">
            <thead className="bg-muted/50 text-left text-[11px] text-muted-foreground">
              <tr><TH>Nomor Pengajuan</TH><TH>Unit</TH><TH>Periode</TH><TH>Jumlah Pegawai</TH><TH>Total P1 Setelah Potongan</TH><TH>Tanggal Diajukan</TH><TH>Status</TH><TH>Aksi</TH></tr>
            </thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan={8} className="py-10 text-center text-muted-foreground">Tidak ada pengajuan yang cocok dengan filter ini.</td></tr>}
              {rows.map((p) => (
                <tr key={p.id} className="border-t odd:bg-muted/20">
                  <td className="px-4 py-4">
                    <p className="font-bold">{p.id}</p>
                    {p.ke > 1 && <div className="mt-1"><Tag>Pengajuan Ulang ke-{p.ke}</Tag></div>}
                  </td>
                  <td className="px-4 py-4">{p.unit}</td>
                  <td className="px-4 py-4">{p.periode}</td>
                  <td className="px-4 py-4">{p.jumlahPegawai}</td>
                  <td className="px-4 py-4">{rupiah(p.totalSetelah)}</td>
                  <td className="px-4 py-4">{p.tanggalDiajukan}</td>
                  <td className="px-4 py-4"><StatusVerifBadge status={p.status} /></td>
                  <td className="px-4 py-4"><Link to={`/verifikator/pengajuan/${p.id}`} className="font-semibold text-primary hover:underline">Periksa</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  )
}
