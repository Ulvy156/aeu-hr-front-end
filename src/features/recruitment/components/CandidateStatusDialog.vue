<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { usePermission } from '@/composables/usePermissions'
import { BaseModal, BaseButton } from '@/components/common'
import type { Candidate, CandidateStatus } from '../types/candidate'

const props = defineProps<{
  visible: boolean
  candidate: Candidate | null
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  submit: [status: CandidateStatus, outcomeReason: string | null]
}>()

const { can } = usePermission()
const formRef = ref<FormInstance>()

const form = reactive({
  status: '' as CandidateStatus | '',
  outcome_reason: '',
})

const requiresOutcomeReason = computed(() =>
  ['company_rejected', 'candidate_declined', 'no_show'].includes(form.status),
)

const statusOptions = computed(() => {
  const options: { label: string; value: CandidateStatus }[] = [
    { label: 'New', value: 'new' },
    { label: 'Shortlisted', value: 'shortlisted' },
    { label: 'Contacting Candidate', value: 'contacting_candidate' },
    { label: 'Interview', value: 'interview' },
    { label: 'Offer Extended', value: 'offer_extended' },
    { label: 'Offer Accepted', value: 'offer_accepted' },
  ]
  if (can('recruitment.candidates.hire')) {
    options.push({ label: 'Hired', value: 'hired' })
  }
  options.push(
    { label: 'Company Rejected', value: 'company_rejected' },
    { label: 'Candidate Declined', value: 'candidate_declined' },
    { label: 'No Show', value: 'no_show' },
  )
  return options
})

const rules = computed<FormRules>(() => ({
  status: [{ required: true, message: 'Status is required', trigger: 'change' }],
  outcome_reason: requiresOutcomeReason.value
    ? [{ required: true, message: 'Outcome reason is required for this status', trigger: 'blur' }]
    : [],
}))

watch(
  () => props.visible,
  (v) => {
    if (v) {
      form.status = props.candidate?.status ?? ''
      form.outcome_reason = props.candidate?.outcome_reason ?? ''
    } else {
      formRef.value?.clearValidate()
    }
  },
)

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid || !form.status) return
  emit('submit', form.status, requiresOutcomeReason.value ? form.outcome_reason : null)
}

function handleClose() {
  if (!props.loading) emit('update:visible', false)
}
</script>

<template>
  <BaseModal
    :model-value="visible"
    title="Change Candidate Status"
    width="460px"
    :loading="loading"
    @update:model-value="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
      <el-form-item label="Status" prop="status">
        <el-select v-model="form.status" placeholder="Select status" class="w-full">
          <el-option v-for="opt in statusOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>
      </el-form-item>

      <el-form-item v-if="requiresOutcomeReason" label="Outcome Reason" prop="outcome_reason">
        <el-input
          v-model="form.outcome_reason"
          type="textarea"
          :rows="3"
          placeholder="Describe the reason for this outcome"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="flex justify-end gap-2">
        <BaseButton :disabled="loading" @click="handleClose">Cancel</BaseButton>
        <BaseButton type="primary" :loading="loading" @click="handleSubmit">Update Status</BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
