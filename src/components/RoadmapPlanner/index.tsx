import { useState, useCallback, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { RoadmapItem, RoadmapStatus } from '../../data/roadmapData';
import type { ViewMode, RoadmapFilters } from './types';
import { roadmapItems, STATUS_COLORS, STATUS_LABELS } from '../../data/roadmapData';
import { filterItems, emptyFilters } from './helpers';
import ViewSwitcher from './ViewSwitcher';
import FilterBar from './FilterBar';
import TimelineView from './TimelineView';
import KanbanView from './KanbanView';
import DependencyGraph from './DependencyGraph';
import FeatureDetail from './FeatureDetail';
import '../../css/roadmap.css';

export default function RoadmapPlanner(): ReactNode {
  const [activeView, setActiveView] = useState<ViewMode>('timeline');
  const [filters, setFilters] = useState<RoadmapFilters>(emptyFilters);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [items, setItems] = useState<RoadmapItem[]>(roadmapItems);

  const stats = useMemo(() => {
    const counts: Record<RoadmapStatus, number> = { shipped: 0, 'in-progress': 0, planned: 0, backlog: 0 };
    for (const item of items) {
      counts[item.status]++;
    }
    return counts;
  }, [items]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpandedItemId(null);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  const filteredItems = useMemo(() => filterItems(items, filters), [items, filters]);
  const expandedItem = expandedItemId
    ? items.find((i) => i.id === expandedItemId) ?? null
    : null;

  const handleItemClick = useCallback((id: string) => {
    setExpandedItemId(id);
  }, []);

  const handleStatusChange = useCallback((id: string, status: RoadmapStatus) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item)),
    );
  }, []);

  const handleDetailClose = useCallback(() => {
    setExpandedItemId(null);
  }, []);

  return (
    <div className="roadmap-planner-wrapper">
      <div className="roadmap-planner__stats">
        {Object.entries(stats).map(([status, count]) => (
          <div key={status} className="roadmap-planner__stat">
            <span
              className="roadmap-planner__stat-dot"
              style={{ backgroundColor: STATUS_COLORS[status as RoadmapStatus] }}
            />
            <span className="roadmap-planner__stat-count">{count}</span>
            <span className="roadmap-planner__stat-label">
              {STATUS_LABELS[status as RoadmapStatus]}
            </span>
          </div>
        ))}
      </div>

      <ViewSwitcher activeView={activeView} onViewChange={setActiveView} />
      <FilterBar
        filters={filters}
        onChange={setFilters}
        itemCount={filteredItems.length}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {activeView === 'timeline' && (
            <TimelineView items={filteredItems} onItemClick={handleItemClick} />
          )}
          {activeView === 'kanban' && (
            <KanbanView
              items={filteredItems}
              onItemClick={handleItemClick}
              onStatusChange={handleStatusChange}
            />
          )}
          {activeView === 'graph' && (
            <DependencyGraph items={filteredItems} onItemClick={handleItemClick} />
          )}
        </motion.div>
      </AnimatePresence>

      <FeatureDetail
        item={expandedItem}
        allItems={items}
        onClose={handleDetailClose}
        onStatusChange={handleStatusChange}
        onItemClick={handleItemClick}
      />
    </div>
  );
}
