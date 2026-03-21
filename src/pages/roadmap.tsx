import { useMemo } from 'react';
import type { ReactNode } from 'react';
import Layout from '@theme/Layout';
import { roadmapItems } from '../data/roadmapData';
import RoadmapPlanner from '../components/RoadmapPlanner';
import '../css/roadmap.css';

const STATUS_DOT_COLORS: Record<string, string> = {
  shipped: '#5A8F6B',
  'in-progress': '#D4A853',
  planned: '#2E7D9E',
  backlog: '#7B8FA3',
};

export default function RoadmapPage(): ReactNode {
  const stats = useMemo(() => {
    const counts = { shipped: 0, 'in-progress': 0, planned: 0, backlog: 0 };
    for (const item of roadmapItems) {
      counts[item.status]++;
    }
    return counts;
  }, []);

  return (
    <Layout title="Visual Roadmap" description="Interactive roadmap planner for MDD HQ">
      <main className="roadmap-page">
        <header className="roadmap-page__header">
          <h1 className="roadmap-page__title">Visual Roadmap</h1>
          <p className="roadmap-page__subtitle">
            Architecture map and feature planner for MDD HQ
          </p>
          <div className="roadmap-page__stats">
            {Object.entries(stats).map(([status, count]) => (
              <div key={status} className="roadmap-page__stat">
                <span
                  className="roadmap-page__stat-dot"
                  style={{ backgroundColor: STATUS_DOT_COLORS[status] }}
                />
                <span className="roadmap-page__stat-count">{count}</span>
                <span className="roadmap-page__stat-label">
                  {status === 'in-progress' ? 'Active' : status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </header>
        <RoadmapPlanner />
      </main>
    </Layout>
  );
}
