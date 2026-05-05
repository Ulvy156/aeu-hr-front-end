<script setup lang="ts">
import { ref, reactive } from 'vue'
import { BaseButton } from '@/components/common'

const props = defineProps<{
  visible: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  reject: [reason: string]
}>()

const form = reactive({ reason: '' })
const formRef = ref()

const rules = {
  reason: [
    { required: true, message: 'Rejection reason is required', trigger: 'blur' },
    { min: 10, message: 'Please provide a more detailed reason (min 10 characters)', trigger: 'blur' },
  ],
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  emit('reject', form.reason)
}

function handleClose() {
  if (props.loading) return
  form.reason = ''
  emit('update:visible', false)
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="Reject Payroll"
    width="440px"
    :close-on-click-modal="!loading"
    :close-on-press-escape="!loading"
    @close="handleClose"
    @update:model-value="emit('update:visible', $event)"
  >
    <p class="text-sm text-slate-600 mb-4">
      Please provide a reason for rejecting this payroll batch. The HR team will be able to see this
      reason and revise the payroll.
    </p>

    <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
      <el-form-item label="Rejection Reason" prop="reason">
        <el-input
          v-model="form.reason"
          type="textarea"
          :rows="4"
          placeholder="Explain what needs to be corrected..."
          :disabled="loading"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="flex justify-end gap-3">
        <BaseButton :disabled="loading" @click="handleClose">Cancel</BaseButton>
        <BaseButton type="danger" :loading="loading" @click="handleSubmit">
          Reject Payroll
        </BaseButton>
      </div>
    </template>
  </el-dialog>
</template>
