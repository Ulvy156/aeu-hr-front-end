<template>
  <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
    <div
      v-for="card in summaryCards"
      :key="card.label"
      class="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
    >
      <div :class="['shrink-0 rounded-lg p-2.5', card.iconBg]">
        <component :is="card.icon" :class="['h-5 w-5', card.iconColor]" />
      </div>

      <div>
        <p class="text-xs font-medium text-slate-500">{{ card.label }}</p>
        <p class="mt-0.5 text-2xl font-bold text-slate-900">
          {{ card.value }}
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { BriefcaseBusiness, Crown, ShieldUser, UserCog } from '@lucide/vue'
import { computed, onBeforeMount, shallowRef, watch } from 'vue'
import { fetchUserSummary } from '../services/user.api'
import type { UserSummary } from '../types/user'

const props = defineProps<{
  isLoadUser: boolean
}>()

const userSummary = shallowRef<UserSummary>()

async function loadUserSummary() {
  const res = await fetchUserSummary()
  userSummary.value = res.data
}

watch(
  () => props.isLoadUser,
  async (isLoadUser) => {
    if (!isLoadUser) return

    await loadUserSummary()
  }
)

onBeforeMount(async () => {
    await loadUserSummary()
})
const summaryCards = computed(() => {
  const roles = userSummary.value?.users_by_role

  return [
    {
      label: 'Admin Users',
      value: roles?.admin ?? 0,
      icon: ShieldUser,
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-700',
    },
    {
      label: 'HR Users',
      value: roles?.hr ?? 0,
      icon: UserCog,
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
    },
    {
      label: 'CEO Users',
      value: roles?.ceo ?? 0,
      icon: Crown,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
    {
      label: 'Employee Users',
      value: roles?.employee ?? 0,
      icon: BriefcaseBusiness,
      iconBg: 'bg-green-50',
      iconColor: 'text-green-600',
    },
  ]
})
</script>