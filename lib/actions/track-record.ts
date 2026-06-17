'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { trackRecordSchema } from '@/lib/schemas/track-record'

export async function createTrackRecord(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const raw = {
    company: formData.get('company') as string,
    position: formData.get('position') as string,
    start_date: formData.get('start_date') as string,
    end_date: formData.get('end_date') as string || null,
    description: formData.get('description') as string || null,
    is_current: formData.get('is_current') === 'true',
  }

  const parsed = trackRecordSchema.safeParse(raw)
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map(e => e.message).join(', '))
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('track_records') as any).insert({
    ...parsed.data,
    user_id: user.id,
    end_date: parsed.data.is_current ? null : parsed.data.end_date,
  })

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/track-record')
}

export async function updateTrackRecord(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const raw = {
    company: formData.get('company') as string,
    position: formData.get('position') as string,
    start_date: formData.get('start_date') as string,
    end_date: formData.get('end_date') as string || null,
    description: formData.get('description') as string || null,
    is_current: formData.get('is_current') === 'true',
  }

  const parsed = trackRecordSchema.safeParse(raw)
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map(e => e.message).join(', '))
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('track_records') as any)
    .update({
      ...parsed.data,
      end_date: parsed.data.is_current ? null : parsed.data.end_date,
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/track-record')
}

export async function deleteTrackRecord(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('track_records') as any)
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/track-record')
}
