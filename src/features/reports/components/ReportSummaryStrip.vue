<script setup lang="ts">
import { computed } from 'vue'
import { formatReportDate, formatReportMoney } from '../utils/reportDisplay'

const props = defineProps<{
  group: 'payroll' | 'attendance' | 'leave'
  reportType: string
  summary: Record<string, unknown>
}>()

interface SummaryStat {
  label: string
  value: string
  tone?: 'emerald' | 'amber' | 'red' | 'slate'
}

function count(value: unknown): string {
  if (value == null || value === '') return '0'
  return String(value)
}

function money(value: unknown): string {
  return formatReportMoney(value)
}

const stats = computed<SummaryStat[]>(() => {
  const summary = props.summary
  if (!summary || Object.keys(summary).length === 0) return []

  if (props.group === 'payroll') {
    if (props.reportType === 'employee_list') {
      return [
        { label: 'Employees', value: count(summary.item_count) },
        { label: 'Gross (USD)', value: money(summary.gross_salary) },
        { label: 'Tax (USD)', value: money(summary.tax_amount) },
        { label: 'Net (USD)', value: money(summary.net_salary), tone: 'emerald' },
      ]
    }
    if (props.reportType === 'monthly_summary') {
      const statuses = (summary.statuses ?? {}) as Record<string, number>
      return [
        { label: 'Batches', value: count(summary.batch_count) },
        { label: 'Pending', value: count(statuses.pending_approval), tone: 'amber' },
        { label: 'Gross (USD)', value: money(summary.gross_salary) },
        { label: 'Net (USD)', value: money(summary.net_salary), tone: 'emerald' },
      ]
    }
    return [
      { label: 'Statuses', value: count(summary.status_count) },
      { label: 'Batches', value: count(summary.batch_count) },
      { label: 'Employees', value: count(summary.item_count) },
      { label: 'Net (USD)', value: money(summary.net_salary), tone: 'emerald' },
    ]
  }

  if (props.group === 'attendance') {
    if (props.reportType === 'monthly_summary') {
      return [
        { label: 'Employees', value: count(summary.employee_count) },
        { label: 'Present', value: count(summary.present_count), tone: 'emerald' },
        { label: 'Late', value: count(summary.late_count), tone: 'amber' },
        { label: 'Absent', value: count(summary.absent_count), tone: 'red' },
      ]
    }
    if (props.reportType === 'late_employees') {
      return [
        { label: 'Records', value: count(summary.total_records) },
        { label: 'Late', value: count(summary.late_count), tone: 'amber' },
      ]
    }
    if (props.reportType === 'absent_employees') {
      return [
        { label: 'Records', value: count(summary.total_records) },
        { label: 'Absent', value: count(summary.absent_count), tone: 'red' },
      ]
    }
    if (props.reportType === 'correction_list') {
      return [
        { label: 'Records', value: count(summary.total_records) },
        { label: 'Corrected', value: count(summary.corrected_count) },
      ]
    }
    return [
      { label: 'Present', value: count(summary.present_count), tone: 'emerald' },
      { label: 'Late', value: count(summary.late_count), tone: 'amber' },
      { label: 'Absent', value: count(summary.absent_count), tone: 'red' },
      { label: 'Missing clock-out', value: count(summary.missing_clock_out_count) },
    ]
  }

  if (props.reportType === 'leave_balance') {
    return [
      { label: 'Employees', value: count(summary.employee_count) },
      { label: 'Year', value: count(summary.year) },
    ]
  }

  return [
    { label: 'Requests', value: count(summary.total_records) },
    { label: 'Pending', value: count(summary.pending_count), tone: 'amber' },
    { label: 'Approved', value: count(summary.approved_count), tone: 'emerald' },
    { label: 'Days', value: count(summary.total_days) },
  ]
})

const periodCaption = computed(() => {
  if (props.group !== 'attendance' || props.reportType !== 'monthly_summary') return ''
  const start = props.summary.period_start
  const end = props.summary.period_end
  if (typeof start !== 'string' || typeof end !== 'string') return ''
  return `${formatReportDate(start)} – ${formatReportDate(end)}`
})

function valueClass(tone?: SummaryStat['tone']): string {
  if (tone === 'emerald') return 'text-emerald-700'
  if (tone === 'amber') return 'text-amber-600'
  if (tone === 'red') return 'text-red-600'
  return 'text-slate-900'
}
</script>

<template>
  <div v-if="stats.length" class="space-y-2">
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="rounded-xl border border-gray-200 bg-white p-4"
      >
        <p class="mb-1 text-xs text-slate-400">{{ stat.label }}</p>
        <p class="text-lg font-semibold" :class="valueClass(stat.tone)">{{ stat.value }}</p>
      </div>
    </div>
    <p v-if="periodCaption" class="text-xs text-slate-400">Period {{ periodCaption }}</p>
  </div>
</template>
