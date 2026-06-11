<script setup lang="ts" generic="T extends string | number | boolean | null | undefined">
import { useAttrs } from 'vue'
import type { SelectOption } from './select'

defineOptions({ inheritAttrs: false })

withDefaults(
  defineProps<{
    modelValue?: T
    options?: SelectOption<T>[]
    placeholder?: string
    disabled?: boolean
    clearable?: boolean
    filterable?: boolean
    multiple?: boolean
    loading?: boolean
    remote?: boolean
    remoteMethod?: (query: string) => void
    size?: 'large' | 'default' | 'small'
  }>(),
  {
    options: () => [],
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: T]
  change: [value: T]
  clear: []
}>()

const attrs = useAttrs()
</script>

<template>
  <el-select
    v-bind="attrs"
    :model-value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :clearable="clearable"
    :filterable="filterable"
    :multiple="multiple"
    :loading="loading"
    :remote="remote"
    :remote-method="remoteMethod"
    :size="size"
    class="w-full"
    @update:model-value="emit('update:modelValue', $event)"
    @change="emit('change', $event)"
    @clear="emit('clear')"
  >
    <slot>
      <el-option
        v-for="opt in options"
        :key="String(opt.value)"
        :label="opt.label"
        :value="opt.value"
        :disabled="opt.disabled"
      />
    </slot>
  </el-select>
</template>
