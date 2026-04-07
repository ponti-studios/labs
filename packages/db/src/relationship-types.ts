import type { Generated, Insertable, Selectable, Updateable } from 'kysely'

export type RelationshipPersonStatus = 'active' | 'paused' | 'ended' | 'archived'

export type RelationshipStage =
  | 'talking'
  | 'dating'
  | 'exclusive'
  | 'committed'
  | 'ended'

export type RelationshipEventType =
  | 'date'
  | 'call'
  | 'gift'
  | 'trip'
  | 'conflict'
  | 'repair'
  | 'boundary'
  | 'intimacy'
  | 'other'

export type RelationshipSentiment =
  | 'very_negative'
  | 'negative'
  | 'neutral'
  | 'positive'
  | 'very_positive'

export type RelationshipFlagType = 'red' | 'green'

export type RelationshipFlagSource =
  | 'manual'
  | 'derived_from_event'
  | 'friend_feedback'

export type RelationshipInviteStatus = 'active' | 'revoked' | 'expired'

export type RelationshipVoteValue = 'stay' | 'dump' | 'needs_context'

export interface RelationshipPersonTable {
  id: Generated<string>
  owner_user_id: string
  display_name: string
  status: RelationshipPersonStatus
  current_stage: RelationshipStage
  started_at: string | null
  ended_at: string | null
  headline: string | null
  profile_summary: string | null
  created_at: Generated<string>
  updated_at: Generated<string>
}

export interface RelationshipStageHistoryTable {
  id: Generated<string>
  person_id: string
  from_stage: RelationshipStage | null
  to_stage: RelationshipStage
  effective_at: string
  created_by_user_id: string
  created_at: Generated<string>
}

export interface RelationshipEventTable {
  id: Generated<string>
  person_id: string
  owner_user_id: string
  event_type: RelationshipEventType
  title: string
  description: string | null
  occurred_at: string
  sentiment: RelationshipSentiment
  intensity: number | null
  created_at: Generated<string>
  updated_at: Generated<string>
}

export interface RelationshipNoteTable {
  id: Generated<string>
  person_id: string
  owner_user_id: string
  title: string | null
  body: string
  created_at: Generated<string>
  updated_at: Generated<string>
}

export interface RelationshipCheckinTable {
  id: Generated<string>
  person_id: string
  owner_user_id: string
  mood_score: number
  clarity_score: number
  trust_score: number
  compatibility_score: number
  energy_score: number
  notes: string | null
  recorded_at: string
  created_at: Generated<string>
}

export interface RelationshipFlagTable {
  id: Generated<string>
  person_id: string
  owner_user_id: string
  flag_type: RelationshipFlagType
  label: string
  description: string | null
  source: RelationshipFlagSource
  severity: number | null
  created_at: Generated<string>
  updated_at: Generated<string>
}

export interface RelationshipInviteTable {
  id: Generated<string>
  person_id: string
  owner_user_id: string
  invite_token: string
  status: RelationshipInviteStatus
  expires_at: string | null
  share_summary: number
  share_timeline: number
  share_flags: number
  share_checkins: number
  created_at: Generated<string>
  updated_at: Generated<string>
}

export interface RelationshipVoteTable {
  id: Generated<string>
  invite_id: string
  person_id: string
  voter_name: string
  voter_contact_hint: string | null
  vote: RelationshipVoteValue
  confidence_score: number | null
  commentary: string | null
  created_at: Generated<string>
  updated_at: Generated<string>
}

export interface RelationshipMetricDailyTable {
  id: Generated<string>
  person_id: string
  metric_date: string
  health_score: string
  friend_sentiment_score: string | null
  red_flag_count: number
  green_flag_count: number
  event_count: number
  created_at: Generated<string>
  updated_at: Generated<string>
}

export type RelationshipPerson = Selectable<RelationshipPersonTable>
export type NewRelationshipPerson = Insertable<RelationshipPersonTable>
export type RelationshipPersonUpdate = Updateable<RelationshipPersonTable>

