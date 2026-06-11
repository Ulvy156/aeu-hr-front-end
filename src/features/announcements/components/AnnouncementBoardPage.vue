<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Megaphone } from '@lucide/vue'
import { useNotify } from '@/composables/useNotify'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { EmptyState, BasePagination } from '@/components/common'
import { useAnnouncements } from '../composables/useAnnouncements'
import { fetchAnnouncement } from '../services/announcement.api'
import AnnouncementBoardFilters from './AnnouncementBoardFilters.vue'
import AnnouncementCard from './AnnouncementCard.vue'
import AnnouncementDetailDrawer from './AnnouncementDetailDrawer.vue'
import type { Announcement } from '../types/announcement'

const notify = useNotify()
const { announcements, meta, loading, loadAnnouncements, applyFilters, onPageChange, onPageSizeChange, markLocalAsRead } =
  useAnnouncements()

const drawerOpen = ref(false)
const detailLoading = ref(false)
const selectedAnnouncement = ref<Announcement | null>(null)

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
      <div class="p-2 bg-emerald-50 rounded-xl border border-emerald-100 shrink-0">
        <Megaphone class="w-5 h-5 text-emerald-600" />
      </div>
      <div>
        <h1 class="text-2xl font-semibold text-slate-900">Announcements</h1>
        <p class="mt-0.5 text-sm text-slate-500">Stay up to date with company announcements.</p>
      </div>
    </div>

    <AnnouncementBoardFilters @apply="applyFilters" />

    <div class="relative">
      <div
        v-if="loading"
        class="absolute inset-0 bg-white/70 flex items-center justify-center z-10 rounded-xl"
      >
        <div class="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>

      <div v-if="announcements.length" class="space-y-3">
        <AnnouncementCard
          v-for="announcement in announcements"
          :key="announcement.id"
          :announcement="announcement"
          @click="handleOpen"
        />
      </div>

      <div v-else class="bg-white border border-gray-200 rounded-xl">
        <EmptyState
          title="No announcements found"
          description="There are no announcements for you right now."
        />
      </div>
    </div>

    <BasePagination
      :current-page="meta.current_page"
      :page-size="meta.per_page"
      :total="meta.total"
      @update:current-page="onPageChange"
      @update:page-size="onPageSizeChange"
    />

    <AnnouncementDetailDrawer
      v-model:visible="drawerOpen"
      :announcement="selectedAnnouncement"
      :loading="detailLoading"
    />
  </div>
</template>
