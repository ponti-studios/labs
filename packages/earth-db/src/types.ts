import type { Generated, Insertable, Selectable, Updateable } from 'kysely'

export interface DisasterEventTable {
  id: string
  title: string
  description: string | null
  source_url: string | null
  category_id: string
  category_title: string
  occurred_at: string
  geometry_type: string
  latitude: number
  longitude: number
  closed_at: string | null
  source: string | null
  timestamp: string | null
  created_at: Generated<string>
  updated_at: Generated<string>
}

export interface Database {
  disaster_events: DisasterEventTable
}

export type DisasterEvent = Selectable<DisasterEventTable>
export type NewDisasterEvent = Insertable<DisasterEventTable>
export type DisasterEventUpdate = Updateable<DisasterEventTable>
