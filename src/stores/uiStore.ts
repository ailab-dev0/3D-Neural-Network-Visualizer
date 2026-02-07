import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  sidebarTab: 'models' | 'layers' | 'settings' | 'compare';
  inspectorOpen: boolean;
  tooltipVisible: boolean;
  tooltipContent: string;
  tooltipPosition: { x: number; y: number };

  // Actions
  toggleSidebar: () => void;
  setSidebarTab: (tab: 'models' | 'layers' | 'settings' | 'compare') => void;
  toggleInspector: () => void;
  showTooltip: (content: string, x: number, y: number) => void;
  hideTooltip: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  sidebarTab: 'models',
  inspectorOpen: false,
  tooltipVisible: false,
  tooltipContent: '',
  tooltipPosition: { x: 0, y: 0 },

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarTab: (tab) => set({ sidebarTab: tab, sidebarOpen: true }),
  toggleInspector: () => set((s) => ({ inspectorOpen: !s.inspectorOpen })),
  showTooltip: (content, x, y) => set({ tooltipVisible: true, tooltipContent: content, tooltipPosition: { x, y } }),
  hideTooltip: () => set({ tooltipVisible: false }),
}));
