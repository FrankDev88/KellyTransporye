import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useDependencies } from "../../DependenciesContext";

export const useTripsQuery = () => {
    const { routeRepository } = useDependencies();

    return useQuery({
        queryKey: ["trips"],
        retry: false,
        queryFn: async () => {
            const result = await routeRepository.getTrips();
            if (result.isFailure) {
                toast.error(result.error || "Error al cargar los viajes");
                throw new Error(result.error);
            }
            return result.getValue();
        },
    });
};
