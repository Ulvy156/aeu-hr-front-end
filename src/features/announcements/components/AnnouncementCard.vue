<script setup lang="ts">
import { StatusBadge } from '@/components/common'
import { stripHtml } from '@/utils/sanitizeHtml'
import type { Announcement } from '../types/announcement'

defineProps<{
  announcement: Announcement
}>()

const emit = defineEmits<{
  click: [announcement: Announcement]
}>()

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div
    class="bg-white border rounded-xl p-4 cursor-pointer transition-colors hover:border-emerald-300"
    :class="announcement.is_read ? 'border-gray-200' : 'border-emerald-200 bg-emerald-50/30'"
    @click="emit('click', announcement)"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="flex items-start gap-2 min-w-0">
        <span
          v-if="!announcement.is_read"
          class="mt-1.5 w-2 h-2 rounded-full bg-emerald-500 shrink-0"
        />
        <div class="min-w-0">
          <h3
            class="text-sm truncate"
            :class="announcement.is_read ? 'font-medium text-slate-700' : 'font-semibold text-slate-900'"
          >
            {{ announcement.title }}
          </h3>
          <p class="text-xs text-slate-400 mt-0.5">
            {{ announcement.category?.name ?? 'Uncategorized' }} · {{ formatDateTime(announcement.created_at) }}
          </p>
        </div>
      </div>
      <StatusBadge :status="announcement.priority" />
    </div>

    <p class="mt-2 text-sm text-slate-500 line-clamp-2">{{ stripHtml(announcement.content) }}</p>
  </div>
</template>
