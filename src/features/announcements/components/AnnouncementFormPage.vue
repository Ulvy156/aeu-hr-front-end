<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { FormInstance, FormRules, UploadFile } from 'element-plus'
import { Paperclip, X } from '@lucide/vue'
import { useNotify } from '@/composables/useNotify'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { parseApiError, getFieldError, type ApiValidationErrors } from '@/utils/api-error'
import { AppCard, BaseInput, BaseButton, BaseSelect, FormActions, PageHeader, RichTextEditor } from '@/components/common'
import { fetchAnnouncementCategories } from '../services/announcement-category.api'
import { fetchAnnouncement, createAnnouncement, updateAnnouncement } from '../services/announcement.api'
import AnnouncementTargetsEditor from './AnnouncementTargetsEditor.vue'
import type { AnnouncementAttachment, AnnouncementTarget } from '../types/announcement'

const route = useRoute()
const router = useRouter()
const notify = useNotify()

const announcementId = computed(() => {
  const id = route.params.id
  return id ? Number(id) : null
})
const isEdit = computed(() => announcementId.value !== null)

const formRef = ref<FormInstance>()
const loading = ref(false)
const submitting = ref(false)
const fieldErrors = ref<ApiValidationErrors>({})

const categoryOptions = ref<{ id: number; name: string }[]>([])
const categoryInactive = ref(false)

const existingAttachment = ref<AnnouncementAttachment | null>(null)
const removeAttachment = ref(false)
const attachmentFile = ref<File | null>(null)

const form = reactive({
  category_id: null as number | null,
  title: '',
  content: '',
  priority: 'normal' as 'normal' | 'important' | 'urgent',
})

const targets = ref<AnnouncementTarget[]>([{ target_type: 'all', target_id: null }])

const priorityOptions: { label: string; value: 'normal' | 'important' | 'urgent' }[] = [
  { label: 'Normal', value: 'normal' },
  { label: 'Important', value: 'important' },
  { label: 'Urgent', value: 'urgent' },
]

const rules: FormRules = {
  category_id: [{ required: true, message: 'Category is required', trigger: 'change' }],
  title: [
    { required: true, message: 'Title is required', trigger: 'blur' },
    { max: 255, message: 'Title must be at most 255 characters', trigger: 'blur' },
  ],
  content: [
    {
      validator: (_rule, value: string, callback) => {
        const isEmpty = !value || !value.replace(/<[^>]*>/g, '').trim()
        if (isEmpty) {
          callback(new Error('Content is required'))
          return
        }
        callback()
      },
      trigger: 'change',
    },
  ],
  priority: [{ required: true, message: 'Priority is required', trigger: 'change' }],
}

onMounted(async () => {
  loading.value = true
  try {
    const categoriesRes = await fetchAnnouncementCategories({ status: 'active', per_page: 100 })
    categoryOptions.value = categoriesRes.data.map((c) => ({ id: c.id, name: c.name }))

    if (isEdit.value && announcementId.value) {
      const res = await fetchAnnouncement(announcementId.value)
      const announcement = res.data
      form.category_id = announcement.category?.id ?? null
      form.title = announcement.title
      form.content = announcement.content
      form.priority = announcement.priority
      targets.value = announcement.targets.length
        ? announcement.targets.map((t) => ({ ...t }))
        : [{ target_type: 'all', target_id: null }]
      existingAttachment.value = announcement.attachment

      if (form.category_id && !categoryOptions.value.some((c) => c.id === form.category_id)) {
        categoryOptions.value = [...categoryOptions.value, { id: form.category_id, name: announcement.category.name }]
        categoryInactive.value = true
      }
    }
  } catch (err) {
    notify.error(getApiErrorMessage(err))
  } finally {
    loading.value = false
  }
})

function onFileChange(file: UploadFile) {
  if (!(file.raw instanceof File)) return

  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
  if (!allowedTypes.includes(file.raw.type)) {
    notify.error('Only PDF, JPG, JPEG, or PNG files are allowed.')
    return
  }
  if (file.raw.size > 2048 * 1024) {
    notify.error('Attachment size must not exceed 2048 KB.')
    return
  }

  attachmentFile.value = file.raw
  removeAttachment.value = false
}

function removeNewFile() {
  attachmentFile.value = null
}

function removeExistingAttachment() {
  removeAttachment.value = true
  existingAttachment.value = null
}

