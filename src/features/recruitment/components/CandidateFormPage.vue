<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { FormInstance, FormRules, UploadFile } from 'element-plus'
import { FileText, X } from '@lucide/vue'
import { useNotify } from '@/composables/useNotify'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { parseApiError, getFieldError, type ApiValidationErrors } from '@/utils/api-error'
import {
  AppCard,
  BaseInput,
  BaseButton,
  BaseSelect,
  FormActions,
  PageHeader,
  StatusBadge,
  EmployeeSearchSelect,
} from '@/components/common'
import { fetchVacancies } from '../services/vacancy.api'
import { fetchCandidate, createCandidate, updateCandidate } from '../services/candidate.api'
import type { CandidateSource, CandidateCv, CandidateInterviewer } from '../types/candidate'

const route = useRoute()
const router = useRouter()
const notify = useNotify()

const candidateId = computed(() => {
  const id = route.params.id
  return id ? Number(id) : null
})
const isEdit = computed(() => candidateId.value !== null)

const formRef = ref<FormInstance>()
const loading = ref(false)
const submitting = ref(false)
const fieldErrors = ref<ApiValidationErrors>({})

const vacancyOptions = ref<{ id: number; title: string }[]>([])
const vacancyTitle = ref('')
const candidateStatus = ref('new')
const existingCv = ref<CandidateCv | null>(null)
const cvFile = ref<File | null>(null)
const interviewer = ref<CandidateInterviewer | null>(null)

const isHired = computed(() => isEdit.value && candidateStatus.value === 'hired')

const form = reactive({
  vacancy_id: null as number | null,
  full_name: '',
  phone: '',
  email: '',
  source: '' as CandidateSource | '',
  interview_date: null as string | null,
  interviewer_id: null as number | null,
  notes: '',
})

const sourceOptions: { label: string; value: CandidateSource }[] = [
  { label: 'Facebook', value: 'facebook' },
  { label: 'Telegram', value: 'telegram' },
  { label: 'LinkedIn', value: 'linkedin' },
  { label: 'Referral', value: 'referral' },
  { label: 'Walk-in', value: 'walk_in' },
  { label: 'Email', value: 'email' },
  { label: 'Other', value: 'other' },
]

const rules: FormRules = {
  vacancy_id: [{ required: true, message: 'Vacancy is required', trigger: 'change' }],
  full_name: [
    { required: true, message: 'Full name is required', trigger: 'blur' },
    { max: 255, message: 'Full name must be at most 255 characters', trigger: 'blur' },
  ],
  phone: [
    { required: true, message: 'Phone is required', trigger: 'blur' },
    { max: 50, message: 'Phone must be at most 50 characters', trigger: 'blur' },
  ],
  email: [{ type: 'email', message: 'Enter a valid email address', trigger: 'blur' }],
  source: [{ required: true, message: 'Source is required', trigger: 'change' }],
}

onMounted(async () => {
  loading.value = true
  try {
    const vacanciesRes = await fetchVacancies({ status: 'open', per_page: 100 })
    vacancyOptions.value = vacanciesRes.data.map((v) => ({ id: v.id, title: v.title }))

    if (isEdit.value && candidateId.value) {
      const res = await fetchCandidate(candidateId.value)
      const candidate = res.data
      form.vacancy_id = candidate.vacancy?.id ?? null
      form.full_name = candidate.full_name
      form.phone = candidate.phone
      form.email = candidate.email ?? ''
      form.source = candidate.source
      form.interview_date = candidate.interview_date
      form.interviewer_id = candidate.interviewer?.id ?? null
      form.notes = candidate.notes ?? ''
      interviewer.value = candidate.interviewer
      vacancyTitle.value = candidate.vacancy?.title ?? ''
      candidateStatus.value = candidate.status
      existingCv.value = candidate.cv
    } else {
      const queryVacancyId = route.query.vacancy_id
      if (queryVacancyId) {
        const id = Number(queryVacancyId)
        if (vacancyOptions.value.some((v) => v.id === id)) {
          form.vacancy_id = id
        }
      }
    }
  } catch (err) {
    notify.error(getApiErrorMessage(err))
  } finally {
    loading.value = false
  }
})

function onFileChange(file: UploadFile) {
  if (!(file.raw instanceof File)) return

  if (file.raw.type !== 'application/pdf') {
    notify.error('Only PDF files are allowed.')
    return
  }
  if (file.raw.size > 2048 * 1024) {
    notify.error('CV size must not exceed 2048 KB.')
    return
  }

  cvFile.value = file.raw
}

function removeNewFile() {
  cvFile.value = null
}

