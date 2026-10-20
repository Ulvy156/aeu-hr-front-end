import { ref } from 'vue'
import { useNotify } from '@/composables/useNotify'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { fetchAnnouncementTargetOptions } from '../services/announcement.api'
import type { AnnouncementTargetOptions } from '../services/announcement.api'

export function useAnnouncementTargetOptions() {
  const notify = useNotify()
  const roleOptions = ref<AnnouncementTargetOptions['roles']>([])
  const departmentOptions = ref<AnnouncementTargetOptions['departments']>([])
  const employeeOptions = ref<AnnouncementTargetOptions['employees']>([])
  const employeesLoading = ref(false)
  let searchVersion = 0

  async function loadOptions() {
    try {
      const { data } = await fetchAnnouncementTargetOptions()
      roleOptions.value = data.roles
      departmentOptions.value = data.departments
    } catch (error) {
      notify.error(getApiErrorMessage(error))
    }
  }

  async function loadEmployeeOptions(query = '', employeeIds: number[] = []) {
    const q = query.trim()
    const version = ++searchVersion
    if (q.length < 2 && employeeIds.length === 0) {
      employeeOptions.value = []
      employeesLoading.value = false
      return
    }
    employeesLoading.value = true
    try {
      const { data } = await fetchAnnouncementTargetOptions({
        q: q.length >= 2 ? q : undefined,
        employee_ids: q.length >= 2 ? undefined : employeeIds,
      })
      if (version !== searchVersion) return
      employeeOptions.value = [...new Map([
        ...employeeOptions.value.filter((employee) => employeeIds.includes(employee.id))
          .map((employee) => [employee.id, employee] as const),
        ...data.employees.map((employee) => [employee.id, employee] as const),
      ]).values()]
    } catch (error) {
      if (version === searchVersion) notify.error(getApiErrorMessage(error))
    } finally {
      if (version === searchVersion) employeesLoading.value = false
    }
  }

  return { roleOptions, departmentOptions, employeeOptions, employeesLoading, loadOptions, loadEmployeeOptions }
}
