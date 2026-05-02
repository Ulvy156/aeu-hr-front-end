<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { createEmployee, updateEmployee } from '../services/employee.api'
import type { Employee, DeptOption, PositionOption } from '../types/employee'
import { usePermission } from '@/composables/usePermissions'

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
const formRef = ref<FormInstance>()
const uploadRef = ref()
const submitting = ref(false)
const photoFile = ref<File | null>(null)
const isEdit = computed(() => props.employee !== null)

const filteredPositions = computed(() => {
  if (!form.department_id) return props.positions
  return props.positions.filter((p) => p.department_id === form.department_id)
})

const form = reactive({
  full_name: '',
  email: '',
  password: '',
  gender: '' as 'male' | 'female' | 'other' | '',
  date_of_birth: null as string | null,
  phone_number: '',
  address: '',
  department_id: null as number | null,
  position_id: null as number | null,
  join_date: null as string | null,
  last_working_date: null as string | null,
  base_salary: '',
  employment_status: 'active' as 'active' | 'resigned' | 'terminated',
  emergency_contact: '',
})

const rules: FormRules = {
  full_name: [{ required: true, message: 'Full name is required', trigger: 'blur' }],
  email: [
    { required: true, message: 'Email is required', trigger: 'blur' },
    { type: 'email', message: 'Enter a valid email', trigger: 'blur' },
  ],
  password: [{ min: 8, message: 'Password must be at least 8 characters', trigger: 'blur' }],
  join_date: [{ required: true, message: 'Join date is required', trigger: 'change' }],
  employment_status: [{ required: true, message: 'Employment status is required', trigger: 'change' }],
  base_salary: [{ required: true, message: 'Base salary is required', trigger: 'blur' }],
}

watch(() => props.employee, (emp) => {
  photoFile.value = null
  uploadRef.value?.clearFiles()
  if (emp) {
    form.full_name = emp.full_name
    form.email = emp.email
    form.password = ''
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
    form.emergency_contact = emp.emergency_contact ?? ''
  } else {
    resetForm()
  }
})

watch(() => props.visible, (v) => {
  if (!v) {
    photoFile.value = null
    uploadRef.value?.clearFiles()
    formRef.value?.clearValidate()
  }
})

watch(() => form.department_id, () => {
  const valid = filteredPositions.value.some((p) => p.id === form.position_id)
  if (!valid) form.position_id = null
})

watch(() => form.employment_status, (s) => {
  if (s === 'active') form.last_working_date = null
})

function resetForm() {
  form.full_name = ''; form.email = ''; form.password = ''
  form.gender = ''; form.date_of_birth = null; form.phone_number = ''; form.address = ''
  form.department_id = null; form.position_id = null; form.join_date = null
  form.last_working_date = null; form.base_salary = ''; form.employment_status = 'active'
  form.emergency_contact = ''
}

function onPhotoChange(file: { raw?: File }) {
  const rawFile = file.raw
  if (rawFile instanceof File) {
    photoFile.value = rawFile
  }
}

