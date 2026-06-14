<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useNotify } from '@/composables/useNotify'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { parseApiError } from '@/utils/api-error'
import { createUser } from '../services/user.api'
import type { Role, CreateUserPayload } from '../types/user'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import PasswordStrengthMeter from '@/components/common/PasswordStrengthMeter.vue'
import { strongPasswordRule } from '@/utils/passwordStrength'
const props = defineProps<{
  visible: boolean
  roles: Role[]
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  created: []
}>()

const notify = useNotify()
const formRef = ref<FormInstance>()
const submitting = ref(false)
const selectedRole = ref('')

const form = reactive<Omit<CreateUserPayload, 'roles'>>({
  name: '',
  email: '',
  password: '',
  status: 'active',
})

const apiErrors = reactive<Record<string, string>>({
  password: '',
})

const rules: FormRules = {
  name: [{ required: true, message: 'Name is required', trigger: 'blur' }],
  email: [
    { required: true, message: 'Email is required', trigger: 'blur' },
    { type: 'email', message: 'Enter a valid email address', trigger: 'blur' },
  ],
  password: [
    { required: true, message: 'Password is required', trigger: 'blur' },
    { min: 8, message: 'Password must be at least 8 characters', trigger: 'blur' },
    strongPasswordRule,
  ],
  status: [{ required: true, message: 'Status is required', trigger: 'change' }],
}

watch(() => props.visible, (v) => {
  if (!v) resetForm()
})

function resetForm() {
  form.name = ''
  form.email = ''
  form.password = ''
  form.status = 'active'
  selectedRole.value = ''
  apiErrors.password = ''
  formRef.value?.clearValidate()
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  if (!selectedRole.value) {
    notify.error('Please select a role.')
    return
  }

  submitting.value = true
  apiErrors.password = ''
  try {
    await createUser({ ...form, roles: [selectedRole.value] })
    notify.success('User created successfully.')
    emit('update:visible', false)
    emit('created')
  } catch (err) {
    const { errors } = parseApiError(err)
    if (errors.password?.[0]) {
      apiErrors.password = errors.password[0]
    } else {
      notify.error(getApiErrorMessage(err))
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <BaseModal
    :model-value="visible"
    title="Create User"
    width="480px"
    :close-on-click-modal="false"
    @update:model-value="emit('update:visible', $event)"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
      <el-form-item label="Name" prop="name">
        <BaseInput v-model="form.name" placeholder="Full name" />
      </el-form-item>

      <el-form-item label="Email" prop="email">
        <BaseInput v-model="form.email" type="email" placeholder="email@example.com" />
      </el-form-item>

      <el-form-item label="Password" prop="password">
        <BaseInput
          v-model="form.password"
          type="password"
          placeholder="Minimum 8 characters"
          show-password
          @input="apiErrors.password = ''"
        />
        <p v-if="apiErrors.password" class="mt-1 text-xs text-red-600">
          {{ apiErrors.password }}
        </p>
        <PasswordStrengthMeter :password="form.password" />
      </el-form-item>

      <el-form-item label="Status" prop="status">
        <el-select v-model="form.status" class="w-full">
          <el-option label="Active" value="active" />
          <el-option label="Inactive" value="inactive" />
        </el-select>
      </el-form-item>

      <el-form-item label="Role">
        <el-select v-model="selectedRole" placeholder="Select a role" class="w-full">
          <el-option
            v-for="role in roles"
            :key="role.id"
            :label="role.name"
            :value="role.name"
          />
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="flex justify-end gap-2">
        <BaseButton @click="emit('update:visible', false)">Cancel</BaseButton>
        <BaseButton type="primary" :loading="submitting" @click="handleSubmit">
          Create User
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
