<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useNotify } from '@/composables/useNotify'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { parseApiError, getFieldError, type ApiValidationErrors } from '@/utils/api-error'
import { createEmployee, updateEmployee } from '../services/employee.api'
import { EMPLOYMENT_STATUS, EMPLOYMENT_STATUS_OPTIONS } from '../types/employee'
import type { Employee, DeptOption, PositionOption, EmploymentStatus } from '../types/employee'
import { usePermission } from '@/composables/usePermissions'
import { BaseInput, BaseSelect, StatusBadge, EmployeeSearchSelect } from '@/components/common'
import BaseButton from '@/components/common/BaseButton.vue'
import { fetchAvailableEmployeeUsers } from '@/features/users/services/user.api'
import type { UserListItem } from '@/features/users/types/user'

const props = defineProps<{
  visible: boolean
  employee: Employee | null
  departments: DeptOption[]
  positions: PositionOption[]
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  saved: []
}>()

const { can } = usePermission()
const notify = useNotify()
const formRef = ref<FormInstance>()
const uploadRef = ref()
const submitting = ref(false)
const photoFile = ref<File | null>(null)
const userOptions = ref<UserListItem[]>([])
const usersLoading = ref(false)
const fieldErrors = ref<ApiValidationErrors>({})
const isEdit = computed(() => props.employee !== null)

const filteredPositions = computed(() => {
  if (!form.department_id) return props.positions
  return props.positions.filter((p) => p.department_id === form.department_id)
})

const selectedUserIsCeo = computed(() => {
  const user = userOptions.value.find((u) => u.id === form.user_id)
  return user?.roles.includes('ceo') ?? false
})

const form = reactive({
  user_id: null as number | null,
  full_name: '',
  gender: '' as 'male' | 'female' | 'other' | '',
  date_of_birth: null as string | null,
  phone_number: '',
  address: '',
  department_id: null as number | null,
  position_id: null as number | null,
  join_date: null as string | null,
  last_working_date: null as string | null,
  base_salary: '',
  employment_status: EMPLOYMENT_STATUS.FULL_TIME as EmploymentStatus,
  probation_end_date: null as string | null,
  emergency_contact: '',
  manager_id: null as number | null,
})

const genderOptions: { label: string; value: 'male' | 'female' | 'other' }[] = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
]

const rules: FormRules = {
  user_id: [{ required: true, message: 'User account is required', trigger: 'change' }],
  full_name: [{ required: true, message: 'Full name is required', trigger: 'blur' }],
  join_date: [{ required: true, message: 'Join date is required', trigger: 'change' }],
  employment_status: [{ required: true, message: 'Employment status is required', trigger: 'change' }],
  base_salary: [{ required: true, message: 'Base salary is required', trigger: 'blur' }],
  probation_end_date: [
    {
      validator: (_rule, value: string | null, callback: (error?: Error) => void) => {
        if (value && form.join_date && value < form.join_date) {
          callback(new Error('Probation end date must be on or after the join date'))
          return
        }
        callback()
      },
      trigger: 'change',
    },
  ],
  manager_id: [
    {
      validator: (_rule, value: number | null, callback: (error?: Error) => void) => {
        if (!isEdit.value && !selectedUserIsCeo.value && !value) {
          callback(new Error('A manager is required for this employee.'))
          return
        }
        callback()
      },
      trigger: 'change',
    },
  ],
}

async function loadAvailableUsers() {
  usersLoading.value = true
  try {
    const res = await fetchAvailableEmployeeUsers()
    userOptions.value = res.data
  } catch (err) {
    notify.error(getApiErrorMessage(err))
  } finally {
    usersLoading.value = false
  }
}

watch(() => props.employee, (emp) => {
  photoFile.value = null
  uploadRef.value?.clearFiles()
  if (emp) {
    form.user_id = null
    form.full_name = emp.full_name
    form.gender = emp.gender ?? ''
    form.date_of_birth = emp.date_of_birth
    form.phone_number = emp.phone_number ?? ''
    form.address = emp.address ?? ''
    form.department_id = emp.department?.id ?? null
    form.position_id = emp.position?.id ?? null
    form.join_date = emp.join_date
    form.last_working_date = emp.last_working_date
    form.base_salary = emp.base_salary
    form.employment_status = emp.employment_status
    form.probation_end_date = emp.probation_end_date
    form.emergency_contact = emp.emergency_contact ?? ''
  } else {
    resetForm()
  }
})

watch(() => props.visible, (v) => {
  if (v && !isEdit.value) {
    loadAvailableUsers()
  }
  if (!v) {
    photoFile.value = null
    uploadRef.value?.clearFiles()
    formRef.value?.clearValidate()
    fieldErrors.value = {}
  }
})

watch(() => form.department_id, () => {
  const valid = filteredPositions.value.some((p) => p.id === form.position_id)
  if (!valid) form.position_id = null
})

watch(() => form.employment_status, (s) => {
  if (s === EMPLOYMENT_STATUS.FULL_TIME || s === EMPLOYMENT_STATUS.PROBATION) form.last_working_date = null
  if (s !== EMPLOYMENT_STATUS.PROBATION) form.probation_end_date = null
})

