import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeading, Panel } from "@/components/pegawai/shared"
import { rupiah } from "@/lib/format"
import { pegawaiService } from "@/services/pegawaiService"

export default function SlipListPage() {
  const [slips, setSlips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSlips = async () => {
      try {
        setLoading(true)
        const result = await pegawaiService.getSlips()
        setSlips(result)
      } catch (error) {
        console.error('Failed to load slips:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchSlips()
  }, [])

  return (
    <>
      <PageHeading title="Slip P1" desc="Daftar slip P1 Anda untuk setiap periode." />
      <Panel className="p-0">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Memuat data...</p>
          </div>
        ) : slips.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Belum ada slip tersedia</p>
          </div>
        ) : (
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
              {slips.map((s) => (
                <TableRow key={s.IDSlip}>
                  <TableCell className="pl-6 font-medium">{s.Periode}</TableCell>
                  <TableCell>{s.NomorSlip}</TableCell>
                  <TableCell>{rupiah(s.JumlahNetto)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">{s.StatusSlip}</Badge>
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <Link to={`/pegawai/slip/${s.IDSlip}`} className="text-sm font-semibold text-primary hover:underline">
                      Lihat Detail
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Panel>
    </>
  )
}
