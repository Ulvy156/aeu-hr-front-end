<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { PageHeader } from '@/components/common'
import { usePermission } from '@/composables/usePermissions'
import { getCompanySettings, updateCompanySettings } from '../services/companySetting.service'
import type { CompanySettingForm } from '../types/companySetting.types'
import CompanySettingsForm from '../components/CompanySettingsForm.vue'
import BaseButton from '@/components/common/BaseButton.vue'
const { can } = usePermission()
const canUpdate = computed(() => can('company_settings.update'))

const loading = ref(true)
const submitting = ref(false)
const logoUrl = ref<string | null>(null)
const logoFile = ref<File | null>(null)
const formRef = ref<InstanceType<typeof CompanySettingsForm>>()
const formKey = ref(0)

const form = reactive<CompanySettingForm>({
  company_name: '',
  company_address: '',
  company_phone: '',
  company_email: '',
  office_latitude: '',
  office_longitude: '',
  allowed_radius_meters: 100,
  working_start_time: '08:00',
  working_end_time: '17:00',
  working_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
  salary_currency: 'USD',
  payroll_day_rate: 26,
})

const savedForm = ref<CompanySettingForm | null>(null)

const isDirty = computed(() => {
  if (!savedForm.value || loading.value) return false
  return JSON.stringify(form) !== JSON.stringify(savedForm.value) || logoFile.value !== null
})

async function loadSettings() {
  loading.value = true
  try {
    const res = await getCompanySettings()
    const s = res.data
    logoUrl.value = s.company_logo_url
    const loaded: CompanySettingForm = {
      company_name: s.company_name ?? '',
      company_address: s.company_address ?? '',
      company_phone: s.company_phone ?? '',
      company_email: s.company_email ?? '',
      office_latitude: s.office_latitude != null ? String(s.office_latitude) : '',
      office_longitude: s.office_longitude != null ? String(s.office_longitude) : '',
      allowed_radius_meters: s.allowed_radius_meters ?? 100,
      working_start_time: s.working_start_time?.slice(0, 5) ?? '08:00',
      working_end_time: s.working_end_time?.slice(0, 5) ?? '17:00',
      working_days: s.working_days ?? [],
      salary_currency: s.salary_currency ?? 'USD',
      payroll_day_rate: s.payroll_day_rate ?? 26,
    }
    Object.assign(form, loaded)
    savedForm.value = JSON.parse(JSON.stringify(loaded))
  } catch {
    ElMessage.error('Failed to load company settings.')
  } finally {
    loading.value = false
  }
}

function handleReset() {
  if (!savedForm.value) return
  Object.assign(form, JSON.parse(JSON.stringify(savedForm.value)))
  logoFile.value = null
  formKey.value++
}

async function handleSave() {
  const valid = await formRef.value?.formRef?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    const res = await updateCompanySettings(form, logoFile.value)
    logoUrl.value = res.data.company_logo_url
    logoFile.value = null
    savedForm.value = JSON.parse(JSON.stringify(form))
    ElMessage.success('Company settings saved successfully.')
  } catch (err: unknown) {
    const msg =
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
      'Failed to save settings. Please try again.'
    ElMessage.error(msg)
  } finally {
    submitting.value = false
  }
}

onMounted(loadSettings)
</script>

<template>
  <div>
    <div :class="['max-w-6xl mx-auto', isDirty && !loading && canUpdate ? 'pb-24' : '']">
      <PageHeader
        title="Company Settings"
        subtitle="Manage company profile, attendance GPS, working hours, and payroll defaults."
      >
        <template v-if="canUpdate && !loading" #action>
          <div class="flex items-center gap-3">
            <span v-if="isDirty" class="text-sm text-amber-600 font-medium">Unsaved changes</span>
            <BaseButton v-if="isDirty" :disabled="submitting" @click="handleReset">
              Reset Changes
            </BaseButton>
            <BaseButton
              type="primary"
              :loading="submitting"
              :disabled="!isDirty || submitting"
              class="!bg-emerald-600 !border-emerald-600 hover:!bg-emerald-700 hover:!border-emerald-700"
              @click="handleSave"
            >
              Save Settings
            </BaseButton>
          </div>
        </template>
      </PageHeader>

      <!-- Loading skeleton -->
      <div v-if="loading" class="space-y-6">
        <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <el-skeleton :rows="5" animated />
        </div>
        <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <el-skeleton :rows="3" animated />
        </div>
        <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <el-skeleton :rows="3" animated />
        </div>
      </div>

      <!-- Settings form -->
      <CompanySettingsForm
        v-else
        :key="formKey"
        ref="formRef"
        :form="form"
        :logo-url="logoUrl"
        :readonly="!canUpdate"
        @logo-changed="logoFile = $event"
        @update:form="Object.assign(form, $event)"
      />
    </div>

    <!-- Sticky bottom action bar -->
    <Transition name="slide-up">
      <div
        v-if="isDirty && !loading && canUpdate"
        class="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 shadow-lg"
      >
        <div class="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <span class="text-sm text-amber-600 font-medium">You have unsaved changes</span>
          <div class="flex items-center gap-3">
            <BaseButton :disabled="submitting" @click="handleReset">Reset Changes</BaseButton>
            <BaseButton
              type="primary"
              :loading="submitting"
              :disabled="submitting"
              class="!bg-emerald-600 !border-emerald-600 hover:!bg-emerald-700 hover:!border-emerald-700"
              @click="handleSave"
            >
              Save Settings
            </BaseButton>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
