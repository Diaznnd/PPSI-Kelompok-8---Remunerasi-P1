import { useState } from "react"
import { FileCheck2, FileText, Gauge, GitCompareArrows, History, LayoutGrid, ListChecks, MessageSquare } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import PortalShell from "@/layouts/PortalShell"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const PERIODE_LIST = ["Oktober 2026", "September 2026", "Agustus 2026", "Juli 2026"]
const PERIODE_DEFAULT = "Oktober 2026"

const NAV = [
  { to: "/verifikator/dashboard", label: "Beranda", icon: Gauge },
  { to: "/verifikator/pengajuan", label: "Verifikasi Pengajuan P1", icon: FileCheck2 },
  { to: "/verifikator/jabatan", label: "Verifikasi Perubahan Jabatan/Grade", icon: GitCompareArrows },
  { to: "/verifikator/status", label: "Pantau Status Pengajuan", icon: History },
  { to: "/verifikator/audit", label: "Jejak Audit", icon: ListChecks },
]

const NAV_PORTAL_PEGAWAI = [
  { to: "/pegawai/slip", label: "Slip P1 Saya", icon: FileText },
  { to: "/pegawai/pengaduan", label: "Pengaduan Saya", icon: MessageSquare },
  { to: "/pegawai/dashboard", label: "Portal Pegawai", icon: LayoutGrid },
]

export default function VerifikatorShell() {
  const { akun } = useAuth()
  const [periode, setPeriode] = useState(PERIODE_DEFAULT)

  const nama = akun?.nama || akun?.username || "Tim Verifikator"
  const inisial =
    nama
      .split(" ")
      .filter((s) => s.length > 0)
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "VF"

  const unitNama = akun?.unit_nama || "UPT Remunerasi"

  return (
    <PortalShell
      home="/verifikator/dashboard"
      nav={NAV}
      secondaryNav={{
        title: "PORTAL MANDIRI PEGAWAI",
        items: NAV_PORTAL_PEGAWAI,
      }}
      user={{
        nama,
        inisial,
        peran: "Verifikator",
        unit: unitNama,
      }}
      headerLeft={
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:inline">Periode:</span>
          <Select value={periode} onValueChange={setPeriode}>
            <SelectTrigger className="h-8 w-40 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIODE_LIST.map((p) => (
                <SelectItem key={p} value={p} className="text-xs">
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      }
    />
  )
}
