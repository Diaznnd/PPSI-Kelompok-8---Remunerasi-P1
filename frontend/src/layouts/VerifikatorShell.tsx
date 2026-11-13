import { useState } from "react"
import { FileCheck2, Gauge, GitCompareArrows, History, ListChecks } from "lucide-react"
import PortalShell from "@/layouts/PortalShell"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PERIODE_AKTIF_VERIFIKATOR, PERIODE_VERIFIKATOR, verifikator } from "@/data/dummy-verifikator"

const NAV = [
  { to: "/verifikator/dashboard", label: "Beranda", icon: Gauge },
  { to: "/verifikator/pengajuan", label: "Verifikasi Pengajuan P1", icon: FileCheck2 },
  { to: "/verifikator/jabatan", label: "Verifikasi Perubahan Jabatan/Grade", icon: GitCompareArrows },
  { to: "/verifikator/status", label: "Pantau Status Pengajuan", icon: History },
  { to: "/verifikator/audit", label: "Jejak Audit", icon: ListChecks },
]

export default function VerifikatorShell() {
  const [periode, setPeriode] = useState(PERIODE_AKTIF_VERIFIKATOR)
  return (
    <PortalShell
      home="/verifikator/dashboard"
      nav={NAV}
      user={{ nama: verifikator.nama, inisial: verifikator.inisial, peran: "Verifikator" }}
      headerLeft={
        <>
          <span className="hidden text-sm text-muted-foreground sm:inline">Periode:</span>
          <Select value={periode} onValueChange={setPeriode}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>{PERIODE_VERIFIKATOR.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
          </Select>
        </>
      }
    />
  )
}
