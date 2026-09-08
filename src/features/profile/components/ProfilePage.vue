<script setup lang="ts">
import { onMounted } from 'vue'
import { AppCard } from '@/components/common'
import { useProfile } from '../composables/useProfile'
import ChangePasswordForm from './ChangePasswordForm.vue'
import ProfileAccountCard from './ProfileAccountCard.vue'
import ProfileEmployeeCard from './ProfileEmployeeCard.vue'
import ProfileIdentityHero from './ProfileIdentityHero.vue'
import ProfileSummaryCards from './ProfileSummaryCards.vue'

const { profile, loading, fetchProfile } = useProfile()

onMounted(fetchProfile)
</script>

<template>
  <div class="space-y-6">
    <template v-if="loading">
      <div class="h-36 animate-pulse rounded-xl border border-gray-200 bg-white" />
      <ProfileSummaryCards loading />
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,1fr)]">
        <div class="h-80 animate-pulse rounded-xl border border-gray-200 bg-white" />
        <div class="space-y-4">
          <div class="h-48 animate-pulse rounded-xl border border-gray-200 bg-white" />
          <div class="h-64 animate-pulse rounded-xl border border-gray-200 bg-white" />
        </div>
      </div>
    </template>

    <template v-else-if="profile">
      <ProfileIdentityHero :profile="profile" />
      <ProfileSummaryCards :profile="profile" />

      <div class="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,1fr)]">
        <ProfileEmployeeCard :profile="profile" />

        <div class="space-y-4">
          <ProfileAccountCard :profile="profile" />

          <AppCard no-padding>
            <template #header>
              <h2 class="text-sm font-semibold text-slate-900">Security</h2>
            </template>
            <p class="mb-4 text-sm text-slate-500">
              Change your password. Other sessions will be signed out after a successful change.
            </p>
            <ChangePasswordForm />
          </AppCard>
        </div>
      </div>
    </template>
  </div>
</template>
