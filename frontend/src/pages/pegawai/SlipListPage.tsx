import { Link } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeading, Panel } from "@/components/pegawai/shared"
import { DAFTAR_SLIP } from "@/data/dummy-pegawai"
import { rupiah } from "@/lib/format"

export default function SlipListPage() {
  return (
    <>
      <PageHeading title="Slip P1" desc="Daftar slip P1 Anda untuk setiap periode." />
      <Panel className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Periode</TableHead>
              <TableHead>Nomor slip</TableHead>
              <TableHead>Jumlah netto</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-6 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {DAFTAR_SLIP.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="pl-6 font-medium">{s.periode}</TableCell>
                <TableCell>{s.nomor}</TableCell>
                <TableCell>{rupiah(s.netto)}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">{s.status}</Badge>
                </TableCell>
                <TableCell className="pr-6 text-right">
                  <Link to={`/pegawai/slip/${s.id}`} className="text-sm font-semibold text-primary hover:underline">
                    Lihat Detail
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Panel>
    </>
  )
}
