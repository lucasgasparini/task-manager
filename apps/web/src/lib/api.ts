import axios from 'axios'
import { useAuthStore } from '../store/auth.ts'

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // send cookies for refresh token
})

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auto-refresh on 401
let isRefreshing = false
let refreshQueue: Array<(token: string) => void> = []

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true

      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push((token) => {
            original.headers.Authorization = `Bearer ${token}`
            resolve(api(original))
          })
        })
      }

      isRefreshing = true

      try {
        const { data } = await axios.post('/api/auth/refresh', {}, { withCredentials: true })
        const newToken = data.data.accessToken
        useAuthStore.getState().setAccessToken(newToken)
        refreshQueue.forEach((cb) => cb(newToken))
        refreshQueue = []
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      } catch {
        useAuthStore.getState().logout()
        return Promise.reject(error)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)
