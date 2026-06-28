import type { Database } from '@/types/database'

type Tables = Database['public']['Tables']

export type RowOf<T extends keyof Tables> = Tables[T]['Row']
export type InsertOf<T extends keyof Tables> = Tables[T]['Insert']
export type UpdateOf<T extends keyof Tables> = Tables[T]['Update']
