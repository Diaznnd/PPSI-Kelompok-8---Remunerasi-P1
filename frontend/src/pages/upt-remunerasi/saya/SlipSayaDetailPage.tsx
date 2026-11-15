import { useState, type ReactNode } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, ChevronDown, ChevronUp, Download, MessageSquare, Printer } from "lucide-react"
import { toast } from "sonner"
import { Field, Panel } from "@/components/pegawai/shared"
import {
  PageHeader,
  Button,
  WarningBanner,
  PrintPreview,
  RupiahText,
} from "../components"
import {
  daftarSlipSaya,
  profilSaya,
  type KomponenPenguranganItem,
} from "@/data/dummy-upt-saya"
import { rupiah } from "@/data/dummy-upt"
import { SayaChip } from "./SayaChip"

function Seksi({ no, judul, desk, children }: { no: string; judul: string; desk: string; children: ReactNode }) {
  return (
    <Panel>
      <div className="flex items-center gap-3 border-b pb-4">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
          {no}
        </span>
        <div>
          <h2 className="font-semibold leading-tight text-foreground">{judul}</h2>
          <p className="text-xs text-muted-foreground">{desk}</p>
        </div>
      </div>
      <div className="pt-5">{children}</div>
    </Panel>
  )
}

function TabelKomponenPengurangan({
  judul,
  items,
  showAll,
}: {
  judul: string
  items: KomponenPenguranganItem[]
  showAll: boolean
}) {
  const rows = showAll ? items : items.filter((item) => item.hari > 0)
  if (!showAll && rows.length === 0) return null

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{judul}</h3>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/40 text-muted-foreground">
            <tr>
              <th className="p-3 font-medium">Komponen</th>
              <th className="p-3 text-right font-medium">Jumlah Hari</th>
              <th className="p-3 text-right font-medium">Tarif per Hari</th>
              <th className="p-3 text-right font-medium">Pengurangan (%)</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((row) => {
              const totalPersen = row.hari * row.tarifPersen
              return (
                <tr key={row.kode} className={row.hari === 0 ? "text-muted-foreground" : "bg-card"}>
                  <td className="p-3">
                    <span className="font-medium text-foreground">{row.nama}</span>
                    {row.keterangan && (
                      <span className="block text-[11px] text-muted-foreground">{row.keterangan}</span>
                    )}
                  </td>
                  <td className="p-3 text-right tabular-nums">{row.hari}</td>
                  <td className="p-3 text-right tabular-nums">{row.tarifPersen.toLocaleString("id-ID")}%</td>
                  <td className="p-3 text-right font-semibold tabular-nums">
                    {totalPersen.toLocaleString("id-ID")}%
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function SlipSayaDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const slip = daftarSlipSaya.find((s) => s.id === id)

  const [showAllKomponen, setShowAllKomponen] = useState(false)
  const [printOpen, setPrintOpen] = useState(false)

  if (!slip) {
    return (
      <Panel>
        <p className="text-sm text-foreground">Slip P1 tidak ditemukan.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/upt-remunerasi/slip-saya">Kembali</Link>
        </Button>
      </Panel>
    )
  }

  const adaPengurangan =
    slip.tl.some((x) => x.hari > 0) ||
    slip.psw.some((x) => x.hari > 0) ||
    slip.ketidakhadiran.some((x) => x.hari > 0)

  const isZeroCondition = Boolean(slip.ambangLebih50Persen || slip.hukumanDisiplin?.tingkat === "Berat")

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2 text-muted-foreground">
          <Link to="/upt-remunerasi/slip-saya">
            <ArrowLeft className="mr-1.5 size-4" />
            Kembali
          </Link>
        </Button>

        <PageHeader
          title="Detail Slip P1"
          subtitle={
            <div>
              <p>Rincian transparan perhitungan P1 periode {slip.periode}</p>
              <SayaChip />
            </div>
          }
          actions={
            <>
              <Button variant="outline" size="sm" onClick={() => toast.success("Slip berhasil diunduh")}>
                <Download className="mr-1.5 size-4" />
                Unduh PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPrintOpen(true)}>
                <Printer className="mr-1.5 size-4" />
                Cetak
              </Button>
              <Button
                size="sm"
                onClick={() =>
                  navigate("/upt-remunerasi/pengaduan-saya/baru", {
                    state: { periode: slip.periode, kategori: "Slip P1" },
                  })
                }
              >
                <MessageSquare className="mr-1.5 size-4" />
                Ajukan Pengaduan atas Slip Ini
              </Button>
            </>
          }
        />
      </div>

      {slip.ambangLebih50Persen && (
        <WarningBanner variant="error" title="P1 Ditetapkan Rp 0">
          P1 Rp 0 pada periode ini karena ketidakhadiran fisik melebihi 50% hari kerja.
        </WarningBanner>
      )}
      {slip.hukumanDisiplin?.tingkat === "Berat" && (
        <WarningBanner variant="error" title="P1 Ditetapkan Rp 0">
          P1 Rp 0 pada periode ini karena sedang menjalani hukuman disiplin berat.
        </WarningBanner>
      )}

      <Seksi no="01" judul="Identitas dan Periode" desk="Data kepegawaian dan referensi slip periode ini.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Nama" value={profilSaya.nama} />
          <Field label="NIP" value={<span className="font-mono">{profilSaya.nip}</span>} />
          <Field label="NPWP" value={<span className="font-mono">{profilSaya.npwpMasked}</span>} />
          <Field label="Pangkat/Golongan" value={profilSaya.pangkat} />
          <Field label="Nama Jabatan" value={profilSaya.jabatan} />
          <Field label="Unit Kerja" value={profilSaya.unit} />
          <Field label="Grade" value={`Grade ${profilSaya.grade}`} />
          <Field label="Status Kepegawaian" value={profilSaya.statusKepegawaian} />
          <Field label="Periode" value={slip.periode} />
          <Field label="Nomor Slip" value={<span className="font-mono">{slip.nomorSlip}</span>} />
        </div>
      </Seksi>

      <Seksi no="02" judul="Dasar Perhitungan" desk="Nilai jabatan, porsi P1 40%, dan pengali status kepegawaian.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Remunerasi per Grade Jabatan" value={rupiah(slip.remunerasiJabatan)} />
          <Field label="P1 (40%)" value={rupiah(slip.p140)} />
          <Field label="Pengali Status" value={`${slip.pengaliStatus}%`} />
          <Field label="Remunerasi P1" value={<RupiahText value={slip.remunerasiP1} className="text-emerald-700" />} />
        </div>
        <div className="mt-4 rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground leading-relaxed">
          Remunerasi P1 = Remunerasi per Grade Jabatan × 40% × Pengali Status. Jumlah Bruto = Remunerasi P1 − Pengurangan
          Kehadiran{slip.hukumanDisiplin ? " − Potongan Hukuman Disiplin" : ""}. Jumlah Netto = Jumlah Bruto − Pajak.
        </div>
      </Seksi>

      <Seksi no="03" judul="Rincian Pengurangan Kehadiran" desk="Rekap keterlambatan (TL), pulang sebelum waktunya (PSW), dan ketidakhadiran.">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              {showAllKomponen
                ? "Menampilkan seluruh komponen pengurangan (termasuk 0 hari)."
                : "Menampilkan komponen dengan jumlah hari > 0."}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAllKomponen((prev) => !prev)}
            >
              {showAllKomponen ? (
                <>
                  Sembunyikan komponen 0 hari <ChevronUp className="ml-1.5 size-3.5" />
                </>
              ) : (
                <>
                  Tampilkan semua komponen <ChevronDown className="ml-1.5 size-3.5" />
                </>
              )}
            </Button>
          </div>

          {!adaPengurangan && !showAllKomponen ? (
            <div className="rounded-xl border border-dashed p-5 text-center text-sm text-muted-foreground">
              Tidak ada pengurangan kehadiran pada periode ini.
            </div>
          ) : (
            <div className="space-y-4">
              <TabelKomponenPengurangan judul="Keterlambatan (TL)" items={slip.tl} showAll={showAllKomponen} />
              <TabelKomponenPengurangan judul="Pulang Sebelum Waktunya (PSW)" items={slip.psw} showAll={showAllKomponen} />
              <TabelKomponenPengurangan judul="Ketidakhadiran" items={slip.ketidakhadiran} showAll={showAllKomponen} />
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-muted/30 p-4 text-sm">
            <div>
              <span className="text-muted-foreground">Total Persentase Pengurangan: </span>
              <span className="font-semibold tabular-nums">
                {slip.totalPersenPengurangan.toLocaleString("id-ID")}%
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Pengurangan Kehadiran: </span>
              <span className="font-semibold tabular-nums text-rose-700">
                − {rupiah(slip.penguranganKehadiranRp)}
              </span>
            </div>
          </div>
        </div>
      </Seksi>

      {slip.hukumanDisiplin && (
        <Panel>
          <h2 className="font-semibold text-foreground">Potongan Hukuman Disiplin</h2>
          <div className="mt-4 grid gap-4 border-t pt-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Tingkat Hukuman" value={slip.hukumanDisiplin.tingkat} />
            <Field label="Persentase Potongan" value={`${slip.hukumanDisiplin.persen}%`} />
            <Field label="Masa Berlaku" value={slip.hukumanDisiplin.masaBerlaku} />
            <Field label="Nilai Potongan" value={rupiah(slip.hukumanDisiplin.nominalRp)} />
          </div>
        </Panel>
      )}

      <Panel>
        <h2 className="font-semibold text-foreground">Ringkasan Pembayaran</h2>
        <div className="mt-4 space-y-3 border-t pt-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Jumlah Bruto</span>
            <span className="font-semibold tabular-nums">{rupiah(slip.jumlahBruto)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Pajak</span>
            <span className="tabular-nums">{isZeroCondition ? "-" : rupiah(slip.pajak)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Pajak TER</span>
            <span className="tabular-nums">{isZeroCondition ? "-" : rupiah(slip.pajakTer)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Tab. Pajak</span>
            <span className="tabular-nums">{isZeroCondition ? "-" : rupiah(slip.tabPajak)}</span>
          </div>
          <div className="flex items-center justify-between border-t pt-3">
            <span className="font-bold text-foreground">JUMLAH NETTO YANG DITERIMA</span>
            <span className="text-xl font-bold tabular-nums text-emerald-700">
              {isZeroCondition ? rupiah(0) : rupiah(slip.jumlahNetto)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Rekening Tujuan</span>
            <span className="font-mono font-medium">{slip.rekeningMasked}</span>
          </div>
        </div>
      </Panel>

      <PrintPreview
        open={printOpen}
        onOpenChange={setPrintOpen}
        title={`Cetak Slip P1 — ${slip.periode}`}
      >
        <div className="space-y-4 text-sm">
          <div className="border-b pb-3 text-center">
            <p className="font-bold uppercase">Universitas Andalas — UPT Remunerasi</p>
            <p className="text-xs text-muted-foreground">SLIP PEMBAYARAN REMUNERASI P1</p>
            <p className="mt-1 font-mono text-xs">{slip.nomorSlip}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div><span className="text-muted-foreground">Nama:</span> <strong>{profilSaya.nama}</strong></div>
            <div><span className="text-muted-foreground">NIP:</span> <span className="font-mono">{profilSaya.nip}</span></div>
            <div><span className="text-muted-foreground">Unit Kerja:</span> {profilSaya.unit}</div>
            <div><span className="text-muted-foreground">Periode:</span> {slip.periode}</div>
          </div>
          <div className="space-y-1.5 border-t pt-3 text-xs">
            <div className="flex justify-between"><span>Remunerasi P1</span><span>{rupiah(slip.remunerasiP1)}</span></div>
            <div className="flex justify-between"><span>Pengurangan Kehadiran</span><span>− {rupiah(slip.penguranganKehadiranRp)}</span></div>
            <div className="flex justify-between font-semibold"><span>Jumlah Bruto</span><span>{rupiah(slip.jumlahBruto)}</span></div>
            <div className="flex justify-between"><span>Pajak</span><span>{isZeroCondition ? "-" : rupiah(slip.pajak)}</span></div>
            <div className="flex justify-between border-t pt-2 text-sm font-bold text-emerald-700">
              <span>JUMLAH NETTO YANG DITERIMA</span>
              <span>{isZeroCondition ? rupiah(0) : rupiah(slip.jumlahNetto)}</span>
            </div>
          </div>
        </div>
      </PrintPreview>
    </div>
  )
}