function handleCancel() {
  router.push({ name: 'announcements' })
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  fieldErrors.value = {}
  try {
    const payload = {
      category_id: form.category_id,
      title: form.title,
      content: form.content,
      priority: form.priority,
      attachment: attachmentFile.value,
      remove_attachment: removeAttachment.value,
      targets: targets.value,
    }

    if (isEdit.value && announcementId.value) {
      await updateAnnouncement(announcementId.value, payload)
      notify.success('Announcement updated successfully.')
    } else {
      await createAnnouncement(payload)
      notify.success('Announcement created successfully.')
    }
    router.push({ name: 'announcements' })
  } catch (err) {
    const parsed = parseApiError(err)
    fieldErrors.value = parsed.errors
    notify.error(parsed.message)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div>
    <PageHeader
      :title="isEdit ? 'Edit Announcement' : 'New Announcement'"
      subtitle="Announcements are created as drafts and must be submitted for approval before publishing."
    />

    <AppCard class="relative">
      <div
        v-if="loading"
        class="absolute inset-0 bg-white/70 flex items-center justify-center z-10 rounded-xl"
      >
        <div class="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>

      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="space-y-1">
        <el-form-item label="Category" prop="category_id">
          <BaseSelect
            v-model="form.category_id"
            :options="categoryOptions.map((opt) => ({ label: opt.name, value: opt.id }))"
            placeholder="Select category"
          />
          <p v-if="categoryInactive" class="mt-1 text-xs text-amber-600">
            This category is currently inactive. It is shown because it is the announcement's current category.
          </p>
          <p v-if="getFieldError(fieldErrors, 'category_id')" class="mt-1 text-xs text-red-500">
            {{ getFieldError(fieldErrors, 'category_id') }}
          </p>
        </el-form-item>

        <el-form-item label="Title" prop="title">
          <BaseInput v-model="form.title" placeholder="Announcement title" maxlength="255" show-word-limit />
          <p v-if="getFieldError(fieldErrors, 'title')" class="mt-1 text-xs text-red-500">
            {{ getFieldError(fieldErrors, 'title') }}
          </p>
        </el-form-item>

        <el-form-item label="Content" prop="content">
          <RichTextEditor v-model="form.content" placeholder="Announcement content" />
          <p v-if="getFieldError(fieldErrors, 'content')" class="mt-1 text-xs text-red-500">
            {{ getFieldError(fieldErrors, 'content') }}
          </p>
        </el-form-item>

        <el-form-item label="Priority" prop="priority">
          <BaseSelect v-model="form.priority" :options="priorityOptions" class="!w-[200px]" />
        </el-form-item>

        <el-form-item label="Attachment">
          <div class="space-y-2 w-full">
            <div
              v-if="existingAttachment"
              class="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2"
            >
              <a
                :href="existingAttachment.url"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700"
              >
                <Paperclip class="w-4 h-4" />
                {{ existingAttachment.name }}
              </a>
              <button
                type="button"
                class="text-xs text-red-500 hover:text-red-600 font-medium"
                @click="removeExistingAttachment"
              >
                Remove
              </button>
            </div>

            <div v-if="attachmentFile" class="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
              <span class="inline-flex items-center gap-2 text-sm text-slate-700">
                <Paperclip class="w-4 h-4" />
                {{ attachmentFile.name }}
              </span>
              <button type="button" class="text-slate-400 hover:text-red-500" @click="removeNewFile">
                <X class="w-4 h-4" />
              </button>
            </div>

            <el-upload
              v-if="!attachmentFile"
              :auto-upload="false"
              :show-file-list="false"
              :limit="1"
              accept=".pdf,.jpg,.jpeg,.png"
              :on-change="onFileChange"
            >
              <BaseButton size="small">{{ existingAttachment ? 'Replace File' : 'Select File' }}</BaseButton>
              <template #tip>
                <p class="text-xs text-slate-400 mt-1">PDF, JPG, JPEG or PNG — max 2048 KB</p>
              </template>
            </el-upload>

            <p v-if="getFieldError(fieldErrors, 'attachment')" class="text-xs text-red-500">
              {{ getFieldError(fieldErrors, 'attachment') }}
            </p>
          </div>
        </el-form-item>

        <el-form-item label="Audience">
          <AnnouncementTargetsEditor v-model="targets" :errors="fieldErrors" />
        </el-form-item>
      </el-form>

      <FormActions
        :loading="submitting"
        :submit-text="isEdit ? 'Save Changes' : 'Create Announcement'"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </AppCard>
  </div>
</template>
