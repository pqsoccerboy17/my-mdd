import type { RoadmapItem, RoadmapArea, RoadmapPhase, RoadmapStatus, RoadmapPriority } from '../../data/roadmapData';
import type { RoadmapFilters } from './types';

const PRIORITY_ORDER: Record<RoadmapPriority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const STATUS_ORDER: Record<RoadmapStatus, number> = {
  'in-progress': 0,
  planned: 1,
  backlog: 2,
  shipped: 3,
};

export function filterItems(items: RoadmapItem[], filters: RoadmapFilters): RoadmapItem[] {
  return items.filter((item) => {
    if (filters.areas.length > 0 && !filters.areas.includes(item.area)) return false;
    if (filters.priority && item.priority !== filters.priority) return false;
    if (filters.status && item.status !== filters.status) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matchesTitle = item.title.toLowerCase().includes(q);
      const matchesDesc = item.description?.toLowerCase().includes(q);
      const matchesTags = item.tags?.some((t) => t.toLowerCase().includes(q));
      if (!matchesTitle && !matchesDesc && !matchesTags) return false;
    }
    return true;
  });
}

export function groupByPhase(items: RoadmapItem[]): Record<RoadmapPhase | 'unphased', RoadmapItem[]> {
  const groups: Record<RoadmapPhase | 'unphased', RoadmapItem[]> = {
    now: [],
    next: [],
    later: [],
    unphased: [],
  };
  for (const item of items) {
    const key = item.phase ?? 'unphased';
    groups[key].push(item);
  }
  return groups;
}

export function groupByStatus(items: RoadmapItem[]): Record<RoadmapStatus, RoadmapItem[]> {
  const groups: Record<RoadmapStatus, RoadmapItem[]> = {
    backlog: [],
    planned: [],
    'in-progress': [],
    shipped: [],
  };
  for (const item of items) {
    groups[item.status].push(item);
  }
  return groups;
}

export function groupByArea(items: RoadmapItem[]): Record<RoadmapArea, RoadmapItem[]> {
  const groups = {} as Record<RoadmapArea, RoadmapItem[]>;
  for (const item of items) {
    if (!groups[item.area]) groups[item.area] = [];
    groups[item.area].push(item);
  }
  return groups;
}

export function sortByPriority(items: RoadmapItem[]): RoadmapItem[] {
  return [...items].sort((a, b) => {
    const pa = a.priority ? PRIORITY_ORDER[a.priority] : 99;
    const pb = b.priority ? PRIORITY_ORDER[b.priority] : 99;
    if (pa !== pb) return pa - pb;
    return STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
  });
}

export function getItemById(items: RoadmapItem[], id: string): RoadmapItem | undefined {
  return items.find((item) => item.id === id);
}

export function getDependencies(items: RoadmapItem[], item: RoadmapItem): RoadmapItem[] {
  if (!item.dependencies) return [];
  return item.dependencies
    .map((depId) => items.find((i) => i.id === depId))
    .filter((i): i is RoadmapItem => i !== undefined);
}

export function getDependents(items: RoadmapItem[], item: RoadmapItem): RoadmapItem[] {
  return items.filter((i) => i.dependencies?.includes(item.id));
}

export const emptyFilters: RoadmapFilters = {
  areas: [],
  search: '',
  priority: null,
  status: null,
};

export function hasActiveFilters(filters: RoadmapFilters): boolean {
  return filters.areas.length > 0 || filters.search !== '' || filters.priority !== null || filters.status !== null;
}
