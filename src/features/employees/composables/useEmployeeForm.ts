import { ref, reactive, computed, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useNotify } from '@/composables/useNotify'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { parseApiError, type ApiValidationErrors } from '@/utils/api-error'
import { usePermission } from '@/composables/usePermissions'
import { createEmployee, updateEmployee } from '../services/employee.api'
import { EMPLOYMENT_STATUS } from '../types/employee'
import type { Employee, DeptOption, PositionOption, EmploymentStatus } from '../types/employee'
import { fetchAvailableEmployeeUsers } from '@/features/users/services/user.api'
import type { UserListItem } from '@/features/users/types/user'

export function useEmployeeForm(
  getEmployee: () => Employee | null,
  getPositions: () => PositionOption[],
) {
  const { can } = usePermission()
  const notify = useNotify()
  const formRef = ref<FormInstance>()
  const submitting = ref(false)
  const userOptions = ref<UserListItem[]>([])
  const usersLoading = ref(false)
  const fieldErrors = ref<ApiValidationErrors>({})
  const isEdit = computed(() => getEmployee() !== null)

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

  const filteredPositions = computed(() => {
    const all = getPositions()
    if (!form.department_id) return all
    return all.filter((p) => p.department_id === form.department_id)
  })

  const selectedUserIsCeo = computed(() => {
    const emp = getEmployee()
    if (emp?.user?.roles?.includes('ceo')) return true
    const user = userOptions.value.find((u) => u.id === form.user_id)
    return user?.roles.includes('ceo') ?? false
  })

  function filterPhoneInput(value: string) {
    form.phone_number = value.replace(/\D/g, '')
  }

  const rules: FormRules = {
    user_id: [{ required: true, message: 'User account is required', trigger: 'change' }],
    full_name: [{ required: true, message: 'Full name is required', trigger: 'blur' }],
    phone_number: [
      { pattern: /^0\d{8,9}$/, message: 'Phone must start with 0 and be 9-10 digits', trigger: 'blur' },
    ],
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
          if (!selectedUserIsCeo.value && !value) {
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

  function populateForm(emp: Employee) {
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
    form.manager_id = emp.manager?.id ?? null
  }

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

  function buildFormData(photoFile: File | null, docFiles: File[], removedDocIndices: Set<number>): FormData {
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
    if (form.manager_id) fd.append('manager_id', String(form.manager_id))
    if (photoFile instanceof File) fd.append('profile_photo', photoFile)

    docFiles.forEach((file, i) => fd.append(`documents[${i}]`, file))
    if (isEdit.value && removedDocIndices.size > 0) {
      const sorted = [...removedDocIndices].sort((a, b) => a - b)
      sorted.forEach((idx, i) => fd.append(`remove_documents[${i}]`, String(idx)))
    }

    return fd
  }

  async function handleSubmit(
    photoFile: File | null,
    docFiles: File[],
    removedDocIndices: Set<number>,
    onSuccess: () => void,
  ) {
    fieldErrors.value = {}
    const valid = await formRef.value?.validate().catch(() => false)
    if (!valid) return
    if (
      ([EMPLOYMENT_STATUS.RESIGNED, EMPLOYMENT_STATUS.TERMINATED] as EmploymentStatus[]).includes(form.employment_status)
      && !form.last_working_date
    ) {
      notify.error('Last working date is required for resigned or terminated employees.')
      return
    }
    submitting.value = true
    try {
      const fd = buildFormData(photoFile, docFiles, removedDocIndices)
      const emp = getEmployee()
      if (isEdit.value && emp) {
        await updateEmployee(emp.id, fd)
        notify.success('Employee updated successfully.')
      } else {
        await createEmployee(fd)
        notify.success('Employee created successfully.')
      }
      onSuccess()
    } catch (err) {
      const parsed = parseApiError(err)
      fieldErrors.value = parsed.errors
      notify.error(getApiErrorMessage(err))
    } finally {
      submitting.value = false
    }
  }

  return {
    formRef,
    form,
    rules,
    submitting,
    fieldErrors,
    isEdit,
    userOptions,
    usersLoading,
    filteredPositions,
    selectedUserIsCeo,
    filterPhoneInput,
    loadAvailableUsers,
    populateForm,
    resetForm,
    handleSubmit,
  }
}
