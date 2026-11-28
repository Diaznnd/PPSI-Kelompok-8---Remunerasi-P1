import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft, ArrowRightLeft, Info, Send, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AreaTeks, Bidang, Dropzone } from "@/components/kepegawaian/ui"
import { PageHeading, Panel } from "@/components/pegawai/shared"
import { GRADE_PARAM, PERSEN_P1 } from "@/types/bendahara"
import { JABATAN_MASTER, JENIS_USULAN } from "@/types/kepegawaian"
import { tambahUsulan, useKepeg } from "@/data/store-kepegawaian"
import { kepegawaianService } from "@/services/kepegawaianService"
import { rupiah } from "@/lib/format"

interface MasterJabatanItem {
  id: number
  nama_jabatan: string
  kode_grade: string
  grade: number | string
  nilai_grade: number
}

interface UnitItem {
  id: number
  kode?: string
  nama: string
}

const GRADE = GRADE_PARAM.map(([l, v]) => ({ grade: Number(l.replace("Grade ", "")), rem: v }))
const p1Dasar = (grade: number) => {
  const g = GRADE.find((x) => x.grade === grade)
  return g ? Math.round((g.rem * PERSEN_P1) / 100) : 0
}
const cekPdf = (f: File) =>
  f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")
    ? "Berkas harus berformat PDF."
    : f.size > 5 * 1024 * 1024
    ? "Ukuran berkas maksimal 5 MB."
    : null

