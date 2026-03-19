import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';

interface CardProps {
  icon: ReactNode;
  title: string;
  description: string;
  href: string;
  badge?: string;
}

/** Reusable documentation card for the landing page grid. Renders an icon, title, and description as a styled link. Supports an optional badge (e.g. "NEW") in the top-right corner. */
export default function Card({icon, title, description, href, badge}: CardProps): ReactNode {
  return (
    <Link to={href} className="doc-card">
      {badge && <span className="doc-card__badge">{badge}</span>}
      <span className="doc-card__icon">{icon}</span>
      <h3 className="doc-card__title">{title}</h3>
      <p className="doc-card__description">{description}</p>
    </Link>
  );
}
