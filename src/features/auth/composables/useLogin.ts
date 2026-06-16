import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { login } from '@/features/auth/services/auth.api'
import { parseApiError } from '@/utils/api-error'

export function useLogin() {
  const router = useRouter()
  const route = useRoute()
  const authStore = useAuthStore()

  const formRef = ref<FormInstance>()
  const loading = ref(false)

  const form = reactive({
    email: '',
    password: '',
  })

  const apiErrors = reactive<Record<string, string>>({
    email: '',
    password: '',
  })

  const rules: FormRules = {
    email: [
      { required: true, message: 'Email is required', trigger: 'blur' },
      { type: 'email', message: 'Enter a valid email address', trigger: 'blur' },
    ],
    password: [
      { required: true, message: 'Password is required', trigger: 'blur' },
    ],
  }

  function clearApiErrors() {
    apiErrors.email = ''
    apiErrors.password = ''
  }

  async function handleSubmit() {
    const valid = await formRef.value?.validate().catch(() => false)
    if (!valid) return

    loading.value = true
    clearApiErrors()

    try {
      const data = await login({ email: form.email, password: form.password })
      authStore.setToken(data.token)
      authStore.setUser(data.user)
      const redirect = route.query.redirect as string | undefined
      router.push(redirect || { name: 'dashboard' })
    } catch (err) {
      const { errors, message } = parseApiError(err)
      apiErrors.email = errors.email?.[0] ?? (Object.keys(errors).length === 0 ? message : '')
    } finally {
      loading.value = false
    }
  }

  return { formRef, loading, form, apiErrors, rules, handleSubmit }
}
