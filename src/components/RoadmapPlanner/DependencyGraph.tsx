import { useState, useMemo, useCallback, useRef } from 'react';
import type { ReactNode, WheelEvent as ReactWheelEvent, MouseEvent as ReactMouseEvent } from 'react';
import type { RoadmapItem, RoadmapArea } from '../../data/roadmapData';
import type { ViewProps } from './types';
import { AREA_COLORS, STATUS_COLORS } from '../../data/roadmapData';
import { getDependencies, getDependents } from './helpers';
import { RotateCcw } from 'lucide-react';
import BrowserOnly from '@docusaurus/BrowserOnly';

const NODE_WIDTH = 200;
const NODE_HEIGHT = 60;
const GAP_X = 80;
const GAP_Y = 20;
const PADDING = 40;
const STATUS_RADIUS = 4;

// ---- Layout types ----

interface NodePosition {
  item: RoadmapItem;
  x: number;
  y: number;
}

interface Edge {
  from: { x: number; y: number };
  to: { x: number; y: number };
  fromId: string;
  toId: string;
}

interface GraphLayout {
  nodes: NodePosition[];
  edges: Edge[];
  width: number;
  height: number;
  standaloneNodes: NodePosition[];
  connectedHeight: number;
}

// ---- Layout algorithm ----

function useGraphLayout(items: RoadmapItem[]): GraphLayout {
  return useMemo(() => {
    const itemMap = new Map<string, RoadmapItem>();
    for (const item of items) {
      itemMap.set(item.id, item);
    }

    // Build adjacency: only include edges where both endpoints are in the list
    const inDegree = new Map<string, number>();
    const adjList = new Map<string, string[]>();
    for (const item of items) {
      inDegree.set(item.id, 0);
      adjList.set(item.id, []);
    }
    for (const item of items) {
      if (!item.dependencies) continue;
      for (const depId of item.dependencies) {
        if (!itemMap.has(depId)) continue; // skip edges to items not in filtered list
        const existing = inDegree.get(item.id) ?? 0;
        inDegree.set(item.id, existing + 1);
        const deps = adjList.get(depId) ?? [];
        deps.push(item.id);
        adjList.set(depId, deps);
      }
    }

    // Identify standalone nodes (no deps AND no dependents within filtered list)
    const standalone: RoadmapItem[] = [];
    const connected: RoadmapItem[] = [];
    for (const item of items) {
      const hasIncoming = (inDegree.get(item.id) ?? 0) > 0;
      const hasOutgoing = (adjList.get(item.id) ?? []).length > 0;
      if (!hasIncoming && !hasOutgoing) {
        standalone.push(item);
      } else {
        connected.push(item);
      }
    }

    // Topological sort via Kahn's algorithm to assign layers
    const layers: RoadmapItem[][] = [];
    const layerMap = new Map<string, number>();
    const localInDegree = new Map<string, number>();
    for (const item of connected) {
      localInDegree.set(item.id, inDegree.get(item.id) ?? 0);
    }

    let queue = connected.filter((item) => (localInDegree.get(item.id) ?? 0) === 0);
    let layerIndex = 0;

    while (queue.length > 0) {
      // Sort within layer by area for visual grouping
      queue.sort((a, b) => a.area.localeCompare(b.area));
      layers.push(queue);
      for (const item of queue) {
        layerMap.set(item.id, layerIndex);
      }

      const nextQueue: RoadmapItem[] = [];
      for (const item of queue) {
        const neighbors = adjList.get(item.id) ?? [];
        for (const neighborId of neighbors) {
          const deg = (localInDegree.get(neighborId) ?? 1) - 1;
          localInDegree.set(neighborId, deg);
          if (deg === 0) {
            const neighbor = itemMap.get(neighborId);
            if (neighbor) nextQueue.push(neighbor);
          }
        }
      }
      queue = nextQueue;
      layerIndex++;
    }

    // Handle any remaining connected nodes (cycles -- shouldn't happen in a DAG, but be safe)
    const placed = new Set(layerMap.keys());
    const remaining = connected.filter((item) => !placed.has(item.id));
    if (remaining.length > 0) {
      layers.push(remaining);
      for (const item of remaining) {
        layerMap.set(item.id, layers.length - 1);
      }
    }

    // Compute positions for connected nodes
    const nodes: NodePosition[] = [];
    for (let li = 0; li < layers.length; li++) {
      const layer = layers[li];
      const x = PADDING + li * (NODE_WIDTH + GAP_X);
      for (let ni = 0; ni < layer.length; ni++) {
        const y = PADDING + ni * (NODE_HEIGHT + GAP_Y);
        nodes.push({ item: layer[ni], x, y });
      }
    }

    // Compute edges
    const positionMap = new Map<string, NodePosition>();
    for (const node of nodes) {
      positionMap.set(node.item.id, node);
    }

    const edges: Edge[] = [];
    for (const item of connected) {
      if (!item.dependencies) continue;
      for (const depId of item.dependencies) {
        const fromNode = positionMap.get(depId);
        const toNode = positionMap.get(item.id);
        if (!fromNode || !toNode) continue;
        edges.push({
          from: { x: fromNode.x + NODE_WIDTH, y: fromNode.y + NODE_HEIGHT / 2 },
          to: { x: toNode.x, y: toNode.y + NODE_HEIGHT / 2 },
          fromId: depId,
          toId: item.id,
        });
      }
    }

    // Compute connected area dimensions
    const maxLayerHeight = layers.reduce((max, layer) => {
      const h = layer.length * (NODE_HEIGHT + GAP_Y) - GAP_Y;
      return Math.max(max, h);
    }, 0);
    const connectedWidth = layers.length > 0
      ? layers.length * (NODE_WIDTH + GAP_X) - GAP_X + PADDING * 2
      : 0;
    const connectedHeight = maxLayerHeight + PADDING * 2;

    // Layout standalone nodes in a grid below the connected graph
    const STANDALONE_COLS = 4;
    const standaloneStartY = connectedHeight + 60;
    const standaloneNodes: NodePosition[] = standalone
      .sort((a, b) => a.area.localeCompare(b.area))
      .map((item, i) => {
        const col = i % STANDALONE_COLS;
        const row = Math.floor(i / STANDALONE_COLS);
        return {
          item,
          x: PADDING + col * (NODE_WIDTH + GAP_X),
          y: standaloneStartY + row * (NODE_HEIGHT + GAP_Y),
        };
      });

    const standaloneHeight = standalone.length > 0
      ? Math.ceil(standalone.length / STANDALONE_COLS) * (NODE_HEIGHT + GAP_Y) - GAP_Y
      : 0;
    const totalHeight = standalone.length > 0
      ? standaloneStartY + standaloneHeight + PADDING
      : connectedHeight;
    const standaloneWidth = Math.min(standalone.length, STANDALONE_COLS) * (NODE_WIDTH + GAP_X) - GAP_X + PADDING * 2;
    const totalWidth = Math.max(connectedWidth, standaloneWidth);

    return {
      nodes,
      edges,
      width: Math.max(totalWidth, 600),
      height: Math.max(totalHeight, 300),
      standaloneNodes,
      connectedHeight,
    };
  }, [items]);
}

