export type ServiceId =
  'flights' | 'stays' | 'transport' | 'attractions' | 'food'
export type Currency = 'USD' | 'COP' | 'EUR'
export interface TravelerCounts {
  adults: number
  children: number
  infants: number
  pets: number
}
export interface TravelSearch {
  origin: string
  destination: string
  datePreferences?: {
    mode: 'dates' | 'flexible'
    flexibility: number
    duration: number
    months: string[]
    skipped: boolean
  }
  departureDate: string
  returnDate: string
  travelerCounts?: TravelerCounts
  travelers: number
  budget: string
  currency: Currency
  services: ServiceId[]
}
export interface Destination {
  id: string
  name: string
  country: string
  image: string
  description: string
  tag: string
  route: string
  samplePriceUSD: number
}
