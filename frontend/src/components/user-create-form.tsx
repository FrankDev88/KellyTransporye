import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserSchema, type CreateUserCredentials, UserRole } from "@/logic/domain/schemas/userSchema";
import { useCreateUserMutation } from "@/logic/application/queries/mutations/useCreateUserMutation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface UserCreateFormProps {
  onSuccess?: () => void;
}

export function UserCreateForm({ onSuccess }: UserCreateFormProps) {
  const { mutate: createUser, isPending } = useCreateUserMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateUserCredentials>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      role: UserRole.DRIVER,
    },
  });

  const selectedRole = watch("role");

  const onSubmit = (data: CreateUserCredentials) => {
    createUser(data, {
      onSuccess: (result) => {
        if (result.isSuccess) {
          reset();
          onSuccess?.();
        }
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="fullName">Nombre Completo</Label>
        <Input
          id="fullName"
          placeholder="Juan Pérez"
          {...register("fullName")}
        />
        {errors.fullName && (
          <p className="text-sm text-destructive">{errors.fullName.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email">Correo Electrónico</Label>
        <Input
          id="email"
          type="email"
          placeholder="juan.perez@example.com"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          type="password"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="role">Rol de Usuario</Label>
        <Select
          onValueChange={(value) => setValue("role", value as UserRole)}
          defaultValue={selectedRole}
        >
          <SelectTrigger id="role">
            <SelectValue placeholder="Selecciona un rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UserRole.ADMIN}>Administrador</SelectItem>
            <SelectItem value={UserRole.DRIVER}>Conductor</SelectItem>
            <SelectItem value={UserRole.PARENT}>Padre de Familia</SelectItem>
          </SelectContent>
        </Select>
        {errors.role && (
          <p className="text-sm text-destructive">{errors.role.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="phoneNumber">Teléfono (Opcional)</Label>
        <Input
          id="phoneNumber"
          placeholder="+52 55..."
          {...register("phoneNumber")}
        />
        {errors.phoneNumber && (
          <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Crear Usuario
      </Button>
    </form>
  );
}
