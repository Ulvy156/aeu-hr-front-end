<script setup lang="ts">
import { ref, reactive, watch, computed, nextTick } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { Building2, MapPin, Clock, Banknote, ExternalLink } from '@lucide/vue'
import { AppCard } from '@/components/common'
import CompanyLogoUpload from './CompanyLogoUpload.vue'
import { WEEK_DAYS } from '../types/companySetting.types'
import type { CompanySettingForm, WeekDay } from '../types/companySetting.types'
import BaseInput from '@/components/common/BaseInput.vue'

const props = defineProps<{
  form: CompanySettingForm
  logoUrl: string | null
  readonly: boolean
}>()

const emit = defineEmits<{
  'logo-changed': [file: File | null]
  'update:form': [value: CompanySettingForm]
}>()

const formRef = ref<FormInstance>()

defineExpose({ formRef })

const localForm = reactive<CompanySettingForm>({ ...props.form })

watch(
  () => props.form,
  (value) => { Object.assign(localForm, value) },
  { deep: true },
)

watch(
  localForm,
  (value) => { emit('update:form', { ...value }) },
  { deep: true },
)

const hasCoordinates = computed(
  () => !!localForm.office_latitude && !!localForm.office_longitude,
)

function toggleDay(day: WeekDay) {
  const idx = localForm.working_days.indexOf(day)
  if (idx >= 0) localForm.working_days.splice(idx, 1)
  else localForm.working_days.push(day)
  nextTick(() => formRef.value?.validateField('working_days'))
}

const rules: FormRules = {
  allowed_radius_meters: [
    {
      validator: (_rule, value, callback) => {
        const n = Number(value)
        if (!n || n < 1 || n > 100000) callback(new Error('Radius must be between 1 and 100,000 meters'))
        else callback()
      },
      trigger: 'blur',
    },
  ],
  office_latitude: [
    {
      validator: (_rule, value, callback) => {
        if (!value) return callback()
        const n = parseFloat(value)
        if (isNaN(n) || n < -90 || n > 90) callback(new Error('Latitude must be between -90 and 90'))
        else callback()
      },
      trigger: 'blur',
    },
  ],
  office_longitude: [
    {
      validator: (_rule, value, callback) => {
        if (!value) return callback()
        const n = parseFloat(value)
        if (isNaN(n) || n < -180 || n > 180) callback(new Error('Longitude must be between -180 and 180'))
        else callback()
      },
      trigger: 'blur',
    },
  ],
  working_days: [
    { required: true, type: 'array', min: 1, message: 'Select at least one working day', trigger: 'change' },
  ],
  working_start_time: [
    { required: true, message: 'Working start time is required', trigger: 'change' },
  ],
  working_end_time: [
    { required: true, message: 'Working end time is required', trigger: 'change' },
  ],
  salary_currency: [
    { required: true, message: 'Please select a currency', trigger: 'change' },
  ],
  payroll_day_rate: [
    {
      validator: (_rule, value, callback) => {
        const n = Number(value)
        if (!n || n < 1 || n > 31) callback(new Error('Payroll day rate must be between 1 and 31'))
        else callback()
      },
      trigger: 'blur',
    },
  ],
}
</script>

