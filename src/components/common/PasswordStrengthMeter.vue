<script setup lang="ts">
import { computed } from 'vue'
import { getPasswordStrength } from '@/utils/passwordStrength'

const props = defineProps<{
  password: string
}>()

const strength = computed(() => getPasswordStrength(props.password))
</script>

<template>
  <div v-if="password" class="mt-1.5">
    <el-progress
      :percentage="strength.percentage"
      :stroke-width="6"
      :color="strength.color"
      :show-text="false"
    />
    <p class="mt-1 text-xs" :style="{ color: strength.color }">
      Password strength: {{ strength.label }}
    </p>
    <p v-if="strength.level === 'weak' || strength.level === 'fair'" class="mt-0.5 text-xs text-slate-500">
      Use 8+ characters with uppercase, lowercase, numbers, and symbols.
    </p>
  </div>
</template>
