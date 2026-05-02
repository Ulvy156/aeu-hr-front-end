<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { usePermission } from '@/composables/usePermissions'
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
} from '@lucide/vue'

defineProps<{
  collapsed: boolean
}>()

defineEmits<{
  toggle: []
}>()

const route = useRoute()
const { can } = usePermission()

function isActive(path: string): boolean {
  return route.path === path || route.path.startsWith(path + '/')
}

interface MenuItem {
  label: string
  path: string
  icon: unknown
  permission?: string
}

interface MenuGroup {
  label: string
  items: MenuItem[]
}

const menuGroups = computed<MenuGroup[]>(() => [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Organization',
    items: [
      { label: 'Departments', path: '/departments', icon: Building2, permission: 'departments.view' },
      { label: 'Positions', path: '/positions', icon: Briefcase, permission: 'positions.view' },
      { label: 'Employees', path: '/employees', icon: Users, permission: 'employees.view' },
    ],
  },
  {
    label: 'Attendance',
    items: [
      { label: 'Attendance', path: '/attendance', icon: Clock },
      { label: 'Attendance Correction', path: '/attendance/correction', icon: ClipboardList },
    ],
  },
  {
    label: 'Leave',
    items: [
      { label: 'Leave Requests', path: '/leaves', icon: CalendarDays },
      { label: 'Leave Balance', path: '/leave-balances', icon: Calendar },
    ],
  },
  {
    label: 'Payroll',
    items: [
      { label: 'Payroll', path: '/payrolls', icon: Banknote },
      { label: 'Payslips', path: '/payslips', icon: FileText },
    ],
  },
  {
    label: 'Reports',
    items: [
      { label: 'Reports', path: '/reports', icon: BarChart2 },
    ],
  },
  {
    label: 'Admin',
    items: [
      { label: 'Company Settings', path: '/settings', icon: Settings },
      { label: 'Public Holidays', path: '/public-holidays', icon: CalendarCheck },
      { label: 'User Management', path: '/users', icon: UserCog, permission: 'users.view' },
      { label: 'Audit Logs', path: '/audit-logs', icon: ScrollText, permission: 'audit_logs.view' },
    ],
  },
])
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
      <div v-else class="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center">
        <Users class="w-4 h-4 text-white" />
      </div>

      <button
        class="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-gray-100 transition-colors"
        :class="collapsed ? 'mt-2' : ''"
        @click="$emit('toggle')"
      >
        <ChevronLeft v-if="!collapsed" class="w-4 h-4" />
        <ChevronRight v-else class="w-4 h-4" />
      </button>
    </div>

    <!-- Menu -->
    <nav class="flex-1 overflow-y-auto py-3 px-2 space-y-4">
      <div v-for="group in menuGroups" :key="group.label">
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
              :class="isActive(item.path) ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'"
            />
            <span v-if="!collapsed" class="truncate">{{ item.label }}</span>
          </RouterLink>
        </template>
      </div>
    </nav>
  </aside>
</template>
