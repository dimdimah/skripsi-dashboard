'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { jobSchema } from '@/lib/schemas/jobs'

export async function createJob(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const raw = {
    title: formData.get('title') as string,
    company: formData.get('company') as string,
    location: formData.get('location') as string,
    type: formData.get('type') as 'Full-time' | 'Part-time' | 'Contract' | 'Internship',
    salary: (formData.get('salary') as string) || null,
    description: formData.get('description') as string,
    skills: (formData.get('skills') as string) || null,
    contact_info: (formData.get('contact_info') as string) || null,
    url: formData.get('url') as string,
    source: formData.get('source') as string,
    is_active: formData.get('is_active') === 'true',
  }

  const parsed = jobSchema.safeParse(raw)
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map(e => e.message).join(', '))
  }

  const skillsArray = parsed.data.skills
    ? parsed.data.skills.split(',').map(s => s.trim()).filter(Boolean)
    : []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('jobs') as any).insert({
    ...parsed.data,
    skills: skillsArray,
  })

  if (error) throw new Error(error.message)

  revalidatePath('/admin/career-center')
}

export async function updateJob(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const raw = {
    title: formData.get('title') as string,
    company: formData.get('company') as string,
    location: formData.get('location') as string,
    type: formData.get('type') as 'Full-time' | 'Part-time' | 'Contract' | 'Internship',
    salary: (formData.get('salary') as string) || null,
    description: formData.get('description') as string,
    skills: (formData.get('skills') as string) || null,
    contact_info: (formData.get('contact_info') as string) || null,
    url: formData.get('url') as string,
    source: formData.get('source') as string,
    is_active: formData.get('is_active') === 'true',
  }

  const parsed = jobSchema.safeParse(raw)
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map(e => e.message).join(', '))
  }

  const skillsArray = parsed.data.skills
    ? parsed.data.skills.split(',').map(s => s.trim()).filter(Boolean)
    : []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('jobs') as any)
    .update({
      ...parsed.data,
      skills: skillsArray,
    })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/career-center')
}

export async function deleteJob(id: string) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('jobs') as any).delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/career-center')
}

export async function toggleJobStatus(id: string, isActive: boolean) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('jobs') as any)
    .update({ is_active: isActive })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/career-center')
}

export async function getActiveJobs() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('jobs')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  return data || []
}

export async function getAllJobs() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false })
  return data || []
}
