<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useNotify } from '@/composables/useNotify'
import { parseApiError, getFieldError, type ApiValidationErrors } from '@/utils/api-error'
import {
  createAnnouncementCategory,
  updateAnnouncementCategory,
} from '../services/announcement-category.api'
import type {
  AnnouncementCategory,
  AnnouncementCategoryPayload,
  AnnouncementCategoryStatus,
} from '../types/announcement-category'
import { BaseInput, BaseSelect } from '@/components/common'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'

const props = defineProps<{
  visible: boolean
  category: AnnouncementCategory | null
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  saved: []
}>()

const notify = useNotify()
const formRef = ref<FormInstance>()
const submitting = ref(false)
const fieldErrors = ref<ApiValidationErrors>({})
const isEdit = computed(() => props.category !== null)

const form = reactive<AnnouncementCategoryPayload>({
  name: '',
  description: null,
  status: 'active',
})

const statusOptions: { label: string; value: AnnouncementCategoryStatus }[] = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
]

const rules: FormRules = {
  name: [{ required: true, message: 'Category name is required', trigger: 'blur' }],
  status: [{ required: true, message: 'Status is required', trigger: 'change' }],
}

const description = computed({
  get: () => form.description ?? '',
  set: (value: string) => {
    form.description = value || null
  },
})

watch(
  () => props.category,
  (category) => {
    if (category) {
      form.name = category.name
      form.description = category.description
      form.status = category.status
    } else {
      form.name = ''
      form.description = null
      form.status = 'active'
    }
  },
)

watch(
  () => props.visible,
  (v) => {
    if (!v) {
      formRef.value?.clearValidate()
      fieldErrors.value = {}
    }
  },
)

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  fieldErrors.value = {}
  try {
    if (isEdit.value && props.category) {
      await updateAnnouncementCategory(props.category.id, { ...form })
      notify.success('Announcement category updated successfully.')
    } else {
      await createAnnouncementCategory({ ...form })
      notify.success('Announcement category created successfully.')
    }
    emit('update:visible', false)
    emit('saved')
  } catch (err) {
    const parsed = parseApiError(err)
    fieldErrors.value = parsed.errors
    notify.error(parsed.message)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <BaseModal
    :model-value="visible"
    :title="isEdit ? 'Edit Announcement Category' : 'Create Announcement Category'"
    width="480px"
    :close-on-click-modal="false"
    @update:model-value="emit('update:visible', $event)"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
      <el-form-item label="Category Name" prop="name">
        <BaseInput v-model="form.name" placeholder="e.g. General, HR Policy..." />
        <p v-if="getFieldError(fieldErrors, 'name')" class="mt-1 text-xs text-red-500">
          {{ getFieldError(fieldErrors, 'name') }}
        </p>
      </el-form-item>

      <el-form-item label="Description" prop="description">
        <BaseInput
          v-model="description"
          type="textarea"
          :rows="3"
          placeholder="Optional description..."
        />
        <p v-if="getFieldError(fieldErrors, 'description')" class="mt-1 text-xs text-red-500">
          {{ getFieldError(fieldErrors, 'description') }}
        </p>
      </el-form-item>

      <el-form-item label="Status" prop="status">
        <BaseSelect v-model="form.status" :options="statusOptions" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="flex justify-end gap-2">
        <BaseButton @click="emit('update:visible', false)">Cancel</BaseButton>
        <BaseButton type="primary" :loading="submitting" @click="handleSubmit">
          {{ isEdit ? 'Save Changes' : 'Create Category' }}
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
