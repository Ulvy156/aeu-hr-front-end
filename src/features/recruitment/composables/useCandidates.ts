import { ref, reactive } from 'vue'
import { useNotify } from '@/composables/useNotify'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { fetchCandidates } from '../services/candidate.api'
import type { Candidate, PaginationMeta, CandidateSource, CandidateStatus } from '../types/candidate'

export function useCandidates(initialVacancy: number | null = null) {
  const notify = useNotify()
  const candidates = ref<Candidate[]>([])
  const meta = ref<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  })
  const loading = ref(false)

  const filters = reactive({
    search: '',
    vacancy: initialVacancy as number | null,
    source: '' as CandidateSource | '',
    status: '' as CandidateStatus | '',
    interview_date: '',
    page: 1,
    per_page: 15,
  })

  async function loadCandidates() {
    loading.value = true
    try {
      const params: Record<string, unknown> = {
        page: filters.page,
        per_page: filters.per_page,
      }
      if (filters.search) params.search = filters.search
      if (filters.vacancy) params.vacancy = filters.vacancy
      if (filters.source) params.source = filters.source
      if (filters.status) params.status = filters.status
      if (filters.interview_date) params.interview_date = filters.interview_date

      const res = await fetchCandidates(params)
      candidates.value = res.data
      meta.value = res.meta
    } catch (err) {
      notify.error(getApiErrorMessage(err))
    } finally {
      loading.value = false
    }
  }

  function applyFilters(
    search: string,
    vacancy: number | null,
    source: CandidateSource | '',
    status: CandidateStatus | '',
    interviewDate: string,
  ) {
    filters.search = search
    filters.vacancy = vacancy
    filters.source = source
    filters.status = status
    filters.interview_date = interviewDate
    filters.page = 1
    loadCandidates()
  }

  function onPageChange(page: number) {
    filters.page = page
    loadCandidates()
  }

  function onPageSizeChange(size: number) {
    filters.per_page = size
    filters.page = 1
    loadCandidates()
  }

  return {
    candidates,
    meta,
    loading,
    filters,
    loadCandidates,
    applyFilters,
    onPageChange,
    onPageSizeChange,
  }
}
