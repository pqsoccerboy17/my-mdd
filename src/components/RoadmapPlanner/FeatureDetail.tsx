import type { ReactNode } from 'react';
import type { RoadmapItem, RoadmapStatus } from '../../data/roadmapData';
import { X, ExternalLink, GitBranch } from 'lucide-react';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AREA_COLORS,
  AREA_LABELS,
  STATUS_LABELS,
  PRIORITY_LABELS,
  EFFORT_LABELS,
  PHASE_LABELS,
} from '../../data/roadmapData';
import { getDependencies, getDependents } from './helpers';

const statuses: RoadmapStatus[] = ['backlog', 'planned', 'in-progress', 'shipped'];

interface FeatureDetailProps {
  item: RoadmapItem | null;
  allItems: RoadmapItem[];
  onClose: () => void;
  onStatusChange: (id: string, status: RoadmapStatus) => void;
  onItemClick: (id: string) => void;
}

/** Slide-over panel showing full feature details with status toggle and dependency links. */
export default function FeatureDetail({
  item,
  allItems,
  onClose,
  onStatusChange,
  onItemClick,
}: FeatureDetailProps): ReactNode {
  const dependencies = item ? getDependencies(allItems, item) : [];
  const dependents = item ? getDependents(allItems, item) : [];

  return (
    <AnimatePresence>
      {item && (
        <>
          <motion.div
            className="roadmap-feature-detail__backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            role="presentation"
          />

          <motion.aside
            className="roadmap-feature-detail"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{ scrollBehavior: 'smooth' }}
          >
            <div className="roadmap-feature-detail__header">
              <h2 className="roadmap-feature-detail__title">{item.title}</h2>
              <button
                type="button"
                className="roadmap-feature-detail__close"
                onClick={onClose}
                aria-label="Close detail panel"
              >
                <X size={20} />
              </button>
            </div>

            <div className="roadmap-feature-detail__status-group">
              {statuses.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={clsx(
                    'roadmap-feature-detail__status-btn',
                    item.status === s && 'roadmap-feature-detail__status-btn--active',
                  )}
                  onClick={() => onStatusChange(item.id, s)}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>

            <div className="roadmap-feature-detail__meta">
              <div className="roadmap-feature-detail__area">
                <span
                  className="roadmap-feature-detail__area-dot"
                  style={{ backgroundColor: AREA_COLORS[item.area] }}
                />
                {AREA_LABELS[item.area]}
              </div>

              {item.priority && (
                <span className="roadmap-feature-detail__badge">
                  {PRIORITY_LABELS[item.priority]}
                </span>
              )}

              {item.effort && (
                <span className="roadmap-feature-detail__badge">
                  {EFFORT_LABELS[item.effort]}
                </span>
              )}

              {item.phase && (
                <span className="roadmap-feature-detail__badge">
                  {PHASE_LABELS[item.phase]}
                </span>
              )}
            </div>

            {item.description && (
              <p className="roadmap-feature-detail__description">{item.description}</p>
            )}

            <hr className="roadmap-feature-detail__divider" />

            {dependencies.length > 0 && (
              <div className="roadmap-feature-detail__section">
                <h3 className="roadmap-feature-detail__section-title">
                  <GitBranch size={14} /> Dependencies
                </h3>
                <ul className="roadmap-feature-detail__dep-list">
                  {dependencies.map((dep) => (
                    <li key={dep.id}>
                      <button
                        type="button"
                        className="roadmap-feature-detail__dep-link"
                        onClick={() => onItemClick(dep.id)}
                      >
                        <span
                          className="roadmap-feature-detail__dep-dot"
                          style={{ backgroundColor: AREA_COLORS[dep.area] }}
                        />
                        {dep.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {dependents.length > 0 && (
              <div className="roadmap-feature-detail__section">
                <h3 className="roadmap-feature-detail__section-title">
                  <GitBranch size={14} /> Dependents
                </h3>
                <ul className="roadmap-feature-detail__dep-list">
                  {dependents.map((dep) => (
                    <li key={dep.id}>
                      <button
                        type="button"
                        className="roadmap-feature-detail__dep-link"
                        onClick={() => onItemClick(dep.id)}
                      >
                        <span
                          className="roadmap-feature-detail__dep-dot"
                          style={{ backgroundColor: AREA_COLORS[dep.area] }}
                        />
                        {dep.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {item.specFile && (
              <div className="roadmap-feature-detail__section">
                <a
                  className="roadmap-feature-detail__spec-link"
                  href={item.specFile}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink size={14} />
                  View Spec
                </a>
              </div>
            )}

            <hr className="roadmap-feature-detail__divider" />

            {item.tags && item.tags.length > 0 && (
              <div className="roadmap-feature-detail__tags">
                {item.tags.map((tag) => (
                  <span key={tag} className="roadmap-feature-detail__tag">{tag}</span>
                ))}
              </div>
            )}

            {(item.batch != null || item.gapRef) && (
              <div className="roadmap-feature-detail__refs">
                {item.batch != null && (
                  <span className="roadmap-feature-detail__ref">Batch {item.batch}</span>
                )}
                {item.gapRef && (
                  <span className="roadmap-feature-detail__ref">Gap {item.gapRef}</span>
                )}
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
