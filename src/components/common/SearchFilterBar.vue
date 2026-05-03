<script setup lang="ts">
import { Search } from '@lucide/vue'
import BaseInput from './BaseInput.vue'
import BaseButton from './BaseButton.vue';

defineProps<{
  modelValue?: string
  placeholder?: string
  showReset?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  search: []
  reset: []
}>()

function onInput(val: string) {
  emit('update:modelValue', val)
}

function onClear() {
  emit('update:modelValue', '')
  emit('search')
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <BaseInput
      :model-value="modelValue"
      :placeholder="placeholder ?? 'Search...'"
      clearable
      class="!w-64"
      @update:model-value="onInput"
      @keyup.enter="$emit('search')"
      @clear="onClear"
    >
      <template #prefix>
        <Search class="w-4 h-4 text-slate-400" />
      </template>
    </BaseInput>

    <!-- Additional filter slots (selects, date pickers, etc.) -->
    <slot />

    <BaseButton v-if="showReset" @click="$emit('reset')">
      Reset
    </BaseButton>
  </div>
</template>
