<script setup lang="ts">
import { ref } from 'vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'

const sidebarCollapsed = ref(false)

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}
</script>

<template>
  <div class="flex h-screen bg-gray-50 overflow-hidden">
    <AppSidebar :collapsed="sidebarCollapsed" @toggle="toggleSidebar" />

    <main class="flex-1 overflow-y-auto">
      <div class="p-6">
        <RouterView />
      </div>
    </main>
  </div>
</template>
