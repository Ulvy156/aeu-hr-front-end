<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { PageHeader, AppCard } from '@/components/common'
import { useAuditLogs } from '../composables/useAuditLogs'
import { fetchUsers } from '@/features/users/services/user.api'
import type { AuditLog, AuditUserOption, AuditLogFilterState } from '../types/audit-log'
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

const userOptions = ref<AuditUserOption[]>([])
const drawerOpen = ref(false)
const selectedLog = ref<AuditLog | null>(null)

onMounted(async () => {
  await loadLogs()
  try {
    const res = await fetchUsers({ per_page: 100 })
    userOptions.value = res.data.map((u) => ({ id: u.id, name: u.name }))
  } catch {
    // non-critical — user filter will be empty
  }
})

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
          :users="userOptions"
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
