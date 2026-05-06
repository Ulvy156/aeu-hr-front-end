import { ref } from 'vue'
import { fetchPublicHolidays } from '@/features/public-holidays/services/public-holiday.api'

export function usePublicHolidayDates() {
  const holidayDates = ref<Set<string>>(new Set())
  const loading = ref(false)

  async function loadHolidays() {
    loading.value = true
    try {
      const res = await fetchPublicHolidays({ status: 'active', per_page: 100 })
      holidayDates.value = new Set(res.data.map((h) => h.holiday_date))
    } catch {
      // fail silently — date picker will just not disable holidays
    } finally {
      loading.value = false
    }
  }

  return { holidayDates, loading, loadHolidays }
}
