<script setup lang="ts">
import { Loader2 } from '@lucide/vue'

defineProps<{
  loading: boolean
  rows?: number
  type?: 'skeleton' | 'spinner'
}>()
</script>

<template>
  <template v-if="loading">
    <!-- Skeleton rows (default for cards/pages) -->
    <div v-if="type !== 'spinner'" class="p-4">
      <el-skeleton :rows="rows ?? 5" animated />
    </div>

    <!-- Centered spinner (for tables/overlays) -->
    <div v-else class="flex items-center justify-center py-16">
      <Loader2 class="w-8 h-8 text-emerald-600 animate-spin" />
      <span class="ml-3 text-sm text-slate-500">Loading...</span>
    </div>
  </template>

  <slot v-else />
</template>
