export type {
  RoadmapItem,
  RoadmapStatus,
  RoadmapPhase,
  RoadmapPriority,
  RoadmapArea,
} from '../../data/roadmapData';

export type ViewMode = 'timeline' | 'graph' | 'kanban';

export interface RoadmapFilters {
  areas: import('../../data/roadmapData').RoadmapArea[];
  search: string;
  priority: import('../../data/roadmapData').RoadmapPriority | null;
  status: import('../../data/roadmapData').RoadmapStatus | null;
}

export interface ViewProps {
  items: import('../../data/roadmapData').RoadmapItem[];
  onItemClick: (id: string) => void;
}
