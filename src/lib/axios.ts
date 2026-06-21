import axios, { type InternalAxiosRequestConfig } from 'axios'

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

  config.headers['X-Screen-Resolution'] = `${screen.width}x${screen.height}`
  config.headers['X-Timezone'] = Intl.DateTimeFormat().resolvedOptions().timeZone
  config.headers['X-Platform'] = navigator.platform

  return config
})

let isRefreshing = false
let failedQueue: {
  resolve: (config: InternalAxiosRequestConfig) => void
  reject: (error: unknown) => void
  config: InternalAxiosRequestConfig
}[] = []

function processQueue(newToken: string | null): void {
  failedQueue.forEach(({ resolve, reject, config }) => {
    if (newToken) {
      config.headers.Authorization = `Bearer ${newToken}`
      resolve(config)
    } else {
      reject(new Error('Refresh failed'))
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    if (originalRequest.url === '/refresh') {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise<InternalAxiosRequestConfig>((resolve, reject) => {
        failedQueue.push({ resolve, reject, config: originalRequest })
      }).then((config) => api(config))
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const { refreshToken } = await import(
        '@/features/auth/services/auth.api'
      )
      const data = await refreshToken()

      accessToken = data.access_token

      const { useAuthStore } = await import('@/features/auth/stores/auth.store')
      useAuthStore().setToken(data.access_token)

      processQueue(data.access_token)

      originalRequest.headers.Authorization = `Bearer ${data.access_token}`
      return api(originalRequest)
    } catch {
      processQueue(null)
      accessToken = null

      const { useAuthStore } = await import('@/features/auth/stores/auth.store')
      useAuthStore().clear()
      window.location.href = '/login'

      return Promise.reject(error)
    } finally {
      isRefreshing = false
    }
  },
)

export default api
