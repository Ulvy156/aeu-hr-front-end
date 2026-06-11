<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus } from '@lucide/vue'
import { PageHeader, AppCard, BaseButton } from '@/components/common'
import { usePermission } from '@/composables/usePermissions'
import { useCandidates } from '../composables/useCandidates'
import { useCandidateStatus } from '../composables/useCandidateStatus'
import type { Candidate } from '../types/candidate'
import CandidateFilters from './CandidateFilters.vue'
import CandidateTable from './CandidateTable.vue'
import CandidateStatusDialog from './CandidateStatusDialog.vue'

const router = useRouter()
const { can } = usePermission()
const {
  candidates,
  meta,
  loading,
  filters,
  loadCandidates,
  applyFilters,
  onPageChange,
  onPageSizeChange,
} = useCandidates()

const { actionLoading, changeStatus } = useCandidateStatus()

const statusDialogOpen = ref(false)
const selectedCandidate = ref<Candidate | null>(null)

onMounted(loadCandidates)

function handleCreate() {
  router.push({ name: 'candidate-create' })
}

function handleEdit(candidate: Candidate) {
  router.push({ name: 'candidate-edit', params: { id: candidate.id } })
}

function handleStatusChange(candidate: Candidate) {
  selectedCandidate.value = candidate
  statusDialogOpen.value = true
}

async function submitStatusChange(status: Candidate['status'], outcomeReason: string | null) {
  if (!selectedCandidate.value) return
  const updated = await changeStatus(selectedCandidate.value.id, {
    status,
    outcome_reason: outcomeReason,
  })
  if (updated) {
    statusDialogOpen.value = false
    await loadCandidates()
  }
}
</script>

<template>
  <div>
    <PageHeader title="Candidates" subtitle="Track candidates through the recruitment pipeline.">
      <template #action>
        <BaseButton v-if="can('recruitment.candidates.create')" type="primary" @click="handleCreate">
          <Plus class="w-4 h-4 mr-1.5" />
          Add Candidate
        </BaseButton>
      </template>
    </PageHeader>

    <AppCard no-padding>
      <div class="px-5 py-4 border-b border-gray-100">
        <CandidateFilters
          :search="filters.search"
          :vacancy="filters.vacancy"
          :source="filters.source"
          :status="filters.status"
          :interview-date="filters.interview_date"
          @apply="applyFilters"
        />
      </div>

      <CandidateTable
        :candidates="candidates"
        :loading="loading"
        :current-page="meta.current_page"
        :page-size="meta.per_page"
        :total="meta.total"
        @edit="handleEdit"
        @status-change="handleStatusChange"
        @page-change="onPageChange"
        @size-change="onPageSizeChange"
      />
    </AppCard>

    <CandidateStatusDialog
      v-model:visible="statusDialogOpen"
      :candidate="selectedCandidate"
      :loading="actionLoading"
      @submit="submitStatusChange"
    />
  </div>
</template>
