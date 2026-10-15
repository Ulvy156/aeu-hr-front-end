import type { Leave } from '../types/leave'

export function canApproveLeave(
  leave: Leave | null,
  can: (permission: string) => boolean,
  isCeo: boolean,
): boolean {
  if (!leave || leave.status !== 'pending') return false
  // Match the backend's HR-first decision-stage selection.
  if (can('leaves.approve_hr') || can('leaves.reject_hr')) {
    return (
      (can('leaves.approve_hr') || can('leaves.approve')) && leave.hr_approval_status === 'pending'
    )
  }
  return (
    isCeo &&
    (can('leaves.approve_ceo') || can('leaves.approve')) &&
    leave.ceo_approval_status === 'pending'
  )
}
