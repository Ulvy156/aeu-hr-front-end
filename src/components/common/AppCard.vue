<script setup lang="ts">
defineProps<{
  noPadding?: boolean
  title?: string
  subtitle?: string
}>()
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-xl shadow-sm" :class="noPadding ? '' : 'p-6'">
    <!-- Optional built-in header -->
    <div v-if="title || $slots.header" :class="noPadding ? 'px-6 pt-5 pb-4' : 'mb-4'">
      <slot name="header">
        <div>
          <h2 class="text-base font-semibold text-slate-900">{{ title }}</h2>
          <p v-if="subtitle" class="mt-0.5 text-sm text-slate-500">{{ subtitle }}</p>
        </div>
      </slot>
    </div>

    <!-- Divider below header when using noPadding + title -->
    <div
      v-if="(title || $slots.header) && noPadding"
      class="border-t border-gray-100"
    />

    <!-- Main content -->
    <div :class="noPadding && (title || $slots.header) ? 'px-6 py-5' : ''">
      <slot />
    </div>

    <!-- Optional footer -->
    <div
      v-if="$slots.footer"
      :class="noPadding ? 'px-6 py-4 border-t border-gray-100' : 'mt-4 pt-4 border-t border-gray-100'"
    >
      <slot name="footer" />
    </div>
  </div>
</template>
