import Link from '@docusaurus/Link';
import { stats } from '../data/stats';

interface StatItem {
  count: number;
  label: string;
  href: string;
}

const items: StatItem[] = [
  { count: stats.features, label: 'Features', href: '/features/task-manager' },
  { count: stats.integrations, label: 'Integrations', href: '/integrations/supabase' },
  { count: stats.apiEndpoints, label: 'API Endpoints', href: '/api/overview' },
  { count: stats.tests, label: 'Tests', href: '/guides/testing' },
];

/** Clickable pill badges showing MDD inventory counts, displayed below the hero on the landing page. */
export default function StatsBar() {
  return (
    <div className="stats-bar">
      {items.map(({ count, label, href }) => (
        <Link key={label} to={href} className="stats-pill">
          <span className="stats-pill__count">{count}</span> {label}
        </Link>
      ))}
    </div>
  );
}
