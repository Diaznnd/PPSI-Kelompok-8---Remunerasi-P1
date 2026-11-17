import { useState, useMemo, useEffect } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, Loader2, Search } from "lucide-react"
import { toast } from "sonner"
import {
  PageHeader,
  DataTable,
  StatusBadge,
  Button,
  Input,
  type ColumnDef,
} from "./components"
import {
  usulanJabatanDetailList,
  unitKerja,
  type UsulanJabatanDetailItem,
} from "@/data/dummy-upt"
import { uptRemunerasiService } from "@/services/uptRemunerasiService"

export default function PenetapanJabatanPage() {
  const [loading, setLoading] = useState(true)
  const [usulanList, setUsulanList] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<"menunggu" | "semua">("menunggu")
  const [search, setSearch] = useState("")
  const [unitFilter, setUnitFilter] = useState("semua")
  const [statusFilter, setStatusFilter] = useState("semua")

  useEffect(() => {
    fetchUsulan()
  }, [])

  const fetchUsulan = async () => {
    try {
      setLoading(true)
      const res = await uptRemunerasiService.getPenetapanJabatanList()
      
      // Map API response to frontend format
      const mappedData = res.data.map((u: any) => ({
        id: u.nomor_usulan || u.id,
        nip: u.NIP,
        pegawai: u.pegawai.nama,
        unit: u.unit_nama,
        lama: `${u.jabatan_lama.nama} (${u.jabatan_lama.grade})`,
        baru: `${u.jabatan_baru.nama} (${u.jabatan_baru.grade})`,
        mulai: u.tanggal_berlaku,
        diajukan: u.diajukan_at,
        status: u.status,
        rawId: u.id,
      }))
      
      setUsulanList(mappedData)
    } catch (error) {
      console.error("Error fetching usulan:", error)
      toast.error("Gagal memuat usulan. Menggunakan data dummy.")
      // Fallback to dummy data
      setUsulanList(usulanJabatanDetailList)
    } finally {
      setLoading(false)
    }
  }

  const menungguCount = useMemo(
    () => usulanList.filter((u) => u.status === "terverifikasi").length,
    [usulanList]
  )

  const filteredData = useMemo(() => {
    return usulanList.filter((item) => {
      if (activeTab === "menunggu" && item.status !== "terverifikasi") return false

      const q = search.toLowerCase().trim()
      const matchSearch =
        !q ||
        item.id.toLowerCase().includes(q) ||
        item.pegawai.toLowerCase().includes(q) ||
        item.nip.includes(q) ||
        item.lama.toLowerCase().includes(q) ||
        item.baru.toLowerCase().includes(q)

      const matchUnit = unitFilter === "semua" || item.unit === unitFilter
      const matchStatus = statusFilter === "semua" || item.status === statusFilter

      return matchSearch && matchUnit && matchStatus
    })
  }, [usulanList, activeTab, search, unitFilter, statusFilter])

  const columns: ColumnDef<UsulanJabatanDetailItem>[] = [
    {
      header: "Nomor Usulan",
      cell: (item) => <span className="font-mono font-semibold text-xs text-primary">{item.id}</span>,
      className: "w-28",
    },
    {
      header: "Nama & NIP",
      cell: (item) => (
        <div>
          <p className="font-semibold text-sm text-foreground">{item.pegawai}</p>
          <p className="text-xs font-mono text-muted-foreground">{item.nip}</p>
        </div>
      ),
    },
    {
      header: "Unit",
      accessorKey: "unit",
      className: "text-xs text-muted-foreground",
    },
    {
      header: "Jabatan/Grade Lama → Baru",
      cell: (item) => (
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-muted-foreground">{item.lama}</span>
          <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="font-semibold text-foreground">{item.baru}</span>
        </div>
      ),
    },
    {
      header: "Berlaku Mulai",
      accessorKey: "mulai",
      className: "text-xs whitespace-nowrap",
    },
    {
      header: "Status",
      cell: (item) => <StatusBadge status={item.status} />,
      className: "w-32",
    },
    {
      header: "Aksi",
      cell: (item) => {
        const isTerverifikasi = item.status === "terverifikasi"
        return (
          <Button
            asChild
            variant={isTerverifikasi ? "default" : "outline"}
            size="sm"
            className="h-8 text-xs"
          >
            <Link to={`/upt-remunerasi/penetapan/${item.rawId || item.id}`}>
              {isTerverifikasi ? "Proses" : "Lihat"}
            </Link>
          </Button>
        )
      },
      className: "w-24",
    },
  ]

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Penetapan Jabatan / Grade"
        subtitle="Tetapkan usulan perubahan jabatan dan grade pegawai yang telah disetujui Verifikator ke riwayat resmi."
      />

      <div className="flex border-b">
        <button
          onClick={() => setActiveTab("menunggu")}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-semibold transition-colors ${
            activeTab === "menunggu"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Menunggu Penetapan
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
            {menungguCount}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("semua")}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-semibold transition-colors ${
            activeTab === "semua"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Semua Usulan ({usulanList.length})
        </button>
      </div>

      <div className="rounded-xl border bg-card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Cari nomor usulan, nama, NIP, jabatan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

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
            disabled={activeTab === "menunggu"}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs disabled:opacity-50"
          >
            <option value="semua">Semua Status</option>
            <option value="terverifikasi">Terverifikasi</option>
            <option value="ditetapkan">Ditetapkan</option>
            <option value="diajukan">Menunggu Verifikasi</option>
            <option value="dikembalikan">Dikembalikan</option>
            <option value="ditolak">Ditolak</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        emptyText="Tidak ada usulan perubahan jabatan yang sesuai."
      />
    </div>
  )
}
