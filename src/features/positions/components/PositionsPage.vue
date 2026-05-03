<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessageBox } from 'element-plus'
import { useNotify } from '@/composables/useNotify'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { Plus } from '@lucide/vue'
import { PageHeader, AppCard } from '@/components/common'
import { usePermission } from '@/composables/usePermissions'
import { usePositions } from '../composables/usePositions'
import { deletePosition } from '../services/position.api'
import { fetchDepartments } from '@/features/departments/services/department.api'
import type { Position, DepartmentOption } from '../types/position'
import PositionFilters from './PositionFilters.vue'
import PositionTable from './PositionTable.vue'
import PositionFormDialog from './PositionFormDialog.vue'
import BaseButton from '@/components/common/BaseButton.vue'
const { can } = usePermission()
const notify = useNotify()
const {
  positions,
  meta,
  loading,
  filters,
  loadPositions,
  applyFilters,
  onPageChange,
  onPageSizeChange,
} = usePositions()

const formOpen = ref(false)
const selectedPosition = ref<Position | null>(null)
const departments = ref<DepartmentOption[]>([])

onMounted(async () => {
  await loadPositions()
  try {
    const res = await fetchDepartments({ per_page: 100 })
    departments.value = res.data.map((d) => ({ id: d.id, name: d.name }))
  } catch {
    // non-critical — department select will be empty
  }
})

function handleCreate() {
  selectedPosition.value = null
  formOpen.value = true
}

function handleEdit(position: Position) {
  selectedPosition.value = position
  formOpen.value = true
}

async function handleDelete(position: Position) {
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to delete "${position.name}"? This action cannot be undone.`,
      'Delete Position',
      {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'warning',
        confirmButtonClass: 'BaseButton--danger',
      },
    )
  } catch {
    return
  }

  try {
    await deletePosition(position.id)
    notify.success('Position deleted successfully.')
    await loadPositions()
  } catch (err) {
    notify.error(getApiErrorMessage(err))
  }
}
</script>

<template>
  <div>
    <PageHeader
      title="Positions"
      subtitle="Manage job positions and titles within departments."
    >
      <template #action>
        <BaseButton
          v-if="can('positions.create')"
          type="primary"
          @click="handleCreate"
        >
          <Plus class="w-4 h-4 mr-1.5" />
          Add Position
        </BaseButton>
      </template>
    </PageHeader>

    <AppCard no-padding>
      <div class="px-5 py-4 border-b border-gray-100">
        <PositionFilters
          :search="filters.search"
          :department-id="filters.department_id"
          :status="filters.status"
          :departments="departments"
          @apply="applyFilters"
        />
      </div>

      <PositionTable
        :positions="positions"
        :loading="loading"
        :current-page="meta.current_page"
        :page-size="meta.per_page"
        :total="meta.total"
        @edit="handleEdit"
        @delete="handleDelete"
        @page-change="onPageChange"
        @size-change="onPageSizeChange"
      />
    </AppCard>

    <PositionFormDialog
      v-model:visible="formOpen"
      :position="selectedPosition"
      :departments="departments"
      @saved="loadPositions"
    />
  </div>
</template>
