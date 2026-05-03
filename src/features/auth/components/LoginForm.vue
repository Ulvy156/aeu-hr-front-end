<script setup lang="ts">
import { useLogin } from '../composables/useLogin'
import { BaseInput } from '@/components/common'
import BaseButton from '@/components/common/BaseButton.vue';
const { formRef, loading, form, apiErrors, rules, handleSubmit } = useLogin()
</script>

<template>
  <el-form
    @submit.prevent="handleSubmit"
    ref="formRef"
    :model="form"
    :rules="rules"
    label-position="top"
  >
    <el-form-item label="Email" prop="email">
      <BaseInput
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
      <BaseInput
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

    <BaseButton
      type="primary"
      size="large"
      :loading="loading"
      native-type="submit"
      class="w-full mt-2"
    >
      {{ loading ? 'Signing in...' : 'Sign in' }}
    </BaseButton>
  </el-form>
</template>
