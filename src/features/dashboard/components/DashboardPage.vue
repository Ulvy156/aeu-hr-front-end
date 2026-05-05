<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { usePermission } from '@/composables/usePermissions'

const EmployeeDashboardPage = defineAsyncComponent(() => import('./EmployeeDashboardPage.vue'))
const HrDashboardPage = defineAsyncComponent(() => import('./HrDashboardPage.vue'))
const CeoDashboardPage = defineAsyncComponent(() => import('./CeoDashboardPage.vue'))
const AdminDashboardPage = defineAsyncComponent(() => import('./AdminDashboardPage.vue'))

const { can } = usePermission()

const isAdmin = computed(() => can('dashboards.admin_view'))
const isHr = computed(() => can('dashboards.hr_view'))
const isCeo = computed(() => can('dashboards.ceo_view'))
const isEmployee = computed(() => can('dashboards.employee_view'))
</script>

<template>
  <AdminDashboardPage v-if="isAdmin" />
  <HrDashboardPage v-else-if="isHr" />
  <CeoDashboardPage v-else-if="isCeo" />
  <EmployeeDashboardPage v-else-if="isEmployee" />
  <div v-else class="flex items-center justify-center py-20 text-slate-400 text-sm">
    You don't have access to a dashboard.
  </div>
</template>
