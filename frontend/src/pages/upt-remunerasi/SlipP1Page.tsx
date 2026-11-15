import { useState, useMemo } from "react"
import { Link } from "react-router-dom"
import { Search, Receipt, AlertTriangle } from "lucide-react"
import {
  PageHeader,
  StatusBadge,
  Button,
  Input,
  usePeriode,
} from "./components"
import {
  pengajuanUPT,
  periodeUPT,
  unitKerja,
  type UPTPengajuan,
} from "@/data/dummy-upt"
import { Badge } from "@/components/ui/badge"

type SlipBatchStatus = "terbit" | "gagal_sebagian" | "belum_terbit"

function deriveSlipRow(item: UPTPengajuan): {
  nettoSiap: boolean
  terbit: number
  gagal: number
  total: number
  slipStatus: SlipBatchStatus
} {
  const nettoSiap = item.status === "netto_ditetapkan" || item.status === "amprah_tersedia"
  if (!nettoSiap) {
    return {
      nettoSiap: false,
      terbit: 0,
      gagal: 0,
      total: item.pegawai,
      slipStatus: "belum_terbit",
    }
  }
  if (item.unit.includes("Penelitian")) {
    const gagal = 2
    return {
      nettoSiap: true,
      terbit: item.pegawai - gagal,
      gagal,
      total: item.pegawai,
      slipStatus: "gagal_sebagian",
    }
  }
  return {
    nettoSiap: true,
    terbit: item.pegawai,
    gagal: 0,
    total: item.pegawai,
    slipStatus: "terbit",
  }
}

export default function SlipP1Page() {
  const { periode: activePeriode } = usePeriode()
  const [periodeFilter, setPeriodeFilter] = useState(activePeriode || "semua")
  const [unitFilter, setUnitFilter] = useState("semua")
  const [statusFilter, setStatusFilter] = useState("semua")
  const [search, setSearch] = useState("")

  const rows = useMemo(() => {
    return pengajuanUPT
      .map((item) => ({
        item,
        ...deriveSlipRow(item),
      }))
      .filter((row) => {
        const matchPeriode = periodeFilter === "semua" || row.item.periode === periodeFilter
        const matchUnit = unitFilter === "semua" || row.item.unit === unitFilter
        const matchStatus = statusFilter === "semua" || row.slipStatus === statusFilter
        const q = search.toLowerCase().trim()
        const matchSearch =
          !q ||
          row.item.unit.toLowerCase().includes(q) ||
          row.item.id.toLowerCase().includes(q)
        return matchPeriode && matchUnit && matchStatus && matchSearch
      })
  }, [periodeFilter, unitFilter, statusFilter, search])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Slip P1 Pegawai"
        subtitle="Pantau status penerbitan slip P1 otomatis per unit dan terbitkan ulang apabila terdapat kegagalan."
      />

      <div className="rounded-xl border bg-card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Cari unit atau kode pengajuan..."
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
            <option value="semua">Semua Status Slip</option>
            <option value="terbit">Terbit Penuh</option>
            <option value="gagal_sebagian">Gagal Sebagian</option>
            <option value="belum_terbit">Belum Terbit</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Unit Kerja</th>
              <th className="px-4 py-3 font-medium">Periode</th>
              <th className="px-4 py-3 font-medium">Status Netto</th>
              <th className="px-4 py-3 font-medium">Slip Terbit / Total</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-xs text-muted-foreground">
                  <Receipt className="mx-auto mb-2 size-8 opacity-40" />
                  Tidak ada data slip yang sesuai dengan filter.
                </td>
              </tr>
            ) : (
              rows.map(({ item, nettoSiap, terbit, gagal, total, slipStatus }) => {
                const pct = total > 0 ? Math.round((terbit / total) * 100) : 0
                return (
                  <tr
                    key={item.id}
                    className={`transition-colors ${
                      !nettoSiap
                        ? "bg-muted/30 text-muted-foreground opacity-70"
                        : "hover:bg-muted/20"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <p className={`text-sm font-semibold ${!nettoSiap ? "text-muted-foreground" : "text-foreground"}`}>
                        {item.unit}
                      </p>
                      <p className="text-[11px] font-mono text-muted-foreground">{item.id}</p>
                    </td>
                    <td className="px-4 py-3 text-xs">{item.periode}</td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <StatusBadge status={item.status} />
                        {!nettoSiap && (
                          <p className="text-[10px] text-muted-foreground italic">
                            Netto belum ditetapkan
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 w-48">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium">
                            {terbit} / {total}
                          </span>
                          <span className="text-[11px] text-muted-foreground">{pct}%</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className={`h-full transition-all ${
                              gagal > 0 ? "bg-amber-500" : "bg-emerald-600"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        {gagal > 0 && (
                          <p className="flex items-center gap-1 text-[10px] font-medium text-rose-600">
                            <AlertTriangle className="size-3" /> {gagal} slip gagal terbit
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {slipStatus === "terbit" ? (
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[11px]">
                          Terbit
                        </Badge>
                      ) : slipStatus === "gagal_sebagian" ? (
                        <Badge className="bg-rose-100 text-rose-800 border-rose-200 text-[11px]">
                          Gagal Sebagian
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200 text-[11px]">
                          Belum Terbit
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button asChild variant={nettoSiap ? "outline" : "ghost"} size="sm" className="h-8 text-xs">
                        <Link to={`/upt-remunerasi/slip/${encodeURIComponent(item.id)}`}>Buka</Link>
                      </Button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
