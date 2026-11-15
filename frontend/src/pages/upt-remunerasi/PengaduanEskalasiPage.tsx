import { useState, useMemo } from "react"
import { Link } from "react-router-dom"
import { AlertCircle, CheckCircle2, Lock, MessageSquare, Search } from "lucide-react"
import {
  PageHeader,
  StatCard,
  DataTable,
  StatusBadge,
  Button,
  Input,
  type ColumnDef,
} from "./components"
import { pengaduanUPT } from "@/data/dummy-upt"

type PengaduanRow = (typeof pengaduanUPT)[number] & { periode?: string }

export default function PengaduanEskalasiPage() {
  const [activeTab, setActiveTab] = useState<"diteruskan" | "selesai">("diteruskan")
  const [search, setSearch] = useState("")

  const normalizedData: PengaduanRow[] = useMemo(
    () =>
      pengaduanUPT.map((p) => ({
        ...p,
        periode: "Oktober 2026",
      })),
    []
  )

  const diteruskanCount = useMemo(
    () => normalizedData.filter((p) => p.status === "diteruskan" || p.status === "Diteruskan").length,
    [normalizedData]
  )
  const selesaiCount = useMemo(
    () => normalizedData.filter((p) => p.status === "selesai" || p.status === "Selesai").length,
    [normalizedData]
  )

  const filteredData = useMemo(() => {
    return normalizedData.filter((item) => {
      const isDiteruskan = item.status === "diteruskan" || item.status === "Diteruskan"
      const isSelesai = item.status === "selesai" || item.status === "Selesai"
      if (activeTab === "diteruskan" && !isDiteruskan) return false
      if (activeTab === "selesai" && !isSelesai) return false

      const q = search.toLowerCase().trim()
      if (!q) return true
      return (
        item.id.toLowerCase().includes(q) ||
        item.pegawai.toLowerCase().includes(q) ||
        item.unit.toLowerCase().includes(q) ||
        item.kategori.toLowerCase().includes(q)
      )
    })
  }, [normalizedData, activeTab, search])

  const columns: ColumnDef<PengaduanRow>[] = [
    {
      header: "Nomor",
      cell: (item) => (
        <div>
          <p className="font-mono font-semibold text-xs text-primary">{item.id}</p>
          <p className="text-[10px] text-muted-foreground">{item.tiket}</p>
        </div>
      ),
    },
    {
      header: "Pegawai",
      cell: (item) => (
        <div>
          <p className="font-semibold text-sm">{item.pegawai}</p>
          <p className="text-[11px] font-mono text-muted-foreground">{item.nip}</p>
        </div>
      ),
    },
    { header: "Unit", accessorKey: "unit", className: "text-xs text-muted-foreground" },
    { header: "Kategori", accessorKey: "kategori", className: "text-xs font-medium" },
    { header: "Periode", accessorKey: "periode", className: "text-xs" },
    { header: "Tanggal Eskalasi", accessorKey: "tanggal", className: "text-xs whitespace-nowrap" },
    {
      header: "Status",
      cell: (item) => <StatusBadge status={item.status} />,
      className: "w-28",
    },
    {
      header: "Aksi",
      cell: (item) => {
        const isDiteruskan = item.status === "diteruskan" || item.status === "Diteruskan"
        const isOwnPengaduan =
          item.pegawai.startsWith("Dewi Anggraini") || item.nip === "198405122008122001"

        if (isOwnPengaduan && isDiteruskan) {
          return (
            <div className="space-y-1">
              <Button
                variant="outline"
                size="sm"
                disabled
                title="Ditangani admin UPT lain"
                className="h-8 gap-1.5 text-xs"
              >
                <Lock className="size-3.5" />
                Tanggapi
              </Button>
              <p className="text-[11px] text-amber-700 font-medium">
                Ditangani admin UPT lain.
              </p>
            </div>
          )
        }

        return (
          <Button
            asChild
            variant={isDiteruskan ? "default" : "outline"}
            size="sm"
            className="h-8 text-xs"
          >
            <Link to={`/upt-remunerasi/pengaduan/${item.id}`}>
              {isDiteruskan ? "Tanggapi" : "Lihat"}
            </Link>
          </Button>
        )
      },
      className: "w-44",
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengaduan Eskalasi"
        subtitle="Pengaduan pegawai yang diteruskan oleh Bidang Kepegawaian / Bendahara Unit untuk ditangani UPT Remunerasi."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Menunggu Tanggapan (Diteruskan)"
          value={`${diteruskanCount} Tiket`}
          subtitle="Perlu tindak lanjut UPT Remunerasi"
          icon={AlertCircle}
        />
        <StatCard
          title="Selesai Ditangani"
          value={`${selesaiCount} Tiket`}
          subtitle="Sudah diberi tanggapan final"
          icon={CheckCircle2}
        />
        <StatCard
          title="Total Pengaduan Masuk"
          value={`${normalizedData.length} Tiket`}
          subtitle="Seluruh pengaduan periode aktif"
          icon={MessageSquare}
        />
      </div>

      <div className="flex border-b">
        <button
          onClick={() => setActiveTab("diteruskan")}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-semibold transition-colors ${
            activeTab === "diteruskan"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Diteruskan ({diteruskanCount})
        </button>
        <button
          onClick={() => setActiveTab("selesai")}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-semibold transition-colors ${
            activeTab === "selesai"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Selesai ({selesaiCount})
        </button>
      </div>

      <div className="rounded-xl border bg-card p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Cari nomor tiket, pegawai, unit, kategori..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        emptyText="Tidak ada pengaduan pada kategori ini."
      />
    </div>
  )
}
