import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// import { Html5QrcodeScanner } from 'html5-qrcode'; // removed in favor of direct API
import { toast } from 'sonner';
import {
    BusIcon,
    UserRoundCheckIcon,
    QrCodeIcon,
    MapPinIcon,
    CheckCircleIcon,
    ClockIcon,
    XCircleIcon,
    AlertTriangleIcon,
    ChevronLeftIcon,
    HandIcon,
    LogOutIcon,
    RefreshCwIcon,
    UserIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Field,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

import { useTripStopsQuery } from '@/logic/application/queries/useTripStopsQuery';
import { useCheckInMutation } from '@/logic/application/queries/mutations/useCheckInMutation';
import { useCheckOutMutation } from '@/logic/application/queries/mutations/useCheckOutMutation';
import { useManualCheckInMutation } from '@/logic/application/queries/mutations/useManualCheckInMutation';
import { useAttendanceStore } from '@/logic/application/store/useAttendanceStore';
import type { TripStop } from '@/logic/domain/repositories/route.repository';

// ─── Fix default Leaflet marker icons (Vite compatibility) ────────────────────
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ─── Custom colored icons per status ─────────────────────────────────────────
const makeIcon = (color: string) =>
    L.divIcon({
        className: '',
        html: `<div style="
      width:28px;height:28px;border-radius:50%;
      background:${color};border:3px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.4);
      display:flex;align-items:center;justify-content:center;
    "></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
    });

const STATUS_ICON: Record<TripStop['status'], L.DivIcon> = {
    PENDING: makeIcon('#f59e0b'),
    ON_BOARD: makeIcon('#3b82f6'),
    COMPLETED: makeIcon('#22c55e'),
    ABSENCE_CONFIRMED: makeIcon('#9ca3af'),
    MISSING_ALERT: makeIcon('#ef4444'),
};

// ─── Status badge helper ──────────────────────────────────────────────────────
function StatusBadge({ status }: { status: TripStop['status'] }) {
    const config: Record<TripStop['status'], { label: string; className: string; icon: React.ReactNode }> = {
        PENDING: { label: 'Pendiente', className: 'border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400', icon: <ClockIcon className="size-3" /> },
        ON_BOARD: { label: 'A bordo', className: 'border-blue-500/25 bg-blue-500/10 text-blue-600 dark:text-blue-400', icon: <BusIcon className="size-3" /> },
        COMPLETED: { label: 'Entregado', className: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', icon: <CheckCircleIcon className="size-3" /> },
        ABSENCE_CONFIRMED: { label: 'Ausente', className: 'border-gray-400/25 bg-gray-400/10 text-gray-500', icon: <XCircleIcon className="size-3" /> },
        MISSING_ALERT: { label: '⚠ Alerta', className: 'border-red-500/25 bg-red-500/10 text-red-600 dark:text-red-400', icon: <AlertTriangleIcon className="size-3" /> },
    };
    const { label, className, icon } = config[status];
    return (
        <Badge variant="outline" className={cn('flex items-center gap-1 text-xs', className)}>
            {icon} {label}
        </Badge>
    );
}

// ─── Stop List Item ───────────────────────────────────────────────────────────
function StopItem({ stop, onCheckOut }: { stop: TripStop; onCheckOut: (stop: TripStop) => void }) {
    return (
        <div className={cn(
            'flex items-center gap-3 rounded-lg border p-3 transition-colors',
            stop.status === 'PENDING' && 'bg-amber-500/5 border-amber-500/20',
            stop.status === 'ON_BOARD' && 'bg-blue-500/5 border-blue-500/20',
            stop.status === 'COMPLETED' && 'bg-emerald-500/5 border-emerald-500/20',
            stop.status === 'ABSENCE_CONFIRMED' && 'bg-muted/30 border-border opacity-60',
            stop.status === 'MISSING_ALERT' && 'bg-red-500/5 border-red-500/20',
        )}>
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                {stop.stopOrder}
            </span>
            <Avatar className="size-9 shrink-0">
                <AvatarImage src={stop.childPhotoUrl} alt={stop.childFirstName} />
                <AvatarFallback className="text-xs">
                    {stop.childFirstName?.[0]}{stop.childLastName?.[0]}
                </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{stop.childFirstName} {stop.childLastName}</p>
                <p className="truncate text-xs text-muted-foreground">{stop.homeAddress}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1.5">
                <StatusBadge status={stop.status} />
                {stop.status === 'ON_BOARD' && (
                    <Tooltip>
                        <TooltipTrigger
                            render={
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="size-7 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                                    onClick={() => onCheckOut(stop)}
                                >
                                    <LogOutIcon className="size-3.5" />
                                </Button>
                            }
                        />
                        <TooltipContent>Check-Out manual</TooltipContent>
                    </Tooltip>
                )}
            </div>
        </div>
    );
}

// ─── Route Map ────────────────────────────────────────────────────────────────
function RouteMap({ stops }: { stops: TripStop[] }) {
    const validStops = stops.filter((s) => s.latitude && s.longitude);
    const center: [number, number] = validStops.length > 0
        ? [validStops[0].latitude, validStops[0].longitude]
        : [19.4326, -99.1332]; // CDMX fallback

    const polyline: [number, number][] = validStops.map((s) => [s.latitude, s.longitude]);

    return (
        <MapContainer
            center={center}
            zoom={14}
            className="size-full rounded-xl"
            style={{ minHeight: '100%' }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {polyline.length > 1 && (
                <Polyline
                    positions={polyline}
                    pathOptions={{ color: '#3b82f6', weight: 3, dashArray: '8 4', opacity: 0.7 }}
                />
            )}
            {validStops.map((stop) => (
                <Marker
                    key={stop.id}
                    position={[stop.latitude, stop.longitude]}
                    icon={STATUS_ICON[stop.status]}
                >
                    <Popup>
                        <div className="text-sm">
                            <p className="font-semibold">{stop.stopOrder}. {stop.childFirstName} {stop.childLastName}</p>
                            <p className="text-muted-foreground">{stop.homeAddress}</p>
                            <StatusBadge status={stop.status} />
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}

// ─── QR Scanner Panel ─────────────────────────────────────────────────────────
import { Html5Qrcode } from 'html5-qrcode';

function QrScannerPanel({ tripId, onManualCheckIn, onManualCheckOut }: {
    tripId: string;
    onManualCheckIn: () => void;
    onManualCheckOut: () => void;
}) {
    const { setScanResult, scanResult } = useAttendanceStore();
    const { mutate: checkIn } = useCheckInMutation(tripId);
    const [cameraError, setCameraError] = React.useState<string | null>(null);

    // Track processing state in a ref to bypass stale closure issues in useEffect
    const isProcessingRef = React.useRef(false);

    React.useEffect(() => {
        let scanner: Html5Qrcode | null = null;
        let isComponentMounted = true;

        const startScanner = async () => {
            try {
                scanner = new Html5Qrcode('qr-reader', { verbose: false });
                await scanner.start(
                    { facingMode: 'environment' },
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0,
                    },
                    (decodedText) => {
                        if (isProcessingRef.current || !isComponentMounted) return;
                        
                        isProcessingRef.current = true; // Lock immediately
                        setScanResult(decodedText);
                        
                        checkIn(
                            { tripId, qrIdentifier: decodedText },
                            {
                                onSettled: () => {
                                    setTimeout(() => {
                                        setScanResult(null);
                                        isProcessingRef.current = false; // Unlock after animation
                                    }, 1500);
                                }
                            }
                        );
                    },
                    () => { /* ignore */ }
                );
            } catch (err: any) {
                if (isComponentMounted) {
                    setCameraError('Necesitas otorgar permisos de cámara para continuar.');
                }
            }
        };

        // Delay to ensure the DOM element 'qr-reader' is ready
        const timeoutId = setTimeout(startScanner, 100);

        return () => {
            isComponentMounted = false;
            clearTimeout(timeoutId);
            if (scanner && scanner.isScanning) {
                scanner.stop().then(() => scanner?.clear()).catch(() => { /* ignore cleanup errors */ });
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tripId]);

    return (
        <div className="flex flex-col gap-4 h-full">
            {/* Camera */}
            <div className="relative overflow-hidden rounded-xl border flex-1 min-h-0 bg-muted/20 flex items-center justify-center">
                <div className="relative w-[300px] h-[300px] rounded-2xl overflow-hidden shadow-inner border-4 border-muted">
                    <div id="qr-reader" className="absolute inset-0 [&_video]:w-full [&_video]:h-full [&_video]:object-cover" />
                    
                    {scanResult && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-emerald-500/90 backdrop-blur-sm animate-in fade-in">
                            <div className="text-center text-white">
                                <CheckCircleIcon className="mx-auto size-12 mb-2" />
                                <p className="text-lg font-bold">¡Abordaje registrado!</p>
                                <p className="text-sm opacity-80 font-mono">{scanResult}</p>
                            </div>
                        </div>
                    )}
                    
                    {cameraError && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center p-6 text-center text-muted-foreground bg-background/95">
                            <div>
                                <AlertTriangleIcon className="size-10 mx-auto mb-2 opacity-50 text-amber-500" />
                                <p className="text-sm">{cameraError}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3 shrink-0">
                <Button
                    variant="outline"
                    className="h-14 flex-col gap-1 border-amber-500/30 bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 dark:text-amber-400"
                    onClick={onManualCheckIn}
                >
                    <HandIcon className="size-5" />
                    <span className="text-xs font-semibold">Asistencia Manual</span>
                </Button>
                <Button
                    variant="outline"
                    className="h-14 flex-col gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-400"
                    onClick={onManualCheckOut}
                >
                    <LogOutIcon className="size-5" />
                    <span className="text-xs font-semibold">Check-Out Manual</span>
                </Button>
            </div>
        </div>
    );
}

// ─── Manual Check-In Dialog ───────────────────────────────────────────────────
function ManualCheckInDialog({
    open,
    onOpenChange,
    tripId,
    pendingStops,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    tripId: string;
    pendingStops: TripStop[];
}) {
    const { mutate: manualCheckIn, isPending } = useManualCheckInMutation(tripId);
    const [childId, setChildId] = React.useState('');
    const [reason, setReason] = React.useState<'LOSS' | 'DAMAGE' | 'FORGOTTEN' | ''>('');

    const handleSubmit = () => {
        if (!childId || !reason) {
            toast.warning('Selecciona un niño y una razón.');
            return;
        }
        if (!navigator.geolocation) {
            toast.error('GPS no disponible en este dispositivo.');
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                manualCheckIn(
                    {
                        tripId,
                        childId,
                        reason: reason as 'LOSS' | 'DAMAGE' | 'FORGOTTEN',
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude,
                    },
                    {
                        onSuccess: (r) => {
                            if (r.isSuccess) {
                                setChildId('');
                                setReason('');
                                onOpenChange(false);
                            }
                        },
                    },
                );
            },
            () => toast.error('No se pudo obtener la ubicación GPS.'),
            { timeout: 5000 },
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <HandIcon className="size-5 text-amber-500" />
                        Asistencia Manual
                    </DialogTitle>
                    <DialogDescription>
                        Protocolo "Gafete Perdido" — registra el abordaje sin QR con validación fotográfica.
                    </DialogDescription>
                </DialogHeader>

                <FieldGroup className="py-2">
                    <Field>
                        <FieldLabel>Niño (estado: Pendiente)</FieldLabel>
                        <Select value={childId} onValueChange={(v) => setChildId(v ?? '')}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona un niño..." />
                            </SelectTrigger>
                            <SelectContent>
                                {pendingStops.length === 0 && (
                                    <SelectItem value="__none" disabled>No hay niños pendientes</SelectItem>
                                )}
                                {pendingStops.map((s) => (
                                    <SelectItem key={s.childId} value={s.childId}>
                                        <div className="flex items-center gap-2">
                                            <UserIcon className="size-3.5 text-muted-foreground" />
                                            {s.stopOrder}. {s.childFirstName} {s.childLastName}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>

                    {/* Photo preview for selected child */}
                    {childId && (() => {
                        const child = pendingStops.find((s) => s.childId === childId);
                        return child ? (
                            <div className="flex items-center gap-4 rounded-lg border bg-muted/30 p-3">
                                <Avatar className="size-16 rounded-lg">
                                    <AvatarImage src={child.childPhotoUrl} alt={child.childFirstName} className="object-cover" />
                                    <AvatarFallback className="rounded-lg text-xl">
                                        {child.childFirstName?.[0]}{child.childLastName?.[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{child.childFirstName} {child.childLastName}</p>
                                    <p className="text-xs text-muted-foreground">{child.homeAddress}</p>
                                    <Badge variant="outline" className="mt-1 text-xs text-amber-600 border-amber-500/25 bg-amber-500/10">
                                        Validar identidad visualmente
                                    </Badge>
                                </div>
                            </div>
                        ) : null;
                    })()}

                    <Field>
                        <FieldLabel>Razón</FieldLabel>
                        <Select value={reason} onValueChange={(v) => setReason(v as any)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Motivo del gafete..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="LOSS">Extravío</SelectItem>
                                <SelectItem value="DAMAGE">Daño</SelectItem>
                                <SelectItem value="FORGOTTEN">Olvido</SelectItem>
                            </SelectContent>
                        </Select>
                    </Field>
                </FieldGroup>

                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isPending || !childId || !reason}
                        className="bg-amber-500 text-white hover:bg-amber-600"
                    >
                        {isPending ? 'Registrando...' : 'Registrar Abordaje Manual'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ─── Manual Check-Out Dialog ──────────────────────────────────────────────────
function ManualCheckOutDialog({
    open,
    onOpenChange,
    tripId,
    onBoardStops,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    tripId: string;
    onBoardStops: TripStop[];
}) {
    const { mutate: checkOut, isPending } = useCheckOutMutation(tripId);
    const [childId, setChildId] = React.useState('');

    const handleSubmit = () => {
        if (!childId) {
            toast.warning('Selecciona un niño.');
            return;
        }
        checkOut(
            { tripId, childId },
            {
                onSuccess: (r) => {
                    if (r.isSuccess) {
                        setChildId('');
                        onOpenChange(false);
                    }
                },
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <LogOutIcon className="size-5 text-emerald-500" />
                        Check-Out Manual
                    </DialogTitle>
                    <DialogDescription>
                        Confirma la entrega del menor en el destino correspondiente.
                    </DialogDescription>
                </DialogHeader>

                <FieldGroup className="py-2">
                    <Field>
                        <FieldLabel>Niño (estado: A bordo)</FieldLabel>
                        <Select value={childId} onValueChange={(v) => setChildId(v ?? '')}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona un niño..." />
                            </SelectTrigger>
                            <SelectContent>
                                {onBoardStops.length === 0 && (
                                    <SelectItem value="__none" disabled>No hay niños a bordo</SelectItem>
                                )}
                                {onBoardStops.map((s) => (
                                    <SelectItem key={s.childId} value={s.childId}>
                                        <div className="flex items-center gap-2">
                                            <BusIcon className="size-3.5 text-blue-500" />
                                            {s.stopOrder}. {s.childFirstName} {s.childLastName}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>

                    {childId && (() => {
                        const child = onBoardStops.find((s) => s.childId === childId);
                        return child ? (
                            <div className="flex items-center gap-4 rounded-lg border bg-muted/30 p-3">
                                <Avatar className="size-16 rounded-lg">
                                    <AvatarImage src={child.childPhotoUrl} alt={child.childFirstName} className="object-cover" />
                                    <AvatarFallback className="rounded-lg text-xl">
                                        {child.childFirstName?.[0]}{child.childLastName?.[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{child.childFirstName} {child.childLastName}</p>
                                    <p className="text-xs text-muted-foreground">{child.homeAddress}</p>
                                    <StatusBadge status="ON_BOARD" />
                                </div>
                            </div>
                        ) : null;
                    })()}
                </FieldGroup>

                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isPending || !childId}
                        className="bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                        {isPending ? 'Registrando...' : 'Confirmar Entrega'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ─── Driver Page ──────────────────────────────────────────────────────────────
export default function DriverPage() {
    const { tripId } = useParams<{ tripId: string }>();
    const navigate = useNavigate();
    const {
        isManualCheckInOpen, setIsManualCheckInOpen,
        isManualCheckOutOpen, setIsManualCheckOutOpen,
    } = useAttendanceStore();

    const { data: stops = [], isLoading, refetch } = useTripStopsQuery(tripId ?? '');

    const pendingStops = stops.filter((s) => s.status === 'PENDING');
    const onBoardStops = stops.filter((s) => s.status === 'ON_BOARD');
    const completedCount = stops.filter((s) => s.status === 'COMPLETED').length;
    const absentCount = stops.filter((s) => s.status === 'ABSENCE_CONFIRMED').length;

    if (!tripId) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p className="text-muted-foreground">ID de viaje no especificado.</p>
            </div>
        );
    }

    return (
        <div className="flex h-screen flex-col overflow-hidden bg-background">
            {/* ── Topbar ── */}
            <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/trips')} className="size-8">
                    <ChevronLeftIcon className="size-4" />
                </Button>
                <div className="flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <BusIcon className="size-4" />
                    </div>
                    <div className="leading-tight">
                        <p className="text-sm font-semibold">Vista del Conductor</p>
                        <p className="text-xs font-mono text-muted-foreground">{tripId.slice(0, 8)}…</p>
                    </div>
                </div>

                <Separator orientation="vertical" className="mx-2 h-5" />

                {/* Quick stats */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-sm">
                        <div className="size-2.5 rounded-full bg-amber-400" />
                        <span className="font-medium">{pendingStops.length}</span>
                        <span className="text-muted-foreground hidden sm:inline">pendientes</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm">
                        <div className="size-2.5 rounded-full bg-blue-500" />
                        <span className="font-medium">{onBoardStops.length}</span>
                        <span className="text-muted-foreground hidden sm:inline">a bordo</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm">
                        <div className="size-2.5 rounded-full bg-emerald-500" />
                        <span className="font-medium">{completedCount}</span>
                        <span className="text-muted-foreground hidden sm:inline">entregados</span>
                    </div>
                    {absentCount > 0 && (
                        <div className="flex items-center gap-1.5 text-sm">
                            <div className="size-2.5 rounded-full bg-gray-400" />
                            <span className="font-medium">{absentCount}</span>
                            <span className="text-muted-foreground hidden sm:inline">ausentes</span>
                        </div>
                    )}
                </div>

                <Button variant="ghost" size="icon" className="ml-auto size-8" onClick={() => refetch()}>
                    <RefreshCwIcon className="size-4" />
                </Button>
            </header>

            {/* ── Main Split Layout ── */}
            <div className="flex flex-1 overflow-hidden">

                {/* LEFT: Map + stops list */}
                <div className="flex w-[55%] flex-col gap-0 border-r overflow-hidden">
                    {/* Map */}
                    <div className="relative h-[55%] shrink-0">
                        {isLoading ? (
                            <Skeleton className="size-full rounded-none" />
                        ) : (
                            <RouteMap stops={stops} />
                        )}
                    </div>

                    {/* Stops List */}
                    <div className="flex flex-col overflow-hidden border-t">
                        <div className="flex items-center justify-between px-4 py-2 bg-muted/30">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                <MapPinIcon className="size-3.5" />
                                Paradas del viaje ({stops.length})
                            </p>
                        </div>
                        <ScrollArea className="flex-1 px-3 pb-3">
                            {isLoading ? (
                                <div className="flex flex-col gap-2 pt-2">
                                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
                                </div>
                            ) : stops.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <MapPinIcon className="size-8 text-muted-foreground/40 mb-2" />
                                    <p className="text-sm text-muted-foreground">No hay paradas registradas para este viaje.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2 pt-2">
                                    {stops.map((stop) => (
                                        <StopItem
                                            key={stop.id}
                                            stop={stop}
                                            onCheckOut={() => {
                                                useAttendanceStore.getState().setSelectedChildId(stop.childId);
                                                setIsManualCheckOutOpen(true);
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                </div>

                {/* RIGHT: QR Scanner + actions */}
                <div className="flex w-[45%] flex-col overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <QrCodeIcon className="" />
                            Escáner QR
                        </p>
                        <Badge variant="outline" className="text-xs border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <span className="mr-1 size-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                            En vivo
                        </Badge>
                    </div>

                    <div className="flex flex-1 flex-col overflow-hidden">
                        {/* Top 75%: Scanner + Action Buttons */}
                        <div className="flex-[3_3_0%] min-h-0 p-4 border-b flex flex-col justify-center overflow-hidden">
                            {isLoading ? (
                                <Skeleton className="h-full w-full rounded-xl" />
                            ) : (
                                <QrScannerPanel
                                    tripId={tripId}
                                    onManualCheckIn={() => setIsManualCheckInOpen(true)}
                                    onManualCheckOut={() => setIsManualCheckOutOpen(true)}
                                    
                                />

                            )}
                        </div>

                        {/* Bottom 25%: Legend + Info */}
                        <div className="flex-[1_1_0%] min-h-0 p-4 overflow-y-auto bg-muted/10">
                            {/* Legend */}
                            <div className="rounded-lg border bg-background p-3">
                                <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Leyenda de estados</p>
                                <div className="grid grid-cols-2 gap-1.5">
                                    {(['PENDING', 'ON_BOARD', 'COMPLETED', 'ABSENCE_CONFIRMED', 'MISSING_ALERT'] as const).map((s) => (
                                        <div key={s} className="flex items-center gap-1.5">
                                            <StatusBadge status={s} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Info card */}
                            <div className="mt-4 rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
                                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1">
                                    <UserRoundCheckIcon className="size-3.5" />
                                    Instrucciones
                                </p>
                                <ul className="text-xs text-muted-foreground space-y-0.5 list-disc list-inside">
                                    <li>Escanea el gafete QR del niño al abordar.</li>
                                    <li>Usa "Asistencia Manual" si el gafete está perdido.</li>
                                    <li>Usa "Check-Out Manual" al hacer la entrega.</li>
                                    <li>El mapa se actualiza cada 10 segundos.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Dialogs ── */}
            <ManualCheckInDialog
                open={isManualCheckInOpen}
                onOpenChange={setIsManualCheckInOpen}
                tripId={tripId}
                pendingStops={pendingStops}
            />
            <ManualCheckOutDialog
                open={isManualCheckOutOpen}
                onOpenChange={setIsManualCheckOutOpen}
                tripId={tripId}
                onBoardStops={onBoardStops}
            />
        </div>
    );
}
