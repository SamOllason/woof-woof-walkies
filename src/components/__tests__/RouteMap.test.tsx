import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import RouteMap from '../RouteMap'
import type { Waypoint } from '@/types/maps'

// Mock global google object for Maps API
;(global as any).google = {
  maps: {
    geometry: {
      encoding: {
        decodePath: vi.fn(() => []),
      },
    },
    Polyline: vi.fn(function() {
      return {
        setMap: vi.fn(),
      }
    }),
  },
}

// Mock the Google Maps React library
// Note: @vis.gl/react-google-maps doesn't export Polyline component
// Routes are typically drawn using DirectionsRenderer
vi.mock('@vis.gl/react-google-maps', () => ({
  APIProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="api-provider">{children}</div>,
  Map: ({ children, defaultCenter, defaultZoom }: any) => (
    <div 
      data-testid="google-map" 
      data-center={JSON.stringify(defaultCenter)}
      data-zoom={defaultZoom}
    >
      {children}
    </div>
  ),
  Marker: ({ position, title, label }: any) => (
    <div 
      data-testid="map-marker" 
      data-position={JSON.stringify(position)}
      data-title={title}
      data-label={label}
    />
  ),
  useMap: () => ({
    // Mock map object that RoutePolyline needs
    setCenter: vi.fn(),
    setZoom: vi.fn(),
  }),
}))

