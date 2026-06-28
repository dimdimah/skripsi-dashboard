'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { jobSchema } from '@/lib/schemas/jobs'

async function checkAdminRole() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single() as { data: { role: string } | null; error: unknown }
  if (profile?.role !== 'super_user') throw new Error('Forbidden')
  return supabase
}

export async function createJob(formData: FormData) {
  const supabase = await checkAdminRole()

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

  const { error } = await supabase
    .from('jobs')
    .insert({
      title: parsed.data.title,
      company: parsed.data.company,
      location: parsed.data.location,
      type: parsed.data.type,
      salary: parsed.data.salary,
      description: parsed.data.description,
      skills: skillsArray,
      contact_info: parsed.data.contact_info,
      is_active: parsed.data.is_active,
    } as never)

  if (error) {
    console.error('Gagal buat job:', error.message)
    throw new Error('Gagal menyimpan lowongan. Silakan coba lagi.')
  }

  revalidatePath('/admin/career-center')
}

export async function updateJob(id: string, formData: FormData) {
  const supabase = await checkAdminRole()

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

  const { error } = await supabase
    .from('jobs')
    .update({
      title: parsed.data.title,
      company: parsed.data.company,
      location: parsed.data.location,
      type: parsed.data.type,
      salary: parsed.data.salary,
      description: parsed.data.description,
      skills: skillsArray,
      contact_info: parsed.data.contact_info,
      is_active: parsed.data.is_active,
    } as never)
    .eq('id', id)

  if (error) {
    console.error('Gagal update job:', error.message)
    throw new Error('Gagal menyimpan lowongan. Silakan coba lagi.')
  }

  revalidatePath('/admin/career-center')
}

export async function deleteJob(id: string) {
  const supabase = await checkAdminRole()

  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Gagal hapus job:', error.message)
    throw new Error('Gagal menghapus lowongan. Silakan coba lagi.')
  }

  revalidatePath('/admin/career-center')
}

export async function toggleJobStatus(id: string, isActive: boolean) {
  const supabase = await checkAdminRole()

  const { error } = await supabase
    .from('jobs')
    .update({ is_active: isActive } as never)
    .eq('id', id)

  if (error) {
    console.error('Gagal toggle job:', error.message)
    throw new Error('Gagal mengubah status lowongan. Silakan coba lagi.')
  }

  revalidatePath('/admin/career-center')
}

export async function getActiveJobs() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('jobs')
    .select('id, title, company, location, type, salary, description, skills, contact_info, is_active, created_at')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  return data || []
}

export async function getAllJobs() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('jobs')
    .select('id, title, company, location, type, salary, description, skills, contact_info, is_active, created_at')
    .order('created_at', { ascending: false })
  return data || []
}