// ---- SVG helpers ----

function truncateText(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars - 1) + '\u2026';
}

function bezierPath(from: { x: number; y: number }, to: { x: number; y: number }): string {
  const dx = to.x - from.x;
  const cpOffset = Math.min(Math.abs(dx) * 0.5, 80);
  return `M ${from.x} ${from.y} C ${from.x + cpOffset} ${from.y}, ${to.x - cpOffset} ${to.y}, ${to.x} ${to.y}`;
}

// ---- Graph Node ----

interface GraphNodeProps {
  node: NodePosition;
  dimmed: boolean;
  highlighted: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
}

function GraphNode({ node, dimmed, highlighted, onMouseEnter, onMouseLeave, onClick }: GraphNodeProps): ReactNode {
  const { item, x, y } = node;
  const fill = AREA_COLORS[item.area as RoadmapArea] ?? '#7B8FA3';
  const statusColor = STATUS_COLORS[item.status] ?? '#9ca3af';
  const opacity = dimmed ? 0.2 : 1;
  const strokeWidth = highlighted ? 2 : 0;
  const strokeColor = highlighted ? '#fff' : 'none';

  return (
    <g
      className="roadmap-graph__node"
      transform={`translate(${x}, ${y})`}
      style={{ opacity, cursor: 'pointer', transition: 'opacity 0.2s ease' }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      <rect
        width={NODE_WIDTH}
        height={NODE_HEIGHT}
        rx={8}
        ry={8}
        fill={fill}
        fillOpacity={0.85}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
      {/* Status indicator */}
      <circle
        cx={NODE_WIDTH - 12}
        cy={12}
        r={STATUS_RADIUS}
        fill={statusColor}
      />
      {/* Title text */}
      <text
        x={NODE_WIDTH / 2}
        y={NODE_HEIGHT / 2 + 1}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#fff"
        fontSize={12}
        fontFamily="Inter, system-ui, sans-serif"
        fontWeight={500}
        className="roadmap-graph__node-text"
      >
        {truncateText(item.title, 26)}
      </text>
    </g>
  );
}

// ---- Graph Edge ----

interface GraphEdgeProps {
  edge: Edge;
  dimmed: boolean;
  highlighted: boolean;
}

function GraphEdge({ edge, dimmed, highlighted }: GraphEdgeProps): ReactNode {
  const opacity = dimmed ? 0.08 : highlighted ? 0.7 : 0.35;
  const strokeWidth = highlighted ? 2 : 1.5;

  return (
    <path
      className="roadmap-graph__edge"
      d={bezierPath(edge.from, edge.to)}
      fill="none"
      stroke={highlighted ? '#fff' : '#94a3b8'}
      strokeWidth={strokeWidth}
      style={{ opacity, transition: 'opacity 0.2s ease' }}
      markerEnd="url(#arrowhead)"
    />
  );
}

// ---- Main component ----

/** Interactive SVG dependency graph showing feature relationships. */
export default function DependencyGraph({ items, onItemClick }: ViewProps): ReactNode {
  return (
    <BrowserOnly fallback={<div className="roadmap-graph__loading">Loading graph...</div>}>
      {() => <DependencyGraphInner items={items} onItemClick={onItemClick} />}
    </BrowserOnly>
  );
}

function DependencyGraphInner({ items, onItemClick }: ViewProps): ReactNode {
  const layout = useGraphLayout(items);
  const svgRef = useRef<SVGSVGElement>(null);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });

  // Determine which IDs are highlighted (hovered node + its direct deps/dependents)
  const highlightedIds = useMemo(() => {
    if (!hoveredId) return null;
    const hovered = items.find((i) => i.id === hoveredId);
    if (!hovered) return null;

    const ids = new Set<string>([hoveredId]);
    for (const dep of getDependencies(items, hovered)) {
      ids.add(dep.id);
    }
    for (const dep of getDependents(items, hovered)) {
      ids.add(dep.id);
    }
    return ids;
  }, [hoveredId, items]);

  // Highlighted edges: connected to hovered node
  const isEdgeHighlighted = useCallback(
    (edge: Edge) => {
      if (!hoveredId) return false;
      return edge.fromId === hoveredId || edge.toId === hoveredId;
    },
    [hoveredId],
  );

  const isNodeDimmed = useCallback(
    (id: string) => highlightedIds !== null && !highlightedIds.has(id),
    [highlightedIds],
  );

  const isNodeHighlighted = useCallback(
    (id: string) => highlightedIds !== null && highlightedIds.has(id),
    [highlightedIds],
  );

  const transformRef = useRef(transform);
  transformRef.current = transform;

  const handleMouseDown = useCallback(
    (e: ReactMouseEvent<SVGSVGElement>) => {
      if ((e.target as Element).closest('.roadmap-graph__node')) return;
      isPanning.current = true;
      panStart.current = { x: e.clientX - transformRef.current.x, y: e.clientY - transformRef.current.y };
    },
    [],
  );

  const handleMouseMove = useCallback(
    (e: ReactMouseEvent<SVGSVGElement>) => {
      if (!isPanning.current) return;
      setTransform((prev) => ({
        ...prev,
        x: e.clientX - panStart.current.x,
        y: e.clientY - panStart.current.y,
      }));
    },
    [],
  );

  const handleMouseUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  // Zoom handler
  const handleWheel = useCallback((e: ReactWheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform((prev) => {
      const newScale = Math.min(2.0, Math.max(0.3, prev.scale * delta));
      return { ...prev, scale: newScale };
    });
  }, []);

  const resetView = useCallback(() => {
    setTransform({ x: 0, y: 0, scale: 1 });
  }, []);

  if (items.length === 0) {
    return (
      <div className="roadmap-graph__empty">
        No items match the current filters.
      </div>
    );
  }

  return (
    <div className="roadmap-graph">
      <div className="roadmap-graph__toolbar">
        <button
          type="button"
          className="roadmap-graph__reset-btn"
          onClick={resetView}
          title="Reset view"
        >
          <RotateCcw size={14} />
          <span>Reset</span>
        </button>
        <span className="roadmap-graph__stats">
          {layout.nodes.length} connected &middot; {layout.standaloneNodes.length} independent &middot; {layout.edges.length} dependencies
        </span>
      </div>

      <svg
        ref={svgRef}
        className="roadmap-graph__svg"
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        preserveAspectRatio="xMinYMin meet"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ cursor: isPanning.current ? 'grabbing' : 'grab' }}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="8"
            markerHeight="6"
            refX="8"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill="#94a3b8" fillOpacity="0.6" />
          </marker>
        </defs>

        <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
          {/* Edges */}
          {layout.edges.map((edge) => (
            <GraphEdge
              key={`${edge.fromId}-${edge.toId}`}
              edge={edge}
              dimmed={hoveredId !== null && !isEdgeHighlighted(edge)}
              highlighted={isEdgeHighlighted(edge)}
            />
          ))}

          {/* Connected nodes */}
          {layout.nodes.map((node) => (
            <GraphNode
              key={node.item.id}
              node={node}
              dimmed={isNodeDimmed(node.item.id)}
              highlighted={isNodeHighlighted(node.item.id)}
              onMouseEnter={() => setHoveredId(node.item.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => onItemClick(node.item.id)}
            />
          ))}

          {/* Standalone section label */}
          {layout.standaloneNodes.length > 0 && (
            <text
              x={PADDING}
              y={layout.connectedHeight + 40}
              fill="#94a3b8"
              fontSize={13}
              fontFamily="Inter, system-ui, sans-serif"
              fontWeight={600}
              letterSpacing="0.05em"
            >
              Independent Features
            </text>
          )}

          {/* Standalone nodes */}
          {layout.standaloneNodes.map((node) => (
            <GraphNode
              key={node.item.id}
              node={node}
              dimmed={isNodeDimmed(node.item.id)}
              highlighted={isNodeHighlighted(node.item.id)}
              onMouseEnter={() => setHoveredId(node.item.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => onItemClick(node.item.id)}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
