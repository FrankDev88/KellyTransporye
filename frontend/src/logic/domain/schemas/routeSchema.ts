import { z } from 'zod';

export const createRouteTemplateSchema = z.object({
    name: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres.' }),
    type: z.enum(['HOME_TO_SCHOOL', 'SCHOOL_TO_HOME'], { message: 'El tipo de ruta es requerido.' }),
    defaultDriverId: z.string().uuid({ message: 'El ID debe ser un UUID válido.' }).optional().or(z.literal('')),
    estimatedDuration: z.string().optional(),
    childrenIds: z.array(z.string().uuid({ message: 'Cada ID debe ser un UUID válido.' }))
        .min(1, { message: 'Debes incluir al menos un niño en la ruta.' }),
});
export type CreateRouteTemplateData = z.infer<typeof createRouteTemplateSchema>;

export const createTripSchema = z.object({
    templateId: z.string().uuid({ message: 'El ID de plantilla debe ser un UUID válido.' }),
    driverId: z.string().uuid({ message: 'El ID del conductor debe ser un UUID válido.' }).optional().or(z.literal('')),
    scheduledStart: z.string()
        .min(1, { message: 'La fecha es requerida' })
        .transform((val) => {
            if (val.includes('T')) return val; // Ya es ISO
            return `${val}T00:00:00.000Z`; // Agrega la hora cero para cumplir el datetime del backend
        })
        .optional(),
});
export type CreateTripData = z.infer<typeof createTripSchema>;

export const startTripSchema = z.object({
    tripId: z.string().uuid({ message: 'El ID del viaje debe ser un UUID válido.' }),
    driverId: z.string().uuid({ message: 'El ID del conductor debe ser un UUID válido.' }),
});
export type StartTripData = z.infer<typeof startTripSchema>;

export const generateDailyTripsSchema = z.object({
    targetDate: z.string()
        .min(1, { message: 'La fecha es requerida' })
        .transform((val) => {
            if (val.includes('T')) return val;
            return `${val}T00:00:00.000Z`;
        }),
});
export type GenerateDailyTripsData = z.infer<typeof generateDailyTripsSchema>;

// ── Driver / Attendance schemas ────────────────────────────────────────────

export const checkInSchema = z.object({
    tripId: z.string().uuid({ message: 'UUID de viaje requerido.' }),
    qrIdentifier: z.string().min(1, { message: 'El identificador QR es requerido.' }),
    driverId: z.string().uuid({ message: 'UUID de conductor requerido.' }),
    latitude: z.number(),
    longitude: z.number(),
});
export type CheckInData = z.infer<typeof checkInSchema>;

export const checkOutSchema = z.object({
    tripId: z.string().uuid({ message: 'UUID de viaje requerido.' }),
    childId: z.string().uuid({ message: 'UUID del niño requerido.' }),
    driverId: z.string().uuid({ message: 'UUID de conductor requerido.' }),
    latitude: z.number(),
    longitude: z.number(),
});
export type CheckOutData = z.infer<typeof checkOutSchema>;

export const ManualCheckInReason = {
    LOSS: 'LOSS',
    DAMAGE: 'DAMAGE',
    FORGOTTEN: 'FORGOTTEN',
} as const;

export const manualCheckInSchema = z.object({
    tripId: z.string().uuid({ message: 'UUID de viaje requerido.' }),
    childId: z.string().uuid({ message: 'UUID del niño requerido.' }),
    driverId: z.string().uuid({ message: 'UUID de conductor requerido.' }),
    reason: z.enum(['LOSS', 'DAMAGE', 'FORGOTTEN'], { message: 'Selecciona una razón.' }),
    latitude: z.number(),
    longitude: z.number(),
});
export type ManualCheckInData = z.infer<typeof manualCheckInSchema>;
