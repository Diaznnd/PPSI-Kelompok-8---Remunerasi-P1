import { Link } from "react-router-dom"
import { Download } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { PageHeading, Panel } from "@/components/pegawai/shared"
import { DAFTAR_AMPRAH, bendahara } from "@/data/dummy-bendahara"
import { rupiah } from "@/lib/format"

export default function AmprahListPage() {
  return (
    <>
      <PageHeading title="Amprah" desc={`Daftar dokumen amprah P1 ${bendahara.unit}.`} />
      <Panel className="overflow-x-auto p-0">
        <table className="w-full min-w-[56rem] text-xs">
          <thead className="bg-muted/50 text-left text-[11px] text-muted-foreground">
            <tr>{["Periode", "Nomor Amprah", "Kelompok", "Jumlah Pegawai", "Total Jumlah Netto", "Tanggal Terbit", "Status", "Aksi"].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
          </thead>
          <tbody>
            {DAFTAR_AMPRAH.map((a) => (
              <tr key={a.id} className={a.tersedia ? "border-t odd:bg-muted/20" : "border-t bg-muted/30"}>
                <td className="px-4 py-4"><p className="font-bold">{a.periode}</p>{!a.tersedia && <p className="text-[10px] text-muted-foreground">Menunggu penghitungan pajak oleh UPT Remunerasi.</p>}</td>
                <td className="px-4 py-4">{a.nomor}</td>
                <td className="px-4 py-4">{a.kelompok}</td>
                <td className="px-4 py-4">{a.tersedia ? a.jumlah : "—"}</td>
                <td className="px-4 py-4">{a.tersedia ? rupiah(a.netto) : "—"}</td>
                <td className="px-4 py-4">{a.terbit}</td>
                <td className="px-4 py-4">
                  {a.tersedia ? <Badge className="bg-primary text-primary-foreground">Amprah Tersedia</Badge> : <Badge variant="secondary">Belum Tersedia</Badge>}
                </td>
                <td className="whitespace-nowrap px-4 py-4 font-semibold text-primary">
                  {a.tersedia ? (
                    <>
                      <Link to={`/bendahara/amprah/${a.id}`} className="hover:underline">Lihat</Link>
                      <button className="ml-4 inline-flex items-center gap-1 hover:underline" onClick={() => toast.info("Unduh belum tersambung ke backend (dummy).")}><Download className="size-3.5" /> Unduh</button>
                    </>
                  ) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </>
  )
}
