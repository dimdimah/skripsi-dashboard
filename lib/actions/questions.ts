'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import type { TracerStudyResponse } from '@/types/database'

const questionSchema = z.object({
  question_text: z.string().min(1, 'Teks pertanyaan wajib diisi'),
  question_type: z.enum(['text', 'textarea', 'select', 'radio', 'number']),
  options: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
  display_order: z.coerce.number().default(0),
  angkatan: z.string().regex(/^\d{4}$/, 'Angkatan harus 4 digit tahun'),
})

export async function createQuestion(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const raw = {
    question_text: formData.get('question_text') as string,
    question_type: formData.get('question_type') as string,
    options: (formData.get('options') as string) || null,
    is_active: formData.get('is_active') === 'true',
    display_order: Number(formData.get('display_order')) || 0,
    angkatan: (formData.get('angkatan') as string) || '2024',
  }

  const parsed = questionSchema.safeParse(raw)
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map(e => e.message).join(', '))
  }

  const optionsArray = parsed.data.options
    ? parsed.data.options.split('\n').map(s => s.trim()).filter(Boolean)
    : null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('tracer_study_questions') as any).insert({
    ...parsed.data,
    options: optionsArray,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/admin/kuesioner')
}

export async function updateQuestion(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const raw = {
    question_text: formData.get('question_text') as string,
    question_type: formData.get('question_type') as string,
    options: (formData.get('options') as string) || null,
    is_active: formData.get('is_active') === 'true',
    display_order: Number(formData.get('display_order')) || 0,
    angkatan: (formData.get('angkatan') as string) || '2024',
  }

  const parsed = questionSchema.safeParse(raw)
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map(e => e.message).join(', '))
  }

  const optionsArray = parsed.data.options
    ? parsed.data.options.split('\n').map(s => s.trim()).filter(Boolean)
    : null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('tracer_study_questions') as any)
    .update({
      ...parsed.data,
      options: optionsArray,
    })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/kuesioner')
}

export async function deleteQuestion(id: string) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('tracer_study_questions') as any).delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/kuesioner')
}

/**
 * Get distinct angkatan years that have questions.
 * Returns sorted array of year strings.
 */
export async function getQuestionAngkatanList(): Promise<string[]> {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from('tracer_study_questions') as any)
    .select('angkatan')
    .order('angkatan', { ascending: false })

  if (!data || data.length === 0) return []

  const typed = data as { angkatan: string }[]
  const unique = [...new Set(typed.map(d => d.angkatan))]
  return unique.filter((a): a is string => Boolean(a)).sort((a, b) => b.localeCompare(a))
}

/**
 * Get all questions for a specific angkatan.
 */
export async function getQuestionsByAngkatan(angkatan: string) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from('tracer_study_questions') as any)
    .select('*')
    .eq('angkatan', angkatan)
    .order('display_order', { ascending: true })

  return data || []
}

/**
 * Get questions count per angkatan for the card overview.
 */
export async function getQuestionsPerAngkatan(): Promise<{ angkatan: string; count: number; active: number }[]> {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from('tracer_study_questions') as any)
    .select('angkatan, is_active')

  if (!data || data.length === 0) return []

  const map: Record<string, { count: number; active: number }> = {}
  for (const row of data as { angkatan: string; is_active: boolean }[]) {
    if (!map[row.angkatan]) {
      map[row.angkatan] = { count: 0, active: 0 }
    }
    map[row.angkatan].count++
    if (row.is_active) map[row.angkatan].active++
  }

  return Object.entries(map)
    .map(([angkatan, stats]) => ({ angkatan, ...stats }))
    .sort((a, b) => b.angkatan.localeCompare(a.angkatan))
}

export async function getTracerStudyStats() {
  const supabase = await createClient()

  const { data: responses } = await supabase
    .from('tracer_study_responses')
    .select('*')

  if (!responses) {
    return {
      totalResponses: 0,
      employmentRate: 0,
      studyingRate: 0,
      salaryDistribution: {},
      fieldMatchRate: 0,
    }
  }

  const rData = responses as unknown as TracerStudyResponse[]
  const employed = rData.filter(r => r.employment_status === 'Bekerja').length
  const studying = rData.filter(r => r.employment_status === 'Melanjutkan Studi').length
  const fieldMatch = rData.filter(r => r.study_field_match === 'Sangat Sesuai' || r.study_field_match === 'Sesuai').length

  return {
    totalResponses: rData.length,
    employmentRate: rData.length > 0 ? Math.round((employed / rData.length) * 100) : 0,
    studyingRate: rData.length > 0 ? Math.round((studying / rData.length) * 100) : 0,
    salaryDistribution: rData.reduce((acc: Record<string, number>, r) => {
      if (r.salary_range) {
        acc[r.salary_range] = (acc[r.salary_range] || 0) + 1
      }
      return acc
    }, {}),
    fieldMatchRate: rData.length > 0 ? Math.round((fieldMatch / rData.length) * 100) : 0,
  }
}
