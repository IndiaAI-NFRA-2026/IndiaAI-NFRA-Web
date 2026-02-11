'use client';

import { create } from 'zustand';

interface UIState {
  // Modal states
  isFilterModalOpen: boolean;
  isSettingsModalOpen: boolean;

  // Actions
  openFilterModal: () => void;
  closeFilterModal: () => void;
  toggleFilterModal: () => void;

  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  toggleSettingsModal: () => void;

  // Batch reset
  resetAllModals: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  // Initial state
  isFilterModalOpen: false,
  isSettingsModalOpen: false,

  // Filter Modal actions
  openFilterModal: () => set({ isFilterModalOpen: true }),
  closeFilterModal: () => set({ isFilterModalOpen: false }),
  toggleFilterModal: () => set((state) => ({ isFilterModalOpen: !state.isFilterModalOpen })),

  // Settings Modal actions
  openSettingsModal: () => set({ isSettingsModalOpen: true }),
  closeSettingsModal: () => set({ isSettingsModalOpen: false }),
  toggleSettingsModal: () => set((state) => ({ isSettingsModalOpen: !state.isSettingsModalOpen })),

  // Reset all modals
  resetAllModals: () =>
    set({
      isFilterModalOpen: false,
      isSettingsModalOpen: false,
    }),
}));
