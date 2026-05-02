<script setup lang="ts">
import { useAuthStore } from '@/features/auth/stores/auth.store'

const auth = useAuthStore()

const placeholderCards = [
  { label: 'Total Employees' },
  { label: 'Present Today' },
  { label: 'Pending Leaves' },
  { label: 'Payroll This Month' },
]
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-semibold text-slate-900">Dashboard</h1>
      <p class="mt-1 text-sm text-slate-500">
        Welcome back, <span class="font-medium text-slate-700">{{ auth.user?.name }}</span>.
      </p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <div
        v-for="card in placeholderCards"
        :key="card.label"
        class="bg-white border border-gray-200 rounded-xl shadow-sm p-5"
      >
        <p class="text-xs font-medium text-slate-500 uppercase tracking-wide">{{ card.label }}</p>
        <p class="mt-2 text-2xl font-bold text-slate-900">—</p>
        <p class="mt-1 text-xs text-slate-400">Loading soon</p>
      </div>
    </div>
  </div>
</template>