watch(() => form.user_id, () => {
  if (selectedUserIsCeo.value) form.manager_id = null
  formRef.value?.clearValidate('manager_id')
})

function resetForm() {
  form.user_id = null
  form.full_name = ''
  form.gender = ''; form.date_of_birth = null; form.phone_number = ''; form.address = ''
  form.department_id = null; form.position_id = null; form.join_date = null
  form.last_working_date = null; form.base_salary = ''; form.employment_status = EMPLOYMENT_STATUS.FULL_TIME
  form.probation_end_date = null
  form.emergency_contact = ''
  form.manager_id = null
}

function onPhotoChange(file: { raw?: File }) {
  if (file.raw instanceof File) photoFile.value = file.raw
}

function buildFormData(): FormData {
  const fd = new FormData()
  if (!isEdit.value && form.user_id) fd.append('user_id', String(form.user_id))
  fd.append('full_name', form.full_name)
  if (form.gender) fd.append('gender', form.gender)
  if (form.date_of_birth) fd.append('date_of_birth', form.date_of_birth)
  if (form.phone_number) fd.append('phone_number', form.phone_number)
  if (form.address) fd.append('address', form.address)
  if (form.department_id) fd.append('department_id', String(form.department_id))
  if (form.position_id) fd.append('position_id', String(form.position_id))
  if (form.join_date) fd.append('join_date', form.join_date)
  if (form.last_working_date) fd.append('last_working_date', form.last_working_date)
  fd.append('employment_status', form.employment_status)
  if (form.employment_status === EMPLOYMENT_STATUS.PROBATION && form.probation_end_date) {
    fd.append('probation_end_date', form.probation_end_date)
  }
  if (can('employees.update_salary') || !isEdit.value) fd.append('base_salary', form.base_salary)
  if (form.emergency_contact) fd.append('emergency_contact', form.emergency_contact)
  if (!isEdit.value && form.manager_id) fd.append('manager_id', String(form.manager_id))
  if (photoFile.value instanceof File) fd.append('profile_photo', photoFile.value)
  return fd
}

