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
  probation: { type: 'warning', label: 'Probation' },
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
  open: { type: 'success', label: 'Open' },
  closed: { type: 'info', label: 'Closed' },
  new: { type: 'info', label: 'New' },
  shortlisted: { type: 'primary', label: 'Shortlisted' },
  contacting_candidate: { type: 'warning', label: 'Contacting Candidate' },
  interview: { type: 'warning', label: 'Interview' },
  offer_extended: { type: 'primary', label: 'Offer Extended' },
  offer_accepted: { type: 'success', label: 'Offer Accepted' },
  hired: { type: 'success', label: 'Hired' },
  company_rejected: { type: 'danger', label: 'Company Rejected' },
  candidate_declined: { type: 'danger', label: 'Candidate Declined' },
  no_show: { type: 'danger', label: 'No Show' },
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
