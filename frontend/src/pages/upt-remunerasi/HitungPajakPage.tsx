import { useState, useMemo } from "react"
import { Link } from "react-router-dom"
import { Search, Calculator, CheckCircle2, Clock } from "lucide-react"
import {
  PageHeader,
  StatCard,
  DataTable,
  StatusBadge,
  Button,
  Input,
  RupiahText,
  usePeriode,
  type ColumnDef,
} from "./components"
import {
  pengajuanUPT,
  periodeUPT,
  unitKerja,
  rupiah,
  type UPTPengajuan,
} from "@/data/dummy-upt"

export default function HitungPajakPage() {
  const { periode: activePeriode } = usePeriode()
  const [periodeFilter, setPeriodeFilter] = useState(activePeriode || "semua")
  const [unitFilter, setUnitFilter] = useState("semua")
  const [statusFilter, setStatusFilter] = useState("semua")
  const [search, setSearch] = useState("")

  const filteredData = useMemo(() => {
    return pengajuanUPT.filter((item) => {
      const matchPeriode = periodeFilter === "semua" || item.periode === periodeFilter
      const matchUnit = unitFilter === "semua" || item.unit === unitFilter
      const matchStatus = statusFilter === "semua" || item.status === statusFilter
      const q = search.toLowerCase().trim()
      const matchSearch =
        !q ||
        item.id.toLowerCase().includes(q) ||
        item.unit.toLowerCase().includes(q) ||
        item.bendahara.toLowerCase().includes(q)

      return matchPeriode && matchUnit && matchStatus && matchSearch
    })
  }, [periodeFilter, unitFilter, statusFilter, search])

  const stats = useMemo(() => {
    const menunggu = pengajuanUPT.filter((p) => p.status === "terverifikasi").length
    const sudahNetto = pengajuanUPT.filter(
      (p) => p.status === "netto_ditetapkan" || p.status === "amprah_tersedia"
    )
    const totalNetto = sudahNetto.reduce((acc, cur) => acc + cur.netto, 0)

    return {
      menunggu,
      nettoCount: sudahNetto.length,
      totalNetto,
    }
  }, [])

  const columns: ColumnDef<UPTPengajuan>[] = [
    {
      header: "Unit Kerja",
      cell: (item) => (
        <div>
          <p className="font-semibold text-sm text-foreground">{item.unit}</p>
          <p className="text-[11px] font-mono text-muted-foreground">{item.id}</p>
        </div>
      ),
    },
    {
      header: "Periode",
      accessorKey: "periode",
      className: "text-xs whitespace-nowrap",
    },
    {
      header: "Jumlah Pegawai",
      cell: (item) => <span className="text-xs font-medium">{item.pegawai} orang</span>,
      className: "w-32",
    },
    {
      header: "Total P1 Setelah Potongan",
      cell: (item) => <RupiahText value={item.total} className="text-xs" />,
    },
    {
      header: "Status",
      cell: (item) => <StatusBadge status={item.status} />,
      className: "w-36",
    },
    {
      header: "Aksi",
      cell: (item) => {
        const isTerverifikasi = item.status === "terverifikasi"
        const isBelumSiap =
          item.status === "draft" ||
          item.status === "diajukan" ||
          item.status === "dikembalikan"

        return (
          <Button
            asChild
            variant={isTerverifikasi ? "default" : "outline"}
            size="sm"
            className="h-8 text-xs"
            title={isBelumSiap ? "Belum dapat diproses" : undefined}
          >
            <Link to={`/upt-remunerasi/hitung/${encodeURIComponent(item.id)}`}>
              {isTerverifikasi ? "Proses" : "Lihat"}
            </Link>
          </Button>
        )
      },
      className: "w-24",
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hitung Pajak & P1 Netto"
        subtitle="Hitung PPh Pasal 21 TER dan tetapkan P1 Netto dari pengajuan unit yang telah Terverifikasi."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Menunggu Penetapan (Terverifikasi)"
          value={`${stats.menunggu} Unit`}
          subtitle="Siap dihitung pajak & ditetapkan netto"
          icon={Clock}
        />
        <StatCard
          title="Netto Ditetapkan"
          value={`${stats.nettoCount} Unit`}
          subtitle="Sudah selesai penetapan netto / amprah"
          icon={CheckCircle2}
        />
        <StatCard
          title="Total P1 Netto Ditetapkan"
          value={rupiah(stats.totalNetto)}
          subtitle="Akumulasi unit yang sudah ditetapkan"
          icon={Calculator}
        />
      </div>

      <div className="rounded-xl border bg-card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Cari kode, unit, bendahara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          <select
            value={periodeFilter}
            onChange={(e) => setPeriodeFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs"
          >
            <option value="semua">Semua Periode</option>
            {periodeUPT.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <select
            value={unitFilter}
            onChange={(e) => setUnitFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs"
          >
            <option value="semua">Semua Unit Kerja</option>
            {unitKerja.map((u) => (
              <option key={u.kode} value={u.nama}>
                {u.nama}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs"
          >
            <option value="semua">Semua Status</option>
            <option value="terverifikasi">Terverifikasi (Siap Proses)</option>
            <option value="netto_ditetapkan">Netto Ditetapkan</option>
            <option value="amprah_tersedia">Amprah Tersedia</option>
            <option value="diajukan">Menunggu Verifikasi</option>
            <option value="dikembalikan">Dikembalikan</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        emptyText="Tidak ada pengajuan yang sesuai dengan filter."
      />
    </div>
  )
}
