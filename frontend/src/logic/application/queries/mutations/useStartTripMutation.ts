import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useDependencies } from "../../../DependenciesContext";
import type { StartTripData } from "../../../domain/schemas/routeSchema";

export const useStartTripMutation = () => {
    const { routeRepository } = useDependencies();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: StartTripData) => routeRepository.startTrip(data),
        onSuccess: (result: any) => {
            if (result.isFailure) { toast.error(result.error); return; }
            toast.success("¡Viaje iniciado correctamente!");
            queryClient.invalidateQueries({ queryKey: ["trips"] });
        },
        onError: () => toast.error("Error inesperado al iniciar el viaje."),
    });
};
