import axios from 'axios'

type ApiErrorResponse = {
  success?: boolean
  message?: string
  errors?: Record<string, string[]> | string[] | null
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const data = error.response?.data
    

    if (data?.message) {
      return data.message
    }

    if (data?.errors && !Array.isArray(data.errors)) {
      const firstError = Object.values(data.errors)[0]
      if (Array.isArray(firstError) && firstError[0]) {
        return firstError[0]
      }
    }

    if (Array.isArray(data?.errors) && data.errors.length > 0) {
      const firstError = data.errors[0]
      if (typeof firstError === 'string') {
        return firstError
      }
    }
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return 'Something went wrong. Please try again.'
}
