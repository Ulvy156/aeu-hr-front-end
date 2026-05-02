import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchDepartments } from '../services/department.api'
import type { Department, PaginationMeta } from '../types/department'

export function useDepartments() {
  const departments = ref<Department[]>([])
  const meta = ref<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  })
  const loading = ref(false)

  const filters = reactive({
    search: '',
    status: '',
    page: 1,
    per_page: 15,
  })

  async function loadDepartments() {
    loading.value = true
    try {
      const params: Record<string, unknown> = {
        page: filters.page,
        per_page: filters.per_page,
      }
      if (filters.search) params.search = filters.search
      if (filters.status) params.status = filters.status

      const res = await fetchDepartments(params)
      departments.value = res.data
      meta.value = res.meta
    } catch {
      ElMessage.error('Failed to load departments.')
    } finally {
      loading.value = false
    }
  }

  function applyFilters(search: string, status: string) {
    filters.search = search
    filters.status = status
    filters.page = 1
    loadDepartments()
  }

  function onPageChange(page: number) {
    filters.page = page
    loadDepartments()
  }

  function onPageSizeChange(size: number) {
    filters.per_page = size
    filters.page = 1
    loadDepartments()
  }

  return {
    departments,
    meta,
    loading,
    filters,
    loadDepartments,
    applyFilters,
    onPageChange,
    onPageSizeChange,
  }
}
