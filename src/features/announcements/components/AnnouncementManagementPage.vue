<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Megaphone, Plus } from '@lucide/vue'
import { useNotify } from '@/composables/useNotify'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { usePermission } from '@/composables/usePermissions'
import { AppCard, BaseButton, ConfirmDialog } from '@/components/common'
import { useAnnouncements } from '../composables/useAnnouncements'
import { fetchAnnouncement } from '../services/announcement.api'
import { needsAttention } from '../utils/announcementDisplay'
import AnnouncementFilters from './AnnouncementFilters.vue'
import AnnouncementTable from './AnnouncementTable.vue'
import AnnouncementSummaryCards from './AnnouncementSummaryCards.vue'
import AnnouncementPendingCard from './AnnouncementPendingCard.vue'
import AnnouncementNeedsAttention from './AnnouncementNeedsAttention.vue'
import AnnouncementDetailDrawer from './AnnouncementDetailDrawer.vue'
import RejectAnnouncementDialog from './RejectAnnouncementDialog.vue'
import type { Announcement } from '../types/announcement'

const router = useRouter()
const { can } = usePermission()
const notify = useNotify()
const {
  announcements,
  statusCounts,
  pendingAnnouncement,
  latestRejected,
  meta,
  loading,
  actionLoading,
  filters,
  loadAnnouncements,
  applyFilters,
  onPageChange,
  onPageSizeChange,
  handleSubmit,
  handleCancelSubmission,
  handleApprove,
  handleReject,
  handleArchive,
} = useAnnouncements()

const drawerOpen = ref(false)
const detailLoading = ref(false)
const selectedAnnouncement = ref<Announcement | null>(null)

const submitConfirmOpen = ref(false)
const cancelSubmissionConfirmOpen = ref(false)
const approveConfirmOpen = ref(false)
const rejectDialogOpen = ref(false)
const archiveConfirmOpen = ref(false)

const showNeedsAttention = computed(() => announcements.value.some(needsAttention))
const rejectedMessage = computed(() => {
  const item = latestRejected.value
  if (!item || statusCounts.value.rejected <= 0) return ''
  if (filters.status === 'pending_approval') return ''
  if (item.rejection_reason) return `${item.title} — ${item.rejection_reason}`
  return `${item.title} was rejected.`
})

onMounted(loadAnnouncements)

function handleCreate() {
  router.push({ name: 'announcement-create' })
}

async function handleView(announcement: Announcement) {
  selectedAnnouncement.value = announcement
  drawerOpen.value = true
  detailLoading.value = true
  try {
    const res = await fetchAnnouncement(announcement.id)
    selectedAnnouncement.value = res.data
  } catch (err) {
    notify.error(getApiErrorMessage(err))
  } finally {
    detailLoading.value = false
  }
}

async function refreshDetail() {
  if (!selectedAnnouncement.value) return
  try {
    const res = await fetchAnnouncement(selectedAnnouncement.value.id)
    selectedAnnouncement.value = res.data
  } catch {
    // ignore refresh errors, list will still reflect latest state
  }
}

function openSubmitConfirm(announcement?: Announcement) {
  if (announcement) selectedAnnouncement.value = announcement
  submitConfirmOpen.value = true
}

function openCancelSubmissionConfirm(announcement?: Announcement) {
  if (announcement) selectedAnnouncement.value = announcement
  cancelSubmissionConfirmOpen.value = true
}

function openApproveConfirm(announcement?: Announcement) {
  if (announcement) selectedAnnouncement.value = announcement
  approveConfirmOpen.value = true
}

function openRejectDialog(announcement?: Announcement) {
  if (announcement) selectedAnnouncement.value = announcement
  rejectDialogOpen.value = true
}

function openArchiveConfirm(announcement?: Announcement) {
  if (announcement) selectedAnnouncement.value = announcement
  archiveConfirmOpen.value = true
}

async function confirmSubmit() {
  if (!selectedAnnouncement.value) return
  const ok = await handleSubmit(selectedAnnouncement.value.id)
  if (ok) {
    submitConfirmOpen.value = false
    await refreshDetail()
  }
}

async function confirmCancelSubmission() {
  if (!selectedAnnouncement.value) return
  const ok = await handleCancelSubmission(selectedAnnouncement.value.id)
  if (ok) {
    cancelSubmissionConfirmOpen.value = false
    await refreshDetail()
  }
}

async function confirmApprove() {
  if (!selectedAnnouncement.value) return
  const ok = await handleApprove(selectedAnnouncement.value.id)
  if (ok) {
    approveConfirmOpen.value = false
    await refreshDetail()
  }
}

