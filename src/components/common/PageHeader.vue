<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<template>
  <div class="flex items-start justify-between mb-6">
    <div>
      <h1 class="text-2xl font-semibold text-slate-900">{{ title }}</h1>
      <p v-if="subtitle" class="mt-1 text-sm text-slate-500">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.action" class="flex-shrink-0 ml-4 mt-1">
      <slot name="action" />
    </div>
  </div>
</template>
