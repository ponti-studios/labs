import type { Generated, Insertable, Selectable, Updateable } from 'kysely'

export * from './relationship-types'

import type {
  DumphimTrackerTable,
  DumphimVoteTable,
  PlaygroundCovidDataTable,
  PlaygroundEmbeddingTable,
  PlaygroundProjectTable,
  PlaygroundTflCameraTable,
  PlaygroundTodoTable,
  RelationshipCheckinTable,
  RelationshipEventTable,
  RelationshipFlagTable,
  RelationshipInviteTable,
  RelationshipMetricDailyTable,
  RelationshipNoteTable,
  RelationshipPersonTable,
  RelationshipStageHistoryTable,
  RelationshipVoteTable,
} from './relationship-types'

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
  relationship_people: RelationshipPersonTable
  relationship_stage_history: RelationshipStageHistoryTable
  relationship_events: RelationshipEventTable
  relationship_notes: RelationshipNoteTable
  relationship_checkins: RelationshipCheckinTable
  relationship_flags: RelationshipFlagTable
  relationship_friend_invites: RelationshipInviteTable
  relationship_friend_votes: RelationshipVoteTable
  relationship_metrics_daily: RelationshipMetricDailyTable
  // Playground tables
  playground_covid_data: PlaygroundCovidDataTable
  playground_tfl_cameras: PlaygroundTflCameraTable
  playground_projects: PlaygroundProjectTable
  playground_todos: PlaygroundTodoTable
  playground_embeddings: PlaygroundEmbeddingTable
  // Dumphim tables
  dumphim_trackers: DumphimTrackerTable
  dumphim_votes: DumphimVoteTable
}

export type DisasterEvent = Selectable<DisasterEventTable>
export type NewDisasterEvent = Insertable<DisasterEventTable>
export type DisasterEventUpdate = Updateable<DisasterEventTable>
