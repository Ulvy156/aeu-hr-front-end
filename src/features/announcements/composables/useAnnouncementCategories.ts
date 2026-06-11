import { ref, reactive } from 'vue'
import { useNotify } from '@/composables/useNotify'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { fetchAnnouncementCategories } from '../services/announcement-category.api'
import type { AnnouncementCategory, PaginationMeta } from '../types/announcement-category'

export function useAnnouncementCategories() {
  const notify = useNotify()
  const categories = ref<AnnouncementCategory[]>([])
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

  async function loadCategories() {
    loading.value = true
    try {
      const params: Record<string, unknown> = {
        page: filters.page,
        per_page: filters.per_page,
      }
      if (filters.search) params.search = filters.search
      if (filters.status) params.status = filters.status

      const res = await fetchAnnouncementCategories(params)
      categories.value = res.data
      meta.value = res.meta
    } catch (err) {
      notify.error(getApiErrorMessage(err))
    } finally {
      loading.value = false
    }
  }

  function applyFilters(search: string, status: string) {
    filters.search = search
    filters.status = status
    filters.page = 1
    loadCategories()
  }

  function onPageChange(page: number) {
    filters.page = page
    loadCategories()
  }

  function onPageSizeChange(size: number) {
    filters.per_page = size
    filters.page = 1
    loadCategories()
  }

  return {
    categories,
    meta,
    loading,
    filters,
    loadCategories,
    applyFilters,
    onPageChange,
    onPageSizeChange,
  }
}
