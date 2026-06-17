import { z } from 'zod'

export const profileSchema = z.object({
  full_name: z.string().min(1, 'Nama lengkap wajib diisi'),
  phone: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  nim: z.string().nullable().optional(),
  tanggal_lahir: z.string().nullable().optional(),
  skills: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  education_level: z.string().nullable().optional(),
  expected_salary: z.string().nullable().optional(),
  preferred_type: z.string().nullable().optional(),
})

export type ProfileFormData = z.infer<typeof profileSchema>

export const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Password saat ini wajib diisi'),
  new_password: z.string().min(6, 'Password baru minimal 6 karakter'),
  confirm_password: z.string().min(1, 'Konfirmasi password wajib diisi'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: 'Konfirmasi password tidak cocok',
  path: ['confirm_password'],
})

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
