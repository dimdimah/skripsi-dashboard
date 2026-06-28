'use server'

import { createClient } from '@/lib/supabase/server'
import type { Profile, Job, MatchResult, MatchBreakdown, TrackRecord } from '@/types/database'
import { preprocess } from '@/lib/preprocessing'
import { computeSimilarityScores } from '@/lib/tfidf'
import { findSimilarUsers, computeCFScores, type UserSignal, type JobSignal } from '@/lib/cf'

// ─── Bobot setiap dimensi kemiripan ─────────────────────
// CF (Collaborative Filtering) mengisi slot education yang
// sebelumnya tidak terpakai (bobot 0.0).
const WEIGHTS = {
  skill: 0.35,
  location: 0.15,
  salary: 0.15,
  education: 0.0,
  type: 0.15,
  cf: 0.2,
}

// ─── Helper: normalisasi string ─────────────────────────
function normalize(str: string): string {
  return str.toLowerCase().trim()
}

// ─── Fungsi Pembobotan Tambahan ─────────────────────────
// Selain TF-IDF untuk konten teks, tiga fungsi di bawah
// menggunakan aturan heuristik (rule-based) untuk menangkap
// dimensi yang bersifat kategorikal atau numerik, di mana
// pendekatan vektor TF-IDF kurang sesuai.

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
    Math.abs(jRange.min - aRange.max),
  )
  if (gap <= 2) return 0.5
  return 0
}

function matchType(alumniType: string | null, jobType: string): number {
  if (!alumniType) return 0
  return normalize(alumniType) === normalize(jobType) ? 1 : 0
}

/**
 * ─── Membangun Dokumen Teks Profil Alumni ───────────────
 * Menggabungkan field-field berikut menjadi satu string
 * dokumen untuk diproses TF-IDF:
 *   - education_level (program studi / pendidikan terakhir)
 *   - skills (keahlian yang dimiliki)
 *   - bio (deskripsi diri)
 *   - Track records: company + position (riwayat pekerjaan)
 *
 * Semakin lengkap data alumni, semakin akurat dokumen
 * yang dihasilkan, dan semakin relevan rekomendasinya.
 */
function buildProfileDocument(profile: Profile, trackRecords: TrackRecord[]): string {
  const parts: string[] = []

  if (profile.education_level) parts.push(profile.education_level)
  if (Array.isArray(profile.skills) && profile.skills.length > 0) {
    parts.push(profile.skills.join(' '))
  }
  if (profile.bio) parts.push(profile.bio)

  for (const tr of trackRecords) {
    if (tr.company) parts.push(tr.company)
    if (tr.position) parts.push(tr.position)
  }

  return parts.join(' ')
}

/**
 * ─── Membangun Dokumen Teks Lowongan Pekerjaan ─────────
 * Menggabungkan field-field lowongan menjadi satu string
 * dokumen:
 *   - title (judul posisi)
 *   - description (deskripsi pekerjaan)
 *   - skills (keahlian yang dibutuhkan)
 */
function buildJobDocument(job: Job): string {
  const parts: string[] = [job.title, job.description]
  if (Array.isArray(job.skills) && job.skills.length > 0) {
    parts.push(job.skills.join(' '))
  }
  return parts.join(' ')
}

/**
 * ─── Menghitung Breakdown Kemiripan ─────────────────────
 * Untuk setiap pasangan (alumni, lowongan), hitung skor
 * di setiap dimensi:
 *
 *   skill    → TF-IDF Cosine Similarity (dokumen teks)
 *   location → Rule-based heuristics
 *   salary   → Rule-based range overlap
 *   type     → Exact match
 *   education→ (cadangan, saat ini 0)
 *
 * Dimensi skill adalah dimensi terpenting karena menjadi
 * inti dari Content-Based Filtering: membandingkan konten
 * teks profil alumni dengan deskripsi lowongan untuk
 * menemukan kecocokan semantik-terstruktur.
 */
function calculateBreakdown(
  profile: Profile,
  job: Job,
  skillScore: number,
  cfScore: number,
): MatchBreakdown {
  return {
    skill: skillScore,
    location: matchLocation(profile.location, job.location),
    salary: matchSalary(profile.expected_salary, job.salary),
    education: null,
    type: matchType(profile.preferred_type, job.type),
    cf: cfScore > 0 ? cfScore : null,
  }
}

/**
 * ─── Menghitung Skor Akhir dengan Redistribusi Bobot ───
 *
 * Jika suatu dimensi tidak tersedia (null), bobotnya
 * didistribusikan ulang ke dimensi lain yang tersedia.
 * Ini memastikan skor tetap fair meskipun data alumni
 * belum lengkap.
 *
 * Contoh: jika alumni belum mengisi lokasi, bobot 0.2
 * dari lokasi akan ditambahkan ke skill (0.4 → 0.6),
 * sehingga skor tetap dihitung dari data yang ada.
 */
