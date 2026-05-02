<script setup lang="ts">
defineProps<{
  loading?: boolean
  submitText?: string
  cancelText?: string
  showCancel?: boolean
  submitType?: 'primary' | 'danger'
  align?: 'left' | 'right' | 'between'
}>()

defineEmits<{
  submit: []
  cancel: []
}>()
</script>

<template>
  <div
    class="flex items-center gap-3 pt-5 border-t border-gray-100"
    :class="{
      'justify-end': !align || align === 'right',
      'justify-start': align === 'left',
      'justify-between': align === 'between',
    }"
  >
    <el-button
      v-if="showCancel !== false"
      :disabled="loading"
      @click="$emit('cancel')"
    >
      {{ cancelText ?? 'Cancel' }}
    </el-button>

    <el-button
      :type="submitType ?? 'primary'"
      :loading="loading"
      @click="$emit('submit')"
    >
      {{ submitText ?? 'Save' }}
    </el-button>
  </div>
</template>
