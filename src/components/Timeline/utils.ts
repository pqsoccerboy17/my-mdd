import type { TimelineEra, ChangeCategory } from './types';

/** Determines the dominant category for an era based on its change distribution. */
export function getDominantCategory(era: TimelineEra): ChangeCategory {
  const counts: Record<ChangeCategory, number> = {
    feature: 0,
    infrastructure: 0,
    quality: 0,
    design: 0,
  };
  era.changes.forEach((c) => { counts[c.category]++; });
  return (Object.entries(counts) as [ChangeCategory, number][])
    .sort((a, b) => b[1] - a[1])[0][0];
}

function parseDayNumbers(era: TimelineEra): number[] {
  return era.stats.dayRange.match(/(\d+)/g)?.map(Number) ?? [];
}

export function getMaxDay(era: TimelineEra): number {
  const days = parseDayNumbers(era);
  return days.length ? Math.max(...days) : 0;
}

export function getMinDay(era: TimelineEra): number {
  const days = parseDayNumbers(era);
  return days.length ? Math.min(...days) : 0;
}

/** Scroll to an era card by ID with smooth animation. */
export function scrollToEra(eraId: string): void {
  const el = document.getElementById(`era-${eraId}`);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/** Category accent colors matching the era-card CSS variables. */
export const CATEGORY_COLORS: Record<ChangeCategory, string> = {
  feature: '#C85A3A',
  infrastructure: '#2E7D9E',
  quality: '#5A8F6B',
  design: '#E8956F',
};
