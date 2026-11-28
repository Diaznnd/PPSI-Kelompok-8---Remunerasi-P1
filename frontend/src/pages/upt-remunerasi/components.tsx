import { createContext, useContext, useState, useMemo, type ReactNode } from "react"
import { Link } from "react-router-dom"
import {
  AlertCircle,
  AlertTriangle,
  ArrowUpDown,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Info,
  Printer,
  RefreshCw,
  Search,
  X,
  type LucideIcon,
} from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

export { Button }
export { Input }
export { Card, CardContent }
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { rupiah } from "@/lib/format"

const legacyStatusClass: Record<string, string> = {
  Menunggu: "border-amber-200 bg-amber-100 text-amber-800",
  Diproses: "border-sky-200 bg-sky-100 text-sky-800",
  Selesai: "border-emerald-200 bg-emerald-100 text-emerald-800",
  Dikembalikan: "border-red-200 bg-red-100 text-red-800",
  Diteruskan: "border-purple-200 bg-purple-100 text-purple-800",
  "Disetujui Verifikator": "border-sky-200 bg-sky-100 text-sky-800",
  Ditetapkan: "border-emerald-200 bg-emerald-100 text-emerald-800",
}

export function Status({ children }: { children: string }) {
  return <StatusBadge status={children} />
}

export function Toolbar({ children }: { children?: ReactNode }) {
  return <div className="mb-4 flex flex-wrap items-center justify-between gap-3">{children}</div>
}

export function Table({ headers, children }: { headers: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-4 py-3 font-medium">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">{children}</tbody>
      </table>
    </div>
  )
}

export function Row({ children }: { children: ReactNode }) {
  return <tr className="border-t transition-colors hover:bg-muted/30">{children}</tr>
}

