export const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'] as const
export type JobType = (typeof JOB_TYPES)[number]

export const EMPLOYMENT_STATUSES = [
  'Bekerja',
  'Belum Bekerja',
  'Wirausaha',
  'Melanjutkan Studi',
  'Tidak bekerja / Mencari pekerjaan',
] as const
export type EmploymentStatus = (typeof EMPLOYMENT_STATUSES)[number]

export const EDUCATION_LEVELS = ['SMA', 'D3', 'D4', 'S1', 'S2', 'S3'] as const
export type EducationLevel = (typeof EDUCATION_LEVELS)[number]

export const SALARY_RANGES = [
  { value: '< 3 juta', label: '< Rp 3.000.000' },
  { value: '3-5 juta', label: 'Rp 3.000.000 - Rp 5.000.000' },
  { value: '5-10 juta', label: 'Rp 5.000.000 - Rp 10.000.000' },
  { value: '10-20 juta', label: 'Rp 10.000.000 - Rp 20.000.000' },
  { value: '> 20 juta', label: '> Rp 20.000.000' },
] as const

export const FIELD_MATCH_OPTIONS = [
  'Sangat Sesuai',
  'Sesuai',
  'Kurang Sesuai',
  'Tidak Sesuai',
] as const
