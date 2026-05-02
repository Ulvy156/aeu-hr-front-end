<script setup lang="ts">
import { useLogin } from '../composables/useLogin'

const { formRef, loading, form, apiErrors, rules, handleSubmit } = useLogin()
</script>

<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-position="top"
    @submit.prevent="handleSubmit"
  >
    <el-form-item label="Email" prop="email">
      <el-input
        v-model="form.email"
        type="email"
        placeholder="you@example.com"
        size="large"
        :disabled="loading"
        autocomplete="email"
        @input="apiErrors.email = ''"
      />
      <p v-if="apiErrors.email" class="mt-1 text-xs text-red-600">
        {{ apiErrors.email }}
      </p>
    </el-form-item>

    <el-form-item label="Password" prop="password">
      <el-input
        v-model="form.password"
        type="password"
        placeholder="Enter your password"
        size="large"
        show-password
        :disabled="loading"
        autocomplete="current-password"
        @input="apiErrors.password = ''"
        @keyup.enter="handleSubmit"
      />
      <p v-if="apiErrors.password" class="mt-1 text-xs text-red-600">
        {{ apiErrors.password }}
      </p>
    </el-form-item>

    <el-button
      type="primary"
      size="large"
      :loading="loading"
      native-type="submit"
      class="w-full mt-2"
      @click="handleSubmit"
    >
      {{ loading ? 'Signing in...' : 'Sign in' }}
    </el-button>
  </el-form>
</template>
