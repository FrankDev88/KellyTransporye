import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useDependencies } from "../../DependenciesContext";

export const useUsersQuery = () => {
  const { userRepository } = useDependencies();

  return useQuery({
    queryKey: ["users"],
    retry: false,
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
