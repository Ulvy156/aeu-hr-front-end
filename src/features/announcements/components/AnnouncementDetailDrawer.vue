<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Paperclip } from '@lucide/vue'
import { usePermission } from '@/composables/usePermissions'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { StatusBadge, BaseButton } from '@/components/common'
import { sanitizeHtml } from '@/utils/sanitizeHtml'
import AnnouncementReadSummary from './AnnouncementReadSummary.vue'
import type { Announcement, AnnouncementTarget } from '../types/announcement'

const props = defineProps<{
  visible: boolean
  announcement: Announcement | null
  loading?: boolean
  actionLoading?: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  submit: [announcement: Announcement]
  'cancel-submission': [announcement: Announcement]
  approve: [announcement: Announcement]
  reject: [announcement: Announcement]
  archive: [announcement: Announcement]
}>()

const router = useRouter()
const { can } = usePermission()
const auth = useAuthStore()

const isOwnAnnouncement = computed(() => {
  if (!props.announcement) return false
  return props.announcement.creator.id === auth.user?.id
})

const canEdit = computed(() => {
  const a = props.announcement
  return !!a && (a.status === 'draft' || a.status === 'rejected') && can('announcements.update')
})

const canSubmit = computed(() => {
  const a = props.announcement
  return !!a && (a.status === 'draft' || a.status === 'rejected') && can('announcements.submit')
})

const canCancelSubmission = computed(() => {
  const a = props.announcement
  return (
    !!a &&
    a.status === 'pending_approval' &&
    isOwnAnnouncement.value &&
    can('announcements.cancel_submission')
  )
})

const canApproveOrReject = computed(() => {
  const a = props.announcement
  return (
    !!a &&
    a.status === 'pending_approval' &&
    can('announcements.approve') &&
    !isOwnAnnouncement.value
  )
})

const canArchive = computed(() => {
  const a = props.announcement
  return !!a && a.status === 'published' && can('announcements.archive')
})

const hasActions = computed(
  () =>
    canEdit.value ||
    canSubmit.value ||
    canCancelSubmission.value ||
    canApproveOrReject.value ||
    canArchive.value,
)

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatTarget(target: AnnouncementTarget): string {
  switch (target.target_type) {
    case 'all':
      return 'All Employees'
    case 'role':
      return `Role #${target.target_id}`
    case 'department':
      return `Department #${target.target_id}`
    case 'employee':
      return `Employee #${target.target_id}`
    default:
      return target.target_type
  }
}

function handleEdit() {
  if (!props.announcement) return
  router.push({ name: 'announcement-edit', params: { id: props.announcement.id } })
}
</script>

