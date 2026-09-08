<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessageBox } from 'element-plus'
import { Plus } from '@lucide/vue'
import { useNotify } from '@/composables/useNotify'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { AppCard, BaseButton, PageHeader } from '@/components/common'
import { usePermission } from '@/composables/usePermissions'
import { usePublicHolidays } from '../composables/usePublicHolidays'
import { disablePublicHoliday } from '../services/public-holiday.api'
import type { PublicHoliday } from '../types/public-holiday'
import PublicHolidayFilters from './PublicHolidayFilters.vue'
import PublicHolidayTable from './PublicHolidayTable.vue'
import PublicHolidayFormDialog from './PublicHolidayFormDialog.vue'
import PublicHolidaySummaryCards from './PublicHolidaySummaryCards.vue'
import PublicHolidayNextCard from './PublicHolidayNextCard.vue'
import PublicHolidayUpcoming from './PublicHolidayUpcoming.vue'

const { can } = usePermission()
const notify = useNotify()
const {
  holidays,
  upcomingHolidays,
  nextHoliday,
  soonHolidays,
  yearCounts,
  statusCounts,
  currentYear,
  meta,
  loading,
  filters,
  loadHolidays,
  applyFilters,
  onPageChange,
  onPageSizeChange,
} = usePublicHolidays()

const formOpen = ref(false)
const selectedHoliday = ref<PublicHoliday | null>(null)

const yearLabel = computed(() =>
  filters.year ? `${filters.year} holidays` : 'Total holidays',
)

const approachingMessage = computed(() => {
  if (soonHolidays.value.length <= 1) return ''
  const names = soonHolidays.value
    .slice(0, 3)
    .map((row) => row.name)
    .join(', ')
  const extra =
    soonHolidays.value.length > 3 ? `, +${soonHolidays.value.length - 3} more` : ''
  return `${names}${extra} fall within the next 30 days. Confirm dates before payroll cut-off.`
})

const showUpcoming = computed(() => upcomingHolidays.value.length > 0)

const listHint = computed(() => {
  const parts = [`${meta.value.total} holidays`]
  if (filters.year) parts.push(filters.year)
  return parts.join(' · ')
})

onMounted(() => loadHolidays())

function handleCreate() {
  selectedHoliday.value = null
  formOpen.value = true
}

function handleEdit(holiday: PublicHoliday) {
  selectedHoliday.value = holiday
  formOpen.value = true
}

async function handleDisable(holiday: PublicHoliday) {
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to disable "${holiday.name}"? It will no longer be used as an active holiday, but the record will be kept.`,
      'Disable Public Holiday',
      {
        confirmButtonText: 'Disable',
        cancelButtonText: 'Cancel',
        type: 'warning',
        confirmButtonClass: 'el-button--danger',
      },
    )
  } catch {
    return
  }

  try {
    await disablePublicHoliday(holiday.id)
    notify.success(`"${holiday.name}" has been disabled.`)
    await loadHolidays()
  } catch (err) {
    notify.error(getApiErrorMessage(err))
  }
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      title="Public Holidays"
      subtitle="Manage holidays used by attendance and payroll calculations."
    >
      <template #action>
        <BaseButton
          v-if="can('public_holidays.create')"
          type="primary"
          class="!bg-emerald-600 !border-emerald-600 hover:!bg-emerald-700"
          @click="handleCreate"
        >
          <Plus class="mr-1.5 h-4 w-4" />
          Add Holiday
        </BaseButton>
      </template>
    </PageHeader>

    <PublicHolidaySummaryCards
      :counts="statusCounts"
      :year-label="yearLabel"
      :loading="loading && holidays.length === 0"
    />

    <PublicHolidayNextCard
      v-if="nextHoliday"
      :holiday="nextHoliday"
      @edit="handleEdit"
      @disable="handleDisable"
    />

    <div
      v-if="approachingMessage"
      class="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800"
    >
      {{ approachingMessage }}
    </div>

    <AppCard no-padding>
      <div class="border-b border-gray-100 px-5 py-4">
        <PublicHolidayFilters
          :search="filters.search"
          :status="filters.status"
          :year="filters.year"
          :year-counts="yearCounts"
          :status-counts="statusCounts"
          :current-year="currentYear"
          @apply="applyFilters"
        />
      </div>

      <div :class="showUpcoming ? 'lg:grid lg:grid-cols-[minmax(0,1fr)_260px]' : ''">
        <div>
          <div class="flex items-center justify-between gap-2 border-b border-gray-100 px-5 py-3">
            <p class="text-xs text-slate-500">{{ listHint }}</p>
            <p class="text-xs text-slate-400">Sorted by holiday date</p>
          </div>

          <PublicHolidayTable
            :holidays="holidays"
            :loading="loading"
            :current-page="meta.current_page"
            :page-size="meta.per_page"
            :total="meta.total"
            :can-create="can('public_holidays.create')"
            @edit="handleEdit"
            @disable="handleDisable"
            @create="handleCreate"
            @page-change="onPageChange"
            @size-change="onPageSizeChange"
          />
        </div>

        <PublicHolidayUpcoming
          :holidays="upcomingHolidays"
          @edit="handleEdit"
          @disable="handleDisable"
        />
      </div>
    </AppCard>

    <PublicHolidayFormDialog
      v-model:visible="formOpen"
      :holiday="selectedHoliday"
      @saved="loadHolidays()"
    />
  </div>
</template>
