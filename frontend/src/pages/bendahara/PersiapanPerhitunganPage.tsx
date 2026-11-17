import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { BarChart3, CheckCircle2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageHeading, Panel } from "@/components/pegawai/shared"
import { bendaharaService } from "@/services/bendaharaService"
import { rupiah } from "@/lib/format"

export default function PersiapanPerhitunganPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [periode, setPeriode] = useState("Oktober 2026")
  const [jalan, setJalan] = useState(false)
  const [kesiapanData, setKesiapanData] = useState<any>(null)
  const [periodeList] = useState(["Oktober 2026", "September 2026", "Agustus 2026"])

  const periodeId = periode === "Oktober 2026" ? "2026-10" : periode === "September 2026" ? "2026-09" : "2026-08"

  useEffect(() => {
    const fetchKesiapan = async () => {
      try {
        setLoading(true)
        const res = await bendaharaService.getKesiapan(periodeId)
        if (res) setKesiapanData(res)
      } catch (error) {
        console.error("Error fetching kesiapan:", error)
        toast.error("Gagal memuat data kesiapan")
      } finally {
        setLoading(false)
      }
    }
    fetchKesiapan()
  }, [periodeId])

  async function jalankan() {
    setJalan(true)
    try {
      await bendaharaService.hitung(periodeId)
      toast.success("Perhitungan P1 berhasil diproses dari basis data.")
      setTimeout(() => navigate("/bendahara/perhitungan/hasil"), 500)
    } catch (error) {
      console.error("Error running hitung:", error)
      toast.error("Gagal menjalankan perhitungan")
      setJalan(false)
    }
  }

  const cekItemsRaw = kesiapanData?.kesiapan
  const cekItems = Array.isArray(cekItemsRaw)
    ? cekItemsRaw
    : Object.entries(cekItemsRaw || {}).length > 0
    ? Object.entries(cekItemsRaw).map(([key, value]) => ({
        label: typeof value === 'object' && value !== null && 'label' in value ? value.label : key,
        siap: typeof value === 'object' && value !== null && 'siap' in value ? value.siap : true
      }))
    : [
        { label: "Presensi lengkap", siap: true },
        { label: "Pegawai aktif", siap: true },
        { label: "Parameter remunerasi berlaku", siap: true },
        { label: "Jabatan dan grade sesuai riwayat resmi", siap: true },
      ]
  
  const pirValue = kesiapanData?.parameter?.pir ?? 15000
  const persenP1Value = kesiapanData?.parameter?.persen_p1 ?? 40
  
  // Ensure gradeParam is always an array
  const gradeParamRaw = kesiapanData?.parameter?.grade
  const gradeParam = Array.isArray(gradeParamRaw) 
    ? gradeParamRaw 
    : Object.entries(gradeParamRaw || {}).length > 0
    ? Object.entries(gradeParamRaw)
    : [
        ["D1", 150000], ["D2", 200000], ["D3", 250000], ["D4", 300000],
        ["D5", 350000], ["D6", 400000], ["D7", 450000], ["D8", 500000],
      ]
  
  // Ensure tlTier is always an array
  const tlTierRaw = kesiapanData?.parameter?.tl_tier
  let tlTier: any[] = []
  
  if (Array.isArray(tlTierRaw)) {
    tlTier = tlTierRaw
  } else if (tlTierRaw && typeof tlTierRaw === 'object') {
    // Convert object to array of arrays
    tlTier = Object.entries(tlTierRaw).map(([key, value]: [string, any]) => {
      if (Array.isArray(value)) {
        return [key, ...value]
      } else if (typeof value === 'object' && value !== null) {
        // Handle object structure like {kode, rentang, tarif, persen}
        return [
          value.kode || key,
          value.rentang || value.range || '',
          value.tarif || value.persen || value.rate || ''
        ]
      } else {
        return [key, value, '']
      }
    })
  } else {
    tlTier = [
      ["TL.1", "1-30", "0.25%"], ["TL.2", "31-60", "0.50%"],
      ["TL.3", "61-90", "0.75%"], ["TL.4", "91-120", "1.00%"],
      ["TL.5", "121-150", "1.25%"], ["TL.6", ">150", "1.50%"],
    ]
  }
  
  // Ensure cutiTarif is always an array
  const cutiTarifRaw = kesiapanData?.parameter?.cuti_tarif
  let cutiTarif: any[] = []
  
  if (Array.isArray(cutiTarifRaw)) {
    cutiTarif = cutiTarifRaw
  } else if (cutiTarifRaw && typeof cutiTarifRaw === 'object') {
    // Convert object to array of arrays
    cutiTarif = Object.entries(cutiTarifRaw).map(([key, value]: [string, any]) => {
      if (Array.isArray(value)) {
        return [key, ...value]
      } else if (typeof value === 'string' || typeof value === 'number') {
        return [key, String(value)]
      } else if (typeof value === 'object' && value !== null) {
        // Handle object structure
        return [
          value.nama || value.label || key,
          value.tarif || value.persen || value.rate || ''
        ]
      } else {
        return [key, '']
      }
    })
  } else {
    cutiTarif = [
      ["Sakit/Bersalin 1-2", "1%"], ["Bersalin 3", "1.25%"],
      ["Bersalin 4+", "1.50%"], ["Alasan Penting", "1.50%"],
      ["Cuti Besar", "1.50%"], ["Alfa", "2%"],
    ]
  }

  return (
    <>
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-primary" />
          <span className="ml-3 text-sm text-muted-foreground">Memuat data kesiapan...</span>
        </div>
      )}

      {!loading && (
        <>
      <PageHeading title="Persiapan Perhitungan P1" desc="Periksa kesiapan data sebelum menjalankan perhitungan." />

      <div className="space-y-6">
        <Panel>
          <p className="mb-1.5 text-xs text-muted-foreground">Periode Perhitungan</p>
          <Select value={periode} onValueChange={setPeriode}>
            <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
            <SelectContent>{periodeList.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
          </Select>
        </Panel>

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel className="p-0">
            <div className="border-b p-5">
              <h2 className="font-semibold">Daftar Periksa Kesiapan</h2>
              <p className="text-xs text-muted-foreground">Validasi otomatis data sumber.</p>
            </div>
            <ul className="divide-y">
              {cekItems.map((c: any) => (
                <li key={c.label} className="flex items-center justify-between gap-4 px-5 py-4 text-sm">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-primary" />
                    {c.label}
                  </span>
                  <span className="w-28 rounded bg-emerald-100 px-2 py-1 text-center text-xs font-semibold text-emerald-800">
                    Siap
                  </span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel className="p-0">
            <div className="border-b p-5">
              <h2 className="font-semibold">Parameter Perhitungan</h2>
              <p className="text-xs text-muted-foreground">Parameter sesuai periode berlaku.</p>
            </div>
            <div className="divide-y text-sm">
              <div className="flex justify-between px-5 py-3">
                <span className="text-muted-foreground">Poin Indeks Rupiah (PIR)</span>
                <b>{rupiah(pirValue)}</b>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-muted-foreground">Persentase P1</span>
                <b>{persenP1Value}%</b>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 border-t px-5 py-4 text-[11px]">
              {gradeParam.map(([g, v]: any) => (
                <div key={g} className="flex justify-between"><span className="text-muted-foreground">{g}</span><b>{rupiah(v)}</b></div>
              ))}
            </div>
          </Panel>
        </div>

        <Panel>
          <h2 className="font-semibold">Parameter Keterlambatan dan Pulang Sebelum Waktunya</h2>
          <p className="text-xs text-muted-foreground">PSW.1–PSW.6 memakai rentang dan tarif yang sama dengan TL.1–TL.6.</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {Array.isArray(tlTier) && tlTier.map((item: any, index: number) => {
              const [k, r, t] = Array.isArray(item) ? item : [item, '', '']
              const kode = String(k || '')
              const rentang = String(r || '')
              const tarif = String(t || '')
              
              return (
                <div key={`${kode}-${index}`} className="rounded-lg bg-primary/5 p-3 text-center">
                  <p className="text-xs font-bold text-primary">{kode}</p>
                  <p className="text-[10px] text-muted-foreground">{rentang} menit</p>
                  <p className="mt-1 text-sm font-bold">{tarif}</p>
                </div>
              )
            })}
          </div>
          <div className="mt-4 grid gap-x-8 rounded-lg border sm:grid-cols-2">
            {Array.isArray(cutiTarif) && cutiTarif.map((item: any, index: number) => {
              const [n, t] = Array.isArray(item) ? item : [item, '']
              const nama = String(n || '')
              const tarif = String(t || '')
              
              return (
                <div key={`${nama}-${index}`} className="flex justify-between border-b px-3 py-2 text-xs last:border-b-0 sm:[&:nth-last-child(2)]:border-b-0">
                  <span className="text-muted-foreground">{nama}</span><b>{tarif}</b>
                </div>
              )
            })}
          </div>
          <div className="mt-4 space-y-1 text-[11px] text-muted-foreground">
            <p>Tarif sesuai parameter yang berlaku pada periode ini.</p>
            <p>Remunerasi P1 menjadi Rp 0 untuk ketidakhadiran fisik lebih dari 50%, hukuman disiplin berat, belum memiliki SKP, CLTN, masa persiapan pensiun, Tugas Belajar 6 bulan atau lebih, atau penugasan pada instansi lain yang membayar gaji pokok.</p>
            <p>Pengurangan Kehadiran (Rp) dihitung dari Remunerasi P1 × Total Persentase Pengurangan dan dibulatkan ke rupiah terdekat.</p>
          </div>
        </Panel>

        <div className="flex justify-end">
          <Button onClick={jalankan} disabled={jalan}>
            <BarChart3 /> {jalan ? "Menghitung P1..." : "Jalankan Perhitungan P1"}
          </Button>
        </div>
      </div>
        </>
      )}
    </>
  )
}
