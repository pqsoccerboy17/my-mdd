import type { ReactNode } from 'react';
import type { ViewProps } from './types';
import type { RoadmapArea, RoadmapPhase } from '../../data/roadmapData';
import clsx from 'clsx';
import { PHASE_LABELS, AREA_LABELS, AREA_COLORS } from '../../data/roadmapData';
import { groupByPhase, groupByArea, sortByPriority } from './helpers';
import FeatureCard from './FeatureCard';

/** Width units for effort sizes. S=1, M=2, L=3, XL=4. */
const EFFORT_UNITS: Record<string, number> = {
  S: 1,
  M: 2,
  L: 3,
  XL: 4,
};

const PHASE_COLUMNS: (RoadmapPhase | 'unphased')[] = ['now', 'next', 'later', 'unphased'];

const PHASE_HEADER_LABELS: Record<RoadmapPhase | 'unphased', string> = {
  ...PHASE_LABELS,
  unphased: 'Unphased',
};

/** Horizontal timeline view with phase columns (Now / Next / Later / Unphased), grouped by area. */
export default function TimelineView({ items, onItemClick }: ViewProps): ReactNode {
  const phaseGroups = groupByPhase(items);

  return (
    <div className="roadmap-timeline">
      {PHASE_COLUMNS.map((phase) => {
        const phaseItems = phaseGroups[phase];
        if (phaseItems.length === 0 && phase === 'unphased') return null;

        const areaGroups = groupByArea(phaseItems);
        const areaKeys = Object.keys(areaGroups) as RoadmapArea[];

        return (
          <div
            key={phase}
            className={clsx(
              'roadmap-timeline__column',
              `roadmap-timeline__column--${phase}`,
            )}
          >
            <div className="roadmap-timeline__column-header">
              <h3 className="roadmap-timeline__phase-label">
                {PHASE_HEADER_LABELS[phase]}
              </h3>
              <span className="roadmap-timeline__phase-count">
                {phaseItems.length}
              </span>
            </div>

            <div className="roadmap-timeline__column-body">
              {areaKeys.map((area) => {
                const sorted = sortByPriority(areaGroups[area]);

                return (
                  <div key={area} className="roadmap-timeline__area-group">
                    <div className="roadmap-timeline__area-header">
                      <span
                        className="roadmap-timeline__area-dot"
                        style={{ backgroundColor: AREA_COLORS[area] }}
                      />
                      <span className="roadmap-timeline__area-label">
                        {AREA_LABELS[area]}
                      </span>
                    </div>

                    <div className="roadmap-timeline__area-items">
                      {sorted.map((item) => {
                        const units = item.effort
                          ? EFFORT_UNITS[item.effort] ?? 1
                          : 1;

                        return (
                          <div
                            key={item.id}
                            className="roadmap-timeline__bar-wrapper"
                            style={{ flex: `${units} 0 0%` }}
                          >
                            <FeatureCard
                              item={item}
                              onClick={onItemClick}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {phaseItems.length === 0 && (
                <p className="roadmap-timeline__empty">No items in this phase.</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
