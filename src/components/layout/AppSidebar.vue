<script setup lang="ts">
import { computed, defineAsyncComponent, ref } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import { usePermission } from "@/composables/usePermissions";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import BaseButton from "../common/BaseButton.vue";
const BaseModal = defineAsyncComponent(() => import("../common/BaseModal.vue"));
import {
  LayoutDashboard,
  Building2,
  Briefcase,
  Users,
  Clock,
  ClipboardList,
  CalendarDays,
  Calendar,
  Banknote,
  FileText,
  BarChart2,
  Settings,
  CalendarCheck,
  UserCog,
  ScrollText,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  UserCheck,
  Megaphone,
  Tags,
  BriefcaseBusiness,
  UserPlus,
  TrendingUp,
} from "@lucide/vue";

defineProps<{
  collapsed: boolean;
}>();

defineEmits<{
  toggle: [];
}>();

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { can } = usePermission();
const isClickLogout = ref(false);
const isLogginOut = ref(false);

async function handleLogout() {
  isLogginOut.value = true;
  await authStore.logout().catch(() => {});
  router.push({ name: "login" });
}

function isActive(path: string): boolean {
  return route.path === path;
}

interface MenuItem {
  label: string;
  path: string;
  icon: unknown;
  permission?: string;
}

interface MenuGroup {
  label: string;
  items: MenuItem[];
}

const menuGroups = computed<MenuGroup[]>(() => [
  {
    label: "Main",
    items: [{ label: "Dashboard", path: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Organization",
    items: [
      {
        label: "Departments",
        path: "/departments",
        icon: Building2,
        permission: "departments.view",
      },
      { label: "Positions", path: "/positions", icon: Briefcase, permission: "positions.view" },
      { label: "Employees", path: "/employees", icon: Users, permission: "employees.view" },
      {
        label: "Upgrade Requests",
        path: "/employee-upgrade-requests",
        icon: TrendingUp,
        permission: "employee_upgrade_requests.view",
      },
    ],
  },
  {
    label: "Attendance",
    items: [
      { label: "Attendance", path: "/attendance", icon: Clock, permission: "attendance.view_own" },
      {
        label: "Attendance Correction",
        path: "/attendance/correction",
        icon: ClipboardList,
        permission: "attendance.view_correction",
      },
      {
        label: "Proxy Clock",
        path: "/attendance/proxy",
        icon: UserCheck,
        permission: "attendance.proxy_clock",
      },
    ],
  },
  {
    label: "Leave",
    items: [
      { label: "Leave Requests", path: "/leaves", icon: CalendarDays },
      { label: "Leave Balance", path: "/leave-balances", icon: Calendar },
    ],
  },
  {
    label: "Payroll",
    items: [
      { label: "Payroll", path: "/payrolls", icon: Banknote, permission: "payrolls.view_any" },
      { label: "Payslips", path: "/payslips", icon: FileText, permission: "payslips.view_own" },
    ],
  },
  {
    label: "Recruitment",
    items: [
      {
        label: "Vacancies",
        path: "/recruitment/vacancies",
        icon: BriefcaseBusiness,
        permission: "recruitment.vacancies.view",
      },
      {
        label: "Candidates",
        path: "/recruitment/candidates",
        icon: UserPlus,
        permission: "recruitment.candidates.view",
      },
    ],
  },
  {
    label: "Reports",
    items: [{ label: "Reports", path: "/reports", icon: BarChart2, permission: "reports.payroll_view" }],
  },
  {
    label: "Communication",
    items: [{ label: "Announcements", path: "/announcements", icon: Megaphone }],
  },
  {
    label: "Admin",
    items: [
      {
        label: "Company Settings",
        path: "/settings",
        icon: Settings,
        permission: "company_settings.view",
      },
      { label: "Public Holidays", path: "/public-holidays", icon: CalendarCheck, permission: 'public_holidays.view' },
      { label: "User Management", path: "/users", icon: UserCog, permission: "users.view" },
      {
        label: "Announcement Categories",
        path: "/announcements/categories",
        icon: Tags,
        permission: "announcement_categories.view",
      },
      { label: "Audit Logs", path: "/audit-logs", icon: ScrollText, permission: "audit_logs.view" },
    ],
  },
    {
    label: "Profile",
    items: [
      {
        label: "Profile",
        path: "/profile",
        icon: User
      }
    ],
  },
]);
const visibleMenuGroups = computed<MenuGroup[]>(() =>
  menuGroups.value
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.permission || can(item.permission)),
    }))
    .filter((group) => group.items.length > 0),
);
</script>

