<script setup lang="ts">
import { ref } from 'vue'
import { Search } from '@lucide/vue'
import type { AuditLogFilterState, AuditUserOption } from '../types/audit-log'
import BaseInput from '@/components/common/BaseInput.vue';
import BaseButton from '@/components/common/BaseButton.vue';

const props = defineProps<{
  filters: AuditLogFilterState
  users: AuditUserOption[]
}>()

const emit = defineEmits<{
  apply: [filters: AuditLogFilterState]
}>()

const localUserId = ref<number | null>(props.filters.userId)
const localModule = ref(props.filters.module)
const localAction = ref(props.filters.action)
const localDateFrom = ref<string | null>(props.filters.dateFrom || null)
const localDateTo = ref<string | null>(props.filters.dateTo || null)

function handleSearch() {
  emit('apply', {
    userId: localUserId.value,
    module: localModule.value,
    action: localAction.value,
    dateFrom: localDateFrom.value ?? '',
    dateTo: localDateTo.value ?? '',
  })
}

function handleReset() {
  localUserId.value = null
  localModule.value = ''
  localAction.value = ''
  localDateFrom.value = null
  localDateTo.value = null
  emit('apply', { userId: null, module: '', action: '', dateFrom: '', dateTo: '' })
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <!-- Row 1 -->
    <div class="flex flex-wrap items-center gap-3">
      <el-select
        v-model="localUserId"
        placeholder="All Users"
        class="w-48"
        clearable
        filterable
      >
        <el-option
          v-for="u in users"
          :key="u.id"
          :label="u.name"
          :value="u.id"
        />
      </el-select>

      <BaseInput
        v-model="localModule"
        placeholder="Module (e.g. users, departments...)"
        clearable
        class="w-52"
      >
        <template #prefix>
          <Search class="w-4 h-4 text-slate-400" />
        </template>
      </BaseInput>

      <BaseInput
        v-model="localAction"
        placeholder="Action (e.g. created, updated...)"
        clearable
        class="w-52"
      >
        <template #prefix>
          <Search class="w-4 h-4 text-slate-400" />
        </template>
      </BaseInput>
    </div>

    <!-- Row 2 -->
    <div class="flex flex-wrap items-center gap-3">
      <el-date-picker
        v-model="localDateFrom"
        type="date"
        placeholder="Date from"
        value-format="YYYY-MM-DD"
        class="w-44"
        clearable
      />

      <el-date-picker
        v-model="localDateTo"
        type="date"
        placeholder="Date to"
        value-format="YYYY-MM-DD"
        class="w-44"
        clearable
      />

      <BaseButton type="primary" @click="handleSearch">Search</BaseButton>
      <BaseButton @click="handleReset">Reset</BaseButton>
    </div>
  </div>
</template>
