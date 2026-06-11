<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus } from '@lucide/vue'
import { useNotify } from '@/composables/useNotify'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { usePermission } from '@/composables/usePermissions'
import { AppCard, BaseButton, ConfirmDialog, PageHeader } from '@/components/common'
import { useAnnouncements } from '../composables/useAnnouncements'
import { fetchAnnouncement } from '../services/announcement.api'
import AnnouncementFilters from './AnnouncementFilters.vue'
import AnnouncementTable from './AnnouncementTable.vue'
import AnnouncementDetailDrawer from './AnnouncementDetailDrawer.vue'
import RejectAnnouncementDialog from './RejectAnnouncementDialog.vue'
import type { Announcement } from '../types/announcement'

const router = useRouter()
const { can } = usePermission()
const notify = useNotify()
const {
  announcements,
  meta,
  loading,
  actionLoading,
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

function openSubmitConfirm() {
  submitConfirmOpen.value = true
}

function openCancelSubmissionConfirm() {
  cancelSubmissionConfirmOpen.value = true
}

function openApproveConfirm() {
  approveConfirmOpen.value = true
}

function openRejectDialog() {
  rejectDialogOpen.value = true
}

function openArchiveConfirm() {
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
    <PageHeader
      title="Announcements"
      subtitle="Create, review, and publish company announcements."
    >
      <template #action>
        <BaseButton
          v-if="can('announcements.create')"
          type="primary"
          class="!bg-emerald-600 !border-emerald-600 hover:!bg-emerald-700"
          @click="handleCreate"
        >
          <Plus class="w-4 h-4 mr-1.5" />
          New Announcement
        </BaseButton>
      </template>
    </PageHeader>

    <AnnouncementFilters @apply="applyFilters" />

    <AppCard no-padding>
      <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 class="text-sm font-semibold text-slate-800">Announcements</h3>
          <p class="text-xs text-slate-400 mt-0.5">All announcements you have access to view.</p>
        </div>
        <span class="text-xs text-slate-400 font-medium">{{ meta.total }} records</span>
      </div>

      <AnnouncementTable
        :announcements="announcements"
        :loading="loading"
        :current-page="meta.current_page"
        :page-size="meta.per_page"
        :total="meta.total"
        @view="handleView"
        @page-change="onPageChange"
        @size-change="onPageSizeChange"
      />
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
