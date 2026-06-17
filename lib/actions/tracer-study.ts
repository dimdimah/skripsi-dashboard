'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { tracerStudySchema } from '@/lib/schemas/tracer-study'

export async function submitTracerStudy(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('tracer_study_responses') as any).upsert(
    {
      ...parsed.data,
      user_id: user.id,
    },
    { onConflict: 'user_id' }
  )

  if (error) throw new Error(error.message)

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

  if (error) throw new Error(error.message)
  return data
}
