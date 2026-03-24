import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserSchema, type CreateUserCredentials, UserRole } from "@/logic/domain/schemas/userSchema";
import { useCreateUserMutation } from "@/logic/application/queries/mutations/useCreateUserMutation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
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
    <form onSubmit={handleSubmit(onSubmit)} className="py-4">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="fullName">Nombre Completo</FieldLabel>
          <Input
            id="fullName"
            placeholder="Juan Pérez"
            {...register("fullName")}
          />
          <FieldError errors={[errors.fullName]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="email">Correo Electrónico</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="juan.perez@example.com"
            {...register("email")}
          />
          <FieldError errors={[errors.email]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Contraseña</FieldLabel>
          <Input
            id="password"
            type="password"
            {...register("password")}
          />
          <FieldError errors={[errors.password]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="role">Rol de Usuario</FieldLabel>
          <Select
            onValueChange={(value) => setValue("role", value as UserRole)}
            value={selectedRole}
          >
            <SelectTrigger id="role" className="w-full h-9">
              <SelectValue placeholder="Selecciona un rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value={UserRole.ADMIN}>Administrador</SelectItem>
                <SelectItem value={UserRole.DRIVER}>Conductor</SelectItem>
                <SelectItem value={UserRole.PARENT}>Padre de Familia</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <FieldError errors={[errors.role]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="phoneNumber">Teléfono (Opcional)</FieldLabel>
          <Input
            id="phoneNumber"
            placeholder="+52 55..."
            {...register("phoneNumber")}
          />
          <FieldError errors={[errors.phoneNumber]} />
        </Field>

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Crear Usuario
        </Button>
      </FieldGroup>
    </form>
  );
}
