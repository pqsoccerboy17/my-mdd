import type { ReactNode, CSSProperties } from 'react';
import type { RoadmapItem, RoadmapStatus, RoadmapPriority } from '../../data/roadmapData';
import { GitBranch } from 'lucide-react';
import clsx from 'clsx';
import { AREA_COLORS } from '../../data/roadmapData';

const STATUS_CLASS: Record<RoadmapStatus, string> = {
  shipped: 'roadmap-feature-card__badge--shipped',
  'in-progress': 'roadmap-feature-card__badge--in-progress',
  planned: 'roadmap-feature-card__badge--planned',
  backlog: 'roadmap-feature-card__badge--backlog',
};

const PRIORITY_CLASS: Record<RoadmapPriority, string> = {
  critical: 'roadmap-feature-card__badge--critical',
  high: 'roadmap-feature-card__badge--high',
  medium: 'roadmap-feature-card__badge--medium',
  low: 'roadmap-feature-card__badge--low',
};

interface FeatureCardProps {
  item: RoadmapItem;
  onClick: (id: string) => void;
  style?: CSSProperties;
}

/** Compact feature card with area accent border, status/priority badges, and effort tag. */
export default function FeatureCard({ item, onClick, style }: FeatureCardProps): ReactNode {
  const depCount = item.dependencies?.length ?? 0;

  return (
    <button
      type="button"
      className="roadmap-feature-card"
      style={{ borderLeftColor: AREA_COLORS[item.area], ...style }}
      onClick={() => onClick(item.id)}
    >
      <div className="roadmap-feature-card__header">
        <span className="roadmap-feature-card__title">{item.title}</span>
        <span className={clsx('roadmap-feature-card__badge', STATUS_CLASS[item.status])}>
          {item.status}
        </span>
      </div>

      {item.description && (
        <p className="roadmap-feature-card__description">{item.description}</p>
      )}

      <div className="roadmap-feature-card__footer">
        {item.priority && (
          <span className={clsx('roadmap-feature-card__badge', PRIORITY_CLASS[item.priority])}>
            {item.priority}
          </span>
        )}

        {item.effort && (
          <span className="roadmap-feature-card__effort">{item.effort}</span>
        )}

        {depCount > 0 && (
          <span className="roadmap-feature-card__deps">
            <GitBranch size={12} />
            {depCount}
          </span>
        )}
      </div>
    </button>
  );
}
