<script setup lang="ts">
import { ref } from 'vue'
import { Search } from '@lucide/vue'
import { BaseInput } from '@/components/common'
import BaseButton from '@/components/common/BaseButton.vue';

const props = defineProps<{
  search: string
  status: string
}>()

const emit = defineEmits<{
  apply: [search: string, status: string]
}>()

const localSearch = ref(props.search)
const localStatus = ref(props.status)

function handleSearch() {
  emit('apply', localSearch.value, localStatus.value ?? '')
}

function handleReset() {
  localSearch.value = ''
  localStatus.value = ''
  emit('apply', '', '')
}
</script>

<template>
  <div class="flex justify-between items-center gap-3 w-full ">
    <!-- input -->
    <div class="flex gap-x-2 w-1/2">
      <BaseInput
        v-model="localSearch"
        placeholder="Search by name, email, department, position..."
        clearable
        class=" w-full"
        @keyup.enter="handleSearch"
        @clear="handleSearch"
      >
        <template #prefix>
          <Search class="w-4 h-4 text-slate-400" />
        </template>
      </BaseInput>
  
      <el-select
        v-model="localStatus"
        placeholder="All Status"
        class="w-full"
        clearable
      >
        <el-option label="Active" value="active" />
        <el-option label="Inactive" value="inactive" />
      </el-select>
    </div>
    <!-- buttons -->
    <div class="w-1/2 flex justify-end">
      <BaseButton type="primary" @click="handleSearch">Search</BaseButton>
      <BaseButton @click="handleReset">Reset</BaseButton>
    </div>
  </div>
</template>
