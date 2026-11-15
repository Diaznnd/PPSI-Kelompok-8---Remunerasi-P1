import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, Info, MessageSquare, Receipt, User } from "lucide-react"
import { Field, Panel, PanelTitle } from "@/components/pegawai/shared"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  PageHeader,
  StatusBadge,
  Button,
  RupiahText,
  DataTable,
  WarningBanner,
  type ColumnDef,
} from "../components"
import {
  profilSaya,
  daftarSlipSaya,
  getPengaduanSayaList,
  type SlipSayaItem,
} from "@/data/dummy-upt-saya"
import { SayaChip } from "./SayaChip"

export default function BerandaSayaPage() {
  const [loading] = useState(false)
  const [error] = useState<string | null>(null)

  const slipTerbaru = daftarSlipSaya.find((s) => s.status === "terbit") ?? daftarSlipSaya[0]
  const slipBerjalan = daftarSlipSaya[0]
  const tigaSlipTerakhir = daftarSlipSaya.filter((s) => s.status === "terbit").slice(0, 3)

  const pengaduanList = getPengaduanSayaList()
  const pengaduanAktif = pengaduanList.filter((p) => p.status !== "Selesai")
  const pengaduanTerbaru = pengaduanAktif[0] ?? pengaduanList[0]

  const slipColumns: ColumnDef<SlipSayaItem>[] = [
    { header: "Periode", cell: (row) => <span className="font-medium">{row.periode}</span> },
    { header: "Nomor Slip", cell: (row) => <span className="font-mono text-xs">{row.nomorSlip}</span> },
    { header: "Jumlah Netto", cell: (row) => <RupiahText value={row.jumlahNetto} className="font-semibold text-emerald-700" /> },
    { header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
    {
      header: "Aksi",
      className: "text-right",
      cell: (row) => (
        <Link
          to={`/upt-remunerasi/slip-saya/${row.id}`}
          className="text-sm font-semibold text-primary hover:underline"
        >
          Lihat Slip
        </Link>
      ),
    },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-14 w-72" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-44 rounded-xl" />
          <Skeleton className="h-44 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Beranda Saya"
        subtitle={
          <div>
            <p>Ringkasan remunerasi P1 Anda sebagai pegawai.</p>
            <SayaChip readOnly />
          </div>
        }
      />

      {error && (
        <WarningBanner variant="error" title="Gagal Memuat Data">
          {error}
        </WarningBanner>
      )}

      <Panel>
        <PanelTitle
          icon={User}
          title="Identitas Pegawai"
          desc="Data kepegawaian pribadi yang digunakan dalam perhitungan P1 Anda."
          right={
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {profilSaya.statusKepegawaian} ({profilSaya.pengaliStatus}%)
            </Badge>
          }
        />
        <div className="mt-5 grid gap-5 border-t pt-5 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Nama Lengkap" value={profilSaya.nama} />
          <Field label="NIP" value={<span className="font-mono">{profilSaya.nip}</span>} />
          <Field label="Jabatan" value={profilSaya.jabatan} />
          <Field label="Grade" value={`Grade ${profilSaya.grade} (Nilai ${profilSaya.nilaiJabatan.toLocaleString("id-ID")})`} />
          <Field label="Unit Kerja" value={profilSaya.unit} />
          <Field label="Status Kepegawaian" value={profilSaya.statusKepegawaian} />
        </div>
      </Panel>

      <div className="grid gap-6 md:grid-cols-2">
        <Panel className="flex flex-col justify-between gap-4">
          <div className="space-y-4">
            <PanelTitle
              icon={Receipt}
              title="Slip P1 Terbaru"
              desc={
                slipBerjalan?.status === "belum_terbit"
                  ? `Periode berjalan (${slipBerjalan.periode}): Slip periode ini belum terbit.`
                  : "Slip P1 terakhir yang telah terbit."
              }
              right={<StatusBadge status={slipTerbaru.status} />}
            />
            {slipTerbaru.status === "terbit" ? (
              <div className="rounded-xl border bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground">Periode {slipTerbaru.periode}</p>
                <p className="mt-1 text-2xl font-bold text-emerald-700">
                  <RupiahText value={slipTerbaru.jumlahNetto} />
                </p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">{slipTerbaru.nomorSlip}</p>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                Slip periode ini belum terbit.
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <Button asChild>
              <Link to={`/upt-remunerasi/slip-saya/${slipTerbaru.id}`}>
                Lihat Slip <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </Panel>

        <Panel className="flex flex-col justify-between gap-4">
          <div className="space-y-4">
            <PanelTitle
              icon={MessageSquare}
              title="Pengaduan Aktif"
              desc="Pengaduan pribadi yang sedang diproses."
              right={
                <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800">
                  {pengaduanAktif.length} Aktif
                </Badge>
              }
            />
            {pengaduanTerbaru ? (
              <div className="rounded-xl border bg-muted/30 p-4 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-muted-foreground">{pengaduanTerbaru.nomor}</span>
                  <StatusBadge status={pengaduanTerbaru.status.toLowerCase()} />
                </div>
                <p className="text-sm font-semibold text-foreground">{pengaduanTerbaru.judul}</p>
                <p className="text-xs text-muted-foreground">
                  {pengaduanTerbaru.kategori} · {pengaduanTerbaru.periode}
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                Belum ada pengaduan yang Anda ajukan.
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <Button asChild variant="outline">
              <Link to="/upt-remunerasi/pengaduan-saya">
                Lihat Pengaduan <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </Panel>
      </div>

      <WarningBanner variant="info" title="Informasi Jadwal Pembayaran P1 (Pasal 16 ayat 1)">
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 size-4 shrink-0" />
          <span>P1 dibayarkan pada bulan berikutnya setelah proses verifikasi dan penetapan selesai.</span>
        </div>
      </WarningBanner>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">3 Slip P1 Terakhir</h2>
          <Link to="/upt-remunerasi/slip-saya" className="text-sm font-medium text-primary hover:underline">
            Lihat Semua Slip
          </Link>
        </div>
        <DataTable
          columns={slipColumns}
          data={tigaSlipTerakhir}
          emptyText="Belum ada slip P1 yang terbit."
          pageSize={5}
        />
      </div>
    </div>
  )
}
