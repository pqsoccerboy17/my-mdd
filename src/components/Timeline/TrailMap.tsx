import { useEffect, useState } from 'react';
import type { TimelineEra } from './types';
import clsx from 'clsx';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { getMaxDay, scrollToEra } from './utils';

interface TrailMapProps {
  eras: TimelineEra[];
  activeEraId: string | null;
}

function TrailMapInner({ eras, activeEraId }: TrailMapProps) {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const normalizedEras = eras.map((era, idx) => ({
    ...era,
    trailPosition: era.trailPosition > 0
      ? era.trailPosition
      : Math.round(((idx + 1) / eras.length) * 100),
  }));

  const lastEra = normalizedEras[normalizedEras.length - 1];
  const lastDay = lastEra ? getMaxDay(lastEra) || 26 : 26;

  return (
    <div className="trail-map">
      <div className="trail-map__header">
        <span className="trail-map__label">Day 1</span>
        <span className="trail-map__label">Day {lastDay}</span>
      </div>
      <div className="trail-map__track-container">
        <div className="trail-map__track" />
        <div
          className="trail-map__progress"
          style={{ width: `${scrollProgress}%` }}
        />
        <div className="trail-map__waypoints">
          {normalizedEras.map((era) => (
            <div
              key={era.id}
              className={clsx(
                'trail-map__waypoint',
                activeEraId === era.id && 'trail-map__waypoint--active',
              )}
              style={{ left: `${era.trailPosition}%` }}
              onClick={() => scrollToEra(era.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') scrollToEra(era.id); }}
            >
              <div className="trail-map__waypoint-dot" />
              <span className="trail-map__waypoint-label">{era.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TrailMap(props: TrailMapProps) {
  return (
    <BrowserOnly fallback={<div style={{ height: 60 }} />}>
      {() => <TrailMapInner {...props} />}
    </BrowserOnly>
  );
}
