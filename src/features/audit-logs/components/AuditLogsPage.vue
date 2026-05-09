<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { PageHeader, AppCard } from '@/components/common'
import { useAuditLogs } from '../composables/useAuditLogs'
import type { AuditLog, AuditLogFilterState } from '../types/audit-log'
import AuditLogFilters from './AuditLogFilters.vue'
import AuditLogTable from './AuditLogTable.vue'
import AuditLogDetailDrawer from './AuditLogDetailDrawer.vue'

const {
  logs,
  meta,
  loading,
  filters,
  loadLogs,
  applyFilters,
  onPageChange,
  onPageSizeChange,
} = useAuditLogs()

const drawerOpen = ref(false)
const selectedLog = ref<AuditLog | null>(null)

onMounted(() => loadLogs())

function handleView(log: AuditLog) {
  selectedLog.value = log
  drawerOpen.value = true
}

function handleApplyFilters(f: AuditLogFilterState) {
  applyFilters(f)
}
</script>

<template>
  <div>
    <PageHeader
      title="Audit Logs"
      subtitle="View system audit logs and user activity history."
    />

    <AppCard no-padding>
      <div class="px-5 py-4 border-b border-gray-100">
        <AuditLogFilters
          :filters="filters"
          @apply="handleApplyFilters"
        />
      </div>

      <AuditLogTable
        :logs="logs"
        :loading="loading"
        :current-page="meta.current_page"
        :page-size="meta.per_page"
        :total="meta.total"
        @view="handleView"
        @page-change="onPageChange"
        @size-change="onPageSizeChange"
      />
    </AppCard>

    <AuditLogDetailDrawer
      v-model:visible="drawerOpen"
      :log="selectedLog"
    />
  </div>
</template>
