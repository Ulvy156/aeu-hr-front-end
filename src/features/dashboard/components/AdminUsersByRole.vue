<script setup lang="ts">
import { computed } from 'vue'
import { Shield } from '@lucide/vue'
import { AppCard, AppChart } from '@/components/common'
import type { UsersByRole } from '../types/dashboard'
import { formatRoleLabel, roleMixEntries } from '../utils/dashboardDisplay'
import { chartColorForRole } from '@/utils/chartTheme'

const props = defineProps<{
  usersByRole: UsersByRole
  totalUsers: number
}>()

const entries = computed(() => roleMixEntries(props.usersByRole))

const chartOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c} ({d}%)',
  },
  series: [
    {
      name: 'Users by role',
      type: 'pie',
      radius: ['48%', '72%'],
      center: ['50%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 6,
        borderColor: '#fff',
        borderWidth: 2,
      },
      label: { show: false },
      labelLine: { show: false },
      data: entries.value.map((entry) => ({
        name: formatRoleLabel(entry.role),
        value: entry.count,
        itemStyle: { color: chartColorForRole(entry.role) },
      })),
    },
  ],
}))
</script>

<template>
  <AppCard>
    <div class="mb-4 flex items-center gap-2">
      <Shield class="h-4 w-4 text-slate-400" />
      <h2 class="text-base font-semibold text-slate-900">Users by role</h2>
    </div>

    <div class="relative mx-auto max-w-xs">
      <AppChart :option="chartOption" :height="208" />
      <div class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <p class="text-2xl font-semibold text-slate-900">{{ totalUsers }}</p>
        <p class="text-xs text-slate-500">users</p>
      </div>
    </div>

    <div class="mt-2 grid grid-cols-2 gap-3">
      <div
        v-for="entry in entries"
        :key="entry.role"
        class="rounded-lg border border-gray-100 bg-slate-50 p-3"
      >
        <div class="mb-1 flex items-center gap-1.5">
          <span
            class="h-2 w-2 rounded-full"
            :style="{ backgroundColor: chartColorForRole(entry.role) }"
          />
          <p class="text-xs text-slate-500">{{ formatRoleLabel(entry.role) }}</p>
        </div>
        <p class="text-lg font-semibold text-slate-900">{{ entry.count }}</p>
      </div>
    </div>
  </AppCard>
</template>
