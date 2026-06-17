import { z } from 'zod'

export const tracerStudySchema = z.object({
  graduation_year: z.coerce.number().min(1990, 'Tahun lulus tidak valid').max(2030, 'Tahun lulus tidak valid'),
  education_level: z.string().min(1, 'Pilih pendidikan terakhir'),
  employment_status: z.string().min(1, 'Pilih status pekerjaan'),
  company: z.string().nullable().optional(),
  position: z.string().nullable().optional(),
  salary_range: z.string().nullable().optional(),
  study_field_match: z.string().nullable().optional(),
  suggestions: z.string().nullable().optional(),
})

export type TracerStudyFormData = z.infer<typeof tracerStudySchema>
