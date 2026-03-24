import { z } from "zod";

export const createChildSchema = z.object({
    firstName: z.string().min(1, { message: 'El nombre es obligatorio.' }),
    lastName: z.string().min(1, { message: 'El apellido es obligatorio.' }),
    parentId: z.string().uuid({ message: 'El ID del padre debe ser un UUID válido.' }),
    qrIdentifier: z.string().uuid({ message: 'El identificador de QR debe ser un UUID válido.' }),
    homeAddress: z.string().min(5, { message: 'La dirección debe ser detallada.' }),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    photoUrl: z.string().url().optional(),
});

export type CreateChildCredentials = z.infer<typeof createChildSchema>;
