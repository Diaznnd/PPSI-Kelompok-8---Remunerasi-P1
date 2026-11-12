import { Link, useParams } from "react-router-dom"
import { ArrowLeft, Download, Printer } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { PageHeading, Panel } from "@/components/pegawai/shared"
import { DAFTAR_AMPRAH, PEGAWAI_AWAL, RINGKASAN, bendahara, hitung } from "@/data/dummy-bendahara"

export default function AmprahDetailPage() {
  const { id } = useParams()
  const a = DAFTAR_AMPRAH.find((x) => x.id === id && x.tersedia)

  if (!a) {
    return (
      <Panel>
        <p className="text-sm">Amprah tidak ditemukan.</p>
        <Button asChild variant="outline" className="mt-4"><Link to="/bendahara/amprah">Kembali</Link></Button>
      </Panel>
    )
  }
  const rows = PEGAWAI_AWAL.map((p) => ({ p, h: hitung(p) }))
  const dummy = () => toast.info("Belum tersambung ke backend (dummy).")

  return (
    <>
      <Link to="/bendahara/amprah" className="mb-3 inline-flex items-center gap-1 text-xs text-primary hover:underline print:hidden"><ArrowLeft className="size-3" /> Kembali</Link>
      <PageHeading
        title="Detail Amprah"
        desc={`${a.nomor} • ${a.kelompok}`}
        action={
          <div className="flex gap-2 print:hidden">
            <Button variant="outline" onClick={() => window.print()}><Printer /> Cetak</Button>
            <Button variant="outline" onClick={dummy}><Download /> Unduh Excel</Button>
            <Button onClick={dummy}><Download /> Unduh PDF</Button>
          </div>
        }
      />

      <div className="overflow-x-auto rounded-xl border bg-muted/50 p-4 md:p-6">
        <div className="mx-auto min-w-[56rem] bg-white p-8 text-[11px] text-black shadow-sm">
          <div className="border-b-2 border-black pb-3 text-right">
            <p className="text-[10px] font-bold tracking-wide">UNIVERSITAS ANDALAS</p>
            <p className="text-lg font-semibold">DAFTAR AMPRAH REMUNERASI P1</p>
            <p className="text-[10px]">{bendahara.unit}</p>
          </div>
          <dl className="mt-4 grid grid-cols-[7rem_1fr] gap-y-1">
            <dt>Satuan Kerja</dt><dd className="font-semibold">Universitas Andalas</dd>
            <dt>Unit/Fakultas</dt><dd className="font-semibold">{bendahara.unit}</dd>
            <dt>Nomor / Tanggal</dt><dd className="font-semibold">{a.nomor} / {a.terbit}</dd>
            <dt>Judul</dt><dd className="font-semibold">Pembayaran Remunerasi (P1) Bagi {a.kelompok} Bulan Oktober 2026 {bendahara.unit} Universitas Andalas</dd>
            <dt>Periode</dt><dd className="font-semibold">Oktober 2026 • Dibayarkan November 2026</dd>
          </dl>

          <p className="mb-1 mt-5 text-xs font-semibold">DETAIL PEMBAYARAN</p>
          <table className="w-full border border-black text-[10px]">
            <thead className="bg-gray-100">
              <tr>{["No", "Nama / NIP", "Golongan / NPWP", "Jabatan / Unit Kerja", "Grade Jab.", "Nilai Grade Jabatan (Rp)", "Remunerasi P1 (Rp)", "Pengurangan Kehadiran (Rp)", "Jumlah Bruto (Rp)", "Pajak (Rp)", "Jumlah Netto (Rp)"].map((h) => <th key={h} className="border border-black p-1.5 text-left">{h}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map(({ p, h }, i) => (
                <tr key={p.nip}>
                  <td className="border border-black p-1.5">{i + 1}</td>
                  <td className="border border-black p-1.5"><b>{p.nama}</b><br />{p.nip}</td>
                  <td className="border border-black p-1.5"><b>{p.pangkat}</b><br />{p.npwp}</td>
                  <td className="border border-black p-1.5"><b>{p.jabatan}</b><br />{bendahara.unit}</td>
                  <td className="border border-black p-1.5">{p.grade}</td>
                  <td className="border border-black p-1.5 text-right">{h.remGrade.toLocaleString("id-ID")}</td>
                  <td className="border border-black p-1.5 text-right">{h.remP1.toLocaleString("id-ID")}</td>
                  <td className="border border-black p-1.5 text-right">{h.pengurangan.toLocaleString("id-ID")}</td>
                  <td className="border border-black p-1.5 text-right">{h.bruto.toLocaleString("id-ID")}</td>
                  <td className="border border-black p-1.5 text-right">{p.pajak.toLocaleString("id-ID")}</td>
                  <td className="border border-black p-1.5 text-right font-bold">{h.netto.toLocaleString("id-ID")}</td>
                </tr>
              ))}
              <tr className="font-bold">
                <td className="border border-black p-1.5" colSpan={6}>TOTAL ({RINGKASAN.pegawai} pegawai, seluruh unit)</td>
                <td className="border border-black p-1.5 text-right">{RINGKASAN.remP1.toLocaleString("id-ID")}</td>
                <td className="border border-black p-1.5 text-right">{RINGKASAN.pengurangan.toLocaleString("id-ID")}</td>
                <td className="border border-black p-1.5 text-right">{RINGKASAN.bruto.toLocaleString("id-ID")}</td>
                <td className="border border-black p-1.5 text-right">{RINGKASAN.pajak.toLocaleString("id-ID")}</td>
                <td className="border border-black p-1.5 text-right">{RINGKASAN.netto.toLocaleString("id-ID")}</td>
              </tr>
            </tbody>
          </table>
          <p className="mt-2 italic"><b>Terbilang:</b> Satu miliar seratus enam puluh empat juta delapan ratus ribu rupiah.</p>

          <div className="mt-8 text-center">
            <p>Mengetahui/Setuju Bayar,</p>
            <p className="font-bold">Pejabat Pembuat Komitmen (PPK)</p>
            <p>Belanja Operasional Rutin, Remunerasi</p>
            <p className="mt-14 font-bold underline">Dr. Fajar Pranata, M.Si.</p>
            <p>NIP 197701012006041001</p>
            <p className="mt-1 text-[9px] text-gray-500">Pejabat penandatangan diatur oleh UPT Remunerasi.</p>
          </div>
          <p className="mt-6 border-t pt-2 text-[9px] text-gray-500">Amprah menjadi dasar pencairan. Sistem tidak mentransfer dana.</p>
        </div>
      </div>
    </>
  )
}
