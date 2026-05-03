
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
  const success = (message: NotifyMessage, options?: NotifyOptions) => {
    ElMessage.success({
      message,
      ...defaultOptions,
      ...options,
    })
  }

  const error = (message: NotifyMessage, options?: NotifyOptions) => {
    ElMessage.error({
      message,
      ...defaultOptions,
      ...options,
    })
  }

  const warning = (message: NotifyMessage, options?: NotifyOptions) => {
    ElMessage.warning({
      message,
      ...defaultOptions,
      ...options,
    })
  }

  const info = (message: NotifyMessage, options?: NotifyOptions) => {
    ElMessage.info({
      message,
      ...defaultOptions,
      ...options,
    })
  }

  return {
    success,
    error,
    warning,
    info,
  }
}