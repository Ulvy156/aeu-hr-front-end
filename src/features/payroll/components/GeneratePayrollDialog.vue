<script setup lang="ts">
import { ref, reactive } from 'vue'
import { BaseButton } from '@/components/common'

const props = defineProps<{
  visible: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  generate: [month: number, year: number]
}>()

const currentYear = new Date().getFullYear()

const form = reactive({
  month: null as number | null,
  year: currentYear,
})

const monthOptions = [
  { label: 'January', value: 1 },
  { label: 'February', value: 2 },
  { label: 'March', value: 3 },
  { label: 'April', value: 4 },
  { label: 'May', value: 5 },
  { label: 'June', value: 6 },
  { label: 'July', value: 7 },
  { label: 'August', value: 8 },
  { label: 'September', value: 9 },
  { label: 'October', value: 10 },
  { label: 'November', value: 11 },
  { label: 'December', value: 12 },
]

const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

const formRef = ref()

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  emit('generate', form.month!, form.year)
}

function handleClose() {
  if (props.loading) return
  emit('update:visible', false)
}

const rules = {
  month: [{ required: true, message: 'Please select a month', trigger: 'change' }],
  year: [{ required: true, message: 'Please select a year', trigger: 'change' }],
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="Generate Payroll"
    width="420px"
    :close-on-click-modal="!loading"
    :close-on-press-escape="!loading"
    @close="handleClose"
    @update:model-value="emit('update:visible', $event)"
  >
    <div class="mb-1 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-700">
      Payroll will be generated for all eligible active employees for the selected month and year.
      Duplicate payroll for the same period will be rejected by the system.
    </div>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      class="mt-4 space-y-1"
    >
      <el-form-item label="Month" prop="month">
        <el-select v-model="form.month" placeholder="Select month" class="w-full">
          <el-option
            v-for="opt in monthOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="Year" prop="year">
        <el-select v-model="form.year" placeholder="Select year" class="w-full">
          <el-option v-for="y in yearOptions" :key="y" :label="String(y)" :value="y" />
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="flex justify-end gap-3">
        <BaseButton :disabled="loading" @click="handleClose">Cancel</BaseButton>
        <BaseButton
          type="primary"
          :loading="loading"
          class="!bg-emerald-600 !border-emerald-600 hover:!bg-emerald-700"
          @click="handleSubmit"
        >
          Generate Payroll
        </BaseButton>
      </div>
    </template>
  </el-dialog>
</template>
