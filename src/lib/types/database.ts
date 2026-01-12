// lib/types/database.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: string
          school_name: string | null
          school_level: string | null
          class_year: string | null
          institution_name: string | null
          institution_domain: string | null
          created_at: string
          updated_at: string
          last_login: string | null
          writing_mode_preference: string
          language_preference: string
          total_essays_completed: number
          total_theses_completed: number
          average_score: number
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: string
          school_name?: string | null
          school_level?: string | null
          class_year?: string | null
          institution_name?: string | null
          institution_domain?: string | null
          created_at?: string
          updated_at?: string
          last_login?: string | null
          writing_mode_preference?: string
          language_preference?: string
          total_essays_completed?: number
          total_theses_completed?: number
          average_score?: number
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: string
          school_name?: string | null
          school_level?: string | null
          class_year?: string | null
          institution_name?: string | null
          institution_domain?: string | null
          created_at?: string
          updated_at?: string
          last_login?: string | null
          writing_mode_preference?: string
          language_preference?: string
          total_essays_completed?: number
          total_theses_completed?: number
          average_score?: number
        }
      }
      // Add other table types as needed
    }
  }
}