<script setup lang="ts">
defineProps<{
  name: string
  employeeId: string
}>()
</script>

<template>
  <div>
    <p class="text-xs font-medium text-slate-800">{{ name }}</p>
    <p v-if="employeeId" class="text-[11px] text-slate-400">{{ employeeId }}</p>
  </div>
</template>
