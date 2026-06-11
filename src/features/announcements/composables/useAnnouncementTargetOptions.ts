import { ref } from 'vue'
import { fetchRoles } from '@/features/users/services/user.api'
import { fetchDepartments } from '@/features/departments/services/department.api'
import { fetchEmployees } from '@/features/employees/services/employee.api'
import type { Role } from '@/features/users/types/user'
import type { DeptOption, Employee } from '@/features/employees/types/employee'

export function useAnnouncementTargetOptions() {
  const roleOptions = ref<Role[]>([])
  const departmentOptions = ref<DeptOption[]>([])
  const employeeOptions = ref<Employee[]>([])
  const employeeSearchLoading = ref(false)

  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  async function loadRoleOptions() {
    try {
      const res = await fetchRoles()
      roleOptions.value = res.data
    } catch {
      roleOptions.value = []
    }
  }

  async function loadDepartmentOptions() {
    try {
      const res = await fetchDepartments({ status: 'active', per_page: 100 })
      departmentOptions.value = res.data.map((d) => ({ id: d.id, name: d.name }))
    } catch {
      departmentOptions.value = []
    }
  }

  async function searchEmployeeOptions(query: string) {
    if (!query || query.length < 2) {
      employeeOptions.value = []
      return
    }
    employeeSearchLoading.value = true
    try {
      const res = await fetchEmployees({ search: query, per_page: 15 })
      employeeOptions.value = res.data
    } catch {
      employeeOptions.value = []
    } finally {
      employeeSearchLoading.value = false
    }
  }

  function onEmployeeSearch(query: string) {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => searchEmployeeOptions(query), 300)
  }

  function ensureEmployeeOption(employee: Employee) {
    if (!employeeOptions.value.some((e) => e.id === employee.id)) {
      employeeOptions.value = [employee, ...employeeOptions.value]
    }
  }

  return {
    roleOptions,
    departmentOptions,
    employeeOptions,
    employeeSearchLoading,
    loadRoleOptions,
    loadDepartmentOptions,
    onEmployeeSearch,
    ensureEmployeeOption,
  }
}
