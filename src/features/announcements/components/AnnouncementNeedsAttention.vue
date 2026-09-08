<script setup lang="ts">
import { computed } from 'vue'
import { StatusBadge } from '@/components/common'
import type { Announcement } from '../types/announcement'
import { announcementTimeline, needsAttention } from '../utils/announcementDisplay'

const props = defineProps<{
  announcements: Announcement[]
}>()

const emit = defineEmits<{
  view: [announcement: Announcement]
}>()

const queue = computed(() => props.announcements.filter(needsAttention))
</script>

<template>
  <div v-if="queue.length" class="border-t border-gray-100 p-5 lg:border-t-0 lg:border-l">
    <div class="mb-4 flex items-center justify-between gap-2">
      <h2 class="text-sm font-semibold text-slate-900">Needs attention</h2>
      <span class="text-xs text-slate-400">{{ queue.length }} open</span>
    </div>

    <div class="divide-y divide-gray-100">
      <button
        v-for="row in queue"
        :key="row.id"
        type="button"
        class="block w-full py-3 text-left transition-colors first:pt-0 last:pb-0 hover:bg-gray-50"
        @click="emit('view', row)"
      >
        <p class="truncate text-sm font-medium text-slate-900">{{ row.title }}</p>
        <p
          v-if="row.status === 'rejected' && row.rejection_reason"
          class="mt-0.5 line-clamp-2 text-xs text-slate-500"
        >
          {{ row.rejection_reason }}
        </p>
        <p v-else class="mt-0.5 text-xs text-slate-500">
          {{ row.creator?.name ?? '—' }} · {{ announcementTimeline(row) }}
        </p>
        <div class="mt-2">
          <StatusBadge :status="row.status" />
        </div>
      </button>
    </div>
  </div>
</template>
