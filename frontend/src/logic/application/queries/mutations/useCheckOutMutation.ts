import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDependencies } from '@/logic/DependenciesContext';
import type { CheckOutData } from '@/logic/domain/schemas/routeSchema';
import { toast } from 'sonner';

export const useCheckOutMutation = (tripId: string) => {
    const { routeRepository } = useDependencies();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CheckOutData) => routeRepository.checkOut(data),
        onSuccess: (result) => {
            if (result.isSuccess) {
                toast.success('✅ Entrega registrada correctamente');
                queryClient.invalidateQueries({ queryKey: ['trip-stops', tripId] });
            } else {
                toast.error(result.error ?? 'Error al registrar la entrega');
            }
        },
        onError: () => toast.error('Error de conexión al registrar la entrega'),
    });
};
