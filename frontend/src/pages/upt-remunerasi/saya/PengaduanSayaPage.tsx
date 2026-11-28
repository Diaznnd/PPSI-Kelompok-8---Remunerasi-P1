import { useMemo, useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Plus } from "lucide-react"
import { Panel } from "@/components/pegawai/shared"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader, Button } from "../components"
import {
  KATEGORI_PENGADUAN_SAYA,
  type StatusPengaduanSaya,
} from "@/types/pegawai"
import { pegawaiService } from "@/services/pegawaiService"
import { SayaChip } from "./SayaChip"

const STATUS_STYLE: Record<StatusPengaduanSaya, string> = {
  Diajukan: "border-amber-200 bg-amber-100 text-amber-800",
  Ditindaklanjuti: "border-amber-200 bg-amber-100 text-amber-800",
  Diteruskan: "border-sky-200 bg-sky-100 text-sky-800",
  Selesai: "border-emerald-200 bg-emerald-100 text-emerald-800",
}

export default function PengaduanSayaPage() {
  const [statusFilter, setStatusFilter] = useState("semua")
  const [kategoriFilter, setKategoriFilter] = useState("semua")
  const [allList, setAllList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPengaduan = async () => {
      try {
        setLoading(true)
        const data = await pegawaiService.getPengaduanList()
        if (Array.isArray(data)) setAllList(data)
      } catch (err) {
        console.error("Gagal memuat pengaduan:", err)
        setAllList([])
      } finally {
        setLoading(false)
      }
    }
    fetchPengaduan()
  }, [])

  const filtered = useMemo(() => {
    return allList.filter(
      (p) =>
        (statusFilter === "semua" || p.status === statusFilter) &&
        (kategoriFilter === "semua" || p.kategori === kategoriFilter)
    )
  }, [allList, statusFilter, kategoriFilter])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengaduan Saya"
        subtitle={
          <div>
            <p>Pantau seluruh pengaduan terkait remunerasi P1 Anda.</p>
            <SayaChip />
          </div>
        }
        actions={
          <Button asChild>
            <Link to="/upt-remunerasi/pengaduan-saya/baru">
              <Plus className="mr-1.5 size-4" />
              Buat Pengaduan Baru
            </Link>
          </Button>
        }
      />

      <Panel className="overflow-hidden p-0">
        <div className="flex flex-wrap gap-4 border-b p-4">
          <div className="space-y-1">
            <span className="block text-xs font-medium text-muted-foreground">Status</span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua Status</SelectItem>
                <SelectItem value="Diajukan">Diajukan</SelectItem>
                <SelectItem value="Ditindaklanjuti">Ditindaklanjuti</SelectItem>
                <SelectItem value="Diteruskan">Diteruskan</SelectItem>
                <SelectItem value="Selesai">Selesai</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <span className="block text-xs font-medium text-muted-foreground">Kategori</span>
            <Select value={kategoriFilter} onValueChange={setKategoriFilter}>
              <SelectTrigger className="w-64 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua Kategori</SelectItem>
                {KATEGORI_PENGADUAN_SAYA.map((k) => (
                  <SelectItem key={k.value} value={k.value}>
                    {k.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="pl-6">Nomor</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Periode</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-6 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                    Belum ada pengaduan yang sesuai dengan filter.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((p) => (
                  <TableRow key={p.nomor}>
                    <TableCell className="pl-6 font-mono text-xs font-semibold">{p.nomor}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm">{p.tanggal}</TableCell>
                    <TableCell className="text-sm">{p.kategori}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm">{p.periode}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={STATUS_STYLE[p.status]}>
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <Link
                        to={`/upt-remunerasi/pengaduan-saya/${p.nomor}`}
                        className="text-sm font-semibold text-primary hover:underline"
                      >
                        Lihat Detail
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Panel>
    </div>
  )
}
