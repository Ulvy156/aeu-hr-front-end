<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  status: string
  customLabel?: string
}>()

type TagType = 'success' | 'info' | 'warning' | 'danger' | 'primary'

interface StatusConfig {
  type: TagType
  label: string
}

const statusMap: Record<string, StatusConfig> = {
  active: { type: 'success', label: 'Active' },
  inactive: { type: 'info', label: 'Inactive' },
  pending: { type: 'warning', label: 'Pending' },
  approved: { type: 'success', label: 'Approved' },
  rejected: { type: 'danger', label: 'Rejected' },
  present: { type: 'success', label: 'Present' },
  absent: { type: 'danger', label: 'Absent' },
  late: { type: 'warning', label: 'Late' },
  submitted: { type: 'info', label: 'Submitted' },
  locked: { type: 'info', label: 'Locked' },
  paid: { type: 'success', label: 'Paid' },
  cancelled: { type: 'info', label: 'Cancelled' },
  draft: { type: 'info', label: 'Draft' },
  pending_approval: { type: 'warning', label: 'Pending Approval' },
  on_leave: { type: 'warning', label: 'On Leave' },
  published: { type: 'success', label: 'Published' },
  archived: { type: 'info', label: 'Archived' },
  normal: { type: 'info', label: 'Normal' },
  important: { type: 'warning', label: 'Important' },
  urgent: { type: 'danger', label: 'Urgent' },
}

const config = computed<StatusConfig>(() => {
  const key = props.status?.toLowerCase()
  return statusMap[key] ?? { type: 'info', label: props.status ?? '' }
})
</script>

<template>
  <el-tag :type="config.type" size="small" round disable-transitions>
    {{ customLabel ?? config.label }}
  </el-tag>
</template>
