import type { ReactNode } from 'react';

interface Stat {
  value: string;
  label: string;
}

const metrics: Stat[] = [
  { value: '55K+', label: 'Lines of Code' },
  { value: '1,831', label: 'Tests' },
  { value: '144', label: 'Components' },
  { value: '42', label: 'Custom Hooks' },
  { value: '9', label: 'API Endpoints' },
  { value: '12', label: 'Dev Days' },
  { value: '341', label: 'Commits' },
  { value: '100', label: 'Quality Score' },
];

/** Clean stat grid showcasing MDD HQ's development metrics. Factual, understated. */
export default function ProjectStats(): ReactNode {
  return (
    <div className="project-stats">
      {metrics.map(({ value, label }) => (
        <div key={label} className="project-stats__item">
          <span className="project-stats__value">{value}</span>
          <span className="project-stats__label">{label}</span>
        </div>
      ))}
    </div>
  );
}