<template>
  <el-drawer
    :model-value="visible"
    title="Announcement Detail"
    direction="rtl"
    size="520px"
    :before-close="() => emit('update:visible', false)"
    destroy-on-close
  >
    <div v-if="loading" class="flex items-center justify-center py-20 text-slate-400 text-sm">
      Loading announcement detail...
    </div>

    <div v-else-if="announcement" class="space-y-5">
      <!-- Header -->
      <div class="bg-gray-50 rounded-xl border border-gray-100 p-4 space-y-2">
        <div class="flex items-start justify-between gap-3">
          <h3 class="text-base font-semibold text-slate-900">{{ announcement.title }}</h3>
          <StatusBadge :status="announcement.status" />
        </div>
        <div class="flex items-center gap-2">
          <StatusBadge :status="announcement.priority" />
          <span class="text-xs text-slate-400">{{ announcement.category?.name ?? 'Uncategorized' }}</span>
        </div>
      </div>

      <!-- Rejection reason -->
      <div
        v-if="announcement.status === 'rejected' && announcement.rejection_reason"
        class="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700"
      >
        <p class="font-medium mb-1">Rejection Reason</p>
        <p>{{ announcement.rejection_reason }}</p>
        <p v-if="announcement.rejected_by_user" class="mt-1 text-xs text-red-500">
          by {{ announcement.rejected_by_user.name }}
          <template v-if="announcement.rejected_at"> · {{ formatDateTime(announcement.rejected_at) }}</template>
        </p>
      </div>

      <!-- Content -->
      <div class="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-400">Content</h4>
        <div class="announcement-content text-sm text-slate-700 leading-relaxed" v-html="sanitizeHtml(announcement.content)" />

        <a
          v-if="announcement.attachment"
          :href="announcement.attachment.url"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700"
        >
          <Paperclip class="w-4 h-4" />
          {{ announcement.attachment.name }}
        </a>
      </div>

      <!-- Targets -->
      <div class="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
        <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-400">Audience</h4>
        <div class="flex flex-wrap gap-1.5">
          <span
            v-for="(target, idx) in announcement.targets"
            :key="idx"
            class="text-xs px-2 py-1 rounded-md bg-slate-100 text-slate-600"
          >
            {{ formatTarget(target) }}
          </span>
        </div>
      </div>

      <!-- Read summary -->
      <AnnouncementReadSummary v-if="announcement.read_summary" :summary="announcement.read_summary" />

      <!-- Workflow info -->
      <div class="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-400">Workflow</h4>

        <div class="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p class="text-slate-400 text-xs mb-0.5">Created By</p>
            <p class="font-medium text-slate-800">{{ announcement.creator?.name }}</p>
          </div>
          <div>
            <p class="text-slate-400 text-xs mb-0.5">Created At</p>
            <p class="font-medium text-slate-800">{{ formatDateTime(announcement.created_at) }}</p>
          </div>
          <div v-if="announcement.submitted_by_user">
            <p class="text-slate-400 text-xs mb-0.5">Submitted By</p>
            <p class="font-medium text-slate-800">{{ announcement.submitted_by_user.name }}</p>
          </div>
          <div v-if="announcement.submitted_at">
            <p class="text-slate-400 text-xs mb-0.5">Submitted At</p>
            <p class="font-medium text-slate-800">{{ formatDateTime(announcement.submitted_at) }}</p>
          </div>
          <div v-if="announcement.approved_by_user">
            <p class="text-slate-400 text-xs mb-0.5">Approved By</p>
            <p class="font-medium text-slate-800">{{ announcement.approved_by_user.name }}</p>
          </div>
          <div v-if="announcement.approved_at">
            <p class="text-slate-400 text-xs mb-0.5">Approved At</p>
            <p class="font-medium text-slate-800">{{ formatDateTime(announcement.approved_at) }}</p>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div v-if="hasActions" class="flex flex-wrap gap-2 pt-2">
        <BaseButton
          v-if="canEdit"
          type="primary"
          class="!bg-emerald-600 !border-emerald-600 hover:!bg-emerald-700"
          @click="handleEdit"
        >
          Edit
        </BaseButton>
        <BaseButton
          v-if="canSubmit"
          type="primary"
          :loading="actionLoading"
          @click="emit('submit', announcement)"
        >
          Submit for Approval
        </BaseButton>
        <BaseButton
          v-if="canCancelSubmission"
          :loading="actionLoading"
          @click="emit('cancel-submission', announcement)"
        >
          Cancel Submission
        </BaseButton>
        <BaseButton
          v-if="canApproveOrReject"
          type="primary"
          class="!bg-emerald-600 !border-emerald-600 hover:!bg-emerald-700"
          :loading="actionLoading"
          @click="emit('approve', announcement)"
        >
          Approve
        </BaseButton>
        <BaseButton
          v-if="canApproveOrReject"
          type="danger"
          :loading="actionLoading"
          @click="emit('reject', announcement)"
        >
          Reject
        </BaseButton>
        <BaseButton
          v-if="canArchive"
          type="warning"
          :loading="actionLoading"
          @click="emit('archive', announcement)"
        >
          Archive
        </BaseButton>
      </div>
    </div>

    <div v-else class="flex items-center justify-center py-20 text-slate-400 text-sm">
      No announcement selected.
    </div>
  </el-drawer>
</template>

<style scoped>
.announcement-content :deep(p) {
  margin-bottom: 0.5rem;
}

.announcement-content :deep(ul),
.announcement-content :deep(ol) {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.announcement-content :deep(ul) {
  list-style-type: disc;
}

.announcement-content :deep(ol) {
  list-style-type: decimal;
}

.announcement-content :deep(a) {
  color: #059669;
  text-decoration: underline;
}
</style>
