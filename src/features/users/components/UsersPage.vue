<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { UserPlus } from '@lucide/vue'
import { PageHeader, AppCard } from '@/components/common'
import { usePermission } from '@/composables/usePermissions'
import { useUsers } from '../composables/useUsers'
import { fetchRoles, deactivateUser } from '../services/user.api'
import type { UserListItem, Role } from '../types/user'
import UserFilters from './UserFilters.vue'
import UserTable from './UserTable.vue'
import UserCreateDialog from './UserCreateDialog.vue'
import UserEditDialog from './UserEditDialog.vue'
import UserRolesDialog from './UserRolesDialog.vue'
import UserDetailDrawer from './UserDetailDrawer.vue'

const { can } = usePermission()
const {
  users,
  meta,
  loading,
  filters,
  loadUsers,
  applyFilters,
  onPageChange,
  onPageSizeChange,
} = useUsers()

const createOpen = ref(false)
const editOpen = ref(false)
const rolesOpen = ref(false)
const detailOpen = ref(false)

const selectedUser = ref<UserListItem | null>(null)
const detailUserId = ref<number | null>(null)
const roles = ref<Role[]>([])

onMounted(async () => {
  await loadUsers()
  try {
    const res = await fetchRoles()
    roles.value = res.data
  } catch {
    // roles list is non-critical; dialogs handle empty state
  }
})

function handleView(user: UserListItem) {
  detailUserId.value = user.id
  detailOpen.value = true
}

function handleEdit(user: UserListItem) {
  selectedUser.value = user
  editOpen.value = true
}

function handleAssignRoles(user: UserListItem) {
  selectedUser.value = user
  rolesOpen.value = true
}

async function handleDisable(user: UserListItem) {
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to disable "${user.name}"? Their access will be revoked immediately.`,
      'Disable User',
      {
        confirmButtonText: 'Disable',
        cancelButtonText: 'Cancel',
        type: 'warning',
        confirmButtonClass: 'el-button--danger',
      },
    )
  } catch {
    return
  }

  try {
    await deactivateUser(user.id)
    ElMessage.success('User deactivated successfully.')
    await loadUsers()
  } catch (err: unknown) {
    const msg = (err as any)?.response?.data?.message ?? 'Failed to deactivate user.'
    ElMessage.error(msg)
  }
}
</script>

<template>
  <div>
    <PageHeader
      title="User Management"
      subtitle="Manage system users, roles, and access permissions."
    >
      <template #action>
        <el-button
          v-if="can('users.create')"
          type="primary"
          @click="createOpen = true"
        >
          <UserPlus class="w-4 h-4 mr-1.5" />
          Add User
        </el-button>
      </template>
    </PageHeader>

    <AppCard no-padding>
      <div class="px-5 py-4 border-b border-gray-100">
        <UserFilters
          :search="filters.search"
          :status="filters.status"
          @apply="applyFilters"
        />
      </div>

      <UserTable
        :users="users"
        :loading="loading"
        :current-page="meta.current_page"
        :page-size="meta.per_page"
        :total="meta.total"
        @view="handleView"
        @edit="handleEdit"
        @assign-roles="handleAssignRoles"
        @disable="handleDisable"
        @page-change="onPageChange"
        @size-change="onPageSizeChange"
      />
    </AppCard>

    <UserCreateDialog
      v-model:visible="createOpen"
      :roles="roles"
      @created="loadUsers"
    />

    <UserEditDialog
      v-model:visible="editOpen"
      :user="selectedUser"
      :roles="roles"
      @updated="loadUsers"
    />

    <UserRolesDialog
      v-model:visible="rolesOpen"
      :user="selectedUser"
      :roles="roles"
      @updated="loadUsers"
    />

    <UserDetailDrawer
      v-model:visible="detailOpen"
      :user-id="detailUserId"
    />
  </div>
</template>