export function Cell({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-middle ${className}`}>{children}</td>
}

export function Action({ to, children = "Lihat" }: { to: string; children?: ReactNode }) {
  return (
    <Button asChild variant="link" size="sm" className="px-0 font-medium text-primary">
      <Link to={to}>{children}</Link>
    </Button>
  )
}

export function EmptyHint({ text }: { text: string }) {
  return <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">{text}</div>
}

type PeriodeContextType = {
  periode: string
  setPeriode: (p: string) => void
}

export const PeriodeContext = createContext<PeriodeContextType>({
  periode: "Oktober 2026",
  setPeriode: () => { },
})

export const usePeriode = () => useContext(PeriodeContext)

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
}: {
  title: string
  value: ReactNode
  subtitle?: string
  icon?: LucideIcon
  trend?: { text: string; positive?: boolean }
}) {
  return (
    <Card className="rounded-xl border shadow-none">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          {Icon && (
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-5" />
            </div>
          )}
        </div>
        <div className="mt-2 text-2xl font-bold tracking-tight">{value}</div>
        {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
        {trend && (
          <p className={`mt-1 text-xs font-medium ${trend.positive ? "text-emerald-600" : "text-amber-600"}`}>
            {trend.text}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  belum_mengajukan: { label: "Belum Mengajukan", className: "border-slate-200 bg-slate-100 text-slate-600" },
  draft: { label: "Draft", className: "border-slate-200 bg-slate-100 text-slate-700" },
  diajukan: { label: "Menunggu Verifikasi", className: "border-amber-200 bg-amber-100 text-amber-800" },
  dikembalikan: { label: "Dikembalikan", className: "border-rose-200 bg-rose-100 text-rose-800" },
  diverifikasi: { label: "Diverifikasi", className: "border-sky-200 bg-sky-100 text-sky-800" },
  terverifikasi: { label: "Terverifikasi", className: "border-sky-200 bg-sky-100 text-sky-800" },
  disahkan: { label: "Disahkan UPT", className: "border-emerald-200 bg-emerald-100 text-emerald-800" },
  netto_ditetapkan: { label: "Netto Ditetapkan", className: "border-emerald-200 bg-emerald-100 text-emerald-800" },
  amprah_tersedia: { label: "Amprah Tersedia", className: "border-emerald-200 bg-emerald-100 text-emerald-800" },

  ditetapkan: { label: "Ditetapkan", className: "border-emerald-200 bg-emerald-100 text-emerald-800" },
  ditolak: { label: "Ditolak", className: "border-rose-200 bg-rose-100 text-rose-800" },

  belum_disusun: { label: "Belum Disusun", className: "border-slate-200 bg-slate-100 text-slate-700" },
  tersedia: { label: "Tersedia", className: "border-emerald-200 bg-emerald-100 text-emerald-800" },

  belum_terbit: { label: "Belum Terbit", className: "border-slate-200 bg-slate-100 text-slate-700" },
  terbit: { label: "Terbit", className: "border-emerald-200 bg-emerald-100 text-emerald-800" },
  gagal: { label: "Gagal", className: "border-rose-200 bg-rose-100 text-rose-800" },

  ditindaklanjuti: { label: "Ditindaklanjuti", className: "border-amber-200 bg-amber-100 text-amber-800" },
  diteruskan: { label: "Diteruskan", className: "border-purple-200 bg-purple-100 text-purple-800" },
  selesai: { label: "Selesai", className: "border-emerald-200 bg-emerald-100 text-emerald-800" },

  belum_dibuka: { label: "Belum Dibuka", className: "border-slate-200 bg-slate-100 text-slate-700" },
  terbuka: { label: "Terbuka", className: "border-emerald-200 bg-emerald-100 text-emerald-800" },
  terkunci: { label: "Terkunci", className: "border-amber-200 bg-amber-100 text-amber-800" },

  aktif: { label: "Aktif", className: "border-emerald-200 bg-emerald-100 text-emerald-800" },
  nonaktif: { label: "Nonaktif", className: "border-rose-200 bg-rose-100 text-rose-800" },
}

export function StatusBadge({ status, className = "" }: { status?: string | null; className?: string }) {
  const safeStatus = status || "belum_mengajukan"
  const normKey = safeStatus.toLowerCase().replace(/\s+/g, "_")
  const conf = STATUS_CONFIG[normKey] || STATUS_CONFIG[safeStatus]

  if (conf) {
    return (
      <Badge variant="outline" className={`font-normal ${conf.className} ${className}`}>
        {conf.label}
      </Badge>
    )
  }

  if (legacyStatusClass[status]) {
    return (
      <Badge variant="outline" className={`font-normal ${legacyStatusClass[status]} ${className}`}>
        {status}
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className={`border-slate-200 bg-slate-50 text-slate-700 ${className}`}>
      {status}
    </Badge>
  )
}

export function RupiahText({ value, className = "" }: { value: number; className?: string }) {
  return <span className={`font-medium ${className}`}>{rupiah(value)}</span>
}

export function WarningBanner({
  variant = "info",
  title,
  children,
}: {
  variant?: "info" | "warning" | "error"
  title?: string
  children: ReactNode
}) {
  const styles = {
    info: "border-blue-200 bg-blue-50 text-blue-900 [&>svg]:text-blue-600",
    warning: "border-amber-200 bg-amber-50 text-amber-900 [&>svg]:text-amber-600",
    error: "border-rose-200 bg-rose-50 text-rose-900 [&>svg]:text-rose-600",
  }

  const icons = {
    info: Info,
    warning: AlertTriangle,
    error: AlertCircle,
  }

  const IconComp = icons[variant]

  return (
    <div className={`mb-4 flex items-start gap-3 rounded-xl border p-4 text-sm ${styles[variant]}`}>
      <IconComp className="mt-0.5 size-5 shrink-0" />
      <div className="flex-1">
        {title && <p className="mb-0.5 font-semibold">{title}</p>}
        <div className="leading-relaxed">{children}</div>
      </div>
    </div>
  )
}

export function Timeline({
  items,
}: {
  items: { pelaku: string; peran?: string; waktu: string; catatan: string; status?: string }[]
}) {
  return (
    <div className="relative border-l border-muted-foreground/20 pl-6 space-y-6">
      {items.map((item, idx) => (
        <div key={idx} className="relative">
          <div className="absolute -left-[31px] top-1 size-3 rounded-full border-2 border-background bg-primary" />
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-sm font-semibold">{item.pelaku}</span>
            {item.peran && <span className="text-xs text-muted-foreground">({item.peran})</span>}
            <span className="text-xs text-muted-foreground">• {item.waktu}</span>
          </div>
          <p className="mt-1 text-sm text-foreground/80">{item.catatan}</p>
          {item.status && <div className="mt-2"><StatusBadge status={item.status} /></div>}
        </div>
      ))}
    </div>
  )
}

export function Stepper({ steps, currentStep }: { steps: string[]; currentStep: number }) {
  return (
    <div className="mb-6 overflow-x-auto py-2">
      <div className="flex min-w-[500px] items-center justify-between">
        {steps.map((step, idx) => {
          const stepNum = idx + 1
          const isDone = stepNum < currentStep
          const isCurrent = stepNum === currentStep

          return (
            <div key={step} className="flex flex-1 items-center last:flex-none">
              <div className="flex items-center gap-3">
                <div
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${isDone
                    ? "bg-primary text-primary-foreground"
                    : isCurrent
                      ? "border-2 border-primary bg-background text-primary"
                      : "border bg-muted text-muted-foreground"
                    }`}
                >
                  {isDone ? <CheckCircle2 className="size-4" /> : stepNum}
                </div>
                <span
                  className={`text-xs whitespace-nowrap ${isCurrent ? "font-semibold text-primary" : "text-muted-foreground"
                    }`}
                >
                  {step}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`mx-4 h-0.5 flex-1 ${stepNum < currentStep ? "bg-primary" : "bg-muted"
                    }`}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  summary,
  onConfirm,
  onCancel,
  confirmText = "Konfirmasi",
  cancelText = "Batal",
  danger = false,
  loading = false,
  disabled = false,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  summary?: ReactNode
  onConfirm: () => void
  onCancel?: () => void
  confirmText?: string
  cancelText?: string
  danger?: boolean
  loading?: boolean
  disabled?: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {summary && <div className="rounded-lg border bg-muted/30 p-3 text-sm">{summary}</div>}
        <DialogFooter className="mt-4 gap-2 sm:gap-0">
          <Button
            variant="outline"
            disabled={loading || disabled}
            onClick={() => {
              onCancel?.()
              onOpenChange(false)
            }}
          >
            {cancelText}
          </Button>
          <Button
            variant={danger ? "destructive" : "default"}
            disabled={loading || disabled}
            onClick={() => {
              onConfirm()
            }}
          >
            {loading ? "Memproses..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="py-2 space-y-4">{children}</div>
        {footer && <DialogFooter className="mt-4">{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  )
}

export function Drawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  width = "sm:max-w-md",
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  width?: string
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className={`overflow-y-auto ${width}`}>
        <SheetHeader className="text-left border-b pb-4">
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <div className="py-4 space-y-4">{children}</div>
        {footer && <SheetFooter className="border-t pt-4">{footer}</SheetFooter>}
      </SheetContent>
    </Sheet>
  )
}

