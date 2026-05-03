<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessageBox } from 'element-plus'
import { useNotify } from '@/composables/useNotify'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { Plus, CalendarDays, CalendarCheck, Calendar } from '@lucide/vue'
import { AppCard } from '@/components/common'
import { usePermission } from '@/composables/usePermissions'
import { usePublicHolidays } from '../composables/usePublicHolidays'
import { disablePublicHoliday } from '../services/public-holiday.api'
import type { PublicHoliday } from '../types/public-holiday'
import PublicHolidayFilters from './PublicHolidayFilters.vue'
import PublicHolidayTable from './PublicHolidayTable.vue'
import PublicHolidayFormDialog from './PublicHolidayFormDialog.vue'

const { can } = usePermission()
const notify = useNotify()
const {
  holidays,
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

const activeCount = computed(() => holidays.value.filter((h) => h.status === 'active').length)
const inactiveCount = computed(() => holidays.value.filter((h) => h.status === 'inactive').length)

onMounted(loadHolidays)

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

    <!-- Page header -->
    <div class="flex items-start justify-between">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-emerald-50 rounded-xl border border-emerald-100 shrink-0">
          <CalendarDays class="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h1 class="text-2xl font-semibold text-slate-900">Public Holidays</h1>
          <p class="mt-0.5 text-sm text-slate-500">
            Manage holidays used by attendance and payroll calculations.
          </p>
        </div>
      </div>
      <el-button
        v-if="can('public_holidays.create')"
        type="primary"
        class="!bg-emerald-600 !border-emerald-600 hover:!bg-emerald-700 hover:!border-emerald-700"
        @click="handleCreate"
      >
        <Plus class="w-4 h-4 mr-1.5" />
        Add Holiday
      </el-button>
    </div>

    <!-- Summary cards -->
    <div class="grid grid-cols-3 gap-5">
      <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex items-center gap-4">
        <div class="p-2.5 bg-emerald-50 rounded-lg shrink-0">
          <CalendarDays class="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <p class="text-xs text-slate-500 font-medium">Total Holidays</p>
          <p class="text-2xl font-bold text-slate-900 mt-0.5">{{ meta.total }}</p>
        </div>
      </div>

      <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex items-center gap-4">
        <div class="p-2.5 bg-green-50 rounded-lg shrink-0">
          <CalendarCheck class="w-5 h-5 text-green-600" />
        </div>
        <div>
          <p class="text-xs text-slate-500 font-medium">Active Holidays</p>
          <p class="text-2xl font-bold text-slate-900 mt-0.5">{{ activeCount }}</p>
        </div>
      </div>

      <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex items-center gap-4">
        <div class="p-2.5 bg-amber-50 rounded-lg shrink-0">
          <Calendar class="w-5 h-5 text-amber-500" />
        </div>
        <div>
          <p class="text-xs text-slate-500 font-medium">Inactive Holidays</p>
          <p class="text-2xl font-bold text-slate-900 mt-0.5">{{ inactiveCount }}</p>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <PublicHolidayFilters
      :search="filters.search"
      :status="filters.status"
      :year="filters.year"
      @apply="applyFilters"
    />

    <!-- Table card -->
    <AppCard no-padding>
      <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 class="text-sm font-semibold text-slate-800">Holiday List</h3>
          <p class="text-xs text-slate-400 mt-0.5">
            Public holidays configured for attendance and payroll rules.
          </p>
        </div>
        <span class="text-xs text-slate-400 font-medium">{{ meta.total }} records</span>
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
    </AppCard>

    <PublicHolidayFormDialog
      v-model:visible="formOpen"
      :holiday="selectedHoliday"
      @saved="loadHolidays"
    />
  </div>
</template>
