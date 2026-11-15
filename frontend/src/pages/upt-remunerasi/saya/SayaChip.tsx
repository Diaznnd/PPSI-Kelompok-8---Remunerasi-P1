import { Eye } from "lucide-react"

export function SayaChip({ readOnly = false }: { readOnly?: boolean }) {
  if (!readOnly) return null

  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
        <Eye className="size-3" />
        Hanya lihat
      </span>
    </div>
  )
}
