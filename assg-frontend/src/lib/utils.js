import { create } from 'zustand'

export const useSidebarStore = create((set) => ({
  isOpen: typeof window !== 'undefined' ? window.innerWidth >= 1024 : false, // Open by default on desktop
  toggleSidebar: () => set((state) => ({ isOpen: !state.isOpen })),
  setSidebarOpen: (open) => set({ isOpen: open }),
}))