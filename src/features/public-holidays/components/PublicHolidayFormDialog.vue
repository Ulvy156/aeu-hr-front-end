<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { createPublicHoliday, updatePublicHoliday } from '../services/public-holiday.api'
import type { PublicHoliday, PublicHolidayForm } from '../types/public-holiday'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
const props = defineProps<{
  visible: boolean
  holiday: PublicHoliday | null
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  saved: []
}>()

const formRef = ref<FormInstance>()
const submitting = ref(false)
const isEdit = computed(() => props.holiday !== null)

const form = reactive<PublicHolidayForm>({
  holiday_date: '',
  name: '',
  description: '',
  status: 'active',
})

const rules: FormRules = {
  holiday_date: [{ required: true, message: 'Holiday date is required', trigger: 'change' }],
  name: [
    { required: true, message: 'Holiday name is required', trigger: 'blur' },
    { max: 255, message: 'Name must be 255 characters or less', trigger: 'blur' },
  ],
  status: [{ required: true, message: 'Status is required', trigger: 'change' }],
}

watch(
  () => props.holiday,
  (h) => {
    if (h) {
      form.holiday_date = h.holiday_date
      form.name = h.name
      form.description = h.description ?? ''
      form.status = h.status
    } else {
      form.holiday_date = ''
      form.name = ''
      form.description = ''
      form.status = 'active'
    }
  },
)

watch(
  () => props.visible,
  (v) => { if (!v) formRef.value?.clearValidate() },
)

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    if (isEdit.value && props.holiday) {
      await updatePublicHoliday(props.holiday.id, { ...form })
      ElMessage.success('Public holiday updated successfully.')
    } else {
      await createPublicHoliday({ ...form })
      ElMessage.success('Public holiday created successfully.')
    }
    emit('update:visible', false)
    emit('saved')
  } catch (err: unknown) {
    const msg = (err as any)?.response?.data?.message ?? 'Failed to save public holiday.'
    ElMessage.error(msg)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <BaseModal
    :model-value="visible"
    :title="isEdit ? 'Edit Public Holiday' : 'Add Public Holiday'"
    width="480px"
    :close-on-click-modal="false"
    @update:model-value="emit('update:visible', $event)"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
      <el-form-item label="Holiday Date" prop="holiday_date">
        <el-date-picker
          v-model="form.holiday_date"
          type="date"
          placeholder="Select date"
          format="MMM DD, YYYY"
          value-format="YYYY-MM-DD"
          class="w-full!"
        />
      </el-form-item>

      <el-form-item label="Holiday Name" prop="name">
        <BaseInput v-model="form.name" placeholder="e.g. Khmer New Year" />
      </el-form-item>

      <el-form-item label="Description" prop="description">
        <BaseInput
          v-model="form.description"
          type="textarea"
          :rows="2"
          placeholder="Optional description"
        />
      </el-form-item>

      <el-form-item label="Status" prop="status">
        <el-select v-model="form.status" class="w-full!">
          <el-option label="Active" value="active" />
          <el-option label="Inactive" value="inactive" />
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="flex justify-end gap-2">
        <BaseButton @click="emit('update:visible', false)">Cancel</BaseButton>
        <BaseButton
          type="primary"
          :loading="submitting"
          class="bg-emerald-600! border-emerald-600! hover:bg-emerald-700! hover:border-emerald-700!"
          @click="handleSubmit"
        >
          {{ isEdit ? 'Save Changes' : 'Add Holiday' }}
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
