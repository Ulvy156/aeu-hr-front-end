<script setup lang="ts">
import { StatusBadge } from '@/components/common'
import type { Announcement } from '../types/announcement'
import { announcementExcerpt, postedOn } from '../utils/announcementDisplay'

defineProps<{
  announcement: Announcement
  selected?: boolean
}>()

const emit = defineEmits<{
  click: [announcement: Announcement]
}>()
</script>

<template>
  <div class="flex cursor-pointer items-start gap-3 py-3" @click="emit('click', announcement)">
    <div class="min-w-0 flex-1">
      <p
        class="truncate text-sm"
        :class="
          announcement.is_read ? 'font-medium text-slate-700' : 'font-semibold text-slate-900'
        "
      >
        {{ announcement.title }}
      </p>
      <p class="mt-0.5 text-xs text-slate-500">
        {{ announcement.category?.name ?? 'Uncategorized' }}
        · {{ announcement.creator?.name ?? '—' }} · {{ postedOn(announcement) }}
      </p>
      <p class="mt-1 line-clamp-1 text-xs text-slate-400">
        {{ announcementExcerpt(announcement.content) }}
      </p>
    </div>
    <div class="flex shrink-0 flex-col items-end gap-2">
      <span
        v-if="!announcement.is_read"
        class="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700"
      >
        Unread
      </span>
      <StatusBadge v-else :status="announcement.priority" />
      <button
        type="button"
        class="text-xs font-medium text-emerald-700 hover:text-emerald-800"
        @click="emit('click', announcement)"
      >
        {{ selected ? 'Open' : 'Read' }}
      </button>
    </div>
  </div>
</template>
