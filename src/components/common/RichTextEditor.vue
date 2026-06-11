<script setup lang="ts">
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

defineProps<{
  modelValue?: string
  placeholder?: string
  readonly?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['link'],
  ['clean'],
]
</script>

<template>
  <div class="rich-text-editor rounded-lg border border-gray-200 overflow-hidden w-full">
    <QuillEditor
      :content="modelValue"
      content-type="html"
      :placeholder="placeholder"
      :read-only="readonly"
      :toolbar="toolbarOptions"
      theme="snow"
      @update:content="emit('update:modelValue', $event)"
    />
  </div>
</template>

<style>
.rich-text-editor .ql-toolbar {
  border: none;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.rich-text-editor .ql-container {
  border: none;
  font-family: inherit;
  font-size: 0.875rem;
  min-height: 160px;
}

.rich-text-editor .ql-editor {
  min-height: 160px;
}
</style>
