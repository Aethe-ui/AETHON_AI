import { create } from "zustand";

interface UIState {
  sidebarCollapsed: boolean;
  activeFilters: {
    severity: string[];
    status: string[];
  };
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setFilter: (key: "severity" | "status", values: string[]) => void;
  clearFilters: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  activeFilters: { severity: [], status: [] },
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setFilter: (key, values) =>
    set((state) => ({
      activeFilters: { ...state.activeFilters, [key]: values },
    })),
  clearFilters: () =>
    set({ activeFilters: { severity: [], status: [] } }),
}));
