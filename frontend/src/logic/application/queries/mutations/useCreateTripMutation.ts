import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useDependencies } from "../../../DependenciesContext";
import type { CreateTripData } from "../../../domain/schemas/routeSchema";

export const useCreateTripMutation = () => {
    const { routeRepository } = useDependencies();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateTripData) => routeRepository.createTrip(data),
        onSuccess: (result: any) => {
            if (result.isFailure) { toast.error(result.error); return; }
            toast.success("Viaje creado exitosamente.");
            queryClient.invalidateQueries({ queryKey: ["trips"] });
        },
        onError: () => toast.error("Error inesperado al crear el viaje."),
    });
};
