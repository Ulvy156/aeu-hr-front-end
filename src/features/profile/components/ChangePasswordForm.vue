<script setup lang="ts">
import { useChangePassword } from '../composables/useChangePassword'
import { BaseInput, PasswordStrengthMeter } from '@/components/common'
import BaseButton from '@/components/common/BaseButton.vue'

const { formRef, loading, form, apiErrors, rules, handleSubmit } = useChangePassword()
</script>

<template>
  <el-form
    @submit.prevent="handleSubmit"
    ref="formRef"
    :model="form"
    :rules="rules"
    label-position="top"
    class="w-full"
  >
    <el-form-item label="Current Password" prop="current_password">
      <BaseInput
        v-model="form.current_password"
        type="password"
        placeholder="Enter your current password"
        show-password
        :disabled="loading"
        autocomplete="current-password"
        @input="apiErrors.current_password = ''"
      />
      <p v-if="apiErrors.current_password" class="mt-1 text-xs text-red-600">
        {{ apiErrors.current_password }}
      </p>
    </el-form-item>

    <el-form-item label="New Password" prop="password">
      <BaseInput
        v-model="form.password"
        type="password"
        placeholder="Enter your new password"
        show-password
        :disabled="loading"
        autocomplete="new-password"
        @input="apiErrors.password = ''"
      />
      <p v-if="apiErrors.password" class="mt-1 text-xs text-red-600">
        {{ apiErrors.password }}
      </p>
      <PasswordStrengthMeter :password="form.password" />
    </el-form-item>

    <el-form-item label="Confirm New Password" prop="password_confirmation">
      <BaseInput
        v-model="form.password_confirmation"
        type="password"
        placeholder="Re-enter your new password"
        show-password
        :disabled="loading"
        autocomplete="new-password"
      />
    </el-form-item>

    <BaseButton
      type="primary"
      class="!border-emerald-600 !bg-emerald-600 hover:!bg-emerald-700"
      :loading="loading"
      native-type="submit"
    >
      {{ loading ? 'Changing password...' : 'Change password' }}
    </BaseButton>
  </el-form>
</template>
