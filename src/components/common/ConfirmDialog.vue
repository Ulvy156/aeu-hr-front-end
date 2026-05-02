<script setup lang="ts">
import { AlertTriangle } from '@lucide/vue'

defineProps<{
  modelValue: boolean
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  cancel: []
}>()

function handleConfirm() {
  emit('confirm')
}

function handleClose() {
  emit('cancel')
  emit('update:modelValue', false)
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    :title="title ?? 'Confirm Action'"
    width="420px"
    :close-on-click-modal="!loading"
    :close-on-press-escape="!loading"
    @close="handleClose"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="flex items-start gap-3">
      <!-- warning icon for danger/warning -->
      <div v-if="type === 'danger' || type === 'warning'" class="flex-shrink-0 mt-0.5">
        <div
          class="w-8 h-8 rounded-full flex items-center justify-center"
          :class="type === 'danger' ? 'bg-red-50' : 'bg-amber-50'"
        >
          <AlertTriangle
            class="w-5 h-5"
            :class="type === 'danger' ? 'text-red-600' : 'text-amber-500'"
          />
        </div>
      </div>
      <p class="text-sm text-slate-600 leading-relaxed">
        {{ message ?? 'Are you sure you want to proceed? This action cannot be undone.' }}
      </p>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <el-button :disabled="loading" @click="handleClose">
          {{ cancelText ?? 'Cancel' }}
        </el-button>
        <el-button
          :type="type === 'danger' ? 'danger' : type === 'warning' ? 'warning' : 'primary'"
          :loading="loading"
          @click="handleConfirm"
        >
          {{ confirmText ?? 'Confirm' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>
