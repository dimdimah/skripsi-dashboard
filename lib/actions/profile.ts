'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { profileSchema, changePasswordSchema } from '@/lib/schemas/profile'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('profiles') as any)
    .update({
      ...parsed.data,
      skills: skillsArray,
    })
    .eq('id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/profile')
}

export async function changePassword(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const raw = {
    current_password: formData.get('current_password') as string,
    new_password: formData.get('new_password') as string,
    confirm_password: formData.get('confirm_password') as string,
  }

  const parsed = changePasswordSchema.safeParse(raw)
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map(e => e.message).join(', '))
  }

  // First verify current password by attempting to sign in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: parsed.data.current_password,
  })

  if (signInError) throw new Error('Password saat ini salah')

  // Update password
  const { error: updateError } = await supabase.auth.updateUser({
    password: parsed.data.new_password,
  })

  if (updateError) throw new Error(updateError.message)

  revalidatePath('/dashboard/profile')
}
