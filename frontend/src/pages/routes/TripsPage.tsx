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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  PlusIcon,
  SearchIcon,
  Loader2,
  PlayCircleIcon,
  CalendarPlusIcon,
  ListOrderedIcon,
} from "lucide-react"
import { useRoutesStore } from "@/logic/application/store/useRoutesStore"
import { useTripsQuery } from "@/logic/application/queries/useTripsQuery"
import { useCreateTripMutation } from "@/logic/application/queries/mutations/useCreateTripMutation"
import { useStartTripMutation } from "@/logic/application/queries/mutations/useStartTripMutation"
import { useGenerateDailyTripsMutation } from "@/logic/application/queries/mutations/useGenerateDailyTripsMutation"
import { useRouteTemplatesQuery } from "@/logic/application/queries/useRouteTemplatesQuery"
import { useUsersQuery } from "@/logic/application/queries/useUsersQuery"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  createTripSchema,
  startTripSchema,
  generateDailyTripsSchema,
  type CreateTripData,
  type StartTripData,
  type GenerateDailyTripsData,
} from "@/logic/domain/schemas/routeSchema"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"

// Helper format date
const formatDate = (dateString?: string) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("es-MX", { timeZone: "UTC" });
}

// ——————————————————————————————————————
// Create Trip Form
// ——————————————————————————————————————
function CreateTripForm({ onSuccess }: { onSuccess: () => void }) {
  const { mutate: createTrip, isPending } = useCreateTripMutation()
  const { data: templates } = useRouteTemplatesQuery()
  const { data: users } = useUsersQuery()
  
  const drivers = users?.filter(u => u.props.role === 'DRIVER') ?? []

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<CreateTripData>({
    resolver: zodResolver(createTripSchema),
  })
  const onSubmit = (data: CreateTripData) => {
    const payload = { ...data };
    if (!payload.driverId) delete payload.driverId;
    createTrip(payload as any, { onSuccess: (r: any) => { if (r.isSuccess) { reset(); onSuccess() } } })
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="py-4">
      <FieldGroup>
        <Field data-invalid={!!errors.templateId}>
          <FieldLabel htmlFor="templateId">Plantilla de Ruta</FieldLabel>
          <Controller
            name="templateId"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="templateId" aria-invalid={!!errors.templateId}>
                  <SelectValue placeholder="Selecciona una plantilla..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {templates?.map((t: any) => (
                      <SelectItem key={t.props.id} value={t.props.id}>
                        {t.props.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={[errors.templateId]} />
        </Field>
        
        <Field data-invalid={!!errors.driverId}>
          <FieldLabel htmlFor="driverId">Conductor (Opcional)</FieldLabel>
          <Controller
            name="driverId"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="driverId" aria-invalid={!!errors.driverId}>
                  <SelectValue placeholder="Opcional (Usa el de la plantilla)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="">(Sin asignar)</SelectItem>
                    {drivers.map((d: any) => (
                      <SelectItem key={d.props.id} value={d.props.id}>
                        {d.props.fullName}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={[errors.driverId]} />
        </Field>
        
        <Field data-invalid={!!errors.scheduledStart}>
          <FieldLabel htmlFor="scheduledStart">Fecha Programada</FieldLabel>
          <Input id="scheduledStart" type="date" aria-invalid={!!errors.scheduledStart} {...register("scheduledStart")} />
          <FieldError errors={[errors.scheduledStart]} />
        </Field>
        
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Crear Viaje
        </Button>
      </FieldGroup>
    </form>
  )
}

// ——————————————————————————————————————
// Generate Daily Trips Form
// ——————————————————————————————————————
function GenerateDailyForm({ onSuccess }: { onSuccess: () => void }) {
  const { mutate: generate, isPending } = useGenerateDailyTripsMutation()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<GenerateDailyTripsData>({
    resolver: zodResolver(generateDailyTripsSchema),
  })
  const onSubmit = (data: GenerateDailyTripsData) => {
    generate(data, { onSuccess: (r: any) => { if (r.isSuccess) { reset(); onSuccess() } } })
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="py-4">
      <FieldGroup>
        <Field data-invalid={!!errors.targetDate}>
          <FieldLabel htmlFor="targetDate">Fecha Objetivo</FieldLabel>
          <Input id="targetDate" type="date" aria-invalid={!!errors.targetDate} {...register("targetDate")} />
          <FieldError errors={[errors.targetDate]} />
        </Field>
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Generar Viajes Diarios
        </Button>
      </FieldGroup>
    </form>
  )
}

// ——————————————————————————————————————
// TripsPage
// ——————————————————————————————————————
export default function TripsPage() {
  const { data: trips, isLoading } = useTripsQuery()
  const { mutate: startTrip } = useStartTripMutation()
  const { data: users } = useUsersQuery()
  const { data: templates } = useRouteTemplatesQuery()
  const drivers = users?.filter(u => u.props.role === 'DRIVER') ?? []
  
  const {
    searchQuery, setSearchQuery,
    isCreateTripOpen, setIsCreateTripOpen,
    isGenerateDailyOpen, setIsGenerateDailyOpen,
  } = useRoutesStore()

  // Start trip dialog state
  const [startData, setStartData] = React.useState<StartTripData>({ tripId: "", driverId: "" })
  const [isStartOpen, setIsStartOpen] = React.useState(false)
  const { register: regStart, control: controlStart, handleSubmit: handleStart, reset: resetStart, formState: { errors: errStart } } =
    useForm<StartTripData>({ resolver: zodResolver(startTripSchema) })
    
  // Update form values when startData changes
  React.useEffect(() => {
    if (isStartOpen) {
      resetStart(startData)
    }
  }, [isStartOpen, startData, resetStart])

  const onStartSubmit = (data: StartTripData) => {
    startTrip(data, { onSuccess: () => { resetStart(); setIsStartOpen(false) } })
  }

  const filtered = (trips ?? []).filter((t) => {
    const templateName = templates?.find(tmp => tmp.props.id === t.props.templateId)?.props.name || "";
    const driverName = users?.find(u => u.props.id === t.props.driverId)?.props.fullName || "";
    
    return templateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           t.props.templateId.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (t.props.driverId?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
  })

  const getStatusBadge = (isActive: boolean, actualEnd?: string) => {
    if (actualEnd) return <Badge variant="outline" className="text-gray-500 border-gray-500/20 bg-gray-500/5">Finalizado</Badge>
    if (isActive) return <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 bg-emerald-500/5">✓ Activo</Badge>
    return <Badge variant="outline" className="text-amber-500 border-amber-500/20 bg-amber-500/5">Pendiente</Badge>
  }

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
                <BreadcrumbPage>Ejecución de Viajes</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="min-h-screen flex-1 rounded-xl bg-background border shadow-sm md:min-h-min p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                  <PlayCircleIcon className="h-6 w-6" />
                  Viajes (Ejecución)
                </h2>
                <p className="text-muted-foreground">Gestiona los viajes diarios programados y en curso.</p>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                {/* Crear viaje */}
                <Dialog open={isCreateTripOpen} onOpenChange={setIsCreateTripOpen}>
                  <DialogTrigger render={<Button size="sm"><PlusIcon className="mr-2 h-4 w-4" />Nuevo Viaje</Button>} />
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Crear Viaje</DialogTitle>
                      <DialogDescription>Asigna una plantilla y un conductor para este viaje.</DialogDescription>
                    </DialogHeader>
                    <CreateTripForm onSuccess={() => setIsCreateTripOpen(false)} />
                  </DialogContent>
                </Dialog>

                {/* Generar diarios */}
                <Dialog open={isGenerateDailyOpen} onOpenChange={setIsGenerateDailyOpen}>
                  <DialogTrigger render={
                    <Button size="sm" variant="outline" className="bg-purple-100 border-purple-200 text-purple-700 hover:bg-purple-200 dark:bg-purple-500/10 dark:border-purple-500/20 dark:text-purple-400">
                      <CalendarPlusIcon className="mr-2 h-4 w-4" />
                      Generación Masiva
                    </Button>
                  } />
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Generar Viajes Diarios</DialogTitle>
                      <DialogDescription>Genera automáticamente viajes para todas las plantillas activas.</DialogDescription>
                    </DialogHeader>
                    <GenerateDailyForm onSuccess={() => setIsGenerateDailyOpen(false)} />
                  </DialogContent>
                </Dialog>
              </div>

              <div className="relative w-full sm:w-auto">
                <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por conductor o plantilla..."
                  className="w-full sm:w-72 pl-9 bg-background"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {isLoading ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-bold">Plantilla</TableHead>
                      <TableHead className="font-bold">Conductor</TableHead>
                      <TableHead className="font-bold">Fecha Programada</TableHead>
                      <TableHead className="font-bold">Inicio Real</TableHead>
                      <TableHead className="font-bold text-center w-[120px]">Estado</TableHead>
                      <TableHead className="text-right w-[140px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((trip) => {
                      const templateName = templates?.find(t => t.props.id === trip.props.templateId)?.props.name || trip.props.templateId.slice(0, 8);
                      const driverName = users?.find(u => u.props.id === trip.props.driverId)?.props.fullName || (trip.props.driverId ? trip.props.driverId.slice(0, 8) : "Sin asignar");

                      return (
                        <TableRow key={trip.props.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="font-medium truncate max-w-[200px]" title={templateName}>
                            {templateName}
                          </TableCell>
                          <TableCell className="text-sm truncate max-w-[200px]" title={driverName}>
                            {driverName}
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDate(trip.props.scheduledStart)}
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDate(trip.props.actualStart)}
                          </TableCell>
                          <TableCell className="text-center">
                            {getStatusBadge(trip.props.isActive, trip.props.actualEnd)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {!trip.props.isActive && !trip.props.actualEnd && (
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 bg-emerald-100 border-emerald-200 text-emerald-600 hover:bg-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400"
                                  onClick={() => { setStartData({ tripId: trip.props.id, driverId: trip.props.driverId }); setIsStartOpen(true) }}
                                >
                                  <PlayCircleIcon className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 bg-blue-100 border-blue-200 text-blue-600 hover:bg-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400"
                              >
                                <ListOrderedIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {filtered.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                          {searchQuery ? "No se encontraron viajes." : "No hay viajes registrados aún."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>

        {/* Start Trip Dialog */}
        <Dialog open={isStartOpen} onOpenChange={setIsStartOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Iniciar Viaje</DialogTitle>
              <DialogDescription>Confirma los datos para activar el viaje en curso.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleStart(onStartSubmit)} className="py-4">
              <FieldGroup>
                <Field data-invalid={!!errStart.tripId}>
                  <FieldLabel htmlFor="startTripId">ID del Viaje</FieldLabel>
                  <Input id="startTripId" aria-invalid={!!errStart.tripId} {...regStart("tripId")} />
                  <FieldError errors={[errStart.tripId]} />
                </Field>
                <Field data-invalid={!!errStart.driverId}>
                  <FieldLabel htmlFor="startDriverId">Conductor</FieldLabel>
                  <Controller
                    name="driverId"
                    control={controlStart}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="startDriverId" aria-invalid={!!errStart.driverId}>
                          <SelectValue placeholder="Selecciona el conductor..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {drivers.map((d: any) => (
                              <SelectItem key={d.props.id} value={d.props.id}>
                                {d.props.fullName}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError errors={[errStart.driverId]} />
                </Field>
                <Button type="submit" className="w-full">Iniciar Viaje</Button>
              </FieldGroup>
            </form>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  )
}
