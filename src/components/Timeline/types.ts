import type { ReactNode } from 'react';

export type ChangeCategory = 'feature' | 'infrastructure' | 'quality' | 'design';

export interface EraStats {
  commits: number;
  dayRange: string;
  dateRange: string;
  highlights: number;
}

export interface ChangeItem {
  text: string;
  category: ChangeCategory;
  notable?: boolean;
}

export interface TimelineEra {
  id: string;
  title: string;
  subtitle: string;
  stats: EraStats;
  description: string;
  changes: ChangeItem[];
  trailPosition: number;
}

export interface TimelineProps {
  data: TimelineEra[];
}
