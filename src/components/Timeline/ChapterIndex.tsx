import { useState } from 'react';
import type { ReactNode } from 'react';
import clsx from 'clsx';
import BrowserOnly from '@docusaurus/BrowserOnly';
import type { TimelineEra } from './types';
import { getDominantCategory, CATEGORY_COLORS } from './utils';

interface ChapterIndexProps {
  eras: TimelineEra[];
  activeEraId: string | null;
}

function ChapterIndexInner({ eras, activeEraId }: ChapterIndexProps): ReactNode {
  const [collapsed, setCollapsed] = useState(false);

  const scrollToEra = (eraId: string) => {
    const el = document.getElementById(`era-${eraId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className={clsx('chapter-index', collapsed && 'chapter-index--collapsed')}>
      <button
        className="chapter-index__header"
        onClick={() => setCollapsed((prev) => !prev)}
        aria-expanded={!collapsed}
      >
        <span className="chapter-index__heading">Chapters</span>
        <span className="chapter-index__count">{eras.length}</span>
        <span className={clsx('chapter-index__chevron', !collapsed && 'chapter-index__chevron--open')}>
          &#9662;
        </span>
      </button>

      {!collapsed && (
        <div className="chapter-index__list" role="list">
          {eras.map((era) => {
            const dominant = getDominantCategory(era);
            const accentColor = CATEGORY_COLORS[dominant];
            const isActive = activeEraId === era.id;

            return (
              <button
                key={era.id}
                className={clsx('chapter-index__item', isActive && 'chapter-index__item--active')}
                style={{ '--chapter-accent': accentColor } as React.CSSProperties}
                onClick={() => scrollToEra(era.id)}
                role="listitem"
              >
                <span className="chapter-index__dot" />
                <span className="chapter-index__title">{era.title}</span>
                <span className="chapter-index__meta">
                  <span className="chapter-index__days">{era.stats.dayRange}</span>
                  <span className="chapter-index__commits">{era.stats.commits}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Collapsible table of contents for changelog eras. */
export default function ChapterIndex(props: ChapterIndexProps): ReactNode {
  return (
    <BrowserOnly fallback={null}>
      {() => <ChapterIndexInner {...props} />}
    </BrowserOnly>
  );
}
