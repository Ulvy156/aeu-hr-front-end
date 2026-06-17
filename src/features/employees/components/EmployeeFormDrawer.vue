<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { getFieldError } from '@/utils/api-error'
import { usePermission } from '@/composables/usePermissions'
import { EMPLOYMENT_STATUS, EMPLOYMENT_STATUS_OPTIONS } from '../types/employee'
import type { Employee, DeptOption, PositionOption, EmploymentStatus } from '../types/employee'
import { BaseInput, BaseSelect, StatusBadge, EmployeeSearchSelect } from '@/components/common'
import BaseButton from '@/components/common/BaseButton.vue'
import EmployeeDocumentUpload from './EmployeeDocumentUpload.vue'
import { useEmployeeForm } from '../composables/useEmployeeForm'

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
const uploadRef = ref()
const docUploadRef = ref<InstanceType<typeof EmployeeDocumentUpload>>()
const photoFile = ref<File | null>(null)

const {
  formRef, form, rules, submitting, fieldErrors, isEdit,
  userOptions, usersLoading, filteredPositions, selectedUserIsCeo,
  loadAvailableUsers, populateForm, resetForm, handleSubmit,
} = useEmployeeForm(
  () => props.employee,
  () => props.positions,
)

const existingDocs = computed(() => props.employee?.documents ?? [])

const genderOptions: { label: string; value: 'male' | 'female' | 'other' }[] = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
]

watch(() => props.employee, (emp) => {
  photoFile.value = null
  uploadRef.value?.clearFiles()
  docUploadRef.value?.reset()
  if (emp) {
    populateForm(emp)
  } else {
    resetForm()
  }
})

watch(() => props.visible, (v) => {
  if (v && !isEdit.value) loadAvailableUsers()
  if (!v) {
    photoFile.value = null
    uploadRef.value?.clearFiles()
    docUploadRef.value?.reset()
    formRef.value?.clearValidate()
    fieldErrors.value = {}
  }
})

function onPhotoChange(file: { raw?: File }) {
  if (file.raw instanceof File) photoFile.value = file.raw
}

function onSubmit() {
  const docState = docUploadRef.value
  handleSubmit(
    photoFile.value,
    docState?.newFiles ?? [],
    docState?.removedIndices ?? new Set(),
    () => {
      emit('update:visible', false)
      emit('saved')
    },
  )
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

      <div v-if="isEdit && employee" class="flex items-center gap-2 mb-3 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
        <span class="text-xs text-slate-500">Employee ID</span>
        <span class="text-sm font-mono font-semibold text-slate-700">{{ employee.employee_id }}</span>
      </div>

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

      <el-form-item v-if="!isEdit" label="User Account" prop="user_id">
        <el-select v-model="form.user_id" placeholder="Select user account" class="w-full" filterable :loading="usersLoading">
          <template #empty>
            <div class="py-4 px-3 text-sm text-slate-500 text-center leading-relaxed">
              No available user accounts.<br />Create a user account first.
            </div>
          </template>
          <el-option v-for="u in userOptions" :key="u.id" :label="`${u.name} (${u.email})`" :value="u.id" />
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
        <el-form-item v-if="!selectedUserIsCeo" label="Manager" prop="manager_id" required>
          <EmployeeSearchSelect v-model="form.manager_id" placeholder="Search manager..." />
          <p v-if="getFieldError(fieldErrors, 'manager_id')" class="mt-1 text-xs text-red-500">
            {{ getFieldError(fieldErrors, 'manager_id') }}
          </p>
        </el-form-item>
        <div v-else class="flex items-end pb-2">
          <p class="text-xs text-slate-400">The CEO sits at the top of the org chart and has no manager.</p>
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
        <el-form-item v-if="form.employment_status === EMPLOYMENT_STATUS.PROBATION" label="Probation End Date" prop="probation_end_date">
          <el-date-picker v-model="form.probation_end_date" type="date" placeholder="Optional" value-format="YYYY-MM-DD" class="w-full" />
          <p class="mt-1 text-xs text-slate-400">Defaults to 3 months after join date if left blank.</p>
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
        <el-upload ref="uploadRef" accept="image/jpeg,image/png,image/webp" :auto-upload="false" :show-file-list="true" :limit="1" :on-change="onPhotoChange">
          <BaseButton size="small">{{ isEdit ? 'Replace Photo' : 'Select Photo' }}</BaseButton>
          <template #tip>
            <p class="text-xs text-slate-400 mt-1">JPG, PNG or WebP — max 2 MB</p>
          </template>
        </el-upload>
      </el-form-item>

      <!-- Documents -->
      <EmployeeDocumentUpload ref="docUploadRef" :existing-docs="existingDocs" />
    </el-form>

    <template #footer>
      <div class="flex justify-end gap-2">
        <BaseButton @click="emit('update:visible', false)">Cancel</BaseButton>
        <BaseButton type="primary" :loading="submitting" @click="onSubmit">
          {{ isEdit ? 'Save Changes' : 'Create Employee' }}
        </BaseButton>
      </div>
    </template>
  </el-drawer>
</template>