export function FilterBar({
  search,
  onSearchChange,
  placeholder = "Cari data...",
  children,
}: {
  search?: string
  onSearchChange?: (val: string) => void
  placeholder?: string
  children?: ReactNode
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {onSearchChange !== undefined ? (
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
            className="pl-9 pr-8"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      ) : (
        <div />
      )}
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  )
}

export type ColumnDef<T> = {
  header: string
  accessorKey?: keyof T
  cell?: (item: T) => ReactNode
  className?: string
  sortable?: boolean
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  error = null,
  onRetry,
  emptyText = "Belum ada data untuk ditampilkan",
  pageSize = 10,
}: {
  columns: ColumnDef<T>[]
  data: T[]
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  emptyText?: string
  pageSize?: number
}) {
  const [currentPage, setCurrentPage] = useState(1)
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  const sortedData = useMemo(() => {
    if (!sortKey) return data
    return [...data].sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]
      if (aVal === bVal) return 0
      if (sortOrder === "asc") return aVal > bVal ? 1 : -1
      return aVal < bVal ? 1 : -1
    })
  }, [data, sortKey, sortOrder])

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize))
  const paginatedData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortOrder("asc")
    }
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-8 text-center">
        <AlertCircle className="mx-auto size-8 text-rose-600" />
        <h3 className="mt-2 text-base font-semibold text-rose-900">Gagal Memuat Data</h3>
        <p className="mt-1 text-sm text-rose-700">{error}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" size="sm" className="mt-4 gap-2 border-rose-300">
            <RefreshCw className="size-4" />
            Muat Ulang
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={`px-4 py-3 font-medium ${col.className ?? ""}`}>
                  {col.sortable && col.accessorKey ? (
                    <button
                      onClick={() => handleSort(col.accessorKey as string)}
                      className="inline-flex items-center gap-1 hover:text-foreground"
                    >
                      {col.header}
                      <ArrowUpDown className="size-3" />
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={rIdx}>
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} className="px-4 py-3.5">
                      <Skeleton className="h-4 w-full max-w-[120px]" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-muted-foreground">
                  <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-muted">
                    <Search className="size-5 text-muted-foreground" />
                  </div>
                  <p className="mt-2 font-medium">{emptyText}</p>
                  <p className="text-xs text-muted-foreground">Coba sesuaikan kata kunci pencarian atau filter.</p>
                </td>
              </tr>
            ) : (
              paginatedData.map((item, rowIdx) => (
                <tr key={rowIdx} className="transition-colors hover:bg-muted/30">
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={`px-4 py-3 align-middle ${col.className ?? ""}`}>
                      {col.cell
                        ? col.cell(item)
                        : col.accessorKey
                          ? String(item[col.accessorKey] ?? "-")
                          : "-"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && sortedData.length > 0 && (
        <div className="flex items-center justify-between border-t px-4 py-3 text-xs text-muted-foreground">
          <span>
            Menampilkan {(currentPage - 1) * pageSize + 1} -{" "}
            {Math.min(currentPage * pageSize, sortedData.length)} dari {sortedData.length} data
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="px-2">
              Halaman {currentPage} dari {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export function ExportDialog({
  open,
  onOpenChange,
  title = "Ekspor Data",
  columns,
  onExport,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  columns: string[]
  onExport?: (format: "xlsx" | "csv" | "pdf", selectedCols: string[]) => void
}) {
  const [format, setFormat] = useState<"xlsx" | "csv" | "pdf">("xlsx")
  const [selected, setSelected] = useState<string[]>(columns)

  const toggleCol = (col: string) => {
    setSelected((prev) => (prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Pilih format berkas dan kolom data yang ingin diunduh.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase">Format Berkas</label>
            <div className="mt-2 flex gap-3">
              {(["xlsx", "csv", "pdf"] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setFormat(fmt)}
                  className={`flex-1 rounded-lg border py-2 text-center text-xs font-semibold uppercase transition-colors ${format === fmt ? "border-primary bg-primary/10 text-primary" : "hover:bg-muted"
                    }`}
                >
                  .{fmt}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase">Pilih Kolom ({selected.length})</label>
            <div className="mt-2 max-h-40 overflow-y-auto rounded-lg border p-2 space-y-1">
              {columns.map((col) => (
                <label key={col} className="flex items-center gap-2 text-xs py-1 px-1.5 rounded hover:bg-muted cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selected.includes(col)}
                    onChange={() => toggleCol(col)}
                    className="rounded text-primary focus:ring-primary"
                  />
                  <span>{col}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            onClick={() => {
              onExport?.(format, selected)
              toast.success(`Data berhasil diekspor ke format .${format.toUpperCase()}`)
              onOpenChange(false)
            }}
            className="gap-2"
          >
            <Download className="size-4" />
            Unduh Berkas
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function PrintPreview({
  open,
  onOpenChange,
  title = "Pratinjau Dokumen Cetak",
  children,
  onPrint,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  children: ReactNode
  onPrint?: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Format siap cetak standar A4 Universitas Andalas.</DialogDescription>
        </DialogHeader>
        <div className="my-2 border rounded-lg bg-card p-6 shadow-inner overflow-x-auto">
          <div className="min-w-[680px] bg-background p-8 border rounded shadow-sm text-foreground">
            {children}
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
          <Button
            onClick={() => {
              onPrint?.()
              window.print()
            }}
            className="gap-2"
          >
            <Printer className="size-4" />
            Cetak Dokumen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export const Toast = toast

export {
  DetailDrawer,
  DrawerSection,
  DrawerKeyValueGrid,
  DrawerSummaryCard,
  DrawerTimeline,
  DrawerTimelineItem,
  type DetailDrawerSize,
  type DrawerKeyValueItem,
  type DrawerTimelineStatus,
  type DrawerTimelineEntry,
} from "./DetailDrawer"
