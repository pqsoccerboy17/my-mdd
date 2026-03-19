import { useEffect, useState, useId } from 'react';
import type { TimelineEra } from './types';
import clsx from 'clsx';
import BrowserOnly from '@docusaurus/BrowserOnly';

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

  const scrollToEra = (eraId: string) => {
    const el = document.getElementById(`era-${eraId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="trail-map">
      <div className="trail-map__header">
        <span className="trail-map__label">Day 1</span>
        <span className="trail-map__label">Day 26</span>
      </div>
      <div className="trail-map__track-container">
        <div className="trail-map__track" />
        <div
          className="trail-map__progress"
          style={{ width: `${scrollProgress}%` }}
        />
        <div className="trail-map__waypoints">
          {eras.map((era) => (
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
