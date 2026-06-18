<script setup lang="ts">
import { ref } from 'vue'
import { HardDrive } from '@lucide/vue'
import { AppCard } from '@/components/common'
import BaseButton from '@/components/common/BaseButton.vue'
import { useNotify } from '@/composables/useNotify'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { downloadBackup } from '../services/backup.service'

const notify = useNotify()
const downloading = ref(false)

async function handleDownload() {
  downloading.value = true
  try {
    const { blob, filename } = await downloadBackup()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    window.URL.revokeObjectURL(url)
    notify.success('Backup downloaded successfully.')
  } catch (err) {
    notify.error(getApiErrorMessage(err))
  } finally {
    downloading.value = false
  }
}
</script>

<template>
  <AppCard>
    <template #header>
      <div class="flex items-center gap-2.5">
        <div class="p-1.5 bg-emerald-50 rounded-lg shrink-0">
          <HardDrive class="w-4 h-4 text-emerald-600" />
        </div>
        <div>
          <h2 class="text-base font-semibold text-slate-900">Database Backup</h2>
          <p class="text-sm text-slate-500 mt-0.5">Download a manual backup of the database.</p>
        </div>
      </div>
    </template>

    <div class="space-y-4">
      <div class="rounded-lg border border-amber-100 bg-amber-50 p-3 text-sm text-amber-700">
        Backup generation may take a few seconds depending on the database size.
      </div>

      <BaseButton
        type="primary"
        :loading="downloading"
        :disabled="downloading"
        class="!bg-emerald-600 !border-emerald-600 hover:!bg-emerald-700 hover:!border-emerald-700"
        @click="handleDownload"
      >
        {{ downloading ? 'Generating Backup...' : 'Download Backup' }}
      </BaseButton>
    </div>
  </AppCard>
</template>
