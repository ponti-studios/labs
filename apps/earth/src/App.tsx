import { useEffect, useState } from 'react'
import { Globe } from '@/components/Globe'
import { EventList } from '@/components/EventList'
import { HUDControls } from '@/components/HUDControls'
import { DisasterEvent, EONETResponse } from '@/lib/types'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import { useQuery } from '@tanstack/react-query'

function App() {
  const [isRotating, setIsRotating] = useState(true)
  const [focusedEventId, setFocusedEventId] = useState<string | null>(null)
  const [lastFetchError, setLastFetchError] = useState<string | null>(null)
  const [lastFetchTs, setLastFetchTs] = useState<number | null>(null)

  // simple fetcher used by react-query; will throw on non-ok or invalid JSON
  const fetchEonet = async (): Promise<EONETResponse> => {
    const url = 'https://eonet.gsfc.nasa.gov/api/v3/events?status=open'
    const resp = await fetch(url)
    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status} ${resp.statusText}`)
    }
    try {
      return await resp.json()
    } catch (e) {
      const txt = await resp.text()
      throw new Error(`Invalid JSON from EONET (${e}): ${txt.slice(0, 200)}`)
    }
  }

  const [fallbackEvents, setFallbackEvents] = useState<DisasterEvent[]>([])

  const query = useQuery({
    queryKey: ['disasters'],
    queryFn: fetchEonet,
    retry: 2, // two retries = maximum three attempts total
    retryDelay: attempt => 1000 * Math.pow(2, attempt),
    refetchInterval: 600_000, // refetch every 10 minutes
    onSuccess(data) {
      setLastFetchError(null)
      setLastFetchTs(Date.now())
      // cache the successful events for offline fallback
      try {
        localStorage.setItem(
          'eonet_cache',
          JSON.stringify({ ts: Date.now(), events: data.events || [] })
        )
      } catch {}
      setFallbackEvents([])
      if (isLoading && (data.events || []).length > 0) {
        toast.success(`Telemetry synchronized: ${(data.events || []).length} active events detected`)
      }
    },
    onError(err: any) {
      const msg = err?.message || String(err)
      console.error('EONET request failed:', msg)
      setLastFetchError(msg)
      toast.error(`Failed to fetch remote telemetry: ${msg}`)

      // try reading cached events once
      try {
        const cached = localStorage.getItem('eonet_cache')
        if (cached) {
          const parsed = JSON.parse(cached)
          setFallbackEvents(parsed.events || [])
          toast('Using cached telemetry data', { icon: '⚠️' })
        }
      } catch (e) {
        console.warn('Failed to read cache', e)
      }
    },
  })

  // derive the list of events to render (live data else fallback)
  const eventsToShow = ((query.data?.events ?? fallbackEvents) as DisasterEvent[])
    .filter(e => e.geometry && e.geometry.length > 0)

  const loading = query.isLoading || query.isFetching

  // toast when count changes so we still get notified
  const [lastCount, setLastCount] = useState<number | null>(null)
  useEffect(() => {
    if (query.data) {
      const cnt = query.data.events?.length ?? 0
      if (lastCount === null || lastCount !== cnt) {
        toast.success(`Telemetry synchronized: ${cnt} active events detected`)
        setLastCount(cnt)
      }
    }
  }, [query.data, lastCount])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'r') {
        setIsRotating(prev => !prev)
      }
      if (e.key.toLowerCase() === 'h') {
        setFocusedEventId(null)
        setIsRotating(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleEventClick = (event: DisasterEvent) => {
    setFocusedEventId(event.id)
    setIsRotating(false)
  }

  const handleToggleRotation = () => {
    setIsRotating(prev => !prev)
  }

  const handleResetView = () => {
    setFocusedEventId(null)
    setIsRotating(true)
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 z-0">
        <Globe 
          events={eventsToShow}
          onEventClick={handleEventClick}
          isRotating={isRotating}
          focusedEventId={focusedEventId}
        />
      </div>

      <div className="absolute inset-0 w-2 h-2 bg-white/5 pointer-events-none z-30 scanline-animation" />

      <div className="absolute inset-0 z-20 p-6 flex flex-col justify-between pointer-events-none">
        <div className="flex justify-between items-start gap-4">
          <div className="pointer-events-auto rounded-lg border border-primary/40 bg-card/85 backdrop-blur-xl p-4" style={{ boxShadow: '0 0 15px rgba(239, 68, 68, 0.15)' }}>
            <h1 className="text-xl font-black tracking-[0.15em] uppercase italic" style={{ fontFamily: 'var(--font-grotesk)' }}>
              Terra-Monitor <span className="text-primary">v3.0</span>
            </h1>
            <div className="flex items-center gap-4 mt-1">
              <p className="text-[9px] text-muted-foreground uppercase tracking-tighter" style={{ fontFamily: 'var(--font-mono)' }}>
                Global Telemetry Stream
              </p>
              <div className="flex gap-1">
                <div className="w-1 h-3 bg-primary glow-pulse" />
                <div className="w-1 h-3 bg-primary/40" />
              </div>
            </div>
          </div>

          <HUDControls
            isRotating={isRotating}
            onToggleRotation={handleToggleRotation}
            onResetView={handleResetView}
            isLoading={loading}
            eventCount={eventsToShow.length}
            lastFetchError={lastFetchError}
            lastFetchTs={lastFetchTs}
          />
        </div>

        <div className="flex gap-4 items-end">
          <div className="pointer-events-auto">
            <EventList
              events={events}
              onEventClick={handleEventClick}
              focusedEventId={focusedEventId}
            />
          </div>

          <div className="hidden md:flex pointer-events-auto flex-1 rounded-lg border border-white/10 bg-card/85 backdrop-blur-xl p-4 justify-around items-center">
            <div className="text-center">
              <div className="text-[10px] text-muted-foreground uppercase tracking-[0.15em]" style={{ fontFamily: 'var(--font-mono)' }}>
                Atmosphere
              </div>
              <div className="text-lg" style={{ fontFamily: 'var(--font-mono)' }}>
                0.024%<span className="text-xs opacity-50 ml-1">CO₂</span>
              </div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <div className="text-[10px] text-muted-foreground uppercase tracking-[0.15em]" style={{ fontFamily: 'var(--font-mono)' }}>
                Seismic
              </div>
              <div className="text-lg" style={{ fontFamily: 'var(--font-mono)' }}>
                2.1<span className="text-xs opacity-50 ml-1">AVG</span>
              </div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <div className="text-[10px] text-muted-foreground uppercase tracking-[0.15em]" style={{ fontFamily: 'var(--font-mono)' }}>
                Thermal
              </div>
              <div className="text-lg text-orange-500" style={{ fontFamily: 'var(--font-mono)' }}>
                +1.2°C
              </div>
            </div>
          </div>
        </div>
      </div>

      <Toaster theme="dark" position="top-center" />
    </div>
  )
}

export default App