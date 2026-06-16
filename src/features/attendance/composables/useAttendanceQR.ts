import { ref } from 'vue'
import { ElMessageBox } from 'element-plus'
import type { QRToken } from '../types/attendance'
import {
  generateQRToken,
  fetchCurrentQRToken,
  downloadQRCode,
  deleteQRToken,
} from '../services/attendance.api'
import { useNotify } from '@/composables/useNotify'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useAttendanceQR() {
  const notify = useNotify()
  const token = ref<QRToken | null>(null)
  const loading = ref(false)
  const generating = ref(false)
  const deleting = ref(false)
  const downloading = ref(false)

  async function load() {
    loading.value = true
    try {
      const res = await fetchCurrentQRToken()
      token.value = res.data
    } catch (err) {
      notify.error(getApiErrorMessage(err))
    } finally {
      loading.value = false
    }
  }

  async function generate() {
    generating.value = true
    try {
      const res = await generateQRToken()
      token.value = res.data
      notify.success('QR code generated successfully.')
    } catch (err) {
      notify.error(getApiErrorMessage(err))
    } finally {
      generating.value = false
    }
  }

  async function download() {
    if (!token.value) return
    downloading.value = true
    try {
      const blob = await downloadQRCode(token.value.id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'attendance-qr.png'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      notify.error(getApiErrorMessage(err))
    } finally {
      downloading.value = false
    }
  }

  async function regenerate() {
    if (!token.value) return
    try {
      await ElMessageBox.confirm(
        'This will delete the current QR code and generate a new one. The old printed QR will no longer work.',
        'Regenerate QR Code',
        {
          confirmButtonText: 'Regenerate',
          cancelButtonText: 'Cancel',
          type: 'warning',
          confirmButtonClass: 'el-button--danger',
        },
      )
    } catch {
      return
    }
    deleting.value = true
    try {
      await deleteQRToken(token.value.id)
      token.value = null
    } catch (err) {
      notify.error(getApiErrorMessage(err))
      deleting.value = false
      return
    }
    deleting.value = false
    await generate()
  }

  return { token, loading, generating, deleting, downloading, load, generate, download, regenerate }
}
