'use server'

import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/types/database'

export async function exportAlumniToExcel(): Promise<string> {
  const XLSX = await import('xlsx-js-style')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single() as { data: { role: string } | null; error: unknown }

  if (profile?.role !== 'super_user') throw new Error('Forbidden')

  const { data } = await supabase
    .from('profiles')
    .select('email, full_name, nim, role, phone, created_at')
    .order('created_at', { ascending: false })

  const profiles = (data || []) as Pick<Profile, 'email' | 'full_name' | 'nim' | 'role' | 'phone' | 'created_at'>[]

  const rows = profiles.map(p => ({
    'Email': p.email,
    'Nama': p.full_name || '',
    'NIM': p.nim || '',
    'Role': p.role === 'super_user' ? 'Super User' : 'User',
    'Telepon': p.phone || '',
    'Bergabung': p.created_at ? new Date(p.created_at).toLocaleDateString('id-ID') : '',
  }))

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Alumni')

  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:F1')
  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: C })
      if (!ws[cellRef]) continue
      const cell = ws[cellRef] as any
      if (R === 0) {
        cell.s = {
          fill: { patternType: 'solid', fgColor: { rgb: 'FF7E22CE' } },
          font: { color: { rgb: 'FFFFFFFF' }, bold: true },
          alignment: { horizontal: 'center', vertical: 'center', wrapText: 1 },
          border: {
            top: { style: 'thin', color: { rgb: 'FF000000' } },
            bottom: { style: 'thin', color: { rgb: 'FF000000' } },
            left: { style: 'thin', color: { rgb: 'FF000000' } },
            right: { style: 'thin', color: { rgb: 'FF000000' } },
          },
        }
      } else {
        cell.s = {
          alignment: { vertical: 'center', wrapText: 1 },
          border: {
            top: { style: 'thin', color: { rgb: 'FF000000' } },
            bottom: { style: 'thin', color: { rgb: 'FF000000' } },
            left: { style: 'thin', color: { rgb: 'FF000000' } },
            right: { style: 'thin', color: { rgb: 'FF000000' } },
          },
        }
      }
    }
  }

  ws['!cols'] = [
    { wch: 30 }, { wch: 25 }, { wch: 15 }, { wch: 12 }, { wch: 20 }, { wch: 15 }
  ]
  ws['!freeze'] = { xSplit: 0, ySplit: 1, topLeftCell: 'A2' }

  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' })
  return Buffer.from(buffer).toString('base64')
}

export async function exportQuestionsToExcel(angkatan: string): Promise<string> {
  const XLSX = await import('xlsx-js-style')

  const supabase = await createClient()
  const { data } = await supabase
    .from('tracer_study_questions')
    .select('id, question_text, question_type, options, is_active, display_order, angkatan')
    .eq('angkatan', angkatan)
    .order('display_order', { ascending: true })

  const questions = (data || []) as {
    id: string
    question_text: string
    question_type: string
    options: string[] | null
    is_active: boolean
    display_order: number
  }[]

  const rows = questions.map(q => ({
    'No.': q.display_order,
    'Pertanyaan': q.question_text,
    'Tipe': q.question_type,
    'Opsi': q.options ? q.options.join(', ') : '',
    'Status': q.is_active ? 'Aktif' : 'Nonaktif',
  }))

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, `Pertanyaan ${angkatan}`)

  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:E1')
  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: C })
      if (!ws[cellRef]) continue
      const cell = ws[cellRef] as any
      if (R === 0) {
        cell.s = {
          fill: { patternType: 'solid', fgColor: { rgb: 'FF7E22CE' } },
          font: { color: { rgb: 'FFFFFFFF' }, bold: true },
          alignment: { horizontal: 'center', vertical: 'center', wrapText: 1 },
          border: {
            top: { style: 'thin', color: { rgb: 'FF000000' } },
            bottom: { style: 'thin', color: { rgb: 'FF000000' } },
            left: { style: 'thin', color: { rgb: 'FF000000' } },
            right: { style: 'thin', color: { rgb: 'FF000000' } },
          },
        }
      } else {
        cell.s = {
          alignment: { vertical: 'center', wrapText: 1 },
          border: {
            top: { style: 'thin', color: { rgb: 'FF000000' } },
            bottom: { style: 'thin', color: { rgb: 'FF000000' } },
            left: { style: 'thin', color: { rgb: 'FF000000' } },
            right: { style: 'thin', color: { rgb: 'FF000000' } },
          },
        }
      }
    }
  }

  ws['!cols'] = [
    { wch: 8 }, { wch: 50 }, { wch: 20 }, { wch: 60 }, { wch: 12 }
  ]
  ws['!freeze'] = { xSplit: 0, ySplit: 1, topLeftCell: 'A2' }

  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' })
  return Buffer.from(buffer).toString('base64')
}