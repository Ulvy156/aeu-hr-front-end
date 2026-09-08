<script setup lang="ts">
import { BasePagination } from '@/components/common'
import type { PaginationMeta } from '../types/report'

defineProps<{
  loading: boolean
  error: string | null
  meta: PaginationMeta | null
}>()

const emit = defineEmits<{
  'page-change': [page: number]
  'page-size-change': [size: number]
}>()
</script>

<template>
  <div v-if="error" class="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700">
    {{ error }}
  </div>

  <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
    <div class="relative">
      <div
        v-if="loading"
        class="absolute inset-0 z-10 flex items-center justify-center bg-white/70"
      >
        <div
          class="h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent"
        />
      </div>
      <slot />
    </div>
    <BasePagination
      v-if="meta"
      :current-page="meta.current_page"
      :page-size="meta.per_page"
      :total="meta.total"
      @update:current-page="emit('page-change', $event)"
      @update:page-size="emit('page-size-change', $event)"
    />
  </div>
</template>
