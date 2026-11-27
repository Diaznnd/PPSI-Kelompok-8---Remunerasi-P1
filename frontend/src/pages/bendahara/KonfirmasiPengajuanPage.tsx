import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft, ShieldCheck, TriangleAlert, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Field, PageHeading, Panel } from "@/components/pegawai/shared"
import { bendaharaService } from "@/services/bendaharaService"
import { rupiah } from "@/lib/format"

export default function KonfirmasiPengajuanPage() {
  const { akun } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [setuju, setSetuju] = useState(false)
  const [modal, setModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [ringkasan, setRingkasan] = useState<any>({
    pegawai: 0,
    remP1: 0,
    pengurangan: 0,
    bruto: 0,
    nolCount: 0,
    disiplinCount: 0,
  })
  const [catatan, setCatatan] = useState("")

  const unitNama = akun?.unit_nama || "Unit Kerja"

  // Fetch ringkasan from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await bendaharaService.getPratinjau("2026-10")
        
        if (res?.ringkasan) {
          setRingkasan(res.ringkasan)
        }
        
        // Fetch status for catatan pengembalian
        const statusRes = await bendaharaService.getStatus()
        if (statusRes?.data && statusRes.data.length > 0) {
          const latest = statusRes.data[0]
          if (latest.riwayat && latest.riwayat.length > 0) {
            setCatatan(latest.riwayat[0].catatan || "")
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Gagal memuat data ringkasan")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  async function handleKonfirmasi() {
    setSubmitting(true)
    try {
      await bendaharaService.ajukan({
        periode: "2026-10",
        psk_nama: "Dekan " + unitNama,
        catatan: "Pengajuan perhitungan P1 unit diajukan oleh Bendahara.",
      })
      toast.success("Pengajuan P1 berhasil dikirimkan ke Verifikator.")
      navigate("/bendahara/perhitungan/berhasil")
    } catch (error) {
      console.error("Error submitting pengajuan:", error)
      toast.error("Gagal mengirim pengajuan")
    } finally {
      setSubmitting(false)
      setModal(false)
    }
  }

  return (
    <>
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-primary" />
          <span className="ml-3 text-sm text-muted-foreground">Memuat data ringkasan...</span>
        </div>
      )}

      {!loading && (
        <>
      <Link to="/bendahara/perhitungan/hasil" className="mb-3 inline-flex items-center gap-1 text-xs text-primary hover:underline">
        <ArrowLeft className="size-3" /> Kembali
      </Link>
      <PageHeading title="Konfirmasi Pengajuan P1" desc={`Periksa ringkasan sebelum mengajukan ke Verifikator • ${unitNama}`} />

      <div className="space-y-6">
        <Panel className="border-l-4 border-l-primary">
          <p className="text-xs font-semibold">Catatan alasan pengembalian sebelumnya</p>
          <p className="mt-1 text-xs text-muted-foreground">{catatan}</p>
          <Button asChild variant="outline" size="sm" className="mt-3">
            <Link to="/bendahara/perhitungan/hasil">Buka Perhitungan</Link>
          </Button>
        </Panel>

        <Panel>
          <div className="grid gap-5 sm:grid-cols-3 lg:grid-cols-4">
            <Field label="Unit Kerja" value={unitNama} />
            <Field label="Periode" value="Oktober 2026" />
            <Field label="Jumlah Pegawai" value={`${ringkasan.pegawai} Pegawai`} />
            <Field label="Total Remunerasi P1 (40%)" value={rupiah(ringkasan.remP1)} />
            <Field label="Total Seluruh Pengurangan" value={rupiah(ringkasan.pengurangan)} />
            <Field label="Total Jumlah Bruto" value={rupiah(ringkasan.bruto)} />
            <Field label="Total Pajak PPh 21" value={rupiah(ringkasan.pajak || 0)} />
            <div className="rounded-lg bg-emerald-50 p-2 dark:bg-emerald-950/30">
              <Field label="Total P1 Netto (Jumlah Diterima)" value={rupiah(ringkasan.netto || (ringkasan.bruto - (ringkasan.pajak || 0)))} />
            </div>
          </div>
        </Panel>

        <Panel className="p-0">
          <div className="flex items-center gap-2 border-b p-5 text-sm font-semibold">
            <TriangleAlert className="size-4 text-orange-600" /> Peringatan Terbuka
          </div>
          {[`${ringkasan.nolCount} pegawai memiliki Remunerasi P1 Rp 0`, `${ringkasan.disiplinCount} pegawai memiliki hukuman disiplin aktif`].map((t) => (
            <div key={t} className="flex items-center justify-between border-b px-5 py-3 text-xs">
              <span>{t}</span>
              <Badge variant="secondary">Sudah Ditinjau</Badge>
            </div>
          ))}
          <label className="flex cursor-pointer items-center gap-2 px-5 py-4 text-xs">
            <input
              type="checkbox"
              className="size-4 accent-primary"
              checked={setuju}
              onChange={(e) => setSetuju(e.target.checked)}
            />
            Saya telah memeriksa hasil perhitungan dan menyatakan data sudah sesuai.
          </label>
          <div className="flex justify-end gap-2 border-t p-4">
            <Button asChild variant="outline">
              <Link to="/bendahara/perhitungan/hasil">Kembali ke Pratinjau</Link>
            </Button>
            <Button disabled={!setuju} onClick={() => setModal(true)}>
              Ajukan
            </Button>
          </div>
        </Panel>
      </div>

      <Dialog open={modal} onOpenChange={setModal}>
        <DialogContent showCloseButton={false} className="sm:max-w-sm">
          <DialogHeader className="items-center text-center">
            <div className="mb-1 flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShieldCheck className="size-5" />
            </div>
            <DialogTitle>Data akan dikunci selama proses verifikasi</DialogTitle>
            <DialogDescription>
              Anda tidak dapat melakukan koreksi sampai pengajuan dikembalikan oleh Verifikator.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button variant="outline" onClick={() => setModal(false)} disabled={submitting}>
              Batal
            </Button>
            <Button onClick={handleKonfirmasi} disabled={submitting}>
              {submitting ? "Mengajukan..." : "Konfirmasi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </>
      )}
    </>
  )
}
