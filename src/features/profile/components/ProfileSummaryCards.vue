<script setup lang="ts">
import { computed } from 'vue'
import type { ProfileUser } from '../types/profile'
import {
  formatProfileDate,
  profilePermissionCountLabel,
  profileTenureLabel,
  profileValue,
} from '../utils/profileDisplay'

const props = defineProps<{
  profile?: ProfileUser | null
  loading?: boolean
}>()

const emp = computed(() => props.profile?.employee ?? null)

const linkedFacts = computed(() => {
  if (!props.profile || !emp.value) return []
  return [
    { label: 'Joined', value: formatProfileDate(emp.value.join_date) },
    { label: 'Tenure', value: profileTenureLabel(emp.value.join_date) },
    { label: 'Phone', value: profileValue(emp.value.phone_number) },
    { label: 'Roles', value: String(props.profile.roles.length) },
  ]
})

const unlinkedFacts = computed(() => {
  if (!props.profile) return []
  return [
    { label: 'Roles', value: String(props.profile.roles.length) },
    {
      label: 'Permissions',
      value: profilePermissionCountLabel(props.profile.permissions),
    },
    {
      label: 'Account status',
      value: props.profile.status
        ? props.profile.status.charAt(0).toUpperCase() + props.profile.status.slice(1)
        : '—',
    },
  ]
})
</script>

<template>
  <div v-if="loading" class="grid grid-cols-2 gap-4 lg:grid-cols-4">
    <div
      v-for="n in 4"
      :key="n"
      class="h-24 animate-pulse rounded-xl border border-gray-200 bg-white"
    />
  </div>

  <div v-else-if="emp" class="grid grid-cols-2 gap-4 lg:grid-cols-4">
    <div
      v-for="fact in linkedFacts"
      :key="fact.label"
      class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
    >
      <p class="text-xl font-semibold text-slate-900">{{ fact.value }}</p>
      <p class="mt-1 text-sm text-slate-500">{{ fact.label }}</p>
    </div>
  </div>

  <div v-else-if="profile" class="grid grid-cols-1 gap-4 sm:grid-cols-3">
    <div
      v-for="fact in unlinkedFacts"
      :key="fact.label"
      class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
    >
      <p class="text-xl font-semibold text-slate-900">{{ fact.value }}</p>
      <p class="mt-1 text-sm text-slate-500">{{ fact.label }}</p>
    </div>
  </div>
</template>
