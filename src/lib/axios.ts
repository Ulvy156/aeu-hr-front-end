import axios from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

let accessToken: string | null = null

export function setAccessToken(token: string | null): void {
  accessToken = token
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null = null): void {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token!)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    // Don't try to refresh if the refresh call itself failed
    if (originalRequest.url === '/refresh') {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`
        return api(originalRequest)
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const { data } = await api.post('/refresh')
      const newToken = data.data.access_token as string

      accessToken = newToken

      const { useAuthStore } = await import('@/features/auth/stores/auth.store')
      const authStore = useAuthStore()
      authStore.setToken(newToken)

      originalRequest.headers.Authorization = `Bearer ${newToken}`
      processQueue(null, newToken)
      return api(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)
      accessToken = null

      const { useAuthStore } = await import('@/features/auth/stores/auth.store')
      const authStore = useAuthStore()
      authStore.clear()

      window.location.href = '/login'
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

export default api