describe('RouteMap', () => {
  const mockWaypoints: Waypoint[] = [
    {
      lat: 51.3478,
      lng: -2.2514,
      name: 'Bradford on Avon Town Centre',
      type: 'start',
    },
    {
      lat: 51.3495,
      lng: -2.2540,
      name: 'Barton Farm Country Park',
      type: 'poi',
    },
    {
      lat: 51.3485,
      lng: -2.2505,
      name: 'The Shambles Cafe',
      type: 'poi',
    },
    {
      lat: 51.3478,
      lng: -2.2514,
      name: 'Bradford on Avon Town Centre',
      type: 'end',
    },
  ]

  // Mock environment variable
  beforeEach(() => {
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = 'test-api-key'
  })

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  })

  describe('Rendering', () => {
    it('renders the Google Maps API provider', () => {
      render(<RouteMap waypoints={mockWaypoints} />)
      
      expect(screen.getByTestId('api-provider')).toBeInTheDocument()
    })

    it('renders a Google Map component', () => {
      render(<RouteMap waypoints={mockWaypoints} />)
      
      expect(screen.getByTestId('google-map')).toBeInTheDocument()
    })

    it('sets map center to the midpoint of the route', () => {
      render(<RouteMap waypoints={mockWaypoints} />)
      
      const map = screen.getByTestId('google-map')
      const center = JSON.parse(map.getAttribute('data-center') || '{}')
      
      // Center should be roughly in the middle of the waypoints
      expect(center.lat).toBeCloseTo(51.3478, 2)
      expect(center.lng).toBeCloseTo(-2.2514, 2)
    })

    it('sets appropriate default zoom level', () => {
      render(<RouteMap waypoints={mockWaypoints} />)
      
      const map = screen.getByTestId('google-map')
      const zoom = parseInt(map.getAttribute('data-zoom') || '0')
      
      expect(zoom).toBeGreaterThanOrEqual(12)
      expect(zoom).toBeLessThanOrEqual(15)
    })

    it('renders markers for all waypoints', () => {
      render(<RouteMap waypoints={mockWaypoints} />)
      
      const markers = screen.getAllByTestId('map-marker')
      expect(markers).toHaveLength(mockWaypoints.length)
    })

    it('displays waypoint names as marker titles', () => {
      render(<RouteMap waypoints={mockWaypoints} />)
      
      const markers = screen.getAllByTestId('map-marker')
      
      markers.forEach((marker, index) => {
        expect(marker.getAttribute('data-title')).toBe(mockWaypoints[index].name)
      })
    })

    it('displays numbered marker labels for all waypoints', () => {
      render(<RouteMap waypoints={mockWaypoints} />)
      
      const markers = screen.getAllByTestId('map-marker')
      
      // All markers should have numbered labels (1, 2, 3, 4)
      expect(markers[0].getAttribute('data-label')).toBe('1')
      expect(markers[1].getAttribute('data-label')).toBe('2')
      expect(markers[2].getAttribute('data-label')).toBe('3')
      expect(markers[3].getAttribute('data-label')).toBe('4')
      
      // Middle waypoints (type: 'poi') should have numbers
      expect(markers[1].getAttribute('data-label')).toBe('2')
      expect(markers[2].getAttribute('data-label')).toBe('3')
    })
  })

  describe('Empty States', () => {
    it('renders nothing when waypoints array is empty', () => {
      const { container } = render(<RouteMap waypoints={[]} />)
      
      expect(screen.queryByTestId('google-map')).not.toBeInTheDocument()
      expect(container).toBeEmptyDOMElement()
    })

    it('handles single waypoint gracefully', () => {
      const singleWaypoint: Waypoint[] = [
        {
          lat: 51.3478,
          lng: -2.2514,
          name: 'Bradford on Avon',
          type: 'start',
        },
      ]

      render(<RouteMap waypoints={singleWaypoint} />)
      
      // Should still render map and marker
      expect(screen.getByTestId('google-map')).toBeInTheDocument()
      expect(screen.getByTestId('map-marker')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has semantic container element', () => {
      const { container } = render(<RouteMap waypoints={mockWaypoints} />)
      
      const mapContainer = container.querySelector('[role="region"]') || 
                          container.querySelector('section')
      
      expect(mapContainer).toBeTruthy()
    })

    it('sets appropriate ARIA label for the map', () => {
      const { container } = render(<RouteMap waypoints={mockWaypoints} />)
      
      const mapContainer = container.querySelector('[aria-label*="route"]') ||
                          container.querySelector('[aria-label*="map"]')
      
      expect(mapContainer).toBeTruthy()
    })
  })

  describe('Responsive Design', () => {
    it('has full width on mobile', () => {
      const { container } = render(<RouteMap waypoints={mockWaypoints} />)
      
      const mapContainer = container.firstChild as HTMLElement
      expect(mapContainer?.className).toMatch(/w-full/)
    })

    it('has appropriate height for viewing', () => {
      const { container } = render(<RouteMap waypoints={mockWaypoints} />)
      
      const mapContainer = container.firstChild as HTMLElement
      // Should have inline height style (default 400px)
      expect(mapContainer?.style.height).toBe('400px')
    })

    it('has rounded corners matching design system', () => {
      const { container } = render(<RouteMap waypoints={mockWaypoints} />)
      
      const mapContainer = container.firstChild as HTMLElement
      expect(mapContainer?.className).toMatch(/rounded/)
    })
  })

  describe('Custom Height Prop', () => {
    it('applies custom height when provided', () => {
      const { container } = render(<RouteMap waypoints={mockWaypoints} height="500px" />)
      
      const mapContainer = container.firstChild as HTMLElement
      expect(mapContainer?.style.height).toBe('500px')
    })

    it('uses default height when not provided', () => {
      const { container } = render(<RouteMap waypoints={mockWaypoints} />)
      
      const mapContainer = container.firstChild as HTMLElement
      // Should have some height set (either via className or style)
      expect(
        mapContainer?.className.includes('h-') || 
        mapContainer?.style.height
      ).toBeTruthy()
    })
  })

  describe('Error Handling', () => {
    it('logs error and renders nothing if API key is missing', () => {
      delete process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const { container } = render(<RouteMap waypoints={mockWaypoints} />)
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Google Maps API key')
      )
      expect(container).toBeEmptyDOMElement()
      
      consoleSpy.mockRestore()
    })
  })

  describe('Waypoint Types', () => {
    it('uses sequential numbers for all waypoints on map', () => {
      render(<RouteMap waypoints={mockWaypoints} />)
      
      const markers = screen.getAllByTestId('map-marker')
      // All markers numbered sequentially
      expect(markers[0].getAttribute('data-label')).toBe('1')
      expect(markers[1].getAttribute('data-label')).toBe('2')
      expect(markers[2].getAttribute('data-label')).toBe('3')
      expect(markers[3].getAttribute('data-label')).toBe('4')
    })

    it('shows numbered markers for cafe waypoints', () => {
      const waypointsWithCafe: Waypoint[] = [
        { lat: 51.3478, lng: -2.2514, name: 'Start', type: 'start' },
        { lat: 51.3495, lng: -2.2540, name: 'Dog-Friendly Cafe', type: 'poi', category: 'cafe' },
        { lat: 51.3478, lng: -2.2514, name: 'End', type: 'end' },
      ]

      render(<RouteMap waypoints={waypointsWithCafe} />)
      
      const markers = screen.getAllByTestId('map-marker')
      // Cafe marker should have number 2
      expect(markers[1].getAttribute('data-label')).toBe('2')
    })

    it('shows numbered markers for park waypoints', () => {
      const waypointsWithPark: Waypoint[] = [
        { lat: 51.3478, lng: -2.2514, name: 'Start', type: 'start' },
        { lat: 51.3495, lng: -2.2540, name: 'Local Park', type: 'poi', category: 'park' },
        { lat: 51.3478, lng: -2.2514, name: 'End', type: 'end' },
      ]

      render(<RouteMap waypoints={waypointsWithPark} />)
      
      const markers = screen.getAllByTestId('map-marker')
      // Park marker should have number 2
      expect(markers[1].getAttribute('data-label')).toBe('2')
    })

    it('shows POI markers for intermediate waypoints', () => {
      render(<RouteMap waypoints={mockWaypoints} />)
      
      const markers = screen.getAllByTestId('map-marker')
      // Should have start + 2 POIs + end = 4 markers
      expect(markers).toHaveLength(4)
    })
  })

  describe('Map Bounds', () => {
    it('calculates bounds to fit all waypoints', () => {
      render(<RouteMap waypoints={mockWaypoints} />)
      
      const map = screen.getByTestId('google-map')
      const center = JSON.parse(map.getAttribute('data-center') || '{}')
      
      // Center should be within the bounds of all waypoints
      const lats = mockWaypoints.map(w => w.lat)
      const lngs = mockWaypoints.map(w => w.lng)
      
      expect(center.lat).toBeGreaterThanOrEqual(Math.min(...lats))
      expect(center.lat).toBeLessThanOrEqual(Math.max(...lats))
      expect(center.lng).toBeGreaterThanOrEqual(Math.min(...lngs))
      expect(center.lng).toBeLessThanOrEqual(Math.max(...lngs))
    })
  })
})
