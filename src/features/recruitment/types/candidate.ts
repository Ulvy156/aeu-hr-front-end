import type { VacancyStatus } from './vacancy'

export type CandidateSource =
  | 'facebook'
  | 'telegram'
  | 'linkedin'
  | 'referral'
  | 'walk_in'
  | 'email'
  | 'other'

export type CandidateStatus =
  | 'new'
  | 'shortlisted'
  | 'contacting_candidate'
  | 'interview'
  | 'offer_extended'
  | 'offer_accepted'
  | 'hired'
  | 'company_rejected'
  | 'candidate_declined'
  | 'no_show'

export interface CandidateVacancyRef {
  id: number
  title: string
  status: VacancyStatus
}

export interface CandidateUserRef {
  id: number
  name: string
}

export interface CandidateCv {
  name: string
  size: number
  url: string
}

export interface Candidate {
  id: number
  vacancy: CandidateVacancyRef
  full_name: string
  phone: string
  email: string | null
  source: CandidateSource
  cv: CandidateCv | null
  status: CandidateStatus
  interview_date: string | null
  interviewer: string | null
  notes: string | null
  outcome_reason: string | null
  creator: CandidateUserRef
  created_at: string
  updated_at: string
}

export interface CandidateListParams {
  search?: string
  vacancy?: number
  source?: CandidateSource
  status?: CandidateStatus
  interview_date?: string
  per_page?: number
  page?: number
}

export interface CandidateFormPayload {
  vacancy_id: number | null
  full_name: string
  phone: string
  email: string | null
  source: CandidateSource | ''
  cv: File | null
  interview_date: string | null
  interviewer: string | null
  notes: string | null
}

export interface CandidateStatusPayload {
  status: CandidateStatus
  outcome_reason: string | null
}

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}
