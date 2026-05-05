<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useNotify } from '@/composables/useNotify'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { resetUserPassword } from '../services/user.api'
import type { UserListItem } from '../types/user'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'

const props = defineProps<{
  visible: boolean
  user: UserListItem | null
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const notify = useNotify()
const formRef = ref<FormInstance>()
const submitting = ref(false)

const form = reactive({
  password: '',
  password_confirmation: '',
})

const rules: FormRules = {
  password: [
    { required: true, message: 'Password is required', trigger: 'blur' },
    { min: 8, message: 'Password must be at least 8 characters', trigger: 'blur' },
  ],
  password_confirmation: [
    { required: true, message: 'Please confirm the password', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        if (value !== form.password) {
          callback(new Error('Passwords do not match'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
}

watch(() => props.visible, (v) => {
  if (!v) resetForm()
})

function resetForm() {
  form.password = ''
  form.password_confirmation = ''
  formRef.value?.clearValidate()
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid || !props.user) return

  submitting.value = true
  try {
    await resetUserPassword(props.user.id, {
      password: form.password,
      password_confirmation: form.password_confirmation,
    })
    notify.success('Password has been reset. The user will need to log in again.')
    emit('update:visible', false)
  } catch (err) {
    notify.error(getApiErrorMessage(err))
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <BaseModal
    :model-value="visible"
    title="Reset Password"
    width="440px"
    :close-on-click-modal="false"
    @update:model-value="emit('update:visible', $event)"
  >
    <div v-if="user" class="mb-4 rounded-lg border border-amber-100 bg-amber-50 p-3 text-sm text-amber-700">
      Resetting the password for <span class="font-semibold">{{ user.name }}</span> will log them out immediately.
      They must sign in again with the new password.
    </div>

    <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
      <el-form-item label="New Password" prop="password">
        <BaseInput
          v-model="form.password"
          type="password"
          placeholder="Minimum 8 characters"
          show-password
        />
      </el-form-item>

      <el-form-item label="Confirm Password" prop="password_confirmation">
        <BaseInput
          v-model="form.password_confirmation"
          type="password"
          placeholder="Re-enter new password"
          show-password
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="flex justify-end gap-2">
        <BaseButton @click="emit('update:visible', false)">Cancel</BaseButton>
        <BaseButton type="danger" :loading="submitting" @click="handleSubmit">
          Reset Password
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