export type RelationshipStageHistory = Selectable<RelationshipStageHistoryTable>
export type NewRelationshipStageHistory = Insertable<RelationshipStageHistoryTable>
export type RelationshipStageHistoryUpdate = Updateable<RelationshipStageHistoryTable>

export type RelationshipEvent = Selectable<RelationshipEventTable>
export type NewRelationshipEvent = Insertable<RelationshipEventTable>
export type RelationshipEventUpdate = Updateable<RelationshipEventTable>

export type RelationshipNote = Selectable<RelationshipNoteTable>
export type NewRelationshipNote = Insertable<RelationshipNoteTable>
export type RelationshipNoteUpdate = Updateable<RelationshipNoteTable>

export type RelationshipCheckin = Selectable<RelationshipCheckinTable>
export type NewRelationshipCheckin = Insertable<RelationshipCheckinTable>
export type RelationshipCheckinUpdate = Updateable<RelationshipCheckinTable>

export type RelationshipFlag = Selectable<RelationshipFlagTable>
export type NewRelationshipFlag = Insertable<RelationshipFlagTable>
export type RelationshipFlagUpdate = Updateable<RelationshipFlagTable>

export type RelationshipInvite = Selectable<RelationshipInviteTable>
export type NewRelationshipInvite = Insertable<RelationshipInviteTable>
export type RelationshipInviteUpdate = Updateable<RelationshipInviteTable>

export type RelationshipVote = Selectable<RelationshipVoteTable>
export type NewRelationshipVote = Insertable<RelationshipVoteTable>
export type RelationshipVoteUpdate = Updateable<RelationshipVoteTable>

export type RelationshipMetricDaily = Selectable<RelationshipMetricDailyTable>
export type NewRelationshipMetricDaily = Insertable<RelationshipMetricDailyTable>
export type RelationshipMetricDailyUpdate = Updateable<RelationshipMetricDailyTable>

// ============================================================================
// Playground Tables (apps/playground — migrated from Drizzle/Postgres)
// ============================================================================

export interface PlaygroundCovidDataTable {
  id: Generated<number>
  iso_code: string | null
  continent: string | null
  location: string | null
  date: string | null
  total_cases: number | null
  new_cases: number | null
  new_cases_smoothed: number | null
  total_deaths: number | null
  new_deaths: number | null
  new_deaths_smoothed: number | null
  total_cases_per_million: number | null
  new_cases_per_million: number | null
  new_cases_smoothed_per_million: number | null
  total_deaths_per_million: number | null
  new_deaths_per_million: number | null
  new_deaths_smoothed_per_million: number | null
  reproduction_rate: number | null
  icu_patients: number | null
  icu_patients_per_million: number | null
  hosp_patients: number | null
  hosp_patients_per_million: number | null
  weekly_icu_admissions: number | null
  weekly_icu_admissions_per_million: number | null
  weekly_hosp_admissions: number | null
  weekly_hosp_admissions_per_million: number | null
  total_tests: number | null
  new_tests: number | null
  total_tests_per_thousand: number | null
  new_tests_per_thousand: number | null
  new_tests_smoothed: number | null
  new_tests_smoothed_per_thousand: number | null
  positive_rate: number | null
  tests_per_case: number | null
  tests_units: string | null
  total_vaccinations: number | null
  people_vaccinated: number | null
  people_fully_vaccinated: number | null
  total_boosters: number | null
  new_vaccinations: number | null
  new_vaccinations_smoothed: number | null
  total_vaccinations_per_hundred: number | null
  people_vaccinated_per_hundred: number | null
  people_fully_vaccinated_per_hundred: number | null
  total_boosters_per_hundred: number | null
  new_vaccinations_smoothed_per_million: number | null
  new_people_vaccinated_smoothed: number | null
  new_people_vaccinated_smoothed_per_hundred: number | null
  stringency_index: number | null
  population_density: number | null
  median_age: number | null
  aged_65_older: number | null
  aged_70_older: number | null
  gdp_per_capita: number | null
  extreme_poverty: number | null
  cardiovasc_death_rate: number | null
  diabetes_prevalence: number | null
  female_smokers: number | null
  male_smokers: number | null
  handwashing_facilities: number | null
  hospital_beds_per_thousand: number | null
  life_expectancy: number | null
  human_development_index: number | null
  population: number | null
  excess_mortality_cumulative_absolute: number | null
  excess_mortality_cumulative: number | null
  excess_mortality: number | null
  excess_mortality_cumulative_per_million: number | null
}

