import { create } from 'zustand';

interface RoutesState {
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    isCreateTemplateOpen: boolean;
    setIsCreateTemplateOpen: (v: boolean) => void;
    isCreateTripOpen: boolean;
    setIsCreateTripOpen: (v: boolean) => void;
    isGenerateDailyOpen: boolean;
    setIsGenerateDailyOpen: (v: boolean) => void;
    selectedTemplateId: string | null;
    setSelectedTemplateId: (id: string | null) => void;
}

export const useRoutesStore = create<RoutesState>((set) => ({
    searchQuery: '',
    setSearchQuery: (q) => set({ searchQuery: q }),
    isCreateTemplateOpen: false,
    setIsCreateTemplateOpen: (v) => set({ isCreateTemplateOpen: v }),
    isCreateTripOpen: false,
    setIsCreateTripOpen: (v) => set({ isCreateTripOpen: v }),
    isGenerateDailyOpen: false,
    setIsGenerateDailyOpen: (v) => set({ isGenerateDailyOpen: v }),
    selectedTemplateId: null,
    setSelectedTemplateId: (id) => set({ selectedTemplateId: id }),
}));
