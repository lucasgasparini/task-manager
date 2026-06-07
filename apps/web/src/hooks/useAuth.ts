import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '../store/auth.ts'
import { api } from '../lib/api.ts'

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth)
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data } = await api.post('/auth/login', { email, password })
      return data.data as { accessToken: string; user: { id: string; email: string } }
    },
    onSuccess: ({ accessToken, user }) => setAuth(accessToken, user),
  })
}

export function useRegister() {
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data } = await api.post('/auth/register', { email, password })
      return data.data
    },
  })
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout)
  return useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout')
    },
    onSettled: () => logout(),
  })
}
