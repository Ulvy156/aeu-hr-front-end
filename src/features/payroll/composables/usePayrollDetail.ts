import { ref } from 'vue'
import { useNotify } from '@/composables/useNotify'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import {
  fetchPayroll,
  updatePayroll,
  submitPayroll,
  approvePayroll,
  rejectPayroll,
} from '../services/payroll.api'
import type { PayrollBatch, UpdatePayrollPayload, RejectPayrollPayload } from '../types/payroll'

export function usePayrollDetail() {
  const notify = useNotify()
  const payroll = ref<PayrollBatch | null>(null)
  const loading = ref(false)
  const actionLoading = ref(false)
  const saveLoading = ref(false)

  async function loadPayroll(id: number) {
    loading.value = true
    try {
      const res = await fetchPayroll(id)
      payroll.value = res.data
    } catch (err) {
      notify.error(getApiErrorMessage(err))
    } finally {
      loading.value = false
    }
  }

  async function handleSave(id: number, payload: UpdatePayrollPayload): Promise<boolean> {
    saveLoading.value = true
    try {
      const res = await updatePayroll(id, payload)
      payroll.value = res.data
      notify.success('Payroll updated successfully.')
      return true
    } catch (err) {
      notify.error(getApiErrorMessage(err))
      return false
    } finally {
      saveLoading.value = false
    }
  }

  async function handleSubmit(id: number): Promise<boolean> {
    actionLoading.value = true
    try {
      const res = await submitPayroll(id)
      payroll.value = res.data
      notify.success('Payroll submitted for CEO approval.')
      return true
    } catch (err) {
      notify.error(getApiErrorMessage(err))
      return false
    } finally {
      actionLoading.value = false
    }
  }

  async function handleApprove(id: number): Promise<boolean> {
    actionLoading.value = true
    try {
      const res = await approvePayroll(id)
      payroll.value = res.data
      notify.success('Payroll approved successfully.')
      return true
    } catch (err) {
      notify.error(getApiErrorMessage(err))
      return false
    } finally {
      actionLoading.value = false
    }
  }

  async function handleReject(id: number, payload: RejectPayrollPayload): Promise<boolean> {
    actionLoading.value = true
    try {
      const res = await rejectPayroll(id, payload)
      payroll.value = res.data
      notify.success('Payroll rejected.')
      return true
    } catch (err) {
      notify.error(getApiErrorMessage(err))
      return false
    } finally {
      actionLoading.value = false
    }
  }

  return {
    payroll,
    loading,
    actionLoading,
    saveLoading,
    loadPayroll,
    handleSave,
    handleSubmit,
    handleApprove,
    handleReject,
  }
}
