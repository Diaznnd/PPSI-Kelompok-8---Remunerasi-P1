import { useState } from "react"
import { useOutletContext } from "react-router-dom"
import { FileText, Gauge, MessageSquare } from "lucide-react"
import PortalShell from "@/layouts/PortalShell"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DAFTAR_PERIODE, PERIODE_AKTIF, pegawai } from "@/data/dummy-pegawai"

const NAV = [
  { to: "/pegawai/dashboard", label: "Beranda", icon: Gauge },
  { to: "/pegawai/slip", label: "Slip P1", icon: FileText },
  { to: "/pegawai/pengaduan", label: "Pengaduan", icon: MessageSquare },
]

export function usePeriode() {
  return useOutletContext<{ periode: string }>()
}

export default function PegawaiShell() {
  const [periode, setPeriode] = useState(PERIODE_AKTIF)
  return (
    <PortalShell
      home="/pegawai/dashboard"
      nav={NAV}
      user={{ nama: pegawai.nama, inisial: pegawai.inisial, peran: "Pegawai" }}
      lebar="max-w-6xl"
      outletContext={{ periode }}
      headerLeft={
        <>
          <span className="hidden text-sm text-muted-foreground sm:inline">Periode:</span>
          <Select value={periode} onValueChange={setPeriode}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>{DAFTAR_PERIODE.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
          </Select>
        </>
      }
    />
  )
}
