<script setup lang="ts">
import BaseButton from './BaseButton.vue';

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
    <BaseButton
      v-if="showCancel !== false"
      :disabled="loading"
      @click="$emit('cancel')"
    >
      {{ cancelText ?? 'Cancel' }}
    </BaseButton>

    <BaseButton
      :type="submitType ?? 'primary'"
      :loading="loading"
      @click="$emit('submit')"
    >
      {{ submitText ?? 'Save' }}
    </BaseButton>
  </div>
</template>
