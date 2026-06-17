<script setup lang="ts">
import { ref, computed } from 'vue'
import { Upload, X, FileText } from '@lucide/vue'
import { useNotify } from '@/composables/useNotify'
import {
  DOCUMENT_ACCEPT,
  DOCUMENT_MAX_COUNT,
  DOCUMENT_MAX_TOTAL_SIZE,
  DOCUMENT_ALLOWED_TYPES,
} from '../types/employee'
import type { EmployeeDocument } from '../types/employee'

const props = defineProps<{
  existingDocs: EmployeeDocument[]
}>()

const notify = useNotify()
const newFiles = ref<File[]>([])
const removedIndices = ref<Set<number>>(new Set())

const keptExistingCount = computed(
  () => props.existingDocs.length - removedIndices.value.size,
)
const totalDocCount = computed(() => keptExistingCount.value + newFiles.value.length)
const canAddMore = computed(() => totalDocCount.value < DOCUMENT_MAX_COUNT)

const totalDocSize = computed(() => {
  let size = 0
  props.existingDocs.forEach((d, i) => {
    if (!removedIndices.value.has(i)) size += d.size
  })
  newFiles.value.forEach((f) => (size += f.size))
  return size
})

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function onFilesSelected(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files) return
  const files = Array.from(input.files)

  for (const file of files) {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
    if (!DOCUMENT_ALLOWED_TYPES.includes(ext)) {
      notify.error(`File "${file.name}" has an unsupported type.`)
      input.value = ''
      return
    }
  }

  const spaceLeft = DOCUMENT_MAX_COUNT - totalDocCount.value
  if (files.length > spaceLeft) {
    notify.error(`You can only add ${spaceLeft} more document(s).`)
    input.value = ''
    return
  }

  let projectedSize = totalDocSize.value
  for (const f of files) projectedSize += f.size
  if (projectedSize > DOCUMENT_MAX_TOTAL_SIZE) {
    notify.error('Total document size would exceed 20 MB.')
    input.value = ''
    return
  }

  newFiles.value.push(...files)
  input.value = ''
}

function removeNew(index: number) {
  newFiles.value.splice(index, 1)
}

function toggleRemoveExisting(index: number) {
  if (removedIndices.value.has(index)) {
    removedIndices.value.delete(index)
  } else {
    removedIndices.value.add(index)
  }
}

function reset() {
  newFiles.value = []
  removedIndices.value = new Set()
}

defineExpose({ newFiles, removedIndices, reset })
</script>

<template>
  <div>
    <p class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 mt-2">Documents (optional)</p>
    <div class="space-y-3 mb-4">
      <div class="flex items-center justify-between">
        <span class="text-xs text-slate-500">{{ totalDocCount }}/{{ DOCUMENT_MAX_COUNT }} documents</span>
        <span class="text-xs text-slate-400">{{ formatFileSize(totalDocSize) }} / 20 MB</span>
      </div>

      <!-- Existing documents -->
      <div v-if="existingDocs.length > 0" class="space-y-2">
        <div
          v-for="(doc, index) in existingDocs"
          :key="`existing-${index}`"
          class="flex items-center gap-3 rounded-lg border px-3 py-2"
          :class="removedIndices.has(index) ? 'border-red-200 bg-red-50 opacity-60' : 'border-gray-200 bg-gray-50'"
        >
          <FileText class="w-4 h-4 text-slate-400 shrink-0" />
          <div class="flex-1 min-w-0">
            <p class="text-sm text-slate-700 truncate">{{ doc.name }}</p>
            <p class="text-xs text-slate-400">{{ formatFileSize(doc.size) }}</p>
          </div>
          <button
            type="button"
            class="text-xs shrink-0"
            :class="removedIndices.has(index) ? 'text-emerald-600 hover:text-emerald-700' : 'text-red-500 hover:text-red-700'"
            @click="toggleRemoveExisting(index)"
          >
            {{ removedIndices.has(index) ? 'Undo' : 'Remove' }}
          </button>
        </div>
      </div>

      <!-- New documents pending upload -->
      <div v-if="newFiles.length > 0" class="space-y-2">
        <div
          v-for="(file, index) in newFiles"
          :key="`new-${index}`"
          class="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2"
        >
          <FileText class="w-4 h-4 text-emerald-500 shrink-0" />
          <div class="flex-1 min-w-0">
            <p class="text-sm text-slate-700 truncate">{{ file.name }}</p>
            <p class="text-xs text-slate-400">{{ formatFileSize(file.size) }}</p>
          </div>
          <button
            type="button"
            class="text-red-500 hover:text-red-700"
            @click="removeNew(index)"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Add files button -->
      <label
        v-if="canAddMore"
        class="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-3 cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-colors"
      >
        <Upload class="w-4 h-4 text-slate-400" />
        <span class="text-sm text-slate-500">Add documents</span>
        <input
          type="file"
          multiple
          :accept="DOCUMENT_ACCEPT"
          class="hidden"
          @change="onFilesSelected"
        />
      </label>
      <p class="text-xs text-slate-400">PDF, JPG, PNG, WebP, DOC, DOCX — max 20 MB total</p>
    </div>
  </div>
</template>
