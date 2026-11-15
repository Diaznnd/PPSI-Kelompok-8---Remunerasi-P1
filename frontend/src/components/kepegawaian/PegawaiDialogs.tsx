import { useState } from "react"
import { TriangleAlert } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AreaTeks, Avatar, Bidang } from "@/components/kepegawaian/ui"
import { GOLONGAN, JENIS_PEGAWAI, STATUS_PEGAWAI, kepeg, type JenisPegawai, type PegawaiKep, type StatusPegawai } from "@/data/dummy-kepegawaian"
import { nonaktifkanPegawai, tambahPegawai, ubahPegawai, useKepeg } from "@/data/store-kepegawaian"

// Dipasang bersyarat oleh halaman induk ({form && <FormPegawaiDialog ... />}) sehingga isiannya selalu segar.
export function FormPegawaiDialog({ pegawai, onClose }: { pegawai?: PegawaiKep; onClose: () => void }) {
  const { pegawai: daftar } = useKepeg()
  const ubah = !!pegawai
  const [nip, setNip] = useState(pegawai?.nip ?? "")
  const [nama, setNama] = useState(pegawai?.nama ?? "")
  const [email, setEmail] = useState(pegawai?.email ?? "")
  const [jenis, setJenis] = useState<JenisPegawai>(pegawai?.jenis ?? "Dosen")
  const [status, setStatus] = useState<StatusPegawai>(pegawai?.status ?? "PNS")
  const [golongan, setGolongan] = useState(pegawai?.golongan ?? "III/a")
  const [tmt, setTmt] = useState(pegawai?.tmt ?? "")
  const [galat, setGalat] = useState("")

  function simpan() {
    if (!ubah && !/^\d{18}$/.test(nip)) return setGalat("NIP harus 18 digit angka.")
    if (!ubah && daftar.some((p) => p.nip === nip)) return setGalat("NIP sudah terdaftar.")
    if (!nama.trim()) return setGalat("Nama lengkap wajib diisi.")
    if (!/^\S+@\S+\.\S+$/.test(email)) return setGalat("Email institusi tidak valid.")
    if (ubah) {
      ubahPegawai(pegawai.nip, { nama: nama.trim(), email, jenis, status, golongan, tmt })
      toast.success("Perubahan identitas disimpan.")
    } else {
      tambahPegawai({ nip, nama: nama.trim(), email, jenis, status, golongan, jabatan: "", grade: 0, tmt, aktif: true })
      toast.success("Pegawai ditambahkan.")
    }
    onClose()
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-xl!">
        <DialogHeader><DialogTitle>{ubah ? "Ubah Identitas Pegawai" : "Tambah Pegawai"}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <p className="text-[10px] font-semibold tracking-wide text-muted-foreground">IDENTITAS</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Bidang label="NIP" hint={ubah ? "NIP tidak dapat diubah" : `${nip.length}/18`}>
              <Input value={nip} disabled={ubah} maxLength={18} inputMode="numeric" placeholder="199001012020121001" onChange={(e) => setNip(e.target.value.replace(/\D/g, ""))} />
            </Bidang>
            <Bidang label="Nama lengkap dan gelar"><Input value={nama} placeholder="Dr. Nama Pegawai, M.T." onChange={(e) => setNama(e.target.value)} /></Bidang>
            <Bidang label="Email institusi"><Input value={email} placeholder="nama@unand.ac.id" onChange={(e) => setEmail(e.target.value)} /></Bidang>
            <Bidang label="Unit kerja"><Input value={kepeg.unit} disabled /></Bidang>
          </div>
          <p className="text-[10px] font-semibold tracking-wide text-muted-foreground">KEPEGAWAIAN</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Bidang label="Jenis pegawai">
              <Select value={jenis} onValueChange={(v) => setJenis(v as JenisPegawai)}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>{JENIS_PEGAWAI.map((j) => <SelectItem key={j} value={j}>{j}</SelectItem>)}</SelectContent></Select>
            </Bidang>
            <Bidang label="Status kepegawaian">
              <Select value={status} onValueChange={(v) => setStatus(v as StatusPegawai)}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>{STATUS_PEGAWAI.map(([k, p]) => <SelectItem key={k} value={k}>{k} - pengali {p}%</SelectItem>)}</SelectContent></Select>
            </Bidang>
            <Bidang label="Golongan/ruang">
              <Select value={golongan} onValueChange={setGolongan}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>{GOLONGAN.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select>
            </Bidang>
            <Bidang label="TMT di unit"><Input type="date" value={tmt} onChange={(e) => setTmt(e.target.value)} /></Bidang>
          </div>
          {galat && <p className="text-xs text-destructive">{galat}</p>}
        </div>
        <DialogFooter><Button variant="outline" onClick={onClose}>Batal</Button><Button onClick={simpan}>{ubah ? "Simpan Perubahan" : "Simpan Pegawai"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const ALASAN = ["Mutasi keluar unit", "Pensiun", "Pemberhentian", "Tugas belajar", "Meninggal dunia"]

export function NonaktifkanDialog({ pegawai, onClose }: { pegawai: PegawaiKep; onClose: () => void }) {
  const [alasan, setAlasan] = useState(ALASAN[0])
  const [ket, setKet] = useState("")
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md!">
        <DialogHeader><DialogTitle>Nonaktifkan pegawai</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg bg-muted/60 p-3"><Avatar nama={pegawai.nama} /><div><p className="text-sm font-semibold">{pegawai.nama}</p><p className="text-[11px] text-muted-foreground">{pegawai.nip}</p></div></div>
          <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" />
            Pegawai nonaktif tidak ikut dihitung pada perhitungan P1 berikutnya. Data identitas dan riwayat tetap tersimpan dan dapat diaktifkan kembali.
          </div>
          <Bidang label="Alasan">
            <Select value={alasan} onValueChange={setAlasan}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>{ALASAN.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent></Select>
          </Bidang>
          <Bidang label="Keterangan"><AreaTeks rows={3} value={ket} onChange={(e) => setKet(e.target.value)} placeholder="Contoh: SK Mutasi 0912/UN16.R/KP/2026, berlaku 1 November 2026" /></Bidang>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button variant="destructive" onClick={() => { nonaktifkanPegawai(pegawai.nip, alasan, ket.trim()); toast.success(`${pegawai.nama} dinonaktifkan.`); onClose() }}>Nonaktifkan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
