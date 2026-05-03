<script setup lang="ts">
import { ref, watch } from 'vue'
import { UserX } from '@lucide/vue'
import { markAbsent } from '../services/attendance.api'
import { useNotify } from '@/composables/useNotify'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { BaseModal, BaseButton } from '@/components/common'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  marked: []
}>()

const notify = useNotify()
const submitting = ref(false)
const selectedDate = ref('')
const resultMessage = ref('')

watch(
  () => props.visible,
  (v) => {
    if (v) {
      selectedDate.value = ''
      resultMessage.value = ''
    }
  },
)

async function handleSubmit() {
  submitting.value = true
  resultMessage.value = ''
  try {
    const payload = selectedDate.value ? { attendance_date: selectedDate.value } : {}
    const res = await markAbsent(payload)
    const msg = `${res.data.created_count} employee(s) marked absent for ${res.data.attendance_date}.`
    resultMessage.value = msg
    notify.success(msg)
    emit('marked')
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
    title="Mark Absent"
    width="420px"
    :loading="submitting"
    @update:model-value="emit('update:visible', $event)"
  >
    <div class="flex items-start gap-3 p-4 mb-4 bg-amber-50 rounded-lg border border-amber-100">
      <UserX class="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
      <p class="text-sm text-amber-700">
        This will mark absent all employees who have no attendance record, no approved leave,
        and are within their employment period for the selected date. Non-working days and public
        holidays are skipped automatically.
      </p>
    </div>

    <el-form label-position="top">
      <el-form-item label="Date (optional — leave empty to use today)">
        <el-date-picker
          v-model="selectedDate"
          type="date"
          placeholder="Today"
          value-format="YYYY-MM-DD"
          class="!w-full"
          clearable
        />
      </el-form-item>
    </el-form>

    <div
      v-if="resultMessage"
      class="mt-2 px-3 py-2 bg-green-50 rounded-lg border border-green-100 text-sm text-green-700"
    >
      {{ resultMessage }}
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <BaseButton @click="emit('update:visible', false)">Close</BaseButton>
        <BaseButton
          type="primary"
          :loading="submitting"
          class="!bg-emerald-600 !border-emerald-600 hover:!bg-emerald-700 hover:!border-emerald-700"
          @click="handleSubmit"
        >
          Mark Absent
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
