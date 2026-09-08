<script setup lang="ts">
import { computed, ref } from 'vue'
import { X } from '@lucide/vue'
import { BaseSelect } from '@/components/common'
import SearchButton from '@/components/resuable/SearchButton.vue'
import ResetButton from '@/components/resuable/ResetButton.vue'
import type { PayrollStatus, PayrollStatusCounts } from '../types/payroll'
import { PAYROLL_MONTH_NAMES, payrollStatusLabel } from '../utils/payrollDisplay'

type ChipKey = 'month' | 'year' | 'status'

const props = defineProps<{
  month: string
  year: string
  status: string
  counts: PayrollStatusCounts
}>()

const emit = defineEmits<{
  apply: [month: string, year: string, status: string]
}>()

const currentYear = new Date().getFullYear()
const localMonth = ref<string | null>(props.month || null)
const localYear = ref<string | null>(props.year || null)
const localStatus = ref(props.status)

const monthOptions = PAYROLL_MONTH_NAMES.map((label, index) => ({
  label,
  value: String(index + 1),
}))

const yearOptions = Array.from({ length: 5 }, (_, i) => {
  const year = String(currentYear - 2 + i)
  return { label: year, value: year }
})

const pills: { value: PayrollStatus | ''; label: string; countKey: keyof PayrollStatusCounts }[] = [
  { value: '', label: 'All', countKey: 'all' },
  { value: 'draft', label: 'Draft', countKey: 'draft' },
  { value: 'pending_approval', label: 'Pending', countKey: 'pending_approval' },
  { value: 'approved', label: 'Approved', countKey: 'approved' },
  { value: 'rejected', label: 'Rejected', countKey: 'rejected' },
]

const chips = computed(() => {
  const items: { key: ChipKey; label: string }[] = []
  if (props.month) {
    items.push({ key: 'month', label: PAYROLL_MONTH_NAMES[Number(props.month) - 1] ?? props.month })
  }
  if (props.year) items.push({ key: 'year', label: props.year })
  if (props.status) {
    items.push({ key: 'status', label: payrollStatusLabel(props.status as PayrollStatus) })
  }
  return items
})

function apply(month: string, year: string, status: string) {
  emit('apply', month, year, status)
}

function handleSearch() {
  apply(localMonth.value ?? '', localYear.value ?? '', localStatus.value)
}

function handleReset() {
  localMonth.value = null
  localYear.value = null
  localStatus.value = ''
  apply('', '', '')
}

function handleStatus(value: PayrollStatus | '') {
  const next = value !== '' && localStatus.value === value ? '' : value
  if (next === localStatus.value) return
  localStatus.value = next
  apply(props.month, props.year, next)
}

function clearChip(key: ChipKey) {
  const next = { month: props.month, year: props.year, status: props.status }
  if (key === 'month') {
    next.month = ''
    localMonth.value = null
  } else if (key === 'year') {
    next.year = ''
    localYear.value = null
  } else {
    next.status = ''
    localStatus.value = ''
  }
  apply(next.month, next.year, next.status)
}

function pillClass(active: boolean): string {
  return active
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
    : 'border-gray-200 bg-white text-slate-600 hover:border-gray-300 hover:bg-gray-50'
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap gap-1.5">
      <button
        v-for="pill in pills"
        :key="pill.value || 'all'"
        type="button"
        class="inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors"
        :class="pillClass(localStatus === pill.value)"
        @click="handleStatus(pill.value)"
      >
        {{ pill.label }} · {{ counts[pill.countKey] }}
      </button>
    </div>

    <div class="grid grid-cols-1 items-end gap-4 md:grid-cols-[1fr_1fr_auto]">
      <div>
        <label class="mb-1.5 block text-xs font-medium text-slate-500">Month</label>
        <BaseSelect
          v-model="localMonth"
          :options="monthOptions"
          placeholder="All months"
          clearable
        />
      </div>
      <div>
        <label class="mb-1.5 block text-xs font-medium text-slate-500">Year</label>
        <BaseSelect v-model="localYear" :options="yearOptions" placeholder="All years" clearable />
      </div>
      <div class="flex shrink-0 gap-2">
        <SearchButton @click="handleSearch" />
        <ResetButton @click="handleReset" />
      </div>
    </div>

    <div
      v-if="chips.length"
      class="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3"
    >
      <span class="text-xs text-slate-500">Active filters</span>
      <button
        v-for="chip in chips"
        :key="chip.key"
        type="button"
        class="inline-flex items-center gap-1 rounded-lg border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
        :aria-label="`Clear ${chip.label} filter`"
        @click="clearChip(chip.key)"
      >
        {{ chip.label }}
        <X class="h-3 w-3" />
      </button>
    </div>
  </div>
</template>
