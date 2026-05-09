<script setup lang="ts">
import { ref } from 'vue'
import { Search } from '@lucide/vue'
import type { AuditLogFilterState } from '../types/audit-log'
import { searchUsers } from '@/features/users/services/user.api'
import type { UserSearchOption } from '@/features/users/services/user.api'
import BaseInput from '@/components/common/BaseInput.vue';
import SearchButton from '@/components/resuable/SearchButton.vue';
import ResetButton from '@/components/resuable/ResetButton.vue';

const props = defineProps<{
  filters: AuditLogFilterState
}>()

const emit = defineEmits<{
  apply: [filters: AuditLogFilterState]
}>()

const localUserId = ref<number | null>(props.filters.userId)
const localModule = ref(props.filters.module)
const localAction = ref(props.filters.action)
const localDateFrom = ref<string | null>(props.filters.dateFrom || null)
const localDateTo = ref<string | null>(props.filters.dateTo || null)

const userOptions = ref<UserSearchOption[]>([])
const loadingUsers = ref(false)

let debounceTimer: ReturnType<typeof setTimeout> | null = null

function onUserSearch(query: string) {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => fetchUserOptions(query), 300)
}

async function fetchUserOptions(query: string) {
  if (!query || query.length < 2) {
    userOptions.value = []
    return
  }
  loadingUsers.value = true
  try {
    userOptions.value = await searchUsers(query)
  } catch {
    userOptions.value = []
  } finally {
    loadingUsers.value = false
  }
}

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
  userOptions.value = []
  emit('apply', { userId: null, module: '', action: '', dateFrom: '', dateTo: '' })
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <!-- Row 1 -->
    <div class="flex  items-center gap-3">
      <el-select
        v-model="localUserId"
        placeholder="Search user..."
        class="w-48"
        clearable
        filterable
        remote
        :remote-method="onUserSearch"
        :loading="loadingUsers"
      >
        <el-option
          v-for="u in userOptions"
          :key="u.user_id"
          :label="u.display"
          :value="u.user_id"
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
    <div class="flex justify-between items-center gap-3">
      <div class="flex gap-x-5">
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
      </div>
      <div class="flex">
        <SearchButton @click="handleSearch"/>
        <ResetButton @click="handleReset"/>
      </div>
    </div>
  </div>
</template>
