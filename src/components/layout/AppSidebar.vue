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
  Network,
  QrCode,
  KeyRound,
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
const { can, canAny } = usePermission();

function canAccess(permission?: string | string[]): boolean {
  if (!permission) return true
  return Array.isArray(permission) ? canAny(permission) : can(permission)
}
const isClickLogout = ref(false);
const isLogginOut = ref(false);
const logoBroken = ref(false);

const COMPANY_LOGO_SRC = "/PDM Logo.png";
const COMPANY_NAME = "PPDM CARE";

const displayName = computed(() => {
  return authStore.user?.employee?.full_name || authStore.user?.name || "";
});

const displaySubtitle = computed(() => {
  const positionName = authStore.user?.employee?.position?.name;
  if (positionName) return positionName;

  const role = authStore.user?.roles?.[0];
  if (!role) return "";

  return role.charAt(0).toUpperCase() + role.slice(1);
});

const identityTooltip = computed(() => {
  const name = displayName.value;
  const subtitle = displaySubtitle.value;
  if (name && subtitle) return `${name} — ${subtitle}`;
  return name || subtitle || COMPANY_NAME;
});

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
  permission?: string | string[];
  requiresEmployeeProfile?: boolean;
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
        label: "Promote Employee",
        path: "/employee-promotion-requests",
        icon: TrendingUp,
        permission: "employee_upgrade_requests.view",
      },
      { label: "Org Chart", path: "/org-chart", icon: Network },
    ],
  },
  {
    label: "Attendance",
    items: [
      { label: "My Attendance", path: "/my-attendance", icon: Clock, permission: "attendance.view_own" },
      { label: "Employee Attendance", path: "/attendance", icon: Users, permission: "attendance.view_any" },
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
      {
        label: "QR Attendance",
        path: "/attendance/qr",
        icon: QrCode,
        permission: "attendance.generate_qr",
      },
    ],
  },
  {
    label: "Leave",
    items: [
      { label: "My Leave", path: "/my-leave", icon: CalendarDays, permission: "leaves.view_own", requiresEmployeeProfile: true },
      { label: "Leave Requests", path: "/leaves", icon: CalendarDays, permission: "leaves.view_any" },
      { label: "Leave Balance", path: "/leave-balances", icon: Calendar },
    ],
  },
  {
    label: "Payroll",
    items: [
      { label: "My Payroll", path: "/my-payroll", icon: Banknote, permission: "payrolls.view_own" },
      { label: "Payroll", path: "/payrolls", icon: Banknote, permission: "payrolls.view_any" },
      { label: "Payslips", path: "/payslips", icon: FileText, permission: "payslips.view_any" },
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
    items: [{ label: "Reports", path: "/reports", icon: BarChart2, permission: ["reports.payroll_view", "reports.attendance_view", "reports.leave_view"] }],
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
      {
        label: "Permissions",
        path: "/permissions",
        icon: KeyRound,
        permission: "roles_permissions.permissions_view",
      },
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
      items: group.items.filter((item) => canAccess(item.permission) && (!item.requiresEmployeeProfile || !!authStore.user?.employee)),
    }))
    .filter((group) => group.items.length > 0),
);
</script>

<template>
  <aside
    class="flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-300 shrink-0"
    :class="collapsed ? 'w-16' : 'w-60'"
  >
    <!-- Brand + identity -->
    <div
      class="shrink-0 border-b border-gray-100 py-3"
      :class="collapsed ? 'px-2' : 'px-4'"
    >
      <div
        class="flex"
        :class="collapsed ? 'flex-col items-center gap-2' : 'items-center justify-between gap-2'"
      >
        <el-tooltip
          :content="identityTooltip"
          :disabled="!collapsed"
          placement="right"
        >
          <div
            class="flex items-center min-w-0"
            :class="collapsed ? 'justify-center' : 'gap-2.5'"
          >
            <img
              v-if="!logoBroken"
              :src="COMPANY_LOGO_SRC"
              :alt="COMPANY_NAME"
              class="h-7 w-7 rounded-lg object-contain shrink-0 bg-white"
              @error="logoBroken = true"
            />
            <div
              v-else
              class="w-7 h-7 bg-emerald-600 rounded-lg shrink-0"
              aria-hidden="true"
            />
            <span
              v-if="!collapsed"
              class="text-sm font-semibold text-slate-900 truncate"
            >
              {{ COMPANY_NAME }}
            </span>
          </div>
        </el-tooltip>

        <button
          class="p-1 cursor-pointer rounded-md text-slate-400 hover:text-slate-600 bg-gray-100 shrink-0"
          @click="$emit('toggle')"
        >
          <ChevronLeft v-if="!collapsed" class="w-4 h-4" />
          <ChevronRight v-else class="w-4 h-4" />
        </button>
      </div>

      <RouterLink
        v-if="!collapsed && displayName"
        :to="{ name: 'profile' }"
        class="mt-2.5 block rounded-lg px-0.5 py-1 min-w-0 hover:bg-gray-50 transition-colors"
      >
        <p class="text-sm font-medium text-slate-800 truncate">{{ displayName }}</p>
        <p v-if="displaySubtitle" class="text-xs text-slate-500 truncate">
          {{ displaySubtitle }}
        </p>
      </RouterLink>
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
          <el-tooltip
            v-if="canAccess(item.permission)"
            :content="item.label"
            :disabled="!collapsed"
            placement="right"
          >
            <RouterLink
              :to="item.path"
              class="flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-colors group"
              :class="[
                collapsed ? 'justify-center' : '',
                isActive(item.path)
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-600 hover:bg-gray-100 hover:text-slate-900',
              ]"
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
          </el-tooltip>
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
