import type { ReactNode } from 'react';
import type { ViewMode } from './types';
import { GanttChart, Network, Columns3 } from 'lucide-react';
import clsx from 'clsx';

const views: { id: ViewMode; label: string; Icon: typeof GanttChart }[] = [
  { id: 'timeline', label: 'Timeline', Icon: GanttChart },
  { id: 'graph', label: 'Graph', Icon: Network },
  { id: 'kanban', label: 'Kanban', Icon: Columns3 },
];

interface ViewSwitcherProps {
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

/** Toggle buttons to switch between timeline, graph, and kanban views. */
export default function ViewSwitcher({ activeView, onViewChange }: ViewSwitcherProps): ReactNode {
  return (
    <div className="roadmap-view-switcher">
      {views.map(({ id, label, Icon }) => {
        const isActive = id === activeView;

        return (
          <button
            key={id}
            type="button"
            className={clsx('roadmap-view-switcher__btn', isActive && 'roadmap-view-switcher__btn--active')}
            onClick={() => onViewChange(id)}
            aria-pressed={isActive}
          >
            <Icon className="roadmap-view-switcher__icon" size={18} />
            <span className="roadmap-view-switcher__label">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
