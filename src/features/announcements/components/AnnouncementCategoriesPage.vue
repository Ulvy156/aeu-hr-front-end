<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessageBox } from 'element-plus'
import { useNotify } from '@/composables/useNotify'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { Plus } from '@lucide/vue'
import { PageHeader, AppCard } from '@/components/common'
import { usePermission } from '@/composables/usePermissions'
import { useAnnouncementCategories } from '../composables/useAnnouncementCategories'
import { deactivateAnnouncementCategory } from '../services/announcement-category.api'
import type { AnnouncementCategory } from '../types/announcement-category'
import AnnouncementCategoryFilters from './AnnouncementCategoryFilters.vue'
import AnnouncementCategoryTable from './AnnouncementCategoryTable.vue'
import AnnouncementCategoryFormDialog from './AnnouncementCategoryFormDialog.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const { can } = usePermission()
const notify = useNotify()
const {
  categories,
  meta,
  loading,
  filters,
  loadCategories,
  applyFilters,
  onPageChange,
  onPageSizeChange,
} = useAnnouncementCategories()

const formOpen = ref(false)
const selectedCategory = ref<AnnouncementCategory | null>(null)

onMounted(loadCategories)

function handleCreate() {
  selectedCategory.value = null
  formOpen.value = true
}

function handleEdit(category: AnnouncementCategory) {
  selectedCategory.value = category
  formOpen.value = true
}

async function handleDeactivate(category: AnnouncementCategory) {
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to disable "${category.name}"? It will no longer be available for new announcements, but the record will be kept.`,
      'Disable Announcement Category',
      {
        confirmButtonText: 'Disable',
        cancelButtonText: 'Cancel',
        type: 'warning',
        confirmButtonClass: 'el-button--danger',
      },
    )
  } catch {
    return
  }

  try {
    await deactivateAnnouncementCategory(category.id)
    notify.success('Announcement category disabled successfully.')
    await loadCategories()
  } catch (err) {
    notify.error(getApiErrorMessage(err))
  }
}
</script>

<template>
  <div>
    <PageHeader
      title="Announcement Categories"
      subtitle="Manage categories used to organize announcements."
    >
      <template #action>
        <BaseButton
          v-if="can('announcement_categories.create')"
          type="primary"
          @click="handleCreate"
        >
          <Plus class="w-4 h-4 mr-1.5" />
          Add Category
        </BaseButton>
      </template>
    </PageHeader>

    <AppCard no-padding>
      <div class="px-5 py-4 border-b border-gray-100">
        <AnnouncementCategoryFilters
          :search="filters.search"
          :status="filters.status"
          @apply="applyFilters"
        />
      </div>

      <AnnouncementCategoryTable
        :categories="categories"
        :loading="loading"
        :current-page="meta.current_page"
        :page-size="meta.per_page"
        :total="meta.total"
        @edit="handleEdit"
        @deactivate="handleDeactivate"
        @page-change="onPageChange"
        @size-change="onPageSizeChange"
      />
    </AppCard>

    <AnnouncementCategoryFormDialog
      v-model:visible="formOpen"
      :category="selectedCategory"
      @saved="loadCategories"
    />
  </div>
</template>
