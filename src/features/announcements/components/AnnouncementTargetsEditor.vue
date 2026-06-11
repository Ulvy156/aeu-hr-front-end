<script setup lang="ts">
import { onMounted } from 'vue'
import { Plus, Trash2 } from '@lucide/vue'
import { useAnnouncementTargetOptions } from '../composables/useAnnouncementTargetOptions'
import { fetchEmployee } from '@/features/employees/services/employee.api'
import { getFieldError, type ApiValidationErrors } from '@/utils/api-error'
import type { AnnouncementTarget, AnnouncementTargetType } from '../types/announcement'

const props = defineProps<{
  modelValue: AnnouncementTarget[]
  errors?: ApiValidationErrors
}>()

const emit = defineEmits<{
  'update:modelValue': [value: AnnouncementTarget[]]
}>()

const {
  roleOptions,
  departmentOptions,
  employeeOptions,
  employeeSearchLoading,
  loadRoleOptions,
  loadDepartmentOptions,
  onEmployeeSearch,
  ensureEmployeeOption,
} = useAnnouncementTargetOptions()

const targetTypeOptions: { label: string; value: AnnouncementTargetType }[] = [
  { label: 'All Employees', value: 'all' },
  { label: 'Role', value: 'role' },
  { label: 'Department', value: 'department' },
  { label: 'Employee', value: 'employee' },
]

onMounted(async () => {
  await Promise.all([loadRoleOptions(), loadDepartmentOptions()])

  for (const target of props.modelValue) {
    if (target.target_type === 'employee' && target.target_id) {
      try {
        const res = await fetchEmployee(target.target_id)
        ensureEmployeeOption(res.data)
      } catch {
        // existing employee target could not be resolved, leave id-only
      }
    }
  }
})

function addTarget() {
  emit('update:modelValue', [...props.modelValue, { target_type: 'all', target_id: null }])
}

function removeTarget(index: number) {
  const next = [...props.modelValue]
  next.splice(index, 1)
  emit('update:modelValue', next)
}

function updateTarget(index: number, patch: Partial<AnnouncementTarget>) {
  const next = [...props.modelValue]
  next[index] = { ...next[index], ...patch } as AnnouncementTarget
  emit('update:modelValue', next)
}

function onTargetTypeChange(index: number, type: AnnouncementTargetType) {
  updateTarget(index, { target_type: type, target_id: null })
}

function targetError(index: number): string | undefined {
  return (
    getFieldError(props.errors ?? {}, `targets.${index}.target_id`) ??
    getFieldError(props.errors ?? {}, `targets.${index}.target_type`)
  )
}
</script>

<template>
  <div class="space-y-3">
    <div
      v-for="(target, index) in modelValue"
      :key="index"
      class="flex items-start gap-2"
    >
      <el-select
        :model-value="target.target_type"
        placeholder="Target Type"
        class="!w-[160px]"
        @update:model-value="onTargetTypeChange(index, $event)"
      >
        <el-option
          v-for="opt in targetTypeOptions"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>

      <div class="flex-1">
        <el-select
          v-if="target.target_type === 'role'"
          :model-value="target.target_id"
          placeholder="Select role"
          class="w-full"
          @update:model-value="updateTarget(index, { target_id: $event })"
        >
          <el-option
            v-for="role in roleOptions"
            :key="role.id"
            :label="role.name"
            :value="role.id"
          />
        </el-select>

        <el-select
          v-else-if="target.target_type === 'department'"
          :model-value="target.target_id"
          placeholder="Select department"
          class="w-full"
          @update:model-value="updateTarget(index, { target_id: $event })"
        >
          <el-option
            v-for="dept in departmentOptions"
            :key="dept.id"
            :label="dept.name"
            :value="dept.id"
          />
        </el-select>

        <el-select
          v-else-if="target.target_type === 'employee'"
          :model-value="target.target_id"
          filterable
          remote
          reserve-keyword
          :remote-method="onEmployeeSearch"
          :loading="employeeSearchLoading"
          placeholder="Search employee..."
          class="w-full"
          @update:model-value="updateTarget(index, { target_id: $event })"
        >
          <el-option
            v-for="emp in employeeOptions"
            :key="emp.id"
            :label="`${emp.full_name} (${emp.employee_id})`"
            :value="emp.id"
          />
        </el-select>

        <p v-if="targetError(index)" class="mt-1 text-xs text-red-500">{{ targetError(index) }}</p>
      </div>

      <el-tooltip v-if="modelValue.length > 1" content="Remove target" placement="top">
        <button
          type="button"
          class="p-2 rounded-md hover:bg-red-50 transition-colors text-slate-400 hover:text-red-600 mt-0.5"
          @click="removeTarget(index)"
        >
          <Trash2 class="w-4 h-4" />
        </button>
      </el-tooltip>
    </div>

    <p v-if="getFieldError(errors ?? {}, 'targets')" class="text-xs text-red-500">
      {{ getFieldError(errors ?? {}, 'targets') }}
    </p>

    <button
      type="button"
      class="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700"
      @click="addTarget"
    >
      <Plus class="w-4 h-4" />
      Add Target
    </button>
  </div>
</template>
