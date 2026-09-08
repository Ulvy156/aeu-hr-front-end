<script setup lang="ts">
import { Download } from '@lucide/vue'
import { BaseButton } from '@/components/common'

defineProps<{
  title: string
  description: string
  canExport: boolean
  exportLoading: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  export: []
}>()
</script>

<template>
  <div class="flex items-start gap-4">
    <div class="min-w-0 flex-1">
      <h2 class="text-lg font-semibold text-slate-900">{{ title }}</h2>
      <p class="mt-0.5 text-sm text-slate-500">{{ description }}</p>
    </div>
    <BaseButton
      v-if="canExport"
      type="primary"
      class="shrink-0 !border-emerald-600 !bg-emerald-600 hover:!bg-emerald-700"
      :loading="exportLoading"
      :disabled="exportLoading || loading"
      @click="emit('export')"
    >
      <Download class="mr-1.5 h-4 w-4" />
      {{ exportLoading ? 'Exporting…' : 'Export Excel' }}
    </BaseButton>
  </div>
</template>
