'use client'

import { APIProvider, Map, Marker, useMap } from '@vis.gl/react-google-maps'
import { useEffect } from 'react'
import type { Waypoint, DirectionsResult } from '@/types/maps'

interface RouteMapProps {
  waypoints: Waypoint[]
  directions?: DirectionsResult // Optional: actual route polyline from Directions API
  height?: string
}

/**
 * Component to draw polyline on the map
 * Uses the encoded polyline from Google Directions API for accurate walking routes
 */
function RoutePolyline({ directions, waypoints }: { directions?: DirectionsResult; waypoints: Waypoint[] }) {
  const map = useMap()

  useEffect(() => {
    if (!map || waypoints.length < 2) return
    
    // Wait for geometry library to load
    if (!google.maps.geometry?.encoding) {
      console.warn('Google Maps geometry library not loaded yet')
      return
    }

    let polyline: google.maps.Polyline

    if (directions?.overviewPolyline) {
      // Use the actual walking route polyline from Directions API
      const decodedPath = google.maps.geometry.encoding.decodePath(directions.overviewPolyline)
      
      polyline = new google.maps.Polyline({
        path: decodedPath,
        geodesic: true,
        strokeColor: '#2563eb', // blue-600
        strokeOpacity: 0.8,
        strokeWeight: 4,
      })
    } else {
      // Fallback: Draw straight lines between waypoints if no directions available
      const path = waypoints.map(wp => ({ lat: wp.lat, lng: wp.lng }))
      
      polyline = new google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: '#2563eb', // blue-600
        strokeOpacity: 0.8,
        strokeWeight: 4,
      })
    }

    polyline.setMap(map)

    // Cleanup: remove polyline when component unmounts
    return () => {
      polyline.setMap(null)
    }
  }, [map, directions, waypoints])

  return null
}

/**
 * RouteMap component displays a Google Map with waypoints and route polyline
 * 
 * Features:
 * - Displays actual walking route from Google Directions API (not straight lines!)
 * - Shows numbered markers for waypoints
 * - Auto-centers and zooms to fit all waypoints
 * - Responsive design matching app design system
 * 
 * @param waypoints - Array of waypoint objects with lat, lng, name, and type
 * @param directions - Optional DirectionsResult with encoded polyline for actual walking route
 * @param height - Optional custom height (defaults to 400px)
 */
export default function RouteMap({ waypoints, directions, height = '400px' }: RouteMapProps) {
  // Validate API key
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    console.error('Google Maps API key is missing. Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local')
    return null
  }

  // Don't render if no waypoints
  if (waypoints.length === 0) {
    return null
  }

  // Calculate map center (midpoint of all waypoints)
  // This ensures the entire route is visible
  const centerLat = waypoints.reduce((sum, wp) => sum + wp.lat, 0) / waypoints.length
  const centerLng = waypoints.reduce((sum, wp) => sum + wp.lng, 0) / waypoints.length

  const center = {
    lat: centerLat,
    lng: centerLng,
  }

  // Set zoom level based on route spread
  // Tighter routes get higher zoom, wider routes get lower zoom
  const latSpread = Math.max(...waypoints.map(w => w.lat)) - Math.min(...waypoints.map(w => w.lat))
  const lngSpread = Math.max(...waypoints.map(w => w.lng)) - Math.min(...waypoints.map(w => w.lng))
  const maxSpread = Math.max(latSpread, lngSpread)
  
  // Dynamic zoom: smaller spread = higher zoom
  // Typical walking routes (2-5km) will be 13-14 zoom
  const zoom = maxSpread < 0.01 ? 15 : maxSpread < 0.05 ? 14 : 13

  return (
    <section 
      className="w-full rounded-lg overflow-hidden border border-gray-300"
      style={{ height }}
      role="region"
      aria-label="Interactive map showing dog walking route"
    >
      <APIProvider apiKey={apiKey} libraries={['geometry']}>
        <Map
          defaultCenter={center}
          defaultZoom={zoom}
          gestureHandling="greedy"
          disableDefaultUI={false}
        >
          {/* Draw polyline connecting waypoints using actual walking route */}
          <RoutePolyline directions={directions} waypoints={waypoints} />

          {/* Render markers for each waypoint */}
          {waypoints.map((waypoint, index) => {
            // Use numbers for all markers on the map for clarity
            const label = (index + 1).toString()

            return (
              <Marker
                key={`${waypoint.lat}-${waypoint.lng}-${index}`}
                position={{ lat: waypoint.lat, lng: waypoint.lng }}
                title={waypoint.name}
                label={label}
              />
            )
          })}
        </Map>
      </APIProvider>
    </section>
  )
}
