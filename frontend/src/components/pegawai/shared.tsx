import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { StatusPengaduan } from "@/data/dummy-pegawai"

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-xl border bg-card p-6 text-card-foreground", className)}>{children}</div>
}

export function IconBox({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
      <Icon className="size-5" />
    </div>
  )
}

export function PanelTitle({ icon, title, desc, right }: { icon: LucideIcon; title: string; desc?: string; right?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <IconBox icon={icon} />
        <div>
          <h2 className="font-semibold leading-tight">{title}</h2>
          {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
        </div>
      </div>
      {right}
    </div>
  )
}

export function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold">{value}</p>
    </div>
  )
}

export function PageHeading({ title, desc, action }: { title: string; desc?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {desc && <p className="mt-1 text-sm text-muted-foreground">{desc}</p>}
      </div>
      {action}
    </div>
  )
}

const warnaStatus: Record<StatusPengaduan, string> = {
  Diajukan: "border-sky-200 bg-sky-100 text-sky-800",
  Ditindaklanjuti: "border-amber-200 bg-amber-100 text-amber-800",
  Diteruskan: "border-purple-200 bg-purple-100 text-purple-800",
  Selesai: "border-emerald-200 bg-emerald-100 text-emerald-800",
}

export function StatusBadge({ status }: { status: StatusPengaduan }) {
  return (
    <Badge variant="outline" className={cn("font-medium", warnaStatus[status])}>
      {status}
    </Badge>
  )
}
