import { describe, it, expect } from '@jest/globals'

// ═══════════════════════════════════════════════════════════
// 1. TEXT PREPROCESSING PIPELINE
// ═══════════════════════════════════════════════════════════
import {
  caseFolding,
  cleaning,
  tokenization,
  stopwordRemoval,
  preprocess,
  buildDocument,
} from '@/lib/preprocessing'

describe('Case Folding', () => {
  it('should convert uppercase to lowercase', () => {
    expect(caseFolding('Backend Developer Laravel')).toBe('backend developer laravel')
  })

  it('should handle mixed case', () => {
    expect(caseFolding('ReAcT Js DeVelOper')).toBe('react js developer')
  })

  it('should handle empty string', () => {
    expect(caseFolding('')).toBe('')
  })
})

describe('Cleaning', () => {
  it('should remove punctuation', () => {
    expect(cleaning('Hello, World!')).toBe('Hello World')
  })

  it('should remove symbols and numbers', () => {
    expect(cleaning('Laravel 8, PHP 7.4 & MySQL')).toBe('Laravel PHP MySQL')
  })

  it('should normalize multiple spaces', () => {
    expect(cleaning('React    JS   Developer')).toBe('React JS Developer')
  })
})

describe('Tokenization', () => {
  it('should split text into words', () => {
    expect(tokenization('backend developer laravel')).toEqual(['backend', 'developer', 'laravel'])
  })

  it('should return empty array for empty string', () => {
    expect(tokenization('')).toEqual([])
  })

  it('should filter empty tokens', () => {
    expect(tokenization('  react  js  ')).toEqual(['react', 'js'])
  })
})

describe('Stopword Removal', () => {
  it('should remove Indonesian stopwords', () => {
    expect(stopwordRemoval(['saya', 'adalah', 'developer', 'dan', 'programmer'])).toEqual([
      'developer',
      'programmer',
    ])
  })

  it('should remove English stopwords', () => {
    expect(stopwordRemoval(['i', 'am', 'a', 'software', 'engineer'])).toEqual([
      'software',
      'engineer',
    ])
  })

  it('should keep meaningful words', () => {
    expect(stopwordRemoval(['laravel', 'react', 'python'])).toEqual([
      'laravel',
      'react',
      'python',
    ])
  })
})

describe('Full Preprocessing Pipeline', () => {
  it('should preprocess Indonesian text correctly', () => {
    const result = preprocess('Saya adalah seorang Backend Developer Laravel!')
    expect(result).toContain('backend')
    expect(result).toContain('developer')
    expect(result).toContain('laravel')
    expect(result).not.toContain('saya')
    expect(result).not.toContain('adalah')
    expect(result).not.toContain('seorang')
  })

  it('should preprocess English text correctly', () => {
    const result = preprocess('I am a Full Stack Developer with React and Node.js')
    expect(result).toContain('full')
    expect(result).toContain('stack')
    expect(result).toContain('developer')
    expect(result).toContain('react')
    expect(result).toContain('node')
    expect(result).toContain('js')
    expect(result).not.toContain('and')
  })

  it('should return empty array for empty input', () => {
    expect(preprocess('')).toEqual([])
    expect(preprocess('   ')).toEqual([])
  })
})

describe('Build Document', () => {
  it('should combine multiple fields', () => {
    const doc = buildDocument('Informatika', 'Laravel PHP MySQL', 'Backend Developer')
    expect(doc).toContain('informatika')
    expect(doc).toContain('laravel')
    expect(doc).toContain('php')
    expect(doc).toContain('mysql')
    expect(doc).toContain('backend')
    expect(doc).toContain('developer')
  })

  it('should filter null and undefined fields', () => {
    const doc = buildDocument('React', null, undefined, 'JavaScript')
    expect(doc).toContain('react')
    expect(doc).toContain('javascript')
  })

  it('should return empty array for all null fields', () => {
    expect(buildDocument(null, undefined)).toEqual([])
  })
})

// ═══════════════════════════════════════════════════════════
// 2. TF-IDF COMPUTATION
// ═══════════════════════════════════════════════════════════
import { computeTF, computeIDF, computeTFIDF } from '@/lib/tfidf'

