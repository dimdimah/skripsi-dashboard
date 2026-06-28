import { createClient } from '@/lib/supabase/server'
import { JobList } from '@/components/job-list'
import type { Job } from '@/types/database'

export default async function CareerPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('jobs')
    .select('id, title, company, location, type, salary, description, skills, contact_info, url, is_active, created_at')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  const jobs = (data || []) as Job[]

  return (
    <JobList
      jobs={jobs}
      title="Daftar Lowongan."
      subtitle="Temukan peluang karir terbaik untuk alumni."
      portalLabel="Career Center"
      showDetailModal={true}
    />
  )
}
