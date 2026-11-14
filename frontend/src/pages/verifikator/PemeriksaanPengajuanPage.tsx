import { useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { AlertTriangle, ArrowLeft, CheckCircle2, GitCompareArrows, RotateCcw, SearchX, ShieldAlert, XCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Field, PageHeading, Panel } from "@/components/pegawai/shared"
import { BilahAksi, StatusVerifBadge, Tag, TextArea } from "@/components/verifikator/shared"
import { KembalikanDialog, SetujuiDialog } from "@/components/verifikator/KeputusanDialog"
import { DAFTAR_PERIKSA, PEGAWAI_FTI, RINGKASAN_VALIDASI, type KategoriValidasi, type PegawaiPengajuan } from "@/data/dummy-verifikator"
import { putuskan, usePengajuan } from "@/data/store-verifikator"
import { rupiah } from "@/lib/format"
import { cn } from "@/lib/utils"

const IKON_VALIDASI: Record<KategoriValidasi, typeof AlertTriangle> = {
  kehadiran: AlertTriangle, hukdis: ShieldAlert, jabatan: GitCompareArrows, syarat: XCircle, tidakWajar: SearchX,
}

export default function PemeriksaanPengajuanPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const p = usePengajuan().find((x) => x.id === id)

  const [filter, setFilter] = useState<KategoriValidasi | null>(null)
  const [rincian, setRincian] = useState<PegawaiPengajuan | null>(null)
  const [catatan, setCatatan] = useState<Record<string, string>>({})
  const [draft, setDraft] = useState("")
  const [periksa, setPeriksa] = useState<Record<string, boolean>>(() => Object.fromEntries(DAFTAR_PERIKSA.map((d) => [d.id, d.awal])))
  const [dlgSetuju, setDlgSetuju] = useState(false)
  const [dlgKembali, setDlgKembali] = useState(false)

  const rows = useMemo(() => (filter ? PEGAWAI_FTI.filter((x) => x.kategori.includes(filter)) : PEGAWAI_FTI), [filter])

  if (!p) return <Panel>Pengajuan tidak ditemukan. <Link to="/verifikator/pengajuan" className="text-primary hover:underline">Kembali ke daftar</Link></Panel>

  const bisaMemutuskan = p.status === "Diajukan"
  const bukaRincian = (x: PegawaiPengajuan) => { setRincian(x); setDraft(catatan[x.nip] ?? "") }
  const totalPotRincian = rincian ? rincian.potongan.reduce((s, x) => s + x.nominal, 0) : 0

  return (
    <>
      <Link to="/verifikator/pengajuan" className="mb-3 inline-flex items-center gap-1 text-xs text-primary hover:underline"><ArrowLeft className="size-3" /> Kembali Pemeriksaan Pengajuan P1</Link>
      <PageHeading title="Pemeriksaan Pengajuan P1" desc={`${p.id} • ${p.unit}`} action={<StatusVerifBadge status={p.status} />} />

      <div className="space-y-6">
        <Panel className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Unit" value={p.unit} />
          <Field label="Periode" value={p.periode} />
          <Field label="Bendahara pengaju" value={p.bendahara} />
          <Field label="Tanggal diajukan" value={p.waktuDiajukan} />
          <Field label="Jumlah pegawai" value={`${p.jumlahPegawai} pegawai`} />
          <Field label="Total P1 Gross" value={rupiah(p.totalGross)} />
          <Field label="Total potongan" value={rupiah(p.totalPotongan)} />
          <Field label="Total P1 Setelah Potongan" value={rupiah(p.totalSetelah)} />
        </Panel>

        <section>
          <h2 className="font-semibold">Ringkasan Validasi Otomatis</h2>
          <p className="mb-3 text-xs text-muted-foreground">Klik kartu untuk menyaring rincian pegawai.</p>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {RINGKASAN_VALIDASI.map(({ key, label, jumlah }) => {
              const Icon = IKON_VALIDASI[key]
              const aktif = filter === key
              return (
                <button
                  key={key}
                  onClick={() => setFilter(aktif ? null : key)}
                  aria-pressed={aktif}
                  className={cn("flex items-center gap-3 rounded-xl border bg-card p-4 text-left transition-colors hover:bg-primary/5", aktif && "border-primary bg-primary/5 ring-1 ring-primary")}
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="size-4" /></span>
                  <span>
                    <span className="block text-lg font-bold leading-tight">{jumlah}</span>
                    <span className="block text-[10px] text-muted-foreground">{label}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        <Panel className="p-0">
          <div className="border-b p-5">
            <h2 className="font-semibold">Rincian Per Pegawai</h2>
            <p className="text-xs text-muted-foreground">{rows.length} dari {p.jumlahPegawai} pegawai ditampilkan.{filter && <button onClick={() => setFilter(null)} className="ml-2 font-semibold text-primary hover:underline">Hapus filter</button>}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[64rem] text-xs">
              <thead className="bg-muted/50 text-left text-[11px] text-muted-foreground">
                <tr>{["NIP / Nama", "Jabatan / Grade", "Status", "Hari Kerja", "Tidak Hadir", "Pot. Kehadiran", "Pot. Hukdis", "P1 Gross", "Setelah Potongan", "Penanda", "Aksi"].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
              </thead>
              <tbody>
                {rows.length === 0 && <tr><td colSpan={11} className="py-10 text-center text-muted-foreground">Tidak ada pegawai pada kategori ini.</td></tr>}
                {rows.map((x) => (
                  <tr key={x.nip} className="border-t odd:bg-muted/20">
                    <td className="px-4 py-4"><p className="font-bold">{x.nama}</p><p className="text-[10px] text-muted-foreground">{x.nip}</p></td>
                    <td className="px-4 py-4"><p className="font-bold">{x.jabatan}</p><p className="text-[10px] text-muted-foreground">Grade {x.grade}</p></td>
                    <td className="px-4 py-4">{x.status}</td>
                    <td className="px-4 py-4">{x.hariKerja}</td>
                    <td className="px-4 py-4">{x.tidakHadir}</td>
                    <td className="px-4 py-4">{x.potKehadiran}</td>
                    <td className="px-4 py-4">{x.potHukdis}</td>
                    <td className="px-4 py-4">{rupiah(x.gross)}</td>
                    <td className="px-4 py-4 font-bold">{rupiah(x.setelahPotongan)}</td>
                    <td className="px-4 py-4">{x.penanda && <Tag>{x.penanda}</Tag>}</td>
                    <td className="px-4 py-4"><button onClick={() => bukaRincian(x)} className="font-semibold text-primary hover:underline">Rincian</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel className="flex flex-wrap items-start gap-x-8 gap-y-3 p-5">
          <div className="max-w-52">
            <h2 className="font-semibold">Daftar Periksa Pendamping</h2>
            <p className="text-[11px] text-muted-foreground">Pastikan seluruh pemeriksaan telah dilakukan sebelum mengambil keputusan.</p>
          </div>
          {DAFTAR_PERIKSA.map((d) => (
            <label key={d.id} className="flex max-w-40 cursor-pointer items-start gap-2 text-xs">
              <input type="checkbox" className="mt-0.5 size-4 accent-primary" checked={periksa[d.id]} onChange={(e) => setPeriksa((s) => ({ ...s, [d.id]: e.target.checked }))} disabled={!bisaMemutuskan} />
              {d.label}
            </label>
          ))}
        </Panel>
      </div>

      <BilahAksi>
        <Button variant="ghost" onClick={() => navigate("/verifikator/pengajuan")}><ArrowLeft /> Kembali ke Daftar</Button>
        {bisaMemutuskan ? (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10" onClick={() => setDlgKembali(true)}><RotateCcw /> Kembalikan untuk Perbaikan</Button>
            <Button onClick={() => setDlgSetuju(true)}><CheckCircle2 /> Setujui dan Teruskan ke UPT Remunerasi</Button>
          </div>
        ) : (
          <p className="flex items-center gap-2 text-xs text-muted-foreground"><CheckCircle2 className="size-4 text-primary" /> Keputusan sudah tercatat ({p.status}) dan tidak dapat diubah.</p>
        )}
      </BilahAksi>

      <SetujuiDialog
        open={dlgSetuju}
        onOpenChange={setDlgSetuju}
        deskripsi={`Pengajuan P1 untuk ${p.jumlahPegawai} pegawai senilai ${rupiah(p.totalSetelah)} akan diteruskan ke UPT Remunerasi.`}
        onKonfirmasi={() => { putuskan({ jenis: "pengajuan", id: p.id, status: "Diverifikasi" }); toast.success("Pengajuan disetujui dan diteruskan ke UPT Remunerasi.") }}
      />
      <KembalikanDialog
        open={dlgKembali}
        onOpenChange={setDlgKembali}
        onKembalikan={(alasan) => { putuskan({ jenis: "pengajuan", id: p.id, status: "Dikembalikan", alasan }); toast.success("Pengajuan berhasil dikembalikan kepada Bendahara.") }}
      />

      <Sheet open={!!rincian} onOpenChange={(o) => !o && setRincian(null)}>
        <SheetContent className="overflow-y-auto sm:max-w-lg!">
          {rincian && (
            <>
              <SheetHeader className="border-b">
                <p className="text-[10px] font-semibold tracking-wide text-primary">RINCIAN PEGAWAI</p>
                <SheetTitle className="text-lg">{rincian.nama}</SheetTitle>
                <SheetDescription>{rincian.nip}</SheetDescription>
              </SheetHeader>
              <div className="space-y-5 px-4 text-xs">
                <section>
                  <h3 className="mb-2 font-semibold">Langkah Perhitungan</h3>
                  <dl className="divide-y rounded-lg border">
                    {[
                      ["Nilai Jabatan", rincian.nilaiJabatan.toLocaleString("id-ID")],
                      ["PIR", rupiah(rincian.pir)],
                      ["Porsi P1", `${rincian.porsi}%`],
                      [`Pengali status ${rincian.status}`, `${rincian.pengali}%`],
                      ["P1 Gross", rupiah(rincian.gross)],
                      ...rincian.potongan.map((x) => [x.label, rupiah(x.nominal)]),
                      ["Total Potongan", rupiah(totalPotRincian)],
                    ].map(([l, v]) => (
                      <div key={l} className="flex justify-between gap-3 px-3 py-2"><dt className="text-muted-foreground">{l}</dt><dd className="font-semibold">{v}</dd></div>
                    ))}
                    <div className="flex justify-between gap-3 bg-primary/10 px-3 py-2 font-bold"><dt>P1 Setelah Potongan</dt><dd>{rupiah(rincian.setelahPotongan)}</dd></div>
                  </dl>
                </section>
                {rincian.riwayatJabatan && (
                  <section>
                    <h3 className="mb-2 font-semibold">Riwayat Jabatan Periode Ini</h3>
                    <div className="rounded-lg bg-primary/5 p-3"><p className="font-semibold">{rincian.riwayatJabatan.judul}</p><p className="text-[11px] text-muted-foreground">{rincian.riwayatJabatan.ket}</p></div>
                  </section>
                )}
                {rincian.catatanBendahara && (
                  <section>
                    <h3 className="mb-2 font-semibold">Catatan Koreksi Bendahara</h3>
                    <p className="rounded-lg border-l-4 border-primary bg-primary/5 p-3">{rincian.catatanBendahara}</p>
                  </section>
                )}
                <section>
                  <h3 className="mb-2 font-semibold">Catatan Verifikator untuk Pegawai Ini <span className="font-normal text-muted-foreground">(opsional)</span></h3>
                  <TextArea placeholder="Tambahkan catatan pemeriksaan..." value={draft} onChange={(e) => setDraft(e.target.value)} />
                </section>
              </div>
              <SheetFooter className="flex-row justify-end border-t">
                <Button variant="outline" className="border-primary text-primary" onClick={() => setRincian(null)}>Tutup</Button>
                <Button onClick={() => { setCatatan((c) => ({ ...c, [rincian.nip]: draft })); setRincian(null); toast.success("Catatan pemeriksaan disimpan.") }}>Simpan Catatan</Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
