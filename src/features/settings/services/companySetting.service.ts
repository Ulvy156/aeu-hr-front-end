import api from '@/lib/axios'
import type { CompanySetting, CompanySettingForm } from '../types/companySetting.types'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export async function getCompanySettings(): Promise<ApiResponse<CompanySetting>> {
  const { data } = await api.get('/settings/company')
  return data
}

export async function updateCompanySettings(
  form: CompanySettingForm,
  logoFile?: File | null,
): Promise<ApiResponse<CompanySetting>> {
  if (logoFile) {
    const fd = new FormData()
    fd.append('_method', 'PUT')
    fd.append('company_logo', logoFile)
    fd.append('company_name', form.company_name)
    fd.append('company_address', form.company_address)
    fd.append('company_phone', form.company_phone)
    fd.append('company_email', form.company_email)
    if (form.office_latitude) fd.append('office_latitude', form.office_latitude)
    if (form.office_longitude) fd.append('office_longitude', form.office_longitude)
    fd.append('allowed_radius_meters', String(form.allowed_radius_meters))
    fd.append('working_start_time', form.working_start_time)
    fd.append('working_end_time', form.working_end_time)
    form.working_days.forEach((day) => fd.append('working_days[]', day))
    fd.append('salary_currency', form.salary_currency)
    fd.append('payroll_day_rate', String(form.payroll_day_rate))

    const { data } = await api.post('/settings/company', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  }

  const payload = {
    company_name: form.company_name,
    company_address: form.company_address || null,
    company_phone: form.company_phone || null,
    company_email: form.company_email || null,
    office_latitude: form.office_latitude ? parseFloat(form.office_latitude) : null,
    office_longitude: form.office_longitude ? parseFloat(form.office_longitude) : null,
    allowed_radius_meters: Number(form.allowed_radius_meters),
    working_start_time: form.working_start_time,
    working_end_time: form.working_end_time,
    working_days: form.working_days,
    salary_currency: form.salary_currency,
    payroll_day_rate: Number(form.payroll_day_rate),
  }

  const { data } = await api.put('/settings/company', payload)
  return data
}
