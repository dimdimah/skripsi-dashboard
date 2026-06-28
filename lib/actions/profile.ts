'use server'

import { revalidatePath } from 'next/cache'
import { profileSchema, changePasswordSchema } from '@/lib/schemas/profile'
import { withAuth, orThrow } from './helpers'

export async function updateProfile(formData: FormData) {
  const { supabase, user } = await withAuth()

  const raw = {
    full_name: formData.get('full_name') as string,
    phone: (formData.get('phone') as string) || null,
    bio: (formData.get('bio') as string) || null,
    nim: (formData.get('nim') as string) || null,
    tanggal_lahir: (formData.get('tanggal_lahir') as string) || null,
    skills: (formData.get('skills') as string) || null,
    location: (formData.get('location') as string) || null,
    education_level: (formData.get('education_level') as string) || null,
    expected_salary: (formData.get('expected_salary') as string) || null,
    preferred_type: (formData.get('preferred_type') as string) || null,
  }

  const parsed = profileSchema.safeParse(raw)
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map(e => e.message).join(', '))
  }

  const skillsArray = parsed.data.skills
    ? parsed.data.skills.split(/[,;]/).map(s => s.trim()).filter(Boolean)
    : []

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: parsed.data.full_name,
      phone: parsed.data.phone,
      bio: parsed.data.bio,
      nim: parsed.data.nim,
      tanggal_lahir: parsed.data.tanggal_lahir,
      skills: skillsArray,
      location: parsed.data.location,
      education_level: parsed.data.education_level,
      expected_salary: parsed.data.expected_salary,
      preferred_type: parsed.data.preferred_type,
    } as never)
    .eq('id', user.id)

  orThrow(error, 'Gagal update profil', 'Gagal menyimpan profil. Silakan coba lagi.')

  revalidatePath('/dashboard/profile')
}

export async function changePassword(formData: FormData) {
  const { supabase, user } = await withAuth()

  const raw = {
    current_password: formData.get('current_password') as string,
    new_password: formData.get('new_password') as string,
    confirm_password: formData.get('confirm_password') as string,
  }

  const parsed = changePasswordSchema.safeParse(raw)
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map(e => e.message).join(', '))
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: parsed.data.current_password,
  })

  if (signInError) throw new Error('Password saat ini salah')

  const { error: updateError } = await supabase.auth.updateUser({
    password: parsed.data.new_password,
  })

  if (updateError) {
    console.error('Gagal ganti password:', updateError.message)
    throw new Error('Gagal mengganti password. Silakan coba lagi.')
  }

  revalidatePath('/dashboard/profile')
}
