<script setup lang="ts">
import { ref, onMounted, defineAsyncComponent } from 'vue'
import { ElMessageBox } from 'element-plus'
import { useNotify } from '@/composables/useNotify'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { UserPlus } from '@lucide/vue'
import { PageHeader, AppCard } from '@/components/common'
import { usePermission } from '@/composables/usePermissions'
import { useUsers } from '../composables/useUsers'
import { fetchRoles, deactivateUser } from '../services/user.api'
import type { UserListItem, Role } from '../types/user'
import UserFilters from './UserFilters.vue'
import UserTable from './UserTable.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import UserCard from './UserCard.vue'
const UserCreateDialog = defineAsyncComponent(() => import('./UserCreateDialog.vue'));
const UserEditDialog = defineAsyncComponent(() => import('./UserEditDialog.vue'));
const UserRolesDialog = defineAsyncComponent(() => import('./UserRolesDialog.vue'));
const UserDetailDrawer = defineAsyncComponent(() => import('./UserDetailDrawer.vue'));
const UserPermissionDialog = defineAsyncComponent(() => import('./UserPermissionDialog.vue'));

const { can } = usePermission()
const notify = useNotify()
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
const permissionsOpen = ref(false)
const detailOpen = ref(false)

const selectedUser = ref<UserListItem | null>(null)
const detailUserId = ref<number | null>(null)
const roles = ref<Role[]>([])
const isLoadUser = ref(false);

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

function handleAssignPermissions(user: UserListItem) {
  selectedUser.value = user
  permissionsOpen.value = true
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
        confirmButtonClass: 'BaseButton--danger',
      },
    )
  } catch {
    return
  }

  try {
    await deactivateUser(user.id)
    notify.success('User deactivated successfully.')
    await loadUsers()
  } catch (err) {
    notify.error(getApiErrorMessage(err))
  }
}

async function reloadUser() {
  isLoadUser.value = true;
  await loadUsers();

  // after fetch change load user to false
  isLoadUser.value = false;
}
</script>

<template>
  <div class="grid grid-cols-1 gap-y-5">
    <PageHeader
      title="User Management"
      subtitle="Manage system users, roles, and access permissions."
    >
      <template #action>
        <BaseButton
          v-if="can('users.create')"
          type="primary"
          @click="createOpen = true"
        >
          <UserPlus class="w-4 h-4 mr-1.5" />
          Add User
        </BaseButton>
      </template>
    </PageHeader>

    <UserCard :isLoadUser/>

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
        @assign-permissions="handleAssignPermissions"
        @disable="handleDisable"
        @page-change="onPageChange"
        @size-change="onPageSizeChange"
      />
    </AppCard>

    <UserCreateDialog
      v-model:visible="createOpen"
      :roles="roles"
      @created="reloadUser"
    />

    <UserEditDialog
      v-model:visible="editOpen"
      :user="selectedUser"
      :roles="roles"
      @updated="reloadUser"
    />

    <UserRolesDialog
      v-model:visible="rolesOpen"
      :user="selectedUser"
      :roles="roles"
      @updated="reloadUser"
    />

    <UserPermissionDialog
      v-model:visible="permissionsOpen"
      :user="selectedUser"
      @saved="loadUsers"
    />

    <UserDetailDrawer
      v-model:visible="detailOpen"
      :user-id="detailUserId"
    />
  </div>
</template>
