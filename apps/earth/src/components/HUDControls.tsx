import React from 'react'
import { Button } from '@/components/ui/button'
import { ArrowCounterClockwise, Play, Pause } from '@phosphor-icons/react'

interface HUDControlsProps {
  isRotating: boolean
  onToggleRotation: () => void
  onResetView: () => void
  isLoading?: boolean
  eventCount?: number
  lastFetchError?: string | null
  lastFetchTs?: number | null
}

export const HUDControls = React.memo(function HUDControls({ isRotating, onToggleRotation, onResetView, isLoading, eventCount, lastFetchError, lastFetchTs }: HUDControlsProps) {
  return (
    <div className="flex flex-col gap-2 items-end">
      <div className="rounded-lg border border-white/10 bg-card/85 backdrop-blur-xl px-4 py-2 flex items-center gap-3">
        {isLoading ? (
          <>
            <div className="w-2 h-2 bg-yellow-500 rounded-full glow-pulse" style={{ boxShadow: '0 0 8px rgba(234, 179, 8, 0.8)' }} />
            <span className="text-[10px] uppercase tracking-[0.2em] text-yellow-400" style={{ fontFamily: 'var(--font-mono)' }}>
              Synchronizing...
            </span>
          </>
        ) : (
          <>
            <div className="w-2 h-2 bg-green-500 rounded-full" style={{ boxShadow: '0 0 8px rgba(34, 197, 94, 0.8)' }} />
            <span className="text-[10px] uppercase tracking-[0.2em] text-green-400" style={{ fontFamily: 'var(--font-mono)' }}>
              {eventCount ? `${eventCount} Events Active` : 'Nodes Active'}
            </span>
          </>
        )}
      </div>
      
      <div className="rounded-lg border border-white/10 bg-card/85 backdrop-blur-xl p-3 flex gap-4 text-[10px] uppercase text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleRotation}
          className="h-auto py-1 px-2 hover:text-white transition-colors text-[10px] uppercase tracking-[0.02em]"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {isRotating ? <Pause className="mr-1" size={12} /> : <Play className="mr-1" size={12} />}
          Auto-Rotate [R]
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onResetView}
          className="h-auto py-1 px-2 hover:text-white transition-colors text-[10px] uppercase tracking-[0.02em]"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          <ArrowCounterClockwise className="mr-1" size={12} />
          Reset [H]
        </Button>
      </div>
      {/* error / status line */}
      {lastFetchError || lastFetchTs ? (
        <div className="mt-1 text-[9px] leading-tight">
          {lastFetchError ? (
            <span className="text-red-400">Error: {lastFetchError}</span>
          ) : null}
          {lastFetchTs && !lastFetchError ? (
            <span className="text-green-300">Last sync: {new Date(lastFetchTs).toLocaleTimeString()}</span>
          ) : null}
        </div>
      ) : null}
    </div>
  )
})
