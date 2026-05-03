<script setup lang="ts">
import { ref, watch } from 'vue'
import { useNotify } from '@/composables/useNotify'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { assignUserRoles } from '../services/user.api'
import type { UserListItem, Role } from '../types/user'
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
const submitting = ref(false)
const selectedRole = ref('')

watch(() => props.user, (u) => {
  selectedRole.value = u?.roles[0] ?? ''
})

watch(() => props.visible, (v) => {
  if (!v) selectedRole.value = ''
})

async function handleSubmit() {
  if (!props.user) return
  submitting.value = true
  try {
    await assignUserRoles(props.user.id, { roles: selectedRole.value ? [selectedRole.value] : [] })
    notify.success('Roles updated successfully.')
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
    :title="user ? `Assign Role — ${user.name}` : 'Assign Role'"
    width="440px"
    :close-on-click-modal="false"
    @update:model-value="emit('update:visible', $event)"
  >
    <p class="text-sm text-slate-500 mb-4">
      Select the role to assign. The existing role will be replaced.
    </p>

    <el-form label-position="top">
      <el-form-item label="Role">
        <el-select
          v-model="selectedRole"
          placeholder="Select a role"
          class="w-full"
        >
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
          Save Roles
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
