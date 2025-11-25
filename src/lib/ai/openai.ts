import OpenAI from 'openai'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { geocodeLocation } from '@/lib/maps/geocoding'
import { findAllDogWalkingPOIs } from '@/lib/maps/places'
import { getWalkingDirections } from '@/lib/maps/directions'
import type { RouteRecommendation, Waypoint } from '@/types/maps'

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
 * Route preferences for custom route generation
 */
export interface RoutePreferences {
  distance: number // Target distance in kilometers
  mustInclude?: string[] // Required POI types: 'cafe', 'dog_park', etc.
  preferences?: string[] // Nice-to-have features: 'off-leash', 'shaded', 'scenic'
  circular?: boolean // Default: true
}

/**
 * Generates a custom dog walking route using AI + Google Maps APIs
 * 
 * This function orchestrates multiple APIs to create personalized routes:
 * 1. Geocoding API: Converts location text to coordinates
 * 2. Places API: Finds nearby dog-friendly POIs
 * 3. OpenAI: Intelligently selects and sequences waypoints
 * 4. Directions API: Calculates the actual walking route
 * 
 * @param location - Starting location (e.g., "Bradford on Avon", "SW1A 1AA")
 * @param preferences - Route customization options
 * @returns Complete route with directions, distance, and waypoints
 * 
 * @example
 * const route = await generateCustomRoute('Bradford on Avon', {
 *   distance: 2,
 *   mustInclude: ['cafe'],
 *   preferences: ['off-leash', 'scenic'],
 *   circular: true
 * })
 */
export async function generateCustomRoute(
  location: string,
  preferences: RoutePreferences
): Promise<RouteRecommendation> {
  try {
    // Step 1: Geocode the location to get coordinates
    console.log(`📍 Step 1: Geocoding "${location}"...`)
    const geocodeResult = await geocodeLocation(location)
    const startCoords = geocodeResult.coordinates
    console.log(`✅ Location found: ${geocodeResult.formattedAddress}`)

    // Step 2: Find nearby dog-walking POIs
    // Search radius based on desired distance (add 50% buffer)
    const searchRadius = preferences.distance * 1000 * 1.5 // km → meters + buffer
    console.log(`🔍 Step 2: Finding POIs within ${searchRadius}m...`)
    
    const pois = await findAllDogWalkingPOIs(startCoords, searchRadius)
    console.log(`✅ Found ${pois.all.length} potential waypoints`)

    // Step 3: Use OpenAI to intelligently select and sequence waypoints
    console.log('🤖 Step 3: AI selecting optimal waypoints...')
    const aiWaypoints = await generateWaypointsWithAI(
      startCoords,
      pois.all,
      preferences,
      geocodeResult.formattedAddress
    )
    console.log(`✅ AI selected ${aiWaypoints.length} waypoints`)

    // Step 4: Get walking directions from Google Directions API
    console.log('🗺️  Step 4: Calculating walking route...')
    const directions = await getWalkingDirections(aiWaypoints)
    console.log(`✅ Route calculated: ${directions.distance}m, ${directions.duration}s`)

    // Step 5: Build the complete route recommendation
    const route: RouteRecommendation = {
      routeName: generateRouteName(aiWaypoints, preferences),
      waypoints: aiWaypoints,
      estimatedDistance: `${(directions.distance / 1000).toFixed(1)}km`,
      highlights: generateHighlights(aiWaypoints, preferences),
      directions: directions, // Include full directions for map display
    }

    return route

  } catch (error) {
    console.error('❌ Error generating custom route:', error)
    
    if (error instanceof Error) {
      // Pass through specific error messages
      if (error.message.includes('not found') || error.message.includes('Geocoding')) {
        throw new Error(`Could not find location: ${location}. Please try a more specific address.`)
      }
      if (error.message.includes('No places found')) {
        throw new Error('No suitable walking locations found nearby. Try a different area.')
      }
      if (error.message.includes('AI service')) {
        throw error // Already user-friendly
      }
    }
    
    throw new Error('Failed to generate custom route. Please try again.')
  }
}

/**
 * Uses OpenAI to select and sequence waypoints for an optimal route
 * 
 * The AI considers:
 * - Desired distance (creates circular route matching target)
 * - Must-include POIs (ensures cafe/dog park is included)
 * - User preferences (prioritizes off-leash areas, shade, etc.)
 * - Efficient sequencing (minimizes backtracking)
 */
