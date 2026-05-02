<script setup lang="ts">
defineProps<{
  currentPage: number
  pageSize: number
  total: number
  pageSizes?: number[]
}>()

const emit = defineEmits<{
  'update:currentPage': [page: number]
  'update:pageSize': [size: number]
  change: [page: number, size: number]
}>()

function onPageChange(page: number) {
  emit('update:currentPage', page)
  emit('change', page, 0)
}

function onSizeChange(size: number) {
  emit('update:pageSize', size)
  emit('change', 1, size)
}
</script>

<template>
  <div class="flex items-center justify-between py-4 px-6 border-t border-gray-100">
    <p class="text-sm text-slate-500">
      Total <span class="font-medium text-slate-700">{{ total }}</span> records
    </p>

    <el-pagination
      :current-page="currentPage"
      :page-size="pageSize"
      :total="total"
      :page-sizes="pageSizes ?? [10, 15, 25, 50]"
      layout="sizes, prev, pager, next"
      small
      @current-change="onPageChange"
      @size-change="onSizeChange"
    />
  </div>
</template>
