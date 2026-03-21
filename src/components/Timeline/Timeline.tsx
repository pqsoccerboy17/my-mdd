import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import type { TimelineProps } from './types';
import type { TimelineEra } from './types';
import TrailMap from './TrailMap';
import EraCard from './EraCard';
import ChapterIndex from './ChapterIndex';
import { computeProjectStats } from './changelogData';
import { getMinDay } from './utils';

function JourneyHeader({ data }: { data: TimelineEra[] }): ReactNode {
  const stats = computeProjectStats(data);
  return (
    <div className="journey-header">
      <h2 className="journey-header__title">The Journey</h2>
      <p className="journey-header__subtitle">
        From empty directory to production dashboard in {stats.totalDays} days
      </p>
      <div className="journey-header__stats">
        <div className="journey-header__stat">
          <span className="journey-header__stat-value">{stats.totalCommits}</span>
          <span className="journey-header__stat-label">Commits</span>
        </div>
        <div className="journey-header__stat">
          <span className="journey-header__stat-value">{stats.totalDays}</span>
          <span className="journey-header__stat-label">Days</span>
        </div>
        <div className="journey-header__stat">
          <span className="journey-header__stat-value">{stats.totalEras}</span>
          <span className="journey-header__stat-label">Eras</span>
        </div>
      </div>
    </div>
  );
}

function ActiveEraTracker({ data, onActiveChange }: TimelineProps & { onActiveChange: (id: string | null) => void }) {
  useEffect(() => {
    const eraElements = data.map((era) => document.getElementById(`era-${era.id}`));

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const eraId = entry.target.id.replace('era-', '');
            onActiveChange(eraId);
            break;
          }
        }
      },
      { rootMargin: '-20% 0px -60% 0px' },
    );

    eraElements.forEach((el) => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [data, onActiveChange]);

  return null;
}

export default function Timeline({ data }: TimelineProps): ReactNode {
  const [activeEraId, setActiveEraId] = useState<string | null>(data[0]?.id ?? null);

  // TrailMap needs chronological order (left=earliest, right=latest)
  const chronologicalData = useMemo(
    () => [...data].sort((a, b) => getMinDay(a) - getMinDay(b)),
    [data],
  );

  return (
    <div className="timeline-journal">
      <BrowserOnly fallback={null}>
        {() => <ActiveEraTracker data={data} onActiveChange={setActiveEraId} />}
      </BrowserOnly>

      <TrailMap eras={chronologicalData} activeEraId={activeEraId} />

      <JourneyHeader data={data} />

      <ChapterIndex eras={data} activeEraId={activeEraId} />

      <div className="era-list">
        {data.map((era, idx) => (
          <div key={era.id}>
            {idx > 0 && (
              <div className="era-connector">
                <div className="era-connector__line" />
              </div>
            )}
            <EraCard era={era} index={idx} />
          </div>
        ))}
      </div>
    </div>
  );
}
