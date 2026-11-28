import { useState, useMemo, useEffect } from "react"
import {
  Lock,
  Search,
  Eye,
  Download,
  AlertCircle,
  ShieldCheck,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import {
  PageHeader,
  DataTable,
  DetailDrawer,
  DrawerSection,
  DrawerSummaryCard,
  Button,
  Input,
  type ColumnDef,
} from "./components"
import {
  type JejakAuditItem,
  type JejakAuditAksi,
} from "@/types/upt"
import { Badge } from "@/components/ui/badge"
import { uptRemunerasiService } from "@/services/uptRemunerasiService"

const AKSI_LIST: JejakAuditAksi[] = [
  "Buat",
  "Ubah",
  "Ajukan",
  "Kembalikan",
  "Verifikasi",
  "Tetapkan",
  "Login",
  "Reset Sandi",
  "Ubah Peran",
  "Penugasan",
]

const AKSI_BADGE_STYLE: Record<JejakAuditAksi, string> = {
  Buat: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Ubah: "bg-amber-50 text-amber-800 border-amber-200",
  Ajukan: "bg-blue-50 text-blue-700 border-blue-200",
  Kembalikan: "bg-rose-50 text-rose-700 border-rose-200",
  Verifikasi: "bg-sky-50 text-sky-700 border-sky-200",
  Tetapkan: "bg-purple-50 text-purple-800 border-purple-200",
  Login: "bg-slate-100 text-slate-700 border-slate-200",
  "Reset Sandi": "bg-orange-50 text-orange-800 border-orange-200",
  "Ubah Peran": "bg-indigo-50 text-indigo-800 border-indigo-200",
  Penugasan: "bg-teal-50 text-teal-800 border-teal-200",
}

export default function JejakAuditUPTPage() {
  const [loading, setLoading] = useState(true)
  const [auditData, setAuditData] = useState<JejakAuditItem[]>([])
  const [search, setSearch] = useState("")
  const [tanggalAwal, setTanggalAwal] = useState("")
  const [tanggalAkhir, setTanggalAkhir] = useState("")
  const [aksiFilter, setAksiFilter] = useState("semua")
  const [pelakuFilter, setPelakuFilter] = useState("semua")
  const [unitFilter, setUnitFilter] = useState("semua")
  const [peranFilter, setPeranFilter] = useState("semua")

  const [selectedAudit, setSelectedAudit] = useState<JejakAuditItem | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  useEffect(() => {
    loadAuditLogs()
  }, [])

  const loadAuditLogs = async () => {
    try {
      setLoading(true)
      const res = await uptRemunerasiService.getAuditLogs()
      
      // Map API response to component format
      const mapped: JejakAuditItem[] = (res.data || []).map((item: any) => ({
        id: item.id.toString(),
        waktu: item.waktu || item.created_at || "-",
        pelaku: item.pelaku || item.aktor || "Sistem",
        peran: item.peran || "Unknown",
        unit: item.unit || "N/A",
        aksi: item.aksi as JejakAuditAksi || "Buat",
        objek: item.objek || item.objek_type || "-",
        detail: item.detail || item.alasan || "-",
        alasan: item.alasan || null,
        perubahan: item.perubahan || [],
        tanggal: item.tanggal || item.created_at?.split(" ")[0] || "",
      }))
      
      setAuditData(mapped)
    } catch (error: any) {
      console.error("Error loading audit logs:", error)
      toast.error("Gagal memuat jejak audit")
      // Fallback to empty data
      setAuditData([])
    } finally {
      setLoading(false)
    }
  }

  const pelakuOptions = useMemo(() => Array.from(new Set(auditData.map((a) => a.pelaku))), [auditData])
  const peranOptions = useMemo(() => Array.from(new Set(auditData.map((a) => a.peran))), [auditData])
  const unitOptions = useMemo(() => Array.from(new Set(auditData.map((a) => a.unit))), [auditData])

  const isDateRangeInvalid = Boolean(tanggalAwal && tanggalAkhir && tanggalAkhir < tanggalAwal)

  const filteredData = useMemo(() => {
    if (isDateRangeInvalid) return []

    return auditData.filter((item) => {
      const q = search.toLowerCase().trim()
      const matchSearch =
        !q ||
        item.pelaku.toLowerCase().includes(q) ||
        item.objek.toLowerCase().includes(q) ||
        item.detail.toLowerCase().includes(q) ||
        (item.alasan?.toLowerCase().includes(q) ?? false)

      const matchAksi = aksiFilter === "semua" || item.aksi === aksiFilter
      const matchPelaku = pelakuFilter === "semua" || item.pelaku === pelakuFilter
      const matchUnit = unitFilter === "semua" || item.unit === unitFilter
      const matchPeran = peranFilter === "semua" || item.peran === peranFilter

      const matchStart = !tanggalAwal || item.tanggal >= tanggalAwal
      const matchEnd = !tanggalAkhir || item.tanggal <= tanggalAkhir

      return (
        matchSearch &&
        matchAksi &&
        matchPelaku &&
        matchUnit &&
        matchPeran &&
        matchStart &&
        matchEnd
      )
    })
  }, [
    search,
    tanggalAwal,
    tanggalAkhir,
    aksiFilter,
    pelakuFilter,
    unitFilter,
    peranFilter,
    isDateRangeInvalid,
    auditData,
  ])

  const hasActiveFilters =
    Boolean(search) ||
    Boolean(tanggalAwal) ||
    Boolean(tanggalAkhir) ||
    aksiFilter !== "semua" ||
    pelakuFilter !== "semua" ||
    unitFilter !== "semua" ||
    peranFilter !== "semua"

  const resetFilters = () => {
    setSearch("")
    setTanggalAwal("")
    setTanggalAkhir("")
    setAksiFilter("semua")
    setPelakuFilter("semua")
    setUnitFilter("semua")
    setPeranFilter("semua")
  }

  const columns: ColumnDef<JejakAuditItem>[] = [
    {
      header: "Waktu",
      accessorKey: "waktu",
      className: "text-xs text-muted-foreground whitespace-nowrap w-40",
    },
    {
      header: "Pelaku",
      cell: (item) => (
        <div>
          <span className="font-semibold text-foreground text-xs">{item.pelaku}</span>
          <p className="text-[11px] text-muted-foreground md:hidden">{item.peran}</p>
        </div>
      ),
    },
    {
      header: "Peran",
      cell: (item) => (
        <span className="text-xs text-muted-foreground">{item.peran}</span>
      ),
    },
    {
      header: "Unit",
      cell: (item) => (
        <span className="text-xs text-muted-foreground">{item.unit}</span>
      ),
    },
    {
      header: "Aksi",
      cell: (item) => (
        <Badge
          variant="outline"
          className={`text-[11px] font-medium ${AKSI_BADGE_STYLE[item.aksi]}`}
        >
          {item.aksi}
        </Badge>
      ),
      className: "w-32",
    },
    {
      header: "Objek",
      cell: (item) => (
        <div>
          <span className="font-mono text-xs font-medium text-foreground">{item.objek}</span>
          <p className="text-[11px] text-muted-foreground line-clamp-1">{item.detail}</p>
        </div>
      ),
    },
    {
      header: "Detail",
      cell: (item) => (
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2.5 text-xs gap-1.5"
          onClick={() => {
            setSelectedAudit(item)
            setIsDrawerOpen(true)
          }}
        >
          <Eye className="size-3.5" /> Lihat Perubahan
        </Button>
      ),
      className: "w-36 text-right",
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
        title={
          <div className="flex flex-wrap items-center gap-2.5">
            <span>Jejak Audit Sistem</span>
            <Badge
              variant="outline"
              className="gap-1 border-slate-300 bg-slate-100 text-slate-700 text-xs font-medium"
            >
              <Lock className="size-3" /> Catatan tidak dapat diubah
            </Badge>
          </div>
        }
        subtitle="Log aktivitas dan perubahan data seluruh pengguna pada sistem remunerasi P1 Universitas Andalas."
        actions={
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() =>
              toast.success(`Mengekspor ${filteredData.length} catatan jejak audit ke format CSV.`)
            }
          >
            <Download className="size-4" /> Ekspor Audit (CSV)
          </Button>
        }
      />

      <div className="rounded-xl border bg-card p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative sm:col-span-2 lg:col-span-2">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Cari teks: pelaku, objek, detail, atau alasan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          <div>
            <div className="relative">
              <Input
                type="date"
                aria-label="Tanggal Awal"
                value={tanggalAwal}
                onChange={(e) => setTanggalAwal(e.target.value)}
                className={`h-9 text-xs ${isDateRangeInvalid ? "border-rose-500" : ""}`}
                title="Tanggal Awal"
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <Input
                type="date"
                aria-label="Tanggal Akhir"
                value={tanggalAkhir}
                onChange={(e) => setTanggalAkhir(e.target.value)}
                className={`h-9 text-xs ${isDateRangeInvalid ? "border-rose-500" : ""}`}
                title="Tanggal Akhir"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <select
            value={aksiFilter}
            onChange={(e) => setAksiFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-ring"
          >
            <option value="semua">Semua Aksi</option>
            {AKSI_LIST.map((aksi) => (
              <option key={aksi} value={aksi}>
                {aksi}
              </option>
            ))}
          </select>

          <select
            value={pelakuFilter}
            onChange={(e) => setPelakuFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-ring"
          >
            <option value="semua">Semua Pelaku</option>
            {pelakuOptions.map((pelaku) => (
              <option key={pelaku} value={pelaku}>
                {pelaku}
              </option>
            ))}
          </select>

          <select
            value={peranFilter}
            onChange={(e) => setPeranFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-ring"
          >
            <option value="semua">Semua Peran</option>
            {peranOptions.map((peran) => (
              <option key={peran} value={peran}>
                {peran}
              </option>
            ))}
          </select>

          <select
            value={unitFilter}
            onChange={(e) => setUnitFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-ring"
          >
            <option value="semua">Semua Unit Kerja</option>
            {unitOptions.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </div>

        {isDateRangeInvalid && (
          <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 font-medium">
            <AlertCircle className="size-4 shrink-0 text-rose-600" />
            <span>Rentang tanggal tidak valid</span>
          </div>
        )}

        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-1 border-t text-xs text-muted-foreground">
            <span>Menampilkan {filteredData.length} dari {auditData.length} catatan audit</span>
            <Button
              variant="link"
              size="sm"
              className="h-6 p-0 text-xs text-primary"
              onClick={resetFilters}
            >
              Reset Filter
            </Button>
          </div>
        )}
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        pageSize={6}
        emptyText="Tidak ada catatan yang sesuai."
      />

      <DetailDrawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Detail Perubahan Audit"
        subtitle={selectedAudit ? `Catatan audit ${selectedAudit.id} • Hanya-baca` : undefined}
        size="lg"
        footer={
          <Button variant="outline" onClick={() => setIsDrawerOpen(false)}>
            Tutup
          </Button>
        }
      >
        {selectedAudit && (
          <>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-700">
              <ShieldCheck className="size-4 shrink-0 text-slate-600" />
              <span>Catatan audit bersifat permanen dan tidak dapat diubah atau dihapus.</span>
            </div>

            <DrawerSummaryCard
              items={[
                { label: "Pelaku", value: `${selectedAudit.pelaku} (${selectedAudit.peran})` },
                { label: "Unit Kerja", value: selectedAudit.unit },
                { label: "Waktu", value: selectedAudit.waktu },
                {
                  label: "Aksi",
                  value: (
                    <Badge variant="outline" className={`text-xs ${AKSI_BADGE_STYLE[selectedAudit.aksi]}`}>
                      {selectedAudit.aksi}
                    </Badge>
                  ),
                },
                { label: "Objek", value: selectedAudit.objek, mono: true, fullWidth: true },
              ]}
            />

            {selectedAudit.alasan && (
              <DrawerSection title="Alasan / Catatan">
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 text-sm text-amber-900 leading-relaxed">
                  {selectedAudit.alasan}
                </div>
              </DrawerSection>
            )}

            <DrawerSection title="Perbandingan Nilai (Sebelum vs Sesudah)">
              {selectedAudit.perubahan && selectedAudit.perubahan.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/50 text-muted-foreground font-semibold">
                      <tr>
                        <th className="p-3 border-b">Atribut</th>
                        <th className="p-3 border-b border-l">Nilai Sebelum</th>
                        <th className="p-3 border-b border-l">Nilai Sesudah</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {selectedAudit.perubahan.map((diff, idx) => {
                        const isDifferent = diff.sebelum !== diff.sesudah
                        return (
                          <tr key={idx} className={isDifferent ? "bg-amber-50/40" : ""}>
                            <td className="p-3 font-medium text-foreground">{diff.field}</td>
                            <td
                              className={`p-3 border-l font-mono break-words ${
                                isDifferent
                                  ? "bg-rose-50/70 text-rose-800 line-through decoration-rose-400/70"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {diff.sebelum}
                            </td>
                            <td
                              className={`p-3 border-l font-mono break-words ${
                                isDifferent
                                  ? "bg-emerald-50/80 text-emerald-800 font-semibold"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {diff.sesudah}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">Tidak ada perubahan atribut data yang tercatat.</p>
              )}
            </DrawerSection>
          </>
        )}
      </DetailDrawer>
    </div>
  )
}
