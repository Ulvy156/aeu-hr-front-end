<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, BriefcaseBusiness, Plus } from '@lucide/vue'
import { usePermission } from '@/composables/usePermissions'
import { useVacancyDetail } from '../composables/useVacancyDetail'
import { useCandidates } from '../composables/useCandidates'
import { useCandidateStatus } from '../composables/useCandidateStatus'
import { AppCard, BaseButton, StatusBadge, ConfirmDialog } from '@/components/common'
import { sanitizeHtml } from '@/utils/sanitizeHtml'
import CandidateTable from './CandidateTable.vue'
import CandidateStatusDialog from './CandidateStatusDialog.vue'
import type { Candidate } from '../types/candidate'

const route = useRoute()
const router = useRouter()
const { can } = usePermission()

const vacancyId = computed(() => Number(route.params.id))

const { vacancy, loading, actionLoading, loadVacancy, handleClose } = useVacancyDetail()
const {
  candidates,
  meta,
  loading: candidatesLoading,
  loadCandidates,
  onPageChange,
  onPageSizeChange,
} = useCandidates(vacancyId.value)

const { actionLoading: statusActionLoading, changeStatus } = useCandidateStatus()

const closeConfirmOpen = ref(false)
const statusDialogOpen = ref(false)
const selectedCandidate = ref<Candidate | null>(null)

const canClose = computed(() => vacancy.value?.status === 'open' && can('recruitment.vacancies.close'))
const canCreateCandidate = computed(
  () => vacancy.value?.status === 'open' && can('recruitment.candidates.create'),
)

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

onMounted(async () => {
  await loadVacancy(vacancyId.value)
  await loadCandidates()
})

async function confirmClose() {
  const ok = await handleClose(vacancyId.value)
  if (ok) closeConfirmOpen.value = false
}

function handleAddCandidate() {
  router.push({ name: 'candidate-create', query: { vacancy_id: String(vacancyId.value) } })
}

function handleEditCandidate(candidate: Candidate) {
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
    if (updated.status === 'hired') {
      await loadVacancy(vacancyId.value)
    }
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-start justify-between">
      <div class="flex items-center gap-3">
        <button
          class="p-2 rounded-lg hover:bg-gray-100 text-slate-500 hover:text-slate-700 transition-colors"
          @click="router.back()"
        >
          <ArrowLeft class="w-4 h-4" />
        </button>
        <div class="flex items-center gap-3">
          <div class="p-2 bg-emerald-50 rounded-xl border border-emerald-100 shrink-0">
            <BriefcaseBusiness class="w-5 h-5 text-emerald-600" />
          </div>
          <div v-if="vacancy">
            <div class="flex items-center gap-2">
              <h1 class="text-2xl font-semibold text-slate-900">{{ vacancy.title }}</h1>
              <StatusBadge :status="vacancy.status" />
            </div>
            <p class="mt-0.5 text-sm text-slate-500">{{ vacancy.department?.name ?? '—' }}</p>
          </div>
          <div v-else-if="loading">
            <div class="h-8 w-60 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      </div>

      <div v-if="vacancy" class="flex items-center gap-2">
        <BaseButton v-if="canClose" type="danger" :loading="actionLoading" @click="closeConfirmOpen = true">
          Close Vacancy
        </BaseButton>
      </div>
    </div>

    <div v-if="loading" class="space-y-4">
      <div class="h-32 bg-gray-100 rounded-xl animate-pulse" />
      <div class="h-64 bg-gray-100 rounded-xl animate-pulse" />
    </div>

    <template v-else-if="vacancy">
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <AppCard>
          <p class="text-xs text-slate-400 mb-1">Headcount</p>
          <p class="text-lg font-semibold text-slate-800">
            {{ vacancy.filled_headcount }} / {{ vacancy.required_headcount }}
          </p>
        </AppCard>
        <AppCard>
          <p class="text-xs text-slate-400 mb-1">Target Hiring Date</p>
          <p class="text-lg font-semibold text-slate-800">{{ formatDate(vacancy.target_hiring_date) }}</p>
        </AppCard>
        <AppCard>
          <p class="text-xs text-slate-400 mb-1">Created By</p>
          <p class="text-lg font-semibold text-slate-800">{{ vacancy.creator?.name ?? '—' }}</p>
        </AppCard>
        <AppCard>
          <p class="text-xs text-slate-400 mb-1">Created At</p>
          <p class="text-lg font-semibold text-slate-800">{{ formatDate(vacancy.created_at) }}</p>
        </AppCard>
      </div>

      <AppCard title="Description">
        <div class="vacancy-description text-sm text-slate-600 leading-relaxed" v-html="sanitizeHtml(vacancy.description)" />
      </AppCard>

      <AppCard no-padding>
        <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 class="text-sm font-semibold text-slate-800">Candidates</h3>
            <p class="text-xs text-slate-400 mt-0.5">Candidates who applied for this vacancy.</p>
          </div>
          <BaseButton v-if="canCreateCandidate" type="primary" size="small" @click="handleAddCandidate">
            <Plus class="w-4 h-4 mr-1.5" />
            Add Candidate
          </BaseButton>
        </div>

        <CandidateTable
          :candidates="candidates"
          :loading="candidatesLoading"
          :current-page="meta.current_page"
          :page-size="meta.per_page"
          :total="meta.total"
          :show-vacancy-column="false"
          @edit="handleEditCandidate"
          @status-change="handleStatusChange"
          @page-change="onPageChange"
          @size-change="onPageSizeChange"
        />
      </AppCard>
    </template>

    <div v-else class="text-center py-20 text-slate-400 text-sm">Vacancy not found.</div>

    <ConfirmDialog
      v-model="closeConfirmOpen"
      title="Close Vacancy"
      message="Are you sure you want to close this vacancy? This action cannot be undone, and candidates can no longer be added once closed."
      confirm-text="Close Vacancy"
      type="warning"
      :loading="actionLoading"
      @confirm="confirmClose"
      @cancel="closeConfirmOpen = false"
    />

    <CandidateStatusDialog
      v-model:visible="statusDialogOpen"
      :candidate="selectedCandidate"
      :loading="statusActionLoading"
      @submit="submitStatusChange"
    />
  </div>
</template>

<style scoped>
.vacancy-description :deep(p) {
  margin-bottom: 0.5rem;
}

.vacancy-description :deep(ul),
.vacancy-description :deep(ol) {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.vacancy-description :deep(ul) {
  list-style-type: disc;
}

.vacancy-description :deep(ol) {
  list-style-type: decimal;
}

.vacancy-description :deep(a) {
  color: #059669;
  text-decoration: underline;
}
</style>
