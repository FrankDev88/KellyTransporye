import { z } from "zod";

export enum UserRole {
  ADMIN = "ADMIN",
  DRIVER = "DRIVER",
  PARENT = "PARENT",
}

export const createUserSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  fullName: z.string().min(3, "El nombre completo debe tener al menos 3 caracteres"),
  role: z.nativeEnum(UserRole, {
    errorMap: () => ({ message: "Selecciona un rol válido" }),
  }),
  phoneNumber: z.string().optional(),
});

export type CreateUserCredentials = z.infer<typeof createUserSchema>;
