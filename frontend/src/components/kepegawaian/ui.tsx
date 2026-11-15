import { useRef, useState, type ComponentProps, type DragEvent, type ReactNode } from "react"
import { UploadCloud, X } from "lucide-react"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"
import { inisial } from "@/data/dummy-kepegawaian"
import { cn } from "@/lib/utils"

export const Avatar = ({ nama }: { nama: string }) => (
  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">{inisial(nama)}</span>
)

export function Bidang({ label, hint, className, children }: { label: string; hint?: string; className?: string; children: ReactNode }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs">{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  )
}

export function AreaTeks({ className, ...p }: ComponentProps<"textarea">) {
  return <textarea {...p} className={cn("w-full resize-none rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50", className)} />
}

export function TabBar<T extends string>({ tabs, aktif, onChange, segmen }: { tabs: [T, string][]; aktif: T; onChange: (t: T) => void; segmen?: boolean }) {
  if (segmen) {
    return (
      <div className="grid rounded-lg border bg-card p-1" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
        {tabs.map(([k, l]) => (
          <button key={k} onClick={() => onChange(k)} className={cn("rounded-md py-2 text-sm", aktif === k ? "bg-primary/10 font-semibold text-primary" : "text-muted-foreground hover:bg-muted")}>{l}</button>
        ))}
      </div>
    )
  }
  return (
    <div className="flex gap-6 border-b text-sm">
      {tabs.map(([k, l]) => (
        <button key={k} onClick={() => onChange(k)} className={cn("-mb-px border-b-2 px-1 pb-2", aktif === k ? "border-primary font-semibold text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>{l}</button>
      ))}
    </div>
  )
}

export function Dropzone({ nama, onFile, onHapus, accept, cek, petunjuk, contoh, className }: {
  nama: string | null; onFile: (f: File) => void; onHapus: () => void; accept: string
  cek: (f: File) => string | null; petunjuk: string; contoh?: () => void; className?: string
}) {
  const ref = useRef<HTMLInputElement>(null)
  const [drag, setDrag] = useState(false)
  const pilih = (f?: File) => {
    if (!f) return
    const galat = cek(f)
    if (galat) toast.error(galat)
    else onFile(f)
  }
  const lepas = (e: DragEvent) => { e.preventDefault(); setDrag(false); pilih(e.dataTransfer.files[0]) }
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true) }} onDragLeave={() => setDrag(false)} onDrop={lepas} onClick={() => ref.current?.click()}
      className={cn("flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed bg-primary/5 px-4 py-6 text-center transition-colors", drag && "border-primary bg-primary/10", className)}
    >
      <input ref={ref} type="file" accept={accept} hidden onChange={(e) => pilih(e.target.files?.[0])} />
      <UploadCloud className="size-5 text-primary" />
      {nama ? (
        <span className="flex items-center gap-2 text-xs font-semibold">
          {nama}
          <button type="button" aria-label="Hapus berkas" onClick={(e) => { e.stopPropagation(); onHapus() }}><X className="size-4" /></button>
        </span>
      ) : (
        <>
          <p className="text-xs"><b className="text-primary">Pilih berkas</b> atau seret ke sini</p>
          <p className="text-[11px] text-muted-foreground">{petunjuk}</p>
          {contoh && <button type="button" className="text-[11px] font-semibold text-primary hover:underline" onClick={(e) => { e.stopPropagation(); contoh() }}>Gunakan berkas contoh</button>}
        </>
      )}
    </div>
  )
}
