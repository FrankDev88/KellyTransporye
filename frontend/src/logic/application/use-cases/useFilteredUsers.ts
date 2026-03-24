import { useUsersQuery } from '../queries/useUsersQuery';
import { useUsersStore } from '../store/useUsersStore';

export const useFilteredUsers = () => {
    const { data: users, isLoading, error } = useUsersQuery();
    const { searchQuery } = useUsersStore();

    const filteredUsers = users?.filter((user) => {
        const searchLower = searchQuery.toLowerCase();
        const nameMatch = (user.props.fullName || "").toLowerCase().includes(searchLower);
        const emailMatch = (user.props.email || "").toLowerCase().includes(searchLower);
        return nameMatch || emailMatch;
    });

    return {
        users: filteredUsers,
        isLoading,
        error,
        searchQuery,
    };
};
