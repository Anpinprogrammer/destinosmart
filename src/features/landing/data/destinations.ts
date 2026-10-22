import type { Destination } from '../../../components/travel/types'
export const slides = [
  {
    name: 'Santorini',
    country: 'Grecia',
    image:
      'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?auto=format&fit=crop&w=1600&q=75',
  },
  {
    name: 'Bali',
    country: 'Indonesia',
    image:
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1600&q=75',
  },
  {
    name: 'Tokio',
    country: 'Japón',
    image:
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1600&q=75',
  },
  {
    name: 'París',
    country: 'Francia',
    image:
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1600&q=75',
  },
] as const
export const destinations: Destination[] = [
  {
    id: 'bali',
    name: 'Bali',
    country: 'Indonesia',
    image:
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1000&q=80',
    description: 'Naturaleza y templos',
    tag: 'Favorito',
    route: 'BOG → DPS',
    samplePriceUSD: 890,
  },
  {
    id: 'paris',
    name: 'París',
    country: 'Francia',
    image:
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=80',
    description: 'Arte y gastronomía',
    tag: 'Escapada urbana',
    route: 'BOG → CDG',
    samplePriceUSD: 790,
  },
  {
    id: 'tokyo',
    name: 'Tokio',
    country: 'Japón',
    image:
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1000&q=80',
    description: 'Tradición y futuro',
    tag: 'Tendencia',
    route: 'BOG → HND',
    samplePriceUSD: 1120,
  },
  {
    id: 'santorini',
    name: 'Santorini',
    country: 'Grecia',
    image:
      'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?auto=format&fit=crop&w=1000&q=80',
    description: 'Atardeceres únicos',
    tag: 'Romántico',
    route: 'BOG → JTR',
    samplePriceUSD: 950,
  },
  {
    id: 'rome',
    name: 'Roma',
    country: 'Italia',
    image:
      'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1000&q=80',
    description: 'Historia que inspira',
    tag: 'Cultural',
    route: 'BOG → FCO',
    samplePriceUSD: 810,
  },
  {
    id: 'nyc',
    name: 'Nueva York',
    country: 'Estados Unidos',
    image:
      'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1000&q=80',
    description: 'La ciudad que no duerme',
    tag: 'Ciudad icónica',
    route: 'BOG → JFK',
    samplePriceUSD: 730,
  },
]