async function generateWaypointsWithAI(
  startCoords: { lat: number; lng: number },
  availablePOIs: Array<{ placeId: string; name: string; location: { lat: number; lng: number }; types: string[]; rating?: number; distanceFromStart?: number }>,
  preferences: RoutePreferences,
  locationName: string
): Promise<Waypoint[]> {
  // Shuffle POIs using Fisher-Yates algorithm for proper randomization
  // This ensures "Show Me Another" generates different routes even with same preferences
  const shuffledPOIs = [...availablePOIs]
  for (let i = shuffledPOIs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledPOIs[i], shuffledPOIs[j]] = [shuffledPOIs[j], shuffledPOIs[i]]
  }
  
  // Format POI data for AI prompt
  const poisSummary = shuffledPOIs
    .slice(0, 20) // Limit to top 20 to keep prompt size reasonable
    .map((poi, index) => {
      const distance = poi.distanceFromStart 
        ? `${(poi.distanceFromStart / 1000).toFixed(1)}km away`
        : 'nearby'
      const rating = poi.rating ? `★${poi.rating}` : ''
      const types = poi.types.join(', ')
      
      return `${index + 1}. "${poi.name}" (${types}) - ${distance} ${rating}
   Location: ${poi.location.lat}, ${poi.location.lng}
   PlaceID: ${poi.placeId}`
    })
    .join('\n')

  // Create a lookup map for placeIds by coordinates
  const placeIdMap = new Map<string, string>()
  shuffledPOIs.forEach(poi => {
    const key = `${poi.location.lat.toFixed(6)},${poi.location.lng.toFixed(6)}`
    placeIdMap.set(key, poi.placeId)
  })

  const mustIncludeText = preferences.mustInclude?.length 
    ? `\nMUST INCLUDE: ${preferences.mustInclude.join(', ')}`
    : ''
  
  const preferencesText = preferences.preferences?.length
    ? `\nPREFERRED FEATURES: ${preferences.preferences.join(', ')}`
    : ''

  // Check if user wants completely off-road routes
  const offRoadRequirement = preferences.preferences?.includes('off-road')
    ? '\n⚠️ IMPORTANT: User wants COMPLETELY OFF-ROAD route. Avoid busy roads, narrow verges, and traffic. Prioritize parks, trails, and pedestrian paths.'
    : ''

  const prompt = `You are an expert at designing dog walking routes.

TASK: Create a ${preferences.circular !== false ? 'circular' : 'point-to-point'} dog walking route.

STARTING POINT: ${locationName}
Coordinates: ${startCoords.lat}, ${startCoords.lng}

TARGET DISTANCE: ${preferences.distance}km (±10% is acceptable)${mustIncludeText}${preferencesText}${offRoadRequirement}

AVAILABLE PLACES NEARBY:
${poisSummary}

INSTRUCTIONS:
1. Select 2-4 waypoints that create a route close to ${preferences.distance}km
2. The route should start and end at the starting point (circular)
3. Include any MUST INCLUDE locations if available
4. Prioritize PREFERRED FEATURES when choosing locations
5. Sequence waypoints efficiently (no backtracking)
6. Consider variety (mix of parks, water, cafes, etc.)

OUTPUT FORMAT (JSON only, no markdown):
{
  "waypoints": [
    {"lat": ${startCoords.lat}, "lng": ${startCoords.lng}, "name": "Start", "type": "start"},
    {"lat": 51.xxx, "lng": -2.xxx, "name": "Place Name", "type": "poi", "category": "cafe|park|dog_park|water|other", "placeId": "ChIJ..."},
    ...
    {"lat": ${startCoords.lat}, "lng": ${startCoords.lng}, "name": "End", "type": "end"}
  ],
  "reasoning": "Brief explanation of route choices"
}

IMPORTANT: 
- Set category field for each POI: cafe, dog_park, park, water, or other
- Include the placeId from the POI list above for each waypoint
`

  const openai = getOpenAIClient()
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are an expert dog walking route planner. Respond with valid JSON only.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.9, // Higher temperature for more varied route suggestions
    max_tokens: 1000,
  })

  const content = response.choices[0]?.message?.content
  if (!content) {
    throw new Error('No response from AI service')
  }

  // Parse AI response
  const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const aiResponse = JSON.parse(cleanContent) as { waypoints: Waypoint[]; reasoning: string }

  console.log(`🤖 AI reasoning: ${aiResponse.reasoning}`)

  // Validate waypoints
  if (!aiResponse.waypoints || aiResponse.waypoints.length < 2) {
    throw new Error('AI generated invalid waypoints')
  }

  // Enrich waypoints with placeIds if missing (fallback lookup by coordinates)
  const enrichedWaypoints = aiResponse.waypoints.map(waypoint => {
    if (waypoint.placeId || waypoint.type === 'start' || waypoint.type === 'end') {
      return waypoint
    }
    
    // Try to find placeId by matching coordinates
    const key = `${waypoint.lat.toFixed(6)},${waypoint.lng.toFixed(6)}`
    const placeId = placeIdMap.get(key)
    
    if (placeId) {
      return { ...waypoint, placeId }
    }
    
    return waypoint
  })

  return enrichedWaypoints
}

/**
 * Generates a descriptive route name based on waypoints
 */
function generateRouteName(waypoints: Waypoint[], preferences: RoutePreferences): string {
  // Extract notable waypoint names (skip Start/End)
  const notableWaypoints = waypoints
    .filter(w => w.name !== 'Start' && w.name !== 'End')
    .map(w => w.name)

  if (notableWaypoints.length === 0) {
    return `${preferences.distance}km Circular Walk`
  }

  // Use first notable waypoint in name
  const firstPlace = notableWaypoints[0].split(' ').slice(0, 2).join(' ') // Shorten long names
  return `${firstPlace} Loop (${preferences.distance}km)`
}

/**
 * Generates route highlights text
 */
function generateHighlights(waypoints: Waypoint[], preferences: RoutePreferences): string {
  const features: string[] = []
  
  // Extract waypoint names
  const places = waypoints
    .filter(w => w.name !== 'Start' && w.name !== 'End')
    .map(w => w.name)
  
  if (places.length > 0) {
    features.push(`Via ${places.join(', ')}`)
  }
  
  if (preferences.mustInclude?.includes('cafe')) {
    features.push('Dog-friendly cafe stop')
  }
  
  if (preferences.preferences?.includes('off-leash')) {
    features.push('Off-leash areas')
  }
  
  if (preferences.preferences?.includes('scenic')) {
    features.push('Scenic views')
  }
  
  return features.join(' • ') || 'Circular dog walking route'
}
