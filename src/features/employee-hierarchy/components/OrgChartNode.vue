<script setup lang="ts">
import type { EmployeeHierarchyNode } from '../types/employee-hierarchy'

defineProps<{
  node: EmployeeHierarchyNode
}>()
</script>

<template>
  <div class="org-node">
    <el-card shadow="hover" class="org-card" :body-style="{ padding: '10px 14px' }">
      <div class="flex items-center gap-3">
        <el-avatar v-if="node.profile_photo_url" :src="node.profile_photo_url" :size="40" />
        <el-avatar v-else :size="40" class="!bg-emerald-100 !text-emerald-700 font-semibold">
          {{ node.full_name.charAt(0).toUpperCase() }}
        </el-avatar>
        <div class="min-w-0 text-left">
          <p class="text-sm font-semibold text-slate-900 whitespace-nowrap">{{ node.full_name }}</p>
          <p class="text-xs text-slate-500 whitespace-nowrap">{{ node.position?.name ?? '—' }}</p>
        </div>
      </div>
    </el-card>

    <div v-if="node.children.length" class="org-children">
      <div v-for="child in node.children" :key="child.id" class="org-child">
        <OrgChartNode :node="child" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.org-node {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.org-card {
  position: relative;
}

.org-children {
  display: flex;
  position: relative;
  padding-top: 24px;
}

.org-children::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  width: 1px;
  height: 24px;
  background-color: #d1d5db;
}

.org-child {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  padding: 0 16px;
}

.org-child::after {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  width: 1px;
  height: 24px;
  background-color: #d1d5db;
}

.org-child:not(:only-child)::before {
  content: '';
  position: absolute;
  top: 0;
  height: 1px;
  background-color: #d1d5db;
  left: 0;
  right: 0;
}

.org-child:first-child:not(:only-child)::before {
  left: 50%;
}

.org-child:last-child:not(:only-child)::before {
  right: 50%;
}
</style>
