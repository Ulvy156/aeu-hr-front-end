import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchPositions } from '../services/position.api'
import type { Position, PaginationMeta } from '../types/position'

export function usePositions() {
  const positions = ref<Position[]>([])
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
    status: '',
    page: 1,
    per_page: 15,
  })

  async function loadPositions() {
    loading.value = true
    try {
      const params: Record<string, unknown> = {
        page: filters.page,
        per_page: filters.per_page,
      }
      if (filters.search) params.search = filters.search
      if (filters.department_id) params.department_id = filters.department_id
      if (filters.status) params.status = filters.status

      const res = await fetchPositions(params)
      positions.value = res.data
      meta.value = res.meta
    } catch {
      ElMessage.error('Failed to load positions.')
    } finally {
      loading.value = false
    }
  }

  function applyFilters(search: string, departmentId: number | null, status: string) {
    filters.search = search
    filters.department_id = departmentId
    filters.status = status
    filters.page = 1
    loadPositions()
  }

  function onPageChange(page: number) {
    filters.page = page
    loadPositions()
  }

  function onPageSizeChange(size: number) {
    filters.per_page = size
    filters.page = 1
    loadPositions()
  }

  return {
    positions,
    meta,
    loading,
    filters,
    loadPositions,
    applyFilters,
    onPageChange,
    onPageSizeChange,
  }
}