async function confirmReject(reason: string) {
  if (!selectedAnnouncement.value) return
  const ok = await handleReject(selectedAnnouncement.value.id, { rejection_reason: reason })
  if (ok) {
    rejectDialogOpen.value = false
    await refreshDetail()
  }
}

async function confirmArchive() {
  if (!selectedAnnouncement.value) return
  const ok = await handleArchive(selectedAnnouncement.value.id)
  if (ok) {
    archiveConfirmOpen.value = false
    await refreshDetail()
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-start justify-between">
      <div class="flex items-center gap-3">
        <div class="shrink-0 rounded-xl border border-emerald-100 bg-emerald-50 p-2">
          <Megaphone class="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h1 class="text-2xl font-semibold text-slate-900">Announcements</h1>
          <p class="mt-0.5 text-sm text-slate-500">
            Create, review, and publish company announcements.
          </p>
        </div>
      </div>
      <BaseButton
        v-if="can('announcements.create')"
        type="primary"
        class="!border-emerald-600 !bg-emerald-600 hover:!bg-emerald-700"
        @click="handleCreate"
      >
        <Plus class="mr-1.5 h-4 w-4" />
        New Announcement
      </BaseButton>
    </div>

    <AnnouncementSummaryCards
      :counts="statusCounts"
      :loading="loading && announcements.length === 0"
    />

    <AnnouncementPendingCard
      v-if="pendingAnnouncement"
      :announcement="pendingAnnouncement"
      @view="handleView"
      @approve="openApproveConfirm"
      @reject="openRejectDialog"
    />

    <div
      v-if="rejectedMessage"
      class="rounded-lg border border-amber-100 bg-amber-50 p-3 text-sm text-amber-700"
    >
      {{ rejectedMessage }} Edit and resubmit when ready.
    </div>

    <AppCard no-padding>
      <div class="border-b border-gray-100 px-5 py-4">
        <AnnouncementFilters
          :search="filters.search"
          :category="filters.category"
          :priority="filters.priority"
          :status="filters.status"
          :created-by="filters.created_by"
          :counts="statusCounts"
          @apply="applyFilters"
        />
      </div>

      <div :class="showNeedsAttention ? 'lg:grid lg:grid-cols-[minmax(0,1fr)_260px]' : ''">
        <AnnouncementTable
          :announcements="announcements"
          :loading="loading"
          :current-page="meta.current_page"
          :page-size="meta.per_page"
          :total="meta.total"
          @view="handleView"
          @submit="openSubmitConfirm"
          @approve="openApproveConfirm"
          @reject="openRejectDialog"
          @archive="openArchiveConfirm"
          @page-change="onPageChange"
          @size-change="onPageSizeChange"
        />

        <AnnouncementNeedsAttention :announcements="announcements" @view="handleView" />
      </div>
    </AppCard>

    <AnnouncementDetailDrawer
      v-model:visible="drawerOpen"
      :announcement="selectedAnnouncement"
      :loading="detailLoading"
      :action-loading="actionLoading"
      @submit="openSubmitConfirm"
      @cancel-submission="openCancelSubmissionConfirm"
      @approve="openApproveConfirm"
      @reject="openRejectDialog"
      @archive="openArchiveConfirm"
    />

    <ConfirmDialog
      v-model="submitConfirmOpen"
      title="Submit for Approval"
      message="Are you sure you want to submit this announcement for approval?"
      confirm-text="Submit"
      type="info"
      :loading="actionLoading"
      @confirm="confirmSubmit"
      @cancel="submitConfirmOpen = false"
    />

    <ConfirmDialog
      v-model="cancelSubmissionConfirmOpen"
      title="Cancel Submission"
      message="Are you sure you want to cancel this submission? The announcement will return to draft."
      confirm-text="Cancel Submission"
      type="warning"
      :loading="actionLoading"
      @confirm="confirmCancelSubmission"
      @cancel="cancelSubmissionConfirmOpen = false"
    />

    <ConfirmDialog
      v-model="approveConfirmOpen"
      title="Approve Announcement"
      message="Are you sure you want to approve and publish this announcement?"
      confirm-text="Approve"
      type="info"
      :loading="actionLoading"
      @confirm="confirmApprove"
      @cancel="approveConfirmOpen = false"
    />

    <RejectAnnouncementDialog
      v-model:visible="rejectDialogOpen"
      :loading="actionLoading"
      @reject="confirmReject"
    />

    <ConfirmDialog
      v-model="archiveConfirmOpen"
      title="Archive Announcement"
      message="Are you sure you want to archive this announcement? It will no longer be visible to employees."
      confirm-text="Archive"
      type="warning"
      :loading="actionLoading"
      @confirm="confirmArchive"
      @cancel="archiveConfirmOpen = false"
    />
  </div>
</template>
