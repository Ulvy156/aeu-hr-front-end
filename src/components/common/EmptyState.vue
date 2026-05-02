<script setup lang="ts">
import { Inbox } from '@lucide/vue'

defineProps<{
  title?: string
  description?: string
  actionLabel?: string
}>()

defineEmits<{
  action: []
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div class="w-14 h-14 mb-4 text-slate-300">
      <slot name="icon">
        <Inbox class="w-full h-full" stroke-width="1.25" />
      </slot>
    </div>

    <h3 class="text-base font-medium text-slate-700">
      {{ title ?? 'No data found' }}
    </h3>

    <p v-if="description" class="mt-1.5 text-sm text-slate-400 max-w-sm leading-relaxed">
      {{ description }}
    </p>

    <el-button v-if="actionLabel" type="primary" class="mt-5" @click="$emit('action')">
      {{ actionLabel }}
    </el-button>
  </div>
</template>
