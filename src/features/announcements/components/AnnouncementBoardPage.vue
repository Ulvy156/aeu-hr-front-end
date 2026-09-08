<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Megaphone } from '@lucide/vue'
import { useNotify } from '@/composables/useNotify'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { AppCard, EmptyState, BasePagination } from '@/components/common'
import { useAnnouncements } from '../composables/useAnnouncements'
import { fetchAnnouncement } from '../services/announcement.api'
import AnnouncementBoardFilters from './AnnouncementBoardFilters.vue'
import AnnouncementBoardSummaryCards from './AnnouncementBoardSummaryCards.vue'
import AnnouncementFeaturedCard from './AnnouncementFeaturedCard.vue'
import AnnouncementCard from './AnnouncementCard.vue'
import AnnouncementUnreadRail from './AnnouncementUnreadRail.vue'
import AnnouncementDetailDrawer from './AnnouncementDetailDrawer.vue'
import type { Announcement } from '../types/announcement'

const notify = useNotify()
const {
  announcements,
  boardCounts,
  featuredAnnouncement,
  meta,
  loading,
  filters,
  loadAnnouncements,
  applyFilters,
  onPageChange,
  onPageSizeChange,
  markLocalAsRead,
} = useAnnouncements()

const drawerOpen = ref(false)
const detailLoading = ref(false)
const selectedAnnouncement = ref<Announcement | null>(null)

const showUnreadRail = computed(() => announcements.value.some((row) => !row.is_read))

onMounted(loadAnnouncements)

async function handleOpen(announcement: Announcement) {
  selectedAnnouncement.value = announcement
  drawerOpen.value = true
  detailLoading.value = true
  try {
    const res = await fetchAnnouncement(announcement.id)
    selectedAnnouncement.value = res.data
    markLocalAsRead(announcement.id)
  } catch (err) {
    const message = getApiErrorMessage(err)
    if (message === 'No employee profile is linked to this user account.') {
      notify.info(message)
      drawerOpen.value = false
    } else {
      notify.error(message)
    }
  } finally {
    detailLoading.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-3">
      <div class="shrink-0 rounded-xl border border-emerald-100 bg-emerald-50 p-2">
        <Megaphone class="h-5 w-5 text-emerald-600" />
      </div>
      <div>
        <h1 class="text-2xl font-semibold text-slate-900">Announcements</h1>
        <p class="mt-0.5 text-sm text-slate-500">Stay up to date with company announcements.</p>
      </div>
    </div>

    <AnnouncementBoardSummaryCards
      :counts="boardCounts"
      :loading="loading && announcements.length === 0"
    />

    <AnnouncementFeaturedCard
      v-if="featuredAnnouncement"
      :announcement="featuredAnnouncement"
      :open="selectedAnnouncement?.id === featuredAnnouncement.id && drawerOpen"
      @open="handleOpen"
    />

    <AppCard no-padding>
      <div class="border-b border-gray-100 px-5 py-4">
        <AnnouncementBoardFilters
          :search="filters.search"
          :category="filters.category"
          :priority="filters.priority"
          :read-status="filters.read_status"
          :counts="boardCounts"
          @apply="applyFilters"
        />
      </div>

      <div
        class="relative"
        :class="showUnreadRail ? 'lg:grid lg:grid-cols-[minmax(0,1fr)_240px]' : ''"
      >
        <div
          v-if="loading"
          class="absolute inset-0 z-10 flex items-center justify-center rounded-b-xl bg-white/70"
        >
          <div
            class="h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent"
          />
        </div>

        <div class="px-5">
          <div v-if="announcements.length" class="divide-y divide-gray-100">
            <AnnouncementCard
              v-for="announcement in announcements"
              :key="announcement.id"
              :announcement="announcement"
              :selected="selectedAnnouncement?.id === announcement.id && drawerOpen"
              @click="handleOpen"
            />
          </div>
          <EmptyState
            v-else
            title="No announcements found"
            description="There are no announcements for you right now."
          />
          <BasePagination
            :current-page="meta.current_page"
            :page-size="meta.per_page"
            :total="meta.total"
            @update:current-page="onPageChange"
            @update:page-size="onPageSizeChange"
          />
        </div>

        <AnnouncementUnreadRail
          :announcements="announcements"
          :selected-id="drawerOpen ? (selectedAnnouncement?.id ?? null) : null"
          @open="handleOpen"
        />
      </div>
    </AppCard>

    <AnnouncementDetailDrawer
      v-model:visible="drawerOpen"
      :announcement="selectedAnnouncement"
      :loading="detailLoading"
    />
  </div>
</template>
