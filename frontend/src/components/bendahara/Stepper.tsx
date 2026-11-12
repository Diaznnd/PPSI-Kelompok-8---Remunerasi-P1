import type { ReactNode } from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

// done = jumlah langkah yang sudah selesai; langkah ke-(done) ditandai "sedang berjalan"
export function Stepper({ steps, done, notes }: { steps: string[]; done: number; notes?: Record<number, ReactNode> }) {
  return (
    <div className="flex">
      {steps.map((s, i) => (
        <div key={s} className="relative flex flex-1 flex-col items-center gap-2 text-center">
          {i < steps.length - 1 && <span className={cn("absolute left-1/2 top-4 h-0.5 w-full -translate-y-1/2", i < done ? "bg-primary" : "bg-border")} />}
          <span
            className={cn(
              "z-10 flex size-8 items-center justify-center rounded-full border-2 bg-card text-xs font-semibold",
              i < done && "border-primary bg-primary text-primary-foreground",
              i === done && "border-primary text-primary",
              i > done && "border-border text-muted-foreground"
            )}
          >
            {i < done ? <Check className="size-4" /> : i + 1}
          </span>
          <span className="text-xs font-semibold">{s}</span>
          {notes?.[i]}
        </div>
      ))}
    </div>
  )
}
