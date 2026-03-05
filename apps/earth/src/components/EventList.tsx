import React, { useState, useMemo, useCallback } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { DisasterEvent } from '@/lib/types'

interface EventListProps {
  events: DisasterEvent[]
  onEventClick: (event: DisasterEvent) => void
  focusedEventId?: string | null
}

const CATEGORY_COLORS: Record<string, string> = {
  wildfires: '#ff3c00',
  volcanoes: '#ff8c00',
  severeStorms: '#00d2ff',
  iceberg: '#ffffff',
  seaLakeIce: '#a0d8f1',
  default: '#888888'
}

const CATEGORY_LABELS: Record<string, string> = {
  wildfires: 'Wildfires',
  volcanoes: 'Volcanoes',
  severeStorms: 'Storms',
  iceberg: 'Icebergs',
  seaLakeIce: 'Sea Ice',
}

export const EventList = React.memo(function EventList({ events, onEventClick, focusedEventId }: EventListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const handleCategoryClick = useCallback((id: string|null) => setSelectedCategory(id), [])

  const categories = useMemo(() => {
    const categoryCount = new Map<string, number>()
    events.forEach(event => {
      const categoryId = event.categories[0]?.id
      if (categoryId) {
        categoryCount.set(categoryId, (categoryCount.get(categoryId) || 0) + 1)
      }
    })
    return Array.from(categoryCount.entries()).map(([id, count]) => ({
      id,
      count,
      label: CATEGORY_LABELS[id] || id,
      color: CATEGORY_COLORS[id] || CATEGORY_COLORS.default
    }))
  }, [events])

  const filteredEvents = useMemo(() => {
    if (!selectedCategory) return events
    return events.filter(event => event.categories[0]?.id === selectedCategory)
  }, [events, selectedCategory])

  return (
    <div className="w-80 max-h-[40vh] flex flex-col overflow-hidden rounded-lg border border-white/10 bg-card/85 backdrop-blur-xl">
      <div className="p-3 border-b border-white/10 bg-white/5 flex justify-between items-center">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ fontFamily: 'var(--font-grotesk)' }}>
          Live Events
        </span>
        <Badge className="text-[10px] px-2 bg-primary border-0 font-mono">
          {filteredEvents.length.toString().padStart(2, '0')}
        </Badge>
      </div>

      {categories.length > 0 && (
        <div className="p-2 border-b border-white/10 bg-white/[0.02] flex flex-wrap gap-1.5">
          <button
            onClick={() => handleCategoryClick(null)}
            className={`
              px-2 py-1 rounded text-[8px] font-mono uppercase tracking-[0.1em] transition-all
              ${selectedCategory === null 
                ? 'bg-white/20 text-white border border-white/30' 
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
              }
            `}
          >
            All ({events.length})
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`
                px-2 py-1 rounded text-[8px] font-mono uppercase tracking-[0.1em] transition-all
                flex items-center gap-1.5
                ${selectedCategory === category.id
                  ? 'bg-white/20 text-white border'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                }
              `}
              style={{
                borderColor: selectedCategory === category.id ? `${category.color}80` : undefined,
                boxShadow: selectedCategory === category.id ? `0 0 10px ${category.color}40` : undefined
              }}
            >
              <div 
                className="w-1.5 h-1.5 rounded-full" 
                style={{ 
                  backgroundColor: category.color,
                  boxShadow: `0 0 4px ${category.color}`
                }}
              />
              {category.label} ({category.count})
            </button>
          ))}
        </div>
      )}
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1 custom-scrollbar">
          {filteredEvents.length === 0 ? (
            <p className="text-center text-[10px] text-muted-foreground py-8 uppercase tracking-[0.15em] glow-pulse" style={{ fontFamily: 'var(--font-mono)' }}>
              {events.length === 0 ? 'Synchronizing Orbit...' : 'No Events in Category'}
            </p>
          ) : (
            filteredEvents.map(event => {
              const categoryId = event.categories[0]?.id || 'default'
              const color = CATEGORY_COLORS[categoryId] || CATEGORY_COLORS.default
              const isFocused = focusedEventId === event.id
              
              return (
                <div
                  key={event.id}
                  onClick={() => onEventClick(event)}
                  className={`
                    flex items-center gap-3 p-2 rounded cursor-pointer group transition-all
                    border ${isFocused ? 'border-white/20 bg-white/10' : 'border-transparent hover:border-white/10'}
                    ${isFocused ? 'bg-white/10' : 'hover:bg-white/5'}
                  `}
                >
                  <div 
                    className="w-2 h-2 rounded-full flex-shrink-0" 
                    style={{ 
                      backgroundColor: color,
                      boxShadow: `0 0 8px ${color}80`
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold truncate text-gray-300 group-hover:text-white uppercase" style={{ fontFamily: 'var(--font-grotesk)', letterSpacing: '0.05em' }}>
                      {event.title}
                    </div>
                    <div className="text-[8px] text-muted-foreground uppercase tracking-[0.15em]" style={{ fontFamily: 'var(--font-mono)' }}>
                      {event.categories[0]?.title || 'Unknown'}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </ScrollArea>
    </div>
  )
})
