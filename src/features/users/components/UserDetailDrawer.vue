<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { User, Shield, Link } from '@lucide/vue'
import { fetchUser } from '../services/user.api'
import type { UserDetail } from '../types/user'
import { StatusBadge } from '@/components/common'

const props = defineProps<{
  visible: boolean
  userId: number | null
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const loading = ref(false)
const user = ref<UserDetail | null>(null)

watch(() => props.userId, async (id) => {
  if (id !== null) {
    await loadUser(id)
  }
})

watch(() => props.visible, (v) => {
  if (!v) user.value = null
})

async function loadUser(id: number) {
  loading.value = true
  try {
    const res = await fetchUser(id)
    user.value = res.data
  } catch {
    ElMessage.error('Failed to load user detail.')
    emit('update:visible', false)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <el-drawer
    :model-value="visible"
    title="User Detail"
    direction="rtl"
    size="440px"
    @update:model-value="emit('update:visible', $event)"
  >
    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
    </div>

    <!-- Content -->
    <div v-else-if="user" class="space-y-6">
      <!-- User Info -->
      <div class="p-4 bg-gray-50 rounded-xl">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
            <User class="w-5 h-5 text-emerald-600" />
          </div>
          <div class="min-w-0">
            <p class="text-sm font-semibold text-slate-900 truncate">{{ user.name }}</p>
            <p class="text-xs text-slate-500 truncate">{{ user.email }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs text-slate-500">Status:</span>
          <StatusBadge :status="user.status" />
        </div>
      </div>

      <!-- Roles -->
      <div>
        <div class="flex items-center gap-2 mb-2">
          <Shield class="w-4 h-4 text-slate-400" />
          <span class="text-sm font-semibold text-slate-700">Roles</span>
        </div>
        <div class="flex flex-wrap gap-1.5">
          <el-tag
            v-for="role in user.roles"
            :key="role"
            type="primary"
            effect="plain"
            size="small"
          >
            {{ role }}
          </el-tag>
          <span v-if="!user.roles.length" class="text-sm text-slate-400">No roles assigned</span>
        </div>
      </div>

      <!-- Effective Permissions -->
      <div>
        <div class="flex items-center gap-2 mb-2">
          <Shield class="w-4 h-4 text-slate-400" />
          <span class="text-sm font-semibold text-slate-700">Effective Permissions</span>
        </div>
        <div class="flex flex-wrap gap-1.5 max-h-52 overflow-y-auto pr-1">
          <el-tag
            v-for="perm in user.permissions"
            :key="perm"
            type="info"
            effect="plain"
            size="small"
          >
            {{ perm }}
          </el-tag>
          <span v-if="!user.permissions.length" class="text-sm text-slate-400">
            No permissions
          </span>
        </div>
      </div>

      <!-- Linked Employee -->
      <div v-if="user.employee">
        <div class="flex items-center gap-2 mb-2">
          <Link class="w-4 h-4 text-slate-400" />
          <span class="text-sm font-semibold text-slate-700">Linked Employee</span>
        </div>
        <div class="p-4 bg-gray-50 rounded-xl space-y-2.5">
          <div class="flex justify-between text-sm">
            <span class="text-slate-500">Employee ID</span>
            <span class="font-medium text-slate-800">{{ user.employee.employee_id }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-slate-500">Full Name</span>
            <span class="font-medium text-slate-800">{{ user.employee.full_name }}</span>
          </div>
          <div v-if="user.employee.department" class="flex justify-between text-sm">
            <span class="text-slate-500">Department</span>
            <span class="font-medium text-slate-800">{{ user.employee.department.name }}</span>
          </div>
          <div v-if="user.employee.position" class="flex justify-between text-sm">
            <span class="text-slate-500">Position</span>
            <span class="font-medium text-slate-800">{{ user.employee.position.name }}</span>
          </div>
          <div class="flex justify-between items-center text-sm">
            <span class="text-slate-500">Employment Status</span>
            <StatusBadge :status="user.employee.employment_status" />
          </div>
        </div>
      </div>
    </div>
  </el-drawer>
</template>
