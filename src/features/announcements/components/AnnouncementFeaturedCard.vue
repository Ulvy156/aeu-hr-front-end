<script setup lang="ts">
import { AppCard, BaseButton, StatusBadge } from '@/components/common'
import type { Announcement } from '../types/announcement'
import { announcementExcerpt, postedOn } from '../utils/announcementDisplay'

defineProps<{
  announcement: Announcement
  open: boolean
}>()

const emit = defineEmits<{
  open: [announcement: Announcement]
}>()
</script>

<template>
  <AppCard>
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-xs font-medium uppercase tracking-wide text-slate-400">For you</p>
        <h2 class="mt-1 text-lg font-semibold text-slate-900">{{ announcement.title }}</h2>
      </div>
      <span
        class="rounded-md px-2 py-0.5 text-xs font-medium"
        :class="
          announcement.is_read ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-700'
        "
      >
        {{ announcement.is_read ? 'Latest' : 'Unread' }}
      </span>
    </div>

    <p class="mt-2 text-sm text-slate-500">
      {{ announcement.category?.name ?? 'Uncategorized' }}
      · Posted by {{ announcement.creator?.name ?? '—' }} · {{ postedOn(announcement) }}
    </p>
    <p class="mt-2 text-sm text-slate-600">{{ announcementExcerpt(announcement.content) }}</p>

    <div class="mt-5 flex flex-wrap items-center gap-2">
      <BaseButton
        type="primary"
        class="!border-emerald-600 !bg-emerald-600 hover:!bg-emerald-700"
        @click="emit('open', announcement)"
      >
        {{ open ? 'Reading' : 'Open' }}
      </BaseButton>
      <StatusBadge :status="announcement.priority" />
      <span v-if="announcement.attachment" class="text-xs text-slate-400">
        {{ announcement.attachment.name }}
      </span>
    </div>
  </AppCard>
</template>
