import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateUserCredentials } from "../../../domain/schemas/userSchema";
import { toast } from "sonner";
import { useDependencies } from "../../../DependenciesContext";

export const useCreateUserMutation = () => {
  const { createUserUseCase } = useDependencies();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserCredentials) => createUserUseCase.execute(data),
    onSuccess: (result) => {
      if (result.isSuccess) {
        toast.success(result.getValue().message);
        queryClient.invalidateQueries({ queryKey: ["users"] });
      } else {
        toast.error(result.error || "Error al crear el usuario");
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Ocurrió un error inesperado");
    },
  });
};
