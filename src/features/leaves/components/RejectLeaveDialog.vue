<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { BaseModal, BaseButton } from '@/components/common'

const props = defineProps<{
  visible: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  reject: [reason: string]
}>()

const formRef = ref<FormInstance>()
const form = reactive({ rejection_reason: '' })

const rules: FormRules = {
  rejection_reason: [
    { required: true, message: 'Rejection reason is required', trigger: 'blur' },
    { min: 5, message: 'Please provide a meaningful reason', trigger: 'blur' },
  ],
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  emit('reject', form.rejection_reason)
}

function handleClose() {
  if (!props.loading) {
    form.rejection_reason = ''
    formRef.value?.clearValidate()
    emit('update:visible', false)
  }
}
</script>

<template>
  <BaseModal
    :model-value="visible"
    title="Reject Leave Request"
    width="460px"
    :loading="loading"
    @update:model-value="handleClose"
  >
    <div class="mb-4 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700">
      Rejecting this leave request will set the status to rejected. Please provide a clear reason.
    </div>

    <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
      <el-form-item label="Rejection Reason" prop="rejection_reason">
        <el-input
          v-model="form.rejection_reason"
          type="textarea"
          :rows="3"
          placeholder="Describe why this leave request is being rejected"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="flex justify-end gap-2">
        <BaseButton :disabled="loading" @click="handleClose">Cancel</BaseButton>
        <BaseButton type="danger" :loading="loading" @click="handleSubmit">
          Reject Request
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
