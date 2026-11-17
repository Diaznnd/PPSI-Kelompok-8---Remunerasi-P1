import { useState, useMemo, useEffect } from "react"
import { Bell, BellOff, Trash2, Check, CheckCheck, Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import {
  PageHeader,
  DataTable,
  Button,
  ConfirmDialog,
  type ColumnDef,
} from "./components"
import { Badge } from "@/components/ui/badge"
import { uptRemunerasiService } from "@/services/uptRemunerasiService"

type NotifikasiItem = {
  id: string
  judul: string
  isi: string
  kategori: string
  status: "belum_dibaca" | "sudah_dibaca"
  waktu: string
  link?: string
}

const KATEGORI_LIST = [
  "Semua",
  "Pengajuan Unit",
  "Penetapan Jabatan",
  "Slip P1",
  "Amprah",
  "Pengaduan",
  "Sistem",
  "Pemberitahuan",
]

export default function NotifikasiPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<NotifikasiItem[]>([])
  const [activeTab, setActiveTab] = useState<"belum_dibaca" | "sudah_dibaca" | "semua">("belum_dibaca")
  const [kategoriFilter, setKategoriFilter] = useState("Semua")
  
  const [deleteItem, setDeleteItem] = useState<NotifikasiItem | null>(null)
  const [isMarkAllOpen, setIsMarkAllOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadNotifikasi()
  }, [])

  const loadNotifikasi = async () => {
    try {
      setLoading(true)
      const res = await uptRemunerasiService.getNotifikasi()
      
      // Map API response
      const mapped: NotifikasiItem[] = (res.data || []).map((item: any) => ({
        id: item.id?.toString() || `notif-${Date.now()}`,
        judul: item.judul || item.title || "Notifikasi",
        isi: item.isi || item.content || item.message || "",
        kategori: item.kategori || item.category || "Sistem",
        status: item.status === "dibaca" || item.dibaca ? "sudah_dibaca" : "belum_dibaca",
        waktu: item.waktu || item.created_at || new Date().toISOString(),
        link: item.link || item.url || undefined,
      }))
      
      setData(mapped)
    } catch (error: any) {
      console.error("Error loading notifikasi:", error)
      toast.error("Gagal memuat notifikasi")
      setData([])
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (item: NotifikasiItem) => {
    try {
      await uptRemunerasiService.markNotifikasiAsRead(item.id)
      
      setData((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, status: "sudah_dibaca" } : n))
      )
      
      toast.success("Notifikasi ditandai sudah dibaca")
    } catch (error: any) {
      console.error("Error marking as read:", error)
      toast.error(error.response?.data?.message || "Gagal menandai notifikasi")
    }
  }

  const handleMarkAllAsRead = async () => {
    setSubmitting(true)
    try {
      await uptRemunerasiService.markAllNotifikasiAsRead()
      
      setData((prev) =>
        prev.map((n) => ({ ...n, status: "sudah_dibaca" }))
      )
      
      setIsMarkAllOpen(false)
      toast.success("Semua notifikasi ditandai sudah dibaca")
    } catch (error: any) {
      console.error("Error marking all as read:", error)
      toast.error(error.response?.data?.message || "Gagal menandai semua notifikasi")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteItem) return
    
    try {
      await uptRemunerasiService.deleteNotifikasi(deleteItem.id)
      
      setData((prev) => prev.filter((n) => n.id !== deleteItem.id))
      setDeleteItem(null)
      toast.success("Notifikasi berhasil dihapus")
    } catch (error: any) {
      console.error("Error deleting notifikasi:", error)
      toast.error(error.response?.data?.message || "Gagal menghapus notifikasi")
    }
  }

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchTab =
        activeTab === "semua" ||
        (activeTab === "belum_dibaca" && item.status === "belum_dibaca") ||
        (activeTab === "sudah_dibaca" && item.status === "sudah_dibaca")
      
      const matchKategori = kategoriFilter === "Semua" || item.kategori === kategoriFilter
      
      return matchTab && matchKategori
    })
  }, [data, activeTab, kategoriFilter])

  const belumDibacaCount = useMemo(
    () => data.filter((n) => n.status === "belum_dibaca").length,
    [data]
  )

  const columns: ColumnDef<NotifikasiItem>[] = [
    {
      header: "Notifikasi",
      cell: (item) => {
        const isBelumDibaca = item.status === "belum_dibaca"
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {isBelumDibaca && (
                <div className="size-2 rounded-full bg-primary shrink-0" />
              )}
              <p className={`text-sm ${isBelumDibaca ? "font-bold" : "font-semibold"}`}>
                {item.judul}
              </p>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {item.isi}
            </p>
          </div>
        )
      },
    },
    {
      header: "Kategori",
      cell: (item) => (
        <Badge variant="outline" className="text-[11px]">
          {item.kategori}
        </Badge>
      ),
      className: "w-32",
    },
    {
      header: "Waktu",
      cell: (item) => {
        const date = new Date(item.waktu)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMins / 60)
        const diffDays = Math.floor(diffHours / 24)

        let timeText = ""
        if (diffMins < 1) timeText = "Baru saja"
        else if (diffMins < 60) timeText = `${diffMins} menit lalu`
        else if (diffHours < 24) timeText = `${diffHours} jam lalu`
        else if (diffDays < 7) timeText = `${diffDays} hari lalu`
        else timeText = date.toLocaleDateString("id-ID")

        return <span className="text-xs text-muted-foreground whitespace-nowrap">{timeText}</span>
      },
      className: "w-36",
    },
    {
      header: "Status",
      cell: (item) => {
        const isBelumDibaca = item.status === "belum_dibaca"
        return (
          <Badge
            variant={isBelumDibaca ? "default" : "outline"}
            className={`text-[11px] ${
              isBelumDibaca
                ? "bg-primary/10 text-primary border-primary/20"
                : "text-muted-foreground"
            }`}
          >
            {isBelumDibaca ? "Belum Dibaca" : "Sudah Dibaca"}
          </Badge>
        )
      },
      className: "w-32",
    },
    {
      header: "Aksi",
      cell: (item) => {
        const isBelumDibaca = item.status === "belum_dibaca"
        return (
          <div className="flex items-center gap-1">
            {isBelumDibaca && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs text-primary"
                onClick={() => handleMarkAsRead(item)}
                title="Tandai Sudah Dibaca"
              >
                <Check className="size-3.5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs text-rose-600 hover:bg-rose-50"
              onClick={() => setDeleteItem(item)}
              title="Hapus Notifikasi"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        )
      },
      className: "w-24 text-right",
    },
  ]

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <span>Notifikasi Sistem</span>
            {belumDibacaCount > 0 && (
              <Badge className="bg-primary text-primary-foreground">
                {belumDibacaCount} Baru
              </Badge>
            )}
          </div>
        }
        subtitle="Pemberitahuan penting terkait pengajuan, penetapan, dan aktivitas sistem remunerasi P1."
        actions={
          belumDibacaCount > 0 ? (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setIsMarkAllOpen(true)}
            >
              <CheckCheck className="size-4" /> Tandai Semua Sudah Dibaca
            </Button>
          ) : undefined
        }
      />

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-center">
          <BellOff className="size-16 text-muted-foreground/40" />
          <div>
            <p className="font-semibold text-muted-foreground">Tidak Ada Notifikasi</p>
            <p className="text-xs text-muted-foreground">
              Anda akan menerima pemberitahuan untuk aktivitas penting di sini
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("belum_dibaca")}
              className={`flex items-center gap-2 border-b-2 px-5 py-2.5 text-sm font-semibold transition-colors ${
                activeTab === "belum_dibaca"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Bell className="size-4" />
              Belum Dibaca ({belumDibacaCount})
            </button>
            <button
              onClick={() => setActiveTab("sudah_dibaca")}
              className={`flex items-center gap-2 border-b-2 px-5 py-2.5 text-sm font-semibold transition-colors ${
                activeTab === "sudah_dibaca"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <CheckCheck className="size-4" />
              Sudah Dibaca ({data.length - belumDibacaCount})
            </button>
            <button
              onClick={() => setActiveTab("semua")}
              className={`border-b-2 px-5 py-2.5 text-sm font-semibold transition-colors ${
                activeTab === "semua"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Semua ({data.length})
            </button>
          </div>

          <div className="rounded-xl border bg-card p-4">
            <select
              value={kategoriFilter}
              onChange={(e) => setKategoriFilter(e.target.value)}
              className="h-9 w-48 rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-ring"
            >
              {KATEGORI_LIST.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          {filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] gap-3 text-center">
              <AlertCircle className="size-12 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                Tidak ada notifikasi {activeTab === "belum_dibaca" ? "yang belum dibaca" : activeTab === "sudah_dibaca" ? "yang sudah dibaca" : ""} untuk kategori ini
              </p>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredData}
              pageSize={10}
              emptyText="Tidak ada notifikasi"
            />
          )}
        </>
      )}

      <ConfirmDialog
        open={!!deleteItem}
        onOpenChange={(open) => !open && setDeleteItem(null)}
        title="Hapus Notifikasi"
        description="Notifikasi yang dihapus tidak dapat dikembalikan."
        summary={
          deleteItem && (
            <p className="text-xs font-medium">{deleteItem.judul}</p>
          )
        }
        danger
        confirmText="Hapus"
        onConfirm={handleDelete}
      />

      <ConfirmDialog
        open={isMarkAllOpen}
        onOpenChange={setIsMarkAllOpen}
        title="Tandai Semua Sudah Dibaca"
        description={`Akan menandai ${belumDibacaCount} notifikasi sebagai sudah dibaca.`}
        confirmText="Ya, Tandai Semua"
        onConfirm={handleMarkAllAsRead}
        disabled={submitting}
      />
    </div>
  )
}
