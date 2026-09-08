<script setup lang="ts">
import { computed } from 'vue'
import { AppCard, BaseButton, StatusBadge } from '@/components/common'
import { usePermission } from '@/composables/usePermissions'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import type { Announcement } from '../types/announcement'
import {
  announcementExcerpt,
  announcementStatusLabel,
  announcementTimeline,
  audienceLabel,
  announcementPriorityLabel,
} from '../utils/announcementDisplay'

const props = defineProps<{
  announcement: Announcement
}>()

const emit = defineEmits<{
  view: [announcement: Announcement]
  approve: [announcement: Announcement]
  reject: [announcement: Announcement]
}>()

const { can } = usePermission()
const auth = useAuthStore()

const isOwn = computed(() => props.announcement.creator?.id === auth.user?.id)
const canDecide = computed(
  () =>
    props.announcement.status === 'pending_approval' &&
    can('announcements.approve') &&
    !isOwn.value,
)
const submittedBy = computed(
  () => props.announcement.submitted_by_user?.name ?? props.announcement.creator?.name ?? '',
)
</script>

<template>
  <AppCard>
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-xs font-medium uppercase tracking-wide text-slate-400">Needs a decision</p>
        <h2 class="mt-1 text-lg font-semibold text-slate-900">{{ announcement.title }}</h2>
      </div>
      <StatusBadge
        :status="announcement.status"
        :custom-label="announcementStatusLabel(announcement.status)"
      />
    </div>

    <p class="mt-2 text-sm text-slate-500">
      {{ announcement.category?.name ?? 'Uncategorized' }}
      · {{ audienceLabel(announcement.targets) }} · {{ announcementTimeline(announcement) }}
    </p>
    <p class="mt-2 text-sm text-slate-600">{{ announcementExcerpt(announcement.content) }}</p>

    <div class="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <div class="flex flex-wrap gap-2">
        <BaseButton
          v-if="canDecide"
          type="primary"
          class="!border-emerald-600 !bg-emerald-600 hover:!bg-emerald-700"
          @click="emit('approve', announcement)"
        >
          Approve
        </BaseButton>
        <BaseButton v-if="canDecide" type="danger" plain @click="emit('reject', announcement)">
          Reject
        </BaseButton>
        <BaseButton @click="emit('view', announcement)">Open detail</BaseButton>
      </div>

      <div class="space-y-3">
        <div class="flex flex-wrap gap-2">
          <span
            class="rounded-md px-2 py-0.5 text-xs font-medium"
            :class="
              announcement.priority === 'urgent'
                ? 'bg-red-50 text-red-700'
                : announcement.priority === 'important'
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-slate-100 text-slate-600'
            "
          >
            {{ announcementPriorityLabel(announcement.priority) }}
          </span>
          <span class="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
            {{ audienceLabel(announcement.targets) }}
          </span>
        </div>
        <p class="rounded-lg border border-gray-100 bg-slate-50 px-3 py-2 text-xs text-slate-500">
          <template v-if="announcement.status === 'pending_approval'">
            Submitted by {{ submittedBy }}. Creator cannot approve their own announcement.
          </template>
          <template v-else>
            {{ announcement.category?.name ?? 'Uncategorized' }} ·
            {{ announcementTimeline(announcement) }}
          </template>
        </p>
      </div>
    </div>
  </AppCard>
</template>
