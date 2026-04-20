import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,

setAuth: (token, user) => set({
  token,
  user,
  role: user?.role || 'student',
}),

      logout: () => {
        set({ token: null, user: null, isAuthenticated: false })
      },

      getToken: () => get().token,
      getUser: () => get().user,
    }),
    {
      name: 'erp-auth',
    }
  )
)