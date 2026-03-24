import { useChildrenQuery } from '../queries/useChildrenQuery';
import { useChildrenStore } from '../store/useChildrenStore';

export const useFilteredChildren = () => {
    const { data: childrenList, isLoading, error } = useChildrenQuery();
    const { searchQuery } = useChildrenStore();

    const filteredChildren = childrenList?.filter((child) => {
        const searchLower = searchQuery.toLowerCase();

        const fullName = `${child.props.firstName} ${child.props.lastName}`.toLowerCase();
        const addressMatch = (child.props.homeAddress || "").toLowerCase().includes(searchLower);
        const parentMatch = (child.props.parentId || "").toLowerCase().includes(searchLower);
        const nameMatch = fullName.includes(searchLower);

        return nameMatch || addressMatch || parentMatch;
    });

    return {
        children: filteredChildren,
        isLoading,
        error,
        searchQuery,
    };
};
