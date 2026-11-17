import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { ShieldAlert } from "lucide-react"

export default function UnauthorizedPage() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center space-y-4 max-w-md">
        <ShieldAlert className="w-20 h-20 mx-auto text-destructive" />
        <h1 className="text-3xl font-bold">Akses Ditolak</h1>
        <p className="text-muted-foreground">
          Anda tidak memiliki izin untuk mengakses halaman ini. Hubungi administrator jika Anda merasa ini adalah kesalahan.
        </p>
        <div className="flex gap-2 justify-center pt-4">
          <Button onClick={() => navigate(-1)} variant="outline">
            Kembali
          </Button>
          <Button onClick={() => navigate("/")}>
            Ke Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
