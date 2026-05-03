<script setup lang="ts">
import { MoreHorizontal } from '@lucide/vue'
import type { UserListItem } from '../types/user'
import { StatusBadge, EmptyState, BasePagination } from '@/components/common'
import { usePermission } from '@/composables/usePermissions'
import { useAuthStore } from '@/features/auth/stores/auth.store'

defineProps<{
  users: UserListItem[]
  loading: boolean
  currentPage: number
  pageSize: number
  total: number
}>()

const emit = defineEmits<{
  view: [user: UserListItem]
  edit: [user: UserListItem]
  'assign-roles': [user: UserListItem]
  'assign-permissions': [user: UserListItem]
  disable: [user: UserListItem]
  'page-change': [page: number]
  'size-change': [size: number]
}>()

const { can } = usePermission()
const authStore = useAuthStore()
</script>

<template>
  <div>
    <div class="relative">
      <!-- Loading overlay -->
      <div
        v-if="loading"
        class="absolute inset-0 bg-white/70 flex items-center justify-center z-10 rounded-b-xl"
      >
        <div class="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>

      <el-table :data="users" class="w-full" row-class-name="cursor-default">
        <!-- Name + Email -->
        <el-table-column label="Name" min-width="180">
          <template #default="{ row }">
            <div>
              <p class="text-sm font-medium text-slate-900">{{ row.name }}</p>
              <p class="text-xs text-slate-400 mt-0.5">{{ row.email }}</p>
            </div>
          </template>
        </el-table-column>

        <!-- Employee ID -->
        <el-table-column label="Employee ID" width="130">
          <template #default="{ row }">
            <span class="text-sm text-slate-600">{{ row.employee?.employee_id ?? '—' }}</span>
          </template>
        </el-table-column>

        <!-- Position -->
        <el-table-column label="Position" min-width="140">
          <template #default="{ row }">
            <span class="text-sm text-slate-600">{{ row.employee?.position?.name ?? '—' }}</span>
          </template>
        </el-table-column>

        <!-- Department -->
        <el-table-column label="Department" min-width="140">
          <template #default="{ row }">
            <span class="text-sm text-slate-600">{{ row.employee?.department?.name ?? '—' }}</span>
          </template>
        </el-table-column>

        <!-- Roles -->
        <el-table-column label="Roles" min-width="160">
          <template #default="{ row }">
            <div class="flex flex-wrap gap-1">
              <el-tag
                v-for="role in row.roles"
                :key="role"
                size="small"
                type="primary"
                effect="plain"
              >
                {{ role }}
              </el-tag>
              <span v-if="!row.roles.length" class="text-sm text-slate-400">—</span>
            </div>
          </template>
        </el-table-column>

        <!-- Status -->
        <el-table-column label="Status" width="110">
          <template #default="{ row }">
            <StatusBadge :status="row.status" />
          </template>
        </el-table-column>

        <!-- Actions -->
        <el-table-column label="Actions" width="80" fixed="right" align="center">
          <template #default="{ row }">
            <el-dropdown trigger="click">
              <button
                class="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-slate-500 hover:text-slate-700"
                @click.stop
              >
                <MoreHorizontal class="w-4 h-4" />
              </button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="emit('view', row)">View Detail</el-dropdown-item>
                  <el-dropdown-item v-if="can('users.update')" @click="emit('edit', row)">
                    Edit
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-if="can('users.assign_permissions') && row.id !== authStore.user?.id"
                    @click="emit('assign-permissions', row)"
                  >
                    Assign Permissions
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-if="can('users.delete')"
                    style="color: #dc2626"
                    @click="emit('disable', row)"
                  >
                    Disable
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>

        <template #empty>
          <EmptyState
            title="No users found"
            description="Try adjusting your search or filters."
          />
        </template>
      </el-table>
    </div>

    <BasePagination
      :current-page="currentPage"
      :page-size="pageSize"
      :total="total"
      @update:current-page="emit('page-change', $event)"
      @update:page-size="emit('size-change', $event)"
    />
  </div>
</template>
