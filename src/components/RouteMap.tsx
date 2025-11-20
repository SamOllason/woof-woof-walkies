'use client'

import { useEffect, useRef, useState } from 'react'
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'
import type { RouteRecommendation } from '@/types/maps'

interface RouteMapProps {
  route: RouteRecommendation
}

/**
 * RouteMap component - Displays a Google Map with route polyline and waypoint markers
 * 
 * Features:
 * - Displays route path from Directions API
 * - Shows numbered markers for each waypoint
 * - Auto-fits bounds to show entire route
 * - Responsive map container
 * 
 * Requires NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in environment variables
 */
export default function RouteMap({ route }: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [error, setError] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Google Maps API key must be public (NEXT_PUBLIC_) for client-side use
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      setError('Google Maps API key not configured')
      setIsLoading(false)
      return
    }

    if (!mapRef.current) {
      return
    }

    // Initialize Google Maps with new functional API
    setOptions({
      key: apiKey,
      v: 'weekly',
    })

    async function initMap() {
      try {
        // Import the maps library
        await importLibrary('maps')
        // Import geometry library for polyline decoding
        await importLibrary('geometry')
        
        if (!mapRef.current) return

        // Create map centered on first waypoint
        const center = {
          lat: route.waypoints[0].lat,
          lng: route.waypoints[0].lng,
        }

        const mapInstance = new window.google.maps.Map(mapRef.current, {
          center,
          zoom: 13,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
        })

        setMap(mapInstance)
        setIsLoading(false)

        // Draw route polyline if directions are available
        if (route.directions?.overviewPolyline) {
          const decodedPath = window.google.maps.geometry.encoding.decodePath(
            route.directions.overviewPolyline
          )

          const polyline = new window.google.maps.Polyline({
            path: decodedPath,
            geodesic: true,
            strokeColor: '#2563eb', // blue-600
            strokeOpacity: 0.8,
            strokeWeight: 4,
          })

          polyline.setMap(mapInstance)

          // Fit map to show entire route
          const bounds = new window.google.maps.LatLngBounds()
          decodedPath.forEach((point: google.maps.LatLng) => bounds.extend(point))
          mapInstance.fitBounds(bounds)
        }

        // Add numbered markers for each waypoint
        route.waypoints.forEach((waypoint, index) => {
          // Determine marker color
          let backgroundColor = '#3b82f6' // blue-500 for regular waypoints
          if (index === 0) {
            backgroundColor = '#22c55e' // green-500 for start
          } else if (index === route.waypoints.length - 1) {
            backgroundColor = '#ef4444' // red-500 for end
          }

          // Create custom marker with number
          const marker = new window.google.maps.Marker({
            position: { lat: waypoint.lat, lng: waypoint.lng },
            map: mapInstance,
            title: waypoint.name,
            label: {
              text: `${index + 1}`,
              color: 'white',
              fontWeight: 'bold',
            },
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 12,
              fillColor: backgroundColor,
              fillOpacity: 1,
              strokeColor: 'white',
              strokeWeight: 2,
            },
          })

          // Add info window on click
          const infoWindow = new window.google.maps.InfoWindow({
            content: `<div style="padding: 8px;">
              <strong>${waypoint.name}</strong>
              ${index === 0 ? '<br/><em>Start</em>' : ''}
              ${index === route.waypoints.length - 1 ? '<br/><em>End</em>' : ''}
            </div>`,
          })

          marker.addListener('click', () => {
            infoWindow.open(mapInstance, marker)
          })
        })
      } catch (err) {
        console.error('Error loading Google Maps:', err)
        setError('Failed to load map. Please try again.')
        setIsLoading(false)
      }
    }

    initMap()
  }, [route])

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-red-600">
        <p className="font-semibold">Map Error</p>
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-gray-100">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-2 text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
      <div
        ref={mapRef}
        className="h-[400px] w-full rounded-lg border border-gray-300"
        aria-label="Route map"
      />
    </div>
  )
}
