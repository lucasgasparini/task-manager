import { create } from 'zustand'

interface User {
  id: string
  email: string
}

interface AuthState {
  accessToken: string | null
  user: User | null
  setAuth: (token: string, user: User) => void
  setAccessToken: (token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  setAuth: (accessToken, user) => set({ accessToken, user }),
  setAccessToken: (accessToken) => set({ accessToken }),
  logout: () => set({ accessToken: null, user: null }),
}))
