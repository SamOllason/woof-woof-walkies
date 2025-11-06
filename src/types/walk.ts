/**
 * Core type definitions for walks
 */

export type DifficultyLevel = 'easy' | 'moderate' | 'hard'

export interface Walk {
  id: string
  user_id: string
  name: string
  distance_km: number
  duration_minutes: number
  difficulty: DifficultyLevel
  notes?: string
  created_at: string
  updated_at: string
}

/**
 * Form data for creating a new walk
 * (subset of Walk - no id, timestamps, or user_id)
 */
export interface CreateWalkInput {
  name: string
  distance_km: number
  duration_minutes: number
  difficulty: DifficultyLevel
  notes?: string
}
