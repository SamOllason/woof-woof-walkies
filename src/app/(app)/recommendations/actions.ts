'use server'

import { createClient } from '@/lib/supabase/server'
import { generateWalkRecommendations, generateCustomRoute, WalkRecommendation, RoutePreferences } from '@/lib/ai/openai'
import type { RouteRecommendation } from '@/types/maps'
import type { Walk } from '@/types/walk'
import { parseDistance, calculateDifficulty, formatDuration } from '@/lib/utils/walkConversion'

export async function getRecommendationsAction(
  location: string
): Promise<WalkRecommendation[]> {
  // Check feature flag
  if (process.env.AI_RECOMMENDATIONS_ENABLED !== 'true') {
    throw new Error('AI recommendations are currently unavailable. Please try again later.')
  }

  // Validate user is authenticated
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('You must be logged in to get recommendations.')
  }

  // Validate location input
  if (!location || location.trim().length === 0) {
    throw new Error('Please enter a location.')
  }

  if (location.trim().length < 2) {
    throw new Error('Please enter a valid location.')
  }

  // Generate recommendations using OpenAI
  try {
    const recommendations = await generateWalkRecommendations(location.trim())
    return recommendations
  } catch (error) {
    // Error is already user-friendly from the utility function
    throw error
  }
}

/**
 * Server Action to generate a custom walking route using AI + Google Maps
 * 
 * Orchestrates: Geocoding → Places → OpenAI → Directions APIs
 * Cost: ~$0.04 per route generation
 */
export async function generateCustomRouteAction(
  location: string,
  preferences: RoutePreferences
): Promise<RouteRecommendation> {
  // Check feature flag
  if (process.env.AI_RECOMMENDATIONS_ENABLED !== 'true') {
    throw new Error('AI route generation is currently unavailable. Please try again later.')
  }

  // Validate user is authenticated
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('You must be logged in to generate custom routes.')
  }

  // Validate location input
  if (!location || location.trim().length === 0) {
    throw new Error('Please enter a location.')
  }

  if (location.trim().length < 2) {
    throw new Error('Please enter a valid location.')
  }

  // Validate distance
  if (preferences.distance < 1 || preferences.distance > 10) {
    throw new Error('Distance must be between 1 and 10 kilometers.')
  }

  // Generate custom route using AI + Maps APIs
  try {
    const route = await generateCustomRoute(location.trim(), preferences)
    return route
  } catch (error) {
    // Error is already user-friendly from the utility function
    throw error
  }
}

/**
 * Server Action to save an AI-generated route as a walk
 * 
 * Converts RouteRecommendation data to Walk format and saves to database.
 * Uses utility functions for data transformation (parseDistance, calculateDifficulty, formatDuration).
 */
export async function saveGeneratedWalkAction(route: RouteRecommendation): Promise<Walk> {
  // Validate user is authenticated
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('You must be logged in to save walks')
  }

  // Convert route data to walk format using utility functions
  const distanceKm = parseDistance(route.estimatedDistance)
  
  // Calculate duration: use directions if available, otherwise estimate from distance
  // Average walking speed ~5km/h = 12 min per km
  const durationMinutes = route.directions 
    ? formatDuration(route.directions.duration)
    : Math.round(distanceKm * 12)

  const walkData = {
    name: route.routeName,
    distance_km: distanceKm,
    duration_minutes: durationMinutes,
    difficulty: calculateDifficulty(distanceKm),
    notes: route.highlights || '',
    user_id: user.id,
  }

  // Insert into database
  const { data, error } = await supabase
    .from('walks')
    .insert(walkData)
    .select()
    .single()

  if (error) {
    console.error('Error saving walk:', error)
    throw new Error('Failed to save walk: ' + error.message)
  }

  return data as Walk
}

/**
 * Server Action to save a basic AI recommendation as a walk
 * 
 * Converts WalkRecommendation (basic AI recommendation) to Walk format and saves to database.
 * Basic recommendations have less detailed data than custom routes.
 */
export async function saveBasicRecommendationAction(
  recommendation: WalkRecommendation, 
  location: string
): Promise<Walk> {
  // Validate user is authenticated
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('You must be logged in to save walks')
  }

  // Convert basic recommendation data to walk format
  const distanceKm = parseDistance(recommendation.distance)
  
  // Estimate duration from distance (~5km/h = 12 min per km)
  const durationMinutes = Math.round(distanceKm * 12)

  // Map basic difficulty to our DifficultyLevel type
  const difficultyMap: Record<string, 'easy' | 'moderate' | 'hard'> = {
    easy: 'easy',
    moderate: 'moderate',
    hard: 'hard',
  }
  const difficulty = difficultyMap[recommendation.difficulty] || 'moderate'

  const walkData = {
    name: recommendation.name,
    distance_km: distanceKm,
    duration_minutes: durationMinutes,
    difficulty: difficulty,
    notes: `Location: ${location}\n\nHighlights: ${recommendation.highlights}\n\nWhy this route: ${recommendation.reason}`,
    user_id: user.id,
  }

  // Insert into database
  const { data, error } = await supabase
    .from('walks')
    .insert(walkData)
    .select()
    .single()

  if (error) {
    console.error('Error saving basic recommendation:', error)
    throw new Error('Failed to save walk: ' + error.message)
  }

  return data as Walk
}
