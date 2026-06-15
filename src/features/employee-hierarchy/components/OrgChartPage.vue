<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useNotify } from '@/composables/useNotify'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { PageHeader, EmptyState, LoadingState } from '@/components/common'
import { fetchEmployeeHierarchy } from '../services/employee-hierarchy.api'
import OrgChartNode from './OrgChartNode.vue'
import type { EmployeeHierarchyNode } from '../types/employee-hierarchy'

const notify = useNotify()
const roots = ref<EmployeeHierarchyNode[]>([])
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    const res = await fetchEmployeeHierarchy()
    roots.value = res.data
  } catch (err) {
    notify.error(getApiErrorMessage(err))
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      title="Org Chart"
      subtitle="Company reporting structure, based on each employee's manager."
    />

    <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
      <LoadingState :loading="loading" type="spinner">
        <EmptyState
          v-if="!roots.length"
          title="No org chart data"
          description="No reporting structure has been set up yet."
        />
        <div v-else class="overflow-x-auto pb-2">
          <div class="flex justify-center gap-16 min-w-fit px-6">
            <OrgChartNode v-for="root in roots" :key="root.id" :node="root" />
          </div>
        </div>
      </LoadingState>
    </div>
  </div>
</template>