function handleCancel() {
  router.push({ name: 'candidates' })
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  if (!isEdit.value && !cvFile.value) {
    notify.error('CV file is required.')
    return
  }

  submitting.value = true
  fieldErrors.value = {}
  try {
    const payload = {
      vacancy_id: form.vacancy_id,
      full_name: form.full_name,
      phone: form.phone,
      email: form.email || null,
      source: form.source as CandidateSource,
      cv: cvFile.value,
      interview_date: form.interview_date || null,
      interviewer_id: form.interviewer_id,
      notes: form.notes || null,
    }

    if (isEdit.value && candidateId.value) {
      await updateCandidate(candidateId.value, payload)
      notify.success('Candidate updated successfully.')
    } else {
      await createCandidate(payload)
      notify.success('Candidate created successfully.')
    }
    router.push({ name: 'candidates' })
  } catch (err) {
    const parsed = parseApiError(err)
    fieldErrors.value = parsed.errors
    notify.error(parsed.message)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div>
    <PageHeader
      :title="isEdit ? 'Edit Candidate' : 'Add Candidate'"
      subtitle="Manage candidate details for the recruitment pipeline."
    />

    <AppCard class="relative">
      <div
        v-if="loading"
        class="absolute inset-0 bg-white/70 flex items-center justify-center z-10 rounded-xl"
      >
        <div class="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>

      <div
        v-if="isHired"
        class="mb-4 rounded-lg border border-amber-100 bg-amber-50 p-3 text-sm text-amber-700 flex items-center gap-2"
      >
        <StatusBadge status="hired" />
        Hired candidates are read-only and cannot be edited.
      </div>

      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="space-y-1" :disabled="isHired">
        <el-form-item label="Vacancy" prop="vacancy_id">
          <BaseSelect
            v-if="!isEdit"
            v-model="form.vacancy_id"
            :options="vacancyOptions.map((opt) => ({ label: opt.title, value: opt.id }))"
            placeholder="Select an open vacancy"
            filterable
          />
          <BaseInput v-else :model-value="vacancyTitle" disabled />
          <p v-if="getFieldError(fieldErrors, 'vacancy_id')" class="mt-1 text-xs text-red-500">
            {{ getFieldError(fieldErrors, 'vacancy_id') }}
          </p>
        </el-form-item>

        <div class="grid grid-cols-2 gap-4">
          <el-form-item label="Full Name" prop="full_name">
            <BaseInput v-model="form.full_name" placeholder="Candidate full name" maxlength="255" />
            <p v-if="getFieldError(fieldErrors, 'full_name')" class="mt-1 text-xs text-red-500">
              {{ getFieldError(fieldErrors, 'full_name') }}
            </p>
          </el-form-item>

          <el-form-item label="Phone" prop="phone">
            <BaseInput v-model="form.phone" placeholder="Phone number" maxlength="50" />
            <p v-if="getFieldError(fieldErrors, 'phone')" class="mt-1 text-xs text-red-500">
              {{ getFieldError(fieldErrors, 'phone') }}
            </p>
          </el-form-item>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <el-form-item label="Email" prop="email">
            <BaseInput v-model="form.email" placeholder="Email address (optional)" maxlength="255" />
            <p v-if="getFieldError(fieldErrors, 'email')" class="mt-1 text-xs text-red-500">
              {{ getFieldError(fieldErrors, 'email') }}
            </p>
          </el-form-item>

          <el-form-item label="Source" prop="source">
            <BaseSelect v-model="form.source" :options="sourceOptions" placeholder="Select source" />
            <p v-if="getFieldError(fieldErrors, 'source')" class="mt-1 text-xs text-red-500">
              {{ getFieldError(fieldErrors, 'source') }}
            </p>
          </el-form-item>
        </div>

        <el-form-item label="CV" :required="!isEdit">
          <div class="space-y-2 w-full">
            <div
              v-if="existingCv"
              class="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2"
            >
              <a
                :href="existingCv.url"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700"
              >
                <FileText class="w-4 h-4" />
                {{ existingCv.name }}
              </a>
            </div>

            <div v-if="cvFile" class="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
              <span class="inline-flex items-center gap-2 text-sm text-slate-700">
                <FileText class="w-4 h-4" />
                {{ cvFile.name }}
              </span>
              <button type="button" class="text-slate-400 hover:text-red-500" :disabled="isHired" @click="removeNewFile">
                <X class="w-4 h-4" />
              </button>
            </div>

            <el-upload
              v-if="!cvFile"
              :disabled="isHired"
              :auto-upload="false"
              :show-file-list="false"
              :limit="1"
              accept=".pdf"
              :on-change="onFileChange"
            >
              <BaseButton size="small" :disabled="isHired">{{ isEdit ? 'Replace CV' : 'Select CV' }}</BaseButton>
              <template #tip>
                <p class="text-xs text-slate-400 mt-1">
                  PDF only — max 2048 KB{{ isEdit ? '. Leave empty to keep the current CV.' : '' }}
                </p>
              </template>
            </el-upload>

            <p v-if="getFieldError(fieldErrors, 'cv')" class="text-xs text-red-500">
              {{ getFieldError(fieldErrors, 'cv') }}
            </p>
          </div>
        </el-form-item>

        <div class="grid grid-cols-2 gap-4">
          <el-form-item label="Interview Date">
            <el-date-picker
              v-model="form.interview_date"
              type="date"
              placeholder="Select date (optional)"
              value-format="YYYY-MM-DD"
              class="w-full!"
            />
            <p v-if="getFieldError(fieldErrors, 'interview_date')" class="mt-1 text-xs text-red-500">
              {{ getFieldError(fieldErrors, 'interview_date') }}
            </p>
          </el-form-item>

          <el-form-item label="Interviewer">
            <EmployeeSearchSelect
              v-model="form.interviewer_id"
              :initial-option="interviewer"
              placeholder="Search employee (optional)"
            />
            <p v-if="getFieldError(fieldErrors, 'interviewer_id')" class="mt-1 text-xs text-red-500">
              {{ getFieldError(fieldErrors, 'interviewer_id') }}
            </p>
          </el-form-item>
        </div>

        <el-form-item label="Notes">
          <BaseInput v-model="form.notes" type="textarea" :rows="3" placeholder="Additional notes (optional)" />
          <p v-if="getFieldError(fieldErrors, 'notes')" class="mt-1 text-xs text-red-500">
            {{ getFieldError(fieldErrors, 'notes') }}
          </p>
        </el-form-item>
      </el-form>

      <div v-if="isHired" class="flex justify-end pt-5 border-t border-gray-100">
        <BaseButton @click="handleCancel">Back</BaseButton>
      </div>
      <FormActions
        v-else
        :loading="submitting"
        :submit-text="isEdit ? 'Save Changes' : 'Add Candidate'"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </AppCard>
  </div>
</template>
