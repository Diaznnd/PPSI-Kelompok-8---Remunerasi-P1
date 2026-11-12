import { useState } from "react"
import { Link } from "react-router-dom"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeading, Panel, StatusBadge } from "@/components/pegawai/shared"
import { DAFTAR_PENGADUAN, KATEGORI_PENGADUAN } from "@/data/dummy-pegawai"

const STATUS = ["Diajukan", "Ditindaklanjuti", "Diteruskan", "Selesai"]

export default function PengaduanListPage() {
  const [status, setStatus] = useState("semua")
  const [kategori, setKategori] = useState("semua")

  const data = DAFTAR_PENGADUAN.filter(
    (p) => (status === "semua" || p.status === status) && (kategori === "semua" || p.kategori === kategori)
  )

  return (
    <>
      <PageHeading
        title="Pengaduan Saya"
        desc="Pantau seluruh pengaduan terkait remunerasi P1 Anda."
        action={
          <Button asChild>
            <Link to="/pegawai/pengaduan/baru"><Plus /> Buat Pengaduan Baru</Link>
          </Button>
        }
      />

      <Panel className="p-0">
        <div className="flex flex-wrap gap-4 p-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua status</SelectItem>
                {STATUS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Kategori</Label>
            <Select value={kategori} onValueChange={setKategori}>
              <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua kategori</SelectItem>
                {KATEGORI_PENGADUAN.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="pl-4">Nomor</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Periode</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-4 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  Tidak ada pengaduan yang cocok dengan filter ini.
                </TableCell>
              </TableRow>
            )}
            {data.map((p) => (
              <TableRow key={p.nomor}>
                <TableCell className="pl-4 font-semibold">{p.nomor}</TableCell>
                <TableCell>{p.tanggal}</TableCell>
                <TableCell className="max-w-56 whitespace-normal">{p.kategori}</TableCell>
                <TableCell>{p.periode}</TableCell>
                <TableCell><StatusBadge status={p.status} /></TableCell>
                <TableCell className="pr-4 text-right">
                  <Link to={`/pegawai/pengaduan/${p.nomor}`} className="text-sm font-semibold text-primary hover:underline">
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
