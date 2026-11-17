import { Link } from "react-router-dom"
import { FileText, Info, MessageSquare, User } from "lucide-react"
import { useEffect, useState } from "react"
import { usePeriode } from "@/layouts/PegawaiShell"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Field, PageHeading, Panel, PanelTitle } from "@/components/pegawai/shared"
import { rupiah } from "@/lib/format"
import { pegawaiService } from "@/services/pegawaiService"

export default function BerandaPage() {
  const { periode } = usePeriode()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const result = await pegawaiService.getBeranda()
        setData(result)
      } catch (error) {
        console.error('Failed to load beranda:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <>
        <PageHeading title="Beranda" desc="Memuat data..." />
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Memuat data...</p>
        </div>
      </>
    )
  }

  if (!data) {
    return (
      <>
        <PageHeading title="Beranda" desc="Data tidak tersedia" />
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Data tidak dapat dimuat</p>
        </div>
      </>
    )
  }

  const pegawai = data?.profil || {}
  const slip = data?.slip_terbaru
  const aktif = data?.pengaduan_aktif || 0

  // Return early if no pegawai data
  if (!pegawai || !pegawai.Nama) {
    return (
      <>
        <PageHeading title="Beranda" desc="Data profil tidak lengkap" />
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Data profil pegawai tidak tersedia</p>
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeading title="Beranda" desc={`Ringkasan remunerasi Anda untuk periode ${slip?.Periode || periode}.`} />

      <div className="space-y-6">
        <Panel>
          <PanelTitle 
            icon={User} 
            title="Identitas Pegawai" 
            desc="Data kepegawaian yang digunakan dalam perhitungan P1." 
            right={pegawai.StatusPegawai && <Badge variant="secondary" className="bg-primary/10 text-primary">{pegawai.StatusPegawai}</Badge>} 
          />
          <div className="mt-5 grid gap-5 border-t pt-5 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Nama lengkap" value={pegawai.Nama || '-'} />
            <Field label="NIP" value={pegawai.NIP || '-'} />
            <Field label="Jenis pegawai" value={pegawai.JenisPegawai || '-'} />
            <Field label="Unit kerja" value={pegawai.NamaUnit || '-'} />
            <Field label="Jabatan" value={pegawai.NamaJabatan || '-'} />
            <Field label="Grade" value={pegawai.KodeGrade || '-'} />
            <Field label="Pangkat/Golongan" value={pegawai.Pangkat || '-'} />
            <Field label="NPWP" value={pegawai.NPWP || '-'} />
          </div>
        </Panel>

        {slip && (
          <div className="grid gap-6 md:grid-cols-5">
            <Panel className="md:col-span-3">
              <PanelTitle icon={FileText} title="Slip P1 Terbaru" desc={slip.Periode} right={<Badge variant="secondary" className="bg-primary/10 text-primary">{slip.StatusSlip}</Badge>} />
              <p className="mt-5 text-xs text-muted-foreground">Jumlah Netto</p>
              <p className="text-3xl font-bold text-primary">{rupiah(slip.JumlahNetto)}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">Dibayarkan ke {pegawai.NamaBank ? `${pegawai.NamaBank} ${pegawai.NoRekening}` : pegawai.NoRekening}</p>
              <Button asChild className="mt-4">
                <Link to={`/pegawai/slip/${slip.IDSlip}`}>Lihat Slip</Link>
              </Button>
            </Panel>

            <Panel className="md:col-span-2">
              <PanelTitle icon={MessageSquare} title="Pengaduan Saya" desc="Pengaduan yang masih dalam proses." />
              <p className="mt-5 flex items-baseline gap-2">
                <span className="text-3xl font-bold">{aktif}</span>
                <span className="text-xs text-muted-foreground">pengaduan aktif</span>
              </p>
              <Button asChild variant="outline" className="mt-4 w-full">
                <Link to="/pegawai/pengaduan">Lihat Semua</Link>
              </Button>
            </Panel>
          </div>
        )}

        <div className="flex gap-3 rounded-lg border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
          <Info className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-semibold">Informasi pembayaran P1</p>
            <p className="mt-1 text-xs">P1 periode Oktober 2026 dibayarkan pada November 2026.</p>
            <p className="text-xs">Perubahan jabatan atau grade berlaku mengikuti ketentuan Surat Pernyataan Melaksanakan Tugas.</p>
          </div>
        </div>
      </div>
    </>
  )
}