function calculateScore(breakdown: MatchBreakdown): {
  score: number
  confidence: 'high' | 'medium' | 'low'
  available: number
} {
  const entries = Object.entries(breakdown).filter(
    ([, v]) => v !== null,
  ) as [keyof MatchBreakdown, number][]

  const totalFeatures = Object.keys(WEIGHTS).length
  const available = entries.length

  if (available === 0) return { score: 0, confidence: 'low', available: 0 }

  const totalWeight = entries.reduce((sum, [k]) => sum + WEIGHTS[k], 0)

  const score = entries.reduce(
    (sum, [k, v]) => sum + (v * WEIGHTS[k]) / totalWeight,
    0,
  )

  let confidence: 'high' | 'medium' | 'low' = 'low'
  if (available >= 5) confidence = 'high'
  else if (available >= 3) confidence = 'medium'

  return { score, confidence, available }
}

/**
 * ─── Mendapatkan Rekomendasi Lowongan ───────────────────
 *
 * Alur lengkap Content-Based Filtering:
 *
 * 1.  Ambil data profil alumni yang sedang login
 * 2.  Ambil semua track record milik alumni
 * 3.  Ambil semua lowongan aktif
 * 4.  Bangun dokumen teks profil alumni
 * 5.  Bangun dokumen teks untuk setiap lowongan
 * 6.  Preprocessing: case folding → cleaning → tokenization
 *     → stopword removal
 * 7.  Hitung TF-IDF untuk semua dokumen (query + koleksi)
 * 8.  Hitung Cosine Similarity antara profil dan setiap
 *     lowongan → skor skill (0.0 - 1.0)
 * 9.  Hitung skor lokasi, gaji, tipe (rule-based)
 * 10. Gabungkan semua skor dengan bobot yang sudah
 *     ditentukan (dengan redistribusi jika ada data null)
 * 11. Urutkan dari skor tertinggi ke terendah
 * 12. Ambil Top-N hasil
 */
export async function getJobRecommendations(
  limit: number = 10,
): Promise<MatchResult[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('User tidak terautentikasi')

  const [
    { data: profile },
    { data: trackRecords },
    { data: jobs },
    { data: allProfiles },
    { data: allTrackRecords },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('track_records').select('*').eq('user_id', user.id),
    supabase.from('jobs').select('*').eq('is_active', true),
    supabase.from('profiles').select('id, skills').eq('role', 'user').neq('id', user.id),
    supabase.from('track_records').select('user_id, position'),
  ])

  if (!profile) throw new Error('Profil alumni tidak ditemukan')
  if (!jobs || jobs.length === 0) throw new Error('Tidak ada lowongan aktif. Total lowongan di database: 0')

  const typedProfile = profile as Profile
  const typedTrackRecords = (trackRecords || []) as TrackRecord[]
  const typedJobs = jobs as Job[]

  // ─── CBF: TF-IDF scoring ────────────────────────────────
  const profileRaw = buildProfileDocument(typedProfile, typedTrackRecords)
  const profileTokens = preprocess(profileRaw)
  const jobTokens = typedJobs.map((job) => preprocess(buildJobDocument(job)))
  const skillScores = computeSimilarityScores(profileTokens, jobTokens)

  // ─── CF: Jaccard-based scoring ─────────────────────────
  const positionsByUser = new Map<string, string[]>()
  for (const tr of (allTrackRecords || []) as { user_id: string; position: string }[]) {
    if (!tr.position) continue
    const list = positionsByUser.get(tr.user_id) ?? []
    list.push(tr.position)
    positionsByUser.set(tr.user_id, list)
  }

  const userSignals: UserSignal[] = (
    (allProfiles || []) as { id: string; skills: string[] | null }[]
  ).map((p) => ({
    userId: p.id,
    skills: p.skills ?? [],
    positions: positionsByUser.get(p.id) ?? [],
  }))

  const jobSignals: JobSignal[] = typedJobs.map((j) => ({
    jobId: j.id,
    title: j.title,
    skills: j.skills,
  }))

  const similarUsers = findSimilarUsers(user.id, typedProfile.skills ?? [], userSignals)
  const cfScores = computeCFScores(similarUsers, userSignals, jobSignals)

  // ─── Hybrid: gabungkan CBF + CF ────────────────────────
  const results: MatchResult[] = typedJobs.map((job, i) => {
    const cfScore = cfScores.get(job.id) ?? 0
    const breakdown = calculateBreakdown(typedProfile, job, skillScores[i], cfScore)
    const { score, confidence, available } = calculateScore(breakdown)

    return {
      job,
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

/**
 * ─── Statistik Kelengkapan Profil untuk Matching ────────
 * Digunakan di halaman admin untuk menampilkan seberapa
 * banyak alumni yang sudah melengkapi data untuk keperluan
 * rekomendasi lowongan.
 */
export async function getMatchingStats(): Promise<{
  totalAlumni: number
  withSkills: number
  withLocation: number
  withSalary: number
  withType: number
  completeProfile: number
}> {
  const supabase = await createClient()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('skills, location, expected_salary, preferred_type')
    .eq('role', 'user') as { data: { skills: string[] | null; location: string | null; expected_salary: string | null; preferred_type: string | null }[] | null }

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
