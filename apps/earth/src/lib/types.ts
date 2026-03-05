export interface DisasterEvent {
  id: string
  title: string
  description?: string
  link?: string
  categories: Array<{
    id: string
    title: string
  }>
  // the EONET API now returns `geometry` (an array) instead of `geometries`
  geometry: Array<{
    date: string
    type: string
    coordinates: [number, number]
  }>
  closed?: string
}

export interface EONETResponse {
  title: string
  description: string
  link: string
  events: DisasterEvent[]
}

export type CategoryId = 'wildfires' | 'volcanoes' | 'severeStorms' | 'iceberg' | 'seaLakeIce'

export interface CategoryStyle {
  color: string
  size: number
  label: string
}
