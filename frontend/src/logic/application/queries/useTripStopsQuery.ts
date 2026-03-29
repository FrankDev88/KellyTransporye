import { useQuery } from '@tanstack/react-query';
import { useDependencies } from '@/logic/DependenciesContext';
import type { TripStop } from '@/logic/domain/repositories/route.repository';

export const useTripStopsQuery = (tripId: string) => {
    const { routeRepository } = useDependencies();

    return useQuery<TripStop[]>({
        queryKey: ['trip-stops', tripId],
        queryFn: async () => {
            const result = await routeRepository.getTripStops(tripId);
            if (!result.isSuccess) throw new Error(result.error);
            return result.getValue() ?? [];
        },
        enabled: !!tripId,
        retry: false,
        refetchOnWindowFocus: false,
        refetchInterval: (query) => (query.state.error ? false : 105_000), // stop polling if there's an error
    });
};
