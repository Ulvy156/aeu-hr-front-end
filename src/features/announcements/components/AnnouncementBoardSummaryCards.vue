<script setup lang="ts">
import { Mail, MailOpen, TriangleAlert } from '@lucide/vue'
import type { AnnouncementBoardCounts } from '../types/announcement'

defineProps<{
  counts: AnnouncementBoardCounts
  loading: boolean
}>()
</script>

<template>
  <div v-if="loading" class="grid grid-cols-1 gap-4 sm:grid-cols-3">
    <div
      v-for="n in 3"
      :key="n"
      class="h-24 animate-pulse rounded-xl border border-gray-200 bg-white"
    />
  </div>

  <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-3">
    <div class="rounded-xl border border-gray-200 bg-white p-5">
      <div class="flex items-start gap-3">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          :class="counts.unread > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'"
        >
          <Mail class="h-5 w-5" />
        </div>
        <div>
          <p
            class="text-2xl font-semibold"
            :class="counts.unread > 0 ? 'text-amber-600' : 'text-slate-900'"
          >
            {{ counts.unread }}
          </p>
          <p class="text-sm text-slate-500">Unread</p>
        </div>
      </div>
    </div>

    <div class="rounded-xl border border-gray-200 bg-white p-5">
      <div class="flex items-start gap-3">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600"
        >
          <MailOpen class="h-5 w-5" />
        </div>
        <div>
          <p class="text-2xl font-semibold text-slate-900">{{ counts.all }}</p>
          <p class="text-sm text-slate-500">Published for you</p>
        </div>
      </div>
    </div>

    <div class="rounded-xl border border-gray-200 bg-white p-5">
      <div class="flex items-start gap-3">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          :class="
            counts.urgent_or_important > 0
              ? 'bg-amber-50 text-amber-600'
              : 'bg-slate-100 text-slate-600'
          "
        >
          <TriangleAlert class="h-5 w-5" />
        </div>
        <div>
          <p
            class="text-2xl font-semibold"
            :class="counts.urgent_or_important > 0 ? 'text-amber-600' : 'text-slate-900'"
          >
            {{ counts.urgent_or_important }}
          </p>
          <p class="text-sm text-slate-500">Urgent or important</p>
        </div>
      </div>
    </div>
  </div>
</template>