async function handleSubmit() {
  fieldErrors.value = {}
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  if (([EMPLOYMENT_STATUS.RESIGNED, EMPLOYMENT_STATUS.TERMINATED] as EmploymentStatus[]).includes(form.employment_status) && !form.last_working_date) {
    notify.error('Last working date is required for resigned or terminated employees.')
    return
  }
  submitting.value = true
  try {
    const fd = buildFormData()
    if (isEdit.value && props.employee) {
      await updateEmployee(props.employee.id, fd)
      notify.success('Employee updated successfully.')
    } else {
      await createEmployee(fd)
      notify.success('Employee created successfully.')
    }
    emit('update:visible', false)
    emit('saved')
  } catch (err) {
    const parsed = parseApiError(err)
    fieldErrors.value = parsed.errors
    notify.error(getApiErrorMessage(err))
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <el-drawer
    :model-value="visible"
    :title="isEdit ? 'Edit Employee' : 'Create Employee'"
    direction="rtl"
    size="600px"
    :close-on-click-modal="false"
    @update:model-value="emit('update:visible', $event)"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
      <!-- Basic Info -->
      <p class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Basic Information</p>

      <!-- Edit: Employee ID badge -->
      <div v-if="isEdit && employee" class="flex items-center gap-2 mb-3 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
        <span class="text-xs text-slate-500">Employee ID</span>
        <span class="text-sm font-mono font-semibold text-slate-700">{{ employee.employee_id }}</span>
      </div>

      <!-- Edit: Linked user read-only -->
      <div v-if="isEdit && employee?.user" class="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <p class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Linked User Account</p>
        <div class="flex items-center gap-3">
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-slate-800 truncate">{{ employee.user.name }}</p>
            <p class="text-xs text-slate-500 truncate">{{ employee.user.email }}</p>
          </div>
          <StatusBadge :status="employee.user.status" />
        </div>
      </div>

      <!-- Create: User Account selector -->
      <el-form-item v-if="!isEdit" label="User Account" prop="user_id">
        <el-select
          v-model="form.user_id"
          placeholder="Select user account"
          class="w-full"
          filterable
          :loading="usersLoading"
        >
          <template #empty>
            <div class="py-4 px-3 text-sm text-slate-500 text-center leading-relaxed">
              No available user accounts.<br />Create a user account first.
            </div>
          </template>
          <el-option
            v-for="u in userOptions"
            :key="u.id"
            :label="`${u.name} (${u.email})`"
            :value="u.id"
          />
        </el-select>
      </el-form-item>

      <div class="grid grid-cols-2 gap-x-4">
        <el-form-item label="Full Name" prop="full_name">
          <BaseInput v-model="form.full_name" placeholder="Full name" />
        </el-form-item>
        <el-form-item label="Gender">
          <BaseSelect v-model="form.gender" :options="genderOptions" placeholder="Select gender" clearable />
        </el-form-item>
        <el-form-item label="Date of Birth">
          <el-date-picker v-model="form.date_of_birth" type="date" placeholder="Select date" value-format="YYYY-MM-DD" class="w-full" />
        </el-form-item>
        <el-form-item label="Phone Number">
          <BaseInput v-model="form.phone_number" placeholder="Phone number" />
        </el-form-item>
        <el-form-item label="Emergency Contact">
          <BaseInput v-model="form.emergency_contact" placeholder="Name and phone" />
        </el-form-item>
      </div>
      <el-form-item label="Address">
        <BaseInput v-model="form.address" type="textarea" :rows="2" placeholder="Full address" />
      </el-form-item>

      <!-- Employment -->
      <p class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 mt-2">Employment</p>
      <div class="grid grid-cols-2 gap-x-4">
        <el-form-item label="Department">
          <BaseSelect
            v-model="form.department_id"
            :options="departments.map((d) => ({ label: d.name, value: d.id }))"
            placeholder="No department"
            clearable
          />
        </el-form-item>
        <el-form-item label="Position">
          <BaseSelect
            v-model="form.position_id"
            :options="filteredPositions.map((p) => ({ label: p.name, value: p.id }))"
            placeholder="No position"
            clearable
            filterable
          />
        </el-form-item>
        <el-form-item
          v-if="!isEdit && !selectedUserIsCeo"
          label="Manager"
          prop="manager_id"
          required
        >
          <EmployeeSearchSelect v-model="form.manager_id" placeholder="Search manager..." />
          <p v-if="getFieldError(fieldErrors, 'manager_id')" class="mt-1 text-xs text-red-500">
            {{ getFieldError(fieldErrors, 'manager_id') }}
          </p>
        </el-form-item>
        <div v-else-if="!isEdit" class="flex items-end pb-2">
          <p class="text-xs text-slate-400">
            The CEO sits at the top of the org chart and has no manager.
          </p>
        </div>
        <el-form-item label="Employment Status" prop="employment_status">
          <BaseSelect v-model="form.employment_status" :options="EMPLOYMENT_STATUS_OPTIONS" />
        </el-form-item>
        <el-form-item label="Join Date" prop="join_date">
          <el-date-picker v-model="form.join_date" type="date" placeholder="Select date" value-format="YYYY-MM-DD" class="w-full" />
        </el-form-item>
        <el-form-item
          label="Last Working Date"
          :required="([EMPLOYMENT_STATUS.RESIGNED, EMPLOYMENT_STATUS.TERMINATED] as EmploymentStatus[]).includes(form.employment_status)"
        >
          <el-date-picker
            v-model="form.last_working_date"
            type="date"
            placeholder="Select date"
            value-format="YYYY-MM-DD"
            class="w-full"
            :disabled="([EMPLOYMENT_STATUS.FULL_TIME, EMPLOYMENT_STATUS.PROBATION] as EmploymentStatus[]).includes(form.employment_status)"
          />
        </el-form-item>
        <el-form-item
          v-if="form.employment_status === EMPLOYMENT_STATUS.PROBATION"
          label="Probation End Date"
          prop="probation_end_date"
        >
          <el-date-picker
            v-model="form.probation_end_date"
            type="date"
            placeholder="Optional"
            value-format="YYYY-MM-DD"
            class="w-full"
          />
          <p class="mt-1 text-xs text-slate-400">
            Defaults to 3 months after join date if left blank.
          </p>
        </el-form-item>
        <el-form-item v-if="!isEdit || can('employees.update_salary')" label="Base Salary" prop="base_salary">
          <BaseInput v-model="form.base_salary" type="number" placeholder="0.00">
            <template #prepend>$</template>
          </BaseInput>
        </el-form-item>
      </div>

      <!-- Photo -->
      <el-form-item label="Profile Photo">
        <div v-if="isEdit && employee?.profile_photo_url && !photoFile" class="flex items-center gap-3 mb-2">
          <img :src="employee.profile_photo_url" class="w-14 h-14 rounded-full object-cover border border-gray-200" />
          <p class="text-xs text-slate-400">Current photo. Select a new file to replace it.</p>
        </div>
        <el-upload
          ref="uploadRef"
          accept="image/jpeg,image/png,image/webp"
          :auto-upload="false"
          :show-file-list="true"
          :limit="1"
          :on-change="onPhotoChange"
        >
          <BaseButton size="small">{{ isEdit ? 'Replace Photo' : 'Select Photo' }}</BaseButton>
          <template #tip>
            <p class="text-xs text-slate-400 mt-1">JPG, PNG or WebP — max 2 MB</p>
          </template>
        </el-upload>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="flex justify-end gap-2">
        <BaseButton @click="emit('update:visible', false)">Cancel</BaseButton>
        <BaseButton type="primary" :loading="submitting" @click="handleSubmit">
          {{ isEdit ? 'Save Changes' : 'Create Employee' }}
        </BaseButton>
      </div>
    </template>
  </el-drawer>
</template>
