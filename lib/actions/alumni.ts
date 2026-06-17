'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Profile } from '@/types/database'

export async function resetUserPassword(userId: string, newPassword: string) {
  // Gunakan admin client dengan service_role key untuk operasi auth.admin
  const adminSupabase = createAdminClient()

  const { error } = await adminSupabase.auth.admin.updateUserById(userId, {
    password: newPassword,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/admin/alumni')
}

export async function deleteUser(userId: string) {
  // Gunakan admin client dengan service_role key untuk operasi auth.admin
  const adminSupabase = createAdminClient()

  const { error } = await adminSupabase.auth.admin.deleteUser(userId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/alumni')
}

export async function getAlumniStats() {
  const supabase = await createClient()

  const { data: rawProfiles } = await supabase
    .from('profiles')
    .select('*')

  const { data: rawResponses } = await supabase
    .from('tracer_study_responses')
    .select('id')

  const profiles = (rawProfiles || []) as Profile[]
  const responses = rawResponses as { id: string }[] | null

  return {
    totalAlumni: profiles.filter(p => p.role === 'user').length,
    totalSuperUsers: profiles.filter(p => p.role === 'super_user').length,
    totalUsers: profiles.length,
    tracerStudyFilled: responses?.length || 0,
  }
}
