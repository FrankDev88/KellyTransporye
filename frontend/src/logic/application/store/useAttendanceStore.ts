import { create } from 'zustand';

interface AttendanceStore {
    // QR scan result (raw string from camera)
    scanResult: string | null;
    setScanResult: (v: string | null) => void;

    // Dialog visibility
    isManualCheckInOpen: boolean;
    setIsManualCheckInOpen: (v: boolean) => void;

    isManualCheckOutOpen: boolean;
    setIsManualCheckOutOpen: (v: boolean) => void;

    // Selected child for manual ops
    selectedChildId: string | null;
    setSelectedChildId: (id: string | null) => void;
}

export const useAttendanceStore = create<AttendanceStore>((set) => ({
    scanResult: null,
    setScanResult: (v) => set({ scanResult: v }),

    isManualCheckInOpen: false,
    setIsManualCheckInOpen: (v) => set({ isManualCheckInOpen: v }),

    isManualCheckOutOpen: false,
    setIsManualCheckOutOpen: (v) => set({ isManualCheckOutOpen: v }),

    selectedChildId: null,
    setSelectedChildId: (id) => set({ selectedChildId: id }),
}));
