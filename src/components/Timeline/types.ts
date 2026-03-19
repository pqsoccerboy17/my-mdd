import type { ReactNode } from 'react';

export interface TimelineEntry {
  title: string;
  subtitle?: string;
  content: ReactNode;
}

export interface TimelineProps {
  data: TimelineEntry[];
}
