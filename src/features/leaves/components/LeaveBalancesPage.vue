<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Calendar, Loader2 } from "@lucide/vue";
import { usePermission } from "@/composables/usePermissions";
import { useLeaveBalances } from "../composables/useLeaveBalances";
import { searchEmployees } from "@/features/employees/services/employee.api";
import type { EmployeeSearchOption } from "@/features/employees/services/employee.api";
import type { LeaveBalance } from "../types/leave";
import SearchButton from "@/components/resuable/SearchButton.vue";
import ResetButton from "@/components/resuable/ResetButton.vue";
import { useAuthStore } from "@/features/auth/stores/auth.store";

const { can } = usePermission();
const { balanceData, loading, loadBalances } = useLeaveBalances();
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
      loadBalances({ year: filterYear.value, employee_id: user?.employee?.id });
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
  if (!can("leave_balances.view_any")) {
    loadBalances({ year: filterYear.value });
  }
}

function getBalanceColor(leaveType: string): string {
  const map: Record<string, string> = {
    annual: "emerald",
    sick: "blue",
    maternity: "purple",
    unpaid: "slate",
  };
  return map[leaveType] ?? "slate";
}

function getBalanceBg(leaveType: string): string {
  const map: Record<string, string> = {
    annual: "bg-emerald-50 border-emerald-100",
    sick: "bg-blue-50 border-blue-100",
    maternity: "bg-purple-50 border-purple-100",
    unpaid: "bg-slate-50 border-slate-100",
  };
  return map[leaveType] ?? "bg-slate-50 border-slate-100";
}

function getIconColor(leaveType: string): string {
  const map: Record<string, string> = {
    annual: "text-emerald-600",
    sick: "text-blue-600",
    maternity: "text-purple-600",
    unpaid: "text-slate-500",
  };
  return map[leaveType] ?? "text-slate-500";
}

function formatLeaveType(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1) + " Leave";
}

function getUsedPercent(balance: LeaveBalance): number {
  if (balance.is_unlimited || !balance.entitlement) return 0;
  const entitlement = parseFloat(balance.entitlement);
  const used = parseFloat(balance.used ?? "0");
  return entitlement > 0 ? Math.min(100, Math.round((used / entitlement) * 100)) : 0;
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
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="balance in balanceData.balances"
          :key="balance.leave_type"
          class="bg-white border border-gray-200 rounded-xl shadow-sm p-5"
        >
          <div class="flex items-center justify-between mb-3">
            <div
              class="h-9 w-9 rounded-lg border flex items-center justify-center"
              :class="getBalanceBg(balance.leave_type)"
            >
              <Calendar class="w-4 h-4" :class="getIconColor(balance.leave_type)" />
            </div>
            <span
              v-if="balance.is_unlimited"
              class="text-xs font-medium text-slate-400 bg-slate-100 rounded-full px-2 py-0.5"
            >
              Unlimited
            </span>
          </div>

          <p class="text-xs text-slate-400 mb-1">{{ formatLeaveType(balance.leave_type) }}</p>

          <template v-if="balance.is_unlimited">
            <p class="text-2xl font-bold text-slate-900">∞</p>
            <p class="text-xs text-slate-400 mt-1">No balance limit</p>
          </template>

          <template v-else>
            <div class="flex items-end gap-1">
              <p class="text-2xl font-bold text-slate-900">{{ balance.remaining }}</p>
              <p class="text-sm text-slate-400 mb-0.5">/ {{ balance.entitlement }} days</p>
            </div>
            <p class="text-xs text-slate-400 mt-1">{{ balance.used }} days used</p>

            <!-- Progress bar -->
            <div class="mt-3 h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                class="h-full rounded-full transition-all"
                :class="
                  getUsedPercent(balance) >= 80
                    ? 'bg-red-400'
                    : `bg-${getBalanceColor(balance.leave_type)}-500`
                "
                :style="{ width: `${getUsedPercent(balance)}%` }"
              />
            </div>
            <p class="text-xs text-slate-400 mt-1">
              {{ getUsedPercent(balance) }}% used · {{ balance.rule }}
            </p>
          </template>
        </div>
      </div>

      <!-- Info note -->
      <div class="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-700">
        Only approved leave requests reduce annual and sick balances. Balances are calculated
        dynamically by the backend.
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
