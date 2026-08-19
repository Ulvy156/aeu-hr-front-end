<script setup lang="ts">
import { ref, watch } from 'vue'
import { useNotify } from '@/composables/useNotify'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { updatePermissionDescription } from '../services/user.api'
import type { Permission } from '../types/user'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'

const props = defineProps<{
  visible: boolean
  permission: Permission | null
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  updated: [permission: Permission]
}>()

const notify = useNotify()
const submitting = ref(false)
const description = ref('')

watch(() => props.permission, (p) => {
  description.value = p?.description ?? ''
})

async function handleSubmit() {
  if (!props.permission) return
  submitting.value = true
  try {
    const res = await updatePermissionDescription(props.permission.id, {
      description: description.value.trim() || null,
    })
    notify.success('Permission description updated successfully.')
    emit('updated', res.data)
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
    :title="permission ? `Edit Description — ${permission.name}` : 'Edit Description'"
    width="480px"
    :loading="submitting"
    @update:model-value="emit('update:visible', $event)"
  >
    <el-form label-position="top">
      <el-form-item label="Description">
        <el-input
          v-model="description"
          type="textarea"
          :rows="3"
          maxlength="500"
          show-word-limit
          placeholder="Describe what this permission allows..."
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="flex justify-end gap-2">
        <BaseButton :disabled="submitting" @click="emit('update:visible', false)">Cancel</BaseButton>
        <BaseButton type="primary" :loading="submitting" @click="handleSubmit">
          Save
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
