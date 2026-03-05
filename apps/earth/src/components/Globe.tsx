import React, { useEffect, useRef, useMemo, useState, useLayoutEffect } from 'react'
import ReactGlobe from 'react-globe.gl'
import * as THREE from 'three'
import { DisasterEvent } from '@/lib/types'

interface GlobeProps {
  events: DisasterEvent[]
  onEventClick?: (event: DisasterEvent) => void
  isRotating: boolean
  focusedEventId?: string | null
}

interface GlobePoint {
  lat: number
  lng: number
  size: number
  color: string
  event: DisasterEvent
}

interface Arc {
  startLat: number
  startLng: number
  endLat: number
  endLng: number
  color: string
}

const CATEGORY_COLORS: Record<string, string> = {
  wildfires: '#ff3c00',
  volcanoes: '#ff8c00',
  severeStorms: '#00d2ff',
  iceberg: '#ffffff',
  seaLakeIce: '#a0d8f1',
  default: '#888888'
}

const CATEGORY_SIZES: Record<string, number> = {
  wildfires: 0.8,
  volcanoes: 0.6,
  severeStorms: 1.0,
  iceberg: 0.3,
  seaLakeIce: 0.4,
  default: 0.5
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export const Globe = React.memo(function Globe({ events, onEventClick, isRotating, focusedEventId }: GlobeProps) {
  const globeEl = useRef<any>(null)

  // cap number of points to avoid O(N^2) arc calculations and render cost
  const pointsData = useMemo<GlobePoint[]>(() => {
    const filtered = events
      .filter(event => event.geometry && event.geometry.length > 0)
      // optionally sort or slice if too many
    if (filtered.length > 1200) {
      filtered.length = 1200
    }
    return filtered.map(event => {
      const coords = event.geometry[0].coordinates
      const categoryId = event.categories[0]?.id || 'default'
      return {
        lat: coords[1],
        lng: coords[0],
        size: CATEGORY_SIZES[categoryId] || CATEGORY_SIZES.default,
        color: CATEGORY_COLORS[categoryId] || CATEGORY_COLORS.default,
        event
      }
    })
  }, [events])

  const arcsData = useMemo<Arc[]>(() => {
    const arcs: Arc[] = []
    const maxDistance = 8000
    const maxArcs = 50
    const n = pointsData.length
    if (n < 2) return arcs

    // if there are too many points, skip arcs entirely for performance
    if (n > 800) return arcs

    const limit = Math.min(n, 1200)
    for (let i = 0; i < limit && arcs.length < maxArcs; i++) {
      const point1 = pointsData[i]
      for (let j = i + 1; j < limit && arcs.length < maxArcs; j++) {
        const point2 = pointsData[j]
        const distance = calculateDistance(point1.lat, point1.lng, point2.lat, point2.lng)
        if (distance < maxDistance && distance > 500) {
          const sameCategory = point1.event.categories[0]?.id === point2.event.categories[0]?.id
          if (sameCategory || Math.random() > 0.85) {
            const color = sameCategory ? point1.color : '#ffffff'
            const opacity = sameCategory ? '0.6' : '0.3'
            arcs.push({
              startLat: point1.lat,
              startLng: point1.lng,
              endLat: point2.lat,
              endLng: point2.lng,
              color: color.startsWith('#') ? `${color}${Math.floor(parseFloat(opacity) * 255).toString(16).padStart(2, '0')}` : `rgba(255, 255, 255, ${opacity})`
            })
          }
        }
      }
    }
    return arcs
  }, [pointsData])

  useEffect(() => {
    const globe = globeEl.current
    if (!globe) return

    const controls = globe.controls()
    controls.autoRotate = isRotating
    controls.autoRotateSpeed = 0.5
    controls.enableZoom = true
    controls.minDistance = 150
    controls.maxDistance = 500

    globe.pointOfView({ altitude: 2.5 }, 0)
  }, [isRotating])

  useEffect(() => {
    if (!globeEl.current || !focusedEventId) return

    const focusedPoint = pointsData.find(p => p.event.id === focusedEventId)
    if (focusedPoint) {
      globeEl.current.pointOfView(
        { 
          lat: focusedPoint.lat, 
          lng: focusedPoint.lng, 
          altitude: 1.5 
        },
        1000
      )
    }
  }, [focusedEventId, pointsData])

  // debug: log number of objects in scene when events change (to catch leaks)
  useLayoutEffect(() => {
    const globe = globeEl.current
    if (globe && globe.scene && Array.isArray(globe.scene.children)) {
      // remove everything except grid/country groups *before* react-globe updates
      globe.scene.children = globe.scene.children.filter((c: any) => c.userData?.isGrid || c.userData?.isCountry)
      console.log('scene children after events update:', globe.scene.children.length)
    }
  }, [events, pointsData, arcsData])

  // ensure the globe canvas resizes when the window changes size
  useEffect(() => {
    const handleResize = () => {
      const globe = globeEl.current
      if (!globe || !globe.renderer || !globe.el) return

      const { offsetWidth: w, offsetHeight: h } = globe.el
      globe.renderer.setSize(w, h)
      globe.camera.aspect = w / h
      globe.camera.updateProjectionMatrix()
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // utility to convert latitude/longitude into a point on sphere of radius 1
  const latLngToVector = (lat: number, lng: number) => {
    const phi = (90 - lat) * (Math.PI / 180)
    const theta = (lng + 180) * (Math.PI / 180)
    return {
      x: Math.sin(phi) * Math.cos(theta),
      y: Math.cos(phi),
      z: Math.sin(phi) * Math.sin(theta)
    }
  }

  const handleGlobeReady = (globe: any) => {
    if (!globe || !globe.scene) return
    const scene = globe.scene

    // if gridGroup already exists we assume initialization done
    if (gridGroupRef.current) {
      globeRef.current = globe
      return
    }

    // create a group to hold grid lines
    const gridGroup = new THREE.Group()
    gridGroup.userData.isGrid = true
    gridGroupRef.current = gridGroup
    scene.add(gridGroup)

    // also add a group for country borders
    const countryGroup = new THREE.Group()
    countryGroup.userData.isCountry = true
    countryGroupRef.current = countryGroup
    scene.add(countryGroup)

    // draw cream-coloured grid lines every 15 degrees
    // offset grid slightly above the globe surface so it isn't hidden by the globe texture
    const gridMat = new THREE.LineBasicMaterial({ color: '#FFF5E1', opacity: 0.6, transparent: true, linewidth: 1 })
    const radius = globe.globeRadius() || 1
    const offset = 1.001 // small multiplier to lift lines above surface

    // parallels
    for (let lat = -90; lat <= 90; lat += 15) {
      const pts: THREE.Vector3[] = []
      for (let lon = -180; lon <= 180; lon += 5) {
        const { x, y, z } = latLngToVector(lat, lon)
        pts.push(new THREE.Vector3(x * radius * offset, y * radius * offset, z * radius * offset))
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts)
      gridGroup.add(new THREE.Line(geo, gridMat))
    }
    // meridians
    for (let lon = -180; lon <= 180; lon += 15) {
      const pts: THREE.Vector3[] = []
      for (let lat = -90; lat <= 90; lat += 5) {
        const { x, y, z } = latLngToVector(lat, lon)
        pts.push(new THREE.Vector3(x * radius * offset, y * radius * offset, z * radius * offset))
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts)
      gridGroup.add(new THREE.Line(geo, gridMat))
    }

  }

  // state to hold polygons for countries
  const [countryPolygons, setCountryPolygons] = useState<any[]>([])

  // refs to keep globe/groups around without re‑creating
  const globeRef = useRef<any>(null)
  const gridGroupRef = useRef<any>(null)
  const countryGroupRef = useRef<any>(null)

  // fetch geojson once
  useEffect(() => {
    fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson')
      .then(r => r.json())
      .then((data) => {
        console.log('loaded country polygons', data.features?.length)
        setCountryPolygons(data.features || [])
      })
  }, [])

  // draw country borders whenever we have polygons and the globe is ready
  useEffect(() => {
    if (!countryPolygons.length || !countryGroupRef.current || !globeRef.current) return

    const radius = globeRef.current.globeRadius() || 1
    const offset = 1.002 // slightly outside the sphere to avoid z-fighting
    const borderMat = new THREE.LineBasicMaterial({ color: '#FFF5E1', opacity: 0.6, transparent: true, linewidth: 1 })

    // clear previous borders if any
    countryGroupRef.current.clear()

    countryPolygons.forEach((feature: any) => {
      const { type, coordinates } = feature.geometry
      const polys: any[] = type === 'Polygon' ? [coordinates] : coordinates
      polys.forEach(polygon => {
        polygon.forEach((ring: any[]) => {
          const pts = ring.map(([lon, lat]: [number, number]) => {
            const { x, y, z } = latLngToVector(lat, lon)
            return new THREE.Vector3(x * radius * offset, y * radius * offset, z * radius * offset)
          })
          const geo = new THREE.BufferGeometry().setFromPoints(pts)
          countryGroupRef.current.add(new THREE.Line(geo, borderMat))
        })
      })
    })
  }, [countryPolygons])


  return (
    <div className="w-full h-full">
      <ReactGlobe
        ref={globeEl}
        backgroundColor="#000"
        atmosphereColor="#000000"
        showAtmosphere={false}
        onGlobeReady={handleGlobeReady}
        
        pointsData={pointsData}
        pointAltitude={0.01}
        pointResolution={4} // lower resolution for faster rendering
        pointLat={(d: any) => d.lat}
        pointLng={(d: any) => d.lng}
        pointColor={(d: any) => d.color}
        pointRadius={(d: any) => d.size}
        pointLabel={(d: any) => `
          <div style="
            background: rgba(0, 0, 0, 0.95);
            padding: 8px 12px;
            border-radius: 6px;
            border: 1px solid ${d.color};
            font-family: 'Space Grotesk', sans-serif;
          ">
            <div style="
              font-size: 11px;
              font-weight: bold;
              color: ${d.color};
              text-transform: uppercase;
              margin-bottom: 4px;
              letter-spacing: 0.05em;
            ">
              ${d.event.title}
            </div>
            <div style="
              font-size: 9px;
              color: #888;
              text-transform: uppercase;
              font-family: 'JetBrains Mono', monospace;
              letter-spacing: 0.1em;
            ">
              ${d.event.categories[0]?.title || 'Unknown'}
            </div>
          </div>
        `}
        onPointClick={(point: any) => {
          if (onEventClick && point.event) {
            onEventClick(point.event)
          }
        }}

        arcsData={arcsData}
        arcStartLat={(d: any) => d.startLat}
        arcStartLng={(d: any) => d.startLng}
        arcEndLat={(d: any) => d.endLat}
        arcEndLng={(d: any) => d.endLng}
        arcColor={(d: any) => d.color}
        arcDashLength={0.5}
        arcDashGap={0.3}
        arcDashAnimateTime={1500}
        arcStroke={1.2}
        arcAltitude={0.02}
        arcAltitudeAutoScale={0.5}

        ringsData={pointsData.filter(p => p.event.id === focusedEventId)}
        ringLat={(d: any) => d.lat}
        ringLng={(d: any) => d.lng}
        ringColor={(d: any) => d.color}
        ringMaxRadius={5}
        ringPropagationSpeed={2}
        ringRepeatPeriod={1000}
        ringAltitude={0.02}
      />
    </div>
  )
})
