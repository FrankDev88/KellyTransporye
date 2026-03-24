import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"

import { createChildSchema, type CreateChildCredentials } from "@/logic/domain/schemas/childSchema"
import { useDependencies } from "@/logic/DependenciesContext"

interface ChildCreateFormProps {
  onSuccess?: () => void
}

export function ChildCreateForm({ onSuccess }: ChildCreateFormProps) {
  const { childRepository } = useDependencies()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateChildCredentials>({
    resolver: zodResolver(createChildSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      parentId: "",
      qrIdentifier: "",
      homeAddress: "",
      latitude: 0,
      longitude: 0,
      photoUrl: "",
    },
  })

  async function onSubmit(data: CreateChildCredentials) {
    const result = await childRepository.createChild(data)
    
    if (result.isFailure) {
      toast.error(result.error || "Hubo un error al registrar el estudiante.")
      return
    }

    toast.success("Estudiante registrado exitosamente.")
    reset()
    onSuccess?.()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="py-4 space-y-4">
      <FieldGroup>
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="firstName">Nombre</FieldLabel>
            <Input id="firstName" placeholder="Ej. Mateo" {...register("firstName")} />
            <FieldError errors={[errors.firstName]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="lastName">Apellido</FieldLabel>
            <Input id="lastName" placeholder="Ej. García" {...register("lastName")} />
            <FieldError errors={[errors.lastName]} />
          </Field>
        </div>
        
        <Field>
          <FieldLabel htmlFor="parentId">ID del Padre (UUID)</FieldLabel>
          <Input id="parentId" placeholder="00000000-0000..." {...register("parentId")} />
          <FieldError errors={[errors.parentId]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="qrIdentifier">Identificador QR (UUID)</FieldLabel>
          <Input id="qrIdentifier" placeholder="00000000-0000..." {...register("qrIdentifier")} />
          <FieldError errors={[errors.qrIdentifier]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="homeAddress">Dirección</FieldLabel>
          <Input id="homeAddress" placeholder="Ej. Av. Reforma 123" {...register("homeAddress")} />
          <FieldError errors={[errors.homeAddress]} />
        </Field>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Registrar Estudiante
          </Button>
        </div>
      </FieldGroup>
    </form>
  )
}
