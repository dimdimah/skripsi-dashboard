'use server'

import { createClient } from '@/lib/supabase/server'
import type { Profile, Job, MatchResult, MatchBreakdown } from '@/types/database'

const WEIGHTS = {
  skill: 0.4,
  location: 0.2,
  salary: 0.2,
  education: 0.0,
  type: 0.2,
}

function normalize(str: string): string {
  return str.toLowerCase().trim()
}

function jaccardSimilarity(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0
  const setA = new Set(a.map(normalize))
  const setB = new Set(b.map(normalize))
  let intersection = 0
  for (const item of setA) {
    if (setB.has(item)) intersection++
  }
  const union = setA.size + setB.size - intersection
  return union === 0 ? 0 : intersection / union
}

function matchLocation(alumniLoc: string | null, jobLoc: string): number {
  if (!alumniLoc) return 0
  const a = normalize(alumniLoc)
  const j = normalize(jobLoc)
  if (a === j) return 1
  if (a.includes(j) || j.includes(a)) return 0.8
  if (j.includes('remote') || a.includes('remote')) return 0.6
  return 0
}

function parseSalaryRange(salary: string): { min: number; max: number } | null {
  const clean = salary.replace(/[^0-9\-]/g, '')
  const parts = clean.split('-')
  if (parts.length !== 2) return null
  const min = parseInt(parts[0], 10)
  const max = parseInt(parts[1], 10)
  if (isNaN(min) || isNaN(max)) return null
  return { min, max }
}

function matchSalary(alumniSalary: string | null, jobSalary: string | null): number {
  if (!alumniSalary || !jobSalary) return 0
  const aRange = parseSalaryRange(alumniSalary)
  const jRange = parseSalaryRange(jobSalary)
  if (!aRange || !jRange) return 0
  const overlapMin = Math.max(aRange.min, jRange.min)
  const overlapMax = Math.min(aRange.max, jRange.max)
  if (overlapMin <= overlapMax) return 1
  const gap = Math.min(
    Math.abs(aRange.min - jRange.max),
    Math.abs(jRange.min - aRange.max)
  )
  if (gap <= 2) return 0.5
  return 0
}



function matchType(alumniType: string | null, jobType: string): number {
  if (!alumniType) return 0
  return normalize(alumniType) === normalize(jobType) ? 1 : 0
}

function calculateBreakdown(alumni: Profile, job: Job): MatchBreakdown {
  return {
    skill: job.skills?.length
      ? jaccardSimilarity(alumni.skills || [], job.skills)
      : null,
    location: matchLocation(alumni.location, job.location),
    salary: matchSalary(alumni.expected_salary, job.salary),
    education: null,
    type: matchType(alumni.preferred_type, job.type),
  }
}

function calculateScore(breakdown: MatchBreakdown): {
  score: number
  confidence: 'high' | 'medium' | 'low'
  available: number
} {
  const entries = Object.entries(breakdown).filter(
    ([, v]) => v !== null
  ) as [keyof MatchBreakdown, number][]

  const totalFeatures = Object.keys(WEIGHTS).length
  const available = entries.length

  if (available === 0) return { score: 0, confidence: 'low', available: 0 }

  const totalWeight = entries.reduce(
    (sum, [k]) => sum + WEIGHTS[k],
    0
  )

  const score = entries.reduce(
    (sum, [k, v]) => sum + (v * WEIGHTS[k]) / totalWeight,
    0
  )

  let confidence: 'high' | 'medium' | 'low' = 'low'
  if (available >= 5) confidence = 'high'
  else if (available >= 3) confidence = 'medium'

  return { score, confidence, available }
}

export async function getJobRecommendations(
  limit: number = 10
): Promise<MatchResult[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) return []

  const { data: jobs } = await supabase
    .from('jobs')
    .select('*')
    .eq('is_active', true)

  if (!jobs || jobs.length === 0) return []

  const results: MatchResult[] = jobs.map((job) => {
    const breakdown = calculateBreakdown(profile as Profile, job as Job)
    const { score, confidence, available } = calculateScore(breakdown)

    return {
      job: job as Job,
      score: Math.round(score * 100) / 100,
      breakdown,
      confidence,
      availableFeatures: available,
      totalFeatures: Object.keys(WEIGHTS).length,
    }
  })

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

export async function getMatchingStats(): Promise<{
  totalAlumni: number
  withSkills: number
  withLocation: number
  withSalary: number
  withType: number
  completeProfile: number
}> {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profiles } = await (supabase
    .from('profiles')
    .select('skills, location, expected_salary, preferred_type') as any)
    .eq('role', 'user')

  if (!profiles || profiles.length === 0) {
    return {
      totalAlumni: 0,
      withSkills: 0,
      withLocation: 0,
      withSalary: 0,
      withType: 0,
      completeProfile: 0,
    }
  }

  let withSkills = 0
  let withLocation = 0
  let withSalary = 0
  let withType = 0
  let completeProfile = 0

  for (const p of profiles) {
    const hasSkills = Array.isArray(p.skills) && p.skills.length > 0
    const hasLocation = !!p.location
    const hasSalary = !!p.expected_salary
    const hasType = !!p.preferred_type

    if (hasSkills) withSkills++
    if (hasLocation) withLocation++
    if (hasSalary) withSalary++
    if (hasType) withType++
    if (hasSkills && hasLocation && hasSalary && hasType) completeProfile++
  }

  return {
    totalAlumni: profiles.length,
    withSkills,
    withLocation,
    withSalary,
    withType,
    completeProfile,
  }
}
