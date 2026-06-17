import { z } from 'zod'

export const trackRecordSchema = z.object({
  company: z.string().min(1, 'Nama perusahaan wajib diisi'),
  position: z.string().min(1, 'Posisi/jabatan wajib diisi'),
  start_date: z.string().min(1, 'Tanggal mulai wajib diisi'),
  end_date: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  is_current: z.boolean().default(false),
})

export type TrackRecordFormData = z.infer<typeof trackRecordSchema>
