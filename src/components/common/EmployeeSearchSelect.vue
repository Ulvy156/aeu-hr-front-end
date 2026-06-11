<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { fetchEmployees, fetchEmployee } from '@/features/employees/services/employee.api'

interface EmployeeOption {
  id: number
  full_name: string
  employee_id: string
}

const props = withDefaults(
  defineProps<{
    modelValue: number | null
    initialOption?: EmployeeOption | null
    placeholder?: string
    disabled?: boolean
    clearable?: boolean
  }>(),
  {
    initialOption: null,
    placeholder: 'Search employee...',
    disabled: false,
    clearable: true,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: number | null]
}>()

const options = ref<EmployeeOption[]>([])
const loading = ref(false)
let searchTimer: ReturnType<typeof setTimeout> | null = null

async function search(query: string) {
  if (!query || query.length < 2) {
    options.value = []
    return
  }
  loading.value = true
  try {
    const res = await fetchEmployees({ search: query, per_page: 15 })
    options.value = res.data.map((e) => ({ id: e.id, full_name: e.full_name, employee_id: e.employee_id }))
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
  const id = props.modelValue
  if (id === null || options.value.some((o) => o.id === id)) return

  if (props.initialOption?.id === id) {
    options.value = [props.initialOption, ...options.value]
    return
  }

  try {
    const res = await fetchEmployee(id)
    options.value = [
      { id: res.data.id, full_name: res.data.full_name, employee_id: res.data.employee_id },
      ...options.value,
    ]
  } catch {
    // existing employee could not be resolved, leave id-only
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
      :label="`${emp.full_name} (${emp.employee_id})`"
      :value="emp.id"
    />
  </el-select>
</template>
