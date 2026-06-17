'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  result.push(current.trim())
  return result
}

const rowSchema = z.object({
  email: z.string().email('Email tidak valid').endsWith('@amikomsolo.ac.id', 'Hanya email @amikomsolo.ac.id'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  display_name: z.string().min(1, 'Nama wajib diisi'),
  role: z.enum(['user', 'super_user']).default('user'),
  skills: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  education_level: z.string().nullable().optional(),
  expected_salary: z.string().nullable().optional(),
  preferred_type: z.string().nullable().optional(),
})

export interface BulkImportResult {
  total: number
  success: number
  failed: number
  errors: { row: number; message: string }[]
}

export async function bulkImportUsers(raw: string): Promise<BulkImportResult> {
  const lines = raw.trim().split('\n').filter(Boolean)
  if (lines.length < 2) {
    return { total: 0, success: 0, failed: 0, errors: [{ row: 0, message: 'Data kosong atau hanya header. Pastikan ada minimal 1 baris data.' }] }
  }

  const adminSupabase = createAdminClient()
  const result: BulkImportResult = { total: 0, success: 0, failed: 0, errors: [] }

  // Parse header
  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase())
  const nameIdx = headers.findIndex(h => h === 'nama' || h === 'name' || h === 'display_name')
  const emailIdx = headers.findIndex(h => h === 'email')
  const passwordIdx = headers.findIndex(h => h === 'password' || h === 'pass')
  const roleIdx = headers.findIndex(h => h === 'role' || h === 'roles')
  const skillsIdx = headers.findIndex(h => h === 'skills' || h === 'skill')
  const locationIdx = headers.findIndex(h => h === 'location' || h === 'lokasi')
  const educationIdx = headers.findIndex(h => h === 'education level' || h === 'education_level' || h === 'pendidikan')
  const salaryIdx = headers.findIndex(h => h === 'expected salary' || h === 'expected_salary' || h === 'gaji')
  const typeIdx = headers.findIndex(h => h === 'preferred type' || h === 'preferred_type' || h === 'tipe')

  if (emailIdx === -1 || passwordIdx === -1 || nameIdx === -1) {
    return {
      total: 0, success: 0, failed: 0,
      errors: [{ row: 0, message: 'Header wajib: Nama, Email, Password. Opsional: Role, Skills, Location, Education Level, Expected Salary, Preferred Type' }],
    }
  }

  const dataLines = lines.slice(1)
  result.total = dataLines.length

  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i]
    const cols = parseCSVLine(line)
    const rowNum = i + 2 // 1-indexed + header row

    const display_name = cols[nameIdx] || ''
    const email = cols[emailIdx] || ''
    const password = cols[passwordIdx] || ''
    const role = roleIdx !== -1 ? (cols[roleIdx] || 'user') : 'user'
    const skills = skillsIdx !== -1 ? (cols[skillsIdx] || null) : null
    const location = locationIdx !== -1 ? (cols[locationIdx] || null) : null
    const education_level = educationIdx !== -1 ? (cols[educationIdx] || null) : null
    const expected_salary = salaryIdx !== -1 ? (cols[salaryIdx] || null) : null
    const preferred_type = typeIdx !== -1 ? (cols[typeIdx] || null) : null

    const parsed = rowSchema.safeParse({ email, password, display_name, role, skills, location, education_level, expected_salary, preferred_type })
    if (!parsed.success) {
      result.failed++
      result.errors.push({ row: rowNum, message: parsed.error.issues.map(e => e.message).join(', ') })
      continue
    }

    try {
      const { data: userData, error } = await adminSupabase.auth.admin.createUser({
        email: parsed.data.email,
        password: parsed.data.password,
        email_confirm: true,
        user_metadata: {
          display_name: parsed.data.display_name,
          role: parsed.data.role,
        },
      })

      if (error) {
        result.failed++
        result.errors.push({ row: rowNum, message: error.message })
      } else if (userData?.user) {
        const skillsArray = parsed.data.skills
          ? parsed.data.skills.split(/[,;]/).map(s => s.trim()).filter(Boolean)
          : []

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: profileError } = await (adminSupabase
          .from('profiles') as any)
          .update({
            full_name: parsed.data.display_name,
            role: parsed.data.role,
            skills: skillsArray,
            location: parsed.data.location,
            education_level: parsed.data.education_level,
            expected_salary: parsed.data.expected_salary,
            preferred_type: parsed.data.preferred_type,
          })
          .eq('id', userData.user.id)

        if (profileError) {
          result.success++
          result.errors.push({ row: rowNum, message: `User dibuat tapi gagal update profil: ${profileError.message}` })
        } else {
          result.success++
        }
      }
    } catch (err) {
      result.failed++
      result.errors.push({ row: rowNum, message: err instanceof Error ? err.message : 'Unknown error' })
    }
  }

  revalidatePath('/super-user/users')
  revalidatePath('/admin/bulk-import')

  return result
}
