import { create } from 'zustand';

interface UsersState {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    isCreateDialogOpen: boolean;
    setIsCreateDialogOpen: (isOpen: boolean) => void;
}

export const useUsersStore = create<UsersState>((set) => ({
    searchQuery: '',
    setSearchQuery: (query) => set({ searchQuery: query }),
    isCreateDialogOpen: false,
    setIsCreateDialogOpen: (isOpen) => set({ isCreateDialogOpen: isOpen }),
}));
