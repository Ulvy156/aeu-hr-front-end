<script setup lang="ts">
import { computed } from 'vue'
import type { Vacancy } from '../types/vacancy'
import VacancyHiringBar from './VacancyHiringBar.vue'
import { remainingHeadcount, relativeTargetLabel } from '../utils/vacancyDisplay'

const props = defineProps<{
  vacancies: Vacancy[]
}>()

const emit = defineEmits<{
  view: [vacancy: Vacancy]
}>()

const hiring = computed(() =>
  props.vacancies.filter((row) => row.status === 'open' && remainingHeadcount(row) > 0),
)
</script>

<template>
  <div v-if="hiring.length" class="border-t border-gray-100 p-5 lg:border-t-0 lg:border-l">
    <div class="mb-4 flex items-center justify-between gap-2">
      <h2 class="text-sm font-semibold text-slate-900">Still hiring</h2>
      <span class="text-xs text-slate-400">{{ hiring.length }} open</span>
    </div>

    <div class="space-y-4">
      <button
        v-for="row in hiring"
        :key="row.id"
        type="button"
        class="block w-full rounded-lg text-left transition-colors hover:bg-gray-50"
        @click="emit('view', row)"
      >
        <p class="truncate text-sm font-medium text-slate-900">{{ row.title }}</p>
        <p class="mt-0.5 text-xs text-slate-500">{{ row.department?.name ?? '—' }}</p>
        <div class="mt-2">
          <VacancyHiringBar
            :filled="row.filled_headcount"
            :required="row.required_headcount"
            :left-label="`${remainingHeadcount(row)} remaining`"
            :right-label="relativeTargetLabel(row)"
          />
        </div>
      </button>
    </div>
  </div>
</template>
