<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessageBox } from 'element-plus'
import { useNotify } from '@/composables/useNotify'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { Plus } from '@lucide/vue'
import { PageHeader, AppCard } from '@/components/common'
import { usePermission } from '@/composables/usePermissions'
import { useDepartments } from '../composables/useDepartments'
import { deleteDepartment } from '../services/department.api'
import type { Department } from '../types/department'
import DepartmentFilters from './DepartmentFilters.vue'
import DepartmentTable from './DepartmentTable.vue'
import DepartmentFormDialog from './DepartmentFormDialog.vue'
import BaseButton from '@/components/common/BaseButton.vue'
const { can } = usePermission()
const notify = useNotify()
const {
  departments,
  meta,
  loading,
  filters,
  loadDepartments,
  applyFilters,
  onPageChange,
  onPageSizeChange,
} = useDepartments()

const formOpen = ref(false)
const selectedDepartment = ref<Department | null>(null)

onMounted(loadDepartments)

function handleCreate() {
  selectedDepartment.value = null
  formOpen.value = true
}

function handleEdit(dept: Department) {
  selectedDepartment.value = dept
  formOpen.value = true
}

async function handleDelete(dept: Department) {
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to delete "${dept.name}"? This action cannot be undone.`,
      'Delete Department',
      {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'warning',
        confirmButtonClass: 'el-button--danger',
      },
    )
  } catch {
    return
  }

  try {
    await deleteDepartment(dept.id)
    notify.success('Department deleted successfully.')
    await loadDepartments()
  } catch (err) {
    notify.error(getApiErrorMessage(err))
  }
}
</script>

<template>
  <div>
    <PageHeader
      title="Departments"
      subtitle="Manage company departments and organizational structure."
    >
      <template #action>
        <BaseButton
          v-if="can('departments.create')"
          type="primary"
          @click="handleCreate"
        >
          <Plus class="w-4 h-4 mr-1.5" />
          Add Department
        </BaseButton>
      </template>
    </PageHeader>

    <AppCard no-padding>
      <div class="px-5 py-4 border-b border-gray-100">
        <DepartmentFilters
          :search="filters.search"
          :status="filters.status"
          @apply="applyFilters"
        />
      </div>

      <DepartmentTable
        :departments="departments"
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

    <DepartmentFormDialog
      v-model:visible="formOpen"
      :department="selectedDepartment"
      @saved="loadDepartments"
    />
  </div>
</template>
