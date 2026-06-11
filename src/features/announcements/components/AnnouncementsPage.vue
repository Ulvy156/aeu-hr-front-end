<script setup lang="ts">
import { usePermission } from '@/composables/usePermissions'
import AnnouncementManagementPage from './AnnouncementManagementPage.vue'
import AnnouncementBoardPage from './AnnouncementBoardPage.vue'

const { can } = usePermission()
</script>

<template>
  <AnnouncementManagementPage v-if="can('announcements.view_draft')" />
  <AnnouncementBoardPage v-else />
</template>
