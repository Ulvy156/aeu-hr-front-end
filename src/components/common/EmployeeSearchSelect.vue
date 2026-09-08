<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import {
  fetchEmployees,
  fetchEmployee,
  fetchLineManagers,
} from '@/features/employees/services/employee.api'

interface EmployeeOption {
  id: number
  full_name: string
  employee_id: string
  department_name?: string | null
}

const props = withDefaults(
  defineProps<{
    modelValue: number | number[] | null
    initialOption?: EmployeeOption | EmployeeOption[] | null
    placeholder?: string
    disabled?: boolean
    clearable?: boolean
    multiple?: boolean
    departmentId?: number | null
    mode?: 'employees' | 'line-managers'
    excludeId?: number | null
  }>(),
  {
    initialOption: null,
    placeholder: 'Search employee...',
    disabled: false,
    clearable: true,
    multiple: false,
    departmentId: null,
    mode: 'employees',
    excludeId: null,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: number | number[] | null]
}>()

const options = ref<EmployeeOption[]>([])
const loading = ref(false)
let searchTimer: ReturnType<typeof setTimeout> | null = null

function optionLabel(emp: EmployeeOption): string {
  const base = `${emp.full_name} (${emp.employee_id})`
  return emp.department_name ? `${base} · ${emp.department_name}` : base
}

async function search(query: string) {
  if (!query || query.length < 2) {
    options.value = []
    return
  }
  loading.value = true
  try {
    if (props.mode === 'line-managers') {
      const res = await fetchLineManagers({
        q: query,
        exclude_id: props.excludeId ?? undefined,
        per_page: 15,
      })
      options.value = res.data.map((e) => ({
        id: e.id,
        full_name: e.full_name,
        employee_id: e.employee_id,
        department_name: e.department?.name ?? null,
      }))
    } else {
      const params = props.departmentId
        ? { search: query, per_page: 15, department_id: props.departmentId, include_ceo: 1 as const }
        : { search: query, per_page: 15 }
      const res = await fetchEmployees(params)
      options.value = res.data.map((e) => ({
        id: e.id,
        full_name: e.full_name,
        employee_id: e.employee_id,
      }))
    }
  } catch {
    options.value = []
  } finally {
    loading.value = false
  }
}

function onSearch(query: string) {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => search(query), 300)
}

async function ensureSelectedOption() {
  const ids = props.multiple
    ? ((props.modelValue as number[] | null) ?? [])
    : props.modelValue !== null
      ? [props.modelValue as number]
      : []

  const missingIds = ids.filter((id) => !options.value.some((o) => o.id === id))
  if (missingIds.length === 0) return

  const initialOptions = props.initialOption
    ? Array.isArray(props.initialOption)
      ? props.initialOption
      : [props.initialOption]
    : []

  const resolved: EmployeeOption[] = []
  for (const id of missingIds) {
    const fromInitial = initialOptions.find((o) => o.id === id)
    if (fromInitial) {
      resolved.push(fromInitial)
      continue
    }

    try {
      const res = await fetchEmployee(id)
      resolved.push({
        id: res.data.id,
        full_name: res.data.full_name,
        employee_id: res.data.employee_id,
        department_name: res.data.department?.name ?? null,
      })
    } catch {
      // existing employee could not be resolved, leave id-only
    }
  }

  if (resolved.length) {
    options.value = [...resolved, ...options.value]
  }
}

onMounted(ensureSelectedOption)
watch(() => props.modelValue, ensureSelectedOption)
</script>

<template>
  <el-select
    :model-value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :clearable="clearable"
    :multiple="multiple"
    filterable
    remote
    reserve-keyword
    :remote-method="onSearch"
    :loading="loading"
    class="w-full"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <el-option
      v-for="emp in options"
      :key="emp.id"
      :label="optionLabel(emp)"
      :value="emp.id"
    />
  </el-select>
</template>
