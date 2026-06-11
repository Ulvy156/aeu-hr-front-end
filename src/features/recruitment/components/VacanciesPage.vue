<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { useNotify } from '@/composables/useNotify'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { Plus } from '@lucide/vue'
import { PageHeader, AppCard, BaseButton } from '@/components/common'
import { usePermission } from '@/composables/usePermissions'
import { useVacancies } from '../composables/useVacancies'
import { closeVacancy } from '../services/vacancy.api'
import type { Vacancy } from '../types/vacancy'
import VacancyFilters from './VacancyFilters.vue'
import VacancyTable from './VacancyTable.vue'
import VacancyFormDialog from './VacancyFormDialog.vue'

const router = useRouter()
const { can } = usePermission()
const notify = useNotify()
const {
  vacancies,
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
  <div>
    <PageHeader title="Vacancies" subtitle="Manage job vacancies and hiring targets.">
      <template #action>
        <BaseButton v-if="can('recruitment.vacancies.create')" type="primary" @click="handleCreate">
          <Plus class="w-4 h-4 mr-1.5" />
          Create Vacancy
        </BaseButton>
      </template>
    </PageHeader>

    <AppCard no-padding>
      <div class="px-5 py-4 border-b border-gray-100">
        <VacancyFilters
          :search="filters.search"
          :department="filters.department"
          :status="filters.status"
          :target-hiring-date="filters.target_hiring_date"
          @apply="applyFilters"
        />
      </div>

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
    </AppCard>

    <VacancyFormDialog v-model:visible="formOpen" :vacancy="selectedVacancy" @saved="loadVacancies" />
  </div>
</template>
