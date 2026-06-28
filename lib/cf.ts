// ─────────────────────────────────────────────────────────────
// Collaborative Filtering Engine (User-Based, Jaccard Similarity)
// ─────────────────────────────────────────────────────────────
// Modul ini berisi pure functions (tanpa I/O) untuk:
//   1. Menghitung kemiripan antar user (Jaccard)
//   2. Mengagregasi sinyal dari similar users → skor per lowongan

// ─── Tipe Input ────────────────────────────────────────────────
export interface UserSignal {
  userId: string
  skills: string[]        // dari profiles.skills
  positions: string[]     // dari track_records.position
}

export interface JobSignal {
  jobId: string
  title: string
  skills: string[]        // dari jobs.skills
}

// ─── 1. Jaccard Similarity ─────────────────────────────────────
// Mengukur overlap antara dua set skills.
// Nilai: 0.0 (tidak ada overlap) hingga 1.0 (identik).
export function jaccardSimilarity(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 0
  const setA = new Set(a.map((s) => s.toLowerCase()))
  const setB = new Set(b.map((s) => s.toLowerCase()))
  let intersection = 0
  for (const item of setA) {
    if (setB.has(item)) intersection++
  }
  const union = new Set([...setA, ...setB]).size
  return union === 0 ? 0 : intersection / union
}

// ─── 2. Cari Similar Users ─────────────────────────────────────
// Kembalikan daftar user lain beserta skor kemiripannya,
// diurutkan dari yang paling mirip, ambil top-K.
export function findSimilarUsers(
  targetUserId: string,
  targetSkills: string[],
  allUsers: UserSignal[],
  topK: number = 20,
): Array<{ userId: string; similarity: number }> {
  return allUsers
    .filter((u) => u.userId !== targetUserId)
    .map((u) => ({
      userId: u.userId,
      similarity: jaccardSimilarity(targetSkills, u.skills),
    }))
    .filter((u) => u.similarity > 0)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK)
}

// ─── 3. Hitung CF Score per Lowongan ──────────────────────────
// Logika:
//   - Kumpulkan semua posisi yang pernah diisi similar users
//     (dibobot oleh similarity mereka)
//   - Untuk setiap lowongan, cek apakah title/skills overlap
//     dengan posisi-posisi tersebut
//   - Normalisasi ke [0, 1]
export function computeCFScores(
  similarUsers: Array<{ userId: string; similarity: number }>,
  allUsers: UserSignal[],
  jobs: JobSignal[],
): Map<string, number> {
  if (similarUsers.length === 0) {
    return new Map(jobs.map((j) => [j.jobId, 0]))
  }

  // Buat lookup userId → similarity
  const simMap = new Map(similarUsers.map((u) => [u.userId, u.similarity]))

  // Aggregate: posisi → bobot kumulatif
  const positionWeight = new Map<string, number>()
  for (const user of allUsers) {
    const sim = simMap.get(user.userId)
    if (sim === undefined) continue
    for (const pos of user.positions) {
      const key = pos.toLowerCase()
      positionWeight.set(key, (positionWeight.get(key) ?? 0) + sim)
    }
  }

  if (positionWeight.size === 0) {
    return new Map(jobs.map((j) => [j.jobId, 0]))
  }

  // Nilai maksimum untuk normalisasi
  const maxWeight = Math.max(...positionWeight.values())

  // Hitung skor per lowongan
  const scores = new Map<string, number>()
  for (const job of jobs) {
    const titleTokens = job.title.toLowerCase().split(/\s+/)
    const skillTokens = job.skills.map((s) => s.toLowerCase())
    const jobTerms = new Set([...titleTokens, ...skillTokens])

    let best = 0
    for (const [pos, weight] of positionWeight) {
      const posTerms = pos.split(/\s+/)
      const hasOverlap = posTerms.some((t) => jobTerms.has(t))
      if (hasOverlap) {
        best = Math.max(best, weight / maxWeight)
      }
    }
    scores.set(job.jobId, best)
  }

  return scores
}
