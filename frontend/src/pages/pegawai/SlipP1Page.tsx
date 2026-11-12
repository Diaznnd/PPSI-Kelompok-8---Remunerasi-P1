import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, Printer, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { dummyPegawai, dummySlip, dummyPeriode, formatRupiah } from "@/lib/dummy"

export default function SlipP1Page() {
  const nav = useNavigate()
  const [aktivTab, setAktifTab] = useState(dummyPeriode[0])
  const slip = dummySlip[aktivTab]

  if (!slip) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-muted-foreground">Slip untuk periode ini belum tersedia.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => nav(-1)}
            className="mb-2 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft size={16} /> Kembali
          </button>
          <h1 className="text-2xl font-bold">Detail Slip P1</h1>
          <p className="text-sm text-muted-foreground">
            Detail slip P1 perhitungan pada periode {aktivTab}.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Printer size={14} /> Cetak
          </Button>
          <Button size="sm" className="gap-2">
            <Download size={14} /> Unduh PDF
          </Button>
        </div>
      </div>

      {/* Tabs periode */}
      <div className="flex gap-1 rounded-lg border bg-muted/30 p-1 w-fit">
        {dummyPeriode.map((p) => (
          <button
            key={p}
            onClick={() => setAktifTab(p)}
            className={cn(
              "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
              aktivTab === p
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Identitas */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Identitas / Info Pegawai</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 md:grid-cols-3">
            {[
              { label: "Nama Lengkap", value: dummyPegawai.namaLengkap },
              { label: "NIP",          value: dummyPegawai.nip },
              { label: "Jabatan",      value: dummyPegawai.jabatanFungsional },
              { label: "Periode",      value: slip.periode },
              { label: "NIP Atasan",   value: dummyPegawai.nipAtasan },
              { label: "No. Slip",     value: slip.nipSlip },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-sm font-medium mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dasar Perhitungan */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Dasar Perhitungan</CardTitle>
          <p className="text-xs text-muted-foreground">Komponen utama yang menentukan nilai honorarium P1</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 divide-x rounded-lg border">
            {[
              { label: "Jumlah poin",        value: `${slip.jumlahPoin.toLocaleString("id-ID")} poin` },
              { label: "Nilai per poin",      value: formatRupiah(slip.nilaiPerPoin) },
              { label: "Total honorarium P1", value: formatRupiah(slip.totalHonorarium), highlight: true },
            ].map((item) => (
              <div key={item.label} className={cn("px-5 py-4", item.highlight && "bg-primary/5")}>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className={cn("text-lg font-bold mt-1", item.highlight && "text-primary")}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            * Total honorarium = Jumlah poin × Nilai per poin
          </p>
        </CardContent>
      </Card>

      {/* Rincian Kehadiran */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Rincian Perhitungan Kehadiran</CardTitle>
          <p className="text-xs text-muted-foreground">Potongan berdasarkan komponen kehadiran dan kinerja</p>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="pl-6">Komponen</TableHead>
                <TableHead className="text-center">Jumlah</TableHead>
                <TableHead className="text-center">Tarif</TableHead>
                <TableHead className="pr-6 text-right">Potongan P1</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slip.rincianKehadiran.map((r, i) => {
                const isTotal = r.komponen.startsWith("Total")
                return (
                  <TableRow key={i} className={isTotal ? "bg-muted/30 font-semibold" : ""}>
                    <TableCell className={cn("pl-6", isTotal && "text-sm")}>{r.komponen}</TableCell>
                    <TableCell className="text-center text-sm">{r.jumlah}</TableCell>
                    <TableCell className="text-center text-sm">{r.tarif}</TableCell>
                    <TableCell className="pr-6 text-right text-sm">{r.potonganP1}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Simpulan Nilai */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Simpulan Nilai</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { label: "Total Honorarium P1",         value: formatRupiah(slip.totalHonorarium) },
              { label: "Potongan Kehadiran",           value: `- ${formatRupiah(slip.totalPotonganKehadiran)}`, merah: true },
              { label: "Honorarium Setelah Potongan", value: formatRupiah(slip.honorariumSetelahPotongan) },
              { label: `Pajak PPh 21 (${slip.pph21Persen}%)`, value: `- ${formatRupiah(slip.pph21Nominal)}`, merah: true },
            ].map((row) => (
              <div key={row.label} className="flex justify-between text-sm py-1 border-b last:border-0">
                <span className="text-muted-foreground">{row.label}</span>
                <span className={cn("font-medium", row.merah && "text-destructive")}>{row.value}</span>
              </div>
            ))}
            <div className="flex justify-between items-center rounded-lg bg-primary/5 border border-primary/20 px-4 py-3 mt-2">
              <span className="font-semibold">Jumlah Neto P1</span>
              <span className="text-xl font-bold text-primary">{formatRupiah(slip.jumlahNeto)}</span>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Dibayarkan ke {dummyPegawai.rekening}
          </p>
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="flex justify-between gap-3 border-t pt-4">
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Konfirmasi ke Atasan</Button>
          <Button variant="outline" size="sm" onClick={() => nav("/pegawai/pengaduan/baru")}>
            Ajukan Pengaduan
          </Button>
        </div>
        <Button size="sm" className="gap-2">
          <Download size={14} /> Unduh PDF
        </Button>
      </div>
    </div>
  )
}
