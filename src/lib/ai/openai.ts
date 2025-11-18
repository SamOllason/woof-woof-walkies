import OpenAI from 'openai'
import { HttpsProxyAgent } from 'https-proxy-agent'

// Function to get OpenAI client (lazy initialization)
// This ensures the API key is checked at runtime, not at module load time
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set')
  }
  
  return new OpenAI({
    apiKey: apiKey,
    timeout: 30000, // 30 second timeout
    maxRetries: 2,
  })
}

export interface WalkRecommendation {
  name: string
  distance: string
  difficulty: 'easy' | 'moderate' | 'hard'
  highlights: string
  reason: string
}

/**
 * Generates AI-powered walk recommendations for a given location
 * 
 * @param location - User's location (e.g., "London", "SW1A 1AA", "Hyde Park")
 * @returns Array of 3 walk recommendations
 * 
 * @example
 * const recommendations = await generateWalkRecommendations('London')
 */
export async function generateWalkRecommendations(
  location: string
): Promise<WalkRecommendation[]> {
  // DEVELOPMENT MODE: Use mock data if OPENAI_MOCK_MODE is enabled
  if (process.env.OPENAI_MOCK_MODE === 'true') {
    console.log('🎭 Using mock AI recommendations for development')
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
    
    return [
      {
        name: `${location} Riverside Loop`,
        distance: '3.2km',
        difficulty: 'easy',
        highlights: 'Flat riverside path, 2 water stations, off-leash area at midpoint, beautiful views along the river',
        reason: 'Perfect for dogs who love water and need a relaxed, social walk. Great for all fitness levels.'
      },
      {
        name: `${location} Park Explorer`,
        distance: '4.5km',
        difficulty: 'moderate',
        highlights: 'Mix of paths and grass, shaded areas, dog-friendly cafe halfway, other dogs around',
        reason: 'Ideal for energetic dogs who enjoy variety. The mixed terrain keeps things interesting.'
      },
      {
        name: `${location} Hill Challenge`,
        distance: '5.8km',
        difficulty: 'hard',
        highlights: 'Hilly terrain, spectacular viewpoints, quieter paths, good workout for both dog and owner',
        reason: 'Best for active dogs and owners looking for a challenge. The views make it worth the effort!'
      }
    ]
  }

  // Simple prompt - we'll enhance this later with user history and real POI data
  const prompt = `You are a helpful assistant that suggests dog walking routes.

Location: ${location}

Generate 3 dog walking route recommendations for this location. For each route, provide:
- A creative name for the route
- Estimated distance (e.g., "3.5km", "2 miles")
- Difficulty level (easy, moderate, or hard)
- Key highlights of the route (what makes it special)
- A brief reason why you're recommending it

Format your response as a JSON array with objects containing: name, distance, difficulty, highlights, reason

Example format:
[
  {
    "name": "Riverside Ramble",
    "distance": "3.2km",
    "difficulty": "easy",
    "highlights": "Flat riverside path, 2 water stations, off-leash area at midpoint",
    "reason": "Perfect for dogs who love water and need a relaxed, social walk"
  }
]`

  try {
    console.log('🔵 Attempting OpenAI API call...')
    console.log('🔵 Model: gpt-4o-mini')
    
    // Get OpenAI client with API key validation
    const openai = getOpenAIClient()
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Cost-effective model
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that provides dog walking route recommendations. Always respond with valid JSON only, no markdown formatting.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7, // Some creativity, but not too wild
      max_tokens: 800, // Keep responses concise to control costs
    })

    console.log('✅ OpenAI API call successful!')
    
    const content = response.choices[0]?.message?.content

    if (!content) {
      throw new Error('No response from OpenAI')
    }

    // Parse the JSON response
    // Remove markdown code blocks if present (sometimes GPT adds them)
    const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const recommendations = JSON.parse(cleanContent) as WalkRecommendation[]

    // Validate we got 3 recommendations
    if (!Array.isArray(recommendations) || recommendations.length === 0) {
      throw new Error('Invalid response format from OpenAI')
    }

    return recommendations

  } catch (error) {
    console.error('❌ FULL ERROR DETAILS:', error)
    console.error('❌ Error name:', (error as any)?.name)
    console.error('❌ Error message:', (error as any)?.message)
    console.error('❌ Error status:', (error as any)?.status)
    console.error('❌ Error code:', (error as any)?.code)
    console.error('❌ Error type:', (error as any)?.type)
    console.error('❌ Error cause:', (error as any)?.cause)
    
    // Provide user-friendly error messages
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw new Error('AI service configuration error. Please contact support.')
      }
      if (error.message.includes('quota') || error.message.includes('rate limit')) {
        throw new Error('AI service temporarily unavailable. Please try again in a few minutes.')
      }
      if (error.message.includes('JSON')) {
        throw new Error('Received invalid response from AI service. Please try again.')
      }
    }
    
    throw new Error('Failed to generate recommendations. Please try again.')
  }
}