export interface PlaygroundTflCameraTable {
  id: Generated<number>
  tflId: string
  commonName: string
  available: boolean | null
  imageUrl: string | null
  videoUrl: string | null
  view: string | null
  lat: number
  lng: number
  createdAt: string | null
  updatedAt: string | null
}

export interface PlaygroundProjectTable {
  id: Generated<number>
  userId: string
  name: string
  description: string | null
  createdAt: string | null
  updatedAt: string | null
}

export interface PlaygroundTodoTable {
  id: Generated<number>
  userId: string
  projectId: number | null
  title: string
  start: string
  end: string
  completed: boolean | null
  createdAt: string | null
  updatedAt: string | null
}

export interface PlaygroundEmbeddingTable {
  id: Generated<number>
  todoId: number
  content: string
  embedding: string
  model: string
  createdAt: string | null
}

export type PlaygroundCovidData = Selectable<PlaygroundCovidDataTable>
export type NewPlaygroundCovidData = Insertable<PlaygroundCovidDataTable>

export type PlaygroundTflCamera = Selectable<PlaygroundTflCameraTable>
export type NewPlaygroundTflCamera = Insertable<PlaygroundTflCameraTable>

export type PlaygroundProject = Selectable<PlaygroundProjectTable>
export type NewPlaygroundProject = Insertable<PlaygroundProjectTable>

export type PlaygroundTodo = Selectable<PlaygroundTodoTable>
export type NewPlaygroundTodo = Insertable<PlaygroundTodoTable>

export type PlaygroundEmbedding = Selectable<PlaygroundEmbeddingTable>
export type NewPlaygroundEmbedding = Insertable<PlaygroundEmbeddingTable>

// ============================================================================
// Dumphim Tables (apps/dumphim — migrated from Drizzle/Postgres)
// Uses camelCase property names to match existing app code expectations.
// Kysely Column<> helpers map to actual snake_case MySQL column names.
// ============================================================================

export interface DumphimTrackerTable {
  id: Generated<string>
  createdAt: Generated<string>
  updatedAt: Generated<string>
  name: string
  hp: string | null
  cardType: string | null
  description: string | null
  attacks: string | null
  strengths: string | null
  flaws: string | null
  commitmentLevel: string | null
  colorTheme: string | null
  photoUrl: string | null
  imageScale: number | null
  imagePosition: string | null
  userId: string
}

export interface DumphimVoteTable {
  id: Generated<string>
  createdAt: Generated<string>
  updatedAt: Generated<string>
  trackerId: string
  userId: string | null
  fingerprint: string
  raterName: string
  value: 'stay' | 'dump'
  comment: string | null
}

export type DumphimTracker = Selectable<DumphimTrackerTable>
export type NewDumphimTracker = Insertable<DumphimTrackerTable>
export type DumphimTrackerUpdate = Updateable<DumphimTrackerTable>

export type DumphimVote = Selectable<DumphimVoteTable>
export type NewDumphimVote = Insertable<DumphimVoteTable>
export type DumphimVoteUpdate = Updateable<DumphimVoteTable>

// Parsed versions with JSON fields deserialized (for app code consumption)
export interface DumphimTrackerParsed {
  id: string
  createdAt: string
  updatedAt: string
  name: string
  hp: string | null
  cardType: string | null
  description: string | null
  attacks: { name: string; damage: number }[]
  strengths: string[]
  flaws: string[]
  commitmentLevel: string | null
  colorTheme: string | null
  photoUrl: string | null
  imageScale: number | null
  imagePosition: { x: number; y: number } | null
  userId: string
}
