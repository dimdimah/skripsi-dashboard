'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { withAuth, orThrow } from './helpers'

const questionSchema = z.object({
  question_text: z.string().min(1, 'Teks pertanyaan wajib diisi'),
  question_type: z.enum(['text', 'textarea', 'select', 'radio', 'number']),
  options: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
  display_order: z.coerce.number().default(0),
  angkatan: z.string().regex(/^\d{4}$/, 'Angkatan harus 4 digit tahun'),
})

export async function createQuestion(formData: FormData) {
  const { supabase, user } = await withAuth()

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

  const { error } = await supabase
    .from('tracer_study_questions')
    .insert({
      question_text: parsed.data.question_text,
      question_type: parsed.data.question_type,
      options: optionsArray,
      is_active: parsed.data.is_active,
      display_order: parsed.data.display_order,
      angkatan: parsed.data.angkatan,
    } as never)

  orThrow(error, 'Gagal buat pertanyaan', 'Gagal menyimpan pertanyaan. Silakan coba lagi.')
  revalidatePath('/admin/kuesioner')
}

export async function updateQuestion(id: string, formData: FormData) {
  const { supabase, user } = await withAuth()

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

  const { error } = await supabase
    .from('tracer_study_questions')
    .update({
      question_text: parsed.data.question_text,
      question_type: parsed.data.question_type,
      options: optionsArray,
      is_active: parsed.data.is_active,
      display_order: parsed.data.display_order,
      angkatan: parsed.data.angkatan,
    } as never)
    .eq('id', id)

  orThrow(error, 'Gagal update pertanyaan', 'Gagal menyimpan pertanyaan. Silakan coba lagi.')
  revalidatePath('/admin/kuesioner')
}

export async function deleteQuestion(id: string) {
  const { supabase } = await withAuth()
  const { error } = await supabase
    .from('tracer_study_questions')
    .delete()
    .eq('id', id)
  orThrow(error, 'Gagal hapus pertanyaan', 'Gagal menghapus pertanyaan. Silakan coba lagi.')
  revalidatePath('/admin/kuesioner')
}

export async function getQuestionAngkatanList(): Promise<string[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('tracer_study_questions')
    .select('angkatan')
    .order('angkatan', { ascending: false })

  if (!data || data.length === 0) return []

  const unique = [...new Set(data.map((d: { angkatan: string }) => d.angkatan))]
  return (unique.filter((a): a is string => Boolean(a)) as string[]).sort((a, b) => b.localeCompare(a))
}

export async function getQuestionsByAngkatan(angkatan: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('tracer_study_questions')
    .select('id, question_text, question_type, options, is_active, display_order, angkatan')
    .eq('angkatan', angkatan)
    .order('display_order', { ascending: true })

  return data || []
}

export async function getQuestionsByAngkatanPaginated(angkatan: string, page: number, perPage: number = 20) {
  const supabase = await createClient()
  const from = (page - 1) * perPage
  const to = from + perPage - 1

  const { data, count } = await supabase
    .from('tracer_study_questions')
    .select('id, question_text, question_type, options, is_active, display_order, angkatan', { count: 'exact' })
    .eq('angkatan', angkatan)
    .order('display_order', { ascending: true })
    .range(from, to)

  return {
    questions: data || [],
    total: count || 0,
    totalPages: Math.ceil((count || 0) / perPage),
  }
}

export async function getQuestionsPerAngkatan(): Promise<{ angkatan: string; count: number; active: number }[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('tracer_study_questions')
    .select('angkatan, is_active')

  if (!data || data.length === 0) return []

  const map: Record<string, { count: number; active: number }> = {}
  for (const row of (data as { angkatan: string; is_active: boolean }[])) {
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

export async function getAvailableYears(): Promise<string[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('tracer_study_responses')
    .select('graduation_year')
    .order('graduation_year', { ascending: false })

  if (!data || data.length === 0) return []

  const rows = (data as { graduation_year: number }[])
  const years = rows.map(r => String(r.graduation_year))
  return [...new Set(years)].sort((a, b) => b.localeCompare(a))
}

export async function getTracerStudyStats(year?: string) {
  const supabase = await createClient()
  let query = supabase
    .from('tracer_study_responses')
    .select('employment_status, salary_range, study_field_match, graduation_year')
  if (year) {
    query = query.eq('graduation_year', Number(year))
  }

  const { data: responses } = await query

  if (!responses || responses.length === 0) {
    return {
      totalResponses: 0,
      employmentRate: 0,
      studyingRate: 0,
      salaryDistribution: {},
      fieldMatchRate: 0,
    }
  }

  type TracerStudyRow = { employment_status: string; salary_range: string | null; study_field_match: string | null; graduation_year: number }
  const rows = (responses as TracerStudyRow[])

  const employed = rows.filter(r => r.employment_status === 'Bekerja').length
  const studying = rows.filter(r => r.employment_status === 'Melanjutkan Studi').length
  const withFieldMatch = rows.filter(r => r.study_field_match !== null)
  const fieldMatch = withFieldMatch.filter(r => r.study_field_match === 'Sangat Sesuai' || r.study_field_match === 'Sesuai').length

  return {
    totalResponses: rows.length,
    employmentRate: rows.length > 0 ? Math.round((employed / rows.length) * 100) : 0,
    studyingRate: rows.length > 0 ? Math.round((studying / rows.length) * 100) : 0,
    salaryDistribution: rows.reduce((acc: Record<string, number>, r) => {
      if (r.salary_range) {
        acc[r.salary_range] = (acc[r.salary_range] || 0) + 1
      }
      return acc
    }, {}),
    fieldMatchRate: withFieldMatch.length > 0 ? Math.round((fieldMatch / withFieldMatch.length) * 100) : 0,
  }
}
