<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useNotify } from '@/composables/useNotify'
import { parseApiError, getFieldError, type ApiValidationErrors } from '@/utils/api-error'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { fetchDepartments } from '@/features/departments/services/department.api'
import { createVacancy, updateVacancy } from '../services/vacancy.api'
import type { Vacancy, VacancyPayload } from '../types/vacancy'
import { BaseInput, BaseButton, BaseModal, BaseSelect, StatusBadge, RichTextEditor } from '@/components/common'

const props = defineProps<{
  visible: boolean
  vacancy: Vacancy | null
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  saved: []
}>()

const notify = useNotify()
const formRef = ref<FormInstance>()
const submitting = ref(false)
const fieldErrors = ref<ApiValidationErrors>({})
const isEdit = computed(() => props.vacancy !== null)

const departmentOptions = ref<{ id: number; name: string }[]>([])

const form = reactive<VacancyPayload>({
  title: '',
  department_id: null,
  description: '',
  required_headcount: 1,
  target_hiring_date: '',
})

const rules: FormRules = {
  title: [
    { required: true, message: 'Title is required', trigger: 'blur' },
    { max: 255, message: 'Title must be at most 255 characters', trigger: 'blur' },
  ],
  department_id: [{ required: true, message: 'Department is required', trigger: 'change' }],
  description: [{ required: true, message: 'Description is required', trigger: 'blur' }],
  required_headcount: [
    { required: true, message: 'Required headcount is required', trigger: 'blur' },
    { type: 'number', min: 1, message: 'Required headcount must be at least 1', trigger: 'blur' },
  ],
  target_hiring_date: [{ required: true, message: 'Target hiring date is required', trigger: 'change' }],
}

onMounted(async () => {
  try {
    const res = await fetchDepartments({ status: 'active', per_page: 100 })
    departmentOptions.value = res.data.map((d) => ({ id: d.id, name: d.name }))
  } catch (err) {
    notify.error(getApiErrorMessage(err))
  }
})

watch(
  () => props.vacancy,
  (vacancy) => {
    if (vacancy) {
      form.title = vacancy.title
      form.department_id = vacancy.department?.id ?? null
      form.description = vacancy.description
      form.required_headcount = vacancy.required_headcount
      form.target_hiring_date = vacancy.target_hiring_date
    } else {
      form.title = ''
      form.department_id = null
      form.description = ''
      form.required_headcount = 1
      form.target_hiring_date = ''
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
    if (isEdit.value && props.vacancy) {
      await updateVacancy(props.vacancy.id, { ...form })
      notify.success('Vacancy updated successfully.')
    } else {
      await createVacancy({ ...form })
      notify.success('Vacancy created successfully.')
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
    :title="isEdit ? 'Edit Vacancy' : 'Create Vacancy'"
    width="520px"
    :close-on-click-modal="false"
    @update:model-value="emit('update:visible', $event)"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
      <el-form-item label="Title" prop="title">
        <BaseInput v-model="form.title" placeholder="e.g. Backend Developer" maxlength="255" show-word-limit />
        <p v-if="getFieldError(fieldErrors, 'title')" class="mt-1 text-xs text-red-500">
          {{ getFieldError(fieldErrors, 'title') }}
        </p>
      </el-form-item>

      <el-form-item label="Department" prop="department_id">
        <BaseSelect
          v-model="form.department_id"
          :options="departmentOptions.map((opt) => ({ label: opt.name, value: opt.id }))"
          placeholder="Select department"
        />
        <p v-if="getFieldError(fieldErrors, 'department_id')" class="mt-1 text-xs text-red-500">
          {{ getFieldError(fieldErrors, 'department_id') }}
        </p>
      </el-form-item>

      <el-form-item label="Description" prop="description">
        <RichTextEditor v-model="form.description" placeholder="Describe the role and responsibilities" />
        <p v-if="getFieldError(fieldErrors, 'description')" class="mt-1 text-xs text-red-500">
          {{ getFieldError(fieldErrors, 'description') }}
        </p>
      </el-form-item>

      <el-form-item label="Required Headcount" prop="required_headcount">
        <el-input-number v-model="form.required_headcount" :min="1" class="w-full!" />
        <p v-if="getFieldError(fieldErrors, 'required_headcount')" class="mt-1 text-xs text-red-500">
          {{ getFieldError(fieldErrors, 'required_headcount') }}
        </p>
      </el-form-item>

      <el-form-item label="Target Hiring Date" prop="target_hiring_date">
        <el-date-picker
          v-model="form.target_hiring_date"
          type="date"
          placeholder="Select date"
          value-format="YYYY-MM-DD"
          class="w-full!"
        />
        <p v-if="getFieldError(fieldErrors, 'target_hiring_date')" class="mt-1 text-xs text-red-500">
          {{ getFieldError(fieldErrors, 'target_hiring_date') }}
        </p>
      </el-form-item>

      <div v-if="isEdit && vacancy" class="grid grid-cols-2 gap-3 pt-3 mt-1 border-t border-gray-100">
        <div>
          <p class="text-xs text-slate-400 mb-1">Status</p>
          <StatusBadge :status="vacancy.status" />
        </div>
        <div>
          <p class="text-xs text-slate-400 mb-1">Filled Headcount</p>
          <p class="text-sm font-medium text-slate-700">{{ vacancy.filled_headcount }} / {{ vacancy.required_headcount }}</p>
        </div>
      </div>
    </el-form>

    <template #footer>
      <div class="flex justify-end gap-2">
        <BaseButton @click="emit('update:visible', false)">Cancel</BaseButton>
        <BaseButton type="primary" :loading="submitting" @click="handleSubmit">
          {{ isEdit ? 'Save Changes' : 'Create Vacancy' }}
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
