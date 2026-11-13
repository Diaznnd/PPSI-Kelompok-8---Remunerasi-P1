import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
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
    () => usulan.filter((u) => (unit === "semua" || u.unit === unit) && (jenis === "semua" || u.jenis === jenis) && (status === "semua" || u.status === status)),
    [usulan, unit, jenis, status]
  )

  return (
    <>
      <PageHeading title="Verifikasi Perubahan Jabatan/Grade" desc="Periksa usulan perubahan data jabatan dari Bidang Kepegawaian." />
      <Panel className="space-y-4 p-4">
        <div className="flex flex-wrap items-end gap-4">
          <FilterSelect label="Unit" value={unit} onChange={setUnit} semua="Semua unit" opsi={unik(usulan.map((u) => u.unit))} lebar="w-60" />
          <FilterSelect label="Jenis Perubahan" value={jenis} onChange={setJenis} semua="Semua jenis" opsi={unik(usulan.map((u) => u.jenis))} lebar="w-56" />
          <FilterSelect label="Status" value={status} onChange={setStatus} semua="Semua status" opsi={["Diajukan", "Dikembalikan", "Diverifikasi"]} lebar="w-44" />
        </div>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[60rem] text-xs">
            <thead className="bg-muted/50 text-left text-[11px] text-muted-foreground">
              <tr><TH>Nomor Usulan</TH><TH>Nama / NIP</TH><TH>Unit</TH><TH>Jabatan Lama</TH><TH>Jabatan Baru</TH><TH>Mulai Diusulkan</TH><TH>Tanggal Diajukan</TH><TH>Status</TH><TH>Aksi</TH></tr>
            </thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan={9} className="py-10 text-center text-muted-foreground">Tidak ada usulan yang cocok dengan filter ini.</td></tr>}
              {rows.map((u) => (
                <tr key={u.id} className="border-t odd:bg-muted/20">
                  <td className="px-4 py-4 font-bold">{u.id}</td>
                  <td className="px-4 py-4"><p className="font-bold">{u.nama}</p><p className="text-[10px] text-muted-foreground">{u.nip}</p></td>
                  <td className="px-4 py-4">{u.unit}</td>
                  <td className="px-4 py-4">{u.jabatanLama}</td>
                  <td className="px-4 py-4">{u.jabatanBaru}</td>
                  <td className="px-4 py-4">{u.mulai}</td>
                  <td className="px-4 py-4">{u.diajukan}</td>
                  <td className="px-4 py-4"><StatusVerifBadge status={u.status} /></td>
                  <td className="px-4 py-4"><Link to={`/verifikator/jabatan/${u.id}`} className="font-semibold text-primary hover:underline">Periksa</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  )
}
