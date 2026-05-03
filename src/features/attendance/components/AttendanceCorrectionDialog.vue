<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { correctAttendance } from '../services/attendance.api'
import type { Attendance, AttendanceStatus, CorrectionPayload } from '../types/attendance'
import { useNotify } from '@/composables/useNotify'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { BaseModal, BaseButton, BaseInput } from '@/components/common'

const props = defineProps<{
  visible: boolean
  attendance: Attendance | null
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  saved: []
}>()

const notify = useNotify()
const formRef = ref<FormInstance>()
const submitting = ref(false)

const form = reactive({
  clock_in_time: '',
  clock_out_time: '',
  status: '' as AttendanceStatus | '',
  correction_reason: '',
})

const rules: FormRules = {
  status: [{ required: true, message: 'Status is required', trigger: 'change' }],
  correction_reason: [{ required: true, message: 'Correction reason is required', trigger: 'blur' }],
}

function timeFromIso(isoStr: string | null): string {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  const h = d.getHours().toString().padStart(2, '0')
  const m = d.getMinutes().toString().padStart(2, '0')
  const s = d.getSeconds().toString().padStart(2, '0')
  return `${h}:${m}:${s}`
}

watch(
  () => props.visible,
  (v) => {
    if (v && props.attendance) {
      form.clock_in_time = timeFromIso(props.attendance.clock_in_time)
      form.clock_out_time = timeFromIso(props.attendance.clock_out_time)
      form.status = props.attendance.status
      form.correction_reason = ''
    }
    // clearValidate not needed: BaseModal uses destroy-on-close so form unmounts on close
  },
)

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid || !props.attendance) return

  const datePrefix = props.attendance.attendance_date
  const payload: CorrectionPayload = {
    status: form.status as AttendanceStatus,
    correction_reason: form.correction_reason,
  }
  if (form.clock_in_time) payload.clock_in_time = `${datePrefix} ${form.clock_in_time}`
  if (form.clock_out_time) payload.clock_out_time = `${datePrefix} ${form.clock_out_time}`

  submitting.value = true
  try {
    await correctAttendance(props.attendance.id, payload)
    notify.success('Attendance corrected successfully.')
    emit('update:visible', false)
    emit('saved')
  } catch (err) {
    notify.error(getApiErrorMessage(err))
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <BaseModal
    :model-value="visible"
    title="Correct Attendance"
    width="480px"
    :loading="submitting"
    @update:model-value="emit('update:visible', $event)"
  >
    <div v-if="attendance" class="mb-4 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm text-slate-600">
      <span class="font-medium">{{ attendance.employee.full_name }}</span>
      <span class="mx-2 text-slate-300">·</span>
      <span>{{ new Date(attendance.attendance_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }}</span>
    </div>

    <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
      <div class="grid grid-cols-2 gap-4">
        <el-form-item label="Clock-in Time">
          <el-time-picker
            v-model="form.clock_in_time"
            format="HH:mm:ss"
            value-format="HH:mm:ss"
            placeholder="Clock-in time"
            class="!w-full"
          />
        </el-form-item>
        <el-form-item label="Clock-out Time">
          <el-time-picker
            v-model="form.clock_out_time"
            format="HH:mm:ss"
            value-format="HH:mm:ss"
            placeholder="Clock-out time"
            class="!w-full"
          />
        </el-form-item>
      </div>

      <el-form-item label="Status" prop="status">
        <el-select v-model="form.status" class="!w-full">
          <el-option label="Present" value="present" />
          <el-option label="Late" value="late" />
          <el-option label="Absent" value="absent" />
          <el-option label="Missing Clock-out" value="missing_clock_out" />
        </el-select>
      </el-form-item>

      <el-form-item label="Correction Reason" prop="correction_reason">
        <BaseInput
          v-model="form.correction_reason"
          type="textarea"
          :rows="3"
          placeholder="Describe the reason for this correction"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="flex justify-end gap-2">
        <BaseButton @click="emit('update:visible', false)">Cancel</BaseButton>
        <BaseButton
          type="primary"
          :loading="submitting"
          class="!bg-emerald-600 !border-emerald-600 hover:!bg-emerald-700 hover:!border-emerald-700"
          @click="handleSubmit"
        >
          Save Correction
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
