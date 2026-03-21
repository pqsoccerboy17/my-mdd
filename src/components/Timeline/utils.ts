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

/** Extracts the max day number from an era's dayRange string (e.g. "Days 7-12" -> 12). */
export function getMaxDay(era: TimelineEra): number {
  const match = era.stats.dayRange.match(/(\d+)/g);
  return match ? Math.max(...match.map(Number)) : 0;
}

/** Extracts the min day number from an era's dayRange string (e.g. "Days 7-12" -> 7). */
export function getMinDay(era: TimelineEra): number {
  const match = era.stats.dayRange.match(/(\d+)/g);
  return match ? Math.min(...match.map(Number)) : 0;
}

/** Category accent colors matching the era-card CSS variables. */
export const CATEGORY_COLORS: Record<ChangeCategory, string> = {
  feature: '#C85A3A',
  infrastructure: '#7B8FA3',
  quality: '#5A8F6B',
  design: '#D4A853',
};
