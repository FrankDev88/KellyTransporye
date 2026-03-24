import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDependencies } from '@/logic/DependenciesContext';
import type { CheckInData } from '@/logic/domain/schemas/routeSchema';
import { toast } from 'sonner';

export const useCheckInMutation = (tripId: string) => {
    const { routeRepository } = useDependencies();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CheckInData) => routeRepository.checkIn(data),
        onSuccess: (result) => {
            if (result.isSuccess) {
                toast.success('✅ Abordaje registrado correctamente');
                queryClient.invalidateQueries({ queryKey: ['trip-stops', tripId] });
            } else {
                toast.error(result.error ?? 'Error al registrar el abordaje');
            }
        },
        onError: () => toast.error('Error de conexión al registrar el abordaje'),
    });
};
