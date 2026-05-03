<script setup lang="ts">
import type { Component } from 'vue';

defineProps<{
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default'
  size?: 'large' | 'default' | 'small'
  loading?: boolean
  disabled?: boolean
  plain?: boolean
  text?: boolean
  nativeType?: 'button' | 'submit' | 'reset'
  icon?: Component
}>()

defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<template>
  <el-button
    :type="type !== 'default' ? type : undefined"
    :size="size"
    :loading="loading"
    :disabled="disabled"
    :plain="plain"
    :text="text"
    :native-type="nativeType ?? 'button'"
    :icon="icon"
    @click="$emit('click', $event)"
  >
    <template v-if="$slots.icon" #icon>
      <slot name="icon" />
    </template>
    <slot />
  </el-button>
</template>