function buildFormData(): FormData {
  const fd = new FormData()
  fd.append('full_name', form.full_name)
  fd.append('email', form.email)
  if (!isEdit.value && form.password) fd.append('password', form.password)
  if (form.gender) fd.append('gender', form.gender)
  if (form.date_of_birth) fd.append('date_of_birth', form.date_of_birth)
  if (form.phone_number) fd.append('phone_number', form.phone_number)
  if (form.address) fd.append('address', form.address)
  if (form.department_id) fd.append('department_id', String(form.department_id))
  if (form.position_id) fd.append('position_id', String(form.position_id))
  if (form.join_date) fd.append('join_date', form.join_date)
  if (form.last_working_date) fd.append('last_working_date', form.last_working_date)
  fd.append('employment_status', form.employment_status)
  if (can('employees.update_salary') || !isEdit.value) fd.append('base_salary', form.base_salary)
  if (form.emergency_contact) fd.append('emergency_contact', form.emergency_contact)
  if (photoFile.value instanceof File) fd.append('profile_photo', photoFile.value)
  return fd
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  if (!isEdit.value && !form.password) { ElMessage.error('Password is required.'); return }
  if (['resigned', 'terminated'].includes(form.employment_status) && !form.last_working_date) {
    ElMessage.error('Last working date is required for resigned or terminated employees.')
    return
  }

  submitting.value = true
  try {
    const fd = buildFormData()
    if (isEdit.value && props.employee) {
      await updateEmployee(props.employee.id, fd)
      ElMessage.success('Employee updated successfully.')
    } else {
      await createEmployee(fd)
      ElMessage.success('Employee created successfully.')
    }
    emit('update:visible', false)
    emit('saved')
  } catch (err: unknown) {
    const msg = (err as any)?.response?.data?.message ?? 'Failed to save employee.'
    ElMessage.error(msg)
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
      <div v-if="isEdit && employee" class="flex items-center gap-2 mb-4 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
        <span class="text-xs text-slate-500">Employee ID</span>
        <span class="text-sm font-mono font-semibold text-slate-700">{{ employee.employee_id }}</span>
      </div>

      <div class="grid grid-cols-2 gap-x-4">
        <el-form-item label="Full Name" prop="full_name">
          <el-input v-model="form.full_name" placeholder="Full name" />
        </el-form-item>
        <el-form-item label="Email" prop="email">
          <el-input v-model="form.email" type="email" placeholder="email@example.com" />
        </el-form-item>
        <el-form-item v-if="!isEdit" label="Password" prop="password">
          <el-input v-model="form.password" type="password" placeholder="Min. 8 characters" show-password />
        </el-form-item>
        <el-form-item label="Gender">
          <el-select v-model="form.gender" placeholder="Select gender" class="w-full" clearable>
            <el-option label="Male" value="male" />
            <el-option label="Female" value="female" />
            <el-option label="Other" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="Date of Birth">
          <el-date-picker v-model="form.date_of_birth" type="date" placeholder="Select date" value-format="YYYY-MM-DD" class="w-full" />
        </el-form-item>
        <el-form-item label="Phone Number">
          <el-input v-model="form.phone_number" placeholder="Phone number" />
        </el-form-item>
        <el-form-item label="Emergency Contact">
          <el-input v-model="form.emergency_contact" placeholder="Name and phone" />
        </el-form-item>
      </div>
      <el-form-item label="Address">
        <el-input v-model="form.address" type="textarea" :rows="2" placeholder="Full address" />
      </el-form-item>

      <!-- Employment -->
      <p class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 mt-2">Employment</p>
      <div class="grid grid-cols-2 gap-x-4">
        <el-form-item label="Department">
          <el-select v-model="form.department_id" placeholder="No department" class="w-full" clearable>
            <el-option v-for="d in departments" :key="d.id" :label="d.name" :value="d.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="Position">
          <el-select v-model="form.position_id" placeholder="No position" class="w-full" clearable filterable>
            <el-option v-for="p in filteredPositions" :key="p.id" :label="p.name" :value="p.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="Employment Status" prop="employment_status">
          <el-select v-model="form.employment_status" class="w-full">
            <el-option label="Active" value="active" />
            <el-option label="Resigned" value="resigned" />
            <el-option label="Terminated" value="terminated" />
          </el-select>
        </el-form-item>
        <el-form-item label="Join Date" prop="join_date">
          <el-date-picker v-model="form.join_date" type="date" placeholder="Select date" value-format="YYYY-MM-DD" class="w-full" />
        </el-form-item>
        <el-form-item
          label="Last Working Date"
          :required="['resigned', 'terminated'].includes(form.employment_status)"
        >
          <el-date-picker
            v-model="form.last_working_date"
            type="date"
            placeholder="Select date"
            value-format="YYYY-MM-DD"
            class="w-full"
            :disabled="form.employment_status === 'active'"
          />
        </el-form-item>
        <el-form-item v-if="!isEdit || can('employees.update_salary')" label="Base Salary" prop="base_salary">
          <el-input v-model="form.base_salary" type="number" placeholder="0.00">
            <template #prepend>$</template>
          </el-input>
        </el-form-item>
      </div>

      <!-- Photo -->
      <el-form-item label="Profile Photo">
        <div v-if="isEdit && employee?.profile_photo_url && !photoFile" class="flex items-center gap-3 mb-2">
          <img
            :src="employee.profile_photo_url"
            class="w-14 h-14 rounded-full object-cover border border-gray-200"
          />
          <p class="text-xs text-slate-400">Current photo. Select a new file below to replace it.</p>
        </div>
        <el-upload
          ref="uploadRef"
          accept="image/jpeg,image/png,image/webp"
          :auto-upload="false"
          :show-file-list="true"
          :limit="1"
          :on-change="onPhotoChange"
        >
          <el-button size="small">{{ isEdit ? 'Replace Photo' : 'Select Photo' }}</el-button>
          <template #tip>
            <p class="text-xs text-slate-400 mt-1">JPG, PNG or WebP — max 2 MB</p>
          </template>
        </el-upload>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="flex justify-end gap-2">
        <el-button @click="emit('update:visible', false)">Cancel</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          {{ isEdit ? 'Save Changes' : 'Create Employee' }}
        </el-button>
      </div>
    </template>
  </el-drawer>
</template>
