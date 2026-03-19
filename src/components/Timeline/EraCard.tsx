import React from 'react';
import type { ReactNode } from 'react';
import clsx from 'clsx';
import type { TimelineEra, ChangeCategory } from './types';

interface EraCardProps {
  era: TimelineEra;
  index: number;
}

/** Determines the dominant category for the era's left border accent */
function getDominantCategory(era: TimelineEra): ChangeCategory {
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

export default function EraCard({ era, index }: EraCardProps): ReactNode {
  const dominant = getDominantCategory(era);

  return (
    <div
      id={`era-${era.id}`}
      className={clsx('era-card', `era-card--${dominant}`)}
      style={{ '--era-index': index } as React.CSSProperties}
    >
      <div className="era-card__header">
        <h3 className="era-card__title">{era.title}</h3>
        <span className="era-card__subtitle">{era.subtitle}</span>
        <span className="era-card__day-badge">{era.stats.dayRange}</span>
      </div>

      <div className="era-card__stats">
        <span className="era-card__stat">
          <span className="era-card__stat-value">{era.stats.commits}</span> commits
        </span>
        <span className="era-card__stat">
          <span className="era-card__stat-value">{era.stats.highlights}</span> highlights
        </span>
        <span className="era-card__stat">{era.stats.dateRange}</span>
      </div>

      <p className="era-card__description">{era.description}</p>

      <ul className="era-card__changes">
        {era.changes.map((change, i) => (
          <li
            key={i}
            className={clsx(
              'era-card__change',
              change.notable && 'era-card__change--notable',
            )}
          >
            <span className={`era-card__dot era-card__dot--${change.category}`} />
            {change.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
