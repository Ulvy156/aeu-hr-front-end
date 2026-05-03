<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { createDepartment, updateDepartment } from '../services/department.api'
import type { Department, DepartmentPayload } from '../types/department'
import { BaseInput } from '@/components/common'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
const props = defineProps<{
  visible: boolean
  department: Department | null
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  saved: []
}>()

const formRef = ref<FormInstance>()
const submitting = ref(false)
const isEdit = computed(() => props.department !== null)

const form = reactive<DepartmentPayload>({
  name: '',
  status: 'active',
})

const rules: FormRules = {
  name: [{ required: true, message: 'Department name is required', trigger: 'blur' }],
  status: [{ required: true, message: 'Status is required', trigger: 'change' }],
}

watch(
  () => props.department,
  (dept) => {
    if (dept) {
      form.name = dept.name
      form.status = dept.status
    } else {
      form.name = ''
      form.status = 'active'
    }
  },
)

watch(
  () => props.visible,
  (v) => {
    if (!v) formRef.value?.clearValidate()
  },
)

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    if (isEdit.value && props.department) {
      await updateDepartment(props.department.id, { ...form })
      ElMessage.success('Department updated successfully.')
    } else {
      await createDepartment({ ...form })
      ElMessage.success('Department created successfully.')
    }
    emit('update:visible', false)
    emit('saved')
  } catch (err: unknown) {
    const msg = (err as any)?.response?.data?.message ?? 'Failed to save department.'
    ElMessage.error(msg)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <BaseModal
    :model-value="visible"
    :title="isEdit ? 'Edit Department' : 'Create Department'"
    width="440px"
    :close-on-click-modal="false"
    @update:model-value="emit('update:visible', $event)"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
      <el-form-item label="Department Name" prop="name">
        <BaseInput v-model="form.name" placeholder="e.g. Finance, Operations..." />
      </el-form-item>

      <el-form-item label="Status" prop="status">
        <el-select v-model="form.status" class="w-full">
          <el-option label="Active" value="active" />
          <el-option label="Inactive" value="inactive" />
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="flex justify-end gap-2">
        <BaseButton @click="emit('update:visible', false)">Cancel</BaseButton>
        <BaseButton type="primary" :loading="submitting" @click="handleSubmit">
          {{ isEdit ? 'Save Changes' : 'Create Department' }}
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
