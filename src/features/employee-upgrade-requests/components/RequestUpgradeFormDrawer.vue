<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { Paperclip } from '@lucide/vue'
import { useNotify } from '@/composables/useNotify'
import { parseApiError, getFieldError, type ApiValidationErrors } from '@/utils/api-error'
import { BaseInput, BaseSelect, BaseButton, EmployeeSearchSelect } from '@/components/common'
import { createUpgradeRequest } from '../services/employee-upgrade-request.api'
import { EMPLOYMENT_STATUS, EMPLOYMENT_STATUS_OPTIONS } from '@/features/employees/types/employee'
import type { Employee, DeptOption, PositionOption, EmploymentStatus } from '@/features/employees/types/employee'
import type { UpgradeRequestValues } from '../types/employee-upgrade-request'

const props = defineProps<{
  visible: boolean
  employee: Employee | null
  departments: DeptOption[]
  positions: PositionOption[]
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  created: []
}>()

const notify = useNotify()
const submitting = ref(false)
const fieldErrors = ref<ApiValidationErrors>({})
const attachments = ref<File[]>([])
const uploadRef = ref()

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ACCEPTED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'doc', 'docx']

const form = reactive({
  department_id: null as number | null,
  position_id: null as number | null,
  base_salary: '',
  employment_status: '' as EmploymentStatus | '',
  last_working_date: null as string | null,
  manager_id: null as number | null,
  clear_manager: false,
  effective_date: null as string | null,
})

const requiresLastWorkingDate = computed(() =>
  form.employment_status === EMPLOYMENT_STATUS.RESIGNED || form.employment_status === EMPLOYMENT_STATUS.TERMINATED,
)

const filteredPositions = computed(() => {
  const departmentId = form.department_id ?? props.employee?.department?.id ?? null
  if (!departmentId) return props.positions
  return props.positions.filter((p) => p.department_id === departmentId)
})

watch(() => form.department_id, () => {
  if (form.position_id && !filteredPositions.value.some((p) => p.id === form.position_id)) {
    form.position_id = null
  }
})

watch(() => form.employment_status, (status) => {
  if (status !== EMPLOYMENT_STATUS.RESIGNED && status !== EMPLOYMENT_STATUS.TERMINATED) {
    form.last_working_date = null
  }
})

watch(() => form.clear_manager, (cleared) => {
  if (cleared) form.manager_id = null
})

watch(() => props.visible, (v) => {
  if (v) {
    resetForm()
  }
})

function resetForm() {
  form.department_id = null
  form.position_id = null
  form.base_salary = ''
  form.employment_status = ''
  form.last_working_date = null
  form.manager_id = null
  form.clear_manager = false
  form.effective_date = null
  attachments.value = []
  fieldErrors.value = {}
  uploadRef.value?.clearFiles()
}

function onFileChange(file: { raw?: File; name: string; size?: number }) {
  if (!(file.raw instanceof File)) return

  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (!ACCEPTED_EXTENSIONS.includes(ext)) {
    notify.error(`"${file.name}" has an unsupported file type.`)
    uploadRef.value?.handleRemove(file)
    return
  }
  if (file.raw.size > MAX_FILE_SIZE) {
    notify.error(`"${file.name}" exceeds the 5MB size limit.`)
    uploadRef.value?.handleRemove(file)
    return
  }

  attachments.value.push(file.raw)
}

function onFileRemove(file: { raw?: File; name: string }) {
  if (!(file.raw instanceof File)) return
  attachments.value = attachments.value.filter((f) => f !== file.raw)
}

function onExceed() {
  notify.error('You can attach up to 3 files.')
}

function buildProposedValues(): UpgradeRequestValues {
  const values: UpgradeRequestValues = {}
  if (form.department_id) values.department_id = form.department_id
  if (form.position_id) values.position_id = form.position_id
  if (form.base_salary !== '') values.base_salary = form.base_salary
  if (form.employment_status) {
    values.employment_status = form.employment_status
    if (requiresLastWorkingDate.value && form.last_working_date) {
      values.last_working_date = form.last_working_date
    }
  }
  if (form.clear_manager) {
    values.manager_id = null
  } else if (form.manager_id) {
    values.manager_id = form.manager_id
  }
  return values
}

async function handleSubmit() {
  if (!props.employee) return
  fieldErrors.value = {}

  const proposed_values = buildProposedValues()
  if (Object.keys(proposed_values).length === 0) {
    notify.error('Please change at least one field before submitting.')
    return
  }
  if (requiresLastWorkingDate.value && !form.last_working_date) {
    notify.error('Last working date is required for resigned or terminated status.')
    return
  }

  submitting.value = true
  try {
    await createUpgradeRequest({
      employee_id: props.employee.id,
      effective_date: form.effective_date,
      proposed_values,
      attachments: attachments.value,
    })
    notify.success('Upgrade request submitted for approval.')
    emit('update:visible', false)
    emit('created')
  } catch (err) {
    const parsed = parseApiError(err)
    fieldErrors.value = parsed.errors
    notify.error(parsed.message)
  } finally {
    submitting.value = false
  }
}

function handleClose() {
  if (!submitting.value) emit('update:visible', false)
}
</script>

