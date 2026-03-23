import { useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SectionTabs from './SectionTabs';
import type { Section } from './SectionTabs';
import RoadmapPlanner from '../RoadmapPlanner';
import Timeline from '../Timeline';
import type { TimelineEra } from '../Timeline/types';
import { eras as historicalEras } from '../Timeline/changelogData';
import syncData from '../../data/changelog-sync.json';

export default function RoadmapHub(): ReactNode {
  const [section, setSection] = useState<Section>('planner');

  const allEras = useMemo(
    () =>
      [...historicalEras, ...((syncData.eras || []) as TimelineEra[])].reverse(),
    [],
  );

  return (
    <div>
      <SectionTabs active={section} onChange={setSection} />

      <AnimatePresence mode="wait">
        <motion.div
          key={section}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {section === 'planner' && <RoadmapPlanner />}
          {section === 'changelog' && (
            <div>
              <p style={{ opacity: 0.7, marginBottom: '1.5rem' }}>
                MDD HQ has been built from scratch starting February 22, 2026.
                This is the full story -- from an empty directory to a production
                dashboard and beyond, updated daily.
              </p>
              <Timeline data={allEras} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
