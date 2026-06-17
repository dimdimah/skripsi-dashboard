import { describe, it, expect } from '@jest/globals'

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

describe('Jaccard Similarity', () => {
  it('should return 0 for empty arrays', () => {
    expect(jaccardSimilarity([], ['JavaScript'])).toBe(0)
    expect(jaccardSimilarity(['JavaScript'], [])).toBe(0)
    expect(jaccardSimilarity([], [])).toBe(0)
  })

  it('should return 1 for identical arrays', () => {
    expect(jaccardSimilarity(['JavaScript', 'React'], ['JavaScript', 'React'])).toBe(1)
  })

  it('should calculate partial match correctly', () => {
    const result = jaccardSimilarity(['JavaScript', 'React', 'Node.js'], ['JavaScript', 'React', 'Python'])
    expect(result).toBe(0.5)
  })

  it('should be case insensitive', () => {
    expect(jaccardSimilarity(['JavaScript'], ['javascript'])).toBe(1)
    expect(jaccardSimilarity(['REACT'], ['react'])).toBe(1)
  })

  it('should handle single item match', () => {
    const result = jaccardSimilarity(['JavaScript'], ['JavaScript', 'React'])
    expect(result).toBeCloseTo(0.5, 2)
  })
})

describe('Location Matching', () => {
  it('should return 0 for null alumni location', () => {
    expect(matchLocation(null, 'Yogyakarta')).toBe(0)
  })

  it('should return 1 for exact match', () => {
    expect(matchLocation('Yogyakarta', 'Yogyakarta')).toBe(1)
    expect(matchLocation('yogyakarta', 'Yogyakarta')).toBe(1)
  })

  it('should return 0.8 for partial match', () => {
    expect(matchLocation('Yogyakarta, Indonesia', 'Yogyakarta')).toBe(0.8)
    expect(matchLocation('Jakarta', 'Jakarta Selatan')).toBe(0.8)
  })

  it('should return 0.6 for remote match', () => {
    expect(matchLocation('Remote', 'Jakarta')).toBe(0.6)
    expect(matchLocation('Yogyakarta', 'Remote')).toBe(0.6)
  })

  it('should return 0 for no match', () => {
    expect(matchLocation('Yogyakarta', 'Jakarta')).toBe(0)
  })
})

describe('Salary Matching', () => {
  it('should return 0 for null values', () => {
    expect(matchSalary(null, '5-8 juta')).toBe(0)
    expect(matchSalary('5-8 juta', null)).toBe(0)
    expect(matchSalary(null, null)).toBe(0)
  })

  it('should return 1 for overlapping ranges', () => {
    expect(matchSalary('5-8 juta', '6-10 juta')).toBe(1)
    expect(matchSalary('5-8 juta', '5-8 juta')).toBe(1)
    expect(matchSalary('5-8 juta', '3-10 juta')).toBe(1)
  })

  it('should return 0.5 for close ranges', () => {
    expect(matchSalary('5-8 juta', '9-12 juta')).toBe(0.5)
    expect(matchSalary('3-5 juta', '6-8 juta')).toBe(0.5)
  })

  it('should return 0 for far ranges', () => {
    expect(matchSalary('3-5 juta', '15-20 juta')).toBe(0)
  })

  it('should parse salary with various formats', () => {
    expect(matchSalary('5-8 juta', '6-10 juta')).toBe(1)
    expect(matchSalary('5jt-8jt', '6jt-10jt')).toBe(1)
  })
})

describe('Type Matching', () => {
  it('should return 0 for null alumni type', () => {
    expect(matchType(null, 'Full-time')).toBe(0)
  })

  it('should return 1 for exact match', () => {
    expect(matchType('Full-time', 'Full-time')).toBe(1)
    expect(matchType('full-time', 'Full-time')).toBe(1)
  })

  it('should return 0 for different types', () => {
    expect(matchType('Part-time', 'Full-time')).toBe(0)
    expect(matchType('Contract', 'Internship')).toBe(0)
  })
})

describe('Score Calculation with Dynamic Weights', () => {
  const WEIGHTS = {
    skill: 0.4,
    location: 0.2,
    salary: 0.2,
    education: 0.0,
    type: 0.2,
  }

  function calculateScore(breakdown: { skill: number | null; location: number | null; salary: number | null; type: number | null }): number {
    const entries = Object.entries(breakdown).filter(
      ([, v]) => v !== null
    ) as [keyof typeof WEIGHTS, number][]

    if (entries.length === 0) return 0

    const totalWeight = entries.reduce(
      (sum, [k]) => sum + WEIGHTS[k],
      0
    )

    return entries.reduce(
      (sum, [k, v]) => sum + (v * WEIGHTS[k]) / totalWeight,
      0
    )
  }

  it('should redistribute weights when skill is missing', () => {
    const result = calculateScore({
      skill: null,
      location: 1,
      salary: 1,
      type: 1,
    })
    expect(result).toBe(1)
  })

  it('should calculate with all features available', () => {
    const result = calculateScore({
      skill: 0.5,
      location: 1,
      salary: 0.8,
      type: 1,
    })
    const expected = (0.5 * 0.4 + 1 * 0.2 + 0.8 * 0.2 + 1 * 0.2) / 1
    expect(result).toBeCloseTo(expected, 2)
  })

  it('should return 0 when no features available', () => {
    const result = calculateScore({
      skill: null,
      location: 0,
      salary: null,
      type: 0,
    })
    expect(result).toBe(0)
  })
})
