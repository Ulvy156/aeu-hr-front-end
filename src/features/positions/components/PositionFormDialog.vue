<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { createPosition, updatePosition } from '../services/position.api'
import { BaseInput } from '@/components/common'
import type { Position, PositionPayload, DepartmentOption } from '../types/position'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
const props = defineProps<{
  visible: boolean
  position: Position | null
  departments: DepartmentOption[]
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  saved: []
}>()

const formRef = ref<FormInstance>()
const submitting = ref(false)
const isEdit = computed(() => props.position !== null)

const form = reactive<PositionPayload>({
  name: '',
  department_id: null,
  status: 'active',
})

const rules: FormRules = {
  name: [{ required: true, message: 'Position name is required', trigger: 'blur' }],
  status: [{ required: true, message: 'Status is required', trigger: 'change' }],
}

watch(
  () => props.position,
  (pos) => {
    if (pos) {
      form.name = pos.name
      form.department_id = pos.department?.id ?? null
      form.status = pos.status
    } else {
      form.name = ''
      form.department_id = null
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
    if (isEdit.value && props.position) {
      await updatePosition(props.position.id, { ...form })
      ElMessage.success('Position updated successfully.')
    } else {
      await createPosition({ ...form })
      ElMessage.success('Position created successfully.')
    }
    emit('update:visible', false)
    emit('saved')
  } catch (err: unknown) {
    const msg = (err as any)?.response?.data?.message ?? 'Failed to save position.'
    ElMessage.error(msg)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <BaseModal
    :model-value="visible"
    :title="isEdit ? 'Edit Position' : 'Create Position'"
    width="440px"
    :close-on-click-modal="false"
    @update:model-value="emit('update:visible', $event)"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
      <el-form-item label="Position Name" prop="name">
        <BaseInput v-model="form.name" placeholder="e.g. Accountant, HR Officer..." />
      </el-form-item>

      <el-form-item label="Department">
        <el-select
          v-model="form.department_id"
          placeholder="No department"
          class="w-full"
          clearable
        >
          <el-option
            v-for="dept in departments"
            :key="dept.id"
            :label="dept.name"
            :value="dept.id"
          />
        </el-select>
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
          {{ isEdit ? 'Save Changes' : 'Create Position' }}
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
