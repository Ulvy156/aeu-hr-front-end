<script setup lang="ts">
import LoginForm from './LoginForm.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col lg:flex-row">

    <!-- Left: branding panel (45%) -->
    <div class="hidden lg:flex lg:w-[45%] bg-emerald-600 flex-col justify-center p-10 text-white">
      <div class="w-full max-w-sm mx-auto">

        <div class="flex items-center gap-2.5 mb-10">
          <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" fill="none" class="w-4 h-4 text-white">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
          </div>
          <span class="text-lg font-semibold tracking-tight">HR System</span>
        </div>

        <h1 class="text-3xl font-bold leading-snug mb-3">
          Manage your workforce<br />with ease.
        </h1>
        <p class="text-emerald-100 text-sm leading-relaxed mb-10">
          A complete HR platform for attendance, leave, payroll, and employee management — all in one place.
        </p>

        <div class="grid grid-cols-2 gap-3">
          <div class="bg-white/10 rounded-lg p-3">
            <p class="text-sm font-semibold">Attendance</p>
            <p class="text-xs text-emerald-100 mt-0.5">GPS clock-in &amp; out</p>
          </div>
          <div class="bg-white/10 rounded-lg p-3">
            <p class="text-sm font-semibold">Payroll</p>
            <p class="text-xs text-emerald-100 mt-0.5">Auto calculation</p>
          </div>
          <div class="bg-white/10 rounded-lg p-3">
            <p class="text-sm font-semibold">Leave</p>
            <p class="text-xs text-emerald-100 mt-0.5">Approval workflow</p>
          </div>
          <div class="bg-white/10 rounded-lg p-3">
            <p class="text-sm font-semibold">Reports</p>
            <p class="text-xs text-emerald-100 mt-0.5">Excel &amp; PDF export</p>
          </div>
        </div>

      </div>
    </div>

    <!-- Right: login form (55%) -->
    <div class="w-full lg:w-[55%] flex items-center justify-center bg-gray-50 px-6 py-12">
      <div class="w-full max-w-105">

        <!-- Mobile logo -->
        <div class="flex items-center gap-2 mb-8 lg:hidden">
          <div class="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" class="w-4 h-4 text-white">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2" />
            </svg>
          </div>
          <span class="text-lg font-semibold text-slate-900">HR System</span>
        </div>

        <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-7">
          <h2 class="text-xl font-semibold text-slate-900 mb-1">Welcome back</h2>
          <p class="text-sm text-slate-500 mb-6">Sign in to your account to continue.</p>
          <LoginForm />
        </div>

        <p class="mt-5 text-center text-xs text-slate-400">
          HR Management System &mdash; Internal use only.
        </p>

      </div>
    </div>

  </div>
</template>
