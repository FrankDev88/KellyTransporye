import { create } from 'zustand';

interface ChildrenState {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    isCreateDialogOpen: boolean;
    setIsCreateDialogOpen: (isOpen: boolean) => void;
}

export const useChildrenStore = create<ChildrenState>((set) => ({
    searchQuery: '',
    setSearchQuery: (query) => set({ searchQuery: query }),
    isCreateDialogOpen: false,
    setIsCreateDialogOpen: (isOpen) => set({ isCreateDialogOpen: isOpen }),
}));
