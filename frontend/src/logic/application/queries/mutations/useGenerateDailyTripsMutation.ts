import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useDependencies } from "../../../DependenciesContext";
import type { GenerateDailyTripsData } from "../../../domain/schemas/routeSchema";

export const useGenerateDailyTripsMutation = () => {
    const { routeRepository } = useDependencies();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: GenerateDailyTripsData) => routeRepository.generateDailyTrips(data),
        onSuccess: (result: any) => {
            if (result.isFailure) { toast.error(result.error); return; }
            toast.success(result.getValue()?.message || "Viajes diarios generados exitosamente.");
            queryClient.invalidateQueries({ queryKey: ["trips"] });
        },
        onError: () => toast.error("Error inesperado al generar los viajes."),
    });
};
