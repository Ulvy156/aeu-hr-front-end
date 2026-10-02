<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ClipboardPen } from '@lucide/vue'
import { BaseButton, BaseInput } from '@/components/common'
import { useNotify } from '@/composables/useNotify'
import { usePermission } from '@/composables/usePermissions'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { correctAttendance } from '../services/attendance.api'
import type { Attendance, AttendanceStatus, CorrectionPayload } from '../types/attendance'
import { ATTENDANCE_STATUS_LABELS } from '../types/attendance'
import {
  formatAttendanceDate,
  formatAttendanceDateTime,
  formatAttendanceTime,
  timeFromIso,
} from '../utils/formatAttendance'

const props = defineProps<{
  attendance: Attendance | null
}>()

const emit = defineEmits<{
  close: []
  saved: [attendance: Attendance]
}>()

const { can } = usePermission()
const auth = useAuthStore()
const notify = useNotify()
const formRef = ref<FormInstance>()
const submitting = ref(false)
const isOwnRecord = computed(() => props.attendance !== null && auth.user?.employee?.id === props.attendance.employee.id)
const canCorrect = computed(() => can('attendance.correct') && !isOwnRecord.value)

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

watch(
  () => props.attendance?.id,
  () => {
    if (!props.attendance) return
    form.clock_in_time = timeFromIso(props.attendance.clock_in_time)
    form.clock_out_time = timeFromIso(props.attendance.clock_out_time)
    form.status = props.attendance.status
    form.correction_reason = ''
  },
  { immediate: true },
)

async function handleSubmit() {
  if (!canCorrect.value) return
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid || !props.attendance) return

  const payload: CorrectionPayload = {
    status: form.status as AttendanceStatus,
    correction_reason: form.correction_reason,
  }
  if (form.clock_in_time) payload.clock_in_time = `${props.attendance.attendance_date} ${form.clock_in_time}`
  if (form.clock_out_time) payload.clock_out_time = `${props.attendance.attendance_date} ${form.clock_out_time}`

  submitting.value = true
  try {
    const res = await correctAttendance(props.attendance.id, payload)
    notify.success('Attendance corrected successfully.')
    emit('saved', res.data)
  } catch (err) {
    notify.error(getApiErrorMessage(err))
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="rounded-xl border border-gray-200 bg-white p-5">
    <div v-if="!attendance" class="py-6 text-center">
      <div class="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
        <ClipboardPen class="h-5 w-5" />
      </div>
      <p class="text-sm font-semibold text-slate-800">Correction panel</p>
      <p class="mt-1 text-sm text-slate-500">
        Select a row to edit clock-in, clock-out, and status. Reason is required. GPS is never sent.
      </p>
    </div>

    <div v-else class="space-y-4">
      <p v-if="isOwnRecord" class="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
        You cannot correct your own attendance.
      </p>
      <div class="flex items-start gap-3">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-semibold text-emerald-700"
        >
          {{ attendance.employee.full_name.charAt(0) }}
        </div>
        <div class="min-w-0">
          <p class="truncate text-sm font-semibold text-slate-900">{{ attendance.employee.full_name }}</p>
          <p class="text-xs text-slate-400">
            {{ attendance.employee.employee_id }} · {{ formatAttendanceDate(attendance.attendance_date) }}
          </p>
        </div>
        <BaseButton class="ml-auto shrink-0" size="small" @click="emit('close')">Close</BaseButton>
      </div>

      <div class="rounded-lg border border-gray-100 bg-gray-50 p-3">
        <div class="mb-2 flex items-center justify-between gap-2">
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">Current record</p>
          <el-tag size="small" round disable-transitions>
            {{ ATTENDANCE_STATUS_LABELS[attendance.status] }}
          </el-tag>
        </div>
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p class="text-xs text-slate-400">Clock-in</p>
            <p class="font-medium text-slate-800">{{ formatAttendanceTime(attendance.clock_in_time) }}</p>
          </div>
          <div>
            <p class="text-xs text-slate-400">Clock-out</p>
            <p class="font-medium text-slate-800">{{ formatAttendanceTime(attendance.clock_out_time) }}</p>
          </div>
        </div>
        <p class="mt-2 text-xs text-slate-500">
          {{
            attendance.is_late
              ? 'Backend marked this day late from clock-in vs working start.'
              : 'Late flag is off. The backend will recalculate it after save.'
          }}
        </p>
      </div>

      <div
        v-if="attendance.corrected_by_user"
        class="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-700"
      >
        <p class="font-medium">Last correction · {{ attendance.corrected_by_user.name }}</p>
        <p class="mt-1">{{ attendance.correction_reason ?? 'No reason stored.' }}</p>
        <p class="mt-1 text-xs text-blue-600">
          Recorded {{ formatAttendanceDateTime(attendance.corrected_at) }}. A new save overwrites this latest correction.
        </p>
      </div>

      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" :disabled="!canCorrect">
        <div class="grid grid-cols-2 gap-3">
          <el-form-item label="Clock-in time">
            <el-time-picker
              v-model="form.clock_in_time"
              format="HH:mm:ss"
              value-format="HH:mm:ss"
              placeholder="Clock-in"
              class="!w-full"
            />
          </el-form-item>
          <el-form-item label="Clock-out time">
            <el-time-picker
              v-model="form.clock_out_time"
              format="HH:mm:ss"
              value-format="HH:mm:ss"
              placeholder="Clock-out"
              class="!w-full"
            />
          </el-form-item>
        </div>

        <el-form-item label="Status" prop="status">
          <el-select v-model="form.status" class="!w-full">
            <el-option
              v-for="(label, value) in ATTENDANCE_STATUS_LABELS"
              :key="String(value)"
              :label="label"
              :value="value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Correction reason" prop="correction_reason">
          <BaseInput
            v-model="form.correction_reason"
            type="textarea"
            :rows="3"
            placeholder="Why this record is being changed"
          />
        </el-form-item>
      </el-form>

      <p class="text-xs text-slate-400">
        Payload is clock_in_time, clock_out_time, status, and correction_reason. is_late and GPS are not sent.
      </p>

      <div class="flex justify-end gap-2">
        <BaseButton @click="emit('close')">Cancel</BaseButton>
        <BaseButton
          v-if="canCorrect"
          type="primary"
          :loading="submitting"
          @click="handleSubmit"
        >
          Save correction
        </BaseButton>
      </div>
    </div>
  </div>
</template>
