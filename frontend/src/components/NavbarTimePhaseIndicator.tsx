import { useEffect, useState } from "react"
import { CalendarDays, Clock } from "lucide-react"

function getQuarter(monthIndex0: number): "Q1" | "Q2" | "Q3" | "Q4" {
  if (monthIndex0 <= 2) return "Q1"
  if (monthIndex0 <= 5) return "Q2"
  if (monthIndex0 <= 8) return "Q3"
  return "Q4"
}

export function NavbarTimePhaseIndicator() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const hari = new Intl.DateTimeFormat("id-ID", { weekday: "long" }).format(now)
  const tanggal = now.getDate()
  const bulan = new Intl.DateTimeFormat("id-ID", { month: "long" }).format(now)
  const tahun = now.getFullYear()
  const jam = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
    .format(now)
    .replace(/\./g, ":")

  const periodeLabel = `${bulan} ${tahun}`
  const activeQuarter = getQuarter(now.getMonth())
  const quarters: Array<"Q1" | "Q2" | "Q3" | "Q4"> = ["Q1", "Q2", "Q3", "Q4"]

  return (
    <div className="flex flex-wrap items-center gap-2.5 text-xs">
      {/* Indikator Periode & Tanggal Lengkap */}
      <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-1.5 text-foreground">
        <CalendarDays className="size-3.5 text-primary shrink-0" />
        <span className="font-semibold text-primary">Periode {periodeLabel}</span>
        <span className="hidden text-muted-foreground sm:inline">•</span>
        <span className="hidden text-muted-foreground sm:inline">
          {hari}, {tanggal} {bulan} {tahun}
        </span>
      </div>

      {/* Jam Real-time */}
      <div className="hidden items-center gap-1.5 rounded-lg border bg-muted/40 px-2.5 py-1.5 font-mono text-foreground md:flex">
        <Clock className="size-3.5 text-primary shrink-0" />
        <span>{jam} WIB</span>
      </div>

      {/* Phase Q1 - Q4 */}
      <div
        className="flex items-center gap-1 rounded-lg border bg-muted/30 p-1"
        title={`Fase Kuartal Aktif: ${activeQuarter}`}
      >
        {quarters.map((q) => {
          const active = q === activeQuarter
          return (
            <span
              key={q}
              className={`rounded-md px-2 py-0.5 text-[11px] font-semibold transition-colors ${
                active
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {q}
            </span>
          )
        })}
      </div>
    </div>
  )
}
