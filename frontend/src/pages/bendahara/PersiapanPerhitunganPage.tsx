import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { BarChart3, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageHeading, Panel } from "@/components/pegawai/shared"
import { CUTI_TARIF, GRADE_PARAM, PERSEN_P1, PIR, PERIODE_REKAP, TL_TIER } from "@/data/dummy-bendahara"
import { rupiah } from "@/lib/format"

const CEK = ["Presensi lengkap", "Pegawai aktif", "Parameter remunerasi berlaku", "Jabatan dan grade sesuai riwayat resmi"]

export default function PersiapanPerhitunganPage() {
  const navigate = useNavigate()
  const [periode, setPeriode] = useState("Oktober 2026")
  const [jalan, setJalan] = useState(false)

  function jalankan() {
    setJalan(true)
    setTimeout(() => navigate("/bendahara/perhitungan/hasil"), 700)
  }

  return (
    <>
      <PageHeading title="Persiapan Perhitungan P1" desc="Periksa kesiapan data sebelum menjalankan perhitungan." />

      <div className="space-y-6">
        <Panel>
          <p className="mb-1.5 text-xs text-muted-foreground">Periode Perhitungan</p>
          <Select value={periode} onValueChange={setPeriode}>
            <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
            <SelectContent>{PERIODE_REKAP.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
          </Select>
        </Panel>

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel className="p-0">
            <div className="border-b p-5">
              <h2 className="font-semibold">Daftar Periksa Kesiapan</h2>
              <p className="text-xs text-muted-foreground">Validasi otomatis data sumber.</p>
            </div>
            <ul className="divide-y">
              {CEK.map((c) => (
                <li key={c} className="flex items-center justify-between gap-4 px-5 py-4 text-sm">
                  <span className="flex items-center gap-2"><CheckCircle2 className="size-4 text-primary" />{c}</span>
                  <span className="w-28 rounded bg-emerald-100 px-2 py-1 text-center text-xs font-semibold text-emerald-800">Siap</span>
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
              <div className="flex justify-between px-5 py-3"><span className="text-muted-foreground">Poin Indeks Rupiah (PIR)</span><b>{rupiah(PIR)}</b></div>
              <div className="flex justify-between px-5 py-3"><span className="text-muted-foreground">Persentase P1</span><b>{PERSEN_P1}%</b></div>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 border-t px-5 py-4 text-[11px]">
              {GRADE_PARAM.map(([g, v]) => (
                <div key={g} className="flex justify-between"><span className="text-muted-foreground">{g}</span><b>{rupiah(v)}</b></div>
              ))}
            </div>
          </Panel>
        </div>

        <Panel>
          <h2 className="font-semibold">Parameter Keterlambatan dan Pulang Sebelum Waktunya</h2>
          <p className="text-xs text-muted-foreground">PSW.1–PSW.6 memakai rentang dan tarif yang sama dengan TL.1–TL.6.</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {TL_TIER.map(([k, r, t]) => (
              <div key={k} className="rounded-lg bg-primary/5 p-3 text-center">
                <p className="text-xs font-bold text-primary">{k}</p>
                <p className="text-[10px] text-muted-foreground">{r} menit</p>
                <p className="mt-1 text-sm font-bold">{t}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-x-8 rounded-lg border sm:grid-cols-2">
            {CUTI_TARIF.map(([n, t]) => (
              <div key={n} className="flex justify-between border-b px-3 py-2 text-xs last:border-b-0 sm:[&:nth-last-child(2)]:border-b-0">
                <span className="text-muted-foreground">{n}</span><b>{t}</b>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-1 text-[11px] text-muted-foreground">
            <p>Tarif sesuai parameter yang berlaku pada periode ini.</p>
            <p>Remunerasi P1 menjadi Rp 0 untuk ketidakhadiran fisik lebih dari 50%, hukuman disiplin berat, belum memiliki SKP, CLTN, masa persiapan pensiun, Tugas Belajar 6 bulan atau lebih, atau penugasan pada instansi lain yang membayar gaji pokok.</p>
            <p>Pengurangan Kehadiran (Rp) dihitung dari Remunerasi P1 × Total Persentase Pengurangan dan dibulatkan ke rupiah terdekat. Pajak, Pajak TER, dan Tab. Pajak diisi oleh UPT Remunerasi.</p>
          </div>
        </Panel>

        <div className="flex justify-end">
          <Button onClick={jalankan} disabled={jalan}><BarChart3 /> {jalan ? "Menghitung..." : "Jalankan Perhitungan P1"}</Button>
        </div>
      </div>
    </>
  )
}
