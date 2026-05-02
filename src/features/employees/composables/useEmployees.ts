import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchEmployees } from '../services/employee.api'
import type { Employee, PaginationMeta } from '../types/employee'

export function useEmployees() {
  const employees = ref<Employee[]>([])
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
    employment_status: '',
    page: 1,
    per_page: 15,
  })

  async function loadEmployees() {
    loading.value = true
    try {
      const params: Record<string, unknown> = {
        page: filters.page,
        per_page: filters.per_page,
      }
      if (filters.search) params.search = filters.search
      if (filters.department_id) params.department_id = filters.department_id
      if (filters.position_id) params.position_id = filters.position_id
      if (filters.employment_status) params.employment_status = filters.employment_status

      const res = await fetchEmployees(params)
      employees.value = res.data
      meta.value = res.meta
    } catch {
      ElMessage.error('Failed to load employees.')
    } finally {
      loading.value = false
    }
  }

  function applyFilters(
    search: string,
    deptId: number | null,
    posId: number | null,
    status: string,
  ) {
    filters.search = search
    filters.department_id = deptId
    filters.position_id = posId
    filters.employment_status = status
    filters.page = 1
    loadEmployees()
  }

  function onPageChange(page: number) {
    filters.page = page
    loadEmployees()
  }

  function onPageSizeChange(size: number) {
    filters.per_page = size
    filters.page = 1
    loadEmployees()
  }

  return {
    employees,
    meta,
    loading,
    filters,
    loadEmployees,
    applyFilters,
    onPageChange,
    onPageSizeChange,
  }
}
