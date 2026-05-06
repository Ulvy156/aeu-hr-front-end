import { ref, computed } from 'vue'
import { fetchAttendanceSummary } from '../services/attendance.api'
import type { AttendanceSummary } from '../types/attendance'

export function useAttendanceSummary() {
  const now = new Date()
  const month = ref(now.getMonth() + 1)
  const year = ref(now.getFullYear())

  const summary = ref<AttendanceSummary | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isCurrentMonth = computed(() => {
    const n = new Date()
    return month.value === n.getMonth() + 1 && year.value === n.getFullYear()
  })

  const todayLabel = computed((): string | null => {
    if (!isCurrentMonth.value || !summary.value) return null
    const today = summary.value.today
    if (!today) return 'Not clocked in'
    if (today.status === 'present' && today.clock_out_time === null) return 'Clocked in'
    if (today.status === 'present' && today.clock_out_time !== null) return 'Completed'
    if (today.status === 'late') return 'Late'
    if (today.status === 'missing_clock_out') return 'Missing clock-out'
    return null
  })

  const attendanceRate = computed(() => {
    if (!summary.value) return '—'
    if (summary.value.summary.working_days_in_period === 0) return '—'
    return `${summary.value.summary.attendance_rate}%`
  })

  async function load() {
    loading.value = true
    error.value = null
    try {
      const res = await fetchAttendanceSummary({ month: month.value, year: year.value })
      summary.value = res.data
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 403) {
        error.value = 'No employee profile linked to this account.'
      } else {
        error.value = 'Failed to load attendance summary.'
      }
    } finally {
      loading.value = false
    }
  }

  return { month, year, summary, loading, error, isCurrentMonth, todayLabel, attendanceRate, load }
}
