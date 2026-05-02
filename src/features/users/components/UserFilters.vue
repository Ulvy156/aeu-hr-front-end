<script setup lang="ts">
import { ref } from 'vue'
import { Search } from '@lucide/vue'

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
  <div class="flex flex-wrap items-center gap-3">
    <el-input
      v-model="localSearch"
      placeholder="Search by name, email, department, position..."
      clearable
      class="flex-1 min-w-[200px]"
      @keyup.enter="handleSearch"
      @clear="handleSearch"
    >
      <template #prefix>
        <Search class="w-4 h-4 text-slate-400" />
      </template>
    </el-input>

    <el-select
      v-model="localStatus"
      placeholder="All Status"
      class="w-48"
      clearable
    >
      <el-option label="Active" value="active" />
      <el-option label="Inactive" value="inactive" />
    </el-select>

    <el-button type="primary" @click="handleSearch">Search</el-button>
    <el-button @click="handleReset">Reset</el-button>
  </div>
</template>
