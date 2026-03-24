import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { SearchIcon, PrinterIcon, QrCodeIcon, Loader2 } from "lucide-react"
import { useChildrenQuery } from "@/logic/application/queries/useChildrenQuery"

// Genera la URL del QR a través de la API pública (no requiere librerías)
function getQrUrl(value: string, size = 180) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&format=svg`
}

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING:           { label: "Pendiente",    className: "text-amber-500 border-amber-500/20 bg-amber-500/5" },
  ON_BOARD:          { label: "A bordo",      className: "text-emerald-500 border-emerald-500/20 bg-emerald-500/5" },
  COMPLETED:         { label: "Entregado",    className: "text-blue-500 border-blue-500/20 bg-blue-500/5" },
  ABSENCE_CONFIRMED: { label: "Ausente",      className: "text-red-500 border-red-500/20 bg-red-500/5" },
  MISSING_ALERT:     { label: "⚠ Alerta",     className: "text-rose-600 border-rose-600/20 bg-rose-600/5" },
}

function ChildQrCard({ child }: { child: any }) {
  const status = statusConfig[child.props.status] ?? { label: child.props.status, className: "" }
  const qrUrl = getQrUrl(child.props.qrIdentifier)

  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=420,height=560")
    if (!printWindow) return
    printWindow.document.write(`
      <html>
        <head>
          <title>Gafete QR - ${child.props.firstName} ${child.props.lastName}</title>
          <style>
            body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; padding: 32px; background: white; }
            h2 { margin: 16px 0 4px; font-size: 22px; font-weight: bold; }
            p  { margin: 2px 0; color: #666; font-size: 12px; }
            img { border: 2px solid #eee; border-radius: 12px; margin-top: 12px; }
          </style>
        </head>
        <body>
          <img src="${getQrUrl(child.props.qrIdentifier, 260)}" width="260" height="260" />
          <h2>${child.props.firstName} ${child.props.lastName}</h2>
          <p>ID: ${child.props.qrIdentifier}</p>
          <script>window.onload = () => { window.print(); }<\/script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
      {/* Iniciales */}
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg">
        {child.props.firstName?.charAt(0)}{child.props.lastName?.charAt(0)}
      </div>

      <div className="text-center">
        <p className="font-semibold">{child.props.firstName} {child.props.lastName}</p>
        <p className="text-xs text-muted-foreground truncate max-w-[180px]">
          Dirección: {child.props.homeAddress ?? "—"}
        </p>
      </div>

      <Badge variant="outline" className={status.className}>{status.label}</Badge>

      {/* QR como imagen */}
      <div className="rounded-lg border bg-white p-2">
        <img
          src={qrUrl}
          alt={`QR de ${child.props.firstName}`}
          width={180}
          height={180}
          className="block"
          loading="lazy"
        />
      </div>

      <p className="text-[10px] font-mono text-muted-foreground text-center break-all px-1">
        {child.props.qrIdentifier}
      </p>

      <Button
        size="sm"
        variant="outline"
        className="w-full gap-2 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400"
        onClick={handlePrint}
      >
        <PrinterIcon className="h-4 w-4" />
        Imprimir Gafete
      </Button>
    </div>
  )
}

export default function QrGeneratorPage() {
  const { data: children, isLoading } = useChildrenQuery()
  const [search, setSearch] = React.useState("")

  const filtered = (children ?? []).filter((c: any) => {
    const fullName = `${c.props.firstName} ${c.props.lastName}`.toLowerCase()
    return fullName.includes(search.toLowerCase())
  })

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Generación de Gafetes QR</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <QrCodeIcon className="h-6 w-6" />
                Generador de Gafetes QR
              </h2>
              <p className="text-muted-foreground text-sm">
                Genera e imprime el gafete QR único de cada estudiante.
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar estudiante..."
                className="pl-9 bg-background"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex h-60 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex h-60 items-center justify-center text-muted-foreground">
              No se encontraron estudiantes.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((child: any) => (
                <ChildQrCard key={child.props.id} child={child} />
              ))}
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
