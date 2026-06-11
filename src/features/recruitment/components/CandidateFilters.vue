<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Search } from '@lucide/vue'
import { BaseInput } from '@/components/common'
import SearchButton from '@/components/resuable/SearchButton.vue'
import ResetButton from '@/components/resuable/ResetButton.vue'
import { fetchVacancies } from '../services/vacancy.api'
import type { CandidateSource, CandidateStatus } from '../types/candidate'

const props = defineProps<{
  search: string
  vacancy: number | null
  source: CandidateSource | ''
  status: CandidateStatus | ''
  interviewDate: string
}>()

const emit = defineEmits<{
  apply: [
    search: string,
    vacancy: number | null,
    source: CandidateSource | '',
    status: CandidateStatus | '',
    interviewDate: string,
  ]
}>()

const localSearch = ref(props.search)
const localVacancy = ref<number | null>(props.vacancy)
const localSource = ref<CandidateSource | ''>(props.source)
const localStatus = ref<CandidateStatus | ''>(props.status)
const localInterviewDate = ref(props.interviewDate)

const vacancyOptions = ref<{ id: number; title: string }[]>([])

onMounted(async () => {
  const res = await fetchVacancies({ per_page: 100 })
  vacancyOptions.value = res.data.map((v) => ({ id: v.id, title: v.title }))
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

const statusOptions: { label: string; value: CandidateStatus }[] = [
  { label: 'New', value: 'new' },
  { label: 'Shortlisted', value: 'shortlisted' },
  { label: 'Contacting Candidate', value: 'contacting_candidate' },
  { label: 'Interview', value: 'interview' },
  { label: 'Offer Extended', value: 'offer_extended' },
  { label: 'Offer Accepted', value: 'offer_accepted' },
  { label: 'Hired', value: 'hired' },
  { label: 'Company Rejected', value: 'company_rejected' },
  { label: 'Candidate Declined', value: 'candidate_declined' },
  { label: 'No Show', value: 'no_show' },
]

function handleSearch() {
  emit(
    'apply',
    localSearch.value,
    localVacancy.value,
    localSource.value,
    localStatus.value,
    localInterviewDate.value,
  )
}

function handleReset() {
  localSearch.value = ''
  localVacancy.value = null
  localSource.value = ''
  localStatus.value = ''
  localInterviewDate.value = ''
  emit('apply', '', null, '', '', '')
}
</script>

<template>
  <div class="flex flex-wrap justify-between items-center gap-3">
    <div class="flex flex-wrap gap-3 flex-1">
      <BaseInput
        v-model="localSearch"
        placeholder="Search by name, phone, email..."
        clearable
        class="w-56"
        @keyup.enter="handleSearch"
        @clear="handleSearch"
      >
        <template #prefix>
          <Search class="w-4 h-4 text-slate-400" />
        </template>
      </BaseInput>

      <el-select v-model="localVacancy" placeholder="All Vacancies" clearable filterable class="w-48">
        <el-option v-for="opt in vacancyOptions" :key="opt.id" :label="opt.title" :value="opt.id" />
      </el-select>

      <el-select v-model="localSource" placeholder="All Sources" clearable class="w-40">
        <el-option v-for="opt in sourceOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
      </el-select>

      <el-select v-model="localStatus" placeholder="All Status" clearable class="w-48">
        <el-option v-for="opt in statusOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
      </el-select>

      <el-date-picker
        v-model="localInterviewDate"
        type="date"
        placeholder="Interview Date"
        value-format="YYYY-MM-DD"
        class="w-48!"
      />
    </div>

    <div class="flex justify-end">
      <SearchButton @click="handleSearch" />
      <ResetButton @click="handleReset" />
    </div>
  </div>
</template>
