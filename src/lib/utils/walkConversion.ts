/**
 * Utility functions for converting AI-generated route data to Walk format
 * 
 * These pure functions handle the data transformation from RouteRecommendation
 * to CreateWalkInput, making them easy to test independently.
 */

import type { DifficultyLevel } from '@/types/walk'

/**
 * Parses distance string from AI route (e.g., "2.5 km") to number
 * @param distanceString - String like "2.5 km" or "2.5km"
 * @returns Distance as a number, or 0 if parsing fails
 */
export function parseDistance(distanceString: string): number {
  if (!distanceString) return 0
  
  // Remove 'km' (case insensitive) and trim whitespace
  const numericPart = distanceString.toLowerCase().replace('km', '').trim()
  const parsed = parseFloat(numericPart)
  
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Calculates difficulty based on distance
 * - Easy: < 3km
 * - Moderate: 3-6km
 * - Hard: > 6km
 */
export function calculateDifficulty(distanceKm: number): DifficultyLevel {
  if (distanceKm <= 0 || distanceKm < 3) return 'easy'
  if (distanceKm <= 6) return 'moderate'
  return 'hard'
}

/**
 * Converts duration from seconds to minutes, rounded to nearest minute
 * @param durationSeconds - Duration in seconds from Directions API
 * @returns Duration in minutes, or 0 if undefined
 */
export function formatDuration(durationSeconds: number | undefined): number {
  if (durationSeconds === undefined || durationSeconds === 0) return 0
  return Math.round(durationSeconds / 60)
}
