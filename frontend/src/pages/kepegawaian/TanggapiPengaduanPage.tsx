import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, ArrowUpRight, CheckCircle2, Info, Send } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AreaTeks, TabBar } from "@/components/kepegawaian/ui"
import { Stepper } from "@/components/bendahara/Stepper"
import { Field, PageHeading, Panel } from "@/components/pegawai/shared"
import { warnaAduan } from "@/components/kepegawaian/warna"
import { TINGKAT_HUKUMAN, statusHukuman, tglID } from "@/data/dummy-kepegawaian"
import { persenStr } from "@/data/dummy-bendahara"
import { hitungPresensi } from "@/data/dummy-kepegawaian"
import { tanggapiPengaduan, useKepeg } from "@/data/store-kepegawaian"
import { kepegawaianService } from "@/services/kepegawaianService"
import { cn } from "@/lib/utils"

type Diag = "jabatan" | "presensi" | "hukuman" | "p1"
const Sub = ({ t }: { t: string }) => <span className="text-[10px] text-muted-foreground">{t}</span>

export default function TanggapiPengaduanPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const s = useKepeg()
  const [apiAduan, setApiAduan] = useState<any | null>(null)
  const [diag, setDiag] = useState<Diag>("jabatan")
  const [tindakan, setTindakan] = useState<"selesai" | "teruskan" | null>(null)
  const [tanggapan, setTanggapan] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    kepegawaianService.getPengaduanDetail(id).then((res) => {
      if (res?.data) setApiAduan(res.data)
    }).catch(() => { })
  }, [id])

  const a = apiAduan || s.pengaduan.find((x) => x.id === id)

  if (!a) return <Panel><p className="text-sm">Pengaduan tidak ditemukan.</p><Button asChild variant="outline" className="mt-4"><Link to="/kepegawaian/pengaduan">Kembali</Link></Button></Panel>

  const peg = s.pegawai.find((p) => p.nip === a.nip)
  const hukuman = s.hukuman.filter((h) => h.nip === a.nip)
  const hukumanAktif = hukuman.find((h) => statusHukuman(h) === "Aktif")
  const presensi = s.presensi.find((r) => r.nip === a.nip)
  const terbuka = a.status === "Diajukan"
  // rekomendasi: sumber masalah di data unit => selesaikan di unit
  const disarankanUnit = a.kategori === "Presensi" || a.kategori === "Jabatan/grade" || !!hukumanAktif
  const pilih = tindakan ?? (disarankanUnit ? "selesai" : "teruskan")
  const done = a.status === "Diajukan" ? 1 : a.status === "Diteruskan" ? 2 : 3

  async function kirim() {
    if (tanggapan.trim().length < 10) return toast.error("Tanggapan minimal 10 karakter.")
    setSaving(true)
    try {
      await kepegawaianService.tanggapiPengaduan(a.raw_id || a.id, { tindakan: pilih, tanggapan: tanggapan.trim() })
    } catch {
      // fallback
    } finally {
      tanggapiPengaduan(a.id, pilih, tanggapan.trim())
      toast.success(pilih === "selesai" ? "Tanggapan terkirim, pengaduan diselesaikan." : "Pengaduan diteruskan ke UPT Remunerasi.")
      setSaving(false)
      navigate("/kepegawaian/pengaduan")
    }
  }

  return (
    <>
      <Link to="/kepegawaian/pengaduan" className="mb-3 inline-flex items-center gap-1 text-xs text-primary hover:underline"><ArrowLeft className="size-3" /> Kembali <span className="text-muted-foreground">Pengaduan Pegawai</span></Link>
      <PageHeading title={`Pengaduan ${a.id}`} desc={`${a.nama} • ${a.kategori} • masuk ${a.masuk}`} action={<Badge variant="outline" className={warnaAduan[a.status]}>{a.status}</Badge>} />

      <div className="space-y-5 pb-20">
        <Panel><Stepper steps={["Diajukan pegawai", "Diagnosis unit", "Selesai"]} done={done} notes={{ 0: <Sub t={a.masuk} />, 1: <Sub t="Bidang Kepegawaian" />, 2: <Sub t="Tanggapan ke pegawai" /> }} /></Panel>

        <Panel>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Pegawai" value={a.nama} /><Field label="NIP" value={a.nip} />
            <Field label="Jabatan/grade berlaku" value={peg?.jabatan ? `${peg.jabatan} • G${peg.grade}` : "-"} /><Field label="Status kepegawaian" value={peg?.status ?? "-"} />
            <Field label="Kategori" value={a.kategori} /><Field label="Periode terkait" value={a.periode} /><Field label="Pengajuan terkait" value={a.pengajuan} /><Field label="Tanggal masuk" value={a.masuk} />
          </div>
        </Panel>

        <Panel><p className="text-xs font-semibold">Isi pengaduan</p><p className="mt-2 text-sm text-muted-foreground">“{a.isi}”</p></Panel>

        <div>
          <h2 className="font-semibold">Diagnosis data sumber</h2>
          <p className="mb-3 text-xs text-muted-foreground">Periksa riwayat jabatan/grade, presensi, dan hukuman disiplin sebelum memutuskan penanganan.</p>
          <TabBar<Diag> aktif={diag} onChange={setDiag} tabs={[["jabatan", "Riwayat jabatan/grade"], ["presensi", "Presensi"], ["hukuman", "Hukuman disiplin"], ["p1", "Rincian P1"]]} />
          <Panel className="mt-3 overflow-x-auto p-0">
            {diag === "jabatan" && (
              <table className="w-full text-xs"><thead className="bg-muted/50 text-left text-[11px] text-muted-foreground"><tr>{["Jabatan", "Grade", "Mulai berlaku", "Berakhir", "Keterangan"].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
                <tbody><tr className="border-t"><td className="px-4 py-3">{peg?.jabatan || "-"}</td><td className="px-4 py-3">{peg?.grade ? `Grade ${peg.grade}` : "-"}</td><td className="px-4 py-3">1 Juli 2021</td><td className="px-4 py-3 text-muted-foreground">Sekarang</td><td className="px-4 py-3"><Badge variant="outline" className="border-emerald-200 bg-emerald-100 text-emerald-800">Berlaku</Badge></td></tr></tbody></table>
            )}
            {diag === "presensi" && (presensi ? (
              <table className="w-full text-xs"><thead className="bg-muted/50 text-left text-[11px] text-muted-foreground"><tr>{["Hari kerja", "Hadir", "Tidak hadir", "Cuti/izin", "Pot. kehadiran", "Status"].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
                <tbody><tr className="border-t"><td className="px-4 py-3">{presensi.hariKerja}</td><td className="px-4 py-3">{presensi.hadir}</td><td className="px-4 py-3">{presensi.tidakHadir}</td><td className="px-4 py-3">{presensi.cuti}</td><td className="px-4 py-3">{persenStr(hitungPresensi(presensi, new Set()).pot)}</td><td className="px-4 py-3">{hitungPresensi(presensi, new Set()).status}</td></tr></tbody></table>
            ) : <p className="p-5 text-xs text-muted-foreground">Tidak ada data presensi untuk pegawai ini pada periode berjalan.</p>)}
            {diag === "hukuman" && (hukuman.length ? (
              <table className="w-full text-xs"><thead className="bg-muted/50 text-left text-[11px] text-muted-foreground"><tr>{["Tingkat", "Jenis hukuman", "Masa berlaku", "Status"].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
                <tbody>{hukuman.map((h) => <tr key={h.id} className="border-t"><td className="px-4 py-3">{h.tingkat} (potongan P1 {TINGKAT_HUKUMAN[h.tingkat]}%)</td><td className="px-4 py-3">{h.jenis}<p className="text-[10px] text-muted-foreground">SK {h.sk}</p></td><td className="px-4 py-3">{tglID(h.mulai)} – {tglID(h.berakhir)}</td><td className="px-4 py-3">{statusHukuman(h)}</td></tr>)}</tbody></table>
            ) : <p className="p-5 text-xs text-muted-foreground">Tidak ada hukuman disiplin tercatat.</p>)}
            {diag === "p1" && (a.nip === "198506202010121001" ? (
              <dl className="divide-y text-xs">{[["P1 Gross", "Rp 5.100.000"], ["Potongan kehadiran (2,5%)", "Rp 127.500"], ["Pemotongan hukuman disiplin Sedang (25%)", "Rp 1.275.000"], ["P1 setelah potongan", "Rp 3.697.500"]].map(([l, v]) => <div key={l} className="flex justify-between px-4 py-3"><dt className="text-muted-foreground">{l}</dt><dd className="font-semibold">{v}</dd></div>)}</dl>
            ) : <p className="p-5 text-xs text-muted-foreground">Rincian P1 lengkap tersedia pada hasil perhitungan Bendahara untuk periode {a.periode}.</p>)}
          </Panel>
        </div>

        <Panel className="space-y-4">
          <h2 className="font-semibold">Penanganan</h2>
          {terbuka ? (
            <>
              <div className="flex gap-2 rounded-lg border border-sky-200 bg-sky-50 p-3 text-xs text-sky-900">
                <Info className="mt-0.5 size-4 shrink-0" />
                <div>
                  <p className="font-semibold">Rekomendasi: {disarankanUnit ? "selesaikan di unit" : "teruskan ke UPT Remunerasi"}</p>
                  <p>{hukumanAktif ? `Data hukuman disiplin ${hukumanAktif.tingkat} (${hukumanAktif.jenis}) tercatat aktif ${tglID(hukumanAktif.mulai)} – ${tglID(hukumanAktif.berakhir)}. Potongan sesuai data sumber unit, sehingga dapat dijelaskan langsung kepada pegawai.` : disarankanUnit ? "Akar masalah berada pada data sumber unit (presensi atau jabatan/grade). Koreksi data bila perlu lalu jelaskan kepada pegawai." : "Data sumber unit tampak sesuai. Masalah kemungkinan ada pada verifikasi, penetapan, parameter, pajak, atau P1 Netto yang menjadi kewenangan UPT Remunerasi."}</p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {([["selesai", "Selesaikan di Bidang Kepegawaian", "Akar masalah ada pada data sumber unit atau cukup dijelaskan.", CheckCircle2], ["teruskan", "Teruskan ke UPT Remunerasi", "Terkait verifikasi, penetapan, parameter, pajak, atau P1 Netto.", ArrowUpRight]] as const).map(([k, j, d, Icon]) => (
                  <button key={k} type="button" role="radio" aria-checked={pilih === k} onClick={() => setTindakan(k)} className={cn("flex items-start gap-3 rounded-lg border p-4 text-left", pilih === k ? "border-primary bg-primary/10" : "hover:bg-muted")}>
                    <Icon className="mt-0.5 size-4 shrink-0 text-primary" /><span><span className="block text-xs font-semibold">{j}</span><span className="text-[11px] text-muted-foreground">{d}</span></span>
                  </button>
                ))}
              </div>
              <div className="space-y-1.5">
                <p className="text-xs">Tanggapan untuk pegawai</p>
                <AreaTeks rows={4} value={tanggapan} onChange={(e) => setTanggapan(e.target.value)} placeholder="Contoh: Berdasarkan SK hukuman disiplin, masa hukuman berlaku hingga 31 Januari 2027..." />
                <p className="text-[11px] text-muted-foreground">Tanggapan akan dapat dilihat pegawai.</p>
              </div>
            </>
          ) : (
            <div className="space-y-2 text-xs"><p><b>Penanganan:</b> {a.penanganan}</p>{a.tanggapan && <p className="rounded-lg bg-muted/60 p-3 text-muted-foreground">Tanggapan ke pegawai: {a.tanggapan}</p>}</div>
          )}
        </Panel>
      </div>

      <div className="sticky bottom-0 -mx-4 flex items-center justify-between border-t bg-card px-4 py-3 md:-mx-8 md:px-8">
        <Button asChild variant="outline"><Link to="/kepegawaian/pengaduan">Kembali ke Daftar</Link></Button>
        {terbuka && <Button onClick={kirim} disabled={tanggapan.trim().length < 10 || saving}><Send /> {saving ? "Mengirim..." : pilih === "selesai" ? "Kirim Tanggapan & Selesaikan" : "Kirim Tanggapan & Teruskan ke UPT"}</Button>}
      </div>
    </>
  )
}
