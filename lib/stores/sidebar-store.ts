'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarState {
  isExpanded: boolean;
  isPinned: boolean;

  // Actions
  toggleSidebar: () => void;
  expandSidebar: () => void;
  collapseSidebar: () => void;
  togglePin: () => void;
  pinSidebar: () => void;
  unpinSidebar: () => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      // Initial state
      isExpanded: true,
      isPinned: false,

      // Toggle actions
      toggleSidebar: () => set((state) => ({ isExpanded: !state.isExpanded })),
      expandSidebar: () => set({ isExpanded: true }),
      collapseSidebar: () => set({ isExpanded: false }),

      // Pin actions
      togglePin: () => set((state) => ({ isPinned: !state.isPinned })),
      pinSidebar: () => set({ isPinned: true }),
      unpinSidebar: () => set({ isPinned: false }),
    }),
    {
      name: 'sidebar-storage', // localStorage key
      version: 1,
    }
  )
);
