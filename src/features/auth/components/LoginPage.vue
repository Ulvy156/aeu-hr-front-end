<script setup lang="ts">
import { ref } from 'vue'
import LoginForm from './LoginForm.vue'

const COMPANY_LOGO_SRC = '/PDM Logo.png'
const COMPANY_NAME = 'PPDM CARE'

const logoBroken = ref(false)
</script>

<template>
  <div
    class="login-page relative flex min-h-screen items-center justify-center px-6 py-12"
  >
    <div
      class="login-panel relative z-10 w-full max-w-[480px] rounded-xl border border-gray-200 bg-white p-6 sm:p-8"
      aria-label="Sign in"
    >
      <div class="login-brand mb-8 flex flex-col items-center text-center">
        <img
          v-if="!logoBroken"
          :src="COMPANY_LOGO_SRC"
          :alt="COMPANY_NAME"
          class="mb-4 h-14 w-14 rounded-xl object-contain p-1 ring-1 ring-emerald-900/5"
          @error="logoBroken = true"
        />
        <div
          v-else
          class="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-600"
          aria-hidden="true"
        />

        <h1 class="text-2xl font-semibold tracking-tight text-slate-900">
          {{ COMPANY_NAME }}
        </h1>
        <p class="mt-1.5 text-sm text-slate-500">Sign in to continue</p>
      </div>

      <div class="login-form-wrap">
        <LoginForm />
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  background: #fff;
}

.login-brand {
  animation: login-fade-up 420ms ease-out both;
}

.login-form-wrap {
  animation: login-fade-up 420ms ease-out 90ms both;
}

@keyframes login-fade-up {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .login-brand,
  .login-form-wrap {
    animation: none;
  }
}
</style>
