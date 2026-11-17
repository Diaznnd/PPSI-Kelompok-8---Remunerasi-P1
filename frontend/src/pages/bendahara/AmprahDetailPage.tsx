import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { ArrowLeft, Download, Printer, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { PageHeading, Panel } from "@/components/pegawai/shared"
import { bendaharaService } from "@/services/bendaharaService"

export default function AmprahDetailPage() {
  const { akun } = useAuth()
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [amprah, setAmprah] = useState<any>(null)

  useEffect(() => {
    const fetchAmprahDetail = async () => {
      if (!id) return
      try {
        setLoading(true)
        const res = await bendaharaService.getAmprahDetail(id)
        setAmprah(res)
      } catch (error) {
        console.error("Error fetching amprah detail:", error)
        toast.error("Gagal memuat detail amprah")
      } finally {
        setLoading(false)
      }
    }
    fetchAmprahDetail()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-primary" />
        <span className="ml-3 text-sm text-muted-foreground">Memuat detail amprah...</span>
      </div>
    )
  }

  if (!amprah) {
    return (
      <Panel>
        <p className="text-sm">Amprah tidak ditemukan.</p>
        <Button asChild variant="outline" className="mt-4"><Link to="/bendahara/amprah">Kembali</Link></Button>
      </Panel>
    )
  }

  const unitNama = akun?.unit_nama || "Unit Kerja"
  const rows = amprah.data || []
  const ringkasan = amprah.ringkasan || {
    pegawai: 0,
    remP1: 0,
    pengurangan: 0,
    bruto: 0,
    pajak: 0,
    netto: 0,
  }
  const dummy = () => toast.info("Belum tersambung ke backend (dummy).")

  return (
    <>
      <Link to="/bendahara/amprah" className="mb-3 inline-flex items-center gap-1 text-xs text-primary hover:underline print:hidden"><ArrowLeft className="size-3" /> Kembali</Link>
      <PageHeading
        title="Detail Amprah"
        desc={`${amprah.nomor} • ${amprah.kelompok}`}
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
            <p className="text-[10px]">{unitNama}</p>
          </div>
          <dl className="mt-4 grid grid-cols-[7rem_1fr] gap-y-1">
            <dt>Satuan Kerja</dt><dd className="font-semibold">Universitas Andalas</dd>
            <dt>Unit/Fakultas</dt><dd className="font-semibold">{unitNama}</dd>
            <dt>Nomor / Tanggal</dt><dd className="font-semibold">{amprah.nomor} / {amprah.terbit}</dd>
            <dt>Judul</dt><dd className="font-semibold">Pembayaran Remunerasi (P1) Bagi {amprah.kelompok} Bulan {amprah.periode} {unitNama} Universitas Andalas</dd>
            <dt>Periode</dt><dd className="font-semibold">{amprah.periode} • Dibayarkan {amprah.bulan_bayar || "November 2026"}</dd>
          </dl>

          <p className="mb-1 mt-5 text-xs font-semibold">DETAIL PEMBAYARAN</p>
          <table className="w-full border border-black text-[10px]">
            <thead className="bg-gray-100">
              <tr>{["No", "Nama / NIP", "Golongan / NPWP", "Jabatan / Unit Kerja", "Grade Jab.", "Nilai Grade Jabatan (Rp)", "Remunerasi P1 (Rp)", "Pengurangan Kehadiran (Rp)", "Jumlah Bruto (Rp)", "Pajak (Rp)", "Jumlah Netto (Rp)"].map((h) => <th key={h} className="border border-black p-1.5 text-left">{h}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((item: any, i: number) => (
                <tr key={item.nip || i}>
                  <td className="border border-black p-1.5">{i + 1}</td>
                  <td className="border border-black p-1.5"><b>{item.nama}</b><br />{item.nip}</td>
                  <td className="border border-black p-1.5"><b>{item.pangkat}</b><br />{item.npwp}</td>
                  <td className="border border-black p-1.5"><b>{item.jabatan}</b><br />{unitNama}</td>
                  <td className="border border-black p-1.5">{item.grade}</td>
                  <td className="border border-black p-1.5 text-right">{(item.remGrade || 0).toLocaleString("id-ID")}</td>
                  <td className="border border-black p-1.5 text-right">{(item.remP1 || 0).toLocaleString("id-ID")}</td>
                  <td className="border border-black p-1.5 text-right">{(item.pengurangan || 0).toLocaleString("id-ID")}</td>
                  <td className="border border-black p-1.5 text-right">{(item.bruto || 0).toLocaleString("id-ID")}</td>
                  <td className="border border-black p-1.5 text-right">{(item.pajak || 0).toLocaleString("id-ID")}</td>
                  <td className="border border-black p-1.5 text-right font-bold">{(item.netto || 0).toLocaleString("id-ID")}</td>
                </tr>
              ))}
              <tr className="font-bold">
                <td className="border border-black p-1.5" colSpan={6}>TOTAL ({ringkasan.pegawai} pegawai, seluruh unit)</td>
                <td className="border border-black p-1.5 text-right">{ringkasan.remP1.toLocaleString("id-ID")}</td>
                <td className="border border-black p-1.5 text-right">{ringkasan.pengurangan.toLocaleString("id-ID")}</td>
                <td className="border border-black p-1.5 text-right">{ringkasan.bruto.toLocaleString("id-ID")}</td>
                <td className="border border-black p-1.5 text-right">{ringkasan.pajak.toLocaleString("id-ID")}</td>
                <td className="border border-black p-1.5 text-right">{ringkasan.netto.toLocaleString("id-ID")}</td>
              </tr>
            </tbody>
          </table>
          <p className="mt-2 italic"><b>Terbilang:</b> {amprah.terbilang || "Sesuai total di atas"}.</p>

          <div className="mt-8 text-center">
            <p>Mengetahui/Setuju Bayar,</p>
            <p className="font-bold">Pejabat Pembuat Komitmen (PPK)</p>
            <p>Belanja Operasional Rutin, Remunerasi</p>
            <p className="mt-14 font-bold underline">{amprah.ppk_nama || "Dr. Fajar Pranata, M.Si."}</p>
            <p>NIP {amprah.ppk_nip || "197701012006041001"}</p>
            <p className="mt-1 text-[9px] text-gray-500">Pejabat penandatangan diatur oleh UPT Remunerasi.</p>
          </div>
          <p className="mt-6 border-t pt-2 text-[9px] text-gray-500">Amprah menjadi dasar pencairan. Sistem tidak mentransfer dana.</p>
        </div>
      </div>
    </>
  )
}
