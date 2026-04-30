import { Neighborhood } from '@/types/dataset';

// Common Charlotte neighborhoods - in production, this would come from a dataset
export const neighborhoods: Neighborhood[] = [
  { slug: 'uptown', name: 'Uptown' },
  { slug: 'south-end', name: 'South End' },
  { slug: 'noda', name: 'NoDa (North Davidson)' },
  { slug: 'plaza-midwood', name: 'Plaza Midwood' },
  { slug: 'dilworth', name: 'Dilworth' },
  { slug: 'myers-park', name: 'Myers Park' },
  { slug: 'elizabeth', name: 'Elizabeth' },
  { slug: 'wesley-heights', name: 'Wesley Heights' },
  { slug: 'first-ward', name: 'First Ward' },
  { slug: 'second-ward', name: 'Second Ward' },
  { slug: 'third-ward', name: 'Third Ward' },
  { slug: 'fourth-ward', name: 'Fourth Ward' },
  { slug: 'west-end', name: 'West End' },
  { slug: 'east-charlotte', name: 'East Charlotte' },
  { slug: 'north-charlotte', name: 'North Charlotte' },
  { slug: 'south-charlotte', name: 'South Charlotte' },
  { slug: 'university-city', name: 'University City' },
  { slug: 'ballantyne', name: 'Ballantyne' },
  { slug: 'steele-creek', name: 'Steele Creek' },
  { slug: 'huntersville', name: 'Huntersville' },
];

export function getNeighborhoodBySlug(slug: string): Neighborhood | undefined {
  return neighborhoods.find((n) => n.slug === slug);
}

export function getAllNeighborhoods(): Neighborhood[] {
  return neighborhoods;
}

