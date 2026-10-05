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
import AnnouncementNeedsAttention from './AnnouncementNeedsAttention.vue'
import AnnouncementDetailDrawer from './AnnouncementDetailDrawer.vue'
import type { Announcement } from '../types/announcement'

const router = useRouter()
const { can } = usePermission()
const notify = useNotify()
const {
  announcements,
  statusCounts,
  latestRejected,
  meta,
  loading,
  actionLoading,
  filters,
  loadAnnouncements,
  applyFilters,
  onPageChange,
  onPageSizeChange,
  handlePublish,
  handleArchive,
} = useAnnouncements()

const drawerOpen = ref(false)
const detailLoading = ref(false)
const selectedAnnouncement = ref<Announcement | null>(null)

const publishConfirmOpen = ref(false)
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

function openPublishConfirm(announcement: Announcement) {
  if (announcement) selectedAnnouncement.value = announcement
  publishConfirmOpen.value = true
}

function openArchiveConfirm(announcement?: Announcement) {
  if (announcement) selectedAnnouncement.value = announcement
  archiveConfirmOpen.value = true
}

async function confirmPublish() {
  if (!selectedAnnouncement.value) return
  const ok = await handlePublish(selectedAnnouncement.value.id)
  if (ok) {
    publishConfirmOpen.value = false
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
            Save a draft, preview it, and publish it when ready.
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

    <div
      v-if="rejectedMessage"
      class="rounded-lg border border-amber-100 bg-amber-50 p-3 text-sm text-amber-700"
    >
      {{ rejectedMessage }} Edit the draft and preview it before publishing.
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
          @publish="handleView"
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
      @publish="openPublishConfirm"
      @archive="openArchiveConfirm"
    />

    <ConfirmDialog
      v-model="publishConfirmOpen"
      title="Publish Announcement"
      message="This announcement will become visible to its selected audience immediately."
      confirm-text="Publish Now"
      type="info"
      :loading="actionLoading"
      @confirm="confirmPublish"
      @cancel="publishConfirmOpen = false"
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
