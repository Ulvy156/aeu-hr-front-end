import { ElMessage } from 'element-plus'

type NotifyMessage = string

interface NotifyOptions {
  duration?: number
  showClose?: boolean
}

const defaultOptions: NotifyOptions = {
  duration: 3000,
  showClose: true,
}

export function useNotify() {
  const show = (
    type: 'success' | 'error' | 'warning' | 'info',
    message: NotifyMessage,
    options?: NotifyOptions,
  ) => {
    ElMessage({
      type,
      message,
      ...defaultOptions,
      ...options,
    })
  }

  return {
    success: (message: NotifyMessage, options?: NotifyOptions) =>
      show('success', message, options),

    error: (message: NotifyMessage, options?: NotifyOptions) =>
      show('error', message, options),

    warning: (message: NotifyMessage, options?: NotifyOptions) =>
      show('warning', message, options),

    info: (message: NotifyMessage, options?: NotifyOptions) =>
      show('info', message, options),
  }
}