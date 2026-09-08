<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { X } from '@lucide/vue'
import { EmployeeSearchSelect } from '@/components/common'
import SearchButton from '@/components/resuable/SearchButton.vue'
import ResetButton from '@/components/resuable/ResetButton.vue'
import { fetchEmployee } from '@/features/employees/services/employee.api'
import type {
  UpgradeRequestStatus,
  UpgradeRequestStatusCounts,
} from '../types/employee-upgrade-request'
import { UPGRADE_REQUEST_STATUS_LABELS } from '../utils/upgradeRequestDisplay'

type ChipKey = 'employee' | 'status'

const props = defineProps<{
  employeeId: number | null
  status: UpgradeRequestStatus | ''
  counts: UpgradeRequestStatusCounts
}>()

const emit = defineEmits<{
  apply: [employeeId: number | null, status: string]
}>()

const localEmployeeId = ref<number | null>(props.employeeId)
const localStatus = ref(props.status)
const employeeName = ref('')

const pills: {
  value: UpgradeRequestStatus | ''
  label: string
  countKey: keyof UpgradeRequestStatusCounts
}[] = [
  { value: '', label: 'All', countKey: 'all' },
  { value: 'pending', label: 'Pending', countKey: 'pending' },
  { value: 'approved', label: 'Approved', countKey: 'approved' },
  { value: 'rejected', label: 'Rejected', countKey: 'rejected' },
  { value: 'cancelled', label: 'Cancelled', countKey: 'cancelled' },
]

const chips = computed(() => {
  const items: { key: ChipKey; label: string }[] = []
  if (props.employeeId) {
    items.push({ key: 'employee', label: employeeName.value || 'Employee' })
  }
  if (props.status) {
    items.push({ key: 'status', label: UPGRADE_REQUEST_STATUS_LABELS[props.status] })
  }
  return items
})

watch(
  () => props.employeeId,
  async (id) => {
    if (!id) {
      employeeName.value = ''
      return
    }
    try {
      const res = await fetchEmployee(id)
      employeeName.value = res.data.full_name
    } catch {
      employeeName.value = 'Employee'
    }
  },
  { immediate: true },
)

function apply(employeeId: number | null, status: string) {
  emit('apply', employeeId, status)
}

function handleSearch() {
  apply(localEmployeeId.value, localStatus.value)
}

function handleReset() {
  localEmployeeId.value = null
  localStatus.value = ''
  employeeName.value = ''
  apply(null, '')
}

function handleStatus(value: UpgradeRequestStatus | '') {
  const next = value !== '' && localStatus.value === value ? '' : value
  if (next === localStatus.value) return
  localStatus.value = next
  apply(props.employeeId, next)
}

function clearChip(key: ChipKey) {
  const next = { employeeId: props.employeeId, status: props.status }
  if (key === 'employee') {
    next.employeeId = null
    localEmployeeId.value = null
    employeeName.value = ''
  } else {
    next.status = ''
    localStatus.value = ''
  }
  apply(next.employeeId, next.status)
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

    <div class="grid grid-cols-1 items-end gap-4 md:grid-cols-[1fr_auto]">
      <div>
        <label class="mb-1.5 block text-xs font-medium text-slate-500">Employee</label>
        <EmployeeSearchSelect
          v-model="localEmployeeId"
          placeholder="Filter by employee"
          class="!w-full"
        />
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
