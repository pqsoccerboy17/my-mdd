import { useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { RoadmapItem, RoadmapStatus } from '../../data/roadmapData';
import type { ViewMode, RoadmapFilters } from './types';
import { roadmapItems } from '../../data/roadmapData';
import { filterItems, emptyFilters } from './helpers';
import ViewSwitcher from './ViewSwitcher';
import FilterBar from './FilterBar';
import TimelineView from './TimelineView';
import KanbanView from './KanbanView';
import DependencyGraph from './DependencyGraph';
import FeatureDetail from './FeatureDetail';

/** Root component for the interactive roadmap planner. Manages state across views. */
export default function RoadmapPlanner(): ReactNode {
  const [activeView, setActiveView] = useState<ViewMode>('timeline');
  const [filters, setFilters] = useState<RoadmapFilters>(emptyFilters);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [items, setItems] = useState<RoadmapItem[]>(roadmapItems);

  const filteredItems = filterItems(items, filters);
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
    <>
      <ViewSwitcher activeView={activeView} onViewChange={setActiveView} />
      <FilterBar
        filters={filters}
        onChange={setFilters}
        itemCount={filteredItems.length}
      />

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

      <FeatureDetail
        item={expandedItem}
        allItems={items}
        onClose={handleDetailClose}
        onStatusChange={handleStatusChange}
        onItemClick={handleItemClick}
      />
    </>
  );
}
