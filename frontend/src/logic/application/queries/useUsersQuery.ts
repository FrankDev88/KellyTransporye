import { useQuery } from "@tanstack/react-query";
import { AxiosUserRepository } from "@/logic/infrastructure/repositories/AxiosUserRepository";
import { toast } from "sonner";

const userRepository = new AxiosUserRepository();

export const useUsersQuery = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const result = await userRepository.getUsers();
      if (result.isFailure) {
        toast.error(result.error || "Error al cargar usuarios");
        throw new Error(result.error);
      }
      return result.getValue();
    },
  });
};
