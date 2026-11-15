import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Panel } from "@/components/pegawai/shared"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageHeader, StatusBadge, RupiahText } from "../components"
import { daftarSlipSaya } from "@/data/dummy-upt-saya"
import { SayaChip } from "./SayaChip"

export default function SlipSayaPage() {
  const [tahunFilter, setTahunFilter] = useState("semua")

  const tahunOptions = useMemo(() => {
    const set = new Set(daftarSlipSaya.map((s) => s.tahun))
    return Array.from(set).sort((a, b) => Number(b) - Number(a))
  }, [])

  const filtered = useMemo(() => {
    return daftarSlipSaya.filter((s) => tahunFilter === "semua" || s.tahun === tahunFilter)
  }, [tahunFilter])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Slip P1 Saya"
        subtitle={
          <div>
            <p>Daftar slip P1 Anda untuk setiap periode.</p>
            <SayaChip />
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Tahun:</span>
            <Select value={tahunFilter} onValueChange={setTahunFilter}>
              <SelectTrigger className="w-36 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua Tahun</SelectItem>
                {tahunOptions.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />

      <Panel className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="pl-6">Periode</TableHead>
                <TableHead>Nomor Slip</TableHead>
                <TableHead>Jumlah Netto</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-6 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                    Belum ada slip P1 untuk tahun yang dipilih.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((s) => {
                  const isBelum = s.status === "belum_terbit"
                  return (
                    <TableRow key={s.id} className={isBelum ? "bg-muted/40 text-muted-foreground" : undefined}>
                      <TableCell className="pl-6 font-medium">{s.periode}</TableCell>
                      <TableCell className="font-mono text-xs">{s.nomorSlip}</TableCell>
                      <TableCell>
                        {isBelum ? (
                          <span className="text-xs italic">
                            Slip periode ini belum terbit. Slip terbit setelah proses verifikasi dan penetapan selesai.
                          </span>
                        ) : (
                          <RupiahText value={s.jumlahNetto} className="font-semibold text-emerald-700" />
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={s.status} />
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        {!isBelum && (
                          <Link
                            to={`/upt-remunerasi/slip-saya/${s.id}`}
                            className="text-sm font-semibold text-primary hover:underline"
                          >
                            Lihat Detail
                          </Link>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Panel>
    </div>
  )
}
