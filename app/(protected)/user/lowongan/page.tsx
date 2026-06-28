'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { JobList } from '@/components/job-list'
import type { Job } from '@/types/database'

export default function LowonganPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    ;(async () => {
      try {
        const { data } = await supabase
          .from('jobs')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
        if (data) setJobs(data as Job[])
      } catch {
        // silent fail
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) {
    return (
      <div className="page-container space-y-8 pb-8">
        <div className="flex items-center justify-center py-16">
          <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-amikom-purple border-t-transparent" />
        </div>
      </div>
    )
  }

  return (
    <JobList
      jobs={jobs}
      title="Daftar Lowongan."
      subtitle="Temukan peluang karir terbaik untuk alumni."
      portalLabel="Alumni Portal"
      emptyIcon="▽"
      showDetailModal={false}
      showFooterStats={true}
    />
  )
}
