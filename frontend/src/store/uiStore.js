import { create } from 'zustand'

export const useUIStore = create((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
  activeModal: null,
  openModal:  (name) => set({ activeModal: name }),
  closeModal: ()     => set({ activeModal: null }),
}))