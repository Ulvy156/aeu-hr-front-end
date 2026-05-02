import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchUsers } from '../services/user.api'
import type { UserListItem, PaginationMeta } from '../types/user'

export function useUsers() {
  const users = ref<UserListItem[]>([])
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

  async function loadUsers() {
    loading.value = true
    try {
      const params: Record<string, unknown> = {
        page: filters.page,
        per_page: filters.per_page,
      }
      if (filters.search) params.search = filters.search
      if (filters.status) params.status = filters.status

      const res = await fetchUsers(params)
      users.value = res.data
      meta.value = res.meta
    } catch {
      ElMessage.error('Failed to load users.')
    } finally {
      loading.value = false
    }
  }

  function applyFilters(search: string, status: string) {
    filters.search = search
    filters.status = status
    filters.page = 1
    loadUsers()
  }

  function onPageChange(page: number) {
    filters.page = page
    loadUsers()
  }

  function onPageSizeChange(size: number) {
    filters.per_page = size
    filters.page = 1
    loadUsers()
  }

  return {
    users,
    meta,
    loading,
    filters,
    loadUsers,
    applyFilters,
    onPageChange,
    onPageSizeChange,
  }
}
