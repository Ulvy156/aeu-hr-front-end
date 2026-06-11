import { ref } from 'vue'
import { fetchRoles } from '@/features/users/services/user.api'
import { fetchDepartments } from '@/features/departments/services/department.api'
import type { Role } from '@/features/users/types/user'
import type { DeptOption } from '@/features/employees/types/employee'

export function useAnnouncementTargetOptions() {
  const roleOptions = ref<Role[]>([])
  const departmentOptions = ref<DeptOption[]>([])

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

  return {
    roleOptions,
    departmentOptions,
    loadRoleOptions,
    loadDepartmentOptions,
  }
}
