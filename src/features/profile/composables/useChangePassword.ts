import { ref, reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { changePassword } from '../services/profile.api'
import { parseApiError } from '@/utils/api-error'
import { useNotify } from '@/composables/useNotify'

export function useChangePassword() {
  const notify = useNotify()

  const formRef = ref<FormInstance>()
  const loading = ref(false)

  const form = reactive({
    current_password: '',
    password: '',
    password_confirmation: '',
  })

  const apiErrors = reactive<Record<string, string>>({
    current_password: '',
    password: '',
  })

  const validateConfirmation = (_rule: unknown, value: string, callback: (error?: Error) => void) => {
    if (value !== form.password) {
      callback(new Error('Passwords do not match'))
      return
    }
    callback()
  }

  const rules: FormRules = {
    current_password: [
      { required: true, message: 'Current password is required', trigger: 'blur' },
    ],
    password: [
      { required: true, message: 'New password is required', trigger: 'blur' },
      { min: 8, message: 'Password must be at least 8 characters', trigger: 'blur' },
    ],
    password_confirmation: [
      { required: true, message: 'Please confirm your new password', trigger: 'blur' },
      { validator: validateConfirmation, trigger: 'blur' },
    ],
  }

  function clearApiErrors() {
    apiErrors.current_password = ''
    apiErrors.password = ''
  }

  function resetForm() {
    form.current_password = ''
    form.password = ''
    form.password_confirmation = ''
    formRef.value?.clearValidate()
  }

  async function handleSubmit() {
    const valid = await formRef.value?.validate().catch(() => false)
    if (!valid) return

    loading.value = true
    clearApiErrors()

    try {
      await changePassword({
        current_password: form.current_password,
        password: form.password,
        password_confirmation: form.password_confirmation,
      })
      notify.success("Password changed successfully. You've been signed out of other devices.")
      resetForm()
    } catch (err) {
      const { errors } = parseApiError(err)
      apiErrors.current_password = errors.current_password?.[0] ?? ''
      apiErrors.password = errors.password?.[0] ?? ''
    } finally {
      loading.value = false
    }
  }

  return { formRef, loading, form, apiErrors, rules, handleSubmit }
}
