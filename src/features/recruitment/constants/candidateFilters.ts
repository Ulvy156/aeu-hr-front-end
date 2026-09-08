import type { CandidateSource, CandidateStatus } from '../types/candidate'

export const CANDIDATE_SOURCE_OPTIONS: { label: string; value: CandidateSource }[] = [
  { label: 'Facebook', value: 'facebook' },
  { label: 'Telegram', value: 'telegram' },
  { label: 'LinkedIn', value: 'linkedin' },
  { label: 'Referral', value: 'referral' },
  { label: 'Walk-in', value: 'walk_in' },
  { label: 'Email', value: 'email' },
  { label: 'Other', value: 'other' },
]

export const PIPELINE_STATUS_FILTERS: { label: string; value: CandidateStatus | '' }[] = [
  { label: 'All', value: '' },
  { label: 'New', value: 'new' },
  { label: 'Shortlisted', value: 'shortlisted' },
  { label: 'Contacting', value: 'contacting_candidate' },
  { label: 'Interview', value: 'interview' },
  { label: 'Offer sent', value: 'offer_extended' },
  { label: 'Offer accepted', value: 'offer_accepted' },
  { label: 'Hired', value: 'hired' },
]

export const CLOSED_STATUS_FILTERS: { label: string; value: CandidateStatus }[] = [
  { label: 'Rejected', value: 'company_rejected' },
  { label: 'Declined', value: 'candidate_declined' },
  { label: 'No show', value: 'no_show' },
]

export const CANDIDATE_STATUS_FILTER_LABELS: Record<string, string> = {
  new: 'New',
  shortlisted: 'Shortlisted',
  contacting_candidate: 'Contacting',
  interview: 'Interview',
  offer_extended: 'Offer sent',
  offer_accepted: 'Offer accepted',
  hired: 'Hired',
  company_rejected: 'Rejected',
  candidate_declined: 'Declined',
  no_show: 'No show',
}

export const CANDIDATE_SOURCE_LABELS: Record<string, string> = Object.fromEntries(
  CANDIDATE_SOURCE_OPTIONS.map((opt) => [opt.value, opt.label]),
)
