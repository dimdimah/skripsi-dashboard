'use server'

import { revalidatePath } from 'next/cache'
import { tracerStudySchema } from '@/lib/schemas/tracer-study'
import { createClient } from '@/lib/supabase/server'
import { withAuth, orThrow } from './helpers'

export async function submitTracerStudy(formData: FormData) {
  const { supabase, user } = await withAuth()

  const raw = {
    graduation_year: Number(formData.get('graduation_year')),
    education_level: formData.get('education_level') as string,
    employment_status: formData.get('employment_status') as string,
    company: (formData.get('company') as string) || null,
    position: (formData.get('position') as string) || null,
    salary_range: (formData.get('salary_range') as string) || null,
    study_field_match: (formData.get('study_field_match') as string) || null,
    suggestions: (formData.get('suggestions') as string) || null,
  }

  const parsed = tracerStudySchema.safeParse(raw)
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map(e => e.message).join(', '))
  }

  const { error } = await supabase
    .from('tracer_study_responses')
    .upsert(
      {
        graduation_year: parsed.data.graduation_year,
        education_level: parsed.data.education_level,
        employment_status: parsed.data.employment_status,
        company: parsed.data.company,
        position: parsed.data.position,
        salary_range: parsed.data.salary_range,
        study_field_match: parsed.data.study_field_match,
        suggestions: parsed.data.suggestions,
        user_id: user.id,
      } as never,
      { onConflict: 'user_id' }
    )

  orThrow(error, 'Gagal submit tracer study', 'Gagal menyimpan data tracer study. Silakan coba lagi.')

  revalidatePath('/dashboard/tracer-study')
}

export async function getTracerStudyResponse() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('tracer_study_responses')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    console.error('Gagal ambil tracer study:', error.message)
    return null
  }

  return data
}
