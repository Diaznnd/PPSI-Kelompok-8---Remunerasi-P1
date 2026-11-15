import { useState, type ReactNode } from "react"
import { AlertCircle, Check, ChevronDown, ChevronUp, RefreshCw, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"

export type DetailDrawerSize = "md" | "lg"

export function DetailDrawer({
  open,
  onClose,
  title,
  subtitle,
  size = "md",
  footer,
  loading = false,
  empty = false,
  emptyText = "Belum ada data untuk ditampilkan.",
  error = null,
  onRetry,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  size?: DetailDrawerSize
  footer?: ReactNode
  loading?: boolean
  empty?: boolean
  emptyText?: string
  error?: string | null
  onRetry?: () => void
  children: ReactNode
}) {
  const maxWidthClass =
    size === "lg" ? "sm:!max-w-[720px]" : "sm:!max-w-[560px]"

  return (
    <Sheet open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className={`flex h-full !w-full max-w-full flex-col gap-0 p-0 duration-200 ${maxWidthClass}`}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b bg-background px-6 py-4">
          <div className="min-w-0 flex-1">
            <SheetTitle className="truncate text-lg font-semibold leading-snug text-foreground">
              {title}
            </SheetTitle>
            {subtitle && (
              <SheetDescription className="mt-0.5 text-sm text-muted-foreground">
                {subtitle}
              </SheetDescription>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Tutup panel"
            className="size-9 min-h-9 min-w-9 shrink-0 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-5">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-28 w-full rounded-xl" />
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          ) : error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-6 text-center">
              <AlertCircle className="mx-auto size-7 text-rose-600" />
              <p className="mt-2 text-sm font-semibold text-rose-900">
                Gagal Memuat Rincian
              </p>
              <p className="mt-1 text-sm text-rose-700">{error}</p>
              {onRetry && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onRetry}
                  className="mt-4 gap-2 border-rose-300"
                >
                  <RefreshCw className="size-3.5" />
                  Muat Ulang
                </Button>
              )}
            </div>
          ) : empty ? (
            <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              {emptyText}
            </div>
          ) : (
            <div className="space-y-6">{children}</div>
          )}
        </div>

        {footer && (
          <div className="shrink-0 border-t bg-background px-6 py-4">
            <div className="flex flex-wrap items-center justify-end gap-2">
              {footer}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

export function DrawerSection({
  title,
  badge,
  action,
  collapsible = false,
  defaultOpen = true,
  children,
}: {
  title?: string
  badge?: string
  action?: ReactNode
  collapsible?: boolean
  defaultOpen?: boolean
  children: ReactNode
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <section className="min-w-0">
      {(title || action || collapsible) && (
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            {title && (
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {title}
              </h3>
            )}
            {badge && (
              <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
                {badge}
              </span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {action}
            {collapsible && (
              <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {isOpen ? (
                  <>
                    Tutup <ChevronUp className="size-3.5" />
                  </>
                ) : (
                  <>
                    Lihat <ChevronDown className="size-3.5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
      {(!collapsible || isOpen) && <div className="min-w-0">{children}</div>}
    </section>
  )
}

export interface DrawerKeyValueItem {
  label: string
  value: ReactNode
  mono?: boolean
  fullWidth?: boolean
}

export function DrawerKeyValueGrid({
  items,
  columns = 2,
}: {
  items: DrawerKeyValueItem[]
  columns?: 1 | 2
}) {
  const gridCols = columns === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"
  return (
    <dl className={`grid ${gridCols} gap-x-6 gap-y-4`}>
      {items.map((item, idx) => (
        <div
          key={idx}
          className={`min-w-0 ${item.fullWidth && columns === 2 ? "sm:col-span-2" : ""}`}
        >
          <dt className="text-xs text-muted-foreground">{item.label}</dt>
          <dd
            className={`mt-0.5 text-sm font-medium text-foreground ${
              item.mono ? "font-mono break-all" : "break-words"
            }`}
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

export function DrawerSummaryCard({
  items,
  totalLabel,
  totalValue,
  children,
}: {
  items?: DrawerKeyValueItem[]
  totalLabel?: string
  totalValue?: ReactNode
  children?: ReactNode
}) {
  return (
    <div className="rounded-xl border bg-muted/30 p-4">
      {items && items.length > 0 && <DrawerKeyValueGrid items={items} columns={2} />}
      {children}
      {totalLabel && totalValue !== undefined && (
        <div className="mt-4 flex flex-wrap items-baseline justify-between gap-2 border-t pt-3">
          <span className="text-xs font-medium text-muted-foreground">
            {totalLabel}
          </span>
          <span className="text-right text-base font-semibold tabular-nums text-emerald-700">
            {totalValue}
          </span>
        </div>
      )}
    </div>
  )
}

export type DrawerTimelineStatus = "selesai" | "berjalan" | "belum"

export interface DrawerTimelineEntry {
  tahap: string
  status: DrawerTimelineStatus
  tanggal?: string
  jam?: string
  pelaku?: string
  catatan?: string
}

export function DrawerTimeline({
  items,
  children,
}: {
  items?: DrawerTimelineEntry[]
  children?: ReactNode
}) {
  return (
    <div className="space-y-0">
      {items
        ? items.map((item, idx) => (
            <DrawerTimelineItem
              key={idx}
              {...item}
              isLast={idx === items.length - 1}
            />
          ))
        : children}
    </div>
  )
}

export function DrawerTimelineItem({
  tahap,
  status,
  tanggal = "-",
  jam,
  pelaku,
  catatan,
  isLast = false,
}: DrawerTimelineEntry & { isLast?: boolean }) {
  const isDone = status === "selesai"
  const isCurrent = status === "berjalan"
  const isPending = status === "belum"

  return (
    <div className="relative flex gap-3.5">
      <div className="flex flex-col items-center">
        {isDone ? (
          <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-white">
            <Check className="size-3.5 stroke-[2.5]" />
          </div>
        ) : isCurrent ? (
          <div className="flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-emerald-700 bg-emerald-50">
            <span className="size-2.5 rounded-full bg-emerald-700" />
          </div>
        ) : (
          <div className="flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-slate-300 bg-background" />
        )}
        {!isLast && (
          <div
            className={`my-1 w-px flex-1 ${
              isDone ? "bg-emerald-300" : "bg-border"
            }`}
          />
        )}
      </div>

      <div className={`min-w-0 flex-1 ${isLast ? "pb-0" : "pb-5"}`}>
        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-0.5">
          <p
            className={`text-sm font-semibold ${
              isPending ? "text-slate-500" : "text-foreground"
            }`}
          >
            {tahap}
          </p>
          <div className="shrink-0 text-right">
            <span
              className={`block whitespace-nowrap text-xs ${
                isPending ? "text-slate-500" : "text-muted-foreground"
              }`}
            >
              {tanggal || "-"}
            </span>
            {jam && (
              <span className="block whitespace-nowrap text-[11px] text-muted-foreground">
                {jam}
              </span>
            )}
          </div>
        </div>

        {pelaku && (
          <p
            className={`mt-0.5 text-xs ${
              isPending ? "text-slate-500" : "text-muted-foreground"
            }`}
          >
            Pelaku: {pelaku}
          </p>
        )}

        {catatan && (
          <p
            className={`mt-1 text-sm italic leading-relaxed break-words ${
              isPending ? "text-slate-500" : "text-slate-600"
            }`}
          >
            {catatan}
          </p>
        )}
      </div>
    </div>
  )
}
