<script setup lang="ts">
import { ref } from 'vue'
import { Clock, CheckCircle2 } from '@lucide/vue'
import { searchEmployees } from '@/features/employees/services/employee.api'
import type { EmployeeSearchOption } from '@/features/employees/services/employee.api'
import { proxyClockIn, proxyClockOut } from '../services/attendance.api'
import type { Attendance } from '../types/attendance'
import { BaseButton } from '@/components/common'

const props = defineProps<{
  type: 'clock_in' | 'clock_out'
}>()

const emit = defineEmits<{
  success: [attendance: Attendance]
}>()

const employeeId = ref<string | null>(null)
const date = ref(new Date().toISOString().split('T')[0])
const employees = ref<EmployeeSearchOption[]>([])
const loadingEmployees = ref(false)
const submitting = ref(false)
const result = ref<Attendance | null>(null)
const error = ref<string | null>(null)
const fieldErrors = ref<Record<string, string>>({})

const statusLabel: Record<string, string> = {
  present: 'Present',
  late: 'Late',
  absent: 'Absent',
  missing_clock_out: 'Missing Clock-out',
}

function disableFutureDates(d: Date): boolean {
  return d > new Date()
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null

function onEmployeeSearch(query: string) {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => fetchEmployeeOptions(query), 300)
}

async function fetchEmployeeOptions(query: string) {
  if (!query || query.length < 2) {
    employees.value = []
    return
  }
  loadingEmployees.value = true
  try {
    employees.value = await searchEmployees(query)
  } catch {
    employees.value = []
  } finally {
    loadingEmployees.value = false
  }
}

function fmtTime(isoStr: string | null): string {
  if (!isoStr) return '—'
  return new Date(isoStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function clearResult() {
  result.value = null
  error.value = null
  fieldErrors.value = {}
}


async function handleSubmit() {
  if (!employeeId.value || !date.value) return
  submitting.value = true
  clearResult()
  try {
    const fn = props.type === 'clock_in' ? proxyClockIn : proxyClockOut
    const res = await fn({ employee_id: employeeId.value, attendance_date: date.value })
    result.value = res.data
    emit('success', res.data)
  } catch (err: unknown) {
    const errData = (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })?.response?.data
    if (errData?.errors && Object.keys(errData.errors).length > 0) {
      Object.entries(errData.errors).forEach(([field, messages]) => {
        fieldErrors.value[field] = messages[0] ?? ''
      })
    } else {
      error.value = errData?.message ?? 'An unexpected error occurred.'
    }
  } finally {
    submitting.value = false
  }
}

</script>

<template>
  <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-5 space-y-4">
    <!-- Card header -->
    <div class="flex items-center gap-2.5">
      <div
        class="p-2 rounded-xl border"
        :class="type === 'clock_in' ? 'bg-emerald-50 border-emerald-100' : 'bg-blue-50 border-blue-100'"
      >
        <Clock
          class="w-4 h-4"
          :class="type === 'clock_in' ? 'text-emerald-600' : 'text-blue-600'"
        />
      </div>
      <div>
        <h3 class="text-sm font-semibold text-slate-900">
          {{ type === 'clock_in' ? 'Proxy Clock In' : 'Proxy Clock Out' }}
        </h3>
        <p class="text-xs text-slate-400 mt-0.5">
          {{ type === 'clock_in' ? 'Record clock-in on behalf of an employee.' : 'Record clock-out on behalf of an employee.' }}
        </p>
      </div>
    </div>

    <!-- Employee -->
    <div>
      <label class="text-xs font-medium text-slate-600 mb-1.5 block">Employee</label>
      <el-select
        v-model="employeeId"
        filterable
        remote
        :remote-method="onEmployeeSearch"
        :loading="loadingEmployees"
        placeholder="Search employee..."
        clearable
        class="w-full!"
        @change="clearResult"
      >
        <el-option
          v-for="emp in employees"
          :key="emp.employee_id"
          :value="emp.employee_id"
          :label="emp.display"
        />
      </el-select>
      <p v-if="fieldErrors.employee_id" class="mt-1 text-xs text-red-500">
        {{ fieldErrors.employee_id }}
      </p>
    </div>

    <!-- Date -->
    <div>
      <label class="text-xs font-medium text-slate-600 mb-1.5 block">Date</label>
      <el-date-picker
        v-model="date"
        type="date"
        placeholder="Select date"
        value-format="YYYY-MM-DD"
        :disabled-date="disableFutureDates"
        class="w-full!"
        @change="clearResult"
      />
      <p v-if="fieldErrors.attendance_date" class="mt-1 text-xs text-red-500">
        {{ fieldErrors.attendance_date }}
      </p>
    </div>

    <!-- Submit -->
    <BaseButton
      type="primary"
      :loading="submitting"
      :disabled="!employeeId || !date"
      class="w-full!"
      :class="
        type === 'clock_in'
          ? 'bg-emerald-600! border-emerald-600! hover:bg-emerald-700! hover:border-emerald-700!'
          : 'bg-blue-600! border-blue-600! hover:bg-blue-700! hover:border-blue-700!'
      "
      @click="handleSubmit"
    >
      {{ type === 'clock_in' ? 'Clock In for Employee' : 'Clock Out for Employee' }}
    </BaseButton>

    <!-- Success banner -->
    <div
      v-if="result"
      class="rounded-lg border border-emerald-100 bg-emerald-50 p-3 space-y-1"
    >
      <div class="flex items-center gap-1.5 text-sm font-medium text-emerald-700">
        <CheckCircle2 class="w-4 h-4 shrink-0" />
        {{ type === 'clock_in' ? 'Clock-in' : 'Clock-out' }} recorded for
        {{ result.employee.full_name }} ({{ result.employee.employee_id }}) on {{ result.attendance_date }}
      </div>
      <p class="text-xs text-emerald-600 pl-6">
        Time: {{ fmtTime(type === 'clock_in' ? result.clock_in_time : result.clock_out_time) }}
        &nbsp;·&nbsp; Status: {{ statusLabel[result.status] ?? result.status }}
        <template v-if="type === 'clock_in' && result.proxied_clock_in_by_user">
          &nbsp;·&nbsp; Recorded by: {{ result.proxied_clock_in_by_user.name }}
        </template>
        <template v-else-if="type === 'clock_out' && result.proxied_clock_out_by_user">
          &nbsp;·&nbsp; Recorded by: {{ result.proxied_clock_out_by_user.name }}
        </template>
      </p>
    </div>

    <!-- Inline error -->
    <div
      v-if="error"
      class="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600"
    >
      {{ error }}
    </div>
  </div>
</template>
