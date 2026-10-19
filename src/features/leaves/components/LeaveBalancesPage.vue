<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { Calendar, Loader2 } from "@lucide/vue";
import { usePermission } from "@/composables/usePermissions";
import { useLeaveBalances } from "../composables/useLeaveBalances";
import { searchEmployees } from "@/features/employees/services/employee.api";
import type { EmployeeSearchOption } from "@/features/employees/services/employee.api";
import LeaveBalanceCards from "./LeaveBalanceCards.vue";
import SearchButton from "@/components/resuable/SearchButton.vue";
import ResetButton from "@/components/resuable/ResetButton.vue";
import { useAuthStore } from "@/features/auth/stores/auth.store";

const { can } = usePermission();
const { balanceData, loading, loadBalances, clearBalances } = useLeaveBalances();
const primaryTypes = ['annual', 'sick', 'special'];
const primaryBalances = computed(() =>
  (balanceData.value?.balances ?? []).filter((balance) => primaryTypes.includes(balance.leave_type)),
);
const otherBalances = computed(() =>
  (balanceData.value?.balances ?? []).filter((balance) => !primaryTypes.includes(balance.leave_type)),
);
const { user } = useAuthStore();
const filterYear = ref(new Date().getFullYear().toString());
const filterEmployeeId = ref<string | null>(null);

const employeeOptions = ref<EmployeeSearchOption[]>([]);
const loadingEmployees = ref(false);

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function onEmployeeSearch(query: string) {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => fetchEmployeeOptions(query), 300);
}

async function fetchEmployeeOptions(query: string) {
  if (!query || query.length < 2) {
    employeeOptions.value = [];
    return;
  }
  loadingEmployees.value = true;
  try {
    employeeOptions.value = await searchEmployees(query);
  } catch {
    employeeOptions.value = [];
  } finally {
    loadingEmployees.value = false;
  }
}

onMounted(() => {
  // for employee
  if (!can("leave_balances.view_any")) {
    loadBalances({ year: filterYear.value });
  }
  // for admin/hr
  else {
    // if user is hr show their attendance else show nothing
    if (user?.employee?.id) {
      loadBalances({ year: filterYear.value, employee_id: user?.employee?.employee_id });
    } 
  }
});

function applyFilters() {
  const params: Record<string, unknown> = { year: filterYear.value };
  if (filterEmployeeId.value && can("leave_balances.view_any")) {
    params.employee_id = filterEmployeeId.value;
  }
  loadBalances(params);
}

function resetFilters() {
  filterYear.value = new Date().getFullYear().toString();
  filterEmployeeId.value = null;
  employeeOptions.value = [];
  clearBalances();
  if (!can("leave_balances.view_any") || (can("leave_balances.view_own") && user?.employee?.employee_id)) {
    loadBalances({ year: filterYear.value });
  }
}

</script>

<template>
  <div class="space-y-6">
    <!-- Page header -->
    <div class="flex items-start gap-3">
      <div class="p-2 bg-emerald-50 rounded-xl border border-emerald-100 shrink-0">
        <Calendar class="w-5 h-5 text-emerald-600" />
      </div>
      <div>
        <h1 class="text-2xl font-semibold text-slate-900">Leave Balance</h1>
        <p class="mt-0.5 text-sm text-slate-500">
          View available leave balances for the selected year.
        </p>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
      <div class="flex flex-wrap items-center gap-3">
        <el-input v-model="filterYear" placeholder="Year" class="!w-[120px]" clearable />
        <el-select
          v-if="can('leave_balances.view_any')"
          v-model="filterEmployeeId"
          placeholder="Search employee..."
          filterable
          remote
          :remote-method="onEmployeeSearch"
          :loading="loadingEmployees"
          clearable
          class="!w-[260px]"
        >
          <el-option
            v-for="emp in employeeOptions"
            :key="emp.employee_id"
            :value="emp.employee_id"
            :label="emp.display"
          />
        </el-select>
        <SearchButton
          :disabled="can('leave_balances.view_any') && !filterEmployeeId"
          @click="applyFilters"
        />
        <ResetButton @click="resetFilters" />
      </div>
      <p v-if="can('leave_balances.view_any')" class="mt-2 text-xs text-slate-400">
        Select an employee to view their leave balance.
      </p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <Loader2 class="w-7 h-7 text-emerald-600 animate-spin" />
      <span class="ml-3 text-sm text-slate-500">Loading balances...</span>
    </div>

    <!-- Balance data -->
    <template v-else-if="balanceData">
      <!-- Employee + year summary -->
      <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-slate-400 mb-0.5">Employee</p>
            <p class="text-base font-semibold text-slate-900">
              {{ balanceData.employee.full_name }}
            </p>
            <p class="text-sm text-slate-400">{{ balanceData.employee.employee_id }}</p>
          </div>
          <div class="text-right">
            <p class="text-xs text-slate-400 mb-0.5">Year</p>
            <p class="text-2xl font-bold text-emerald-600">{{ balanceData.year }}</p>
          </div>
        </div>
      </div>

      <!-- Balance cards -->
      <div class="space-y-4">
        <LeaveBalanceCards :balances="primaryBalances" :columns="3" />
        <LeaveBalanceCards
          v-if="otherBalances.length"
          :balances="otherBalances"
          :columns="3"
          compact
        />
      </div>

      <!-- Info note -->
      <div class="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-700">
        Only approved leave requests reduce annual, sick, special, and special sick balances. Balances
        are calculated dynamically by the backend.
      </div>
    </template>

    <!-- Empty / prompt to select -->
    <div
      v-else
      class="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col items-center justify-center py-20 text-center"
    >
      <Calendar class="w-14 h-14 text-slate-200 mb-4" />
      <p class="text-base font-medium text-slate-700">
        {{
          can("leave_balances.view_any")
            ? "Select an employee and click Apply."
            : "No balance data available."
        }}
      </p>
      <p class="text-sm text-slate-400 mt-1">
        {{
          can("leave_balances.view_any")
            ? "Use the filter above to look up an employee's leave balance."
            : "Try adjusting the filters and try again."
        }}
      </p>
    </div>
  </div>
</template>
