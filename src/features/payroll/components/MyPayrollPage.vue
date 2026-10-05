<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Banknote } from '@lucide/vue'
import { AppCard, BasePagination, EmptyState, StatusBadge } from '@/components/common'
import { useNotify } from '@/composables/useNotify'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { fetchMyPayrolls } from '../services/payroll.api'
import type { PaginationMeta, PayrollBatch } from '../types/payroll'
import { displayedDeductionTotal, formatPayrollMoney, formatPayrollPeriod } from '../utils/payrollDisplay'

const notify = useNotify()
const payrolls = ref<PayrollBatch[]>([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(15)
const month = ref('')
const year = ref('')
const meta = ref<PaginationMeta>({ current_page: 1, last_page: 1, per_page: 15, total: 0 })

async function loadPayrolls() {
  loading.value = true
  try {
    const params: Record<string, unknown> = { page: page.value, per_page: pageSize.value }
    if (month.value) params.month = month.value
    if (year.value) params.year = year.value
    const result = await fetchMyPayrolls(params)
    payrolls.value = result.data
    meta.value = result.meta
  } catch (error) {
    notify.error(getApiErrorMessage(error))
  } finally {
    loading.value = false
  }
}

function applyFilters() {
  page.value = 1
  void loadPayrolls()
}

function onPageChange(nextPage: number) {
  page.value = nextPage
  void loadPayrolls()
}

function onPageSizeChange(nextSize: number) {
  pageSize.value = nextSize
  page.value = 1
  void loadPayrolls()
}

onMounted(() => void loadPayrolls())
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-3">
      <div class="shrink-0 rounded-xl border border-emerald-100 bg-emerald-50 p-2">
        <Banknote class="h-5 w-5 text-emerald-600" />
      </div>
      <div>
        <h1 class="text-2xl font-semibold text-slate-900">My Payroll</h1>
        <p class="mt-0.5 text-sm text-slate-500">View your approved payroll history and take home pay.</p>
      </div>
    </div>

    <AppCard no-padding>
      <div class="flex flex-wrap items-end gap-3 border-b border-gray-100 px-5 py-4">
        <label class="text-xs font-medium text-slate-600">
          Month
          <select v-model="month" class="mt-1 block rounded-lg border border-gray-200 px-3 py-2 text-sm" @change="applyFilters">
            <option value="">All months</option>
            <option v-for="(label, index) in ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']" :key="label" :value="String(index + 1)">{{ label }}</option>
          </select>
        </label>
        <label class="text-xs font-medium text-slate-600">
          Year
          <input v-model="year" type="number" min="2000" max="2100" placeholder="All years" class="mt-1 block w-32 rounded-lg border border-gray-200 px-3 py-2 text-sm" @change="applyFilters" />
        </label>
        <button class="rounded-lg border border-gray-200 px-3 py-2 text-sm text-slate-600 hover:bg-gray-50" @click="month = ''; year = ''; applyFilters()">Reset</button>
      </div>

      <div class="px-5 py-4">
        <div class="mb-4 flex items-center justify-between">
          <div>
            <h2 class="text-sm font-semibold text-slate-800">Approved Payroll Records</h2>
            <p class="mt-0.5 text-xs text-slate-400">Only your own approved payroll is shown.</p>
          </div>
          <span class="text-xs font-medium text-slate-400">{{ meta.total }} records</span>
        </div>

        <div class="relative">
          <div v-if="loading" class="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/70">
            <div class="h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
          </div>
          <el-table :data="payrolls" class="w-full">
            <el-table-column label="Period" min-width="160">
              <template #default="{ row }">{{ formatPayrollPeriod(row.month, row.year) }}</template>
            </el-table-column>
            <el-table-column label="Status" width="130">
              <template #default="{ row }"><StatusBadge :status="row.status" custom-label="Approved" /></template>
            </el-table-column>
            <el-table-column label="Paid Days" width="120" align="right">
              <template #default="{ row }">{{ row.items?.[0]?.working_days ?? '—' }}</template>
            </el-table-column>
            <el-table-column label="Gross Pay" width="150" align="right">
              <template #default="{ row }">{{ formatPayrollMoney(row.totals?.gross_salary) }}</template>
            </el-table-column>
            <el-table-column label="Deductions" width="150" align="right">
              <template #default="{ row }">{{ displayedDeductionTotal(row.totals) }}</template>
            </el-table-column>
            <el-table-column label="Net Pay" width="150" align="right">
              <template #default="{ row }"><span class="font-semibold text-emerald-700">{{ formatPayrollMoney(row.totals?.net_salary) }}</span></template>
            </el-table-column>
            <template #empty>
              <EmptyState title="No payroll records found." description="Approved payrolls will appear here." />
            </template>
          </el-table>
        </div>
        <BasePagination :current-page="meta.current_page" :page-size="meta.per_page" :total="meta.total" @update:current-page="onPageChange" @update:page-size="onPageSizeChange" />
      </div>
    </AppCard>
  </div>
</template>
