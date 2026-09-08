<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { useNotify } from '@/composables/useNotify'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { Plus } from '@lucide/vue'
import { PageHeader, AppCard, BaseButton } from '@/components/common'
import { usePermission } from '@/composables/usePermissions'
import { useVacancies } from '../composables/useVacancies'
import { closeVacancy } from '../services/vacancy.api'
import { remainingHeadcount } from '../utils/vacancyDisplay'
import type { Vacancy } from '../types/vacancy'
import VacancyFilters from './VacancyFilters.vue'
import VacancyTable from './VacancyTable.vue'
import VacancyFormDialog from './VacancyFormDialog.vue'
import VacancySummaryCards from './VacancySummaryCards.vue'
import VacancyStillHiring from './VacancyStillHiring.vue'

const router = useRouter()
const { can } = usePermission()
const notify = useNotify()
const {
  vacancies,
  summary,
  meta,
  loading,
  filters,
  loadVacancies,
  applyFilters,
  onPageChange,
  onPageSizeChange,
} = useVacancies()

const formOpen = ref(false)
const selectedVacancy = ref<Vacancy | null>(null)

const showStillHiring = computed(() =>
  vacancies.value.some((row) => row.status === 'open' && remainingHeadcount(row) > 0),
)

const overdueMessage = computed(() => {
  const count = summary.value.overdue_open_count
  if (count <= 0) return ''
  if (count === 1) return '1 open vacancy is past its target hiring date.'
  return `${count} open vacancies are past their target hiring date.`
})

onMounted(loadVacancies)

function handleCreate() {
  selectedVacancy.value = null
  formOpen.value = true
}

function handleEdit(vacancy: Vacancy) {
  selectedVacancy.value = vacancy
  formOpen.value = true
}

function handleView(vacancy: Vacancy) {
  router.push({ name: 'vacancy-detail', params: { id: vacancy.id } })
}

async function handleClose(vacancy: Vacancy) {
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to close "${vacancy.title}"? This action cannot be undone.`,
      'Close Vacancy',
      {
        confirmButtonText: 'Close Vacancy',
        cancelButtonText: 'Cancel',
        type: 'warning',
        confirmButtonClass: 'el-button--danger',
      },
    )
  } catch {
    return
  }

  try {
    await closeVacancy(vacancy.id)
    notify.success('Vacancy closed successfully.')
    await loadVacancies()
  } catch (err) {
    notify.error(getApiErrorMessage(err))
  }
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Vacancies" subtitle="Manage job vacancies and hiring targets.">
      <template #action>
        <BaseButton v-if="can('recruitment.vacancies.create')" type="primary" @click="handleCreate">
          <Plus class="mr-1.5 h-4 w-4" />
          Create Vacancy
        </BaseButton>
      </template>
    </PageHeader>

    <VacancySummaryCards :summary="summary" :loading="loading && vacancies.length === 0" />

    <div
      v-if="overdueMessage"
      class="rounded-lg border border-amber-100 bg-amber-50 p-3 text-sm text-amber-700"
    >
      {{ overdueMessage }} Close or update the date if hiring slipped.
    </div>

    <AppCard no-padding>
      <div class="border-b border-gray-100 px-5 py-4">
        <VacancyFilters
          :search="filters.search"
          :department="filters.department"
          :status="filters.status"
          :target-hiring-date="filters.target_hiring_date"
          :summary="summary"
          @apply="applyFilters"
        />
      </div>

      <div :class="showStillHiring ? 'lg:grid lg:grid-cols-[minmax(0,1fr)_260px]' : ''">
        <VacancyTable
          :vacancies="vacancies"
          :loading="loading"
          :current-page="meta.current_page"
          :page-size="meta.per_page"
          :total="meta.total"
          @view="handleView"
          @edit="handleEdit"
          @close="handleClose"
          @page-change="onPageChange"
          @size-change="onPageSizeChange"
        />

        <VacancyStillHiring :vacancies="vacancies" @view="handleView" />
      </div>
    </AppCard>

    <VacancyFormDialog
      v-model:visible="formOpen"
      :vacancy="selectedVacancy"
      @saved="loadVacancies"
    />
  </div>
</template>
