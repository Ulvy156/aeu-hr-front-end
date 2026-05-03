<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { UploadFile } from 'element-plus'
import BaseButton from '@/components/common/BaseButton.vue';
const props = defineProps<{
  currentLogoUrl: string | null
  disabled?: boolean
  companyName?: string
}>()

const emit = defineEmits<{
  'file-selected': [file: File | null]
}>()

const previewUrl = ref<string | null>(props.currentLogoUrl)

watch(
  () => props.currentLogoUrl,
  (url) => {
    if (!previewUrl.value) previewUrl.value = url
  },
)

const initials = computed(() => {
  if (!props.companyName?.trim()) return ''
  return props.companyName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
})

function handleChange(file: UploadFile) {
  if (!file.raw) return
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml']
  if (!allowed.includes(file.raw.type)) {
    ElMessage.error('Only JPG, PNG, WebP, or SVG images are allowed.')
    return
  }
  if (file.raw.size > 2 * 1024 * 1024) {
    ElMessage.error('Logo image must be under 2 MB.')
    return
  }
  previewUrl.value = URL.createObjectURL(file.raw)
  emit('file-selected', file.raw)
}

function clearLogo() {
  previewUrl.value = null
  emit('file-selected', null)
}
</script>

<template>
  <div class="flex items-center gap-5">
    <div
      class="w-20 h-20 rounded-xl border border-gray-200 overflow-hidden shrink-0 bg-gray-50 flex items-center justify-center"
    >
      <img
        v-if="previewUrl"
        :src="previewUrl"
        alt="Company logo"
        class="w-full h-full object-contain p-1"
      />
      <div
        v-else-if="initials"
        class="w-full h-full flex items-center justify-center bg-emerald-50"
      >
        <span class="text-xl font-bold text-emerald-600 select-none">{{ initials }}</span>
      </div>
      <span v-else class="text-2xl font-bold text-slate-300 select-none">?</span>
    </div>

    <div>
      <el-upload
        :auto-upload="false"
        :show-file-list="false"
        :on-change="handleChange"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml"
        :disabled="disabled"
      >
        <BaseButton size="small" :disabled="disabled">Change Logo</BaseButton>
      </el-upload>
      <p class="mt-1.5 text-xs text-slate-400">JPG, PNG, WebP, or SVG · Max 2 MB</p>
      <button
        v-if="previewUrl && !disabled"
        type="button"
        class="mt-1 text-xs text-red-500 hover:text-red-600 transition-colors"
        @click="clearLogo"
      >
        Remove logo
      </button>
    </div>
  </div>
</template>
