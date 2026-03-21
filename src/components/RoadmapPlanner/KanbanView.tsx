import { useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { ViewProps } from './types';
import type { RoadmapItem, RoadmapStatus } from '../../data/roadmapData';
import clsx from 'clsx';
import BrowserOnly from '@docusaurus/BrowserOnly';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { STATUS_LABELS } from '../../data/roadmapData';
import { groupByStatus, sortByPriority } from './helpers';
import FeatureCard from './FeatureCard';

const KANBAN_COLUMNS: RoadmapStatus[] = ['backlog', 'planned', 'in-progress', 'shipped'];

// ---------------------------------------------------------------------------
// SortableCard -- wraps FeatureCard with @dnd-kit sortable behavior
// ---------------------------------------------------------------------------

interface SortableCardProps {
  item: RoadmapItem;
  onItemClick: (id: string) => void;
}

function SortableCard({ item, onItemClick }: SortableCardProps): ReactNode {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        'roadmap-kanban__sortable-card',
        isDragging && 'roadmap-kanban__sortable-card--dragging',
      )}
      {...attributes}
      {...listeners}
    >
      <FeatureCard item={item} onClick={onItemClick} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// KanbanBoard -- the interactive drag-and-drop board
// ---------------------------------------------------------------------------

interface KanbanBoardProps extends ViewProps {
  onStatusChange: (id: string, status: RoadmapStatus) => void;
}

function KanbanBoard({ items, onItemClick, onStatusChange }: KanbanBoardProps): ReactNode {
  const [activeItem, setActiveItem] = useState<RoadmapItem | null>(null);
  const statusGroups = groupByStatus(items);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const found = items.find((i) => i.id === event.active.id);
      setActiveItem(found ?? null);
    },
    [items],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveItem(null);

      const { active, over } = event;
      if (!over) return;

      const overId = String(over.id);

      // Determine the target status: either the column id itself, or the
      // column that the target card belongs to.
      let targetStatus: RoadmapStatus | undefined;

      if (KANBAN_COLUMNS.includes(overId as RoadmapStatus)) {
        targetStatus = overId as RoadmapStatus;
      } else {
        // Dropped over another card -- find which column it belongs to
        for (const status of KANBAN_COLUMNS) {
          if (statusGroups[status].some((i) => i.id === overId)) {
            targetStatus = status;
            break;
          }
        }
      }

      if (!targetStatus) return;

      const sourceItem = items.find((i) => i.id === active.id);
      if (!sourceItem || sourceItem.status === targetStatus) return;

      onStatusChange(String(active.id), targetStatus);
    },
    [items, statusGroups, onStatusChange],
  );

  return (
    <DndContext
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="roadmap-kanban">
        {KANBAN_COLUMNS.map((status) => {
          const columnItems = sortByPriority(statusGroups[status]);
          const ids = columnItems.map((i) => i.id);

          return (
            <div
              key={status}
              className={clsx(
                'roadmap-kanban__column',
                `roadmap-kanban__column--${status}`,
              )}
            >
              <div className="roadmap-kanban__column-header">
                <h3 className="roadmap-kanban__status-label">
                  {STATUS_LABELS[status]}
                </h3>
                <span className="roadmap-kanban__status-count">
                  {columnItems.length}
                </span>
              </div>

              <SortableContext
                id={status}
                items={ids}
                strategy={verticalListSortingStrategy}
              >
                <div className="roadmap-kanban__column-body">
                  {columnItems.map((item) => (
                    <SortableCard
                      key={item.id}
                      item={item}
                      onItemClick={onItemClick}
                    />
                  ))}

                  {columnItems.length === 0 && (
                    <p className="roadmap-kanban__empty">No items</p>
                  )}
                </div>
              </SortableContext>
            </div>
          );
        })}
      </div>

      <DragOverlay>
        {activeItem ? (
          <div className="roadmap-kanban__drag-overlay">
            <FeatureCard item={activeItem} onClick={onItemClick} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

// ---------------------------------------------------------------------------
// KanbanFallback -- static rendering without drag-and-drop (SSR-safe)
// ---------------------------------------------------------------------------

function KanbanFallback({ items, onItemClick }: ViewProps): ReactNode {
  const statusGroups = groupByStatus(items);

  return (
    <div className="roadmap-kanban">
      {KANBAN_COLUMNS.map((status) => {
        const columnItems = sortByPriority(statusGroups[status]);

        return (
          <div
            key={status}
            className={clsx(
              'roadmap-kanban__column',
              `roadmap-kanban__column--${status}`,
            )}
          >
            <div className="roadmap-kanban__column-header">
              <h3 className="roadmap-kanban__status-label">
                {STATUS_LABELS[status]}
              </h3>
              <span className="roadmap-kanban__status-count">
                {columnItems.length}
              </span>
            </div>

            <div className="roadmap-kanban__column-body">
              {columnItems.map((item) => (
                <div key={item.id} className="roadmap-kanban__sortable-card">
                  <FeatureCard
                    item={item}
                    onClick={onItemClick}
                  />
                </div>
              ))}

              {columnItems.length === 0 && (
                <p className="roadmap-kanban__empty">No items</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// KanbanView -- BrowserOnly wrapper (exported default)
// ---------------------------------------------------------------------------

interface KanbanViewProps extends ViewProps {
  onStatusChange: (id: string, status: RoadmapStatus) => void;
}

/** Four-column kanban board with drag-and-drop status changes via @dnd-kit. */
export default function KanbanView({ items, onItemClick, onStatusChange }: KanbanViewProps): ReactNode {
  return (
    <BrowserOnly fallback={<KanbanFallback items={items} onItemClick={onItemClick} />}>
      {() => (
        <KanbanBoard
          items={items}
          onItemClick={onItemClick}
          onStatusChange={onStatusChange}
        />
      )}
    </BrowserOnly>
  );
}
