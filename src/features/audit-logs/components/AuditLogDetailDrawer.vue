<script setup lang="ts">
import type { AuditLog } from '../types/audit-log'

defineProps<{
  visible: boolean
  log: AuditLog | null
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function shortModelType(type: string | null): string {
  if (!type) return '—'
  return type.split('\\').pop() ?? type
}

function formatJson(value: Record<string, unknown> | null): string {
  if (value === null || value === undefined) return 'null'
  return JSON.stringify(value, null, 2)
}

function hasValues(value: Record<string, unknown> | null): boolean {
  return value !== null && value !== undefined && Object.keys(value).length > 0
}
</script>

<template>
  <el-drawer
    :model-value="visible"
    title="Audit Log Detail"
    direction="rtl"
    size="500px"
    @update:model-value="emit('update:visible', $event)"
  >
    <div v-if="log" class="space-y-5 text-sm">
      <!-- Basic info -->
      <div class="p-4 bg-gray-50 rounded-xl space-y-2.5">
        <div class="flex justify-between">
          <span class="text-slate-500">Date / Time</span>
          <span class="font-medium text-slate-800">{{ formatDateTime(log.created_at) }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-500">User</span>
          <span class="font-medium text-slate-800">
            {{ log.user ? `${log.user.name} (${log.user.email})` : 'System' }}
          </span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-500">Module</span>
          <el-tag size="small" effect="plain" type="info">{{ log.module }}</el-tag>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-500">Action</span>
          <el-tag size="small" effect="plain" type="primary">{{ log.action }}</el-tag>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-500">Model Type</span>
          <span class="font-medium text-slate-800">{{ shortModelType(log.model_type) }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-500">Model ID</span>
          <span class="font-medium text-slate-800">{{ log.model_id ?? '—' }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-500">IP Address</span>
          <span class="font-mono text-slate-800">{{ log.ip_address ?? '—' }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-500">User Agent</span>
          <span class="text-slate-600 text-xs text-right max-w-[260px] break-all">
            {{ log.user_agent ?? '—' }}
          </span>
        </div>
      </div>

      <!-- Old values -->
      <div>
        <p class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Old Values
        </p>
        <pre
          v-if="hasValues(log.old_values)"
          class="text-xs bg-gray-50 border border-gray-200 rounded-lg p-3 overflow-x-auto text-slate-700 whitespace-pre-wrap break-all leading-relaxed"
        >{{ formatJson(log.old_values) }}</pre>
        <p v-else class="text-sm text-slate-400 italic">No old values</p>
      </div>

      <!-- New values -->
      <div>
        <p class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          New Values
        </p>
        <pre
          v-if="hasValues(log.new_values)"
          class="text-xs bg-gray-50 border border-gray-200 rounded-lg p-3 overflow-x-auto text-slate-700 whitespace-pre-wrap break-all leading-relaxed"
        >{{ formatJson(log.new_values) }}</pre>
        <p v-else class="text-sm text-slate-400 italic">No new values</p>
      </div>
    </div>
  </el-drawer>
</template>
