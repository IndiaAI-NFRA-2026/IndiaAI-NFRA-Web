'use client';

import { useUIStore } from './ui-store';
import { useSidebarStore } from './sidebar-store';

// ============ UI Store Hooks ============

export const useFilterModal = () => {
  const isOpen = useUIStore((state) => state.isFilterModalOpen);
  const open = useUIStore((state) => state.openFilterModal);
  const close = useUIStore((state) => state.closeFilterModal);
  const toggle = useUIStore((state) => state.toggleFilterModal);

  return { isOpen, open, close, toggle };
};

export const useSettingsModal = () => {
  const isOpen = useUIStore((state) => state.isSettingsModalOpen);
  const open = useUIStore((state) => state.openSettingsModal);
  const close = useUIStore((state) => state.closeSettingsModal);
  const toggle = useUIStore((state) => state.toggleSettingsModal);

  return { isOpen, open, close, toggle };
};

export const useAllModals = () => {
  const state = useUIStore();
  return {
    filterModal: {
      isOpen: state.isFilterModalOpen,
      open: state.openFilterModal,
      close: state.closeFilterModal,
      toggle: state.toggleFilterModal,
    },
    settingsModal: {
      isOpen: state.isSettingsModalOpen,
      open: state.openSettingsModal,
      close: state.closeSettingsModal,
      toggle: state.toggleSettingsModal,
    },
    resetAll: state.resetAllModals,
  };
};

// ============ Sidebar Store Hooks ============

export const useSidebar = () => {
  const isExpanded = useSidebarStore((state) => state.isExpanded);
  const isPinned = useSidebarStore((state) => state.isPinned);
  const toggle = useSidebarStore((state) => state.toggleSidebar);
  const expand = useSidebarStore((state) => state.expandSidebar);
  const collapse = useSidebarStore((state) => state.collapseSidebar);
  const togglePin = useSidebarStore((state) => state.togglePin);
  const pin = useSidebarStore((state) => state.pinSidebar);
  const unpin = useSidebarStore((state) => state.unpinSidebar);

  return {
    isExpanded,
    isPinned,
    toggle,
    expand,
    collapse,
    togglePin,
    pin,
    unpin,
  };
};
