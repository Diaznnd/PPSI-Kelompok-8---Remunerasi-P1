import type { ReactNode } from "react"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { StatusVerif } from "@/data/dummy-verifikator"

const WARNA_STATUS: Record<StatusVerif, string> = {
  Diajukan: "border-sky-200 bg-sky-100 text-sky-800",
  Dikembalikan: "border-orange-200 bg-orange-100 text-orange-800",
  Diverifikasi: "border-purple-200 bg-purple-100 text-purple-800",
  Diteruskan: "border-purple-200 bg-purple-100 text-purple-800",
  Disetujui: "border-emerald-200 bg-emerald-100 text-emerald-800",
}

export const StatusVerifBadge = ({ status }: { status: StatusVerif }) => (
  <Badge variant="outline" className={cn("font-medium", WARNA_STATUS[status])}>{status}</Badge>
)

export const Tag = ({ children, warna = "orange" }: { children: ReactNode; warna?: "orange" | "red" | "sky" | "purple" }) => (
  <Badge
    variant="outline"
    className={cn(
      "text-[10px]",
      warna === "orange" && "border-orange-200 bg-orange-100 text-orange-800",
      warna === "red" && "border-red-200 bg-red-100 text-red-700",
      warna === "sky" && "border-sky-200 bg-sky-100 text-sky-800",
      warna === "purple" && "border-purple-200 bg-purple-100 text-purple-800"
    )}
  >
    {children}
  </Badge>
)

// Filter dropdown berlabel (dipakai di semua halaman daftar)
export function FilterSelect({ label, value, onChange, semua, opsi, lebar = "w-48" }: {
  label: string; value: string; onChange: (v: string) => void; semua: string; opsi: string[]; lebar?: string
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={lebar}><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="semua">{semua}</SelectItem>
          {opsi.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  )
}

export const TH = ({ children }: { children: ReactNode }) => <th className="px-4 py-3 font-medium">{children}</th>

export const TextArea = ({ className, ...p }: React.ComponentProps<"textarea">) => (
  <textarea
    className={cn("min-h-20 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50", className)}
    {...p}
  />
)

// Bilah aksi menempel di bawah layar (halaman pemeriksaan & detail)
export const BilahAksi = ({ children }: { children: ReactNode }) => (
  <div className="sticky bottom-0 z-10 -mx-4 mt-6 flex flex-wrap items-center justify-between gap-3 border-t bg-card/95 px-4 py-3 backdrop-blur md:-mx-8 md:px-8">{children}</div>
)
