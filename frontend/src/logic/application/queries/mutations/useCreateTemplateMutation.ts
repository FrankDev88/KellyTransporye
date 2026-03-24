import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useDependencies } from "../../../DependenciesContext";
import type { CreateRouteTemplateData } from "../../../domain/schemas/routeSchema";

export const useCreateTemplateMutation = () => {
    const { routeRepository } = useDependencies();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateRouteTemplateData) => routeRepository.createTemplate(data),
        onSuccess: (result: any) => {
            if (result.isFailure) { toast.error(result.error); return; }
            toast.success("Plantilla de ruta creada exitosamente.");
            queryClient.invalidateQueries({ queryKey: ["trips"] });
        },
        onError: () => toast.error("Error inesperado al crear la plantilla."),
    });
};
