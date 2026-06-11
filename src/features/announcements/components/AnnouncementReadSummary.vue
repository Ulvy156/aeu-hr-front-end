<script setup lang="ts">
import type { AnnouncementReadSummary } from '../types/announcement'

defineProps<{
  summary: AnnouncementReadSummary
}>()
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
    <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-400">Read Progress</h4>

    <div class="flex items-center gap-4 text-sm">
      <div>
        <span class="font-semibold text-emerald-600">{{ summary.total_viewed }}</span>
        <span class="text-slate-500"> viewed</span>
      </div>
      <div>
        <span class="font-semibold text-amber-600">{{ summary.total_unread }}</span>
        <span class="text-slate-500"> unread</span>
      </div>
    </div>

    <el-tabs class="announcement-read-tabs">
      <el-tab-pane :label="`Viewed (${summary.viewed_employees.length})`">
        <div v-if="summary.viewed_employees.length" class="max-h-48 overflow-y-auto space-y-1.5">
          <div
            v-for="emp in summary.viewed_employees"
            :key="emp.id"
            class="flex items-center justify-between text-sm py-1 border-b border-gray-50 last:border-0"
          >
            <span class="text-slate-700">{{ emp.full_name }}</span>
            <span class="text-xs text-slate-400">{{ emp.employee_id }}</span>
          </div>
        </div>
        <p v-else class="text-sm text-slate-400 py-2">No one has viewed this announcement yet.</p>
      </el-tab-pane>

      <el-tab-pane :label="`Unread (${summary.unread_employees.length})`">
        <div v-if="summary.unread_employees.length" class="max-h-48 overflow-y-auto space-y-1.5">
          <div
            v-for="emp in summary.unread_employees"
            :key="emp.id"
            class="flex items-center justify-between text-sm py-1 border-b border-gray-50 last:border-0"
          >
            <span class="text-slate-700">{{ emp.full_name }}</span>
            <span class="text-xs text-slate-400">{{ emp.employee_id }}</span>
          </div>
        </div>
        <p v-else class="text-sm text-slate-400 py-2">Everyone has viewed this announcement.</p>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style scoped>
.announcement-read-tabs :deep(.el-tabs__header) {
  margin-bottom: 8px;
}
</style>
