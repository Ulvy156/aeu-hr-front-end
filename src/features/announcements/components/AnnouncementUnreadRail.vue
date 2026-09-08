<script setup lang="ts">
import { computed } from 'vue'
import type { Announcement } from '../types/announcement'
import { announcementPriorityLabel } from '../utils/announcementDisplay'

const props = defineProps<{
  announcements: Announcement[]
  selectedId: number | null
}>()

const emit = defineEmits<{
  open: [announcement: Announcement]
}>()

const unread = computed(() => props.announcements.filter((row) => !row.is_read))
</script>

<template>
  <div v-if="unread.length" class="border-t border-gray-100 p-5 lg:border-t-0 lg:border-l">
    <div class="mb-4 flex items-center justify-between gap-2">
      <h2 class="text-sm font-semibold text-slate-900">Unread</h2>
      <span class="text-xs text-slate-400">{{ unread.length }} left</span>
    </div>

    <div class="divide-y divide-gray-100">
      <button
        v-for="row in unread"
        :key="row.id"
        type="button"
        class="block w-full py-3 text-left transition-colors first:pt-0 last:pb-0 hover:bg-gray-50"
        @click="emit('open', row)"
      >
        <p class="truncate text-sm font-medium text-slate-900">{{ row.title }}</p>
        <p class="mt-0.5 text-xs text-slate-500">
          {{ row.category?.name ?? 'Uncategorized' }} ·
          {{ announcementPriorityLabel(row.priority) }}
        </p>
        <p class="mt-1 text-xs font-medium text-emerald-700">
          {{ selectedId === row.id ? 'Open' : 'Read' }}
        </p>
      </button>
    </div>
  </div>
</template>
