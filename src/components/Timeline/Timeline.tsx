import { useRef } from 'react';
import type { ReactNode } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import type { TimelineProps } from './types';

export default function Timeline({ data }: TimelineProps): ReactNode {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="timeline" ref={containerRef}>
      {/* Scroll-animated progress line -- client only */}
      <div className="timeline__line-container">
        <BrowserOnly fallback={<div className="timeline__static-track" />}>
          {() => {
            const TimelineProgress =
              require('./TimelineProgress').default;
            return <TimelineProgress containerRef={containerRef} />;
          }}
        </BrowserOnly>
      </div>

      {data.map((entry, idx) => (
        <div className="timeline__entry" key={idx}>
          <div className="timeline__dot-col">
            <div className="timeline__dot" />
          </div>
          <div className="timeline__title-col">
            <h3 className="timeline__title">{entry.title}</h3>
            {entry.subtitle && (
              <p className="timeline__subtitle">{entry.subtitle}</p>
            )}
          </div>
          <div className="timeline__content">{entry.content}</div>
        </div>
      ))}
    </div>
  );
}
