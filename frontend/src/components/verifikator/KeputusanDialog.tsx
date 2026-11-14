import { useState } from "react"
import { CheckCircle2, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { TextArea } from "@/components/verifikator/shared"

const Ikon = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-1 flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">{children}</div>
)

type Props = { open: boolean; onOpenChange: (o: boolean) => void }

export function SetujuiDialog({ open, onOpenChange, deskripsi, onKonfirmasi }: Props & { deskripsi: string; onKonfirmasi: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-sm">
        <DialogHeader>
          <Ikon><CheckCircle2 className="size-5" /></Ikon>
          <DialogTitle>Setujui dan Teruskan?</DialogTitle>
          <DialogDescription>{deskripsi}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" className="border-primary text-primary" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={() => { onKonfirmasi(); onOpenChange(false) }}>Konfirmasi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function KembalikanDialog({ open, onOpenChange, deskripsi = "Pengajuan akan dikembalikan kepada pengaju untuk diperbaiki.", onKembalikan }: Props & { deskripsi?: string; onKembalikan: (alasan: string) => void }) {
  const [alasan, setAlasan] = useState("")
  const [coba, setCoba] = useState(false)
  const kosong = alasan.trim() === ""

  const tutup = (o: boolean) => { if (!o) { setAlasan(""); setCoba(false) } onOpenChange(o) }
  const kirim = () => {
    setCoba(true)
    if (kosong) return
    onKembalikan(alasan.trim())
    tutup(false)
  }

  return (
    <Dialog open={open} onOpenChange={tutup}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <Ikon><RotateCcw className="size-5" /></Ikon>
          <DialogTitle>Kembalikan untuk Perbaikan?</DialogTitle>
          <DialogDescription>{deskripsi}</DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="alasan">Catatan Alasan <span className="text-destructive">*</span></Label>
          <TextArea id="alasan" placeholder="Rangkum alasan dan catatan per pegawai..." value={alasan} onChange={(e) => setAlasan(e.target.value)} aria-invalid={coba && kosong} />
          {coba && kosong && <p className="text-xs text-destructive">Catatan alasan wajib diisi.</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" className="border-primary text-primary" onClick={() => tutup(false)}>Batal</Button>
          <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10" onClick={kirim}>Kembalikan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
