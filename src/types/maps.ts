/**
 * Type definitions for Google Maps API responses and data structures
 */

// Geocoding API types
export interface Coordinates {
  lat: number
  lng: number
}

export interface GeocodeResult {
  coordinates: Coordinates
  formattedAddress: string
  placeId?: string
}

// Places API types
export interface Place {
  placeId: string
  name: string
  location: Coordinates
  vicinity: string // Short address
  rating?: number
  userRatingsTotal?: number
  types: string[] // e.g., ['park', 'point_of_interest']
  openingHours?: {
    openNow: boolean
  }
  distanceFromStart?: number // Calculated distance in meters
}

export interface NearbySearchParams {
  location: Coordinates
  radius: number // In meters (max 50000)
  type?: string // e.g., 'park', 'cafe', 'restaurant'
  keyword?: string // e.g., 'dog friendly', 'dog park'
}

// Directions API types
export interface Waypoint {
  lat: number
  lng: number
  name: string
  type?: 'start' | 'end' | 'poi' | 'waypoint'
  category?: 'cafe' | 'park' | 'dog_park' | 'water' | 'other' // Optional: POI category for visual distinction
  placeId?: string // Optional: Google Place ID for linking to Google Maps
}

export interface DirectionsResult {
  distance: number // Total distance in meters
  duration: number // Total duration in seconds
  startAddress: string
  endAddress: string
  waypoints: Waypoint[]
  overviewPolyline: string // Encoded polyline for map display
  steps: DirectionStep[]
}

export interface DirectionStep {
  distance: number // In meters
  duration: number // In seconds
  instruction: string // HTML instructions (e.g., "Turn <b>left</b> onto Main St")
  startLocation: Coordinates
  endLocation: Coordinates
  polyline: string // Encoded polyline for this step
}

// Combined route recommendation type
export interface RouteRecommendation {
  routeName: string
  waypoints: Waypoint[]
  estimatedDistance: string // e.g., "2.1km"
  highlights: string
  dogFriendlyNotes?: string
  directions?: DirectionsResult // Optional: calculated route
}
