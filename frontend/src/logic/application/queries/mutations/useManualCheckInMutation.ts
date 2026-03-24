import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDependencies } from '@/logic/DependenciesContext';
import type { ManualCheckInData } from '@/logic/domain/schemas/routeSchema';
import { toast } from 'sonner';

export const useManualCheckInMutation = (tripId: string) => {
    const { routeRepository } = useDependencies();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: ManualCheckInData) => routeRepository.manualCheckIn(data),
        onSuccess: (result) => {
            if (result.isSuccess) {
                toast.success('✅ Abordaje manual registrado correctamente');
                queryClient.invalidateQueries({ queryKey: ['trip-stops', tripId] });
            } else {
                toast.error(result.error ?? 'Error al registrar el abordaje manual');
            }
        },
        onError: () => toast.error('Error de conexión al registrar el abordaje manual'),
    });
};
