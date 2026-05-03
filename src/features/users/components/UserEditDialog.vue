<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useNotify } from '@/composables/useNotify'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { updateUser } from '../services/user.api'
import type { UserListItem, UpdateUserPayload, Role } from '../types/user'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
const props = defineProps<{
  visible: boolean
  user: UserListItem | null
  roles: Role[]
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  updated: []
}>()

const notify = useNotify()
const formRef = ref<FormInstance>()
const submitting = ref(false)
const selectedRole = ref('')

const form = reactive<Omit<UpdateUserPayload, 'roles'>>({
  name: '',
  email: '',
  status: 'active',
})

const rules: FormRules = {
  name: [{ required: true, message: 'Name is required', trigger: 'blur' }],
  email: [
    { required: true, message: 'Email is required', trigger: 'blur' },
    { type: 'email', message: 'Enter a valid email address', trigger: 'blur' },
  ],
  status: [{ required: true, message: 'Status is required', trigger: 'change' }],
}

watch(() => props.user, (u) => {
  if (u) {
    form.name = u.name
    form.email = u.email
    form.status = u.status
    selectedRole.value = u.roles[0] ?? ''
  }
})

watch(() => props.visible, (v) => {
  if (!v) formRef.value?.clearValidate()
})

async function handleSubmit() {
  if (!props.user) return
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  if (!selectedRole.value) {
    notify.error('Please select a role.')
    return
  }

  submitting.value = true
  try {
    await updateUser(props.user.id, { ...form, roles: [selectedRole.value] })
    notify.success('User updated successfully.')
    emit('update:visible', false)
    emit('updated')
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
    title="Edit User"
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
          Save Changes
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
