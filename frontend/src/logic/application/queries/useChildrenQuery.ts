import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useDependencies } from "../../DependenciesContext";

export const useChildrenQuery = () => {
    const { childRepository } = useDependencies();

    return useQuery({
        queryKey: ["children"],
        retry: false,
        queryFn: async () => {
            const result = await childRepository.getChildren();
            if (result.isFailure) {
                toast.error(result.error || "Error al cargar estudiantes");
                throw new Error(result.error);
            }
            return result.getValue();
        },
    });
};
