import type { ReactNode } from 'react';
import Layout from '@theme/Layout';
import RoadmapPlanner from '../components/RoadmapPlanner';
import '../css/roadmap.css';

export default function RoadmapPage(): ReactNode {
  return (
    <Layout title="Visual Roadmap" description="Interactive roadmap planner for MDD HQ">
      <main className="roadmap-page">
        <header className="roadmap-page__header">
          <h1 className="roadmap-page__title">Visual Roadmap</h1>
          <p className="roadmap-page__subtitle">
            Architecture map and feature planner for MDD HQ. Switch views to explore
            the codebase timeline, feature dependencies, and development priorities.
          </p>
        </header>
        <RoadmapPlanner />
      </main>
    </Layout>
  );
}
