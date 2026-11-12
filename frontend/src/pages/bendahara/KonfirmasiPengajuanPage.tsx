import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft, ShieldCheck, TriangleAlert } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Field, PageHeading, Panel } from "@/components/pegawai/shared"
import { RINGKASAN, STATUS_PERIODE, bendahara } from "@/data/dummy-bendahara"
import { rupiah } from "@/lib/format"

export default function KonfirmasiPengajuanPage() {
  const navigate = useNavigate()
  const [setuju, setSetuju] = useState(false)
  const [modal, setModal] = useState(false)
  const catatan = STATUS_PERIODE["September 2026"].riwayat[0].catatan

  return (
    <>
      <Link to="/bendahara/perhitungan/hasil" className="mb-3 inline-flex items-center gap-1 text-xs text-primary hover:underline"><ArrowLeft className="size-3" /> Kembali</Link>
      <PageHeading title="Konfirmasi Pengajuan P1" desc="Periksa ringkasan sebelum mengajukan • Pengajuan ke-2" />

      <div className="space-y-6">
        <Panel className="border-l-4 border-l-primary">
          <p className="text-xs font-semibold">Catatan alasan pengembalian sebelumnya</p>
          <p className="mt-1 text-xs text-muted-foreground">{catatan}</p>
          <Button asChild variant="outline" size="sm" className="mt-3"><Link to="/bendahara/perhitungan/hasil">Buka Perhitungan</Link></Button>
        </Panel>

        <Panel>
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Unit" value={bendahara.unit} />
            <Field label="Periode" value="Oktober 2026" />
            <Field label="Jumlah Pegawai" value={RINGKASAN.pegawai} />
            <Field label="Total Remunerasi P1" value={rupiah(RINGKASAN.remP1)} />
            <Field label="Total Pengurangan Kehadiran" value={rupiah(RINGKASAN.pengurangan)} />
            <Field label="Total Jumlah Bruto" value={rupiah(RINGKASAN.bruto)} />
          </div>
        </Panel>

        <Panel className="p-0">
          <div className="flex items-center gap-2 border-b p-5 text-sm font-semibold"><TriangleAlert className="size-4 text-orange-600" /> Peringatan Terbuka</div>
          {[`${RINGKASAN.nolCount} pegawai memiliki Remunerasi P1 Rp 0`, `${RINGKASAN.disiplinCount} pegawai memiliki hukuman disiplin aktif`].map((t) => (
            <div key={t} className="flex items-center justify-between border-b px-5 py-3 text-xs"><span>{t}</span><Badge variant="secondary">Sudah Ditinjau</Badge></div>
          ))}
          <label className="flex cursor-pointer items-center gap-2 px-5 py-4 text-xs">
            <input type="checkbox" className="size-4 accent-primary" checked={setuju} onChange={(e) => setSetuju(e.target.checked)} />
            Saya telah memeriksa hasil perhitungan dan menyatakan data sudah sesuai.
          </label>
          <div className="flex justify-end gap-2 border-t p-4">
            <Button asChild variant="outline"><Link to="/bendahara/perhitungan/hasil">Kembali ke Pratinjau</Link></Button>
            <Button disabled={!setuju} onClick={() => setModal(true)}>Ajukan</Button>
          </div>
        </Panel>
      </div>

      <Dialog open={modal} onOpenChange={setModal}>
        <DialogContent showCloseButton={false} className="sm:max-w-sm">
          <DialogHeader className="items-center text-center">
            <div className="mb-1 flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary"><ShieldCheck className="size-5" /></div>
            <DialogTitle>Data akan dikunci selama proses verifikasi</DialogTitle>
            <DialogDescription>Anda tidak dapat melakukan koreksi sampai pengajuan dikembalikan oleh Verifikator.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button variant="outline" onClick={() => setModal(false)}>Batal</Button>
            <Button onClick={() => navigate("/bendahara/perhitungan/berhasil")}>Konfirmasi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