/**
 * Generate custom walking route with AI + Google Maps integration
 * This uses real POI data to create personalized circular routes
 * 
 * @param location - User's location
 * @param preferences - Route preferences (distance, must-include POIs, etc.)
 * @returns Route with waypoints that can be passed to Directions API
 */
import { geocodeLocation, calculateDistance } from '../maps/geocoding'
import { findAllDogWalkingPOIs } from '../maps/places'
import { getWalkingDirections } from '../maps/directions'
import type { RouteRecommendation, Waypoint } from '@/types/maps'

export interface RoutePreferences {
  targetDistance: number // in meters (e.g., 2000 for 2km)
  mustIncludeCafe?: boolean
  mustIncludePark?: boolean
  preferOffLeash?: boolean
  avoidBusyRoads?: boolean
  circular?: boolean // Start and end at same location (default: true)
}

export async function generateCustomRoute(
  location: string,
  preferences: RoutePreferences
): Promise<RouteRecommendation> {
  try {
    // Step 1: Geocode location
    console.log(`🗺️  Geocoding: ${location}`)
    const geocoded = await geocodeLocation(location)
    console.log(`✅ Found: ${geocoded.formattedAddress}`)

    // Step 2: Find nearby POIs within target distance
    const searchRadius = Math.min(preferences.targetDistance * 1.5, 5000) // Search slightly wider, max 5km
    console.log(`🔍 Searching for POIs within ${searchRadius}m`)
    
    const pois = await findAllDogWalkingPOIs(geocoded.coordinates, searchRadius)
    console.log(`✅ Found ${pois.all.length} POIs (${pois.parks.length} parks, ${pois.cafes.length} cafes)`)

    // Step 3: Ask AI to create intelligent route from available POIs
    console.log('🤖 Asking AI to generate route...')
    
    const prompt = `You are an expert dog walking route planner.

USER LOCATION: ${geocoded.formattedAddress} (${geocoded.coordinates.lat}, ${geocoded.coordinates.lng})

USER REQUIREMENTS:
- Target distance: ${(preferences.targetDistance / 1000).toFixed(1)}km circular walk
${preferences.mustIncludeCafe ? '- Must include a dog-friendly cafe stop' : ''}
${preferences.mustIncludePark ? '- Must include a park visit' : ''}
${preferences.preferOffLeash ? '- Prefer areas with off-leash zones' : ''}
${preferences.avoidBusyRoads ? '- Avoid busy roads where possible' : ''}

AVAILABLE NEARBY PLACES:
${pois.parks.slice(0, 5).map(p => `- ${p.name} (${p.rating ? p.rating + '⭐' : 'No rating'}, ${Math.round(p.distanceFromStart || 0)}m from start, type: park)`).join('\n')}
${pois.cafes.slice(0, 3).map(p => `- ${p.name} (${p.rating ? p.rating + '⭐' : 'No rating'}, ${Math.round(p.distanceFromStart || 0)}m from start, type: cafe)`).join('\n')}

TASK:
Create a circular walking route that:
1. Starts and ends at the user's location
2. Visits 2-3 of the places listed above
3. Total distance approximately ${(preferences.targetDistance / 1000).toFixed(1)}km
4. Respects user preferences (cafe, park, off-leash, etc.)

Choose places strategically to create an efficient route without backtracking.

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "routeName": "Descriptive name for the route",
  "waypoints": [
    {"lat": ${geocoded.coordinates.lat}, "lng": ${geocoded.coordinates.lng}, "name": "Start", "type": "start"},
    {"lat": 51.3489, "lng": -2.2501, "name": "Place Name", "type": "poi"},
    {"lat": ${geocoded.coordinates.lat}, "lng": ${geocoded.coordinates.lng}, "name": "End", "type": "end"}
  ],
  "estimatedDistance": "2.1km",
  "highlights": "Brief description of what makes this route great",
  "dogFriendlyNotes": "Specific dog-related information"
}`

    const openai = getOpenAIClient()
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful dog walking route planner. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from AI')
    }

    // Parse AI response
    const routeData = JSON.parse(content) as RouteRecommendation
    console.log(`✅ AI generated route: ${routeData.routeName}`)

    // Step 4: Get actual walking directions from Google
    console.log('🗺️  Calculating walking directions...')
    const directions = await getWalkingDirections(routeData.waypoints)
    console.log(`✅ Route: ${directions.distance}m, ${Math.round(directions.duration / 60)} mins`)

    return {
      ...routeData,
      directions
    }

  } catch (error) {
    console.error('❌ Route generation failed:', error)
    
    if (error instanceof Error) {
      // Pass through specific errors
      if (error.message.includes('not found') || error.message.includes('Geocod')) {
        throw error
      }
    }
    
    throw new Error('Failed to generate custom route. Please try again.')
  }
}
