<script setup lang="ts">
import { Loader2 } from '@lucide/vue'

defineProps<{
  loading?: boolean
  total?: number
  page?: number
  pageSize?: number
  emptyText?: string
}>()

defineEmits<{
  'update:page': [page: number]
  'update:pageSize': [size: number]
}>()
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
    <!-- Table header: title, actions -->
    <div v-if="$slots.header" class="px-6 py-4 border-b border-gray-100">
      <slot name="header" />
    </div>

    <!-- Filter bar -->
    <div v-if="$slots.filters" class="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
      <slot name="filters" />
    </div>

    <!-- Loading overlay -->
    <div v-if="loading" class="px-6 py-12 flex items-center justify-center">
      <Loader2 class="w-7 h-7 text-emerald-600 animate-spin" />
      <span class="ml-3 text-sm text-slate-500">Loading...</span>
    </div>

    <!-- Table content -->
    <div v-else>
      <slot />
    </div>

    <!-- Pagination -->
    <div
      v-if="!loading && total !== undefined && total > 0"
      class="px-6 py-4 border-t border-gray-100 flex items-center justify-between"
    >
      <p class="text-sm text-slate-500">
        Total <span class="font-medium text-slate-700">{{ total }}</span> records
      </p>
      <el-pagination
        :current-page="page ?? 1"
        :page-size="pageSize ?? 15"
        :total="total"
        :page-sizes="[10, 15, 25, 50]"
        layout="sizes, prev, pager, next"
        small
        @current-change="$emit('update:page', $event)"
        @size-change="$emit('update:pageSize', $event)"
      />
    </div>
  </div>
</template>
