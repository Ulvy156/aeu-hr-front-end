<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { StatusBadge, EmptyState } from '@/components/common'
import type { PayrollItem, UpdatePayrollItemPayload } from '../types/payroll'

const props = defineProps<{
  items: PayrollItem[]
  editable: boolean
  saveLoading?: boolean
}>()

const emit = defineEmits<{
  save: [items: UpdatePayrollItemPayload[]]
}>()

interface EditableItem extends PayrollItem {
  _base_salary: number
  _working_days: number
  _present_days: number
  _absent_days: number
  _unpaid_leave_days: number
  _tax_amount: number
}

const editableItems = ref<EditableItem[]>([])

watch(
  () => props.items,
  (items) => {
    editableItems.value = items.map((item) => ({
      ...item,
      _base_salary: Number(item.base_salary),
      _working_days: Number(item.working_days),
      _present_days: Number(item.present_days),
      _absent_days: Number(item.absent_days),
      _unpaid_leave_days: Number(item.unpaid_leave_days),
      _tax_amount: Number(item.tax_amount),
    }))
  },
  { immediate: true },
)

function formatMoney(value: string | number | undefined): string {
  if (value === undefined || value === null || value === '') return '—'
  return Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatNumber(value: string | number | undefined): string {
  if (value === undefined || value === null || value === '') return '—'
  return Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function handleSave() {
  const payload: UpdatePayrollItemPayload[] = editableItems.value.map((item) => ({
    id: item.id,
    base_salary: item._base_salary,
    working_days: item._working_days,
    present_days: item._present_days,
    absent_days: item._absent_days,
    unpaid_leave_days: item._unpaid_leave_days,
    tax_amount: item._tax_amount,
  }))
  emit('save', payload)
}

const headerCellStyle = {
  background: '#f9fafb',
  fontSize: '11px',
  fontWeight: '600',
  color: '#6b7280',
  borderBottom: '1px solid #e5e7eb',
}
</script>

<template>
  <div>
    <div v-if="editable" class="px-5 py-3 bg-amber-50 border-b border-amber-100 flex items-center justify-between">
      <p class="text-sm text-amber-700">
        <strong>Edit mode:</strong> Adjust editable fields then save. Computed values (gross, taxable, net) are recalculated by the backend.
      </p>
      <button
        class="px-4 py-1.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        :disabled="saveLoading"
        @click="handleSave"
      >
        {{ saveLoading ? 'Saving…' : 'Save Changes' }}
      </button>
    </div>

    <el-table :data="editableItems" class="w-full text-xs" :header-cell-style="headerCellStyle" scroll-bar-always-on>
      <el-table-column label="Employee" min-width="160" fixed="left">
        <template #default="{ row }">
          <div>
            <p class="text-xs font-medium text-slate-800">{{ row.employee.full_name }}</p>
            <p class="text-[11px] text-slate-400">{{ row.employee.employee_id }}</p>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Base Salary" width="130" align="right">
        <template #default="{ row }">
          <el-input-number
            v-if="editable"
            v-model="row._base_salary"
            :min="0"
            :precision="2"
            :controls="false"
            class="!w-full"
            size="small"
          />
          <span v-else class="text-xs text-slate-700">{{ formatMoney(row.base_salary) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Daily Rate" width="110" align="right">
        <template #default="{ row }">
          <span class="text-xs text-slate-600">{{ formatMoney(row.daily_rate) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Working Days" width="110" align="right">
        <template #default="{ row }">
          <el-input-number
            v-if="editable"
            v-model="row._working_days"
            :min="0"
            :precision="2"
            :controls="false"
            class="!w-full"
            size="small"
          />
          <span v-else class="text-xs text-slate-700">{{ formatNumber(row.working_days) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Present" width="90" align="right">
        <template #default="{ row }">
          <el-input-number
            v-if="editable"
            v-model="row._present_days"
            :min="0"
            :precision="2"
            :controls="false"
            class="!w-full"
            size="small"
          />
          <span v-else class="text-xs text-slate-700">{{ formatNumber(row.present_days) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Absent" width="90" align="right">
        <template #default="{ row }">
          <el-input-number
            v-if="editable"
            v-model="row._absent_days"
            :min="0"
            :precision="2"
            :controls="false"
            class="!w-full"
            size="small"
          />
          <span v-else class="text-xs text-slate-700">{{ formatNumber(row.absent_days) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Unpaid Leave" width="110" align="right">
        <template #default="{ row }">
          <el-input-number
            v-if="editable"
            v-model="row._unpaid_leave_days"
            :min="0"
            :precision="2"
            :controls="false"
            class="!w-full"
            size="small"
          />
          <span v-else class="text-xs text-slate-700">{{ formatNumber(row.unpaid_leave_days) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Gross Salary" width="120" align="right">
        <template #default="{ row }">
          <span class="text-xs font-medium text-slate-800">{{ formatMoney(row.gross_salary) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Tax Amount" width="110" align="right">
        <template #default="{ row }">
          <el-input-number
            v-if="editable"
            v-model="row._tax_amount"
            :min="0"
            :precision="2"
            :controls="false"
            class="!w-full"
            size="small"
          />
          <span v-else class="text-xs text-slate-700">{{ formatMoney(row.tax_amount) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Net Salary" width="120" align="right" fixed="right">
        <template #default="{ row }">
          <span class="text-xs font-semibold text-emerald-700">{{ formatMoney(row.net_salary) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Status" width="90" align="center" fixed="right">
        <template #default="{ row }">
          <StatusBadge :status="row.status" />
        </template>
      </el-table-column>

      <template #empty>
        <EmptyState title="No payroll items found." description="No employees were included in this payroll batch." />
      </template>
    </el-table>
  </div>
</template>