describe('Term Frequency (TF)', () => {
  it('should count term frequency correctly', () => {
    const tokens = ['laravel', 'php', 'laravel', 'mysql', 'laravel']
    const tf = computeTF(tokens)
    expect(tf.get('laravel')).toBe(3)
    expect(tf.get('php')).toBe(1)
    expect(tf.get('mysql')).toBe(1)
  })

  it('should return empty map for empty tokens', () => {
    const tf = computeTF([])
    expect(tf.size).toBe(0)
  })

  it('should handle single token', () => {
    const tf = computeTF(['react'])
    expect(tf.get('react')).toBe(1)
  })
})

describe('Inverse Document Frequency (IDF)', () => {
  it('should give low IDF to common words', () => {
    const docs = [
      ['developer', 'laravel', 'php'],
      ['developer', 'react', 'javascript'],
      ['developer', 'python', 'django'],
    ]
    const idf = computeIDF(docs)
    // 'developer' muncul di semua dokumen → IDF rendah
    const developerIdf = idf.get('developer')!
    const laravelIdf = idf.get('laravel')!
    expect(developerIdf).toBeLessThan(laravelIdf)
  })

  it('should give high IDF to rare words', () => {
    const docs = [
      ['laravel', 'php', 'mysql'],
      ['react', 'javascript', 'node'],
      ['python', 'django', 'postgresql'],
    ]
    const idf = computeIDF(docs)
    // Setiap term spesifik hanya muncul di 1 dari 3 dokumen → IDF tinggi
    expect(idf.get('laravel')).toBeGreaterThan(0)
    expect(idf.get('react')).toBeGreaterThan(0)
    expect(idf.get('python')).toBeGreaterThan(0)
  })

  it('should return empty map for empty documents', () => {
    expect(computeIDF([]).size).toBe(0)
  })

  it('should apply smoothing (+1) for terms in all documents', () => {
    const docs = [['react'], ['react']]
    const idf = computeIDF(docs)
    // ln(2/2) + 1 = 1
    expect(idf.get('react')).toBeCloseTo(1, 2)
  })
})

describe('TF-IDF Weight', () => {
  it('should multiply TF by IDF', () => {
    const tf = new Map([['laravel', 3]])
    const idf = new Map([['laravel', 1.5]])
    const tfidf = computeTFIDF(tf, idf)
    expect(tfidf.get('laravel')).toBeCloseTo(4.5, 2)
  })

  it('should return empty map for terms not in IDF', () => {
    const tf = new Map([['unknown', 1]])
    const idf = new Map([['laravel', 1.5]])
    const tfidf = computeTFIDF(tf, idf)
    expect(tfidf.has('unknown')).toBe(false)
  })
})

// ═══════════════════════════════════════════════════════════
// 3. COSINE SIMILARITY
// ═══════════════════════════════════════════════════════════
import { cosineSimilarity, computeSimilarityScores } from '@/lib/tfidf'

describe('Cosine Similarity', () => {
  it('should return 1 for identical vectors', () => {
    const vec = new Map([
      ['laravel', 2],
      ['php', 1],
    ])
    expect(cosineSimilarity(vec, vec)).toBeCloseTo(1, 2)
  })

  it('should return 0 for orthogonal vectors (no common terms)', () => {
    const vecA = new Map([['laravel', 1]])
    const vecB = new Map([['akuntansi', 1]])
    expect(cosineSimilarity(vecA, vecB)).toBe(0)
  })

  it('should return value between 0 and 1 for partial match', () => {
    const vecA = new Map([
      ['laravel', 2],
      ['php', 1],
      ['mysql', 1],
    ])
    const vecB = new Map([
      ['laravel', 1],
      ['php', 2],
      ['react', 2],
    ])
    const sim = cosineSimilarity(vecA, vecB)
    expect(sim).toBeGreaterThan(0)
    expect(sim).toBeLessThan(1)
  })

  it('should return 0 for empty vector', () => {
    const vecA = new Map()
    const vecB = new Map([['react', 1]])
    expect(cosineSimilarity(vecA, vecB)).toBe(0)
  })
})

describe('End-to-End Similarity Scores', () => {
  it('should return 0 for empty query', () => {
    const scores = computeSimilarityScores([], [['developer'], ['akuntan']])
    expect(scores).toEqual([0, 0])
  })

  it('should return 0 for empty documents', () => {
    const scores = computeSimilarityScores(['developer'], [])
    expect(scores).toEqual([])
  })

  it('should give higher score to matching documents', () => {
    // Query: alumni dengan skill backend
    const query = ['laravel', 'php', 'mysql', 'backend', 'developer']

    // Dokumen 1: lowongan Backend Developer (cocok)
    const doc1 = ['backend', 'developer', 'laravel', 'php', 'mysql', 'fullstack']

    // Dokumen 2: lowongan Akuntan (tidak cocok)
    const doc2 = ['akuntan', 'pajak', 'keuangan', 'laporan']

    const scores = computeSimilarityScores(query, [doc1, doc2])

    // Skor lowongan backend harus lebih tinggi dari lowongan akuntan
    expect(scores[0]).toBeGreaterThan(scores[1])
  })
})