<template>
  <aside
    class="flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-300 shrink-0"
    :class="collapsed ? 'w-16' : 'w-60'"
  >
    <!-- Logo + toggle -->
    <div
      class="flex items-center border-b border-gray-100 px-3 shrink-0"
      :class="collapsed ? 'justify-center py-4' : 'justify-between py-4 px-4'"
    >
      <div v-if="!collapsed" class="flex items-center gap-2.5">
        <div class="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center shrink-0">
          <Users class="w-4 h-4 text-white" />
        </div>
        <span class="text-sm font-semibold text-slate-900 truncate">HR System</span>
      </div>
      <!-- <div v-else class="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center">
        <Users class="w-4 h-4 text-white" />
      </div> -->

      <button
        class="p-1 cursor-pointer rounded-md text-slate-400 hover:text-slate-600 bg-gray-100"
        :class="collapsed ? 'mt-2' : ''"
        @click="$emit('toggle')"
      >
        <ChevronLeft v-if="!collapsed" class="w-4 h-4" />
        <ChevronRight v-else class="w-4 h-4" />
      </button>
    </div>

    <!-- Menu (scrollable middle section) -->
    <nav class="flex-1 overflow-y-auto py-3 px-2 space-y-4">
      <div v-for="group in visibleMenuGroups" :key="group.label">
        <!-- Group label -->
        <p
          v-if="!collapsed"
          class="px-2 mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400"
        >
          {{ group.label }}
        </p>
        <div v-else class="border-t border-gray-100 mb-2" />

        <!-- Group items -->
        <template v-for="item in group.items" :key="item.path">
          <RouterLink
            v-if="!item.permission || can(item.permission)"
            :to="item.path"
            class="flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-colors group"
            :class="
              isActive(item.path)
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-slate-600 hover:bg-gray-100 hover:text-slate-900'
            "
            :title="collapsed ? item.label : undefined"
          >
            <component
              :is="item.icon"
              class="w-4 h-4 shrink-0"
              :class="
                isActive(item.path)
                  ? 'text-emerald-600'
                  : 'text-slate-400 group-hover:text-slate-600'
              "
            />
            <span v-if="!collapsed" class="truncate">{{ item.label }}</span>
          </RouterLink>
        </template>
      </div>
    </nav>


    <!-- Logout (fixed bottom) -->
    <div class="shrink-0 border-t border-gray-100 px-2 py-3">
      <el-tooltip :content="'Logout'" :disabled="!collapsed" placement="right">
        <button
          class="flex items-center gap-3 w-full rounded-lg px-2 py-2 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          :class="collapsed ? 'justify-center' : ''"
          @click="isClickLogout = true"
        >
          <LogOut class="w-4 h-4 shrink-0" />
          <span v-if="!collapsed">Logout</span>
        </button>
      </el-tooltip>
    </div>
  </aside>

  <BaseModal :modelValue="isClickLogout">
    <p>Are you sure want to logout ?</p>
    <div class="flex justify-end">
      <BaseButton :loading="isLogginOut" @click="handleLogout" type="primary">Logout</BaseButton>
      <BaseButton @click="isClickLogout = false">Cancel</BaseButton>
    </div>
  </BaseModal>
</template>
