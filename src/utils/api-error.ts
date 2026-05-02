import type { AxiosError } from 'axios'

export interface ApiValidationErrors {
  [field: string]: string[]
}

interface ApiErrorResponse {
  message?: string
  errors?: ApiValidationErrors
}

export interface ApiErrorResult {
  message: string
  errors: ApiValidationErrors
}

const STATUS_MESSAGES: Record<number, string> = {
  403: 'You are not allowed to perform this action.',
  404: 'The requested resource was not found.',
  429: 'Too many requests. Please wait and try again.',
  500: 'A server error occurred. Please try again later.',
}

export function parseApiError(error: unknown): ApiErrorResult {
  const axiosError = error as AxiosError<ApiErrorResponse>
  const data = axiosError.response?.data
  const status = axiosError.response?.status

  if (status === 422 && data?.errors) {
    return {
      message: data.message ?? 'The given data was invalid.',
      errors: data.errors,
    }
  }

  const fallback = status ? (STATUS_MESSAGES[status] ?? 'Something went wrong. Please try again.') : 'Network error. Please check your connection.'

  return {
    message: data?.message ?? fallback,
    errors: {},
  }
}

export function getFieldError(errors: ApiValidationErrors, field: string): string | undefined {
  return errors[field]?.[0]
}
