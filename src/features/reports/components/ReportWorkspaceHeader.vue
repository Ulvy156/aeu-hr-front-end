<script setup lang="ts">
import { Download, FileText } from '@lucide/vue'
import { BaseButton } from '@/components/common'

withDefaults(
  defineProps<{
    title: string
    description: string
    canExport: boolean
    exportLoading: boolean
    loading?: boolean
    canExportPdf?: boolean
    pdfExportLoading?: boolean
  }>(),
  {
    loading: false,
    canExportPdf: false,
    pdfExportLoading: false,
  },
)

const emit = defineEmits<{
  export: []
  'export-pdf': []
}>()
</script>

<template>
  <div class="flex items-start gap-4">
    <div class="min-w-0 flex-1">
      <h2 class="text-lg font-semibold text-slate-900">{{ title }}</h2>
      <p class="mt-0.5 text-sm text-slate-500">{{ description }}</p>
    </div>
    <div class="flex shrink-0 flex-wrap items-center justify-end gap-2">
      <BaseButton
        v-if="canExport"
        type="primary"
        class="!border-emerald-600 !bg-emerald-600 hover:!bg-emerald-700"
        :loading="exportLoading"
        :disabled="exportLoading || loading || pdfExportLoading"
        @click="emit('export')"
      >
        <Download class="mr-1.5 h-4 w-4" />
        {{ exportLoading ? 'Exporting…' : 'Export Excel' }}
      </BaseButton>
      <BaseButton
        v-if="canExportPdf"
        type="default"
        :loading="pdfExportLoading"
        :disabled="pdfExportLoading || loading || exportLoading"
        @click="emit('export-pdf')"
      >
        <FileText class="mr-1.5 h-4 w-4" />
        {{ pdfExportLoading ? 'Exporting…' : 'Export PDF' }}
      </BaseButton>
    </div>
  </div>
</template>
