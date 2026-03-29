import { useQuery } from '@tanstack/react-query';
import { useDependencies } from '../../DependenciesContext';

export const useRouteTemplatesQuery = () => {
    const { routeRepository } = useDependencies();

    return useQuery({
        queryKey: ['routeTemplates'],
        queryFn: async () => {
            const result = await routeRepository.getTemplates();
            if (result.isFailure) {
                throw new Error(result.error as string);
            }
            return result.getValue();
        },
    });
};
