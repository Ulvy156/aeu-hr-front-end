<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessageBox } from 'element-plus'
import { useNotify } from '@/composables/useNotify'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { UserPlus } from '@lucide/vue'
import { PageHeader } from '@/components/common'
import { usePermission } from '@/composables/usePermissions'
import { useEmployees } from '../composables/useEmployees'
import { deleteEmployee } from '../services/employee.api'
import { fetchDepartments } from '@/features/departments/services/department.api'
import { fetchPositions } from '@/features/positions/services/position.api'
import type { Employee, DeptOption, PositionOption } from '../types/employee'
import EmployeeFilters from './EmployeeFilters.vue'
import EmployeeTable from './EmployeeTable.vue'
import EmployeeFormDrawer from './EmployeeFormDrawer.vue'
import EmployeeDetailDrawer from './EmployeeDetailDrawer.vue'
import RequestUpgradeFormDrawer from '@/features/employee-upgrade-requests/components/RequestUpgradeFormDrawer.vue'

const { can } = usePermission()
const notify = useNotify()
const {
  employees,
  meta,
  loading,
  filters,
  loadEmployees,
  applyFilters,
  onPageChange,
  onPageSizeChange,
} = useEmployees()

const formOpen = ref(false)
const detailOpen = ref(false)
const upgradeFormOpen = ref(false)
const selectedEmployee = ref<Employee | null>(null)
const upgradeEmployee = ref<Employee | null>(null)
const departments = ref<DeptOption[]>([])
const positions = ref<PositionOption[]>([])

onMounted(async () => {
  await loadEmployees()
  try {
    const [dRes, pRes] = await Promise.all([
      fetchDepartments({ per_page: 100 }),
      fetchPositions({ per_page: 100 }),
    ])
    departments.value = dRes.data.map((d) => ({ id: d.id, name: d.name }))
    positions.value = pRes.data.map((p) => ({
      id: p.id,
      name: p.name,
      department_id: p.department?.id ?? null,
    }))
  } catch {
    // non-critical
  }
})

function handleCreate() {
  selectedEmployee.value = null
  formOpen.value = true
}

function handleEdit(emp: Employee) {
  selectedEmployee.value = emp
  formOpen.value = true
}

function handleView(emp: Employee) {
  selectedEmployee.value = emp
  detailOpen.value = true
}

function handleRequestUpgrade(emp: Employee) {
  upgradeEmployee.value = emp
  upgradeFormOpen.value = true
}

async function handleDelete(emp: Employee) {
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to delete "${emp.full_name}"? This will soft-delete the record and deactivate their account.`,
      'Delete Employee',
      { confirmButtonText: 'Delete', cancelButtonText: 'Cancel', type: 'warning', confirmButtonClass: 'el-button--danger' },
    )
  } catch {
    return
  }

  try {
    await deleteEmployee(emp.id)
    notify.success('Employee deleted successfully.')
    await loadEmployees()
  } catch (err) {
    notify.error(getApiErrorMessage(err))
  }
}
</script>

<template>
  <div class="space-y-5">
    <!-- Page header -->
    <PageHeader
      title="Employees"
      subtitle="Manage employee records, profiles, and employment details."
    >
      <template #action>
        <button
          v-if="can('employees.create')"
          class="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
          @click="handleCreate"
        >
          <UserPlus class="w-4 h-4" />
          Add Employee
        </button>
      </template>
    </PageHeader>

    <!-- Filter card -->
    <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
      <EmployeeFilters
        :search="filters.search"
        :department-id="filters.department_id"
        :position-id="filters.position_id"
        :employment-status="filters.employment_status"
        :departments="departments"
        :positions="positions"
        @apply="applyFilters"
      />
    </div>

    <!-- Table card -->
    <div class="bg-white border border-gray-200 rounded-xl shadow-sm">
      <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div>
          <h2 class="text-base font-semibold text-slate-900">Employee List</h2>
          <p class="text-sm text-slate-500 mt-0.5">
            {{ meta.total }} {{ meta.total === 1 ? 'employee' : 'employees' }} found
          </p>
        </div>
      </div>

      <EmployeeTable
        :employees="employees"
        :loading="loading"
        :current-page="meta.current_page"
        :page-size="meta.per_page"
        :total="meta.total"
        @view="handleView"
        @edit="handleEdit"
        @delete="handleDelete"
        @request-upgrade="handleRequestUpgrade"
        @page-change="onPageChange"
        @size-change="onPageSizeChange"
      />
    </div>

    <EmployeeFormDrawer
      v-model:visible="formOpen"
      :employee="selectedEmployee"
      :departments="departments"
      :positions="positions"
      @saved="loadEmployees"
    />

    <EmployeeDetailDrawer
      v-model:visible="detailOpen"
      :employee="selectedEmployee"
      @request-upgrade="handleRequestUpgrade"
    />

    <RequestUpgradeFormDrawer
      v-model:visible="upgradeFormOpen"
      :employee="upgradeEmployee"
      :departments="departments"
      :positions="positions"
    />
  </div>
</template>
