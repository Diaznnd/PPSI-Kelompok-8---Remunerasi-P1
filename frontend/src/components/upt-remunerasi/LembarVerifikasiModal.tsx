import { useRef } from "react"
import { Printer } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export interface LembarVerifikasiData {
  kop?: {
    kementerian?: string
    universitas?: string
    upt?: string
    alamat?: string
    kontak?: string
    web_email?: string
  }
  pejabat?: {
    nama?: string
    nip?: string
    jabatan?: string
  }
  pengajuan: {
    nomor_pengajuan?: string
    unit: string
    periode: string
    jumlah_penerima: number
    jumlah_kotor: number
    kelompok?: string
  }
  titimangsa?: {
    tempat?: string
    tanggal?: string
  }
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: LembarVerifikasiData
}

export function LembarVerifikasiModal({ open, onOpenChange, data }: Props) {
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    window.print()
  }

  const rupiah = (val: number) =>
    new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val)

  const namaPejabat = data.pejabat?.nama || "Drs. Imrizal, MM"
  const nipPejabat = data.pejabat?.nip || "196303071985031009"
  const jabatanPejabat = data.pejabat?.jabatan || "Ketua UPT Remunerasi"
  const kelompok = data.pengajuan.kelompok || "Tenaga Kependidikan"
  const tempat = data.titimangsa?.tempat || "Padang"
  const tanggal = data.titimangsa?.tanggal || new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl overflow-y-auto max-h-[90vh] p-0 print:p-0">
        <DialogHeader className="p-4 border-b flex flex-row items-center justify-between print:hidden">
          <DialogTitle className="text-base font-semibold">Lembar Verifikasi Resmi UPT</DialogTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 text-xs">
              <Printer className="size-3.5" /> Cetak / PDF
            </Button>
          </div>
        </DialogHeader>

        {/* Area Dokumen Resmi (Format Sesuai SK / Lembar Verifikasi UNAND) */}
        <div ref={printRef} className="p-8 sm:p-12 bg-white text-black font-serif print:p-0 leading-relaxed">
          {/* KOP SURAT */}
          <div className="flex items-start gap-4 border-b-2 border-black pb-3">
            <img
              src="/LOGO UNAND.svg"
              alt="Logo Universitas Andalas"
              className="w-20 h-20 object-contain shrink-0"
            />
            <div className="text-center flex-1">
              <h2 className="text-xs sm:text-sm font-bold tracking-wide uppercase">
                {data.kop?.kementerian || "KEMENTERIAN PENDIDIKAN TINGGI, SAINS DAN TEKNOLOGI"}
              </h2>
              <h1 className="text-sm sm:text-base font-extrabold tracking-wide uppercase">
                {data.kop?.universitas || "UNIVERSITAS ANDALAS"}
              </h1>
              <h3 className="text-sm sm:text-base font-bold tracking-wide uppercase">
                {data.kop?.upt || "UPT REMUNERASI"}
              </h3>
              <p className="text-[10px] sm:text-[11px] font-sans mt-0.5">
                Alamat : Gedung Rektorat, Limau Manis Padang Kode Pos 25163
              </p>
              <p className="text-[10px] sm:text-[11px] font-sans">
                Telepon : 0751-71181,71175,71086,71087,71699 Faksimile : 0751-71085
              </p>
              <p className="text-[10px] sm:text-[11px] font-sans">
                Website: www.unand.ac.id &nbsp; e-mail : sekretariatrektor@unand.ac.id
              </p>
            </div>
          </div>
          <div className="h-0.5 bg-black mt-0.5 mb-6" />

          {/* JUDUL SURAT */}
          <div className="text-center mb-6">
            <h2 className="text-base sm:text-lg font-bold tracking-wider uppercase underline underline-offset-4">
              LEMBAR VERIFIKASI
            </h2>
            {data.pengajuan.nomor_pengajuan && (
              <p className="text-xs font-sans text-gray-600 mt-1">
                Nomor: {data.pengajuan.nomor_pengajuan}
              </p>
            )}
          </div>

          {/* IDENTITAS PEMVERIFIKASI */}
          <div className="mb-6 space-y-1 text-xs sm:text-sm">
            <div className="grid grid-cols-[100px_16px_1fr]">
              <span>Nama</span>
              <span>:</span>
              <span className="font-semibold">{namaPejabat}</span>
            </div>
            <div className="grid grid-cols-[100px_16px_1fr]">
              <span>NIP</span>
              <span>:</span>
              <span>{nipPejabat}</span>
            </div>
            <div className="grid grid-cols-[100px_16px_1fr]">
              <span>Jabatan</span>
              <span>:</span>
              <span>{jabatanPejabat} Universitas Andalas</span>
            </div>
          </div>

          {/* ISI PERNYATAAN VERIFIKASI */}
          <p className="text-xs sm:text-sm text-justify mb-4">
            Telah memverifikasi kebenaran Amprah P1 Remunerasi {kelompok} Periode {data.pengajuan.periode}, Unit Kerja{" "}
            <span className="font-bold">{data.pengajuan.unit}</span> Universitas Andalas, dengan rincian sebagai berikut:
          </p>

          <div className="my-4 ml-6 space-y-2 text-xs sm:text-sm">
            <div className="grid grid-cols-[160px_16px_1fr]">
              <span className="font-medium">1. Jumlah Penerima</span>
              <span>:</span>
              <span className="font-bold">{data.pengajuan.jumlah_penerima} &nbsp;orang</span>
            </div>
            <div className="grid grid-cols-[160px_16px_1fr]">
              <span className="font-medium">2. Jumlah Kotor (Bruto)</span>
              <span>:</span>
              <span className="font-bold">Rp. &nbsp;{rupiah(data.pengajuan.jumlah_kotor)}</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-justify mt-6 mb-12">
            Demikian verifikasi ini dilakukan, untuk dapat dipergunakan sebagaimana mestinya.
          </p>

          {/* TANDA TANGAN */}
          <div className="flex justify-end text-xs sm:text-sm">
            <div className="w-64 text-left">
              <p>{tempat}, {tanggal}</p>
              <p className="font-bold mt-1">{jabatanPejabat},</p>
              <div className="h-20 flex items-center justify-center text-gray-300 italic text-[11px]">
                [Tanda Tangan & Cap Digital]
              </div>
              <p className="font-bold underline">{namaPejabat}</p>
              <p className="font-sans text-[11px]">Nip {nipPejabat}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