<template>
  <el-form ref="formRef" :model="localForm" :rules="rules" label-position="top" class="space-y-6">

    <!-- Company Profile -->
    <AppCard>
      <template #header>
        <div class="flex items-center gap-2.5">
          <div class="p-1.5 bg-emerald-50 rounded-lg shrink-0">
            <Building2 class="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h2 class="text-base font-semibold text-slate-900">Company Profile</h2>
            <p class="text-sm text-slate-500 mt-0.5">Basic information and branding for your organization.</p>
          </div>
        </div>
      </template>

      <div class="space-y-4">
        <el-form-item label="Company Logo">
          <CompanyLogoUpload
            :current-logo-url="logoUrl"
            :company-name="localForm.company_name"
            :disabled="readonly"
            @file-selected="$emit('logo-changed', $event)"
          />
        </el-form-item>

        <el-form-item label="Company Name" prop="company_name">
          <BaseInput v-model="localForm.company_name" placeholder="Enter company name" :disabled="readonly" />
        </el-form-item>

        <el-form-item label="Company Address" prop="company_address">
          <BaseInput
            v-model="localForm.company_address"
            type="textarea"
            :rows="2"
            placeholder="Enter company address"
            :disabled="readonly"
          />
        </el-form-item>

        <div class="grid grid-cols-2 gap-4">
          <el-form-item label="Company Phone" prop="company_phone">
            <BaseInput v-model="localForm.company_phone" placeholder="+855 12 345 678" :disabled="readonly" />
          </el-form-item>
          <el-form-item label="Company Email" prop="company_email">
            <BaseInput v-model="localForm.company_email" placeholder="hr@company.com" :disabled="readonly" />
          </el-form-item>
        </div>
      </div>
    </AppCard>

    <!-- Office Location -->
    <AppCard>
      <template #header>
        <div class="flex items-center gap-2.5">
          <div class="p-1.5 bg-emerald-50 rounded-lg shrink-0">
            <MapPin class="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h2 class="text-base font-semibold text-slate-900">Office Location</h2>
            <p class="text-sm text-slate-500 mt-0.5">GPS coordinates used to validate employee attendance check-ins.</p>
          </div>
        </div>
      </template>

      <div class="space-y-4">
        <p class="text-xs text-slate-400">
          Attendance GPS settings affect employee clock-in validation.
        </p>

        <div class="grid grid-cols-2 gap-4">
          <el-form-item label="Office Latitude" prop="office_latitude">
            <BaseInput v-model="localForm.office_latitude" placeholder="e.g. 11.5564" :disabled="readonly" />
          </el-form-item>
          <el-form-item label="Office Longitude" prop="office_longitude">
            <BaseInput v-model="localForm.office_longitude" placeholder="e.g. 104.9282" :disabled="readonly" />
          </el-form-item>
        </div>

        <a
          v-if="hasCoordinates"
          :href="`https://www.google.com/maps?q=${localForm.office_latitude},${localForm.office_longitude}`"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          <ExternalLink class="w-3.5 h-3.5" />
          Open in Google Maps
        </a>

        <el-form-item label="Allowed Radius (meters)" prop="allowed_radius_meters">
          <BaseInput-number
            v-model="localForm.allowed_radius_meters"
            :min="1"
            :max="100000"
            controls-position="right"
            class="w-full!"
          />
          <p class="mt-1 text-xs text-slate-400">Employees must be within this radius to check in.</p>
        </el-form-item>
      </div>
    </AppCard>

    <!-- Working Schedule -->
    <AppCard>
      <template #header>
        <div class="flex items-center gap-2.5">
          <div class="p-1.5 bg-emerald-50 rounded-lg shrink-0">
            <Clock class="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h2 class="text-base font-semibold text-slate-900">Working Schedule</h2>
            <p class="text-sm text-slate-500 mt-0.5">Define default working hours and days for the company.</p>
          </div>
        </div>
      </template>

      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <el-form-item label="Start Time" prop="working_start_time">
            <el-time-picker
              v-model="localForm.working_start_time"
              format="HH:mm"
              value-format="HH:mm"
              placeholder="Select start time"
              :disabled="readonly"
              class="!w-full"
            />
          </el-form-item>
          <el-form-item label="End Time" prop="working_end_time">
            <el-time-picker
              v-model="localForm.working_end_time"
              format="HH:mm"
              value-format="HH:mm"
              placeholder="Select end time"
              :disabled="readonly"
              class="w-full!"
            />
          </el-form-item>
        </div>

        <el-form-item label="Working Days" prop="working_days">
          <div class="flex flex-wrap gap-2 pt-0.5">
            <button
              v-for="day in WEEK_DAYS"
              :key="day.value"
              type="button"
              :disabled="readonly"
              :class="[
                'px-3.5 py-1.5 rounded-lg border text-sm font-medium transition-colors',
                localForm.working_days.includes(day.value)
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : 'bg-white border-gray-300 text-slate-600 hover:border-emerald-400',
                readonly ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
              ]"
              @click="toggleDay(day.value)"
            >
              {{ day.label.slice(0, 3) }}
            </button>
          </div>
        </el-form-item>
      </div>
    </AppCard>

    <!-- Payroll Settings -->
    <AppCard>
      <template #header>
        <div class="flex items-center gap-2.5">
          <div class="p-1.5 bg-emerald-50 rounded-lg shrink-0">
            <Banknote class="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h2 class="text-base font-semibold text-slate-900">Payroll Settings</h2>
            <p class="text-sm text-slate-500 mt-0.5">Default currency and working-day basis used for payroll calculations.</p>
          </div>
        </div>
      </template>

      <div class="grid grid-cols-2 gap-4">
        <el-form-item label="Salary Currency" prop="salary_currency">
          <el-select v-model="localForm.salary_currency" :disabled="readonly" class="w-full!">
            <el-option value="USD" label="USD — US Dollar" />
            <el-option value="KHR" label="KHR — Cambodian Riel" />
          </el-select>
        </el-form-item>

        <el-form-item label="Payroll Day Rate" prop="payroll_day_rate">
          <BaseInput-number
            v-model="localForm.payroll_day_rate"
            :min="1"
            :max="31"
            controls-position="right"
            class="w-full!"
          />
          <p class="mt-1 text-xs text-slate-400">
            Payroll day rate affects daily salary calculation.
          </p>
        </el-form-item>
      </div>
    </AppCard>

  </el-form>
</template>
