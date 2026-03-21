import type { ReactNode } from 'react';
import type { RoadmapFilters } from './types';
import type { RoadmapArea, RoadmapPriority, RoadmapStatus } from '../../data/roadmapData';
import { Search, X } from 'lucide-react';
import clsx from 'clsx';
import { AREA_COLORS, AREA_LABELS, PRIORITY_LABELS, STATUS_LABELS } from '../../data/roadmapData';
import { hasActiveFilters, emptyFilters } from './helpers';

const areas = Object.keys(AREA_COLORS) as RoadmapArea[];
const priorities = Object.keys(PRIORITY_LABELS) as RoadmapPriority[];
const statuses = Object.keys(STATUS_LABELS) as RoadmapStatus[];

interface FilterBarProps {
  filters: RoadmapFilters;
  onChange: (filters: RoadmapFilters) => void;
  itemCount: number;
}

/** Filter controls for area, search, priority, and status. */
export default function FilterBar({ filters, onChange, itemCount }: FilterBarProps): ReactNode {
  const toggleArea = (area: RoadmapArea) => {
    const next = filters.areas.includes(area)
      ? filters.areas.filter((a) => a !== area)
      : [...filters.areas, area];
    onChange({ ...filters, areas: next });
  };

  const setSearch = (search: string) => {
    onChange({ ...filters, search });
  };

  const setPriority = (value: string) => {
    onChange({ ...filters, priority: (value || null) as RoadmapPriority | null });
  };

  const setStatus = (value: string) => {
    onChange({ ...filters, status: (value || null) as RoadmapStatus | null });
  };

  const filtersActive = hasActiveFilters(filters);

  return (
    <div className="roadmap-filter-bar">
      <div className="roadmap-filter-bar__areas">
        {areas.map((area) => {
          const isSelected = filters.areas.includes(area);

          return (
            <button
              key={area}
              type="button"
              className={clsx('roadmap-filter-bar__area-pill', isSelected && 'roadmap-filter-bar__area-pill--active')}
              onClick={() => toggleArea(area)}
              aria-pressed={isSelected}
            >
              <span
                className="roadmap-filter-bar__area-dot"
                style={{ backgroundColor: AREA_COLORS[area] }}
              />
              {AREA_LABELS[area]}
            </button>
          );
        })}
      </div>

      <div className="roadmap-filter-bar__controls">
        <div className="roadmap-filter-bar__search">
          <Search className="roadmap-filter-bar__search-icon" size={16} />
          <input
            type="text"
            className="roadmap-filter-bar__search-input"
            placeholder="Search features..."
            value={filters.search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="roadmap-filter-bar__select"
          value={filters.priority ?? ''}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="">All priorities</option>
          {priorities.map((p) => (
            <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
          ))}
        </select>

        <select
          className="roadmap-filter-bar__select"
          value={filters.status ?? ''}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>

        {filtersActive && (
          <button
            type="button"
            className="roadmap-filter-bar__clear"
            onClick={() => onChange(emptyFilters)}
          >
            <X size={14} />
            Clear
          </button>
        )}

        <span className="roadmap-filter-bar__count">{itemCount} items</span>
      </div>
    </div>
  );
}
