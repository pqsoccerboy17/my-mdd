import Link from '@docusaurus/Link';
import { Rocket } from 'lucide-react';

/** Featured getting-started callout with distinct visual treatment from card grids. */
export default function QuickStart() {
  return (
    <Link to="/guides/getting-started" className="quick-start">
      <span className="quick-start__icon">
        <Rocket size={24} />
      </span>
      <div className="quick-start__content">
        <h3 className="quick-start__title">New to MDD?</h3>
        <p className="quick-start__description">
          Get up and running in minutes -- prerequisites, install, first steps, and what to explore.
        </p>
      </div>
      <span className="quick-start__arrow">&rarr;</span>
    </Link>
  );
}
