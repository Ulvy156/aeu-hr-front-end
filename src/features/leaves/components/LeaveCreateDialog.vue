<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useNotify } from '@/composables/useNotify'
import { parseApiError } from '@/utils/api-error'
import { createLeave } from '../services/leave.api'
import { BaseModal, BaseButton } from '@/components/common'
import type { LeaveCreatePayload, LeaveType, DurationType } from '../types/leave'

defineProps<{ visible: boolean }>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  created: []
}>()

const notify = useNotify()
const formRef = ref<FormInstance>()
const submitting = ref(false)
const fieldErrors = ref<Record<string, string>>({})

const form = reactive<LeaveCreatePayload>({
  leave_type: '',
  start_date: '',
  end_date: '',
  duration_type: '',
  reason: '',
})

const leaveTypeOptions = [
  { label: 'Annual Leave', value: 'annual' },
  { label: 'Sick Leave', value: 'sick' },
  { label: 'Maternity Leave', value: 'maternity' },
  { label: 'Unpaid Leave', value: 'unpaid' },
]

const durationTypeOptions = [
  { label: 'Full Day', value: 'full_day' },
  { label: 'Half Day', value: 'half_day' },
]

const rules: FormRules = {
  leave_type: [{ required: true, message: 'Leave type is required', trigger: 'change' }],
  start_date: [{ required: true, message: 'Start date is required', trigger: 'change' }],
  end_date: [{ required: true, message: 'End date is required', trigger: 'change' }],
  duration_type: [{ required: true, message: 'Duration type is required', trigger: 'change' }],
  reason: [
    { required: true, message: 'Reason is required', trigger: 'blur' },
    { min: 3, message: 'Reason must be at least 3 characters', trigger: 'blur' },
  ],
}

function clearFieldError(field: string) {
  delete fieldErrors.value[field]
}

function resetForm() {
  form.leave_type = ''
  form.start_date = ''
  form.end_date = ''
  form.duration_type = ''
  form.reason = ''
  fieldErrors.value = {}
  formRef.value?.clearValidate()
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  fieldErrors.value = {}
  try {
    await createLeave({
      leave_type: form.leave_type as LeaveType,
      start_date: form.start_date,
      end_date: form.end_date,
      duration_type: form.duration_type as DurationType,
      reason: form.reason,
    })
    notify.success('Leave request submitted successfully.')
    emit('update:visible', false)
    emit('created')
    resetForm()
  } catch (err) {
    const parsed = parseApiError(err)
    if (Object.keys(parsed.errors).length > 0) {
      Object.entries(parsed.errors).forEach(([field, messages]) => {
        fieldErrors.value[field] = messages[0] ?? ''
      })
    } else {
      notify.error(parsed.message)
    }
  } finally {
    submitting.value = false
  }
}

function handleClose() {
  if (!submitting.value) {
    resetForm()
    emit('update:visible', false)
  }
}
</script>

<template>
  <BaseModal
    :model-value="visible"
    title="Request Leave"
    width="540px"
    :loading="submitting"
    @update:model-value="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
      <el-form-item label="Leave Type" prop="leave_type">
        <el-select
          v-model="form.leave_type"
          placeholder="Select leave type"
          class="!w-full"
          @change="clearFieldError('leave_type')"
        >
          <el-option
            v-for="opt in leaveTypeOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
        <p v-if="fieldErrors.leave_type" class="mt-1 text-xs text-red-500">{{ fieldErrors.leave_type }}</p>
      </el-form-item>

      <div class="grid grid-cols-2 gap-4">
        <el-form-item label="Start Date" prop="start_date">
          <el-date-picker
            v-model="form.start_date"
            type="date"
            placeholder="Start date"
            value-format="YYYY-MM-DD"
            class="!w-full"
            @change="clearFieldError('start_date')"
          />
          <p v-if="fieldErrors.start_date" class="mt-1 text-xs text-red-500">{{ fieldErrors.start_date }}</p>
        </el-form-item>

        <el-form-item label="End Date" prop="end_date">
          <el-date-picker
            v-model="form.end_date"
            type="date"
            placeholder="End date"
            value-format="YYYY-MM-DD"
            class="!w-full"
            @change="clearFieldError('end_date')"
          />
          <p v-if="fieldErrors.end_date" class="mt-1 text-xs text-red-500">{{ fieldErrors.end_date }}</p>
        </el-form-item>
      </div>

      <el-form-item label="Duration Type" prop="duration_type">
        <el-select
          v-model="form.duration_type"
          placeholder="Select duration type"
          class="!w-full"
          @change="clearFieldError('duration_type')"
        >
          <el-option
            v-for="opt in durationTypeOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
        <p v-if="fieldErrors.duration_type" class="mt-1 text-xs text-red-500">{{ fieldErrors.duration_type }}</p>
        <p class="mt-1 text-xs text-slate-400">Half day requires same start and end date.</p>
      </el-form-item>

      <el-form-item label="Reason" prop="reason">
        <el-input
          v-model="form.reason"
          type="textarea"
          :rows="3"
          placeholder="Describe the reason for this leave request"
          @input="clearFieldError('reason')"
        />
        <p v-if="fieldErrors.reason" class="mt-1 text-xs text-red-500">{{ fieldErrors.reason }}</p>
      </el-form-item>

      <div
        v-if="fieldErrors.general || fieldErrors.balance"
        class="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700"
      >
        {{ fieldErrors.general || fieldErrors.balance }}
      </div>
    </el-form>

    <template #footer>
      <div class="flex justify-end gap-2">
        <BaseButton :disabled="submitting" @click="handleClose">Cancel</BaseButton>
        <BaseButton
          type="primary"
          :loading="submitting"
          class="!bg-emerald-600 !border-emerald-600 hover:!bg-emerald-700 hover:!border-emerald-700"
          @click="handleSubmit"
        >
          Submit Request
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
