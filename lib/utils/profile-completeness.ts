import type { Profile } from '@/types/database'

const PROFILE_FIELDS = [
  { key: 'full_name', label: 'Nama Lengkap', weight: 1 },
  { key: 'nim', label: 'NIM', weight: 1 },
  { key: 'tanggal_lahir', label: 'Tanggal Lahir', weight: 1 },
  { key: 'phone', label: 'No. Telepon', weight: 1 },
  { key: 'bio', label: 'Bio', weight: 1 },
  { key: 'skills', label: 'Skills', weight: 2 },
  { key: 'location', label: 'Lokasi', weight: 2 },
  { key: 'education_level', label: 'Pendidikan', weight: 1 },
  { key: 'expected_salary', label: 'Ekspektasi Gaji', weight: 1 },
  { key: 'preferred_type', label: 'Tipe Pekerjaan', weight: 1 },
] as const

export function calculateProfileCompleteness(profile: Profile | null): number {
  if (!profile) return 0

  let filledWeight = 0
  let totalWeight = 0

  for (const field of PROFILE_FIELDS) {
    totalWeight += field.weight
    const value = profile[field.key as keyof Profile]

    if (field.key === 'skills') {
      if (Array.isArray(value) && value.length > 0) {
        filledWeight += field.weight
      }
    } else if (field.key === 'bio') {
      if (typeof value === 'string' && value.trim().length > 10) {
        filledWeight += field.weight
      }
    } else {
      if (value !== null && value !== undefined && value !== '') {
        filledWeight += field.weight
      }
    }
  }

  return Math.round((filledWeight / totalWeight) * 100)
}

export function getProfileCompletenessDetails(profile: Profile | null) {
  if (!profile) return { percentage: 0, filled: 0, total: PROFILE_FIELDS.length, missingFields: [] }

  let filledCount = 0
  const missingFields: string[] = []

  for (const field of PROFILE_FIELDS) {
    const value = profile[field.key as keyof Profile]

    if (field.key === 'skills') {
      if (Array.isArray(value) && value.length > 0) {
        filledCount++
      } else {
        missingFields.push(field.label)
      }
    } else if (field.key === 'bio') {
      if (typeof value === 'string' && value.trim().length > 10) {
        filledCount++
      } else {
        missingFields.push(field.label)
      }
    } else {
      if (value !== null && value !== undefined && value !== '') {
        filledCount++
      } else {
        missingFields.push(field.label)
      }
    }
  }

  return {
    percentage: Math.round((filledCount / PROFILE_FIELDS.length) * 100),
    filled: filledCount,
    total: PROFILE_FIELDS.length,
    missingFields,
  }
}
