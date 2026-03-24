import * as React from "react"
import { Html5Qrcode } from "html5-qrcode"
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
import { Badge } from "@/components/ui/badge"
import {
  ScanIcon,
  XCircleIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  CameraIcon,
  UserRoundIcon,
} from "lucide-react"
import { useChildrenQuery } from "@/logic/application/queries/useChildrenQuery"

// Estado de escaneo
type ScanState = "idle" | "scanning" | "found" | "not_found"

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING:           { label: "Pendiente",    className: "text-amber-500 border-amber-500/20 bg-amber-500/5" },
  ON_BOARD:          { label: "A bordo",      className: "text-emerald-500 border-emerald-500/20 bg-emerald-500/5" },
  COMPLETED:         { label: "Entregado",    className: "text-blue-500 border-blue-500/20 bg-blue-500/5" },
  ABSENCE_CONFIRMED: { label: "Ausente",      className: "text-red-500 border-red-500/20 bg-red-500/5" },
  MISSING_ALERT:     { label: "⚠ Alerta",     className: "text-rose-600 border-rose-600/20 bg-rose-600/5" },
}

const READER_ID = "html5-qr-reader"

export default function QrScannerPage() {
  const { data: children } = useChildrenQuery()

  const [scanState, setScanState] = React.useState<ScanState>("idle")
  const [scannedChild, setScannedChild] = React.useState<any>(null)
  const [lastScanned, setLastScanned] = React.useState<string>("")
  const [scannerActive, setScannerActive] = React.useState(false)
  const scannerRef = React.useRef<Html5Qrcode | null>(null)
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const stopScanner = React.useCallback(async () => {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop()
    }
    setScannerActive(false)
  }, [])

  const startScanner = React.useCallback(async () => {
    setScanState("scanning")
    setScannedChild(null)
    setLastScanned("")

    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode(READER_ID)
    }

    try {
      await scannerRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 260, height: 260 } },
        (decodedText) => {
          // Debounce: evitar múltiples disparos del mismo QR
          if (debounceRef.current) return
          debounceRef.current = setTimeout(() => {
            debounceRef.current = null
          }, 2000)

          setLastScanned(decodedText)
          stopScanner()

          // Buscar al niño por qrIdentifier
          const found = (children ?? []).find(
            (c: any) => c.props.qrIdentifier === decodedText
          )

          if (found) {
            setScannedChild(found)
            setScanState("found")
          } else {
            setScanState("not_found")
          }
        },
        undefined
      )
      setScannerActive(true)
    } catch (err) {
      console.error("Error al iniciar cámara:", err)
      setScanState("idle")
    }
  }, [children, stopScanner])

  // Limpiar al desmontar
  React.useEffect(() => {
    return () => {
      stopScanner()
    }
  }, [stopScanner])

  const handleReset = async () => {
    await stopScanner()
    setScanState("idle")
    setScannedChild(null)
    setLastScanned("")
  }

  const child = scannedChild
  const status = child ? (statusConfig[child.props.status] ?? { label: child.props.status, className: "" }) : null

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
                <BreadcrumbPage>Escáner QR</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col items-center gap-6 p-6">
          {/* Título */}
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight flex items-center justify-center gap-2">
              <ScanIcon className="h-6 w-6" />
              Escáner QR de Gafetes
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Apunta la cámara al gafete del estudiante para identificarlo.
            </p>
          </div>

          {/* Área del scanner */}
          <div className="w-full max-w-md">
            {/* Visor de cámara */}
            <div
              className={`relative rounded-2xl overflow-hidden border-2 transition-colors ${
                scanState === "scanning"
                  ? "border-blue-400 shadow-lg shadow-blue-400/20"
                  : scanState === "found"
                  ? "border-emerald-400 shadow-lg shadow-emerald-400/20"
                  : scanState === "not_found"
                  ? "border-red-400 shadow-lg shadow-red-400/20"
                  : "border-muted"
              }`}
            >
              {/* Contenedor del html5-qrcode — siempre en el DOM */}
              <div
                id={READER_ID}
                className={scannerActive ? "block" : "hidden"}
                style={{ width: "100%" }}
              />

              {/* Placeholder cuando no está activo */}
              {!scannerActive && (
                <div className="flex h-64 w-full flex-col items-center justify-center bg-muted/30 gap-3">
                  {scanState === "idle" && (
                    <>
                      <CameraIcon className="h-16 w-16 text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground">Cámara inactiva</p>
                    </>
                  )}
                  {scanState === "found" && (
                    <CheckCircle2Icon className="h-20 w-20 text-emerald-500 animate-in zoom-in" />
                  )}
                  {scanState === "not_found" && (
                    <AlertCircleIcon className="h-20 w-20 text-red-500 animate-in zoom-in" />
                  )}
                </div>
              )}

              {/* Badge de estado superpuesto */}
              {scanState === "scanning" && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2">
                  <span className="flex items-center gap-1.5 rounded-full bg-blue-500/90 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                    <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                    Escaneando…
                  </span>
                </div>
              )}
            </div>

            {/* Resultado: niño encontrado */}
            {scanState === "found" && child && (
              <div className="mt-4 rounded-xl border bg-card p-5 shadow-sm animate-in slide-in-from-bottom-2">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-xl">
                    {child.props.firstName?.charAt(0)}{child.props.lastName?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-lg">
                      {child.props.firstName} {child.props.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      Dirección: {child.props.homeAddress}
                    </p>
                    <div className="mt-1">
                      {status && (
                        <Badge variant="outline" className={status.className}>
                          {status.label}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CheckCircle2Icon className="h-8 w-8 text-emerald-500 shrink-0" />
                </div>
                <div className="mt-4 rounded-md bg-muted/40 px-3 py-2">
                  <p className="text-[10px] text-muted-foreground font-mono break-all">{lastScanned}</p>
                </div>
              </div>
            )}

            {/* Resultado: no encontrado */}
            {scanState === "not_found" && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-500/10 dark:border-red-500/20 p-5 animate-in slide-in-from-bottom-2">
                <div className="flex items-center gap-3">
                  <XCircleIcon className="h-8 w-8 text-red-500 shrink-0" />
                  <div>
                    <p className="font-semibold text-red-700 dark:text-red-400">Estudiante no encontrado</p>
                    <p className="text-xs text-red-600/70 dark:text-red-400/70 mt-1">
                      El QR escaneado no está registrado en el sistema.
                    </p>
                  </div>
                </div>
                <div className="mt-3 rounded-md bg-red-100 dark:bg-red-500/20 px-3 py-2">
                  <p className="text-[10px] text-red-700 dark:text-red-400 font-mono break-all">{lastScanned}</p>
                </div>
              </div>
            )}

            {/* Controles */}
            <div className="mt-5 flex gap-3">
              {(scanState === "idle" || scanState === "found" || scanState === "not_found") && (
                <Button
                  className="flex-1 gap-2"
                  onClick={async () => { await handleReset(); await startScanner() }}
                >
                  <ScanIcon className="h-4 w-4" />
                  {scanState === "idle" ? "Iniciar Escáner" : "Escanear Otro"}
                </Button>
              )}

              {scanState === "scanning" && (
                <Button
                  variant="outline"
                  className="flex-1 gap-2 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-500/20 dark:text-red-400 dark:hover:bg-red-500/10"
                  onClick={handleReset}
                >
                  <XCircleIcon className="h-4 w-4" />
                  Detener
                </Button>
              )}

              {scanState === "found" && child && (
                <Button
                  variant="outline"
                  className="gap-2 bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400"
                >
                  <UserRoundIcon className="h-4 w-4" />
                  Ver Perfil
                </Button>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