// ═══════════════════════════════════════════════════════════
// 4. LOCATION MATCHING (RULE-BASED)
// ═══════════════════════════════════════════════════════════
// Fungsi rule-based di bawah tetap digunakan sebagai dimensi
// pelengkap TF-IDF untuk menangkap kecocokan lokasi, gaji,
// dan tipe pekerjaan yang bersifat kategorikal.

function normalize(str: string): string {
  return str.toLowerCase().trim()
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

// ═══════════════════════════════════════════════════════════
// 5. SALARY MATCHING (RULE-BASED)
// ═══════════════════════════════════════════════════════════

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
    Math.abs(jRange.min - aRange.max),
  )
  if (gap <= 2) return 0.5
  return 0
}

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

// ═══════════════════════════════════════════════════════════
// 6. TYPE MATCHING (RULE-BASED)
// ═══════════════════════════════════════════════════════════

function matchType(alumniType: string | null, jobType: string): number {
  if (!alumniType) return 0
  return normalize(alumniType) === normalize(jobType) ? 1 : 0
}

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

// ═══════════════════════════════════════════════════════════
// 7. SCORE CALCULATION WITH DYNAMIC WEIGHTS
// ═══════════════════════════════════════════════════════════

const WEIGHTS = {
  skill: 0.4,
  location: 0.2,
  salary: 0.2,
  education: 0.0,
  type: 0.2,
}

interface TestBreakdown {
  skill: number | null
  location: number | null
  salary: number | null
  type: number | null
}

function calculateScore(breakdown: TestBreakdown): number {
  const entries = Object.entries(breakdown).filter(
    ([, v]) => v !== null,
  ) as [keyof typeof WEIGHTS, number][]

  if (entries.length === 0) return 0

  const totalWeight = entries.reduce((sum, [k]) => sum + WEIGHTS[k], 0)

  return entries.reduce((sum, [k, v]) => sum + (v * WEIGHTS[k]) / totalWeight, 0)
}

describe('Score Calculation with Dynamic Weights', () => {
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

// ═══════════════════════════════════════════════════════════
// 8. DOKUMEN BUILDING (INTEGRATION TEST)
// ═══════════════════════════════════════════════════════════

describe('Document Building Integration', () => {
  it('should correctly build profile document from multiple fields', () => {
    // Simulasi data alumni
    const profileFields = {
      education_level: 'S1 Informatika',
      skills: ['Laravel', 'PHP', 'MySQL'],
      bio: 'Backend developer dengan pengalaman 3 tahun',
    }

    const trackRecords = [
      { company: 'PT Teknologi Maju', position: 'Backend Developer' },
      { company: 'Startup Digital', position: 'Full Stack Developer' },
    ]

    const doc = [
      profileFields.education_level,
      profileFields.skills.join(' '),
      profileFields.bio,
      ...trackRecords.map((tr) => [tr.company, tr.position]).flat(),
    ].join(' ')

    const tokens = doc.toLowerCase().split(/\s+/).filter(Boolean)
    expect(tokens).toContain('laravel')
    expect(tokens).toContain('php')
    expect(tokens).toContain('mysql')
    expect(tokens).toContain('backend')
    expect(tokens).toContain('developer')
  })

  it('should correctly build job document', () => {
    // Simulasi data lowongan
    const job = {
      title: 'Backend Developer',
      description:
        'Mengembangkan API menggunakan Laravel dan MySQL. Membangun fitur backend untuk aplikasi perusahaan.',
      skills: ['Laravel', 'PHP', 'MySQL', 'REST API'],
    }

    const doc = [job.title, job.description, job.skills.join(' ')].join(' ')
    const tokens = doc.toLowerCase().split(/\s+/).filter(Boolean)
    expect(tokens).toContain('laravel')
    expect(tokens).toContain('mysql')
    expect(tokens).toContain('backend')
    expect(tokens).toContain('developer')
    expect(tokens).toContain('api')
  })
})
