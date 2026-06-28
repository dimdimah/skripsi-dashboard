// FILE: types/database.ts

export type AppRole = 'super_user' | 'user'

export interface Profile {
  id: string
  email: string
  role: AppRole
  full_name: string | null
  nim: string | null
  tanggal_lahir: string | null
  phone: string | null
  bio: string | null
  skills: string[] | null
  location: string | null
  education_level: string | null
  expected_salary: string | null
  preferred_type: string | null
  created_at: string
  updated_at: string
}

// ─── Track Record (Riwayat Kerja) ───
export interface TrackRecord {
  id: string
  user_id: string
  company: string
  position: string
  start_date: string
  end_date: string | null
  description: string | null
  is_current: boolean
  idempotency_key: string | null
  created_at: string
  updated_at: string
}

// ─── Tracer Study ───
export interface TracerStudyResponse {
  id: string
  user_id: string
  graduation_year: number
  education_level: string
  employment_status: string
  company: string | null
  position: string | null
  salary_range: string | null
  study_field_match: string | null
  suggestions: string | null
  submitted_at: string
  updated_at: string
}

export interface TracerStudyQuestion {
  id: string
  question_text: string
  question_type: 'text' | 'textarea' | 'select' | 'radio' | 'number'
  options: string[] | null
  is_active: boolean
  display_order: number
  angkatan: string | null
  created_at: string
  updated_at: string
}

// ─── Jobs (Lowongan Kerja) ───
export interface Job {
  id: string
  title: string
  company: string
  location: string
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship'
  salary: string | null
  description: string
  skills: string[]
  contact_info: string | null
  url: string
  source: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// ─── Matching (Content-Based Filtering + Collaborative Filtering) ───
export interface MatchBreakdown {
  skill: number | null
  location: number | null
  salary: number | null
  education: number | null
  type: number | null
  cf: number | null  // Collaborative Filtering score (Jaccard-based)
}

export interface MatchResult {
  job: Job
  score: number
  breakdown: MatchBreakdown
  confidence: 'high' | 'medium' | 'low'
  availableFeatures: number
  totalFeatures: number
}

// ─── Database type helper ───
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      track_records: {
        Row: TrackRecord
        Insert: Omit<TrackRecord, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<TrackRecord, 'id' | 'user_id' | 'created_at'>>
      }
      tracer_study_responses: {
        Row: TracerStudyResponse
        Insert: Omit<TracerStudyResponse, 'id' | 'submitted_at' | 'updated_at'>
        Update: Partial<Omit<TracerStudyResponse, 'id' | 'user_id' | 'submitted_at'>>
      }
      tracer_study_questions: {
        Row: TracerStudyQuestion
        Insert: Omit<TracerStudyQuestion, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<TracerStudyQuestion, 'id' | 'created_at'>>
      }
      jobs: {
        Row: Job
        Insert: Omit<Job, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Job, 'id' | 'created_at'>>
      }
    }
    Enums: {
      app_role: AppRole
    }
  }
}
