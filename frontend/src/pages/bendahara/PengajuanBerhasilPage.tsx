import { Link } from "react-router-dom"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeading, Panel } from "@/components/pegawai/shared"

export default function PengajuanBerhasilPage() {
  return (
    <>
      <PageHeading title="Pengajuan Berhasil" desc="Perhitungan telah dikirim kepada Verifikator." />
      <Panel className="mx-auto max-w-lg py-10 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary"><CheckCircle2 className="size-6" /></div>
        <h2 className="mt-4 font-semibold">Pengajuan berhasil dikirim</h2>
        <p className="mt-1 text-[11px] text-muted-foreground">P1-2026-09-FTI-018 • Pengajuan ke-2</p>
        <p className="text-[11px] text-muted-foreground">Data dikunci selama proses verifikasi berlangsung.</p>
        <Button asChild className="mt-5"><Link to="/bendahara/status">Pantau Status Pengajuan</Link></Button>
      </Panel>
    </>
  )
}
