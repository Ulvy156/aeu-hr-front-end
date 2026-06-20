import axios from 'axios'

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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      accessToken = null

      const { useAuthStore } = await import('@/features/auth/stores/auth.store')
      const authStore = useAuthStore()
      authStore.clear()

      window.location.href = '/login'
    }

    return Promise.reject(error)
  },
)

export default api
