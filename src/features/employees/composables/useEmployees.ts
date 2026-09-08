import { ref, reactive } from 'vue'
import { useNotify } from '@/composables/useNotify'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { fetchEmployees } from '../services/employee.api'
import {
  EMPTY_EMPLOYEE_STATUS_COUNTS,
  EMPLOYMENT_STATUS_VALUES,
  type Employee,
  type EmployeeStatusCounts,
  type PaginationMeta,
} from '../types/employee'
import type { JobLevel } from '@/features/positions/types/job-level'

export function useEmployees() {
  const notify = useNotify()
  const employees = ref<Employee[]>([])
  const statusCounts = ref<EmployeeStatusCounts>({ ...EMPTY_EMPLOYEE_STATUS_COUNTS })
  const meta = ref<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  })
  const loading = ref(false)

  const filters = reactive({
    search: '',
    department_id: null as number | null,
    position_id: null as number | null,
    job_level: '' as JobLevel | '',
    employment_status: '',
    page: 1,
    per_page: 15,
  })

  function listParams(overrides: Record<string, unknown> = {}): Record<string, unknown> {
    const params: Record<string, unknown> = {
      page: 1,
      per_page: 1,
      ...overrides,
    }
    if (filters.search) params.search = filters.search
    if (filters.department_id) params.department_id = filters.department_id
    if (filters.position_id) params.position_id = filters.position_id
    if (filters.job_level) params.job_level = filters.job_level
    return params
  }

  async function loadOverview() {
    const results = await Promise.all(
      EMPLOYMENT_STATUS_VALUES.map((status) =>
        fetchEmployees(listParams({ employment_status: status })),
      ),
    )

    const counts: EmployeeStatusCounts = { ...EMPTY_EMPLOYEE_STATUS_COUNTS }
    EMPLOYMENT_STATUS_VALUES.forEach((status, index) => {
      counts[status] = results[index]?.meta.total ?? 0
    })
    counts.active = counts['full-time'] + counts.probation + counts.intern
    counts.left = counts.resigned + counts.terminated
    counts.all = counts.active + counts.left
    statusCounts.value = counts
  }

  async function loadList() {
    const params: Record<string, unknown> = {
      page: filters.page,
      per_page: filters.per_page,
    }
    if (filters.search) params.search = filters.search
    if (filters.department_id) params.department_id = filters.department_id
    if (filters.position_id) params.position_id = filters.position_id
    if (filters.job_level) params.job_level = filters.job_level
    if (filters.employment_status) params.employment_status = filters.employment_status

    const res = await fetchEmployees(params)
    employees.value = res.data
    meta.value = res.meta
  }

  async function loadEmployees(includeOverview = true) {
    loading.value = true
    try {
      const tasks: Promise<void>[] = [loadList()]
      if (includeOverview) tasks.push(loadOverview())
      const results = await Promise.allSettled(tasks)
      const failed = results.find((result) => result.status === 'rejected')
      if (failed && failed.status === 'rejected') {
        notify.error(getApiErrorMessage(failed.reason))
      }
    } finally {
      loading.value = false
    }
  }

  function applyFilters(
    search: string,
    deptId: number | null,
    posId: number | null,
    jobLevel: JobLevel | '',
    status: string,
  ) {
    filters.search = search
    filters.department_id = deptId
    filters.position_id = posId
    filters.job_level = jobLevel
    filters.employment_status = status
    filters.page = 1
    loadEmployees()
  }

  function onPageChange(page: number) {
    filters.page = page
    loadEmployees(false)
  }

  function onPageSizeChange(size: number) {
    filters.per_page = size
    filters.page = 1
    loadEmployees(false)
  }

  return {
    employees,
    statusCounts,
    meta,
    loading,
    filters,
    loadEmployees,
    applyFilters,
    onPageChange,
    onPageSizeChange,
  }
}