<template>
  <el-drawer
    :model-value="visible"
    title="Request Promote"
    direction="rtl"
    size="560px"
    :close-on-click-modal="false"
    @update:model-value="handleClose"
  >
    <div v-if="employee" class="space-y-5">
      <!-- Employee + current values -->
      <div class="bg-gray-50 rounded-xl border border-gray-100 p-4 space-y-2">
        <div>
          <p class="text-sm font-semibold text-slate-900">{{ employee.full_name }}</p>
          <p class="text-xs text-slate-500 font-mono">{{ employee.employee_id }}</p>
        </div>
        <p class="text-xs font-semibold uppercase tracking-wider text-slate-400 pt-1">Current Values</p>
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div><span class="text-slate-500">Department:</span> <span class="text-slate-800">{{ employee.department?.name ?? '—' }}</span></div>
          <div><span class="text-slate-500">Position:</span> <span class="text-slate-800">{{ employee.position?.name ?? '—' }}</span></div>
          <div><span class="text-slate-500">Base Salary:</span> <span class="text-slate-800">{{ employee.base_salary }}</span></div>
          <div><span class="text-slate-500">Status:</span> <span class="text-slate-800 capitalize">{{ employee.employment_status }}</span></div>
          <div><span class="text-slate-500">Manager:</span> <span class="text-slate-800">{{ employee.manager?.full_name ?? '—' }}</span></div>
        </div>
      </div>

      <p class="text-xs text-slate-400">
        Only fill in the fields you want to change. Leave the rest blank to keep their current value.
      </p>

      <el-form label-position="top">
        <div class="grid grid-cols-2 gap-x-4">
          <el-form-item label="Department">
            <BaseSelect
              v-model="form.department_id"
              :options="departments.map((d) => ({ label: d.name, value: d.id }))"
              placeholder="No change"
              clearable
            />
          </el-form-item>
          <el-form-item label="Position">
            <BaseSelect
              v-model="form.position_id"
              :options="filteredPositions.map((p) => ({ label: p.name, value: p.id }))"
              placeholder="No change"
              clearable
              filterable
            />
            <p v-if="getFieldError(fieldErrors, 'proposed_values.position_id')" class="mt-1 text-xs text-red-500">
              {{ getFieldError(fieldErrors, 'proposed_values.position_id') }}
            </p>
          </el-form-item>
          <el-form-item label="Base Salary">
            <BaseInput v-model="form.base_salary" type="number" placeholder="No change">
              <template #prepend>$</template>
            </BaseInput>
          </el-form-item>
          <el-form-item label="Employment Status">
            <BaseSelect
              v-model="form.employment_status"
              :options="EMPLOYMENT_STATUS_OPTIONS"
              placeholder="No change"
              clearable
            />
          </el-form-item>
          <el-form-item v-if="requiresLastWorkingDate" label="Last Working Date" required>
            <el-date-picker
              v-model="form.last_working_date"
              type="date"
              placeholder="Select date"
              value-format="YYYY-MM-DD"
              class="w-full"
            />
            <p v-if="getFieldError(fieldErrors, 'proposed_values.last_working_date')" class="mt-1 text-xs text-red-500">
              {{ getFieldError(fieldErrors, 'proposed_values.last_working_date') }}
            </p>
          </el-form-item>
          <el-form-item label="Effective Date">
            <el-date-picker
              v-model="form.effective_date"
              type="date"
              placeholder="Defaults to today"
              value-format="YYYY-MM-DD"
              class="w-full"
            />
          </el-form-item>
          <el-form-item label="Manager" class="col-span-2">
            <EmployeeSearchSelect
              v-model="form.manager_id"
              placeholder="No change"
              :disabled="form.clear_manager"
            />
            <el-checkbox v-model="form.clear_manager" class="mt-2">
              Clear manager (remove from reporting line)
            </el-checkbox>
            <p v-if="getFieldError(fieldErrors, 'proposed_values.manager_id')" class="mt-1 text-xs text-red-500">
              {{ getFieldError(fieldErrors, 'proposed_values.manager_id') }}
            </p>
          </el-form-item>
        </div>

        <p v-if="getFieldError(fieldErrors, 'proposed_values')" class="text-xs text-red-500 -mt-2 mb-3">
          {{ getFieldError(fieldErrors, 'proposed_values') }}
        </p>

        <!-- Attachments -->
        <el-form-item label="Attachments">
          <el-upload
            ref="uploadRef"
            multiple
            :auto-upload="false"
            :limit="3"
            accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
            :on-change="onFileChange"
            :on-remove="onFileRemove"
            :on-exceed="onExceed"
          >
            <BaseButton size="small">
              <template #icon><Paperclip class="w-4 h-4" /></template>
              Add Files
            </BaseButton>
            <template #tip>
              <p class="text-xs text-slate-400 mt-1">
                PDF, JPG, PNG, WebP, DOC or DOCX — up to 3 files, max 5MB each.
              </p>
            </template>
          </el-upload>
          <p v-if="getFieldError(fieldErrors, 'attachments')" class="mt-1 text-xs text-red-500">
            {{ getFieldError(fieldErrors, 'attachments') }}
          </p>
          <p v-if="getFieldError(fieldErrors, 'attachments.0')" class="mt-1 text-xs text-red-500">
            {{ getFieldError(fieldErrors, 'attachments.0') }}
          </p>
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <BaseButton :disabled="submitting" @click="handleClose">Cancel</BaseButton>
        <BaseButton type="primary" :loading="submitting" @click="handleSubmit">
          Submit Request
        </BaseButton>
      </div>
    </template>
  </el-drawer>
</template>