export default function BuatUsulanPage() {
  const navigate = useNavigate()
  const { pegawai: defaultPegawai } = useKepeg()
  const [pegawai, setPegawai] = useState<any[]>(defaultPegawai)
  const [masterJabatan, setMasterJabatan] = useState<MasterJabatanItem[]>([])
  const [unitList, setUnitList] = useState<UnitItem[]>([])
  const [nip, setNip] = useState("")
  const [jenis, setJenis] = useState<string>(JENIS_USULAN[0])
  const [mulai, setMulai] = useState("")
  const [jabatanId, setJabatanId] = useState("")
  const [pindahUnit, setPindahUnit] = useState(false)
  const [unitBaruId, setUnitBaruId] = useState("")
  const [alasan, setAlasan] = useState("")
  const [sk, setSk] = useState<string | null>(null)
  const [spmt, setSpmt] = useState<string | null>(null)
  const [skFile, setSkFile] = useState<File | undefined>(undefined)
  const [spmtFile, setSpmtFile] = useState<File | undefined>(undefined)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    kepegawaianService
      .getPegawaiList()
      .then((res) => {
        if (res?.data) {
          setPegawai(
            res.data.map((p: any) => ({
              nip: p.NIP || p.nip,
              nama: p.nama,
              unit_id: p.unit_id,
              unit_nama: p.unit_nama || p.unitKerja?.nama || "",
              jabatan: p.jabatan?.nama || p.jabatan_nama || "",
              grade: p.jabatan?.grade_nama || p.grade || 0,
              aktif: p.aktif,
            }))
          )
        }
      })
      .catch(() => {})

    kepegawaianService
      .getJabatanList()
      .then((res) => {
        if (Array.isArray(res?.data) && res.data.length > 0) {
          setMasterJabatan(res.data)
        } else {
          setMasterJabatan(
            JABATAN_MASTER.map((nama, idx) => ({
              id: idx + 1,
              nama_jabatan: nama,
              kode_grade: "Grade 10",
              grade: 10,
              nilai_grade: 5232000,
            }))
          )
        }
        if (Array.isArray(res?.units)) {
          setUnitList(res.units)
        }
      })
      .catch(() => {})
  }, [])

  const p = pegawai.find((x) => x.nip === nip)
  const selectedJabatan = masterJabatan.find((j) => String(j.id) === jabatanId)
  const gradeNum = selectedJabatan ? Number(String(selectedJabatan.grade).replace(/\D/g, "")) || 0 : 0
  const p1Baru = selectedJabatan
    ? selectedJabatan.nilai_grade > 0
      ? Math.round((selectedJabatan.nilai_grade * PERSEN_P1) / 100)
      : p1Dasar(gradeNum)
    : 0

  const lamaTeks = p ? (p.jabatan ? `${p.jabatan} • Grade ${p.grade}` : "Belum ada jabatan/grade") : "-"

  // Evaluasi aturan pindah unit berdasarkan tanggal berlaku (minggu 1-2 vs minggu 3-4)
  const aturanMutasi = useMemo(() => {
    if (!pindahUnit || !unitBaruId || !mulai) return null
    const parts = mulai.split("-")
    const day = Number(parts[2] || 0)
    const unitBaruObj = unitList.find((u) => String(u.id) === unitBaruId)
    if (!day) return null
    if (day <= 14) {
      return {
        ikutUnitBaru: true,
        teks: `Tanggal berlaku tgl ${day} (2 minggu awal bulan): Pegawai akan mengikuti perhitungan P1 unit baru (${unitBaruObj?.nama || "Unit Baru"}) pada bulan ini.`,
      }
    }
    return {
      ikutUnitBaru: false,
      teks: `Tanggal berlaku tgl ${day} (2 minggu akhir bulan): Pegawai tetap mengikuti perhitungan P1 unit lama (${p?.unit_nama || "Unit Asal"}) pada bulan ini.`,
    }
  }, [pindahUnit, unitBaruId, mulai, unitList, p])

  const valid =
    !!p &&
    !!mulai &&
    !!selectedJabatan &&
    (!pindahUnit || !!unitBaruId) &&
    alasan.trim().length >= 10 &&
    !!sk &&
    !!spmt

  async function kirim() {
    if (!valid || !sk || !spmt || !selectedJabatan) return
    setSaving(true)
    try {
      const res = await kepegawaianService.createUsulan({
        NIP: nip,
        jabatan_id: selectedJabatan.id,
        jabatan_baru: selectedJabatan.nama_jabatan,
        unit_baru_id: pindahUnit && unitBaruId ? Number(unitBaruId) : undefined,
        jenis_perubahan: jenis,
        tanggal_berlaku: mulai,
        alasan: alasan.trim(),
        dokumen_sk: skFile,
        dokumen_spmt: spmtFile,
        sk,
        spmt,
      })
      tambahUsulan({
        nip,
        jenis,
        mulaiIso: mulai,
        jabatanBaru: selectedJabatan.nama_jabatan,
        gradeBaru: gradeNum,
        alasan: alasan.trim(),
        sk,
        spmt,
      })
      toast.success(res?.message || `Usulan ${res?.usulan?.kode_usulan || ""} diajukan ke Verifikator.`)
      navigate("/kepegawaian/usulan")
    } catch (err: any) {
      const msg = err?.response?.data?.message
      toast.error(msg || "Gagal mengajukan usulan jabatan ke server.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Link to="/kepegawaian/usulan" className="mb-3 inline-flex items-center gap-1 text-xs text-primary hover:underline">
        <ArrowLeft className="size-3" /> Kembali <span className="text-muted-foreground">Usulan Jabatan/Grade</span>
      </Link>
      <PageHeading
        title="Buat Usulan Jabatan/Grade"
        desc="Pilih jabatan dari master data UPT Remunerasi; grade dan aturan P1 pindah unit ditentukan otomatis oleh sistem."
      />

      <div className="grid items-start gap-6 pb-20 lg:grid-cols-[1fr_17rem]">
        <div className="space-y-5">
          <Panel className="space-y-4">
            <h2 className="text-sm font-semibold">1. Pegawai</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Bidang label="Pegawai">
                <Select
                  value={nip}
                  onValueChange={(v) => {
                    setNip(v)
                    setJabatanId("")
                    setUnitBaruId("")
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih pegawai aktif" />
                  </SelectTrigger>
                  <SelectContent>
                    {pegawai
                      .filter((x) => x.aktif)
                      .map((x) => (
                        <SelectItem key={x.nip} value={x.nip}>
                          {x.nama} ({x.nip})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </Bidang>
              <Bidang label="Jabatan/grade berlaku">
                <Input disabled value={lamaTeks} />
              </Bidang>
            </div>
          </Panel>

          <Panel className="space-y-4">
            <h2 className="text-sm font-semibold">2. Perubahan yang diusulkan</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Bidang label="Jenis perubahan">
                <Select value={jenis} onValueChange={setJenis}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {JENIS_USULAN.map((j) => (
                      <SelectItem key={j} value={j}>
                        {j}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Bidang>
              <Bidang label="Tanggal mulai berlaku" hint="Harus sesuai tanggal pada SPMT">
                <Input type="date" value={mulai} onChange={(e) => setMulai(e.target.value)} />
              </Bidang>
              <Bidang label="Jabatan baru (master UPT)">
                <Select value={jabatanId} onValueChange={setJabatanId} disabled={!p}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={p ? "Pilih jabatan baru" : "Pilih pegawai terlebih dahulu"} />
                  </SelectTrigger>
                  <SelectContent>
                    {masterJabatan.map((j) => (
                      <SelectItem key={j.id} value={String(j.id)}>
                        {j.nama_jabatan}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Bidang>
              <Bidang label="Grade baru (otomatis sistem)" hint="Ditetapkan otomatis dari master jabatan UPT">
                <div className="relative flex items-center">
                  <Input
                    disabled
                    value={selectedJabatan ? `${selectedJabatan.kode_grade}` : "Otomatis setelah pilih jabatan"}
                    className="pr-8 font-medium"
                  />
                  <ShieldCheck className="pointer-events-none absolute right-2.5 size-4 text-emerald-600" />
                </div>
              </Bidang>
            </div>

            {/* Opsi Pindah Unit */}
            <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ArrowRightLeft className="size-4 text-primary" />
                  <div>
                    <p className="text-xs font-semibold">Opsi Pindah Unit Kerja (Mutasi Unit)</p>
                    <p className="text-[11px] text-muted-foreground">
                      Aktifkan jika perubahan jabatan disertai perpindahan unit kerja pegawai.
                    </p>
                  </div>
                </div>
                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pindahUnit}
                    onChange={(e) => {
                      setPindahUnit(e.target.checked)
                      if (!e.target.checked) setUnitBaruId("")
                    }}
                    className="size-4 rounded border-border accent-primary"
                  />
                  Pindah Unit
                </label>
              </div>

              {pindahUnit && (
                <div className="space-y-2.5 pt-1">
                  <Bidang label="Unit Kerja Tujuan">
                    <Select value={unitBaruId} onValueChange={setUnitBaruId}>
                      <SelectTrigger className="w-full bg-background">
                        <SelectValue placeholder="Pilih unit kerja baru" />
                      </SelectTrigger>
                      <SelectContent>
                        {unitList
                          .filter((u) => !p?.unit_id || Number(u.id) !== Number(p.unit_id))
                          .map((u) => (
                            <SelectItem key={u.id} value={String(u.id)}>
                              {u.nama}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </Bidang>
                  {aturanMutasi && (
                    <div
                      className={`rounded-md border px-3 py-2 text-[11px] ${
                        aturanMutasi.ikutUnitBaru
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300"
                          : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300"
                      }`}
                    >
                      {aturanMutasi.teks}
                    </div>
                  )}
                </div>
              )}
            </div>

            <Bidang label="Alasan perubahan" hint={`${alasan.length} karakter (minimal 10)`}>
              <AreaTeks
                rows={3}
                value={alasan}
                onChange={(e) => setAlasan(e.target.value)}
                placeholder="Contoh: Kenaikan jabatan fungsional berdasarkan SK Rektor Nomor .../UN16.R/KP/2026"
              />
            </Bidang>
          </Panel>

          <Panel className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold">3. Dokumen pendukung</h2>
              <p className="text-[11px] text-muted-foreground">
                Wajib PDF, maksimal 5 MB per berkas. Berkas lain akan ditolak.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Bidang label="SK jabatan/grade">
                <Dropzone
                  nama={sk}
                  onFile={(f) => {
                    setSk(f.name)
                    setSkFile(f)
                  }}
                  onHapus={() => {
                    setSk(null)
                    setSkFile(undefined)
                  }}
                  accept=".pdf"
                  cek={cekPdf}
                  petunjuk="PDF • maks. 5 MB"
                  contoh={() => setSk("SK_contoh.pdf")}
                />
              </Bidang>
              <Bidang label="SPMT (Surat Pernyataan Melaksanakan Tugas)">
                <Dropzone
                  nama={spmt}
                  onFile={(f) => {
                    setSpmt(f.name)
                    setSpmtFile(f)
                  }}
                  onHapus={() => {
                    setSpmt(null)
                    setSpmtFile(undefined)
                  }}
                  accept=".pdf"
                  cek={cekPdf}
                  petunjuk="PDF • maks. 5 MB"
                  contoh={() => setSpmt("SPMT_contoh.pdf")}
                />
              </Bidang>
            </div>
          </Panel>
        </div>

        <Panel className="space-y-3 lg:sticky lg:top-24">
          <h2 className="text-sm font-semibold">Ringkasan usulan</h2>
          <div className="rounded-lg bg-muted/60 p-3 text-xs">
            <p className="text-[10px] text-muted-foreground">Saat ini</p>
            <p className="font-semibold">{p?.jabatan ? `${p.jabatan} • G${p.grade}` : "-"}</p>
            <p className="text-[10px] text-muted-foreground">P1 dasar {rupiah(p ? p1Dasar(p.grade) : 0)}</p>
          </div>
          <p className="text-center text-muted-foreground">↓</p>
          <div className="rounded-lg bg-primary/10 p-3 text-xs">
            <p className="text-[10px] text-muted-foreground">Diusulkan</p>
            <p className="font-semibold">
              {selectedJabatan ? `${selectedJabatan.nama_jabatan} • ${selectedJabatan.kode_grade}` : "-"}
            </p>
            <p className="text-[10px] text-muted-foreground">
              P1 dasar {selectedJabatan ? rupiah(p1Baru) : "-"}
            </p>
          </div>
          <p className="flex gap-1.5 text-[10px] text-muted-foreground">
            <Info className="mt-0.5 size-3 shrink-0" /> Penentuan grade dilakukan otomatis oleh sistem berdasarkan master
            jabatan UPT Remunerasi.
          </p>
        </Panel>
      </div>

      <div className="sticky bottom-0 -mx-4 flex justify-between border-t bg-card px-4 py-3 md:-mx-8 md:px-8">
        <Button asChild variant="outline">
          <Link to="/kepegawaian/usulan">Batal</Link>
        </Button>
        <Button onClick={kirim} disabled={!valid || saving}>
          <Send /> {saving ? "Mengajukan..." : "Ajukan ke Verifikator"}
        </Button>
      </div>
    </>
  )
}
